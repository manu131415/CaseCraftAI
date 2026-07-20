from io import BytesIO
from sqlalchemy.orm import Session

from .fetcher import DataFetcher
from .context_builder import ContextBuilder
from .validator import DocumentValidator
from .registry import GeneratorRegistry


class DocumentEngine:
    """
    Main orchestration class for document generation.
    """

    def __init__(self, db: Session):
        self.db = db

        self.fetcher = DataFetcher(db)
        self.context_builder = ContextBuilder()

    def generate(
        self,
        case_id: str,
        document_type: str,
        language: str = "en",
    ) -> BytesIO:
        """
        Generate a document.

        Args:
            case_id: Case ID
            document_type: medical/remand/chargesheet...
            language: Template language

        Returns:
            BytesIO
        """

        # --------------------------------------------------
        # Fetch complete case data
        # --------------------------------------------------

        raw_data = self.fetcher.fetch_case_data(case_id)

        # --------------------------------------------------
        # Build template context
        # --------------------------------------------------

        context = self.context_builder.build(raw_data)

        # --------------------------------------------------
        # Validate
        # --------------------------------------------------

        DocumentValidator.validate(
            document_type=document_type,
            context=context,
        )

        # --------------------------------------------------
        # Select Generator
        # --------------------------------------------------

        generator = GeneratorRegistry.get_generator(
            document_type
        )

        # --------------------------------------------------
        # Generate document
        # --------------------------------------------------

        output = generator.generate(
            context=context,
            language=language,
        )

        return output