from sqlalchemy.orm import Session

from models.case import Case
from models.complaint import Complaint
from models.victim import Victim
from models.suspect import Suspects
from models.document import Document
from models.evidence import Evidence
from models.officer import Officer
from models.case_diary import CaseDiary

from .exceptions import (
    CaseNotFoundError,
    ComplaintNotFoundError,
)


class DataFetcher:
    """
    Fetches all data required for document generation.

    Returns a single dictionary containing all related entities.
    """

    def __init__(self, db: Session):
        self.db = db

    def fetch_case_data(self, case_id: str) -> dict:
        """
        Fetch complete case data.
        """

        # ----------------------------------------------------
        # Case
        # ----------------------------------------------------
        case = (
            self.db.query(Case)
            .filter(Case.case_id == case_id)
            .first()
        )

        if not case:
            raise CaseNotFoundError(case_id)

        # ----------------------------------------------------
        # Complaint
        # ----------------------------------------------------
        complaint = (
            self.db.query(Complaint)
            .filter(
                Complaint.complaint_id == case.complaint_id
            )
            .first()
        )

        if not complaint:
            raise ComplaintNotFoundError(case.complaint_id)

        # ----------------------------------------------------
        # Victims
        # ----------------------------------------------------
        victims = (
            self.db.query(Victim)
            .filter(
                Victim.complaint_id == complaint.complaint_id
            )
            .all()
        )

        # ----------------------------------------------------
        # Suspects
        # ----------------------------------------------------
        suspects = (
            self.db.query(Suspects)
            .filter(
                Suspects.complaint_id == complaint.complaint_id
            )
            .all()
        )

        # ----------------------------------------------------
        # Evidence
        # ----------------------------------------------------
        evidences = (
            self.db.query(Evidence)
            .filter(
                Evidence.complaint_id == complaint.complaint_id
            )
            .all()
        )

        # ----------------------------------------------------
        # Uploaded Documents
        # ----------------------------------------------------
        documents = (
            self.db.query(Document)
            .filter(
                Document.complaint_id == complaint.complaint_id
            )
            .all()
        )

        # ----------------------------------------------------
        # Investigating Officer
        # ----------------------------------------------------
        officer = (
            self.db.query(Officer)
            .filter(
                Officer.officer_id == case.assigned_officer_id
            )
            .first()
        )

        # ----------------------------------------------------
        # Case Diaries
        # ----------------------------------------------------
        case_diaries = (
            self.db.query(CaseDiary)
            .filter(
                CaseDiary.case_id == case.case_id
            )
            .order_by(CaseDiary.created_at.asc())
            .all()
        )

        # ----------------------------------------------------
        # Return all fetched data
        # ----------------------------------------------------
        return {
            "case": case,
            "complaint": complaint,
            "victims": victims,
            "suspects": suspects,
            "evidences": evidences,
            "documents": documents,
            "officer": officer,
            "case_diaries": case_diaries,
        }