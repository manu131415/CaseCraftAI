import os
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from urllib.parse import urlparse

from database.db import SessionLocal
from models.complaint import Complaint

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

cloudinary_url = os.getenv("CLOUDINARY_URL")
if cloudinary_url:
    parsed = urlparse(cloudinary_url)
    cloudinary.config(cloud_name=parsed.netloc.split("@")[-1], secure=True)
else:
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME") or "dpla4pwiw",
        api_key=os.getenv("CLOUDINARY_API_KEY") or "566231367534642",
        api_secret=os.getenv("CLOUDINARY_API_SECRET") or "Ybst8w8oBvtLx59aUFgdKAaoTyg",
        secure=True,
    )

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


class ComplaintSubmission(BaseModel):
    complaintType: str = ""
    category: str = ""
    priority: str = ""
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
    complainant_father_name: Optional[str] = None
    complainant_address: Optional[str] = None
    incident_datetime: Optional[datetime] = None
    incident_location: Optional[str] = None
    address: Optional[str] = None


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
    complainant_father_name: Optional[str] = None
    complainant_address: Optional[str] = None
    incident_datetime: Optional[str] = None
    incident_location: Optional[str] = None
    address: Optional[str] = None


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
            status="Pending",
            complainant_father_name=complainant_data.get("father_name"),
            complainant_address=complainant_data.get("address"),
            incident_datetime=datetime.fromisoformat(payload.incidentDate) if payload.incidentDate else None,
            incident_location=payload.location,
            address=complainant_data.get("address")
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
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                    "complainant_father_name": c.complainant_father_name,
                    "complainant_address": c.complainant_address,
                    "incident_datetime": c.incident_datetime.isoformat() if c.incident_datetime else None,
                    "incident_location": c.incident_location,
                    "address": c.address
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
            "created_at": complaint.created_at.isoformat() if complaint.created_at else None,
            "complainant_father_name": complaint.complainant_father_name,
            "complainant_address": complaint.complainant_address,
            "incident_datetime": complaint.incident_datetime.isoformat() if complaint.incident_datetime else None,
            "incident_location": complaint.incident_location,
            "address": complaint.address
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
        if payload.complainant_father_name is not None:
            complaint.complainant_father_name = payload.complainant_father_name
        if payload.complainant_address is not None:
            complaint.complainant_address = payload.complainant_address
        if payload.incident_datetime is not None:
            complaint.incident_datetime = payload.incident_datetime
        if payload.incident_location is not None:
            complaint.incident_location = payload.incident_location
        if payload.address is not None:
            complaint.address = payload.address
        
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


@router.post(
    "/upload",
    response_model=UploadDocumentResponse,
    summary="Upload a document",
    description="Upload a complaint-related file and process it through the configured ingestion pipeline.",
    tags=["complaints"],
)
async def upload_document(file: UploadFile = File(...)) -> Dict[str, Any]:
    file_bytes = await file.read()
    file_path = UPLOAD_DIR / f"{uuid.uuid4()}_{file.filename or 'upload'}"
    file_path.write_bytes(file_bytes)

    content_type = file.content_type or ""
    result: Dict[str, Any] = {"message": "File received but no extraction pipeline is configured for this type."}

    try:
        if content_type.startswith("image/"):
            from app.services.ingestion.image_service import process_image
            result = process_image(str(file_path))
        elif file_path.suffix.lower() == ".pdf":
            from app.services.ingestion.pdf_service import process_pdf
            result = process_pdf(str(file_path))
        elif content_type.startswith("audio/") or file_path.suffix.lower() in {".wav", ".mp3", ".m4a", ".ogg"}:
            from app.services.ingestion.audio_service import extract_audio_text
            result = extract_audio_text(str(file_path))
    except Exception as exc:
        result = {"error": str(exc)}

    try:
        upload_result = cloudinary.uploader.upload(str(file_path), folder="casecraft/complaints")
    except Exception:
        upload_result = None

    return {
        "fileName": file.filename,
        "fileType": content_type,
        "storedPath": str(file_path),
        "cloudinaryUrl": upload_result.get("secure_url") if upload_result else None,
        "extraction": result,
    }
