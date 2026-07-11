import json
import re
import traceback
from typing import Optional

import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import literal_column
from sqlalchemy.types import Float

from database.db import SessionLocal
from models.complaint import Complaint
from models.legal_sections import LegalSection
from models.landmarks import Landmark
from models.legal_section_mappings import LegalSectionMapping
from app.core.embeddings import embed_query

router = APIRouter(prefix="/api/complaints", tags=["legal-section-intelligence"])

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2:3b"

NEW_ACTS = {"BNS", "BNSS", "BSA"}
OLD_ACTS = {"IPC", "CrPC", "IEA"}


class AnalyzeRequest(BaseModel):
    case_summary: Optional[str] = None


# ---------- vector helpers ----------
# models/_types.py's Vector is a plain UserDefinedType (no cosine_distance()
# comparator like pgvector.sqlalchemy.Vector provides), so distance queries
# are built as raw SQL using pgvector's `<=>` cosine-distance operator.
# The literal is safe to interpolate directly: it's built entirely from
# floats we generate ourselves (the query embedding), never from user input.

def _vector_literal(embedding: list[float]) -> str:
    return "[" + ",".join(f"{v:.8f}" for v in embedding) + "]"


def _cosine_distance_clause(embedding: list[float]):
    return literal_column(
        f"embedding <=> '{_vector_literal(embedding)}'::vector", type_=Float
    )


# ---------- retrieval ----------

def _retrieve_candidates(db, case_summary: str, top_k_sections: int = 20, top_k_judgments: int = 10):
    query_embedding = embed_query(case_summary)

    section_distance = _cosine_distance_clause(query_embedding)
    section_rows = (
        db.query(LegalSection, section_distance.label("distance"))
        .order_by(section_distance)
        .limit(top_k_sections)
        .all()
    )
    sections = []
    for section, distance in section_rows:
        section._similarity = 1 - distance  # transient attribute, not persisted
        sections.append(section)

    judgment_distance = _cosine_distance_clause(query_embedding)
    judgment_rows = (
        db.query(Landmark, judgment_distance.label("distance"))
        .order_by(judgment_distance)
        .limit(top_k_judgments)
        .all()
    )
    judgments = []
    for judgment, distance in judgment_rows:
        judgment._similarity = 1 - distance
        judgments.append(judgment)

    return sections, judgments


# ---------- cross-referencing (BNS<->IPC, BNSS<->CrPC, BSA<->IEA) ----------

def _word_boundary_pattern(section_number: str) -> str:
    return r"\y" + re.escape(section_number.strip()) + r"\y"


def _cross_references(db, act_code: str, section_number: str) -> list[dict]:
    if not section_number:
        return []
    pattern = _word_boundary_pattern(section_number)

    if act_code in NEW_ACTS:
        rows = (
            db.query(LegalSectionMapping)
            .filter(LegalSectionMapping.new_act == act_code)
            .filter(LegalSectionMapping.new_section.op("~")(pattern))
            .all()
        )
        return [
            {
                "act": r.old_act,
                "section": r.old_section,
                "subject": r.subject,
                "summary_of_comparison": r.summary_of_comparison,
            }
            for r in rows
        ]
    elif act_code in OLD_ACTS:
        rows = (
            db.query(LegalSectionMapping)
            .filter(LegalSectionMapping.old_act == act_code)
            .filter(LegalSectionMapping.old_section.op("~")(pattern))
            .all()
        )
        return [
            {
                "act": r.new_act,
                "section": r.new_section,
                "subject": r.subject,
                "summary_of_comparison": r.summary_of_comparison,
            }
            for r in rows
        ]
    return []


# ---------- LLM reranking ----------

def _rerank_with_llm(case_summary: str, sections: list, judgments: list):
    sections_text = "\n".join(
        f"[S{i}] {s.act_code} Sec {s.section_number} - {s.title}: {(s.section_text or '')[:300]}"
        for i, s in enumerate(sections)
    )
    judgments_text = "\n".join(
        f"[J{i}] {j.case_title} ({j.court}, {j.case_date}) - IPC {j.ipc_sections}: {(j.summary or '')[:300]}"
        for i, j in enumerate(judgments)
    )

    prompt = f"""You are a legal assistant helping an Indian police officer identify applicable law.

CASE SUMMARY:
{case_summary}

CANDIDATE LEGAL SECTIONS (indices S0 to S{len(sections) - 1} ONLY):
{sections_text}

CANDIDATE LANDMARK JUDGMENTS (indices J0 to J{len(judgments) - 1} ONLY):
{judgments_text}

Task: Select only the sections and judgments that are TRULY relevant to this case summary.
Rank them by relevance. Discard anything not clearly applicable.
IMPORTANT: Only use "ref" values that exist in the lists above. Do NOT invent indices beyond what is listed.

Respond ONLY with valid JSON, no other text, in this exact format:
{{
  "sections": [{{"ref": "S0", "relevance_reason": "one line explanation"}}],
  "judgments": [{{"ref": "J0", "relevance_reason": "one line explanation"}}]
}}"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
        },
        timeout=300,
    )
    response.raise_for_status()

    raw = response.json()["response"].strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        print("WARNING: LLM returned invalid JSON, raw output was:\n", raw)
        return [], []

    ranked_sections = []
    for item in result.get("sections", []):
        try:
            idx = int(item["ref"][1:])
            if 0 <= idx < len(sections):
                ranked_sections.append((sections[idx], item["relevance_reason"]))
        except (ValueError, KeyError, IndexError):
            print(f"Skipping malformed section item: {item}")

    ranked_judgments = []
    for item in result.get("judgments", []):
        try:
            idx = int(item["ref"][1:])
            if 0 <= idx < len(judgments):
                ranked_judgments.append((judgments[idx], item["relevance_reason"]))
        except (ValueError, KeyError, IndexError):
            print(f"Skipping malformed judgment item: {item}")

    return ranked_sections, ranked_judgments


# ---------- serialization ----------

def _serialize_section(db, section: LegalSection, reason: str) -> dict:
    return {
        "id": str(section.id),
        "act_code": section.act_code,
        "section_number": section.section_number,
        "title": section.title,
        "section_text": section.section_text,
        "category": section.category,
        "similarity": float(getattr(section, "_similarity", 0.0)),
        "reason": reason,
        "cross_references": _cross_references(db, section.act_code, section.section_number),
    }


def _serialize_judgment(judgment: Landmark, reason: str) -> dict:
    return {
        "id": str(judgment.id),
        "case_title": judgment.case_title,
        "court": judgment.court,
        "case_date": judgment.case_date.isoformat() if judgment.case_date else None,
        "ipc_sections": judgment.ipc_sections,
        "crime_type": judgment.crime_type,
        "summary": judgment.summary,
        "judgment_reason": judgment.judgment_reason,
        "bail_outcome": judgment.bail_outcome,
        "similarity": float(getattr(judgment, "_similarity", 0.0)),
        "reason": reason,
    }


# ---------- endpoint ----------

@router.post("/{complaint_id}/legal-sections/analyze")
def analyze_legal_sections(complaint_id: str, payload: AnalyzeRequest):
    db = SessionLocal()
    try:
        case_summary = payload.case_summary

        if not case_summary:
            row = (
                db.query(Complaint.complaint_id, Complaint.description)
                .filter(Complaint.complaint_id == complaint_id)
                .first()
            )
            if not row:
                raise HTTPException(status_code=404, detail="Complaint not found")
            case_summary = row.description

        if not case_summary or not case_summary.strip():
            raise HTTPException(
                status_code=422,
                detail="No case summary available for this complaint. "
                       "Pass `case_summary` in the request body.",
            )

        sections, judgments = _retrieve_candidates(db, case_summary)
        ranked_sections, ranked_judgments = _rerank_with_llm(case_summary, sections, judgments)

        return {
            "complaint_id": complaint_id,
            "case_summary": case_summary,
            "sections": [_serialize_section(db, s, reason) for s, reason in ranked_sections],
            "judgments": [_serialize_judgment(j, reason) for j, reason in ranked_judgments],
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {type(e).__name__}: {e}",
        )
    finally:
        db.close()