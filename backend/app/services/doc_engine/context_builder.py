from datetime import datetime


class ContextBuilder:
    """
    Converts fetched SQLAlchemy models into a plain dictionary
    suitable for docxtpl rendering.
    """

    @staticmethod
    def _to_dict(obj):
        """
        Convert SQLAlchemy model to dictionary.
        """

        if obj is None:
            return {}

        data = {}

        for column in obj.__table__.columns:
            value = getattr(obj, column.name)

            # Convert datetime to string
            if isinstance(value, datetime):
                value = value.strftime("%d-%m-%Y %H:%M:%S")

            data[column.name] = value

        return data

    @classmethod
    def build(cls, data: dict) -> dict:
        """
        Build rendering context for docxtpl.
        """

        # ----------------------------------------------------
        # FIR Draft
        # ----------------------------------------------------

        fir_draft = data.get("fir_draft")

        draft_content = {}
        legal_sections = []
        judgments = []

        if fir_draft and fir_draft.draft_content:
            draft_content = fir_draft.draft_content

            legal_sections = draft_content.get(
                "selected_sections",
                []
            )

            judgments = draft_content.get(
                "selected_judgments",
                []
            )

        # ----------------------------------------------------
        # Build Context
        # ----------------------------------------------------

        context = {
            "generated_at": datetime.now().strftime("%d-%m-%Y"),
            "generated_time": datetime.now().strftime("%H:%M:%S"),

            # Main entities
            "case": cls._to_dict(data["case"]),
            "complaint": cls._to_dict(data["complaint"]),
            "officer": cls._to_dict(data["officer"]),

            # Victims
            "victims": [
                cls._to_dict(v)
                for v in data["victims"]
            ],

            # Suspects
            "suspects": [
                cls._to_dict(s)
                for s in data["suspects"]
            ],

            # Uploaded Documents
            "documents": [
                cls._to_dict(d)
                for d in data["documents"]
            ],

            # Evidences
            "evidences": [
                cls._to_dict(e)
                for e in data["evidences"]
            ],

            # Case Diaries
            "case_diaries": [
                cls._to_dict(cd)
                for cd in data["case_diaries"]
            ],

            # ------------------------------------------------
            # FIR Draft Data
            # ------------------------------------------------

            # Complete FIR draft JSON
            "fir_draft": draft_content,

            # Applied legal sections
            "legal_sections": legal_sections,

            # Recommended judgments
            "judgments": judgments,

            # Optional shortcuts
            "fir_summary": draft_content.get("summary", ""),
            "officer_notes": getattr(fir_draft, "officer_notes", "") if fir_draft else "",
            "fir_status": getattr(fir_draft, "status", "") if fir_draft else "",
        }

        return context