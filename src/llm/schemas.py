from typing import Annotated, Any

from pydantic import BaseModel, Field


class ModelConfig(BaseModel):
    model: str
    model_provider: str
    temperature: Annotated[float, Field(ge=0.0, le=2.0)]
    max_tokens: Annotated[int, Field(ge=0)]
    timeout: Annotated[int, Field(ge=0)]
    max_retries: Annotated[int, Field(ge=0)]
    model_kwargs: dict[str, Any] = Field(default_factory=dict)


class AiModelConfigs:
    PROMPT_NODE = ModelConfig(
        model="gpt-4o-mini",
        model_provider="openai",
        temperature=0.7,
        max_tokens=1024,
        timeout=30,
        max_retries=2,
    )


class AiResponse(BaseModel):
    title: str
    response: str


class AiRequest(BaseModel):
    prompt: str
    target_id: str
