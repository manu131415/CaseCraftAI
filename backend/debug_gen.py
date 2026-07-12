import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.doc_gen import DATABASE_URL, generate_document_by_type

print("DEBUG: Connecting to DB...")
conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
print("DEBUG: Connected!")

cursor = conn.cursor()
cursor.execute("SELECT case_id FROM cases;")
cases = cursor.fetchall()
print("DEBUG: Cases found:", [c['case_id'] for c in cases])

case_id = "CASE001"
cursor.execute("SELECT accused_id FROM accused WHERE case_id = %s;", (case_id,))
accused = cursor.fetchall()
print("DEBUG: Accused for CASE001:", [a['accused_id'] for a in accused])

acc_id = accused[0]['accused_id'] if accused else None

doc_types = [
    "purvani_chargesheet",
    "medical_treatment_letter",
    "remand_request_letter",
    "seizure_receipt",
    "court_custody_letter",
    "accused_panchanama",
    "accused_face_identification_form"
]

for dt in doc_types:
    print(f"\n--- DEBUG: Starting {dt} ---")
    res = generate_document_by_type(case_id, dt, accused_id=acc_id)
    print(f"DEBUG: Completed {dt}, doc_id={res['document_id']}")

cursor.close()
conn.close()
print("DEBUG: Finished successfully!")
