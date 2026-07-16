from sqlalchemy import text

from database.db import engine

# Keep initialization compatible with the existing database schema.
with engine.begin() as connection:
    connection.execute(text(
        "CREATE TABLE IF NOT EXISTS complaints ("
        "complaint_id VARCHAR PRIMARY KEY, "
        "complainant_name VARCHAR, "
        "phone VARCHAR, "
        "email VARCHAR, "
        "crime_type VARCHAR, "
        "complaint_type VARCHAR, "
        "category VARCHAR, "
        "priority VARCHAR, "
        "incident_date VARCHAR, "
        "incident_time VARCHAR, "
        "location TEXT, "
        "description TEXT, "
        "ai_summary TEXT, "
        "officer_notes TEXT, "
        "complainant_data TEXT, "
        "victim_data TEXT, "
        "suspect_data TEXT, "
        "attachment_data TEXT, "
        "status VARCHAR, "
        "created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), "
        "complainant_father_name VARCHAR(255), "
        "complainant_address TEXT, "
        "incident_datetime TIMESTAMP WITH TIME ZONE, "
        "incident_location TEXT, "
        "address TEXT"
        ")"
    ))
    connection.execute(text("CREATE TABLE IF NOT EXISTS documents (id VARCHAR PRIMARY KEY, case_id VARCHAR, document_type VARCHAR, version VARCHAR, status VARCHAR, content_json TEXT, file_path TEXT, generated_by VARCHAR, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now())"))

print("Database Created Successfully")