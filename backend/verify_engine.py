import os
import sys
import uuid
import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

# Add app to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.doc_gen import generate_document_by_type, DATABASE_URL

def seed_test_data():
    print("Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        # Check if CASE001 exists
        cursor.execute("SELECT case_id FROM cases WHERE case_id = 'CASE001';")
        if not cursor.fetchone():
            # Seed a default case if CASE001 doesn't exist
            print("Seeding CASE001...")
            cursor.execute("""
                INSERT INTO cases (
                    case_id, complaint_id, assigned_officer_id, case_number, title, status, priority, description, 
                    created_at, district, police_station, fir_no, fir_year, fir_date,
                    original_chargesheet_no, original_chargesheet_date, supplementary_chargesheet_no, supplementary_reason,
                    court_name, court_no, current_stage
                ) VALUES (
                    'CASE001', 'COMP001', 'OFF001', '145/2026', 'Online Investment Fraud Case', 'Under Investigation', 'High', 
                    'Investigation regarding online financial fraud complaint.', NOW(), 'ahmedabad', 
                    'Cyber Crime Police Station Ahmedabad', '10', 2026, '2026-11-07',
                    'CS-101', '2026-11-20', 'SUP-01', 'Further investigation in cyber financial networks',
                    'Metropolitan Magistrate Court', 'Court No. 3', 'Investigation'
                ) ON CONFLICT DO NOTHING;
            """)
            
        # Make sure OFF001 exists
        cursor.execute("SELECT officer_id FROM officers WHERE officer_id = 'OFF001';")
        if not cursor.fetchone():
            print("Seeding OFF001...")
            cursor.execute("""
                INSERT INTO officers (
                    officer_id, badge_number, name, rank, station
                ) VALUES (
                    'OFF001', 'GJ-4521', 'Rajesh Patel', 'Inspector', 'Cyber Crime Police Station Ahmedabad'
                ) ON CONFLICT DO NOTHING;
            """)
            
        accused_id = "8e1f598d-1dc7-4101-a3bd-204da5b93269"
        
        # 1. Clean existing mock data to avoid unique/conflict errors
        cursor.execute("DELETE FROM court_custody WHERE case_id = 'CASE001';")
        cursor.execute("DELETE FROM remand_details WHERE case_id = 'CASE001';")
        cursor.execute("DELETE FROM medical_reports WHERE case_id = 'CASE001';")
        cursor.execute("DELETE FROM evidences WHERE case_id = 'CASE001';")
        cursor.execute("DELETE FROM witnesses WHERE case_id = 'CASE001';")
        cursor.execute("DELETE FROM victims WHERE case_id = 'CASE001';")
        cursor.execute("DELETE FROM case_legal_sections WHERE case_id = 'CASE001';")
        cursor.execute("DELETE FROM accused WHERE case_id = 'CASE001';")
        
        # 2. Seed Accused
        print("Seeding Accused...")
        cursor.execute("""
            INSERT INTO accused (
                accused_id, case_id, full_name, alias, father_name, age, dob, gender, 
                permanent_address, present_address, arrest_datetime, custody_status, 
                identification_marks, created_at, face_shape, complexion, eye_color, 
                eye_structure, hair_type, hair_color, capture_date
            ) VALUES (
                %s, 'CASE001', 'Amit Shah', 'Bhai', 'Ramesh Shah', 32, '1994-05-12', 'Male',
                '12, Shanti Nagar, Naroda, Ahmedabad', '45, Sterling Heights, Vastrapur, Ahmedabad',
                '2026-07-11 10:15:00+05:30', 'In Judicial Custody',
                'Cut mark on forehead;Tattoo of om on left forearm', NOW(),
                'Round', 'Wheatish', 'Brown', 'Deep-set', 'Curly', 'Black', '2026-07-11'
            );
        """, (accused_id,))
        
        # 3. Seed Witnesses
        print("Seeding Witnesses...")
        cursor.execute("""
            INSERT INTO witnesses (witness_id, case_id, full_name, phone, address, statement)
            VALUES 
            (%s, 'CASE001', 'Vijay Sharma', '9898012345', '12, GIDC, Naroda, Ahmedabad', 'I saw the accused accessing the computer in the office room and transmitting bank OTPs.'),
            (%s, 'CASE001', 'Suresh Patel', '9898054321', '45, Sterling Appt, Vastrapur, Ahmedabad', 'I was present when the police seized the laptop and smartphone from the accused.');
        """, (str(uuid.uuid4()), str(uuid.uuid4())))
        
        # 4. Seed Evidences
        print("Seeding Evidences...")
        cursor.execute("""
            INSERT INTO evidences (
                evidence_id, case_id, evidence_type, description, serial_number, quantity, 
                item_condition, seized_from, seizure_datetime, seizure_location, seal_number
            ) VALUES 
            (%s, 'CASE001', 'Smartphone', 'Apple iPhone 15 Pro, Gold, IMEI: 351234567890123', 'IMEI-3512345678', 1, 'Switched Off, Packaged in Plastic Bag A', 'Amit Shah', NOW(), 'Sterling Heights Office Room', 'SEAL-9988'),
            (%s, 'CASE001', 'Laptop', 'Dell Latitude 5420, Grey, Service Tag: ABC1234', 'TAG-ABC1234', 1, 'Running state, locked with password, Bag B', 'Amit Shah', NOW(), 'Sterling Heights Office Room', 'SEAL-9989');
        """, (str(uuid.uuid4()), str(uuid.uuid4())))
        
        # 5. Seed Medical Reports
        print("Seeding Medical Reports...")
        cursor.execute("""
            INSERT INTO medical_reports (
                report_id, case_id, accused_id, hospital_name, doctor_name, visible_injuries, 
                injury_type, medical_fitness, report_number, examination_datetime
            ) VALUES (
                %s, 'CASE001', %s, 'Civil Hospital Asarwa', 'Dr. A. K. Sharma', 'No visible external injuries, complaints of mild back pain',
                'Simple', 'Fit', 'MED-REP-123', NOW()
            );
        """, (str(uuid.uuid4()), accused_id))
        
        # 6. Seed Remand Details
        print("Seeding Remand Details...")
        cursor.execute("""
            INSERT INTO remand_details (
                remand_id, case_id, accused_id, remand_days, custody_type, grounds, expiry_datetime, order_date
            ) VALUES (
                %s, 'CASE001', %s, 7, 'Police Custody', 'To trace the transaction routing path, recover the deleted digital evidence from server and interrogate other key accomplices.', NOW() + INTERVAL '7 days', CURRENT_DATE
            );
        """, (str(uuid.uuid4()), accused_id))
        
        # 7. Seed Court Custody Details
        print("Seeding Court Custody...")
        cursor.execute("""
            INSERT INTO court_custody (
                custody_id, case_id, accused_id, prison_name, commitment_from, commitment_to, court_order_number
            ) VALUES (
                %s, 'CASE001', %s, 'Sabarmati Central Jail', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', 'MET-ORD-452'
            );
        """, (str(uuid.uuid4()), accused_id))
        
        # 8. Seed Legal Sections
        print("Seeding Case Legal Sections...")
        # Get a couple of section ids from legal_sections
        cursor.execute("SELECT id FROM legal_sections LIMIT 2;")
        sections = cursor.fetchall()
        for sec in sections:
            cursor.execute("""
                INSERT INTO case_legal_sections (id, case_id, legal_section_id)
                VALUES (%s, 'CASE001', %s) ON CONFLICT DO NOTHING;
            """, (str(uuid.uuid4()), sec[0]))
            
        conn.commit()
        print("Seeding completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print("Seeding failed:", e)
        raise e
    finally:
        cursor.close()
        conn.close()

def run_verification():
    case_id = "CASE001"
    accused_id = "8e1f598d-1dc7-4101-a3bd-204da5b93269"
    
    doc_types = [
        "purvani_chargesheet",
        "medical_treatment_letter",
        "remand_request_letter",
        "seizure_receipt",
        "court_custody_letter",
        "accused_panchanama",
        "accused_face_identification_form"
    ]
    
    print("\nStarting Document Generation for all 7 types...")
    success_count = 0
    
    for dt in doc_types:
        try:
            print(f"\nGenerating: {dt}...")
            res = generate_document_by_type(case_id=case_id, doc_type=dt, accused_id=accused_id)
            print(f"Success! Document ID: {res['document_id']}")
            print(f"File Path: {res['file_path']}")
            success_count += 1
        except Exception as e:
            print(f"Failed to generate {dt}: {e}")
            
    print(f"\nGenerated {success_count}/{len(doc_types)} documents successfully!")
    
    # Check documents table in DB
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM documents WHERE case_id = 'CASE001';")
    count = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    print(f"Documents logged in DB: {count}")

if __name__ == "__main__":
    seed_test_data()
    run_verification()
