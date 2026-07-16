import uuid
from datetime import datetime, date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import SessionLocal
from models.accused import Accused
from models.case import Case


router = APIRouter(prefix="/api/accused", tags=["accused"])


class AccusedCreate(BaseModel):
    case_id: str
    full_name: str
    alias: Optional[str] = None
    father_name: Optional[str] = None
    age: Optional[int] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    permanent_address: Optional[str] = None
    present_address: Optional[str] = None
    arrest_datetime: Optional[datetime] = None
    custody_status: Optional[str] = None
    identification_marks: Optional[str] = None
    face_shape: Optional[str] = None
    complexion: Optional[str] = None
    eye_color: Optional[str] = None
    eye_structure: Optional[str] = None
    hair_type: Optional[str] = None
    hair_color: Optional[str] = None
    front_photo: Optional[str] = None
    left_profile_photo: Optional[str] = None
    right_profile_photo: Optional[str] = None
    capture_date: Optional[date] = None


class AccusedUpdate(BaseModel):
    case_id: Optional[str] = None
    full_name: Optional[str] = None
    alias: Optional[str] = None
    father_name: Optional[str] = None
    age: Optional[int] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    permanent_address: Optional[str] = None
    present_address: Optional[str] = None
    arrest_datetime: Optional[datetime] = None
    custody_status: Optional[str] = None
    identification_marks: Optional[str] = None
    face_shape: Optional[str] = None
    complexion: Optional[str] = None
    eye_color: Optional[str] = None
    eye_structure: Optional[str] = None
    hair_type: Optional[str] = None
    hair_color: Optional[str] = None
    front_photo: Optional[str] = None
    left_profile_photo: Optional[str] = None
    right_profile_photo: Optional[str] = None
    capture_date: Optional[date] = None


class AccusedSummary(BaseModel):
    accused_id: str
    case_id: Optional[str] = None
    full_name: Optional[str] = None
    alias: Optional[str] = None
    father_name: Optional[str] = None
    age: Optional[int] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    permanent_address: Optional[str] = None
    present_address: Optional[str] = None
    arrest_datetime: Optional[str] = None
    custody_status: Optional[str] = None
    identification_marks: Optional[str] = None
    created_at: Optional[str] = None
    face_shape: Optional[str] = None
    complexion: Optional[str] = None
    eye_color: Optional[str] = None
    eye_structure: Optional[str] = None
    hair_type: Optional[str] = None
    hair_color: Optional[str] = None
    front_photo: Optional[str] = None
    left_profile_photo: Optional[str] = None
    right_profile_photo: Optional[str] = None
    capture_date: Optional[str] = None


class AccusedCreateData(BaseModel):
    accused_id: str
    created_at: Optional[str] = None


class AccusedCreateResponse(BaseModel):
    success: bool
    message: str
    data: AccusedCreateData


class AccusedListResponse(BaseModel):
    accused: List[AccusedSummary]


class AccusedDetailResponse(AccusedSummary):
    pass


class AccusedUpdateResponse(BaseModel):
    success: bool
    message: str
    data: AccusedCreateData


class AccusedDeleteResponse(BaseModel):
    success: bool
    message: str


@router.post(
    "",
    response_model=AccusedCreateResponse,
    summary="Create an accused",
    description="Create a new accused record associated with a case.",
    tags=["accused"],
)
def create_accused(payload: AccusedCreate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # Verify case exists
        case = db.query(Case).filter(Case.case_id == payload.case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        accused = Accused(
            case_id=payload.case_id,
            full_name=payload.full_name,
            alias=payload.alias,
            father_name=payload.father_name,
            age=payload.age,
            dob=payload.dob,
            gender=payload.gender,
            permanent_address=payload.permanent_address,
            present_address=payload.present_address,
            arrest_datetime=payload.arrest_datetime,
            custody_status=payload.custody_status,
            identification_marks=payload.identification_marks,
            face_shape=payload.face_shape,
            complexion=payload.complexion,
            eye_color=payload.eye_color,
            eye_structure=payload.eye_structure,
            hair_type=payload.hair_type,
            hair_color=payload.hair_color,
            front_photo=payload.front_photo,
            left_profile_photo=payload.left_profile_photo,
            right_profile_photo=payload.right_profile_photo,
            capture_date=payload.capture_date
        )
        
        db.add(accused)
        db.commit()
        db.refresh(accused)
        
        return {
            "success": True,
            "message": "Accused created successfully",
            "data": {
                "accused_id": str(accused.accused_id),
                "created_at": accused.created_at.isoformat() if accused.created_at else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create accused: {str(e)}")
    finally:
        db.close()


@router.get(
    "",
    response_model=AccusedListResponse,
    summary="List accused",
    description="Retrieve all accused records in the system.",
    tags=["accused"],
)
def get_all_accused() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        accused_list = db.query(Accused).all()
        return {
            "accused": [
                {
                    "accused_id": str(a.accused_id),
                    "case_id": a.case_id,
                    "full_name": a.full_name,
                    "alias": a.alias,
                    "father_name": a.father_name,
                    "age": a.age,
                    "dob": a.dob.isoformat() if a.dob else None,
                    "gender": a.gender,
                    "permanent_address": a.permanent_address,
                    "present_address": a.present_address,
                    "arrest_datetime": a.arrest_datetime.isoformat() if a.arrest_datetime else None,
                    "custody_status": a.custody_status,
                    "identification_marks": a.identification_marks,
                    "created_at": a.created_at.isoformat() if a.created_at else None,
                    "face_shape": a.face_shape,
                    "complexion": a.complexion,
                    "eye_color": a.eye_color,
                    "eye_structure": a.eye_structure,
                    "hair_type": a.hair_type,
                    "hair_color": a.hair_color,
                    "front_photo": a.front_photo,
                    "left_profile_photo": a.left_profile_photo,
                    "right_profile_photo": a.right_profile_photo,
                    "capture_date": a.capture_date.isoformat() if a.capture_date else None
                }
                for a in accused_list
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve accused: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{accused_id}",
    response_model=AccusedDetailResponse,
    summary="Get accused details",
    description="Retrieve a single accused record by its identifier.",
    tags=["accused"],
)
def get_accused(accused_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        accused = db.query(Accused).filter(Accused.accused_id == uuid.UUID(accused_id)).first()
        if not accused:
            raise HTTPException(status_code=404, detail="Accused not found")
        
        return {
            "accused_id": str(accused.accused_id),
            "case_id": accused.case_id,
            "full_name": accused.full_name,
            "alias": accused.alias,
            "father_name": accused.father_name,
            "age": accused.age,
            "dob": accused.dob.isoformat() if accused.dob else None,
            "gender": accused.gender,
            "permanent_address": accused.permanent_address,
            "present_address": accused.present_address,
            "arrest_datetime": accused.arrest_datetime.isoformat() if accused.arrest_datetime else None,
            "custody_status": accused.custody_status,
            "identification_marks": accused.identification_marks,
            "created_at": accused.created_at.isoformat() if accused.created_at else None,
            "face_shape": accused.face_shape,
            "complexion": accused.complexion,
            "eye_color": accused.eye_color,
            "eye_structure": accused.eye_structure,
            "hair_type": accused.hair_type,
            "hair_color": accused.hair_color,
            "front_photo": accused.front_photo,
            "left_profile_photo": accused.left_profile_photo,
            "right_profile_photo": accused.right_profile_photo,
            "capture_date": accused.capture_date.isoformat() if accused.capture_date else None
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid accused_id format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve accused: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{accused_id}",
    response_model=AccusedUpdateResponse,
    summary="Update an accused",
    description="Partially update an existing accused record.",
    tags=["accused"],
)
def update_accused(accused_id: str, payload: AccusedUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        accused = db.query(Accused).filter(Accused.accused_id == uuid.UUID(accused_id)).first()
        if not accused:
            raise HTTPException(status_code=404, detail="Accused not found")
        
        # Verify case exists if case_id is being updated
        if payload.case_id is not None:
            case = db.query(Case).filter(Case.case_id == payload.case_id).first()
            if not case:
                raise HTTPException(status_code=404, detail="Case not found")
        
        # Update only provided fields
        if payload.case_id is not None:
            accused.case_id = payload.case_id
        if payload.full_name is not None:
            accused.full_name = payload.full_name
        if payload.alias is not None:
            accused.alias = payload.alias
        if payload.father_name is not None:
            accused.father_name = payload.father_name
        if payload.age is not None:
            accused.age = payload.age
        if payload.dob is not None:
            accused.dob = payload.dob
        if payload.gender is not None:
            accused.gender = payload.gender
        if payload.permanent_address is not None:
            accused.permanent_address = payload.permanent_address
        if payload.present_address is not None:
            accused.present_address = payload.present_address
        if payload.arrest_datetime is not None:
            accused.arrest_datetime = payload.arrest_datetime
        if payload.custody_status is not None:
            accused.custody_status = payload.custody_status
        if payload.identification_marks is not None:
            accused.identification_marks = payload.identification_marks
        if payload.face_shape is not None:
            accused.face_shape = payload.face_shape
        if payload.complexion is not None:
            accused.complexion = payload.complexion
        if payload.eye_color is not None:
            accused.eye_color = payload.eye_color
        if payload.eye_structure is not None:
            accused.eye_structure = payload.eye_structure
        if payload.hair_type is not None:
            accused.hair_type = payload.hair_type
        if payload.hair_color is not None:
            accused.hair_color = payload.hair_color
        if payload.front_photo is not None:
            accused.front_photo = payload.front_photo
        if payload.left_profile_photo is not None:
            accused.left_profile_photo = payload.left_profile_photo
        if payload.right_profile_photo is not None:
            accused.right_profile_photo = payload.right_profile_photo
        if payload.capture_date is not None:
            accused.capture_date = payload.capture_date
        
        db.commit()
        db.refresh(accused)
        
        return {
            "success": True,
            "message": "Accused updated successfully",
            "data": {
                "accused_id": str(accused.accused_id),
                "created_at": accused.created_at.isoformat() if accused.created_at else None
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid accused_id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update accused: {str(e)}")
    finally:
        db.close()


@router.delete(
    "/{accused_id}",
    response_model=AccusedDeleteResponse,
    summary="Delete an accused",
    description="Remove an accused record from the system.",
    tags=["accused"],
)
def delete_accused(accused_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        accused = db.query(Accused).filter(Accused.accused_id == uuid.UUID(accused_id)).first()
        if not accused:
            raise HTTPException(status_code=404, detail="Accused not found")
        
        db.delete(accused)
        db.commit()
        
        return {
            "success": True,
            "message": "Accused deleted successfully"
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid accused_id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete accused: {str(e)}")
    finally:
        db.close()
