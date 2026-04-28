import logging
from collections.abc import AsyncGenerator
from functools import lru_cache
from typing import Any

import dotenv
from langchain.chat_models import BaseChatModel, init_chat_model
from langchain.messages import HumanMessage, SystemMessage
from langfuse.langchain import CallbackHandler
from pydantic import BaseModel

from data import (
    AiResponse,
    ChatResponse,
    MergeResolveResponse,
    MergeResponse,
    SummaryResponse,
)
from data.prompts import SystemPrompts
from src.llm.config import AiModel, LLMModelConfig

dotenv.load_dotenv()

logger = logging.getLogger(__name__)

langfuse_handler = CallbackHandler()


class AiModelBase:
    def __init__(
        self,
        config: LLMModelConfig,
        response_model: type[AiResponse],
        system_prompt: str,
    ) -> None:
        self.config = config
        self.response_model = response_model
        self.system_prompt = system_prompt

        self.model = self.__build_model()
        self.model_structured = self.model.with_structured_output(self.response_model)

    def __build_model(self) -> BaseChatModel:
        model = init_chat_model(
            **self.config.model_dump(exclude_unset=True, exclude_none=True),
        )
        return model

    async def generate_with_context(self, context: Any, prompt: str) -> AiResponse:

        logger.info("invoking model with context")

        result = await self.model_structured.ainvoke(
            [SystemMessage(f"{self.system_prompt}\n\n{context}"), HumanMessage(prompt)],
            config={"callbacks": [langfuse_handler]},
        )

        return result  # type: ignore

    async def generate(self, prompt: str) -> dict[str, Any] | BaseModel:

        logger.info("invoking model without context")

        result = await self.model_structured.ainvoke(
            [HumanMessage(prompt)],
            config={"callbacks": [langfuse_handler]},
        )

        return result

    async def stream_with_context(self, context: Any, prompt: str) -> AsyncGenerator[str, Any]:
        async for chunk in self.model.astream(
            [SystemMessage(f"{self.system_prompt}\n\n{context}"), HumanMessage(prompt)],
            config={"callbacks": [langfuse_handler]},
        ):
            if chunk.content:
                yield chunk.content  # type: ignore

    async def stream(self, prompt: str):
        async for chunk in self.model.astream(
            [HumanMessage(prompt)],
            config={"callbacks": [langfuse_handler]},
        ):
            if chunk.content:
                yield chunk.content


@lru_cache
def build_chat_model():
    config = AiModel.OPENAI_GPT5_MINI.value
    response = ChatResponse
    system_prompt = SystemPrompts.CHAT_SYSTEM.value
    return AiModelBase(config, response, system_prompt)


@lru_cache
def build_summary_model():
    config = AiModel.OPENAI_GPT5_MINI.value
    response = SummaryResponse
    system_prompt = SystemPrompts.SUMMARY_SYSTEM.value
    return AiModelBase(config, response, system_prompt)


@lru_cache
def build_merge_validation_model():
    config = AiModel.OPENAI_GPT5_MINI.value
    response = MergeResponse
    system_prompt = SystemPrompts.MERGE_SYSTEM.value
    return AiModelBase(config, response, system_prompt)


@lru_cache
def build_merge_resolution_model():
    config = AiModel.OPENAI_GPT5_MINI.value
    response = MergeResolveResponse
    system_prompt = SystemPrompts.MERGE_RESOLVE_SYSTEM.value
    return AiModelBase(config, response, system_prompt)
