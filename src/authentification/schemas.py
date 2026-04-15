from pydantic import BaseModel, ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserBase(BaseModel):
    username: str
    disabled: bool | None = None


class UserInDb(UserBase):
    hashed_password: str

    model_config = ConfigDict(from_attributes=True)


class UserRead(UserBase):
    id: str
    username: str
    disabled: bool

    model_config = ConfigDict(from_attributes=True)


class UserCreate(UserBase):
    username: str
    password: str
