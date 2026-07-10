import os
import uuid
from pathlib import Path
from typing import Any, Dict, List

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


@router.post("/submit")
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


@router.post("/upload")
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
