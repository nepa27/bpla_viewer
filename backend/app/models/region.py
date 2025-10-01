from typing import List
from sqlalchemy import Integer, String
from sqlalchemy.orm import relationship, Mapped, mapped_column

from backend.app.database import Base
from backend.app.models.flight import Flight


class Region(Base):
    __tablename__ = "regions"

    region_id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True, unique=True, autoincrement=True
    )
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=True)

    flights: Mapped[List["Flight"]] = relationship("Flight", back_populates="region_rel")

    def __str__(self) -> str:
        return str(self.name)
