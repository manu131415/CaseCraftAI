import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text as sql_text

from database.db import SessionLocal
from models.legal_sections import LegalSection
from app.legal.embeddings import embed_query


router = APIRouter(prefix="/api/legal-sections", tags=["legal-sections"])


class LegalSectionCreate(BaseModel):
    act_code: str
    section_number: str
    title: Optional[str] = None
    section_text: str
    category: Optional[str] = None
    embedding: List[float]


class LegalSectionUpdate(BaseModel):
    act_code: Optional[str] = None
    section_number: Optional[str] = None
    title: Optional[str] = None
    section_text: Optional[str] = None
    category: Optional[str] = None
    embedding: Optional[List[float]] = None


class LegalSectionSummary(BaseModel):
    id: str
    act_code: Optional[str] = None
    section_number: Optional[str] = None
    title: Optional[str] = None
    section_text: Optional[str] = None
    category: Optional[str] = None
    created_at: Optional[str] = None


class LegalSectionCreateData(BaseModel):
    id: str


class LegalSectionCreateResponse(BaseModel):
    success: bool
    message: str
    data: LegalSectionCreateData


class LegalSectionListResponse(BaseModel):
    legal_sections: List[LegalSectionSummary]


class LegalSectionDetailResponse(LegalSectionSummary):
    pass


class LegalSectionUpdateResponse(BaseModel):
    success: bool
    message: str
    data: LegalSectionCreateData


class LegalSectionDeleteResponse(BaseModel):
    success: bool
    message: str


class MappingReference(BaseModel):
    act_pair: str
    old_act: str
    new_act: str
    old_section: Optional[str] = None
    new_section: str
    subject: Optional[str] = None
    summary_of_comparison: Optional[str] = None


class LegalSectionSearchResult(LegalSectionSummary):
    similarity: float
    mapping: Optional[MappingReference] = None


class LegalSectionSearchResponse(BaseModel):
    query: str
    results: List[LegalSectionSearchResult]


@router.post(
    "",
    response_model=LegalSectionCreateResponse,
    summary="Create a legal section",
    description="Create a new legal section record.",
    tags=["legal-sections"],
)
def create_legal_section(payload: LegalSectionCreate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        legal_section = LegalSection(
            act_code=payload.act_code,
            section_number=payload.section_number,
            title=payload.title,
            section_text=payload.section_text,
            category=payload.category,
            embedding=payload.embedding
        )

        db.add(legal_section)
        db.commit()
        db.refresh(legal_section)

        return {
            "success": True,
            "message": "Legal section created successfully",
            "data": {
                "id": str(legal_section.id)
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create legal section: {str(e)}")
    finally:
        db.close()


@router.get(
    "",
    response_model=LegalSectionListResponse,
    summary="List legal sections",
    description="Retrieve all legal section records.",
    tags=["legal-sections"],
)
def get_all_legal_sections() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        legal_sections = db.query(LegalSection).all()
        return {
            "legal_sections": [
                {
                    "id": str(ls.id),
                    "act_code": ls.act_code,
                    "section_number": ls.section_number,
                    "title": ls.title,
                    "section_text": ls.section_text,
                    "category": ls.category,
                    "created_at": ls.created_at.isoformat() if ls.created_at else None
                }
                for ls in legal_sections
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve legal sections: {str(e)}")
    finally:
        db.close()


@router.get(
    "/search",
    response_model=LegalSectionSearchResponse,
    summary="Semantic search across legal sections",
    description=(
        "Embeds the query with the same model used to index legal_sections, "
        "ranks sections by pgvector cosine similarity, and attaches the "
        "corresponding old/new act cross-reference from "
        "legal_section_mappings when one exists. NOTE: registered before "
        "/{id} so 'search' is never parsed as a UUID."
    ),
    tags=["legal-sections"],
)
def search_legal_sections(q: str, limit: int = 10) -> Dict[str, Any]:
    query = q.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
    if limit < 1 or limit > 50:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 50")

    try:
        query_vector = embed_query(query)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to embed query: {str(e)}")

    # pgvector's Postgres literal format: '[0.1,0.2,...]', cast explicitly
    # in SQL. This avoids relying on the project's custom `Vector` type
    # (models/_types.py) exposing an ORM-level `.cosine_distance()`
    # comparator -- raw SQL only needs Postgres itself to have the `vector`
    # type, which it already does (the ivfflat index proves that).
    query_vector_literal = "[" + ",".join(f"{v:.8f}" for v in query_vector) + "]"

    db = SessionLocal()
    try:
        # <=> is pgvector's cosine distance operator: 0 (identical) to
        # 2 (opposite); convert to a 0-1 similarity score for the frontend.
        rows = db.execute(
            sql_text(
                """
                SELECT id, act_code, section_number, title, section_text,
                       category, created_at,
                       (embedding <=> CAST(:qvec AS vector)) AS distance
                FROM legal_sections
                ORDER BY embedding <=> CAST(:qvec AS vector)
                LIMIT :limit
                """
            ),
            {"qvec": query_vector_literal, "limit": limit},
        ).mappings().all()

        results = []
        for row in rows:
            similarity = max(0.0, 1.0 - (row["distance"] / 2.0))

            # A section can appear as either side of a cross-reference:
            # a BNS section maps to its old IPC section, or vice versa.
            mapping_row = db.execute(
                sql_text(
                    """
                    SELECT act_pair, old_act, new_act, old_section, new_section,
                           subject, summary_of_comparison
                    FROM legal_section_mappings
                    WHERE (new_act = :act_code AND new_section = :section_number)
                       OR (old_act = :act_code AND old_section = :section_number)
                    LIMIT 1
                    """
                ),
                {
                    "act_code": row["act_code"],
                    "section_number": row["section_number"],
                },
            ).mappings().first()

            results.append(
                {
                    "id": str(row["id"]),
                    "act_code": row["act_code"],
                    "section_number": row["section_number"],
                    "title": row["title"],
                    "section_text": row["section_text"],
                    "category": row["category"],
                    "created_at": row["created_at"].isoformat() if row["created_at"] else None,
                    "similarity": round(similarity, 4),
                    "mapping": dict(mapping_row) if mapping_row else None,
                }
            )

        return {"query": query, "results": results}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{id}",
    response_model=LegalSectionDetailResponse,
    summary="Get legal section",
    description="Retrieve a single legal section record by its identifier.",
    tags=["legal-sections"],
)
def get_legal_section(id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        legal_section = db.query(LegalSection).filter(LegalSection.id == uuid.UUID(id)).first()
        if not legal_section:
            raise HTTPException(status_code=404, detail="Legal section not found")

        return {
            "id": str(legal_section.id),
            "act_code": legal_section.act_code,
            "section_number": legal_section.section_number,
            "title": legal_section.title,
            "section_text": legal_section.section_text,
            "category": legal_section.category,
            "created_at": legal_section.created_at.isoformat() if legal_section.created_at else None
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid id format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve legal section: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{id}",
    response_model=LegalSectionUpdateResponse,
    summary="Update a legal section",
    description="Partially update an existing legal section record.",
    tags=["legal-sections"],
)
def update_legal_section(id: str, payload: LegalSectionUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        legal_section = db.query(LegalSection).filter(LegalSection.id == uuid.UUID(id)).first()
        if not legal_section:
            raise HTTPException(status_code=404, detail="Legal section not found")

        if payload.act_code is not None:
            legal_section.act_code = payload.act_code
        if payload.section_number is not None:
            legal_section.section_number = payload.section_number
        if payload.title is not None:
            legal_section.title = payload.title
        if payload.section_text is not None:
            legal_section.section_text = payload.section_text
        if payload.category is not None:
            legal_section.category = payload.category
        if payload.embedding is not None:
            legal_section.embedding = payload.embedding

        db.commit()
        db.refresh(legal_section)

        return {
            "success": True,
            "message": "Legal section updated successfully",
            "data": {
                "id": str(legal_section.id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update legal section: {str(e)}")
    finally:
        db.close()


@router.delete(
    "/{id}",
    response_model=LegalSectionDeleteResponse,
    summary="Delete a legal section",
    description="Remove a legal section record from the system.",
    tags=["legal-sections"],
)
def delete_legal_section(id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        legal_section = db.query(LegalSection).filter(LegalSection.id == uuid.UUID(id)).first()
        if not legal_section:
            raise HTTPException(status_code=404, detail="Legal section not found")

        db.delete(legal_section)
        db.commit()

        return {
            "success": True,
            "message": "Legal section deleted successfully"
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete legal section: {str(e)}")
    finally:
        db.close()