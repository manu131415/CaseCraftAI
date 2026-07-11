import json
import os
import tempfile
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import text
from urllib.parse import urlparse

import database.init_db  # noqa: F401
from database.db import SessionLocal

# ===========================
# NEW IMPORTS
# ===========================

from app.services.mapper.complaint_mapper import (
    map_pdf,
    map_image,
    map_audio,
)

# ===========================
# Load ENV
# ===========================

from database.db import SessionLocal
from models.complaint import Complaint

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

cloudinary_url = os.getenv("CLOUDINARY_URL")

if cloudinary_url:
    parsed = urlparse(cloudinary_url)

    cloudinary.config(
        cloud_name=parsed.hostname or "",
        api_key=parsed.username or "",
        api_secret=parsed.password or "",
        secure=True,
    )

else:

    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )

router = APIRouter(
    prefix="/api/complaints",
    tags=["complaints"],
)

# ============================================================
# Complaint Submission Model
# ============================================================


class ComplaintSubmission(BaseModel):

    complaintType: str = ""

    category: str = ""

    priority: str = "Medium"

    incidentDate: str = ""

    incidentTime: str = ""

    location: str = ""

    description: str = ""

    aiSummary: str = ""

    officerNotes: str = ""

    complainants: List[Dict[str, Any]] = []

    victims: List[Dict[str, Any]] = []

    suspects: List[Dict[str, Any]] = []

    attachments: List[Dict[str, Any]] = []


class ComplaintUpdate(BaseModel):
    complainant_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    crime_type: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ComplaintSummary(BaseModel):
    complaint_id: str
    complainant_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    crime_type: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[str] = None


class ComplaintSubmissionData(BaseModel):
    complaint_id: str
    status: str
    created_at: Optional[str] = None


class ComplaintSubmissionResponse(BaseModel):
    success: bool
    message: str
    data: ComplaintSubmissionData


class ComplaintListResponse(BaseModel):
    complaints: List[ComplaintSummary]


class ComplaintDetailResponse(ComplaintSummary):
    pass


class ComplaintUpdateResponse(BaseModel):
    success: bool
    message: str
    data: ComplaintSubmissionData


class ComplaintDeleteResponse(BaseModel):
    success: bool
    message: str


class UploadDocumentResponse(BaseModel):
    fileName: Optional[str] = None
    fileType: str
    storedPath: str
    cloudinaryUrl: Optional[str] = None
    extraction: Dict[str, Any]


@router.post(
    "/submit",
    response_model=ComplaintSubmissionResponse,
    summary="Submit a complaint",
    description="Create a new complaint record from a submitted complaint payload.",
    tags=["complaints"],
)
def submit_complaint(payload: ComplaintSubmission) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # Extract complainant information from the list
        complainant_data = payload.complainants[0] if payload.complainants else {}
        
        complaint = Complaint(
            complaint_id=str(uuid.uuid4()),
            complainant_name=complainant_data.get("name"),
            phone=complainant_data.get("phone"),
            email=complainant_data.get("email"),
            crime_type=payload.complaintType,
            location=payload.location,
            description=payload.description,
            status="Pending"
        )
        
        db.add(complaint)
        db.commit()
        db.refresh(complaint)
        
        return {
            "success": True,
            "message": "Complaint submitted successfully",
            "data": {
                "complaint_id": complaint.complaint_id,
                "status": complaint.status,
                "created_at": complaint.created_at.isoformat() if complaint.created_at else None
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit complaint: {str(e)}")
    finally:
        db.close()


@router.get(
    "",
    response_model=ComplaintListResponse,
    summary="List complaints",
    description="Retrieve all complaints available in the system.",
    tags=["complaints"],
)
def get_all_complaints() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        complaints = db.query(Complaint).all()
        return {
            "complaints": [
                {
                    "complaint_id": c.complaint_id,
                    "complainant_name": c.complainant_name,
                    "phone": c.phone,
                    "email": c.email,
                    "crime_type": c.crime_type,
                    "location": c.location,
                    "description": c.description,
                    "status": c.status,
                    "created_at": c.created_at.isoformat() if c.created_at else None
                }
                for c in complaints
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve complaints: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{complaint_id}",
    response_model=ComplaintDetailResponse,
    summary="Get complaint details",
    description="Retrieve a single complaint by its identifier.",
    tags=["complaints"],
)
def get_complaint(complaint_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        return {
            "complaint_id": complaint.complaint_id,
            "complainant_name": complaint.complainant_name,
            "phone": complaint.phone,
            "email": complaint.email,
            "crime_type": complaint.crime_type,
            "location": complaint.location,
            "description": complaint.description,
            "status": complaint.status,
            "created_at": complaint.created_at.isoformat() if complaint.created_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve complaint: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{complaint_id}",
    response_model=ComplaintUpdateResponse,
    summary="Update a complaint",
    description="Partially update an existing complaint record.",
    tags=["complaints"],
)
def update_complaint(complaint_id: str, payload: ComplaintUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Update only provided fields
        if payload.complainant_name is not None:
            complaint.complainant_name = payload.complainant_name
        if payload.phone is not None:
            complaint.phone = payload.phone
        if payload.email is not None:
            complaint.email = payload.email
        if payload.crime_type is not None:
            complaint.crime_type = payload.crime_type
        if payload.location is not None:
            complaint.location = payload.location
        if payload.description is not None:
            complaint.description = payload.description
        if payload.status is not None:
            complaint.status = payload.status
        
        db.commit()
        db.refresh(complaint)
        
        return {
            "success": True,
            "message": "Complaint updated successfully",
            "data": {
                "complaint_id": complaint.complaint_id,
                "status": complaint.status,
                "created_at": complaint.created_at.isoformat() if complaint.created_at else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update complaint: {str(e)}")
    finally:
        db.close()


@router.delete(
    "/{complaint_id}",
    response_model=ComplaintDeleteResponse,
    summary="Delete a complaint",
    description="Remove an existing complaint record from the system.",
    tags=["complaints"],
)
def delete_complaint(complaint_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        db.delete(complaint)
        db.commit()
        
        return {
            "success": True,
            "message": "Complaint deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete complaint: {str(e)}")
    finally:
        db.close()

    #             VALUES(

    #                 :id,

    #                 :source_type,

    #                 :media_url,

    #                 :raw_text,

    #                 :extracted,

    #                 :embedding,

    #                 :status,

    #                 NOW(),

    #                 NOW()

    #             )
    #             """
    #         ),

    #         {

    #             "id": complaint_id,

    #             "source_type": "text",

    #             "media_url": json.dumps(payload.attachments),

    #             "raw_text": payload.description,

    #             "extracted": json.dumps(complaint_payload),

    #             "embedding": None,

    #             "status": "ingested",

    #         },
    #     )

    #     session.commit()

    #     return {

    #         "success": True,

    #         "message": "Complaint saved successfully",

    #         "complaintId": complaint_id,

    #         "evidenceCount": len(payload.attachments),

    #     }

    # except Exception as e:

    #     session.rollback()

    #     raise HTTPException(
    #         status_code=500,
    #         detail=str(e),
    #     )

    # finally:

    #     session.close()

# ============================================================
# UPLOAD + AI EXTRACTION
# ============================================================

@router.post(
    "/upload",
    response_model=UploadDocumentResponse,
    summary="Upload a document",
    description="Upload a complaint-related file and process it through the configured ingestion pipeline.",
    tags=["complaints"],
)
async def upload_document(file: UploadFile = File(...)) -> Dict[str, Any]:

    file_bytes = await file.read()

    content_type = file.content_type or ""

    extension = Path(file.filename or "").suffix.lower()

    # -------------------------------
    # Save temporarily
    # -------------------------------

    temp = tempfile.NamedTemporaryFile(
        suffix=extension,
        delete=False
    )

    temp.write(file_bytes)
    temp.close()

    temp_path = temp.name

    raw_ai = {}

    extraction = {}

    upload_result = None

    try:

        # ===========================================
        # IMAGE
        # ===========================================

        if content_type.startswith("image/"):

            from app.services.ingestion.image_service import process_image

            raw_ai = process_image(temp_path)

            extraction = map_image(raw_ai)

        # ===========================================
        # PDF
        # ===========================================

        elif extension == ".pdf":

            from app.services.ingestion.pdf_service import process_pdf

            raw_ai = process_pdf(temp_path)

            extraction = map_pdf(raw_ai)

        # ===========================================
        # AUDIO
        # ===========================================

        elif (
            content_type.startswith("audio/")
            or extension in [
                ".wav",
                ".mp3",
                ".m4a",
                ".ogg",
            ]
        ):

            from app.services.ingestion.audio_service import (
                extract_audio_text,
            )

            raw_ai = extract_audio_text(temp_path)

            extraction = map_audio(raw_ai)

        else:

            raise HTTPException(
                status_code=400,
                detail="Unsupported file type",
            )

        # ===========================================
        # Upload Original File to Cloudinary
        # ===========================================

        try:

            upload_result = cloudinary.uploader.upload(
                file_bytes,
                folder="casecraft/complaints",
                resource_type="auto",
            )

        except Exception as e:

            print("[Cloudinary Error]", e)

            upload_result = None

    except Exception as e:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    finally:

        try:
            os.remove(temp_path)
        except Exception:
            pass

    # ===========================================
    # Response
    # ===========================================

    return {

        "success": True,

        "fileName": file.filename,

        "fileType": content_type,

        "cloudinaryUrl":
            upload_result.get("secure_url")
            if upload_result
            else None,

        # ⭐ This is what frontend fills the form with
        "extraction": extraction,

        # ⭐ This is full Gemini response
        "raw_ai": raw_ai,

    }