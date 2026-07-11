from pathlib import Path
from docxtpl import DocxTemplate

BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = BASE_DIR / "templates"
OUTPUT_DIR = BASE_DIR / "generated"

OUTPUT_DIR.mkdir(exist_ok=True)


def render_document(template_name, context, output_name):
    template_path = TEMPLATE_DIR / template_name
    output_path = OUTPUT_DIR / output_name

    print("Template Path:", template_path)
    print("Exists:", template_path.exists())

    if not template_path.exists():
        raise FileNotFoundError(f"Template not found: {template_path}")

    doc = DocxTemplate(str(template_path))
    print(context)
    doc.render(context)
    doc.save(str(output_path))

    print(f"Saved to: {output_path}")