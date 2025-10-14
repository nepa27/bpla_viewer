from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.logging import log_function, logger
from backend.app.schemas.user import UserResponse, UserRegisterResponse
from backend.app.services.user_service import UserService

router = APIRouter(tags=["Аутентификация"])


@router.post("/auth", )
@log_function(logger)
async def auth(
    response: Response,
    data: UserRegisterResponse,
    db: AsyncSession = Depends(get_db),
):
    """Аутентификация"""
    try:
        user = await UserService.check_user(email=data.email, passwd=data.password, db=db)
        if not user:
            logger.error("Пользователь не найден")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No users found"
            )
        access_token = UserService.create_access_token({"sub": str(user.email)})
        UserService.set_auth_cookie(response, access_token)
        return {"email": data.email}

    except HTTPException:
        raise
    except Exception:
        logger.error(f"Ошибка аутентификации")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error authentification",
        )


@router.post("/register", response_model=UserResponse)
@log_function(logger)
async def register(
    data: UserRegisterResponse,
    db: AsyncSession = Depends(get_db),
):
    """Регистрация пользователя"""
    try:
        user = await UserService.check_user(email=data.email, passwd=data.password, db=db)
        if user:
            logger.error("Пользователь уже существует")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User is already registered"
            )
        await UserService.create_user(email=data.email, passwd=data.password, db=db)
        return {"email": data.email}

    except HTTPException:
        raise
    except Exception:
        logger.error(f"Ошибка при регистрации")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error registration",
        )


@router.post("/logout")
@log_function(logger)
async def logout(response: Response):
    """Выход из системы"""
    UserService.delete_auth_cookie(response)
    return {"message": "Logout successful"}
