"""
Custom exceptions for the document generation engine.

These exceptions provide clear error messages and make it easier
for the API layer to return meaningful HTTP responses.
"""


class DocumentGenerationError(Exception):
    """
    Base exception for all document generation errors.
    """

    def __init__(self, message: str = "Document generation failed"):
        super().__init__(message)


# ----------------------------------------------------------------------


class CaseNotFoundError(DocumentGenerationError):
    """
    Raised when the requested case does not exist.
    """

    def __init__(self, case_id):
        super().__init__(f"Case '{case_id}' not found.")


# ----------------------------------------------------------------------


class ComplaintNotFoundError(DocumentGenerationError):
    """
    Raised when the complaint linked to the case is missing.
    """

    def __init__(self, complaint_id=None):
        if complaint_id:
            message = f"Complaint '{complaint_id}' not found."
        else:
            message = "Complaint not found."
        super().__init__(message)


# ----------------------------------------------------------------------


class DocumentTypeNotSupported(DocumentGenerationError):
    """
    Raised when an unknown document type is requested.
    """

    def __init__(self, document_type):
        super().__init__(
            f"Unsupported document type '{document_type}'."
        )


# ----------------------------------------------------------------------


class TemplateNotFoundError(DocumentGenerationError):
    """
    Raised when the DOCX template is missing.
    """

    def __init__(self, template_path):
        super().__init__(
            f"Template not found: {template_path}"
        )


# ----------------------------------------------------------------------


class TemplateRenderingError(DocumentGenerationError):
    """
    Raised when docxtpl fails while rendering.
    """

    def __init__(self, error):
        super().__init__(
            f"Failed to render template. {error}"
        )


# ----------------------------------------------------------------------


class DocumentValidationError(DocumentGenerationError):
    """
    Raised when required data for a document is missing.
    """

    def __init__(self, message):
        super().__init__(message)


# ----------------------------------------------------------------------


class ImageNotFoundError(DocumentGenerationError):
    """
    Raised when an image referenced in the template
    cannot be found.
    """

    def __init__(self, image_path):
        super().__init__(
            f"Image not found: {image_path}"
        )


# ----------------------------------------------------------------------


class StorageUploadError(DocumentGenerationError):
    """
    Raised when generated document upload fails.
    """

    def __init__(self, error):
        super().__init__(
            f"Document upload failed. {error}"
        )


# ----------------------------------------------------------------------


class DocumentSaveError(DocumentGenerationError):
    """
    Raised when the generated DOCX cannot be saved.
    """

    def __init__(self, error):
        super().__init__(
            f"Unable to save document. {error}"
        )