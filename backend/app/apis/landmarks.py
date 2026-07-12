import uuid
from datetime import datetime, date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import SessionLocal
from models.landmarks import Landmark


router = APIRouter(prefix="/api/landmarks", tags=["landmarks"])


class LandmarkCreate(BaseModel):
    case_id: Optional[int] = None
    case_title: Optional[str] = None
    court: Optional[str] = None
    case_date: Optional[date] = None
    judge: Optional[str] = None
    ipc_sections: Optional[str] = None
    bail_type: Optional[str] = None
    bail_cancellation_case: Optional[bool] = None
    is_landmark: Optional[bool] = None
    accused_gender: Optional[str] = None
    prior_cases: Optional[str] = None
    bail_outcome: Optional[str] = None
    bail_outcome_detailed: Optional[str] = None
    crime_type: Optional[str] = None
    facts: Optional[str] = None
    legal_issues: Optional[str] = None
    judgment_reason: Optional[str] = None
    summary: Optional[str] = None
    bias_flag: Optional[bool] = None
    parity_argument_used: Optional[bool] = None
    legal_principles_discussed: Optional[str] = None
    region: Optional[str] = None
    special_laws: Optional[str] = None
    source_filename: Optional[str] = None
    embedding: List[float]


class LandmarkUpdate(BaseModel):
    case_id: Optional[int] = None
    case_title: Optional[str] = None
    court: Optional[str] = None
    case_date: Optional[date] = None
    judge: Optional[str] = None
    ipc_sections: Optional[str] = None
    bail_type: Optional[str] = None
    bail_cancellation_case: Optional[bool] = None
    is_landmark: Optional[bool] = None
    accused_gender: Optional[str] = None
    prior_cases: Optional[str] = None
    bail_outcome: Optional[str] = None
    bail_outcome_detailed: Optional[str] = None
    crime_type: Optional[str] = None
    facts: Optional[str] = None
    legal_issues: Optional[str] = None
    judgment_reason: Optional[str] = None
    summary: Optional[str] = None
    bias_flag: Optional[bool] = None
    parity_argument_used: Optional[bool] = None
    legal_principles_discussed: Optional[str] = None
    region: Optional[str] = None
    special_laws: Optional[str] = None
    source_filename: Optional[str] = None
    embedding: Optional[List[float]] = None


class LandmarkSummary(BaseModel):
    id: str
    case_id: Optional[int] = None
    case_title: Optional[str] = None
    court: Optional[str] = None
    case_date: Optional[str] = None
    judge: Optional[str] = None
    ipc_sections: Optional[str] = None
    bail_type: Optional[str] = None
    bail_cancellation_case: Optional[bool] = None
    is_landmark: Optional[bool] = None
    accused_gender: Optional[str] = None
    prior_cases: Optional[str] = None
    bail_outcome: Optional[str] = None
    bail_outcome_detailed: Optional[str] = None
    crime_type: Optional[str] = None
    facts: Optional[str] = None
    legal_issues: Optional[str] = None
    judgment_reason: Optional[str] = None
    summary: Optional[str] = None
    bias_flag: Optional[bool] = None
    parity_argument_used: Optional[bool] = None
    legal_principles_discussed: Optional[str] = None
    region: Optional[str] = None
    special_laws: Optional[str] = None
    source_filename: Optional[str] = None
    created_at: Optional[str] = None


class LandmarkCreateData(BaseModel):
    id: str


class LandmarkCreateResponse(BaseModel):
    success: bool
    message: str
    data: LandmarkCreateData


class LandmarkListResponse(BaseModel):
    landmarks: List[LandmarkSummary]


class LandmarkDetailResponse(LandmarkSummary):
    pass


class LandmarkUpdateResponse(BaseModel):
    success: bool
    message: str
    data: LandmarkCreateData


class LandmarkDeleteResponse(BaseModel):
    success: bool
    message: str


@router.post(
    "",
    response_model=LandmarkCreateResponse,
    summary="Create a landmark",
    description="Create a new landmark case record.",
    tags=["landmarks"],
)
def create_landmark(payload: LandmarkCreate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        landmark = Landmark(
            case_id=payload.case_id,
            case_title=payload.case_title,
            court=payload.court,
            case_date=payload.case_date,
            judge=payload.judge,
            ipc_sections=payload.ipc_sections,
            bail_type=payload.bail_type,
            bail_cancellation_case=payload.bail_cancellation_case,
            is_landmark=payload.is_landmark,
            accused_gender=payload.accused_gender,
            prior_cases=payload.prior_cases,
            bail_outcome=payload.bail_outcome,
            bail_outcome_detailed=payload.bail_outcome_detailed,
            crime_type=payload.crime_type,
            facts=payload.facts,
            legal_issues=payload.legal_issues,
            judgment_reason=payload.judgment_reason,
            summary=payload.summary,
            bias_flag=payload.bias_flag,
            parity_argument_used=payload.parity_argument_used,
            legal_principles_discussed=payload.legal_principles_discussed,
            region=payload.region,
            special_laws=payload.special_laws,
            source_filename=payload.source_filename,
            embedding=payload.embedding
        )
        
        db.add(landmark)
        db.commit()
        db.refresh(landmark)
        
        return {
            "success": True,
            "message": "Landmark created successfully",
            "data": {
                "id": str(landmark.id)
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create landmark: {str(e)}")
    finally:
        db.close()


@router.get(
    "",
    response_model=LandmarkListResponse,
    summary="List landmarks",
    description="Retrieve all landmark case records.",
    tags=["landmarks"],
)
def get_all_landmarks() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        landmarks = db.query(Landmark).all()
        return {
            "landmarks": [
                {
                    "id": str(l.id),
                    "case_id": l.case_id,
                    "case_title": l.case_title,
                    "court": l.court,
                    "case_date": l.case_date.isoformat() if l.case_date else None,
                    "judge": l.judge,
                    "ipc_sections": l.ipc_sections,
                    "bail_type": l.bail_type,
                    "bail_cancellation_case": l.bail_cancellation_case,
                    "is_landmark": l.is_landmark,
                    "accused_gender": l.accused_gender,
                    "prior_cases": l.prior_cases,
                    "bail_outcome": l.bail_outcome,
                    "bail_outcome_detailed": l.bail_outcome_detailed,
                    "crime_type": l.crime_type,
                    "facts": l.facts,
                    "legal_issues": l.legal_issues,
                    "judgment_reason": l.judgment_reason,
                    "summary": l.summary,
                    "bias_flag": l.bias_flag,
                    "parity_argument_used": l.parity_argument_used,
                    "legal_principles_discussed": l.legal_principles_discussed,
                    "region": l.region,
                    "special_laws": l.special_laws,
                    "source_filename": l.source_filename,
                    "created_at": l.created_at.isoformat() if l.created_at else None
                }
                for l in landmarks
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve landmarks: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{id}",
    response_model=LandmarkDetailResponse,
    summary="Get landmark",
    description="Retrieve a single landmark case record by its identifier.",
    tags=["landmarks"],
)
def get_landmark(id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        landmark = db.query(Landmark).filter(Landmark.id == uuid.UUID(id)).first()
        if not landmark:
            raise HTTPException(status_code=404, detail="Landmark not found")
        
        return {
            "id": str(landmark.id),
            "case_id": landmark.case_id,
            "case_title": landmark.case_title,
            "court": landmark.court,
            "case_date": landmark.case_date.isoformat() if landmark.case_date else None,
            "judge": landmark.judge,
            "ipc_sections": landmark.ipc_sections,
            "bail_type": landmark.bail_type,
            "bail_cancellation_case": landmark.bail_cancellation_case,
            "is_landmark": landmark.is_landmark,
            "accused_gender": landmark.accused_gender,
            "prior_cases": landmark.prior_cases,
            "bail_outcome": landmark.bail_outcome,
            "bail_outcome_detailed": landmark.bail_outcome_detailed,
            "crime_type": landmark.crime_type,
            "facts": landmark.facts,
            "legal_issues": landmark.legal_issues,
            "judgment_reason": landmark.judgment_reason,
            "summary": landmark.summary,
            "bias_flag": landmark.bias_flag,
            "parity_argument_used": landmark.parity_argument_used,
            "legal_principles_discussed": landmark.legal_principles_discussed,
            "region": landmark.region,
            "special_laws": landmark.special_laws,
            "source_filename": landmark.source_filename,
            "created_at": landmark.created_at.isoformat() if landmark.created_at else None
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid id format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve landmark: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{id}",
    response_model=LandmarkUpdateResponse,
    summary="Update a landmark",
    description="Partially update an existing landmark case record.",
    tags=["landmarks"],
)
def update_landmark(id: str, payload: LandmarkUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        landmark = db.query(Landmark).filter(Landmark.id == uuid.UUID(id)).first()
        if not landmark:
            raise HTTPException(status_code=404, detail="Landmark not found")
        
        # Update only provided fields
        if payload.case_id is not None:
            landmark.case_id = payload.case_id
        if payload.case_title is not None:
            landmark.case_title = payload.case_title
        if payload.court is not None:
            landmark.court = payload.court
        if payload.case_date is not None:
            landmark.case_date = payload.case_date
        if payload.judge is not None:
            landmark.judge = payload.judge
        if payload.ipc_sections is not None:
            landmark.ipc_sections = payload.ipc_sections
        if payload.bail_type is not None:
            landmark.bail_type = payload.bail_type
        if payload.bail_cancellation_case is not None:
            landmark.bail_cancellation_case = payload.bail_cancellation_case
        if payload.is_landmark is not None:
            landmark.is_landmark = payload.is_landmark
        if payload.accused_gender is not None:
            landmark.accused_gender = payload.accused_gender
        if payload.prior_cases is not None:
            landmark.prior_cases = payload.prior_cases
        if payload.bail_outcome is not None:
            landmark.bail_outcome = payload.bail_outcome
        if payload.bail_outcome_detailed is not None:
            landmark.bail_outcome_detailed = payload.bail_outcome_detailed
        if payload.crime_type is not None:
            landmark.crime_type = payload.crime_type
        if payload.facts is not None:
            landmark.facts = payload.facts
        if payload.legal_issues is not None:
            landmark.legal_issues = payload.legal_issues
        if payload.judgment_reason is not None:
            landmark.judgment_reason = payload.judgment_reason
        if payload.summary is not None:
            landmark.summary = payload.summary
        if payload.bias_flag is not None:
            landmark.bias_flag = payload.bias_flag
        if payload.parity_argument_used is not None:
            landmark.parity_argument_used = payload.parity_argument_used
        if payload.legal_principles_discussed is not None:
            landmark.legal_principles_discussed = payload.legal_principles_discussed
        if payload.region is not None:
            landmark.region = payload.region
        if payload.special_laws is not None:
            landmark.special_laws = payload.special_laws
        if payload.source_filename is not None:
            landmark.source_filename = payload.source_filename
        if payload.embedding is not None:
            landmark.embedding = payload.embedding
        
        db.commit()
        db.refresh(landmark)
        
        return {
            "success": True,
            "message": "Landmark updated successfully",
            "data": {
                "id": str(landmark.id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update landmark: {str(e)}")
    finally:
        db.close()


@router.delete(
    "/{id}",
    response_model=LandmarkDeleteResponse,
    summary="Delete a landmark",
    description="Remove a landmark case record from the system.",
    tags=["landmarks"],
)
def delete_landmark(id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        landmark = db.query(Landmark).filter(Landmark.id == uuid.UUID(id)).first()
        if not landmark:
            raise HTTPException(status_code=404, detail="Landmark not found")
        
        db.delete(landmark)
        db.commit()
        
        return {
            "success": True,
            "message": "Landmark deleted successfully"
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete landmark: {str(e)}")
    finally:
        db.close()
