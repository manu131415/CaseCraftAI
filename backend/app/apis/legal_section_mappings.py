import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import SessionLocal
from models.legal_section_mappings import LegalSectionMapping


router = APIRouter(prefix="/api/legal-section-mappings", tags=["legal-section-mappings"])


class LegalSectionMappingCreate(BaseModel):
    act_pair: str
    new_act: str
    old_act: str
    new_section: str
    old_section: Optional[str] = None
    subject: Optional[str] = None
    summary_of_comparison: Optional[str] = None


class LegalSectionMappingUpdate(BaseModel):
    act_pair: Optional[str] = None
    new_act: Optional[str] = None
    old_act: Optional[str] = None
    new_section: Optional[str] = None
    old_section: Optional[str] = None
    subject: Optional[str] = None
    summary_of_comparison: Optional[str] = None


class LegalSectionMappingSummary(BaseModel):
    id: int
    act_pair: Optional[str] = None
    new_act: Optional[str] = None
    old_act: Optional[str] = None
    new_section: Optional[str] = None
    old_section: Optional[str] = None
    subject: Optional[str] = None
    summary_of_comparison: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class LegalSectionMappingCreateData(BaseModel):
    id: int


class LegalSectionMappingCreateResponse(BaseModel):
    success: bool
    message: str
    data: LegalSectionMappingCreateData


class LegalSectionMappingListResponse(BaseModel):
    legal_section_mappings: List[LegalSectionMappingSummary]


class LegalSectionMappingDetailResponse(LegalSectionMappingSummary):
    pass


class LegalSectionMappingUpdateResponse(BaseModel):
    success: bool
    message: str
    data: LegalSectionMappingCreateData


class LegalSectionMappingDeleteResponse(BaseModel):
    success: bool
    message: str


@router.post(
    "",
    response_model=LegalSectionMappingCreateResponse,
    summary="Create a legal section mapping",
    description="Create a new legal section mapping record.",
    tags=["legal-section-mappings"],
)
def create_legal_section_mapping(payload: LegalSectionMappingCreate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        legal_section_mapping = LegalSectionMapping(
            act_pair=payload.act_pair,
            new_act=payload.new_act,
            old_act=payload.old_act,
            new_section=payload.new_section,
            old_section=payload.old_section,
            subject=payload.subject,
            summary_of_comparison=payload.summary_of_comparison
        )
        
        db.add(legal_section_mapping)
        db.commit()
        db.refresh(legal_section_mapping)
        
        return {
            "success": True,
            "message": "Legal section mapping created successfully",
            "data": {
                "id": legal_section_mapping.id
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create legal section mapping: {str(e)}")
    finally:
        db.close()


@router.get(
    "",
    response_model=LegalSectionMappingListResponse,
    summary="List legal section mappings",
    description="Retrieve all legal section mapping records.",
    tags=["legal-section-mappings"],
)
def get_all_legal_section_mappings() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        legal_section_mappings = db.query(LegalSectionMapping).all()
        return {
            "legal_section_mappings": [
                {
                    "id": lsm.id,
                    "act_pair": lsm.act_pair,
                    "new_act": lsm.new_act,
                    "old_act": lsm.old_act,
                    "new_section": lsm.new_section,
                    "old_section": lsm.old_section,
                    "subject": lsm.subject,
                    "summary_of_comparison": lsm.summary_of_comparison,
                    "created_at": lsm.created_at.isoformat() if lsm.created_at else None,
                    "updated_at": lsm.updated_at.isoformat() if lsm.updated_at else None
                }
                for lsm in legal_section_mappings
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve legal section mappings: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{id}",
    response_model=LegalSectionMappingDetailResponse,
    summary="Get legal section mapping",
    description="Retrieve a single legal section mapping record by its identifier.",
    tags=["legal-section-mappings"],
)
def get_legal_section_mapping(id: int) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        legal_section_mapping = db.query(LegalSectionMapping).filter(LegalSectionMapping.id == id).first()
        if not legal_section_mapping:
            raise HTTPException(status_code=404, detail="Legal section mapping not found")
        
        return {
            "id": legal_section_mapping.id,
            "act_pair": legal_section_mapping.act_pair,
            "new_act": legal_section_mapping.new_act,
            "old_act": legal_section_mapping.old_act,
            "new_section": legal_section_mapping.new_section,
            "old_section": legal_section_mapping.old_section,
            "subject": legal_section_mapping.subject,
            "summary_of_comparison": legal_section_mapping.summary_of_comparison,
            "created_at": legal_section_mapping.created_at.isoformat() if legal_section_mapping.created_at else None,
            "updated_at": legal_section_mapping.updated_at.isoformat() if legal_section_mapping.updated_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve legal section mapping: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{id}",
    response_model=LegalSectionMappingUpdateResponse,
    summary="Update a legal section mapping",
    description="Partially update an existing legal section mapping record.",
    tags=["legal-section-mappings"],
)
def update_legal_section_mapping(id: int, payload: LegalSectionMappingUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        legal_section_mapping = db.query(LegalSectionMapping).filter(LegalSectionMapping.id == id).first()
        if not legal_section_mapping:
            raise HTTPException(status_code=404, detail="Legal section mapping not found")
        
        # Update only provided fields
        if payload.act_pair is not None:
            legal_section_mapping.act_pair = payload.act_pair
        if payload.new_act is not None:
            legal_section_mapping.new_act = payload.new_act
        if payload.old_act is not None:
            legal_section_mapping.old_act = payload.old_act
        if payload.new_section is not None:
            legal_section_mapping.new_section = payload.new_section
        if payload.old_section is not None:
            legal_section_mapping.old_section = payload.old_section
        if payload.subject is not None:
            legal_section_mapping.subject = payload.subject
        if payload.summary_of_comparison is not None:
            legal_section_mapping.summary_of_comparison = payload.summary_of_comparison
        
        db.commit()
        db.refresh(legal_section_mapping)
        
        return {
            "success": True,
            "message": "Legal section mapping updated successfully",
            "data": {
                "id": legal_section_mapping.id
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update legal section mapping: {str(e)}")
    finally:
        db.close()


@router.delete(
    "/{id}",
    response_model=LegalSectionMappingDeleteResponse,
    summary="Delete a legal section mapping",
    description="Remove a legal section mapping record from the system.",
    tags=["legal-section-mappings"],
)
def delete_legal_section_mapping(id: int) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        legal_section_mapping = db.query(LegalSectionMapping).filter(LegalSectionMapping.id == id).first()
        if not legal_section_mapping:
            raise HTTPException(status_code=404, detail="Legal section mapping not found")
        
        db.delete(legal_section_mapping)
        db.commit()
        
        return {
            "success": True,
            "message": "Legal section mapping deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete legal section mapping: {str(e)}")
    finally:
        db.close()
