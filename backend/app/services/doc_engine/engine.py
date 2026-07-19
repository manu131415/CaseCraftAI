# app/services/doc_engine/engine.py

from pathlib import Path

from .fetcher import CaseDataFetcher
from .context_builder import ContextBuilder
from .translator import Translator
from .renderer import Renderer
from .registry import DOCUMENT_REGISTRY


class DocumentEngine:

    def __init__(self, db):

        self.db = db

        self.fetcher = CaseDataFetcher(db)

        self.translator = Translator()

        self.renderer = Renderer(
            Path(__file__).parent / "templates"
        )

    def generate(
        self,
        *,
        case_id: str,
        document_type: str,
        language: str = "en",
    ):

        # ----------------------------------------
        # Validate document
        # ----------------------------------------

        if document_type not in DOCUMENT_REGISTRY:
            raise ValueError(
                f"Unsupported document type: {document_type}"
            )

        # ----------------------------------------
        # Fetch database
        # ----------------------------------------

        data = self.fetcher.fetch(case_id)

        # ----------------------------------------
        # Load translations
        # ----------------------------------------

        translations = self.translator.load(language)

        # ----------------------------------------
        # Build common context
        # ----------------------------------------

        builder = ContextBuilder(translations)

        context = builder.build(data)

        # ----------------------------------------
        # Document-specific context
        # ----------------------------------------

        generator_cls = DOCUMENT_REGISTRY[document_type]
        generator = generator_cls()

        context = generator.build_context(context)

        # ----------------------------------------
        # Render DOCX
        # ----------------------------------------

        buffer = self.renderer.render(
            generator.template_name,
            context,
        )

        return buffer