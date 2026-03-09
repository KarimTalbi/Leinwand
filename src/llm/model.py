from typing import TypeVar

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage
from pydantic import BaseModel

from src.llm.schemas import ModelConfig, Prompt, Response

load_dotenv()

_Response = TypeVar("_Response", bound=BaseModel)


class AiModel:
    def __init__(self, config: ModelConfig, structure: _Response = Response) -> None:
        self._model: BaseChatModel = init_chat_model(
            **config.model_dump(exclude_none=True)
        )
        if structure:
            self._model = self._model.with_structured_output(structure)

    async def run(self, prompt: Prompt) -> _Response:
        result: AIMessage | _Response = await self._model.ainvoke(prompt.get)
        return result
