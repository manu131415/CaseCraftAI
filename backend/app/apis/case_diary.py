import uuid
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import SessionLocal
from models.case_diary import CaseDiary
from models.case import Case
from models.officer import Officer
from models.evidence import Evidence
from models.document import Document


router = APIRouter(prefix="/api/case-diary", tags=["case-diary"])


class CaseDiaryCreate(BaseModel):
    case_id: str
    officer_id: str
    action_type: str
    description: str
    location: Optional[str] = None
    occurred_at: Optional[str] = None
    related_evidence_id: Optional[str] = None
    related_document_id: Optional[str] = None


class CaseDiaryUpdate(BaseModel):
    officer_id: Optional[str] = None
    action_type: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    occurred_at: Optional[str] = None
    related_evidence_id: Optional[str] = None
    related_document_id: Optional[str] = None


@router.post("")
def create_diary_entry(payload: CaseDiaryCreate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # Verify case exists
        case = db.query(Case).filter(Case.case_id == payload.case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Verify officer exists
        officer = db.query(Officer).filter(Officer.officer_id == payload.officer_id).first()
        if not officer:
            raise HTTPException(status_code=404, detail="Officer not found")
        
        # Verify evidence exists if provided
        if payload.related_evidence_id:
            evidence = db.query(Evidence).filter(Evidence.evidence_id == payload.related_evidence_id).first()
            if not evidence:
                raise HTTPException(status_code=404, detail="Evidence not found")
        
        # Verify document exists if provided
        if payload.related_document_id:
            document = db.query(Document).filter(Document.document_id == payload.related_document_id).first()
            if not document:
                raise HTTPException(status_code=404, detail="Document not found")
        
        diary_entry = CaseDiary(
            diary_id=str(uuid.uuid4()),
            case_id=payload.case_id,
            officer_id=payload.officer_id,
            action_type=payload.action_type,
            description=payload.description,
            location=payload.location,
            occurred_at=payload.occurred_at,
            related_evidence_id=payload.related_evidence_id,
            related_document_id=payload.related_document_id
        )
        
        db.add(diary_entry)
        db.commit()
        db.refresh(diary_entry)
        
        return {
            "success": True,
            "message": "Diary entry created successfully",
            "data": {
                "diary_id": diary_entry.diary_id,
                "created_at": diary_entry.created_at.isoformat() if diary_entry.created_at else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create diary entry: {str(e)}")
    finally:
        db.close()


@router.get("")
def get_all_diary_entries() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        entries = db.query(CaseDiary).all()
        return {
            "diary_entries": [
                {
                    "diary_id": e.diary_id,
                    "case_id": e.case_id,
                    "officer_id": e.officer_id,
                    "action_type": e.action_type,
                    "description": e.description,
                    "location": e.location,
                    "occurred_at": e.occurred_at.isoformat() if e.occurred_at else None,
                    "created_at": e.created_at.isoformat() if e.created_at else None,
                    "related_evidence_id": e.related_evidence_id,
                    "related_document_id": e.related_document_id
                }
                for e in entries
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve diary entries: {str(e)}")
    finally:
        db.close()


@router.get("/{diary_id}")
def get_diary_entry(diary_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        entry = db.query(CaseDiary).filter(CaseDiary.diary_id == diary_id).first()
        if not entry:
            raise HTTPException(status_code=404, detail="Diary entry not found")
        
        return {
            "diary_id": entry.diary_id,
            "case_id": entry.case_id,
            "officer_id": entry.officer_id,
            "action_type": entry.action_type,
            "description": entry.description,
            "location": entry.location,
            "occurred_at": entry.occurred_at.isoformat() if entry.occurred_at else None,
            "created_at": entry.created_at.isoformat() if entry.created_at else None,
            "related_evidence_id": entry.related_evidence_id,
            "related_document_id": entry.related_document_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve diary entry: {str(e)}")
    finally:
        db.close()


@router.put("/{diary_id}")
def update_diary_entry(diary_id: str, payload: CaseDiaryUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        entry = db.query(CaseDiary).filter(CaseDiary.diary_id == diary_id).first()
        if not entry:
            raise HTTPException(status_code=404, detail="Diary entry not found")
        
        # Verify officer exists if being updated
        if payload.officer_id is not None:
            officer = db.query(Officer).filter(Officer.officer_id == payload.officer_id).first()
            if not officer:
                raise HTTPException(status_code=404, detail="Officer not found")
        
        # Verify evidence exists if being updated
        if payload.related_evidence_id is not None:
            evidence = db.query(Evidence).filter(Evidence.evidence_id == payload.related_evidence_id).first()
            if not evidence:
                raise HTTPException(status_code=404, detail="Evidence not found")
        
        # Verify document exists if being updated
        if payload.related_document_id is not None:
            document = db.query(Document).filter(Document.document_id == payload.related_document_id).first()
            if not document:
                raise HTTPException(status_code=404, detail="Document not found")
        
        # Update only provided fields
        if payload.officer_id is not None:
            entry.officer_id = payload.officer_id
        if payload.action_type is not None:
            entry.action_type = payload.action_type
        if payload.description is not None:
            entry.description = payload.description
        if payload.location is not None:
            entry.location = payload.location
        if payload.occurred_at is not None:
            entry.occurred_at = payload.occurred_at
        if payload.related_evidence_id is not None:
            entry.related_evidence_id = payload.related_evidence_id
        if payload.related_document_id is not None:
            entry.related_document_id = payload.related_document_id
        
        db.commit()
        db.refresh(entry)
        
        return {
            "success": True,
            "message": "Diary entry updated successfully",
            "data": {
                "diary_id": entry.diary_id,
                "created_at": entry.created_at.isoformat() if entry.created_at else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update diary entry: {str(e)}")
    finally:
        db.close()
