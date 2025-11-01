from sqlalchemy import Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True, unique=True, autoincrement=True
    )
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)


    def __str__(self) -> str:
        return f"Пользователь {self.email}"
