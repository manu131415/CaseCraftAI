from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Date
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database.db import Base


class CourtCustody(Base):

    __tablename__ = "court_custody"

    custody_id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())

    case_id = Column(
        String,
        ForeignKey("cases.case_id")
    )

    accused_id = Column(
        UUID(as_uuid=True),
        ForeignKey("accused.accused_id")
    )

    prison_name = Column(String(255))

    commitment_from = Column(Date)

    commitment_to = Column(Date)

    court_order_number = Column(String(100))
