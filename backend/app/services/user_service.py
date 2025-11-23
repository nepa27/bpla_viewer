from datetime import datetime, timedelta
from os import getenv

from dotenv import load_dotenv
from fastapi import Response, Request, Depends, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import EmailStr
from sqlalchemy import select, insert
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.logging import logger
from backend.app.models.users import User

load_dotenv()

SECRET_KEY = getenv("SECRET_KEY", "some_key")
ALGORITHM = getenv("ALGORITHM", "HS256")
ENVIRONMENT = getenv("ENVIRONMENT", "dev")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    @staticmethod
    async def get_user(
        email: EmailStr,
        db: AsyncSession,
    ):
        """Получает пользователя."""
        query = select(
            User.email,
            User.hashed_password
        ).where(User.email == email)

        result = await db.execute(query)
        return result.mappings().one_or_none()

    @staticmethod
    async def create_user(
        email: EmailStr,
        passwd: str,
        db: AsyncSession,
    ):
        try:
            hash_passwd = UserService.get_password_hash(passwd)
            query = (
                insert(User).
                values(email=email, hashed_password=hash_passwd)
            )
            user = await db.execute(query)
            await db.commit()
            logger.info(f"Пользователь {email} успешно создан")
            return user
        except Exception:
            await db.rollback()
            logger.error(f"Ошибка при создании пользователя")

    @staticmethod
    async def check_user(
            email: EmailStr,
            passwd: str,
            db: AsyncSession,
    ):
        user = await UserService.get_user(email=email, db=db)
        if not user:
            return None
        UserService.verify_password(passwd, user.hashed_password)

        return user

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password, hashed_password) -> bool:
        if pwd_context.verify(plain_password, hashed_password):
            return True
        raise Exception

    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now() + timedelta(minutes=30)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode,
            SECRET_KEY,
            ALGORITHM,
        )
        return encoded_jwt

    @staticmethod
    def set_auth_cookie(response: Response, token: str):
        """Устанавливает безопасную cookie с токеном"""
        is_production = ENVIRONMENT == "prod"
        response.set_cookie(
            key="bpla_access_token",
            value=token,
            httponly=True,
            secure=is_production,
            samesite="lax",
            max_age=1800,
            path="/",
        )

    @staticmethod
    def delete_auth_cookie(response: Response):
        """Удаляет auth cookie"""
        response.delete_cookie(
            key="bpla_access_token",
            path="/"
        )

    @staticmethod
    async def get_current_user(
            request: Request,
            db: AsyncSession = Depends(get_db)
    ):
        token = request.cookies.get("bpla_access_token")
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )

            user = await UserService.get_user(email=email, db=db)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )

            return user
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

    @staticmethod
    async def require_admin(current_user: dict = Depends(get_current_user)):
        """Проверяет что пользователь администратор"""
        if not getattr(current_user, 'is_admin', False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        return current_user
