"""Small helper to add missing columns to `complaints` table.

Run from the backend folder:

    python scripts/ensure_complaint_columns.py

This will use the `DATABASE_URL` from backend/.env and run ALTER TABLE
commands with `IF NOT EXISTS` so it's safe to run multiple times.
"""
from database.db import engine

checks = [
    ("complaint_type", "VARCHAR"),
    ("ai_summary", "TEXT"),
]

with engine.connect() as conn:
    for col, coltype in checks:
        sql = f"ALTER TABLE complaints ADD COLUMN IF NOT EXISTS {col} {coltype};"
        print("Executing:", sql)
        conn.execute(sql)

    print("Done — ensure you restarted the API if it was running.")
