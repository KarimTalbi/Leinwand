from typing import Any, Annotated

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from pydantic import BaseModel, PrivateAttr, Field

from llm_logic.prompts import SYSTEM_PROMPT
from llm_logic._types import ModelProvider, GoogleAiModel, OpenAiModel

load_dotenv()


class Response(BaseModel):
    label: str
    response_text: str


class Prompt(BaseModel):
    system: str = SYSTEM_PROMPT
    context: str

    _prompt: str = PrivateAttr(default_factory=str)

    def model_post_init(self, __context) -> None:
        self._prompt = self.system + self.context

    def __call__(self):
        return self._prompt


class ConfigBuilder(BaseModel):
    model: GoogleAiModel | OpenAiModel = "gpt-4o-mini"
    model_provider: ModelProvider = "openai"
    temperature: Annotated[float, Field(ge=0.0, le=2.0)] = 0.7
    max_tokens: Annotated[int, Field(ge=0)] = 1024
    timeout: Annotated[int, Field(ge=0)] = 30
    max_retries: Annotated[int, Field(ge=0)] = 2
    model_kwargs: dict[str, Any] = Field(default_factory=dict)


class AiModel:
    def __init__(self, config: ConfigBuilder = ConfigBuilder(), echo: bool = False):
        self._config: dict[str, Any] = config.model_dump(exclude_none=True)
        self._model = init_chat_model(**self._config)
        self._echo = echo

    async def run(self, context: str):
        prompt = Prompt(context=context)
        result = await self._model.ainvoke(prompt())
        if self._echo:
            print(f"Prompt:\n{prompt}\n\nResponse:\n{result}\n")
        return result

    async def run_structured(self, context: str) -> Response:
        prompt = Prompt(context=context)
        structured_llm = self._model.with_structured_output(Response)
        result = await structured_llm.ainvoke(prompt())
        if self._echo:
            print(f"Prompt:\n{prompt}\n\nResponse:\n{result}\n")
        return result

    async def stream(self, prompt: Prompt):
        async for chunk in self._model.astream(prompt()):
            content = chunk.content
            if content:
                yield content

    def echo(self, is_active: bool):
        self._echo = is_active


def get_ai_model():
    return AiModel(config=ConfigBuilder(), echo=True)
