import json
import os
import tempfile
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import cloudinary
import cloudinary.uploader
from sqlalchemy import text
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

import database.init_db  # noqa: F401
from database.db import SessionLocal

# ===========================
# MODEL IMPORTS
# ===========================

from models.complaint import Complaint
from models.victim import Victim
from models.suspect import Suspects
from models.evidence import Evidence
from models.document import Document
from models.case import Case
from models.case_diary import CaseDiary
from models.officer import Officer

# ===========================
# SERVICE IMPORTS
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
# Pydantic Models for Request/Response
# ============================================================


class ComplaintInfo(BaseModel):
    complaintTitle: str = ""
    crimeCategory: str = ""
    crimeSubcategory: str = ""
    priority: str = "Medium"
    complaintMode: str = "Walk-In"
    incidentDate: str = ""
    incidentTime: str = ""
    location: str = ""
    landmark: str = ""
    emergency: str = "No"
    description: str = ""
    officerNotes: str = ""
    
    # Complainant details
    complainantName: str = ""
    complainantFatherName: str = ""
    complainantAge: str = ""
    complainantGender: str = ""
    complainantPhone: str = ""
    complainantEmail: str = ""
    complainantAddress: str = ""
    complainantAadhaar: str = ""
    complainantRelationship: str = ""
    complainantOccupation: str = ""
    complainantNationality: str = ""
    complainantPhotoUrl: str = ""
    complainantPhotoName: str = ""
    
    # For backward compatibility
    aiSummary: str = ""


class VictimData(BaseModel):
    fullName: str = ""
    age: str = ""
    gender: str = ""
    phone: str = ""
    address: str = ""
    injuries: str = ""
    photoUrl: str = ""
    photoName: str = ""


class SuspectData(BaseModel):
    fullName: str = ""
    alias: str = ""
    fatherName: str = ""
    age: str = ""
    dob: str = ""
    gender: str = ""
    permanentAddress: str = ""
    presentAddress: str = ""
    identificationMarks: str = ""
    faceShape: str = ""
    complexion: str = ""
    eyeColor: str = ""
    eyeStructure: str = ""
    hairType: str = ""
    hairColor: str = ""
    unknownIdentity: bool = False
    photoUrl: str = ""
    photoName: str = ""


class AttachmentData(BaseModel):
    id: str = ""
    fileName: str = ""
    fileType: str = ""
    documentUrl: str = ""


class ComplaintSubmission(BaseModel):
    complaint: ComplaintInfo
    victims: List[VictimData] = []
    suspects: List[SuspectData] = []
    attachments: List[AttachmentData] = []


class ComplaintUpdate(BaseModel):
    complainant_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    crime_category: Optional[str] = None
    crime_subcategory: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    complainant_father_name: Optional[str] = None
    complainant_address: Optional[str] = None


class ComplaintSummary(BaseModel):
    complaint_id: str
    complaint_number: str
    complainant_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    crime_category: Optional[str] = None
    crime_subcategory: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    is_draft: bool = True
    created_at: Optional[str] = None


class ComplaintSubmissionData(BaseModel):
    complaint_id: str
    complaint_number: str
    status: str
    is_draft: bool = True
    created_at: Optional[str] = None


class ComplaintSubmissionResponse(BaseModel):
    success: bool
    message: str
    data: ComplaintSubmissionData


class ComplaintListResponse(BaseModel):
    complaints: List[ComplaintSummary]


class ComplaintDetailResponse(ComplaintSummary):
    officerNotes: Optional[str] = None
    aiSummary: Optional[str] = None
    complainantFatherName: Optional[str] = None
    complainantAddress: Optional[str] = None
    
    victims: List[Dict[str, Any]] = []
    suspects: List[Dict[str, Any]] = []
    documents: List[Dict[str, Any]] = []


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


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def _parse_date(date_string: str) -> Optional[datetime]:
    """Parse a date string in ISO format."""
    if not date_string:
        return None
    try:
        return datetime.fromisoformat(date_string)
    except (ValueError, TypeError):
        return None


def _parse_age(age_str: str) -> Optional[int]:
    """Parse age string to integer."""
    if not age_str:
        return None
    try:
        return int(age_str)
    except (ValueError, TypeError):
        return None


def _create_victim_records(db, complaint_id: str, victims: List[VictimData]) -> List[Victim]:
    """Create victim records from submitted data."""
    created_victims = []
    
    for victim_data in victims:
        if victim_data.fullName:  # Only create if name is provided
            victim = Victim(
                complaint_id=complaint_id,
                full_name=victim_data.fullName,
                age=_parse_age(victim_data.age),
                gender=victim_data.gender,
                phone=victim_data.phone,
                address=victim_data.address,
                injuries=victim_data.injuries,
                photo_url=victim_data.photoUrl,
                photo_name=victim_data.photoName,
            )
            db.add(victim)
            created_victims.append(victim)
    
    return created_victims


def _create_suspect_records(db, complaint_id: str, suspects: List[SuspectData]) -> List[Suspects]:
    """Create suspect records from submitted data."""
    created_suspects = []
    
    for suspect_data in suspects:
        if suspect_data.fullName or suspect_data.unknownIdentity:  # Only create if name or unknown
            suspect = Suspects(
                complaint_id=complaint_id,
                full_name=suspect_data.fullName or None,
                alias=suspect_data.alias,
                father_name=suspect_data.fatherName,
                age=_parse_age(suspect_data.age),
                dob=_parse_date(suspect_data.dob) if suspect_data.dob else None,
                gender=suspect_data.gender,
                unknown_identity=suspect_data.unknownIdentity,
                permanent_address=suspect_data.permanentAddress,
                present_address=suspect_data.presentAddress,
                identification_marks=suspect_data.identificationMarks,
                face_shape=suspect_data.faceShape,
                complexion=suspect_data.complexion,
                eye_color=suspect_data.eyeColor,
                eye_structure=suspect_data.eyeStructure,
                hair_type=suspect_data.hairType,
                hair_color=suspect_data.hairColor,
                photo_url=suspect_data.photoUrl,
                photo_name=suspect_data.photoName,
            )
            db.add(suspect)
            created_suspects.append(suspect)
    
    return created_suspects


def _get_next_complaint_number(db) -> str:
    """Generate next complaint number."""
    year = datetime.now().year
    try:
        next_number = db.execute(
            text("SELECT nextval('complaint_number_seq')")
        ).scalar()
        return f"CMP-{year}-{next_number:06d}"
    except Exception:
        # Fallback if sequence doesn't exist
        count = db.query(Complaint).filter(
            Complaint.complaint_number.like(f"CMP-{year}-%")
        ).count()
        return f"CMP-{year}-{count + 1:06d}"


def _format_victim(victim: Victim) -> Dict[str, Any]:
    """Format victim record for response."""
    return {
        "victim_id": victim.victim_id,
        "complaint_id": victim.complaint_id,
        "fullName": victim.full_name,
        "age": victim.age,
        "gender": victim.gender,
        "phone": victim.phone,
        "address": victim.address,
        "injuries": victim.injuries,
        "photoUrl": victim.photo_url,
        "photoName": victim.photo_name,
    }


def _format_suspect(suspect: Suspects) -> Dict[str, Any]:
    """Format suspect record for response."""
    return {
        "suspect_id": suspect.suspect_id,
        "complaint_id": suspect.complaint_id,
        "fullName": suspect.full_name,
        "alias": suspect.alias,
        "fatherName": suspect.father_name,
        "age": suspect.age,
        "dob": suspect.dob.isoformat() if suspect.dob else None,
        "gender": suspect.gender,
        "unknownIdentity": suspect.unknown_identity,
        "permanentAddress": suspect.permanent_address,
        "presentAddress": suspect.present_address,
        "identificationMarks": suspect.identification_marks,
        "faceShape": suspect.face_shape,
        "complexion": suspect.complexion,
        "eyeColor": suspect.eye_color,
        "eyeStructure": suspect.eye_structure,
        "hairType": suspect.hair_type,
        "hairColor": suspect.hair_color,
        "photoUrl": suspect.photo_url,
        "photoName": suspect.photo_name,
    }


def _format_document(document: Document) -> Dict[str, Any]:
    """Format document record for response."""
    return {
        "document_id": document.document_id,
        "complaint_id": document.complaint_id,
        "fileName": document.file_name,
        "fileType": document.file_type,
        "filePath": document.file_path,
        "cloudinaryUrl": document.cloudinary_url,
        "extractedData": json.loads(document.extracted_data) if document.extracted_data else {},
    }


def _generate_case_number(complaint_number: str) -> str:
    """Create a deterministic case number for a newly created case."""
    year = datetime.now().year
    suffix = complaint_number.split("-")[-1] if complaint_number else str(uuid.uuid4())[:6].upper()
    return f"CASE-{year}-{suffix}"


def _get_assigned_officer_id(db) -> Optional[str]:
    """Pick the first available officer for auto-assignment."""
    officer = db.query(Officer).order_by(Officer.name).first()
    return officer.officer_id if officer else None


def _create_case_and_timeline_artifacts(
    db,
    complaint: Complaint,
    complaint_number: str,
    assigned_officer_id: Optional[str] = None,
) -> Case:
    """Create a case and the initial complaint/case timeline events."""
    officer_id = assigned_officer_id or _get_assigned_officer_id(db)
    case = Case(
        case_id=str(uuid.uuid4()),
        complaint_id=complaint.complaint_id,
        assigned_officer_id=officer_id,
        case_number=_generate_case_number(complaint_number),
        title=complaint.complaint_title or f"Case for {complaint_number}",
        status="Open",
        priority=complaint.priority or "Medium",
        description=complaint.description or "",
    )
    db.add(case)
    db.flush()

    timeline_entries = [
        CaseDiary(
            diary_id=str(uuid.uuid4()),
            case_id=case.case_id,
            officer_id=officer_id,
            action_type="complaint_registered",
            description=f"Complaint {complaint_number} was registered in the system.",
            occurred_at=datetime.utcnow(),
        ),
        CaseDiary(
            diary_id=str(uuid.uuid4()),
            case_id=case.case_id,
            officer_id=officer_id,
            action_type="case_created",
            description=f"Case {case.case_number} was created from complaint {complaint_number}.",
            occurred_at=datetime.utcnow(),
        ),
    ]
    for entry in timeline_entries:
        db.add(entry)
    db.flush()
    return case


# API ENDPOINTS
# ============================================================

@router.post(
    "/submit",
    response_model=ComplaintSubmissionResponse,
    summary="Submit a complaint",
    description="Create a new complaint record with victims, suspects, and documents.",
    tags=["complaints"],
)
def submit_complaint(payload: ComplaintSubmission) -> Dict[str, Any]:
    """Submit a complete complaint with all related data."""
    db = SessionLocal()
    try:
        complaint_data = payload.complaint
        
        # Generate complaint number
        complaint_number = _get_next_complaint_number(db)
        
        # Convert empty complainant_age to None, or to integer if valid
        complainant_age = None
        if complaint_data.complainantAge and complaint_data.complainantAge.strip():
            try:
                complainant_age = int(complaint_data.complainantAge)
            except (ValueError, TypeError):
                complainant_age = None
        
        # Create complaint record
        complaint = Complaint(
            complaint_id=str(uuid.uuid4()),
            complaint_number=complaint_number,
            complaint_title=complaint_data.complaintTitle,
            crime_category=complaint_data.crimeCategory,
            crime_subcategory=complaint_data.crimeSubcategory,
            priority=complaint_data.priority,
            complaint_mode=complaint_data.complaintMode,
            incident_date=complaint_data.incidentDate,
            incident_time=complaint_data.incidentTime,
            location=complaint_data.location,
            landmark=complaint_data.landmark,
            emergency=complaint_data.emergency,
            description=complaint_data.description,
            ai_summary=complaint_data.aiSummary,
            officer_notes=complaint_data.officerNotes,
            
            # Complainant details
            complainant_name=complaint_data.complainantName,
            complainant_father_name=complaint_data.complainantFatherName,
            complainant_age=complainant_age,
            complainant_gender=complaint_data.complainantGender,
            phone=complaint_data.complainantPhone,
            email=complaint_data.complainantEmail,
            complainant_address=complaint_data.complainantAddress,
            complainant_aadhaar=complaint_data.complainantAadhaar,
            complainant_relationship=complaint_data.complainantRelationship,
            complainant_occupation=complaint_data.complainantOccupation,
            complainant_nationality=complaint_data.complainantNationality,
            complainant_photo_url=complaint_data.complainantPhotoUrl,
            complainant_photo_name=complaint_data.complainantPhotoName,
            
            # Status
            status="Submitted",
            is_draft=False,
        )
        
        db.add(complaint)
        db.flush()  # Flush to get complaint_id without committing
        
        # Create victim records
        if payload.victims:
            _create_victim_records(db, complaint.complaint_id, payload.victims)
        
        # Create suspect records
        if payload.suspects:
            _create_suspect_records(db, complaint.complaint_id, payload.suspects)
        
        # Create evidence/document records from attachments
        for attachment in payload.attachments:
            if attachment.fileName:
                evidence = Evidence(
                    complaint_id=complaint.complaint_id,
                    evidence_type=attachment.fileType or "document",
                    file_name=attachment.fileName,
                    file_type=attachment.fileType,
                    file_path=attachment.documentUrl,
                    description="",
                )
                db.add(evidence)

        _create_case_and_timeline_artifacts(
            db,
            complaint,
            complaint_number,
        )
        
        db.commit()
        db.refresh(complaint)
        
        return {
            "success": True,
            "message": "Complaint submitted successfully",
            "data": {
                "complaint_id": complaint.complaint_id,
                "complaint_number": complaint.complaint_number,
                "status": complaint.status,
                "is_draft": complaint.is_draft,
                "created_at": complaint.created_at.isoformat() if complaint.created_at else None
            }
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit complaint: {str(e)}"
        )
    finally:
        db.close()


@router.post(
    "/save-draft",
    response_model=ComplaintSubmissionResponse,
    summary="Save complaint as draft",
    description="Create or update a complaint as draft without final submission.",
    tags=["complaints"],
)
def save_complaint_draft(payload: ComplaintSubmission) -> Dict[str, Any]:
    """Save complaint as draft."""
    db = SessionLocal()
    try:
        complaint_data = payload.complaint
        
        # Generate complaint number
        complaint_number = _get_next_complaint_number(db)
        
        # Create new draft
        complaint = Complaint(
            complaint_id=str(uuid.uuid4()),
            complaint_number=complaint_number,
            complaint_title=complaint_data.complaintTitle,
            crime_category=complaint_data.crimeCategory,
            crime_subcategory=complaint_data.crimeSubcategory,
            priority=complaint_data.priority,
            complaint_mode=complaint_data.complaintMode,
            incident_date=complaint_data.incidentDate,
            incident_time=complaint_data.incidentTime,
            location=complaint_data.location,
            landmark=complaint_data.landmark,
            emergency=complaint_data.emergency,
            description=complaint_data.description,
            ai_summary=complaint_data.aiSummary,
            officer_notes=complaint_data.officerNotes,
            complainant_name=complaint_data.complainantName,
            complainant_father_name=complaint_data.complainantFatherName,
            complainant_age=complaint_data.complainantAge,
            complainant_gender=complaint_data.complainantGender,
            phone=complaint_data.complainantPhone,
            email=complaint_data.complainantEmail,
            complainant_address=complaint_data.complainantAddress,
            complainant_aadhaar=complaint_data.complainantAadhaar,
            complainant_relationship=complaint_data.complainantRelationship,
            complainant_occupation=complaint_data.complainantOccupation,
            complainant_nationality=complaint_data.complainantNationality,
            complainant_photo_url=complaint_data.complainantPhotoUrl,
            complainant_photo_name=complaint_data.complainantPhotoName,
            status="Draft",
            is_draft=True,
        )
        
        db.add(complaint)
        db.flush()
        
        # Create victim records
        if payload.victims:
            _create_victim_records(db, complaint.complaint_id, payload.victims)
        
        # Create suspect records
        if payload.suspects:
            _create_suspect_records(db, complaint.complaint_id, payload.suspects)
        
        db.commit()
        db.refresh(complaint)
        
        return {
            "success": True,
            "message": "Complaint saved as draft successfully",
            "data": {
                "complaint_id": complaint.complaint_id,
                "complaint_number": complaint.complaint_number,
                "status": complaint.status,
                "is_draft": complaint.is_draft,
                "created_at": complaint.created_at.isoformat() if complaint.created_at else None
            }
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save draft: {str(e)}"
        )
    finally:
        db.close()


@router.post(
    "/submit-draft/{complaint_id}",
    response_model=ComplaintSubmissionResponse,
    summary="Submit a saved draft",
    description="Convert a draft complaint to submitted status.",
    tags=["complaints"],
)
def submit_draft_complaint(complaint_id: str, payload: ComplaintSubmission) -> Dict[str, Any]:
    """Submit a draft complaint."""
    db = SessionLocal()
    try:
        # Get existing complaint
        complaint = db.query(Complaint).filter(
            Complaint.complaint_id == complaint_id
        ).first()
        
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Update complaint with new data
        complaint_data = payload.complaint
        complaint.complaint_title = complaint_data.complaintTitle
        complaint.crime_category = complaint_data.crimeCategory
        complaint.crime_subcategory = complaint_data.crimeSubcategory
        complaint.priority = complaint_data.priority
        complaint.complaint_mode = complaint_data.complaintMode
        complaint.incident_date = complaint_data.incidentDate
        complaint.incident_time = complaint_data.incidentTime
        complaint.location = complaint_data.location
        complaint.landmark = complaint_data.landmark
        complaint.emergency = complaint_data.emergency
        complaint.description = complaint_data.description
        complaint.ai_summary = complaint_data.aiSummary
        complaint.officer_notes = complaint_data.officerNotes
        complaint.complainant_name = complaint_data.complainantName
        complaint.complainant_father_name = complaint_data.complainantFatherName
        complaint.complainant_age = complaint_data.complainantAge
        complaint.complainant_gender = complaint_data.complainantGender
        complaint.phone = complaint_data.complainantPhone
        complaint.email = complaint_data.complainantEmail
        complaint.complainant_address = complaint_data.complainantAddress
        complaint.complainant_aadhaar = complaint_data.complainantAadhaar
        complaint.complainant_relationship = complaint_data.complainantRelationship
        complaint.complainant_occupation = complaint_data.complainantOccupation
        complaint.complainant_nationality = complaint_data.complainantNationality
        complaint.complainant_photo_url = complaint_data.complainantPhotoUrl
        complaint.complainant_photo_name = complaint_data.complainantPhotoName
        complaint.status = "Submitted"
        complaint.is_draft = False
        
        # Delete existing victims/suspects for this complaint
        db.query(Victim).filter(Victim.complaint_id == complaint_id).delete()
        db.query(Suspects).filter(Suspects.complaint_id == complaint_id).delete()
        
        # Create new victim records
        if payload.victims:
            _create_victim_records(db, complaint.complaint_id, payload.victims)
        
        # Create new suspect records
        if payload.suspects:
            _create_suspect_records(db, complaint.complaint_id, payload.suspects)
        
        db.commit()
        db.refresh(complaint)
        
        return {
            "success": True,
            "message": "Draft submitted successfully",
            "data": {
                "complaint_id": complaint.complaint_id,
                "complaint_number": complaint.complaint_number,
                "status": complaint.status,
                "is_draft": complaint.is_draft,
                "created_at": complaint.created_at.isoformat() if complaint.created_at else None
            }
        }
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit draft: {str(e)}"
        )
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
    """Get all complaints."""
    db = SessionLocal()
    try:
        complaints = db.query(Complaint).all()
        
        return {
            "complaints": [
                {
                    "complaint_id": c.complaint_id,
                    "complaint_number": c.complaint_number,
                    "complaint_title": c.complaint_title,
                    "complainant_name": c.complainant_name,
                    "phone": c.phone,
                    "email": c.email,
                    "crime_category": c.crime_category,
                    "crime_subcategory": c.crime_subcategory,
                    "location": c.location,
                    "description": c.description,
                    "status": c.status,
                    "is_draft": c.is_draft,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                    "complainant_father_name": c.complainant_father_name,
                    "complainant_address": c.complainant_address,
                }
                for c in complaints
            ]
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve complaints: {str(e)}"
        )
    finally:
        db.close()


@router.get(
    "/debug-count",
    summary="Debug: complaints count",
    description="Return number of complaints in DB (debug helper)",
    tags=["complaints"],
)
def complaints_count() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        count = db.query(Complaint).count()
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch count: {e}")
    finally:
        db.close()


@router.get(
    "/{complaint_id}",
    response_model=ComplaintDetailResponse,
    summary="Get complaint details",
    description="Retrieve a single complaint with all related data.",
    tags=["complaints"],
)
def get_complaint(complaint_id: str) -> Dict[str, Any]:
    """Get complaint details with related records."""
    db = SessionLocal()
    try:
        complaint = db.query(Complaint).filter(
            Complaint.complaint_id == complaint_id
        ).first()
        
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Fetch related records
        victims = db.query(Victim).filter(
            Victim.complaint_id == complaint_id
        ).all()
        
        suspects = db.query(Suspects).filter(
            Suspects.complaint_id == complaint_id
        ).all()
        
        documents = db.query(Document).filter(
            Document.complaint_id == complaint_id
        ).all()
        
        # Format response
        attachments = [
            {
                "id": str(document.document_id),
                "fileName": document.title or document.document_type,
                "fileType": document.document_type,
                "documentUrl": None,
                "cloudinaryUrl": None,
            }
            for document in documents
        ]

        return {
            "complaint_id": complaint.complaint_id,
            "complaint_number": complaint.complaint_number,
            "complaint_title": complaint.complaint_title,
            "complainant_name": complaint.complainant_name,
            "phone": complaint.phone,
            "email": complaint.email,
            "crime_category": complaint.crime_category,
            "crime_subcategory": complaint.crime_subcategory,
            "location": complaint.location,
            "description": complaint.description,
            "status": complaint.status,
            "is_draft": complaint.is_draft,
            "created_at": complaint.created_at.isoformat() if complaint.created_at else None,
            "incident_datetime": complaint.incident_date or None,
            "complainant_father_name": complaint.complainant_father_name,
            "complainant_address": complaint.complainant_address,
            "officerNotes": complaint.officer_notes,
            "aiSummary": complaint.ai_summary,
            "victims": [_format_victim(v) for v in victims],
            "suspects": [_format_suspect(s) for s in suspects],
            "documents": [_format_document(d) for d in documents],
            "attachments": attachments,
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve complaint: {str(e)}"
        )
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
    """Update complaint fields."""
    db = SessionLocal()
    try:
        complaint = db.query(Complaint).filter(
            Complaint.complaint_id == complaint_id
        ).first()
        
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Update only provided fields
        if payload.complainant_name is not None:
            complaint.complainant_name = payload.complainant_name
        if payload.phone is not None:
            complaint.phone = payload.phone
        if payload.email is not None:
            complaint.email = payload.email
        if payload.crime_category is not None:
            complaint.crime_category = payload.crime_category
        if payload.crime_subcategory is not None:
            complaint.crime_subcategory = payload.crime_subcategory
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
        
        db.commit()
        db.refresh(complaint)
        
        return {
            "success": True,
            "message": "Complaint updated successfully",
            "data": {
                "complaint_id": complaint.complaint_id,
                "complaint_number": complaint.complaint_number,
                "status": complaint.status,
                "is_draft": complaint.is_draft,
                "created_at": complaint.created_at.isoformat() if complaint.created_at else None
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update complaint: {str(e)}"
        )
    finally:
        db.close()


@router.delete(
    "/{complaint_id}",
    response_model=ComplaintDeleteResponse,
    summary="Delete a complaint",
    description="Remove an existing complaint record and related data.",
    tags=["complaints"],
)
def delete_complaint(complaint_id: str) -> Dict[str, Any]:
    """Delete complaint and cascade delete related records."""
    db = SessionLocal()
    try:
        complaint = db.query(Complaint).filter(
            Complaint.complaint_id == complaint_id
        ).first()
        
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Delete related records (cascade)
        db.query(Victim).filter(Victim.complaint_id == complaint_id).delete()
        db.query(Suspects).filter(Suspects.complaint_id == complaint_id).delete()
        db.query(Evidence).filter(Evidence.complaint_id == complaint_id).delete()
        db.query(Document).filter(Document.complaint_id == complaint_id).delete()
        
        # Delete complaint
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
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete complaint: {str(e)}"
        )
    finally:
        db.close()


# ============================================================
# UPLOAD + AI EXTRACTION
# ============================================================

@router.post(
    "/upload",
    response_model=UploadDocumentResponse,
    summary="Upload a document",
    description="Upload a complaint-related file and process it.",
    tags=["complaints"],
)
async def upload_document(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Upload and process a document."""
    
    file_bytes = await file.read()
    content_type = file.content_type or ""
    extension = Path(file.filename or "").suffix.lower()
    
    # Save temporarily
    temp = tempfile.NamedTemporaryFile(suffix=extension, delete=False)
    temp.write(file_bytes)
    temp.close()
    temp_path = temp.name
    
    raw_ai = {}
    extraction = {}
    upload_result = None
    
    try:
        # ============ IMAGE ============
        if content_type.startswith("image/"):
            from app.services.ingestion.image_service import process_image
            raw_ai = process_image(temp_path)
            extraction = map_image(raw_ai)
        
        # ============ PDF ============
        elif extension == ".pdf":
            from app.services.ingestion.pdf_service import process_pdf
            raw_ai = process_pdf(temp_path)
            extraction = map_pdf(raw_ai)
        
        # ============ AUDIO ============
        elif content_type.startswith("audio/") or extension in [".wav", ".mp3", ".m4a", ".ogg"]:
            from app.services.ingestion.audio_service import extract_audio_text
            raw_ai = extract_audio_text(temp_path)
            extraction = map_audio(raw_ai)
        
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type",
            )

        # ============ UPLOAD TO CLOUDINARY ============
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

    return {
        "fileName": file.filename,
        "fileType": content_type,
        "storedPath": temp_path,
        "cloudinaryUrl": upload_result.get("secure_url") if upload_result else None,
        "extraction": extraction,
    }


@router.post(
    "/upload-evidence",
    summary="Upload evidence files",
    description="Upload document and evidence files for a complaint (supports multiple file types, no AI extraction)",
    tags=["complaints"],
)
async def upload_evidence(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload evidence files for complaint documents section.
    Accepts: PDF, Images, Audio, Video, Word, Excel, Text files.
    Returns: cloudinaryUrl for frontend to store in attachments array.
    """
    file_bytes = await file.read()
    content_type = file.content_type or ""
    extension = Path(file.filename or "").suffix.lower()
    
    # Validate file type
    allowed_extensions = {
        # Documents
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
        # Images
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',
        # Audio
        '.mp3', '.wav', '.aac', '.flac', '.m4a', '.ogg',
        # Video
        '.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv'
    }
    
    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {extension}. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    upload_result = None
    
    try:
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file_bytes,
            folder="casecraft/evidence",
            resource_type="auto",
            use_filename=True,
            unique_filename=True,
        )
        
    except Exception as e:
        print(f"[Cloudinary Upload Error] {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file to cloud storage: {str(e)}"
        )
    
    # Return response with cloudinaryUrl for frontend
    return {
        "success": True,
        "fileName": file.filename,
        "fileType": content_type,
        "cloudinaryUrl": upload_result.get("secure_url") if upload_result else None,
    }
