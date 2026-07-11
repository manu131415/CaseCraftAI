import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

# Add app to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.doc_gen import generate_document_by_type, DATABASE_URL

def main():
    print("Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    cursor = conn.cursor()
    
    try:
        # Fetch all cases
        cursor.execute("SELECT case_id FROM cases;")
        cases = cursor.fetchall()
        print(f"Found {len(cases)} case(s).")
        
        doc_types = [
            "purvani_chargesheet",
            "medical_treatment_letter",
            "remand_request_letter",
            "seizure_receipt",
            "court_custody_letter",
            "accused_panchanama",
            "accused_face_identification_form"
        ]
        
        for case in cases:
            case_id = case['case_id']
            print(f"\nProcessing Case: {case_id}")
            
            # Fetch all accused for this case
            cursor.execute("SELECT accused_id, full_name FROM accused WHERE case_id = %s;", (case_id,))
            accused_list = cursor.fetchall()
            
            if not accused_list:
                print(f"No accused found for case {case_id}. Generating using case-level details...")
                for dt in doc_types:
                    try:
                        print(f"  Generating {dt}...")
                        res = generate_document_by_type(case_id, dt)
                        print(f"    -> Success: {res['file_path']}")
                    except Exception as e:
                        print(f"    -> Failed: {e}")
            else:
                for acc in accused_list:
                    acc_id = acc['accused_id']
                    acc_name = acc['full_name']
                    print(f"  Accused: {acc_name} ({acc_id})")
                    
                    for dt in doc_types:
                        try:
                            print(f"    Generating {dt}...")
                            res = generate_document_by_type(case_id, dt, accused_id=acc_id)
                            print(f"      -> Success: {res['file_path']}")
                        except Exception as e:
                            print(f"      -> Failed: {e}")
                            
    except Exception as e:
        print("Generation runner failed:", e)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()
