from functools import cached_property
from typing import Annotated, Any

from pydantic import BaseModel, Field


class ModelConfig(BaseModel):
    model: str = "gpt-4o-mini"
    model_provider: str = "openai"
    temperature: Annotated[float, Field(ge=0.0, le=2.0)] = 0.7
    max_tokens: Annotated[int, Field(ge=0)] = 1024
    timeout: Annotated[int, Field(ge=0)] = 30
    max_retries: Annotated[int, Field(ge=0)] = 2
    model_kwargs: dict[str, Any] = Field(default_factory=dict)


class Response(BaseModel):
    label: str
    response_text: str


class Prompt(BaseModel):
    system: str
    context: str

    @cached_property
    def get(self) -> str:
        return f"{self.system}\n\n{self.context}"
