from sqlalchemy import text

from database.db import engine

# Keep initialization compatible with the existing database schema.
with engine.begin() as connection:
    connection.execute(text("CREATE TABLE IF NOT EXISTS complaints (id VARCHAR PRIMARY KEY, source_type VARCHAR, media_url TEXT, raw_text TEXT, extracted TEXT, embedding TEXT, status VARCHAR, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now())"))
    connection.execute(text("CREATE TABLE IF NOT EXISTS documents (id VARCHAR PRIMARY KEY, case_id VARCHAR, document_type VARCHAR, version VARCHAR, status VARCHAR, content_json TEXT, file_path TEXT, generated_by VARCHAR, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now())"))

print("Database Created Successfully")