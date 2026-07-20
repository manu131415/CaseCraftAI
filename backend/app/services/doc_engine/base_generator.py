from __future__ import annotations

from abc import ABC
from io import BytesIO
from pathlib import Path

from docxtpl import DocxTemplate

from .exceptions import (
    TemplateNotFoundError,
    TemplateRenderingError,
    DocumentSaveError,
)


class BaseGenerator(ABC):
    """
    Base class for all document generators.

    Responsibilities:
    - Locate template
    - Render template using docxtpl
    - Return generated DOCX as BytesIO
    """

    # Override in child classes
    template_name: str = ""

    # templates/en/
    TEMPLATE_DIR = (
        Path(__file__).resolve().parent / "templates"
    )

    def get_template_path(self, language: str = "en") -> Path:
        """
        Returns full path of template.
        """

        template_path = (
            self.TEMPLATE_DIR
            / language
            / self.template_name
        )

        if not template_path.exists():
            raise TemplateNotFoundError(template_path)

        return template_path

    def generate(
        self,
        context: dict,
        language: str = "en",
    ) -> BytesIO:
        """
        Generate document.

        Returns:
            BytesIO
        """

        template_path = self.get_template_path(language)

        try:
            doc = DocxTemplate(template_path)

            doc.render(context)

        except Exception as e:
            raise TemplateRenderingError(e)

        output = BytesIO()

        try:
            doc.save(output)
            output.seek(0)

        except Exception as e:
            raise DocumentSaveError(e)

        return output