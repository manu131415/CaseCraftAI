import os
import sys
import psycopg2

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.doc_gen import DATABASE_URL

print("Loaded URL:", DATABASE_URL)

try:
    conn = psycopg2.connect(DATABASE_URL)
    print("Successfully connected!")
    conn.close()
except Exception as e:
    print("Connection failed:", e)
