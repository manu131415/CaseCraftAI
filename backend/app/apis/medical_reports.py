import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.db import SessionLocal
from models.medical_report import MedicalReport
from models.case import Case
from models.suspect import Suspects
from models.victim import Victim


router = APIRouter(prefix="/api/medical-reports", tags=["medical-reports"])


class MedicalReportCreate(BaseModel):
    case_id: str
    accused_id: Optional[str] = None
    victim_id: Optional[str] = None
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    visible_injuries: Optional[str] = None
    injury_type: Optional[str] = None
    medical_fitness: Optional[str] = None
    report_number: Optional[str] = None
    examination_datetime: Optional[datetime] = None


class MedicalReportUpdate(BaseModel):
    case_id: Optional[str] = None
    accused_id: Optional[str] = None
    victim_id: Optional[str] = None
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    visible_injuries: Optional[str] = None
    injury_type: Optional[str] = None
    medical_fitness: Optional[str] = None
    report_number: Optional[str] = None
    examination_datetime: Optional[datetime] = None


class MedicalReportSummary(BaseModel):
    report_id: str
    case_id: Optional[str] = None
    accused_id: Optional[str] = None
    victim_id: Optional[str] = None
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    visible_injuries: Optional[str] = None
    injury_type: Optional[str] = None
    medical_fitness: Optional[str] = None
    report_number: Optional[str] = None
    examination_datetime: Optional[str] = None


class MedicalReportCreateData(BaseModel):
    report_id: str


class MedicalReportCreateResponse(BaseModel):
    success: bool
    message: str
    data: MedicalReportCreateData


class MedicalReportListResponse(BaseModel):
    medical_reports: List[MedicalReportSummary]


class MedicalReportDetailResponse(MedicalReportSummary):
    pass


class MedicalReportUpdateResponse(BaseModel):
    success: bool
    message: str
    data: MedicalReportCreateData


class MedicalReportDeleteResponse(BaseModel):
    success: bool
    message: str


@router.post(
    "",
    response_model=MedicalReportCreateResponse,
    summary="Create a medical report",
    description="Create a new medical report record associated with a case.",
    tags=["medical-reports"],
)
def create_medical_report(payload: MedicalReportCreate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # Verify case exists
        case = db.query(Case).filter(Case.case_id == payload.case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Verify accused exists if provided
        accused_id = None
        if payload.accused_id:
            accused = db.query(Accused).filter(Accused.accused_id == uuid.UUID(payload.accused_id)).first()
            if not accused:
                raise HTTPException(status_code=404, detail="Accused not found")
            accused_id = accused.accused_id
        
        # Verify victim exists if provided
        victim_id = None
        if payload.victim_id:
            victim = db.query(Victim).filter(Victim.victim_id == uuid.UUID(payload.victim_id)).first()
            if not victim:
                raise HTTPException(status_code=404, detail="Victim not found")
            victim_id = victim.victim_id
        
        medical_report = MedicalReport(
            case_id=payload.case_id,
            accused_id=accused_id,
            victim_id=victim_id,
            hospital_name=payload.hospital_name,
            doctor_name=payload.doctor_name,
            visible_injuries=payload.visible_injuries,
            injury_type=payload.injury_type,
            medical_fitness=payload.medical_fitness,
            report_number=payload.report_number,
            examination_datetime=payload.examination_datetime
        )
        
        db.add(medical_report)
        db.commit()
        db.refresh(medical_report)
        
        return {
            "success": True,
            "message": "Medical report created successfully",
            "data": {
                "report_id": str(medical_report.report_id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create medical report: {str(e)}")
    finally:
        db.close()


@router.get(
    "",
    response_model=MedicalReportListResponse,
    summary="List medical reports",
    description="Retrieve all medical report records in the system.",
    tags=["medical-reports"],
)
def get_all_medical_reports() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        medical_reports = db.query(MedicalReport).all()
        return {
            "medical_reports": [
                {
                    "report_id": str(r.report_id),
                    "case_id": r.case_id,
                    "accused_id": str(r.accused_id) if r.accused_id else None,
                    "victim_id": str(r.victim_id) if r.victim_id else None,
                    "hospital_name": r.hospital_name,
                    "doctor_name": r.doctor_name,
                    "visible_injuries": r.visible_injuries,
                    "injury_type": r.injury_type,
                    "medical_fitness": r.medical_fitness,
                    "report_number": r.report_number,
                    "examination_datetime": r.examination_datetime.isoformat() if r.examination_datetime else None
                }
                for r in medical_reports
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve medical reports: {str(e)}")
    finally:
        db.close()


@router.get(
    "/{report_id}",
    response_model=MedicalReportDetailResponse,
    summary="Get medical report details",
    description="Retrieve a single medical report record by its identifier.",
    tags=["medical-reports"],
)
def get_medical_report(report_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        medical_report = db.query(MedicalReport).filter(MedicalReport.report_id == uuid.UUID(report_id)).first()
        if not medical_report:
            raise HTTPException(status_code=404, detail="Medical report not found")
        
        return {
            "report_id": str(medical_report.report_id),
            "case_id": medical_report.case_id,
            "accused_id": str(medical_report.accused_id) if medical_report.accused_id else None,
            "victim_id": str(medical_report.victim_id) if medical_report.victim_id else None,
            "hospital_name": medical_report.hospital_name,
            "doctor_name": medical_report.doctor_name,
            "visible_injuries": medical_report.visible_injuries,
            "injury_type": medical_report.injury_type,
            "medical_fitness": medical_report.medical_fitness,
            "report_number": medical_report.report_number,
            "examination_datetime": medical_report.examination_datetime.isoformat() if medical_report.examination_datetime else None
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid report_id format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve medical report: {str(e)}")
    finally:
        db.close()


@router.put(
    "/{report_id}",
    response_model=MedicalReportUpdateResponse,
    summary="Update a medical report",
    description="Partially update an existing medical report record.",
    tags=["medical-reports"],
)
def update_medical_report(report_id: str, payload: MedicalReportUpdate) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        medical_report = db.query(MedicalReport).filter(MedicalReport.report_id == uuid.UUID(report_id)).first()
        if not medical_report:
            raise HTTPException(status_code=404, detail="Medical report not found")
        
        # Verify case exists if case_id is being updated
        if payload.case_id is not None:
            case = db.query(Case).filter(Case.case_id == payload.case_id).first()
            if not case:
                raise HTTPException(status_code=404, detail="Case not found")
        
        # Verify accused exists if accused_id is being updated
        if payload.accused_id is not None:
            accused = db.query(Accused).filter(Accused.accused_id == uuid.UUID(payload.accused_id)).first()
            if not accused:
                raise HTTPException(status_code=404, detail="Accused not found")
        
        # Verify victim exists if victim_id is being updated
        if payload.victim_id is not None:
            victim = db.query(Victim).filter(Victim.victim_id == uuid.UUID(payload.victim_id)).first()
            if not victim:
                raise HTTPException(status_code=404, detail="Victim not found")
        
        # Update only provided fields
        if payload.case_id is not None:
            medical_report.case_id = payload.case_id
        if payload.accused_id is not None:
            medical_report.accused_id = uuid.UUID(payload.accused_id)
        if payload.victim_id is not None:
            medical_report.victim_id = uuid.UUID(payload.victim_id)
        if payload.hospital_name is not None:
            medical_report.hospital_name = payload.hospital_name
        if payload.doctor_name is not None:
            medical_report.doctor_name = payload.doctor_name
        if payload.visible_injuries is not None:
            medical_report.visible_injuries = payload.visible_injuries
        if payload.injury_type is not None:
            medical_report.injury_type = payload.injury_type
        if payload.medical_fitness is not None:
            medical_report.medical_fitness = payload.medical_fitness
        if payload.report_number is not None:
            medical_report.report_number = payload.report_number
        if payload.examination_datetime is not None:
            medical_report.examination_datetime = payload.examination_datetime
        
        db.commit()
        db.refresh(medical_report)
        
        return {
            "success": True,
            "message": "Medical report updated successfully",
            "data": {
                "report_id": str(medical_report.report_id)
            }
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update medical report: {str(e)}")
    finally:
        db.close()


@router.delete(
    "/{report_id}",
    response_model=MedicalReportDeleteResponse,
    summary="Delete a medical report",
    description="Remove a medical report record from the system.",
    tags=["medical-reports"],
)
def delete_medical_report(report_id: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        medical_report = db.query(MedicalReport).filter(MedicalReport.report_id == uuid.UUID(report_id)).first()
        if not medical_report:
            raise HTTPException(status_code=404, detail="Medical report not found")
        
        db.delete(medical_report)
        db.commit()
        
        return {
            "success": True,
            "message": "Medical report deleted successfully"
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid report_id format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete medical report: {str(e)}")
    finally:
        db.close()
