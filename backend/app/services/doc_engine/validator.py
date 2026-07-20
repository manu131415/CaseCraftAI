from .exceptions import DocumentValidationError


class DocumentValidator:
    """
    Validates whether enough data exists
    to generate a particular document.
    """

    @staticmethod
    def validate(document_type: str, context: dict):
        """
        Validate context before document generation.
        """

        validator = getattr(
            DocumentValidator,
            f"_validate_{document_type}",
            None,
        )

        if validator:
            validator(context)

    # --------------------------------------------------------
    # Common validation
    # --------------------------------------------------------

    @staticmethod
    def _validate_common(context):

        if not context.get("case"):
            raise DocumentValidationError(
                "Case details are missing."
            )

        if not context.get("complaint"):
            raise DocumentValidationError(
                "Complaint details are missing."
            )

        if not context.get("officer"):
            raise DocumentValidationError(
                "Investigating Officer details are missing."
            )

    # --------------------------------------------------------
    # Medical Examination
    # --------------------------------------------------------

    @staticmethod
    def _validate_medical(context):

        DocumentValidator._validate_common(context)

        if not context["victims"]:
            raise DocumentValidationError(
                "Medical Examination requires at least one victim."
            )

    # --------------------------------------------------------
    # Police Remand
    # --------------------------------------------------------

    @staticmethod
    def _validate_remand(context):

        DocumentValidator._validate_common(context)

        if not context["suspects"]:
            raise DocumentValidationError(
                "Remand Application requires at least one suspect."
            )

    # --------------------------------------------------------
    # Chargesheet
    # --------------------------------------------------------

    @staticmethod
    def _validate_chargesheet(context):

        DocumentValidator._validate_common(context)

        if not context["suspects"]:
            raise DocumentValidationError(
                "Chargesheet requires suspect details."
            )

        if not context["victims"]:
            raise DocumentValidationError(
                "Chargesheet requires victim details."
            )

    # --------------------------------------------------------
    # Purvani
    # --------------------------------------------------------

    @staticmethod
    def _validate_purvani(context):

        DocumentValidator._validate_common(context)

    # --------------------------------------------------------
    # Seizure Memo
    # --------------------------------------------------------

    @staticmethod
    def _validate_seizure(context):

        DocumentValidator._validate_common(context)

        if not context["evidences"]:
            raise DocumentValidationError(
                "Seizure Memo requires evidence."
            )

    # --------------------------------------------------------
    # Scene Panchnama
    # --------------------------------------------------------

    @staticmethod
    def _validate_panchnama(context):

        DocumentValidator._validate_common(context)

    # --------------------------------------------------------
    # Custody Warrant
    # --------------------------------------------------------

    @staticmethod
    def _validate_custody(context):

        DocumentValidator._validate_common(context)

        if not context["suspects"]:
            raise DocumentValidationError(
                "Custody Warrant requires suspect details."
            )

    # --------------------------------------------------------
    # Face Identification
    # --------------------------------------------------------

    @staticmethod
    def _validate_face_identification(context):

        DocumentValidator._validate_common(context)

        if not context["suspects"]:
            raise DocumentValidationError(
                "Face Identification Memo requires suspect details."
            )