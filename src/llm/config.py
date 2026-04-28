from enum import Enum
from typing import Annotated, Any

from pydantic import BaseModel, Field

# --- Ai Models ---


class LLMModelConfig(BaseModel):
    model: str
    model_provider: str
    temperature: Annotated[float, Field(ge=0.0, le=2.0)] | None = None
    max_tokens: Annotated[int, Field(ge=0)] | None = None
    timeout: Annotated[int, Field(ge=0)] | None = None
    max_retries: Annotated[int, Field(ge=0)] | None = None
    model_kwargs: dict[str, Any] | None = None


class AiModel(Enum):
    OPENAI_GPT5_MINI = LLMModelConfig(model="gpt-5-mini", model_provider="openai")
    OPENAI_GPT4_MINI = LLMModelConfig(model="gpt-4o-mini", model_provider="openai")
    OPENAI_GPT4_1_MINI = LLMModelConfig(model="gpt-4.1-mini", model_provider="openai")
    GEMINI_2_FLASH = LLMModelConfig(model="gemini-2.0-flash", model_provider="google_genai")
    GEMINI_2_5_FLASH = LLMModelConfig(model="gemini-2.5-flash", model_provider="google_genai")
    GEMINI_2_5_FLASH_LITE = LLMModelConfig(
        model="gemini-2.5-flash-lite", model_provider="google_genai"
    )
    GEMINI_2_5_PRO = LLMModelConfig(model="gemini-2.5-pro", model_provider="google_genai")
    GEMINI_3_FLASH_PREVIEW = LLMModelConfig(
        model="gemini-3-flash-preview", model_provider="google_genai"
    )
    GEMINI_3_PRO_PREVIEW = LLMModelConfig(
        model="gemini-3-pro-preview", model_provider="google_genai"
    )
    GEMINI_3_1_FLASH_LITE_PREVIEW = LLMModelConfig(
        model="gemini-3.1-flash-lite-preview",
        model_provider="google_genai",
    )
    GEMINI_3_1_PRO_PREVIEW = LLMModelConfig(
        model="gemini-3.1-pro-preview",
        model_provider="google_genai",
    )
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
