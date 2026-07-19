"""
Database access layer.

Queries the real `users` table (see backend/sql/schema.sql) over
SQLAlchemy instead of an in-memory dict. auth.py only ever calls
get_user_by_police_code() / verify_password(), so nothing else needs to
change now that this hits an actual database.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from models.users import User, Role

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Add it to backend/.env, e.g.\n"
        "DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/casecraft"
    )

# pool_pre_ping avoids handing out dead connections after the DB restarts
# or an idle connection times out.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user_by_police_code(police_code: str) -> User | None:
    """Looks up an active user by police code, case-insensitively."""
    query = text(
        """
        SELECT id, name, police_code, role, hashed_password, email
        FROM users
        WHERE UPPER(police_code) = UPPER(:police_code)
          AND is_active = TRUE
        """
    )

    with engine.connect() as conn:
        row = conn.execute(query, {"police_code": police_code}).mappings().first()

    if row is None:
        return None

    return User(
        id=str(row["id"]),
        name=row["name"],
        police_code=row["police_code"],
        role=Role(row["role"]),
        hashed_password=row["hashed_password"],
        email=row["email"],
    )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)