from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database.db import Base


class MedicalReport(Base):

    __tablename__ = "medical_reports"

    report_id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())

    case_id = Column(
        String,
        ForeignKey("cases.case_id")
    )

    accused_id = Column(
        UUID(as_uuid=True),
        ForeignKey("accused.accused_id")
    )

    victim_id = Column(
        UUID(as_uuid=True),
        ForeignKey("victims.victim_id")
    )

    hospital_name = Column(String(255))

    doctor_name = Column(String(255))

    visible_injuries = Column(Text)

    injury_type = Column(String(100))

    medical_fitness = Column(Text)

    report_number = Column(String(100))

    examination_datetime = Column(DateTime(timezone=True))
