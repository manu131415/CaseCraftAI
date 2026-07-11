import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.doc_gen import generate_document_by_type

case_id = "CASE001"
doc_types = [
    "purvani_chargesheet",
    "medical_treatment_letter",
    "remand_request_letter",
    "seizure_receipt",
    "court_custody_letter",
    "accused_panchanama",
    "accused_face_identification_form"
]

print("Starting verification of Document Generation...")
success = 0
for dt in doc_types:
    try:
        print(f"Generating {dt}...")
        res = generate_document_by_type(case_id, dt)
        print(f"-> Success: {res['title']} generated at {res['file_path']}")
        success += 1
    except Exception as e:
        print(f"-> Error generating {dt}: {e}")

print(f"\nCompleted verification: {success}/{len(doc_types)} generated successfully.")
