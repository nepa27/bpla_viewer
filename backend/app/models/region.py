from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from backend.app.database import Base


class Region(Base):
    __tablename__ = "regions"

    region_id = Column(Integer, primary_key=True, index=True, unique=True, autoincrement=True)
    name = Column(String, unique=True, index=True, nullable=True)

    flights = relationship("Flight", back_populates="region_rel")

    def __str__(self):
        return self.name
