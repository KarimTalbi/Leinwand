from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import Any, Annotated

from pydantic import BaseModel, computed_field, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

_DIR = Path(__file__).parent.parent.parent
_FILE = _DIR / ".env"


# --- Env Variables ---


class LLMSettings(BaseModel):
    openai_api_key: SecretStr
    google_api_key: SecretStr
    anthropic_api_key: SecretStr


class LangFuseSettings(BaseModel):
    secret_key: SecretStr
    public_key: SecretStr
    base_url: str


class AuthSettings(BaseModel):
    secret_key: SecretStr
    algorithm: str
    access_token_expire_minutes: int


class DBSettings(BaseModel):
    user: str
    password: SecretStr
    host: str
    port: str
    name: str

    @computed_field
    @property
    def url(self) -> str:
        return (
            f"postgresql+psycopg://{self.user}:{self.password}"
            f"@{self.host}:{self.port}/{self.name}"
        )


class FastAPISettings(BaseModel):
    cors_origins: list[str]


class Settings(BaseSettings):
    llm: LLMSettings
    fuse: LangFuseSettings
    auth: AuthSettings
    db: DBSettings
    fast: FastAPISettings

    model_config = SettingsConfigDict(
        env_file=_FILE,
        env_nested_delimiter="__",
        env_file_encoding="utf-8",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()


# --- Ai Models ---


class LLMModelConfig(BaseModel):

    model: str
    model_provider: str
    temperature: Annotated[float, Field(ge=0.0, le=2.0)] | None = None
    max_tokens: Annotated[int, Field(ge=0)] | None = None
    timeout: Annotated[int, Field(ge=0)] | None = None
    max_retries: Annotated[int, Field(ge=0)] | None = None
    model_kwargs: dict[str, Any] | None = None


class OpenAIModel(Enum):
    OPENAI_GPT5_MINI = LLMModelConfig(model="gpt-5-mini", model_provider="openai")
    OPENAI_GPT4_MINI = LLMModelConfig(
        model="gpt-4o-mini",
        model_provider="openai",
    )
    OPENAI_GPT4_1_MINI = LLMModelConfig(
        model="gpt-4.1-mini",
        model_provider="openai",
    )


class GoogleModel(Enum):
    GEMINI_2_FLASH = LLMModelConfig(
        model="gemini-2.0-flash",
        model_provider="google_genai",
    )
    GEMINI_2_5_FLASH = LLMModelConfig(
        model="gemini-2.5-flash",
        model_provider="google_genai",
    )
    GEMINI_2_5_FLASH_LITE = LLMModelConfig(
        model="gemini-2.5-flash-lite",
        model_provider="google_genai",
    )
    GEMINI_2_5_PRO = LLMModelConfig(
        model="gemini-2.5-pro",
        model_provider="google_genai",
    )
    GEMINI_3_FLASH_PREVIEW = LLMModelConfig(
        model="gemini-3-flash-preview",
        model_provider="google_genai",
    )
    GEMINI_3_PRO_PREVIEW = LLMModelConfig(
        model="gemini-3-pro-preview",
        model_provider="google_genai",
    )
    GEMINI_3_1_FLASH_LITE_PREVIEW = LLMModelConfig(
        model="gemini-3.1-flash-lite-preview",
        model_provider="google_genai",
    )
    GEMINI_3_1_PRO_PREVIEW = LLMModelConfig(
        model="gemini-3.1-pro-preview",
        model_provider="google_genai",
    )


class AnthropicModel(Enum):
    OPUS_4_7 = LLMModelConfig(
        model="claude-opus-4-7",
        model_provider="anthropic",
    )
    SONNET_4_6 = LLMModelConfig(
        model="claude-sonnet-4-6",
        model_provider="anthropic",
    )
    HAIKU_4_5 = LLMModelConfig(
        model="claude-haiku-4-5",
        model_provider="anthropic",
    )


class AiModel(Enum):
    OpenAI = OpenAIModel
    Google = GoogleModel
    Anthropic = AnthropicModel
