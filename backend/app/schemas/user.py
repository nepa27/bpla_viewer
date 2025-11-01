from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    email: EmailStr

    class Config:
        from_attributes = True


class UserRegisterResponse(UserResponse):
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
