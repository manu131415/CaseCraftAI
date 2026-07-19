# app/services/doc_engine/context_builder.py

from datetime import datetime

from app.services.doc_engine.formatter import (
    format_date,
    format_datetime,
)


class ContextBuilder:

    def __init__(self, translations: dict):
        self.translations = translations

    def build(self, data: dict) -> dict:

        case = data["case"]
        officer = data["officer"]

        context = {

            # -------------------------
            # Language Labels
            # -------------------------
            "t": self.translations,

            # -------------------------
            # Generated Info
            # -------------------------
            "generated_on": datetime.now().strftime("%d-%m-%Y %H:%M"),

            # -------------------------
            # Case
            # -------------------------
            "case": {

                "id": case.case_id,

                "case_number": case.case_number,

                "title": case.title,

                "status": case.status,

                "priority": case.priority,

                "description": case.description,

                "district": case.district,

                "police_station": case.police_station,

                "fir_no": case.fir_no,

                "fir_year": case.fir_year,

                "fir_date": format_date(case.fir_date),

                "incident_datetime": format_datetime(
                    case.incident_datetime
                ),

                "court_name": case.court_name,

                "court_no": case.court_no,

                "current_stage": case.current_stage,

                "original_chargesheet_no":
                    case.original_chargesheet_no,

                "original_chargesheet_date":
                    format_date(
                        case.original_chargesheet_date
                    ),

                "supplementary_chargesheet_no":
                    case.supplementary_chargesheet_no,

                "supplementary_reason":
                    case.supplementary_reason,

            },

            # -------------------------
            # Officer
            # -------------------------
            "officer": self._officer(officer),

            # -------------------------
            # Lists
            # -------------------------
            "accuseds": self._accuseds(
                data["accuseds"]
            ),

            "victims": self._victims(
                data["victims"]
            ),

            "witnesses": self._witnesses(
                data["witnesses"]
            ),

            "evidences": self._evidences(
                data["evidences"]
            ),

            "sections": self._sections(
                data["sections"]
            ),

        }

        return context

    # -------------------------------------------------

    def _officer(self, officer):

        if officer is None:

            return {}

        return {

            "id": officer.officer_id,

            "name": officer.name,

            "rank": officer.rank,

            "badge_number": officer.badge_number,

            "station": officer.station,

            "phone": officer.phone,

            "email": officer.email,

            "signature": officer.signature_path,

        }

    # -------------------------------------------------

    def _accuseds(self, accuseds):

        return [

            {

                "id": str(a.accused_id),

                "full_name": a.full_name,

                "alias": a.alias,

                "father_name": a.father_name,

                "age": a.age,

                "dob": format_date(a.dob),

                "gender": a.gender,

                "permanent_address":
                    a.permanent_address,

                "present_address":
                    a.present_address,

                "arrest_datetime":
                    format_datetime(
                        a.arrest_datetime
                    ),

                "custody_status":
                    a.custody_status,

                "identification_marks":
                    a.identification_marks,

                "face_shape":
                    a.face_shape,

                "complexion":
                    a.complexion,

                "eye_color":
                    a.eye_color,

                "eye_structure":
                    a.eye_structure,

                "hair_type":
                    a.hair_type,

                "hair_color":
                    a.hair_color,

                "front_photo":
                    a.front_photo,

                "left_photo":
                    a.left_profile_photo,

                "right_photo":
                    a.right_profile_photo,

            }

            for a in accuseds

        ]

    # -------------------------------------------------

    def _victims(self, victims):

        return [

            {

                "id": str(v.victim_id),

                "full_name": v.full_name,

                "age": v.age,

                "gender": v.gender,

                "address": v.address,

                "injuries": v.injuries,

            }

            for v in victims

        ]

    # -------------------------------------------------

    def _witnesses(self, witnesses):

        return [

            {

                "id": str(w.witness_id),

                "full_name": w.full_name,

                "phone": w.phone,

                "address": w.address,

                "statement": w.statement,

            }

            for w in witnesses

        ]

    # -------------------------------------------------

    def _evidences(self, evidences):

        return [

            {

                "id": e.evidence_id,

                "type": e.evidence_type,

                "description": e.description,

                "serial_number":
                    e.serial_number,

                "quantity":
                    e.quantity,

                "condition":
                    e.item_condition,

                "seized_from":
                    e.seized_from,

                "seizure_datetime":
                    format_datetime(
                        e.seizure_datetime
                    ),

                "seizure_location":
                    e.seizure_location,

                "seal_number":
                    e.seal_number,

                "storage_location":
                    e.storage_location,

                "file_path":
                    e.file_path,

            }

            for e in evidences

        ]

    # -------------------------------------------------

    def _sections(self, sections):

        return [

            {

                "section": s.section_number,

                "title": s.title,

                "act": s.act_name,

            }

            for s in sections

        ]