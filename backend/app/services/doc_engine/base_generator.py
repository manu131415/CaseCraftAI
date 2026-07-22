from __future__ import annotations

from abc import ABC
from io import BytesIO
from pathlib import Path
import tempfile
import requests
from docxtpl import DocxTemplate, InlineImage
from docx.shared import Mm

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

    def _prepare_images(self, doc: DocxTemplate, context: dict):
    # """
    # Downloads Cloudinary images and converts them into InlineImage
    # objects for docxtpl.
    # """

        image_collections = [
            "victims",
            "suspects",
        ]

        for collection in image_collections:

            for person in context.get(collection, []):

                photo_url = person.get("photo_url")

                if not photo_url:
                    person["photo"] = ""
                    continue

                try:
                    response = requests.get(photo_url, timeout=10)
                    response.raise_for_status()

                    suffix = ".jpg"

                    if ".png" in photo_url.lower():
                        suffix = ".png"
                    elif ".jpeg" in photo_url.lower():
                        suffix = ".jpeg"

                    temp = tempfile.NamedTemporaryFile(
                        delete=False,
                        suffix=suffix
                    )

                    temp.write(response.content)
                    temp.close()

                    person["photo"] = InlineImage(
                        doc,
                        temp.name,
                        width=Mm(22)
                    )

                except Exception:
                    person["photo"] = ""

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

            self._prepare_images(doc, context)

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