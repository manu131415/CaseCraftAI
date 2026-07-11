import uuid
from datetime import date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import SessionLocal
from models.victim import Victim
from models.case import Case


router = APIRouter(prefix="/api/victims", tags=["victims"])


class VictimCreate(BaseModel):
    case_id: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    injuries: Optional[str] = None


class VictimUpdate(BaseModel):
    case_id: Optional[str] = None
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    injuries: Optional[str] = None


class VictimSummary(BaseModel):
    victim_id: str
    case_id: Optional[str] = None
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    injuries: Optional[str] = None


class VictimCreateData(BaseModel):
    victim_id: str


class VictimCreateResponse(BaseModel):
    success: bool
    message: str
    data: VictimCreateData


class VictimListResponse(BaseModel):
    victims: List[VictimSummary]


class VictimDetailResponse(VictimSummary):
    pass


class VictimUpdateResponse(BaseModel):
    success: bool
    message: str
    data: VictimCreateData


class VictimDeleteResponse(BaseModel):
    success: bool
    message: str


@router.post(
    "",
    response_model=VictimCreateResponse,
    summary="Create a victim",
    description="Create a new victim record associated with a case.",
    tags=["victims"],
)
def create_victim(payload: VictimCreate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # Verify case exists
        case = db.query(Case).filter(Case.case_id == payload.case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        victim = Victim(
            case_id=payload.case_id,
            full_name=payload.full_name,
            age=payload.age,
            gender=payload.gender,
            address=payload.address,
            injuries=payload.injuries
        )
        
        db.add(victim)
        db.commit()
        db.refresh(victim)
        
        return {
            "success": True,
            "message": "Victim created successfully",
            "data": {
                "victim_id": str(victim.victim_id)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create victim: {str(e)}")
    finally:
        db.close()


@router.get(
    "",
    response_model=VictimListResponse,
    summary="List victims",
    description="Retrieve all victim records in the system.",
    tags=["victims"],
)
def get_all_victims() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        victims = db.query(Victim).all()
        return {
            "victims": [
                {
                    "victim_id": str(v.victim_id),
                    "case_id": v.case_id,
                    "full_name": v.full_name,
                    "age": v.age,
                    "gender": v.gender,
                    "address": v.address,
                    "injuries": v.injuries
                }
                for v in victims
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve victims: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{victim_id}",
    response_model=VictimDetailResponse,
    summary="Get victim details",
    description="Retrieve a single victim record by its identifier.",
    tags=["victims"],
)
def get_victim(victim_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        victim = db.query(Victim).filter(Victim.victim_id == uuid.UUID(victim_id)).first()
        if not victim:
            raise HTTPException(status_code=404, detail="Victim not found")
        
        return {
            "victim_id": str(victim.victim_id),
            "case_id": victim.case_id,
            "full_name": victim.full_name,
            "age": victim.age,
            "gender": victim.gender,
            "address": victim.address,
            "injuries": victim.injuries
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid victim_id format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve victim: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{victim_id}",
    response_model=VictimUpdateResponse,
    summary="Update a victim",
    description="Partially update an existing victim record.",
    tags=["victims"],
)
def update_victim(victim_id: str, payload: VictimUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        victim = db.query(Victim).filter(Victim.victim_id == uuid.UUID(victim_id)).first()
        if not victim:
            raise HTTPException(status_code=404, detail="Victim not found")
        
        # Verify case exists if case_id is being updated
        if payload.case_id is not None:
            case = db.query(Case).filter(Case.case_id == payload.case_id).first()
            if not case:
                raise HTTPException(status_code=404, detail="Case not found")
        
        # Update only provided fields
        if payload.case_id is not None:
            victim.case_id = payload.case_id
        if payload.full_name is not None:
            victim.full_name = payload.full_name
        if payload.age is not None:
            victim.age = payload.age
        if payload.gender is not None:
            victim.gender = payload.gender
        if payload.address is not None:
            victim.address = payload.address
        if payload.injuries is not None:
            victim.injuries = payload.injuries
        
        db.commit()
        db.refresh(victim)
        
        return {
            "success": True,
            "message": "Victim updated successfully",
            "data": {
                "victim_id": str(victim.victim_id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid victim_id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update victim: {str(e)}")
    finally:
        db.close()


@router.delete(
    "/{victim_id}",
    response_model=VictimDeleteResponse,
    summary="Delete a victim",
    description="Remove a victim record from the system.",
    tags=["victims"],
)
def delete_victim(victim_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        victim = db.query(Victim).filter(Victim.victim_id == uuid.UUID(victim_id)).first()
        if not victim:
            raise HTTPException(status_code=404, detail="Victim not found")
        
        db.delete(victim)
        db.commit()
        
        return {
            "success": True,
            "message": "Victim deleted successfully"
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid victim_id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete victim: {str(e)}")
    finally:
        db.close()
