import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import SessionLocal
from models.witness import Witness
from models.case import Case


router = APIRouter(prefix="/api/witnesses", tags=["witnesses"])


class WitnessCreate(BaseModel):
    case_id: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    statement: Optional[str] = None


class WitnessUpdate(BaseModel):
    case_id: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    statement: Optional[str] = None


class WitnessSummary(BaseModel):
    witness_id: str
    case_id: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    statement: Optional[str] = None


class WitnessCreateData(BaseModel):
    witness_id: str


class WitnessCreateResponse(BaseModel):
    success: bool
    message: str
    data: WitnessCreateData


class WitnessListResponse(BaseModel):
    witnesses: List[WitnessSummary]


class WitnessDetailResponse(WitnessSummary):
    pass


class WitnessUpdateResponse(BaseModel):
    success: bool
    message: str
    data: WitnessCreateData


class WitnessDeleteResponse(BaseModel):
    success: bool
    message: str


@router.post(
    "",
    response_model=WitnessCreateResponse,
    summary="Create a witness",
    description="Create a new witness record associated with a case.",
    tags=["witnesses"],
)
def create_witness(payload: WitnessCreate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # Verify case exists
        case = db.query(Case).filter(Case.case_id == payload.case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        witness = Witness(
            case_id=payload.case_id,
            full_name=payload.full_name,
            phone=payload.phone,
            address=payload.address,
            statement=payload.statement
        )
        
        db.add(witness)
        db.commit()
        db.refresh(witness)
        
        return {
            "success": True,
            "message": "Witness created successfully",
            "data": {
                "witness_id": str(witness.witness_id)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create witness: {str(e)}")
    finally:
        db.close()


@router.get(
    "",
    response_model=WitnessListResponse,
    summary="List witnesses",
    description="Retrieve all witness records in the system.",
    tags=["witnesses"],
)
def get_all_witnesses() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        witnesses = db.query(Witness).all()
        return {
            "witnesses": [
                {
                    "witness_id": str(w.witness_id),
                    "case_id": w.case_id,
                    "full_name": w.full_name,
                    "phone": w.phone,
                    "address": w.address,
                    "statement": w.statement
                }
                for w in witnesses
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve witnesses: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{witness_id}",
    response_model=WitnessDetailResponse,
    summary="Get witness details",
    description="Retrieve a single witness record by its identifier.",
    tags=["witnesses"],
)
def get_witness(witness_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        witness = db.query(Witness).filter(Witness.witness_id == uuid.UUID(witness_id)).first()
        if not witness:
            raise HTTPException(status_code=404, detail="Witness not found")
        
        return {
            "witness_id": str(witness.witness_id),
            "case_id": witness.case_id,
            "full_name": witness.full_name,
            "phone": witness.phone,
            "address": witness.address,
            "statement": witness.statement
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid witness_id format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve witness: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{witness_id}",
    response_model=WitnessUpdateResponse,
    summary="Update a witness",
    description="Partially update an existing witness record.",
    tags=["witnesses"],
)
def update_witness(witness_id: str, payload: WitnessUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        witness = db.query(Witness).filter(Witness.witness_id == uuid.UUID(witness_id)).first()
        if not witness:
            raise HTTPException(status_code=404, detail="Witness not found")
        
        # Verify case exists if case_id is being updated
        if payload.case_id is not None:
            case = db.query(Case).filter(Case.case_id == payload.case_id).first()
            if not case:
                raise HTTPException(status_code=404, detail="Case not found")
        
        # Update only provided fields
        if payload.case_id is not None:
            witness.case_id = payload.case_id
        if payload.full_name is not None:
            witness.full_name = payload.full_name
        if payload.phone is not None:
            witness.phone = payload.phone
        if payload.address is not None:
            witness.address = payload.address
        if payload.statement is not None:
            witness.statement = payload.statement
        
        db.commit()
        db.refresh(witness)
        
        return {
            "success": True,
            "message": "Witness updated successfully",
            "data": {
                "witness_id": str(witness.witness_id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid witness_id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update witness: {str(e)}")
    finally:
        db.close()


@router.delete(
    "/{witness_id}",
    response_model=WitnessDeleteResponse,
    summary="Delete a witness",
    description="Remove a witness record from the system.",
    tags=["witnesses"],
)
def delete_witness(witness_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        witness = db.query(Witness).filter(Witness.witness_id == uuid.UUID(witness_id)).first()
        if not witness:
            raise HTTPException(status_code=404, detail="Witness not found")
        
        db.delete(witness)
        db.commit()
        
        return {
            "success": True,
            "message": "Witness deleted successfully"
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid witness_id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete witness: {str(e)}")
    finally:
        db.close()
