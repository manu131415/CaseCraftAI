from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import Integer
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database.db import Base


class Victim(Base):

    __tablename__ = "victims"

    victim_id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())

    case_id = Column(
        String,
        ForeignKey("cases.case_id")
    )

    full_name = Column(String(255))

    age = Column(Integer)

    gender = Column(String(20))

    address = Column(Text)

    injuries = Column(Text)
