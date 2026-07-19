# app/services/doc_engine/fetcher.py

from sqlalchemy.orm import Session

from models.case import Case
from models.officer import Officer
from models.suspect import Suspects
from models.victim import Victim
from models.witness import Witness
from models.evidence import Evidence
from models.case_legal_sections import CaseLegalSection
from models.legal_sections import LegalSection


class CaseDataFetcher:

    def __init__(self, db: Session):
        self.db = db

    def fetch(self, case_id: str) -> dict:

        case = self._fetch_case(case_id)

        if not case:
            raise ValueError(f"Case '{case_id}' not found")

        return {
            "case": case,
            "officer": self._fetch_officer(case.assigned_officer_id),
            "accuseds": self._fetch_accuseds(case.case_id),
            "victims": self._fetch_victims(case.case_id),
            "witnesses": self._fetch_witnesses(case.case_id),
            "evidences": self._fetch_evidences(case.complaint_id),
            "sections": self._fetch_sections(case.case_id),
        }

    def _fetch_case(self, case_id):

        return (
            self.db.query(Case)
            .filter(Case.case_id == case_id)
            .first()
        )

    def _fetch_officer(self, officer_id):

        if not officer_id:
            return None

        return (
            self.db.query(Officer)
            .filter(Officer.officer_id == officer_id)
            .first()
        )

    def _fetch_accuseds(self, case_id):

        return (
            self.db.query(Accused)
            .filter(Accused.case_id == case_id)
            .all()
        )

    def _fetch_victims(self, case_id):

        return (
            self.db.query(Victim)
            .filter(Victim.case_id == case_id)
            .all()
        )

    def _fetch_witnesses(self, case_id):

        return (
            self.db.query(Witness)
            .filter(Witness.case_id == case_id)
            .all()
        )

    def _fetch_evidences(self, complaint_id):

        if not complaint_id:
            return []

        return (
            self.db.query(Evidence)
            .filter(Evidence.complaint_id == complaint_id)
            .all()
        )

    def _fetch_sections(self, case_id):

        mappings = (
            self.db.query(CaseLegalSection)
            .filter(CaseLegalSection.case_id == case_id)
            .all()
        )

        if not mappings:
            return []

        ids = [m.legal_section_id for m in mappings]

        return (
            self.db.query(LegalSection)
            .filter(LegalSection.id.in_(ids))
            .all()
        )