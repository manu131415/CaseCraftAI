# app/services/doc_engine/renderer.py

from io import BytesIO
from pathlib import Path

from docxtpl import DocxTemplate


class Renderer:

    def __init__(self, template_dir: Path):
        self.template_dir = template_dir

    def render(
        self,
        template_name: str,
        context: dict,
    ) -> BytesIO:

        template_path = self.template_dir / template_name

        doc = DocxTemplate(template_path)

        doc.render(context)

        buffer = BytesIO()

        doc.save(buffer)

        buffer.seek(0)

        return buffer