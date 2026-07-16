import psycopg2
import os
import json
import requests
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

from app.core.section_mapping import enrich_sections_with_cross_references

load_dotenv()
db_url = os.getenv("DATABASE_URL")

model = SentenceTransformer('intfloat/multilingual-e5-large')

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-20b"  # faster
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def embed_query(text: str):
    # e5 models need "query: " prefix for search text (vs "passage: " used during ingestion)
    return model.encode(f"query: {text}").tolist()


def retrieve_candidates(case_summary: str, top_k_sections=20, top_k_judgments=10):
    query_embedding = embed_query(case_summary)

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    cur.execute("""
        SELECT id, act_code, section_number, title, section_text, category,
               1 - (embedding <=> %s::vector) AS similarity
        FROM legal_sections
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """, (query_embedding, query_embedding, top_k_sections))
    section_rows = cur.fetchall()
    section_cols = ["id", "act_code", "section_number", "title", "section_text", "category", "similarity"]
    sections = [dict(zip(section_cols, row)) for row in section_rows]

    cur.execute("""
        SELECT id, case_title, court, case_date, ipc_sections, crime_type,
               summary, judgment_reason, bail_outcome,
               1 - (embedding <=> %s::vector) AS similarity
        FROM landmarks
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """, (query_embedding, query_embedding, top_k_judgments))
    judgment_rows = cur.fetchall()
    judgment_cols = ["id", "case_title", "court", "case_date", "ipc_sections",
                      "crime_type", "summary", "judgment_reason", "bail_outcome", "similarity"]
    judgments = [dict(zip(judgment_cols, row)) for row in judgment_rows]

    cur.close()
    conn.close()
    return sections, judgments


import time

def rerank_with_llm(case_summary: str, sections: list, judgments: list, max_retries: int = 3):
    sections_text = "\n".join([
        f"[S{i}] {s['act_code']} Sec {s['section_number']} - {s['title']}: {s['section_text'][:300]}"
        for i, s in enumerate(sections)
    ])
    judgments_text = "\n".join([
        f"[J{i}] {j['case_title']} ({j['court']}, {j['case_date']}) - IPC {j['ipc_sections']}: {j['summary'][:300]}"
        for i, j in enumerate(judgments)
    ])

    prompt = f"""You are a legal assistant helping an Indian police officer identify applicable law.

CASE SUMMARY:
{case_summary}

CANDIDATE LEGAL SECTIONS (indices S0 to S{len(sections)-1} ONLY):
{sections_text}

CANDIDATE LANDMARK JUDGMENTS (indices J0 to J{len(judgments)-1} ONLY):
{judgments_text}

Task: Select only the sections and judgments that are TRULY relevant to this case summary.
Rank them by relevance. Discard anything not clearly applicable.
IMPORTANT: Only use "ref" values that exist in the lists above. Do NOT invent indices beyond what is listed."""

    schema = {
        "type": "object",
        "properties": {
            "sections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "ref": {"type": "string"},
                        "relevance_reason": {"type": "string"}
                    },
                    "required": ["ref", "relevance_reason"]
                }
            },
            "judgments": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "ref": {"type": "string"},
                        "relevance_reason": {"type": "string"}
                    },
                    "required": ["ref", "relevance_reason"]
                }
            }
        },
        "required": ["sections", "judgments"]
    }

    result = None
    last_error = None

    for attempt in range(max_retries + 1):
        response = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {
                    "type": "json_schema",
                    "json_schema": {"name": "reranking_result", "schema": schema}
                },
                "temperature": 0,
            },
            timeout=60,
        )

        if response.status_code == 429:
            retry_after = int(response.headers.get("Retry-After", 5))
            print(f"Attempt {attempt + 1}: rate limited, waiting {retry_after}s...")
            time.sleep(retry_after)
            last_error = response.text
            continue

        if response.status_code == 400:
            print(f"Attempt {attempt + 1}: malformed JSON, retrying...")
            last_error = response.text
            continue

        response.raise_for_status()
        raw = response.json()["choices"][0]["message"]["content"].strip()
        raw = raw.replace("```json", "").replace("```", "").strip()

        try:
            result = json.loads(raw)
            break
        except json.JSONDecodeError:
            print(f"Attempt {attempt + 1}: local JSON parse failed, retrying...")
            last_error = raw
            continue

    if result is None:
        print("WARNING: All retries failed. Last error:\n", last_error)
        return [], []

    ranked_sections = []
    for item in result.get("sections", []):
        try:
            idx = int(item["ref"][1:])
            if 0 <= idx < len(sections):
                ranked_sections.append({**sections[idx], "reason": item["relevance_reason"]})
            else:
                print(f"Skipping out-of-range section ref: {item['ref']}")
        except (ValueError, KeyError, IndexError):
            print(f"Skipping malformed section item: {item}")

    ranked_judgments = []
    for item in result.get("judgments", []):
        try:
            idx = int(item["ref"][1:])
            if 0 <= idx < len(judgments):
                ranked_judgments.append({**judgments[idx], "reason": item["relevance_reason"]})
            else:
                print(f"Skipping out-of-range judgment ref: {item['ref']}")
        except (ValueError, KeyError, IndexError):
            print(f"Skipping malformed judgment item: {item}")

    return ranked_sections, ranked_judgments


def get_recommendations(case_summary: str):
    sections, judgments = retrieve_candidates(case_summary)
    ranked_sections, ranked_judgments = rerank_with_llm(case_summary, sections, judgments)

    # Cross-reference each recommended section against legal_section_mappings
    # (BNS<->IPC, BNSS<->CrPC, BSA<->IEA) so the UI can show old/new act equivalents.
    conn = psycopg2.connect(db_url)
    try:
        ranked_sections = enrich_sections_with_cross_references(conn, ranked_sections)
    finally:
        conn.close()

    return {
        "sections": ranked_sections,
        "judgments": ranked_judgments
    }


if __name__ == "__main__":
    test_summary = "The accused entered the complainant's house at night and stole jewellery worth Rs 2 lakh from a locked cupboard."
    result = get_recommendations(test_summary)

    print("\n--- Recommended Sections ---")
    for s in result["sections"]:
        print(f"{s['act_code']} Sec {s['section_number']} - {s['title']} | {s['reason']} (sim: {s['similarity']:.3f})")
        for xref in s.get("cross_references", []):
            print(f"    ↳ {xref['act']} Sec {xref['section']} - {xref['subject']}")

    print("\n--- Recommended Judgments ---")
    for j in result["judgments"]:
        print(f"{j['case_title']} ({j['court']}) | {j['reason']} (sim: {j['similarity']:.3f})")