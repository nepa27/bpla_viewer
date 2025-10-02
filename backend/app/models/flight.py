from datetime import date, time, datetime, timedelta
from typing import Optional
from geoalchemy2 import Geometry
from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Time,
    DateTime,
    Interval,
    ForeignKey,
    func,
)
from sqlalchemy.orm import relationship, Mapped

from backend.app.database import Base


class Flight(Base):
    __tablename__ = "flights"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True, unique=True)
    flight_id: Mapped[Optional[str]] = Column(String, unique=True, index=True, nullable=True)
    drone_type: Mapped[Optional[str]] = Column(String, nullable=True)
    takeoff_coordinates: Mapped[Optional[Geometry]] = Column(Geometry("POINT", srid=4326), nullable=True)
    landing_coordinates: Mapped[Optional[Geometry]] = Column(Geometry("POINT", srid=4326), nullable=True)
    flight_date: Mapped[Optional[date]] = Column(Date, nullable=True)
    takeoff_time: Mapped[Optional[time]] = Column(Time, nullable=True)
    landing_time: Mapped[Optional[time]] = Column(Time, nullable=True)
    flight_duration: Mapped[Optional[timedelta]] = Column(Interval, nullable=True)

    region_id: Mapped[int] = Column(
        Integer, ForeignKey("regions.region_id"), nullable=False, index=True
    )

    region_rel = relationship("Region", back_populates="flights")

    created_at: Mapped[datetime] = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = Column(DateTime(timezone=True), onupdate=func.now())

    def __str__(self) -> str:
        return str(self.id)
