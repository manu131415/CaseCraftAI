from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Adjust these imports to match your actual module paths if different
from database.db import get_db
from models.officer import Officer

router = APIRouter(prefix="/officers", tags=["officers"])


class OfficerOut(BaseModel):
    officer_id: str
    badge_number: str
    name: str
    rank: str
    station: str

    class Config:
        from_attributes = True  # allows returning ORM objects directly


@router.get("/", response_model=list[OfficerOut])
def get_all_officers(db: Session = Depends(get_db)):
    """
    Returns all officers. DB connection is created from DATABASE_URL
    (already loaded via get_db -> SessionLocal -> engine in database.py).

    NOTE: no role check applied here yet. If this should be restricted
    (e.g. SHO/IO only), add a dependency here consistent with however
    your other protected routes verify the JWT/role — mirror whatever
    /auth/me or similar already does.
    """
    return db.query(Officer).all()