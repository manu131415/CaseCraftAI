import uuid
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import SessionLocal
from models.case import Case
from models.complaint import Complaint
from models.officer import Officer
from models.evidence import Evidence
from models.document import Document
from models.case_diary import CaseDiary


router = APIRouter(prefix="/api/cases", tags=["cases"])


class CaseCreate(BaseModel):
    complaint_id: str
    assigned_officer_id: Optional[str] = None
    case_number: Optional[str] = None
    title: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None


class CaseUpdate(BaseModel):
    assigned_officer_id: Optional[str] = None
    case_number: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    closed_at: Optional[str] = None


@router.post("")
def create_case(payload: CaseCreate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # Verify complaint exists
        complaint = db.query(Complaint).filter(Complaint.complaint_id == payload.complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Verify officer exists if provided
        if payload.assigned_officer_id:
            officer = db.query(Officer).filter(Officer.officer_id == payload.assigned_officer_id).first()
            if not officer:
                raise HTTPException(status_code=404, detail="Officer not found")
        
        case = Case(
            case_id=str(uuid.uuid4()),
            complaint_id=payload.complaint_id,
            assigned_officer_id=payload.assigned_officer_id,
            case_number=payload.case_number,
            title=payload.title,
            status="Open",
            priority=payload.priority,
            description=payload.description
        )
        
        db.add(case)
        db.commit()
        db.refresh(case)
        
        return {
            "success": True,
            "message": "Case created successfully",
            "data": {
                "case_id": case.case_id,
                "status": case.status,
                "created_at": case.created_at.isoformat() if case.created_at else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create case: {str(e)}")
    finally:
        db.close()


@router.get("")
def get_all_cases() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        cases = db.query(Case).all()
        return {
            "cases": [
                {
                    "case_id": c.case_id,
                    "complaint_id": c.complaint_id,
                    "assigned_officer_id": c.assigned_officer_id,
                    "case_number": c.case_number,
                    "title": c.title,
                    "status": c.status,
                    "priority": c.priority,
                    "description": c.description,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                    "updated_at": c.updated_at.isoformat() if c.updated_at else None,
                    "closed_at": c.closed_at.isoformat() if c.closed_at else None
                }
                for c in cases
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve cases: {str(e)}")
    finally:
        db.close()


@router.get("/{case_id}")
def get_case(case_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        case = db.query(Case).filter(Case.case_id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        return {
            "case_id": case.case_id,
            "complaint_id": case.complaint_id,
            "assigned_officer_id": case.assigned_officer_id,
            "case_number": case.case_number,
            "title": case.title,
            "status": case.status,
            "priority": case.priority,
            "description": case.description,
            "created_at": case.created_at.isoformat() if case.created_at else None,
            "updated_at": case.updated_at.isoformat() if case.updated_at else None,
            "closed_at": case.closed_at.isoformat() if case.closed_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve case: {str(e)}")
    finally:
        db.close()


@router.put("/{case_id}")
def update_case(case_id: str, payload: CaseUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        case = db.query(Case).filter(Case.case_id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Verify officer exists if assigned_officer_id is being updated
        if payload.assigned_officer_id is not None:
            officer = db.query(Officer).filter(Officer.officer_id == payload.assigned_officer_id).first()
            if not officer:
                raise HTTPException(status_code=404, detail="Officer not found")
        
        # Update only provided fields
        if payload.assigned_officer_id is not None:
            case.assigned_officer_id = payload.assigned_officer_id
        if payload.case_number is not None:
            case.case_number = payload.case_number
        if payload.title is not None:
            case.title = payload.title
        if payload.status is not None:
            case.status = payload.status
        if payload.priority is not None:
            case.priority = payload.priority
        if payload.description is not None:
            case.description = payload.description
        if payload.closed_at is not None:
            case.closed_at = payload.closed_at
        
        db.commit()
        db.refresh(case)
        
        return {
            "success": True,
            "message": "Case updated successfully",
            "data": {
                "case_id": case.case_id,
                "status": case.status,
                "updated_at": case.updated_at.isoformat() if case.updated_at else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update case: {str(e)}")
    finally:
        db.close()


@router.delete("/{case_id}")
def delete_case(case_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        case = db.query(Case).filter(Case.case_id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Check for dependent records
        evidence_count = db.query(Evidence).filter(Evidence.case_id == case_id).count()
        document_count = db.query(Document).filter(Document.case_id == case_id).count()
        diary_count = db.query(CaseDiary).filter(CaseDiary.case_id == case_id).count()
        
        if evidence_count > 0 or document_count > 0 or diary_count > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete case: Case has dependent records ({evidence_count} Evidence, {document_count} Documents, {diary_count} CaseDiary entries)"
            )
        
        db.delete(case)
        db.commit()
        
        return {
            "success": True,
            "message": "Case deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete case: {str(e)}")
    finally:
        db.close()
