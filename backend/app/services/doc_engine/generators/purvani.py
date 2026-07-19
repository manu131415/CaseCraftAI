# app/services/doc_engine/generators/purvani.py

from .base import BaseGenerator


class PurvaniGenerator(BaseGenerator):

    template_name = "purvani_chargesheet.docx"

    def build_context(self, context: dict) -> dict:
        """
        Purvani-specific context.
        """

        case = context.get("case", {})

        context["supplementary_no"] = (
            case.get("supplementary_chargesheet_no")
            or ""
        )

        context["supplementary_reason"] = (
            case.get("supplementary_reason")
            or ""
        )

        return context