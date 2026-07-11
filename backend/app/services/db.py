import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    return psycopg2.connect(DATABASE_URL)

def get_complaint(case_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            complaint_id,
            complainant_name,
            phone,
            email,
            crime_type,
            location,
            description,
            status,
            created_at
        FROM complaints
        WHERE complaint_id = %s;
    """, (case_id,))

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row is None:
        return None

    return {
        "complaint_id": row[0],
        "complainant_name": row[1],
        "phone": row[2],
        "email": row[3],
        "crime_type": row[4],
        "location": row[5],
        "description": row[6],
        "status": row[7],
        "created_at": row[8],
    }