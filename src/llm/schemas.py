from functools import cached_property
from typing import Annotated, Any

from pydantic import BaseModel, Field

from src.llm.prompt import SYSTEM_PROMPT


class ModelConfig(BaseModel):
    model: str = "gpt-4o-mini"
    model_provider: str = "openai"
    temperature: Annotated[float, Field(ge=0.0, le=2.0)] = 0.7
    max_tokens: Annotated[int, Field(ge=0)] = 1024
    timeout: Annotated[int, Field(ge=0)] = 30
    max_retries: Annotated[int, Field(ge=0)] = 2
    model_kwargs: dict[str, Any] = Field(default_factory=dict)


class AiResponse(BaseModel):
    title: str
    response: str


class PromptRequest(BaseModel):
    prompt: str
    target_id: str


class Prompt(BaseModel):
    system: str = SYSTEM_PROMPT
    context: str
    prompt: str

    @cached_property
    def get(self) -> dict[str, str]:
        return f"{self.system}\n\n{self.context}\n\n{self.prompt}"
