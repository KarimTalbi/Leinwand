from typing import Any, Annotated

from pydantic import BaseModel, Field


class ModelConfig(BaseModel):

    model: str
    model_provider: str
    temperature: Annotated[float, Field(ge=0.0, le=2.0)] | None = None
    max_tokens: Annotated[int, Field(ge=0)] | None = None
    timeout: Annotated[int, Field(ge=0)] | None = None
    max_retries: Annotated[int, Field(ge=0)] | None = None
    model_kwargs: dict[str, Any] | None = None


class AiModelConfigs:

    OPENAI = ModelConfig(
        model="gpt-5-mini",
        model_provider="openai",
    )

    GEMINI_PRO_25 = ModelConfig(
        model="gemini-2.5-pro",
        model_provider="google_genai",
    )

    GEMINI_FLASH_25 = ModelConfig(
        model="gemini-2.5-flash",
        model_provider="google_genai",
    )

    GEMINI_FLASH_LITE_25 = ModelConfig(
        model="gemini-2.5-flash-lite",
        model_provider="google_genai",
    )

    GEMINI_PRO_31 = ModelConfig(
        model="gemini-3.1-pro-preview",
        model_provider="google_genai",
    )

    GEMINI_FLASH_LITE_31 = ModelConfig(
        model="gemini-3.1-flash-lite-preview",
        model_provider="google_genai",
    )

    GEMINI_FLASH_3 = ModelConfig(
        model="gemini-3-flash-preview",
        model_provider="google_genai",
    )

    ANTHROPIC_SONNET_46 = ModelConfig(
        model="claude-sonnet-4-6",
        model_provider="anthropic",
    )

    ANTHROPIC_OPUS_46 = ModelConfig(
        model="claude-opus-4-6",
        model_provider="anthropic",
    )

    ANTHROPIC_HAIKU_46 = ModelConfig(
        model="claude-haiku-4-6",
        model_provider="anthropic",
    )