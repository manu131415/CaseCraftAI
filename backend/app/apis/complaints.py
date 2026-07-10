import json
import os
import tempfile
import uuid
from pathlib import Path
from typing import Any, Dict, List
from urllib.parse import urlparse

import cloudinary
import cloudinary.uploader

from dotenv import load_dotenv
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import text

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


# ============================================================
# GET ALL COMPLAINTS
# ============================================================


@router.get("/")
def list_complaints() -> List[Dict[str, Any]]:

    session = SessionLocal()

    try:

        rows = session.execute(
            text(
                """
                SELECT
                    id,
                    source_type,
                    media_url,
                    raw_text,
                    extracted,
                    status,
                    created_at
                FROM complaints
                ORDER BY created_at DESC
                """
            )
        ).mappings().all()

        complaints = []

        for row in rows:

            complaints.append(
                {
                    "complaintId": str(row["id"]),
                    "complaintType": row["source_type"],
                    "category": "complaint",
                    "location": "",
                    "description": row["raw_text"],
                    "status": row["status"],
                    "createdAt": str(row["created_at"]),
                }
            )

        return complaints

    finally:

        session.close()


# ============================================================
# SUBMIT COMPLAINT
# ============================================================


@router.post("/submit")
def submit_complaint(payload: ComplaintSubmission):

    complaint_id = str(uuid.uuid4())

    session = SessionLocal()

    try:

        first_complainant = (
            payload.complainants[0]
            if payload.complainants
            else {}
        )

        complaint_payload = {

            "complaintId": complaint_id,

            "complaintType": payload.complaintType,

            "category": payload.category,

            "priority": payload.priority,

            "incidentDate": payload.incidentDate,

            "incidentTime": payload.incidentTime,

            "location": payload.location,

            "description": payload.description,

            "aiSummary": payload.aiSummary,

            "officerNotes": payload.officerNotes,

            "complainants": payload.complainants,

            "victims": payload.victims,

            "suspects": payload.suspects,

            "attachments": payload.attachments,

            "complainantName": first_complainant.get("name", ""),

            "complainantContact": first_complainant.get("contact", ""),
        }

        session.execute(

            text(
                """
                INSERT INTO complaints(

                    id,

                    source_type,

                    media_url,

                    raw_text,

                    extracted,

                    embedding,

                    status,

                    created_at,

                    updated_at

                )

                VALUES(

                    :id,

                    :source_type,

                    :media_url,

                    :raw_text,

                    :extracted,

                    :embedding,

                    :status,

                    NOW(),

                    NOW()

                )
                """
            ),

            {

                "id": complaint_id,

                "source_type": "text",

                "media_url": json.dumps(payload.attachments),

                "raw_text": payload.description,

                "extracted": json.dumps(complaint_payload),

                "embedding": None,

                "status": "ingested",

            },
        )

        session.commit()

        return {

            "success": True,

            "message": "Complaint saved successfully",

            "complaintId": complaint_id,

            "evidenceCount": len(payload.attachments),

        }

    except Exception as e:

        session.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    finally:

        session.close()

# ============================================================
# UPLOAD + AI EXTRACTION
# ============================================================

@router.post("/upload")
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