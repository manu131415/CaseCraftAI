import psycopg2

DATABASE_URL = "postgresql://neondb_owner:npg_zU1jmX6IFCxZ@ep-spring-resonance-ahuzey41-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

conn = psycopg2.connect(DATABASE_URL)

print("Database connected!")

cursor = conn.cursor()

cursor.execute("""
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
""")

rows = cursor.fetchall()

for row in rows:
    print(row[0])

cursor.close()
conn.close()