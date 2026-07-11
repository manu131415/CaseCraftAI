import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import SessionLocal
from models.recommendations import Recommendation
from models.legal_sections import LegalSection


router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


class RecommendationCreate(BaseModel):
    complaint_id: str
    legal_section_id: str
    similarity_score: Optional[float] = None
    confidence: Optional[str] = None
    reasoning: Optional[str] = None
    officer_decision: Optional[str] = "pending"


class RecommendationUpdate(BaseModel):
    complaint_id: Optional[str] = None
    legal_section_id: Optional[str] = None
    similarity_score: Optional[float] = None
    confidence: Optional[str] = None
    reasoning: Optional[str] = None
    officer_decision: Optional[str] = None


class RecommendationSummary(BaseModel):
    id: str
    complaint_id: str
    legal_section_id: str
    similarity_score: Optional[float] = None
    confidence: Optional[str] = None
    reasoning: Optional[str] = None
    officer_decision: Optional[str] = None
    created_at: Optional[str] = None


class RecommendationCreateData(BaseModel):
    id: str


class RecommendationCreateResponse(BaseModel):
    success: bool
    message: str
    data: RecommendationCreateData


class RecommendationListResponse(BaseModel):
    recommendations: List[RecommendationSummary]


class RecommendationDetailResponse(RecommendationSummary):
    pass


class RecommendationUpdateResponse(BaseModel):
    success: bool
    message: str
    data: RecommendationCreateData


class RecommendationDeleteResponse(BaseModel):
    success: bool
    message: str


@router.post(
    "",
    response_model=RecommendationCreateResponse,
    summary="Create a recommendation",
    description="Create a new AI recommendation for a complaint.",
    tags=["recommendations"],
)
def create_recommendation(payload: RecommendationCreate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # Verify legal section exists
        legal_section = db.query(LegalSection).filter(LegalSection.id == uuid.UUID(payload.legal_section_id)).first()
        if not legal_section:
            raise HTTPException(status_code=404, detail="Legal section not found")
        
        recommendation = Recommendation(
            complaint_id=uuid.UUID(payload.complaint_id),
            legal_section_id=legal_section.id,
            similarity_score=payload.similarity_score,
            confidence=payload.confidence,
            reasoning=payload.reasoning,
            officer_decision=payload.officer_decision
        )
        
        db.add(recommendation)
        db.commit()
        db.refresh(recommendation)
        
        return {
            "success": True,
            "message": "Recommendation created successfully",
            "data": {
                "id": str(recommendation.id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create recommendation: {str(e)}")
    finally:
        db.close()


@router.get(
    "",
    response_model=RecommendationListResponse,
    summary="List recommendations",
    description="Retrieve all recommendation records.",
    tags=["recommendations"],
)
def get_all_recommendations() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        recommendations = db.query(Recommendation).all()
        return {
            "recommendations": [
                {
                    "id": str(r.id),
                    "complaint_id": str(r.complaint_id),
                    "legal_section_id": str(r.legal_section_id),
                    "similarity_score": r.similarity_score,
                    "confidence": r.confidence,
                    "reasoning": r.reasoning,
                    "officer_decision": r.officer_decision,
                    "created_at": r.created_at.isoformat() if r.created_at else None
                }
                for r in recommendations
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve recommendations: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{id}",
    response_model=RecommendationDetailResponse,
    summary="Get recommendation",
    description="Retrieve a single recommendation record by its identifier.",
    tags=["recommendations"],
)
def get_recommendation(id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        recommendation = db.query(Recommendation).filter(Recommendation.id == uuid.UUID(id)).first()
        if not recommendation:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        return {
            "id": str(recommendation.id),
            "complaint_id": str(recommendation.complaint_id),
            "legal_section_id": str(recommendation.legal_section_id),
            "similarity_score": recommendation.similarity_score,
            "confidence": recommendation.confidence,
            "reasoning": recommendation.reasoning,
            "officer_decision": recommendation.officer_decision,
            "created_at": recommendation.created_at.isoformat() if recommendation.created_at else None
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid id format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve recommendation: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{id}",
    response_model=RecommendationUpdateResponse,
    summary="Update a recommendation",
    description="Partially update an existing recommendation record.",
    tags=["recommendations"],
)
def update_recommendation(id: str, payload: RecommendationUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        recommendation = db.query(Recommendation).filter(Recommendation.id == uuid.UUID(id)).first()
        if not recommendation:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        # Verify legal section exists if legal_section_id is being updated
        if payload.legal_section_id is not None:
            legal_section = db.query(LegalSection).filter(LegalSection.id == uuid.UUID(payload.legal_section_id)).first()
            if not legal_section:
                raise HTTPException(status_code=404, detail="Legal section not found")
        
        # Update only provided fields
        if payload.complaint_id is not None:
            recommendation.complaint_id = uuid.UUID(payload.complaint_id)
        if payload.legal_section_id is not None:
            recommendation.legal_section_id = uuid.UUID(payload.legal_section_id)
        if payload.similarity_score is not None:
            recommendation.similarity_score = payload.similarity_score
        if payload.confidence is not None:
            recommendation.confidence = payload.confidence
        if payload.reasoning is not None:
            recommendation.reasoning = payload.reasoning
        if payload.officer_decision is not None:
            recommendation.officer_decision = payload.officer_decision
        
        db.commit()
        db.refresh(recommendation)
        
        return {
            "success": True,
            "message": "Recommendation updated successfully",
            "data": {
                "id": str(recommendation.id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update recommendation: {str(e)}")
    finally:
        db.close()


@router.delete(
    "/{id}",
    response_model=RecommendationDeleteResponse,
    summary="Delete a recommendation",
    description="Remove a recommendation record from the system.",
    tags=["recommendations"],
)
def delete_recommendation(id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        recommendation = db.query(Recommendation).filter(Recommendation.id == uuid.UUID(id)).first()
        if not recommendation:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        db.delete(recommendation)
        db.commit()
        
        return {
            "success": True,
            "message": "Recommendation deleted successfully"
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete recommendation: {str(e)}")
    finally:
        db.close()
