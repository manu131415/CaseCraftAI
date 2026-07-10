import psycopg2


DATABASE_URL = "postgresql://neondb_owner:npg_SPA0yzWHXIM6@ep-spring-resonance-ahuzey41-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"


def get_connection():

    return psycopg2.connect(DATABASE_URL)



def get_complaint(case_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            raw_text,
            extracted
        FROM complaints
        WHERE id=%s;
        """,
        (case_id,)
    )


    row = cursor.fetchone()


    cursor.close()
    conn.close()


    if row is None:
        return None


    return {
        "id": row[0],
        "raw_text": row[1],
        "extracted": row[2]
    }



def get_officer():

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute(
        """
        SELECT *
        FROM officers
        LIMIT 1;
        """
    )


    row = cursor.fetchone()


    cursor.close()
    conn.close()


    return row
