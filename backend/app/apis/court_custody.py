import uuid
from datetime import date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import SessionLocal
from models.court_custody import CourtCustody
from models.case import Case
from models.suspect import Suspects


router = APIRouter(prefix="/api/court-custody", tags=["court-custody"])


class CourtCustodyCreate(BaseModel):
    case_id: str
    accused_id: str
    prison_name: Optional[str] = None
    commitment_from: Optional[date] = None
    commitment_to: Optional[date] = None
    court_order_number: Optional[str] = None


class CourtCustodyUpdate(BaseModel):
    case_id: Optional[str] = None
    accused_id: Optional[str] = None
    prison_name: Optional[str] = None
    commitment_from: Optional[date] = None
    commitment_to: Optional[date] = None
    court_order_number: Optional[str] = None


class CourtCustodySummary(BaseModel):
    custody_id: str
    case_id: Optional[str] = None
    accused_id: Optional[str] = None
    prison_name: Optional[str] = None
    commitment_from: Optional[str] = None
    commitment_to: Optional[str] = None
    court_order_number: Optional[str] = None


class CourtCustodyCreateData(BaseModel):
    custody_id: str


class CourtCustodyCreateResponse(BaseModel):
    success: bool
    message: str
    data: CourtCustodyCreateData


class CourtCustodyListResponse(BaseModel):
    court_custody_records: List[CourtCustodySummary]


class CourtCustodyDetailResponse(CourtCustodySummary):
    pass


class CourtCustodyUpdateResponse(BaseModel):
    success: bool
    message: str
    data: CourtCustodyCreateData


class CourtCustodyDeleteResponse(BaseModel):
    success: bool
    message: str


@router.post(
    "",
    response_model=CourtCustodyCreateResponse,
    summary="Create a court custody record",
    description="Create a new court custody record associated with a case and accused.",
    tags=["court-custody"],
)
def create_court_custody(payload: CourtCustodyCreate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # Verify case exists
        case = db.query(Case).filter(Case.case_id == payload.case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Verify accused exists
        accused = db.query(Accused).filter(Accused.accused_id == uuid.UUID(payload.accused_id)).first()
        if not accused:
            raise HTTPException(status_code=404, detail="Accused not found")
        
        court_custody = CourtCustody(
            case_id=payload.case_id,
            accused_id=accused.accused_id,
            prison_name=payload.prison_name,
            commitment_from=payload.commitment_from,
            commitment_to=payload.commitment_to,
            court_order_number=payload.court_order_number
        )
        
        db.add(court_custody)
        db.commit()
        db.refresh(court_custody)
        
        return {
            "success": True,
            "message": "Court custody record created successfully",
            "data": {
                "custody_id": str(court_custody.custody_id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create court custody record: {str(e)}")
    finally:
        db.close()


@router.get(
    "",
    response_model=CourtCustodyListResponse,
    summary="List court custody records",
    description="Retrieve all court custody records in the system.",
    tags=["court-custody"],
)
def get_all_court_custody() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        court_custody_records = db.query(CourtCustody).all()
        return {
            "court_custody_records": [
                {
                    "custody_id": str(c.custody_id),
                    "case_id": c.case_id,
                    "accused_id": str(c.accused_id) if c.accused_id else None,
                    "prison_name": c.prison_name,
                    "commitment_from": c.commitment_from.isoformat() if c.commitment_from else None,
                    "commitment_to": c.commitment_to.isoformat() if c.commitment_to else None,
                    "court_order_number": c.court_order_number
                }
                for c in court_custody_records
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve court custody records: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{custody_id}",
    response_model=CourtCustodyDetailResponse,
    summary="Get court custody details",
    description="Retrieve a single court custody record by its identifier.",
    tags=["court-custody"],
)
def get_court_custody(custody_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        court_custody = db.query(CourtCustody).filter(CourtCustody.custody_id == uuid.UUID(custody_id)).first()
        if not court_custody:
            raise HTTPException(status_code=404, detail="Court custody record not found")
        
        return {
            "custody_id": str(court_custody.custody_id),
            "case_id": court_custody.case_id,
            "accused_id": str(court_custody.accused_id) if court_custody.accused_id else None,
            "prison_name": court_custody.prison_name,
            "commitment_from": court_custody.commitment_from.isoformat() if court_custody.commitment_from else None,
            "commitment_to": court_custody.commitment_to.isoformat() if court_custody.commitment_to else None,
            "court_order_number": court_custody.court_order_number
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid custody_id format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve court custody record: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{custody_id}",
    response_model=CourtCustodyUpdateResponse,
    summary="Update a court custody record",
    description="Partially update an existing court custody record.",
    tags=["court-custody"],
)
def update_court_custody(custody_id: str, payload: CourtCustodyUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        court_custody = db.query(CourtCustody).filter(CourtCustody.custody_id == uuid.UUID(custody_id)).first()
        if not court_custody:
            raise HTTPException(status_code=404, detail="Court custody record not found")
        
        # Verify case exists if case_id is being updated
        if payload.case_id is not None:
            case = db.query(Case).filter(Case.case_id == payload.case_id).first()
            if not case:
                raise HTTPException(status_code=404, detail="Case not found")
        
        # Verify accused exists if accused_id is being updated
        if payload.accused_id is not None:
            accused = db.query(Accused).filter(Accused.accused_id == uuid.UUID(payload.accused_id)).first()
            if not accused:
                raise HTTPException(status_code=404, detail="Accused not found")
        
        # Update only provided fields
        if payload.case_id is not None:
            court_custody.case_id = payload.case_id
        if payload.accused_id is not None:
            court_custody.accused_id = uuid.UUID(payload.accused_id)
        if payload.prison_name is not None:
            court_custody.prison_name = payload.prison_name
        if payload.commitment_from is not None:
            court_custody.commitment_from = payload.commitment_from
        if payload.commitment_to is not None:
            court_custody.commitment_to = payload.commitment_to
        if payload.court_order_number is not None:
            court_custody.court_order_number = payload.court_order_number
        
        db.commit()
        db.refresh(court_custody)
        
        return {
            "success": True,
            "message": "Court custody record updated successfully",
            "data": {
                "custody_id": str(court_custody.custody_id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update court custody record: {str(e)}")
    finally:
        db.close()


@router.delete(
    "/{custody_id}",
    response_model=CourtCustodyDeleteResponse,
    summary="Delete a court custody record",
    description="Remove a court custody record from the system.",
    tags=["court-custody"],
)
def delete_court_custody(custody_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        court_custody = db.query(CourtCustody).filter(CourtCustody.custody_id == uuid.UUID(custody_id)).first()
        if not court_custody:
            raise HTTPException(status_code=404, detail="Court custody record not found")
        
        db.delete(court_custody)
        db.commit()
        
        return {
            "success": True,
            "message": "Court custody record deleted successfully"
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid custody_id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete court custody record: {str(e)}")
    finally:
        db.close()
