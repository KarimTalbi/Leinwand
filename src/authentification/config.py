from functools import lru_cache
from pathlib import Path

from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

print(BASE_DIR)


class AuthSettings(BaseSettings):
    SECRET_KEY: SecretStr
    ALGORITHM: str
    DUMMY_HASH: str = "dummypassword"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )


@lru_cache
def get_auth_settings():
    return AuthSettings()


password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/token")
