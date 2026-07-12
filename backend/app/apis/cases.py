import uuid
from datetime import datetime, date
from typing import Any, Dict, List, Optional

from sqlalchemy import or_

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
    district: Optional[str] = None
    police_station: Optional[str] = None
    fir_no: Optional[str] = None
    fir_year: Optional[int] = None
    fir_date: Optional[date] = None
    incident_datetime: Optional[datetime] = None
    original_chargesheet_no: Optional[str] = None
    original_chargesheet_date: Optional[date] = None
    supplementary_chargesheet_no: Optional[str] = None
    supplementary_reason: Optional[str] = None
    court_name: Optional[str] = None
    court_no: Optional[str] = None
    current_stage: Optional[str] = None


class CaseUpdate(BaseModel):
    assigned_officer_id: Optional[str] = None
    case_number: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    closed_at: Optional[datetime] = None
    district: Optional[str] = None
    police_station: Optional[str] = None
    fir_no: Optional[str] = None
    fir_year: Optional[int] = None
    fir_date: Optional[date] = None
    incident_datetime: Optional[datetime] = None
    original_chargesheet_no: Optional[str] = None
    original_chargesheet_date: Optional[date] = None
    supplementary_chargesheet_no: Optional[str] = None
    supplementary_reason: Optional[str] = None
    court_name: Optional[str] = None
    court_no: Optional[str] = None
    current_stage: Optional[str] = None


class CaseSummary(BaseModel):
    case_id: str
    complaint_id: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    case_number: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    closed_at: Optional[str] = None
    district: Optional[str] = None
    police_station: Optional[str] = None
    fir_no: Optional[str] = None
    fir_year: Optional[int] = None
    fir_date: Optional[str] = None
    incident_datetime: Optional[str] = None
    original_chargesheet_no: Optional[str] = None
    original_chargesheet_date: Optional[str] = None
    supplementary_chargesheet_no: Optional[str] = None
    supplementary_reason: Optional[str] = None
    court_name: Optional[str] = None
    court_no: Optional[str] = None
    current_stage: Optional[str] = None


class CaseCreationData(BaseModel):
    case_id: str
    status: str
    created_at: Optional[str] = None


class CaseUpdateData(BaseModel):
    case_id: str
    status: str
    updated_at: Optional[str] = None


class CaseCreateResponse(BaseModel):
    success: bool
    message: str
    data: CaseCreationData


class CaseListResponse(BaseModel):
    cases: List[CaseSummary]


class CaseDetailResponse(CaseSummary):
    pass


class CaseUpdateResponse(BaseModel):
    success: bool
    message: str
    data: CaseUpdateData


class CaseDeleteResponse(BaseModel):
    success: bool
    message: str

# ============================================
# SEARCH MODELS
# ============================================

class SearchCase(BaseModel):
    case_id: str
    case_number: str | None = None
    title: str | None = None
    status: str | None = None
    priority: str | None = None
    description: str | None = None


class SearchDocument(BaseModel):
    document_id: str
    case_id: str
    document_type: str | None = None
    title: str | None = None
    status: str | None = None
    version: str | None = None


class SearchResponse(BaseModel):
    cases: List[SearchCase]
    documents: List[SearchDocument]


@router.post(
    "",
    response_model=CaseCreateResponse,
    summary="Create a case",
    description="Create a case associated with an existing complaint and optional officer.",
    tags=["cases"],
)
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
            description=payload.description,
            district=payload.district,
            police_station=payload.police_station,
            fir_no=payload.fir_no,
            fir_year=payload.fir_year,
            fir_date=payload.fir_date,
            incident_datetime=payload.incident_datetime,
            original_chargesheet_no=payload.original_chargesheet_no,
            original_chargesheet_date=payload.original_chargesheet_date,
            supplementary_chargesheet_no=payload.supplementary_chargesheet_no,
            supplementary_reason=payload.supplementary_reason,
            court_name=payload.court_name,
            court_no=payload.court_no,
            current_stage=payload.current_stage
        )
        
        db.add(case)
        db.commit()
        db.refresh(case)
        # Create an initial case diary/timeline entry noting that the case was created from a complaint
        try:
            diary = CaseDiary(
                diary_id=str(uuid.uuid4()),
                case_id=case.case_id,
                officer_id=None,
                action_type="case_created",
                description=f"Case created from complaint {payload.complaint_id}",
                occurred_at=datetime.utcnow(),
            )
            db.add(diary)
            db.commit()
        except Exception:
            # Do not fail the entire request if diary creation fails; log and continue
            db.rollback()
        
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


@router.get(
    "",
    response_model=CaseListResponse,
    summary="List cases",
    description="Retrieve all cases stored in the system.",
    tags=["cases"],
)
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
                    "closed_at": c.closed_at.isoformat() if c.closed_at else None,
                    "district": c.district,
                    "police_station": c.police_station,
                    "fir_no": c.fir_no,
                    "fir_year": c.fir_year,
                    "fir_date": c.fir_date.isoformat() if c.fir_date else None,
                    "incident_datetime": c.incident_datetime.isoformat() if c.incident_datetime else None,
                    "original_chargesheet_no": c.original_chargesheet_no,
                    "original_chargesheet_date": c.original_chargesheet_date.isoformat() if c.original_chargesheet_date else None,
                    "supplementary_chargesheet_no": c.supplementary_chargesheet_no,
                    "supplementary_reason": c.supplementary_reason,
                    "court_name": c.court_name,
                    "court_no": c.court_no,
                    "current_stage": c.current_stage
                }
                for c in cases
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve cases: {str(e)}")
    finally:
        db.close()


@router.get(
    "/by-complaint/{complaint_id}",
    response_model=CaseDetailResponse,
    summary="Get case by complaint id",
    description="Retrieve the case associated with the provided complaint identifier.",
    tags=["cases"],
)
def get_case_by_complaint_id(complaint_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        case = db.query(Case).filter(Case.complaint_id == complaint_id).first()
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
            "closed_at": case.closed_at.isoformat() if case.closed_at else None,
            "district": case.district,
            "police_station": case.police_station,
            "fir_no": case.fir_no,
            "fir_year": case.fir_year,
            "fir_date": case.fir_date.isoformat() if case.fir_date else None,
            "incident_datetime": case.incident_datetime.isoformat() if case.incident_datetime else None,
            "original_chargesheet_no": case.original_chargesheet_no,
            "original_chargesheet_date": case.original_chargesheet_date.isoformat() if case.original_chargesheet_date else None,
            "supplementary_chargesheet_no": case.supplementary_chargesheet_no,
            "supplementary_reason": case.supplementary_reason,
            "court_name": case.court_name,
            "court_no": case.court_no,
            "current_stage": case.current_stage
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve case: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{case_id}",
    response_model=CaseDetailResponse,
    summary="Get case details",
    description="Retrieve a single case by its identifier.",
    tags=["cases"],
)
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
            "closed_at": case.closed_at.isoformat() if case.closed_at else None,
            "district": case.district,
            "police_station": case.police_station,
            "fir_no": case.fir_no,
            "fir_year": case.fir_year,
            "fir_date": case.fir_date.isoformat() if case.fir_date else None,
            "incident_datetime": case.incident_datetime.isoformat() if case.incident_datetime else None,
            "original_chargesheet_no": case.original_chargesheet_no,
            "original_chargesheet_date": case.original_chargesheet_date.isoformat() if case.original_chargesheet_date else None,
            "supplementary_chargesheet_no": case.supplementary_chargesheet_no,
            "supplementary_reason": case.supplementary_reason,
            "court_name": case.court_name,
            "court_no": case.court_no,
            "current_stage": case.current_stage
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve case: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{case_id}",
    response_model=CaseUpdateResponse,
    summary="Update a case",
    description="Partially update an existing case record.",
    tags=["cases"],
)
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
        if payload.district is not None:
            case.district = payload.district
        if payload.police_station is not None:
            case.police_station = payload.police_station
        if payload.fir_no is not None:
            case.fir_no = payload.fir_no
        if payload.fir_year is not None:
            case.fir_year = payload.fir_year
        if payload.fir_date is not None:
            case.fir_date = payload.fir_date
        if payload.incident_datetime is not None:
            case.incident_datetime = payload.incident_datetime
        if payload.original_chargesheet_no is not None:
            case.original_chargesheet_no = payload.original_chargesheet_no
        if payload.original_chargesheet_date is not None:
            case.original_chargesheet_date = payload.original_chargesheet_date
        if payload.supplementary_chargesheet_no is not None:
            case.supplementary_chargesheet_no = payload.supplementary_chargesheet_no
        if payload.supplementary_reason is not None:
            case.supplementary_reason = payload.supplementary_reason
        if payload.court_name is not None:
            case.court_name = payload.court_name
        if payload.court_no is not None:
            case.court_no = payload.court_no
        if payload.current_stage is not None:
            case.current_stage = payload.current_stage
        
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


@router.delete(
    "/{case_id}",
    response_model=CaseDeleteResponse,
    summary="Delete a case",
    description="Delete a case when no dependent records are linked to it.",
    tags=["cases"],
)
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
        
@router.get(
    "/search",
    response_model=SearchResponse,
    summary="Search cases and documents",
    description="Search by case number, title, description or document title/type.",
    tags=["cases"],
)
def search_cases(q: str):
    db = SessionLocal()

    try:
        matching_cases = (
            db.query(Case)
            .filter(
                or_(
                    Case.case_number.ilike(f"%{q}%"),
                    Case.title.ilike(f"%{q}%"),
                    Case.description.ilike(f"%{q}%"),
                )
            )
            .all()
        )

        matching_documents = (
            db.query(Document)
            .filter(
                or_(
                    Document.title.ilike(f"%{q}%"),
                    Document.document_type.ilike(f"%{q}%"),
                )
            )
            .all()
        )

        return {
            "cases": [
                {
                    "case_id": c.case_id,
                    "case_number": c.case_number,
                    "title": c.title,
                    "status": c.status,
                    "priority": c.priority,
                    "description": c.description,
                }
                for c in matching_cases
            ],
            "documents": [
                {
                    "document_id": d.document_id,
                    "case_id": d.case_id,
                    "document_type": d.document_type,
                    "title": d.title,
                    "status": d.status,
                    "version": d.version,
                }
                for d in matching_documents
            ],
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )

    finally:
        db.close()
