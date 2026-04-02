from typing import TypeVar
from dotenv import load_dotenv
from pydantic import BaseModel
from langchain.chat_models import init_chat_model
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage

from src.llm.schemas import ModelConfig, Prompt

load_dotenv()

prompt_node_config = ModelConfig(
    model="gpt-4o-mini",
    model_provider="openai",
    temperature=0.7,
    max_tokens=1024,
    timeout=30,
    max_retries=2,
)


class AiBase[_C: BaseModel, _R: BaseModel]:
    def __init__(self, config: _C, response: type[_R]) -> None:
        self._config: _C = config
        self._response: type[_R] = response

        self._model = init_chat_model(
            **config.model_dump(exclude_none=True)
        ).with_structured_output(response)

    async def run(self, p):


class PromptNodeModel:
    def __init__(self, config: ModelConfig, structure: _Response) -> None:
        self._model: BaseChatModel = init_chat_model(**config.model_dump(exclude_none=True))
        if structure:
            self._model = self._model.with_structured_output(structure)

    async def run(self, prompt: Prompt) -> _Response:
        result: AIMessage | _Response = await self._model.ainvoke(prompt)
        return result
