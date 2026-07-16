import uuid
from datetime import datetime, date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import SessionLocal
from models.remand_detail import RemandDetail
from models.case import Case
from models.accused import Accused


router = APIRouter(prefix="/api/remand-details", tags=["remand-details"])


class RemandDetailCreate(BaseModel):
    case_id: str
    accused_id: str
    remand_days: Optional[int] = None
    custody_type: Optional[str] = None
    grounds: Optional[str] = None
    expiry_datetime: Optional[datetime] = None
    order_date: Optional[date] = None


class RemandDetailUpdate(BaseModel):
    case_id: Optional[str] = None
    accused_id: Optional[str] = None
    remand_days: Optional[int] = None
    custody_type: Optional[str] = None
    grounds: Optional[str] = None
    expiry_datetime: Optional[datetime] = None
    order_date: Optional[date] = None


class RemandDetailSummary(BaseModel):
    remand_id: str
    case_id: Optional[str] = None
    accused_id: Optional[str] = None
    remand_days: Optional[int] = None
    custody_type: Optional[str] = None
    grounds: Optional[str] = None
    expiry_datetime: Optional[str] = None
    order_date: Optional[str] = None


class RemandDetailCreateData(BaseModel):
    remand_id: str


class RemandDetailCreateResponse(BaseModel):
    success: bool
    message: str
    data: RemandDetailCreateData


class RemandDetailListResponse(BaseModel):
    remand_details: List[RemandDetailSummary]


class RemandDetailDetailResponse(RemandDetailSummary):
    pass


class RemandDetailUpdateResponse(BaseModel):
    success: bool
    message: str
    data: RemandDetailCreateData


class RemandDetailDeleteResponse(BaseModel):
    success: bool
    message: str


@router.post(
    "",
    response_model=RemandDetailCreateResponse,
    summary="Create a remand detail",
    description="Create a new remand detail record associated with a case and accused.",
    tags=["remand-details"],
)
def create_remand_detail(payload: RemandDetailCreate) -> Dict[str, Any]:
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
        
        remand_detail = RemandDetail(
            case_id=payload.case_id,
            accused_id=accused.accused_id,
            remand_days=payload.remand_days,
            custody_type=payload.custody_type,
            grounds=payload.grounds,
            expiry_datetime=payload.expiry_datetime,
            order_date=payload.order_date
        )
        
        db.add(remand_detail)
        db.commit()
        db.refresh(remand_detail)
        
        return {
            "success": True,
            "message": "Remand detail created successfully",
            "data": {
                "remand_id": str(remand_detail.remand_id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create remand detail: {str(e)}")
    finally:
        db.close()


@router.get(
    "",
    response_model=RemandDetailListResponse,
    summary="List remand details",
    description="Retrieve all remand detail records in the system.",
    tags=["remand-details"],
)
def get_all_remand_details() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        remand_details = db.query(RemandDetail).all()
        return {
            "remand_details": [
                {
                    "remand_id": str(r.remand_id),
                    "case_id": r.case_id,
                    "accused_id": str(r.accused_id) if r.accused_id else None,
                    "remand_days": r.remand_days,
                    "custody_type": r.custody_type,
                    "grounds": r.grounds,
                    "expiry_datetime": r.expiry_datetime.isoformat() if r.expiry_datetime else None,
                    "order_date": r.order_date.isoformat() if r.order_date else None
                }
                for r in remand_details
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve remand details: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{remand_id}",
    response_model=RemandDetailDetailResponse,
    summary="Get remand detail",
    description="Retrieve a single remand detail record by its identifier.",
    tags=["remand-details"],
)
def get_remand_detail(remand_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        remand_detail = db.query(RemandDetail).filter(RemandDetail.remand_id == uuid.UUID(remand_id)).first()
        if not remand_detail:
            raise HTTPException(status_code=404, detail="Remand detail not found")
        
        return {
            "remand_id": str(remand_detail.remand_id),
            "case_id": remand_detail.case_id,
            "accused_id": str(remand_detail.accused_id) if remand_detail.accused_id else None,
            "remand_days": remand_detail.remand_days,
            "custody_type": remand_detail.custody_type,
            "grounds": remand_detail.grounds,
            "expiry_datetime": remand_detail.expiry_datetime.isoformat() if remand_detail.expiry_datetime else None,
            "order_date": remand_detail.order_date.isoformat() if remand_detail.order_date else None
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid remand_id format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve remand detail: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{remand_id}",
    response_model=RemandDetailUpdateResponse,
    summary="Update a remand detail",
    description="Partially update an existing remand detail record.",
    tags=["remand-details"],
)
def update_remand_detail(remand_id: str, payload: RemandDetailUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        remand_detail = db.query(RemandDetail).filter(RemandDetail.remand_id == uuid.UUID(remand_id)).first()
        if not remand_detail:
            raise HTTPException(status_code=404, detail="Remand detail not found")
        
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
            remand_detail.case_id = payload.case_id
        if payload.accused_id is not None:
            remand_detail.accused_id = uuid.UUID(payload.accused_id)
        if payload.remand_days is not None:
            remand_detail.remand_days = payload.remand_days
        if payload.custody_type is not None:
            remand_detail.custody_type = payload.custody_type
        if payload.grounds is not None:
            remand_detail.grounds = payload.grounds
        if payload.expiry_datetime is not None:
            remand_detail.expiry_datetime = payload.expiry_datetime
        if payload.order_date is not None:
            remand_detail.order_date = payload.order_date
        
        db.commit()
        db.refresh(remand_detail)
        
        return {
            "success": True,
            "message": "Remand detail updated successfully",
            "data": {
                "remand_id": str(remand_detail.remand_id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update remand detail: {str(e)}")
    finally:
        db.close()


@router.delete(
    "/{remand_id}",
    response_model=RemandDetailDeleteResponse,
    summary="Delete a remand detail",
    description="Remove a remand detail record from the system.",
    tags=["remand-details"],
)
def delete_remand_detail(remand_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        remand_detail = db.query(RemandDetail).filter(RemandDetail.remand_id == uuid.UUID(remand_id)).first()
        if not remand_detail:
            raise HTTPException(status_code=404, detail="Remand detail not found")
        
        db.delete(remand_detail)
        db.commit()
        
        return {
            "success": True,
            "message": "Remand detail deleted successfully"
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid remand_id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete remand detail: {str(e)}")
    finally:
        db.close()
