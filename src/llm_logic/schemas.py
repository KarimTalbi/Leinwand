from typing import Annotated, Any

from pydantic import BaseModel, Field, PrivateAttr

from .prompts import SYSTEM_PROMPT
from .types import GoogleAiModel, ModelProvider, OpenAiModel


class AiConfig(BaseModel):
    model: GoogleAiModel | OpenAiModel | None = "gpt-4o-mini"
    model_provider: ModelProvider | None = "openai"
    temperature: Annotated[float, Field(ge=0.0, le=2.0)] | None = 0.7
    max_tokens: Annotated[int, Field(ge=0)] | None = 1024
    timeout: Annotated[int, Field(ge=0)] | None = 30
    max_retries: Annotated[int, Field(ge=0)] | None = 2
    model_kwargs: dict[str, Any] = Field(default_factory=dict)


class Response(BaseModel):
    label: str
    response_text: str


class Prompt(BaseModel):
    system: str = SYSTEM_PROMPT
    context: str

    _prompt: str = PrivateAttr(default_factory=str)

    def model_post_init(self, __context) -> None:  # pyright: ignore[reportUnknownParameterType, reportMissingParameterType]
        self._prompt = self.system + self.context

    def __call__(self):
        return self._prompt
