import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import SessionLocal
from models.case_legal_sections import CaseLegalSection
from models.case import Case
from models.legal_sections import LegalSection


router = APIRouter(prefix="/api/case-legal-sections", tags=["case-legal-sections"])


class CaseLegalSectionCreate(BaseModel):
    case_id: str
    legal_section_id: str


class CaseLegalSectionUpdate(BaseModel):
    case_id: Optional[str] = None
    legal_section_id: Optional[str] = None


class CaseLegalSectionSummary(BaseModel):
    id: str
    case_id: Optional[str] = None
    legal_section_id: Optional[str] = None


class CaseLegalSectionCreateData(BaseModel):
    id: str


class CaseLegalSectionCreateResponse(BaseModel):
    success: bool
    message: str
    data: CaseLegalSectionCreateData


class CaseLegalSectionListResponse(BaseModel):
    case_legal_sections: List[CaseLegalSectionSummary]


class CaseLegalSectionDetailResponse(CaseLegalSectionSummary):
    pass


class CaseLegalSectionUpdateResponse(BaseModel):
    success: bool
    message: str
    data: CaseLegalSectionCreateData


class CaseLegalSectionDeleteResponse(BaseModel):
    success: bool
    message: str


@router.post(
    "",
    response_model=CaseLegalSectionCreateResponse,
    summary="Create a case legal section",
    description="Associate a legal section with a case.",
    tags=["case-legal-sections"],
)
def create_case_legal_section(payload: CaseLegalSectionCreate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # Verify case exists
        case = db.query(Case).filter(Case.case_id == payload.case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Verify legal section exists
        legal_section = db.query(LegalSection).filter(LegalSection.id == uuid.UUID(payload.legal_section_id)).first()
        if not legal_section:
            raise HTTPException(status_code=404, detail="Legal section not found")
        
        case_legal_section = CaseLegalSection(
            case_id=payload.case_id,
            legal_section_id=legal_section.id
        )
        
        db.add(case_legal_section)
        db.commit()
        db.refresh(case_legal_section)
        
        return {
            "success": True,
            "message": "Case legal section created successfully",
            "data": {
                "id": str(case_legal_section.id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create case legal section: {str(e)}")
    finally:
        db.close()


@router.get(
    "",
    response_model=CaseLegalSectionListResponse,
    summary="List case legal sections",
    description="Retrieve all case legal section associations.",
    tags=["case-legal-sections"],
)
def get_all_case_legal_sections() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        case_legal_sections = db.query(CaseLegalSection).all()
        return {
            "case_legal_sections": [
                {
                    "id": str(cls.id),
                    "case_id": cls.case_id,
                    "legal_section_id": str(cls.legal_section_id) if cls.legal_section_id else None
                }
                for cls in case_legal_sections
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve case legal sections: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{id}",
    response_model=CaseLegalSectionDetailResponse,
    summary="Get case legal section",
    description="Retrieve a single case legal section association by its identifier.",
    tags=["case-legal-sections"],
)
def get_case_legal_section(id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        case_legal_section = db.query(CaseLegalSection).filter(CaseLegalSection.id == uuid.UUID(id)).first()
        if not case_legal_section:
            raise HTTPException(status_code=404, detail="Case legal section not found")
        
        return {
            "id": str(case_legal_section.id),
            "case_id": case_legal_section.case_id,
            "legal_section_id": str(case_legal_section.legal_section_id) if case_legal_section.legal_section_id else None
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid id format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve case legal section: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{id}",
    response_model=CaseLegalSectionUpdateResponse,
    summary="Update a case legal section",
    description="Partially update an existing case legal section association.",
    tags=["case-legal-sections"],
)
def update_case_legal_section(id: str, payload: CaseLegalSectionUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        case_legal_section = db.query(CaseLegalSection).filter(CaseLegalSection.id == uuid.UUID(id)).first()
        if not case_legal_section:
            raise HTTPException(status_code=404, detail="Case legal section not found")
        
        # Verify case exists if case_id is being updated
        if payload.case_id is not None:
            case = db.query(Case).filter(Case.case_id == payload.case_id).first()
            if not case:
                raise HTTPException(status_code=404, detail="Case not found")
        
        # Verify legal section exists if legal_section_id is being updated
        if payload.legal_section_id is not None:
            legal_section = db.query(LegalSection).filter(LegalSection.id == uuid.UUID(payload.legal_section_id)).first()
            if not legal_section:
                raise HTTPException(status_code=404, detail="Legal section not found")
        
        # Update only provided fields
        if payload.case_id is not None:
            case_legal_section.case_id = payload.case_id
        if payload.legal_section_id is not None:
            case_legal_section.legal_section_id = uuid.UUID(payload.legal_section_id)
        
        db.commit()
        db.refresh(case_legal_section)
        
        return {
            "success": True,
            "message": "Case legal section updated successfully",
            "data": {
                "id": str(case_legal_section.id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update case legal section: {str(e)}")
    finally:
        db.close()


@router.delete(
    "/{id}",
    response_model=CaseLegalSectionDeleteResponse,
    summary="Delete a case legal section",
    description="Remove a case legal section association from the system.",
    tags=["case-legal-sections"],
)
def delete_case_legal_section(id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        case_legal_section = db.query(CaseLegalSection).filter(CaseLegalSection.id == uuid.UUID(id)).first()
        if not case_legal_section:
            raise HTTPException(status_code=404, detail="Case legal section not found")
        
        db.delete(case_legal_section)
        db.commit()
        
        return {
            "success": True,
            "message": "Case legal section deleted successfully"
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete case legal section: {str(e)}")
    finally:
        db.close()
