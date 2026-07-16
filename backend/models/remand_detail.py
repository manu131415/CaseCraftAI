from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import Date
from sqlalchemy import Integer
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database.db import Base


class RemandDetail(Base):

    __tablename__ = "remand_details"

    remand_id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())

    case_id = Column(
        String,
        ForeignKey("cases.case_id")
    )

    accused_id = Column(
        UUID(as_uuid=True),
        ForeignKey("accused.accused_id")
    )

    remand_days = Column(Integer)

    custody_type = Column(String(100))

    grounds = Column(Text)

    expiry_datetime = Column(DateTime(timezone=True))

    order_date = Column(Date)
