from geoalchemy2 import Geometry
from sqlalchemy import (
    Column, Integer, String, Date, Time,
    DateTime, Interval, ForeignKey, func
)
from sqlalchemy.orm import relationship

from app.database import Base


class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True, nullable=True)
    flight_id = Column(String, unique=True, index=True, nullable=True)
    drone_type = Column(String, nullable=True)
    takeoff_coordinates = Column(Geometry('POINT', srid=4326), nullable=True)
    landing_coordinates = Column(Geometry('POINT', srid=4326), nullable=True)
    flight_date = Column(Date, nullable=True)
    takeoff_time = Column(Time, nullable=True)
    landing_time = Column(Time, nullable=True)
    flight_duration = Column(Interval, nullable=True)

    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False, index=True)

    region_rel = relationship("Region", back_populates="flights")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
