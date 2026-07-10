import os
from docxtpl import DocxTemplate


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TEMPLATE_DIR = os.path.join(
    BASE_DIR,
    "templates"
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "generated"
)


def render_document(template_name, context, output_name):

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    template_path = os.path.join(
        TEMPLATE_DIR,
        template_name
    )

    doc = DocxTemplate(template_path)

    doc.render(context)

    output_path = os.path.join(
        OUTPUT_DIR,
        output_name
    )

    doc.save(output_path)

    print("Generated:", output_path)