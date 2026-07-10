import os
import psycopg2

conn = psycopg2.connect("postgresql://neondb_owner:npg_zU1jmX6IFCxZ@ep-spring-resonance-ahuzey41-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")
cur = conn.cursor()

# List all tables
cur.execute("""
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
""")

tables = [row[0] for row in cur.fetchall()]

print("Tables:")
for t in tables:
    print("-", t)

print("\n==============================")

# Show columns of every table
for table in tables:
    print(f"\nTABLE: {table}")

    cur.execute("""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = %s
        ORDER BY ordinal_position;
    """, (table,))

    for col in cur.fetchall():
        print(col)

cur.close()
conn.close()