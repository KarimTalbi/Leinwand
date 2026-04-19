import logging
from functools import lru_cache
from typing import Any

from langchain.chat_models import init_chat_model
from langchain.messages import HumanMessage, SystemMessage
from langfuse.langchain import CallbackHandler
from pydantic import BaseModel

from core import LLMModelConfig, AiModel, settings
from data import ChatResponse, SummaryResponse, MergeResponse
from data.prompts import SystemPrompts

logger = logging.getLogger(__name__)

langfuse_handler = CallbackHandler(
    public_key=settings.fuse.public_key.get_secret_value(),
)


class AiModelBase:

    def __init__(
        self, config: LLMModelConfig, response_model: BaseModel, system_prompt: str
    ) -> None:
        self.config = config
        self.response_model = response_model
        self.system_prompt = system_prompt

        self.model = self.__build_model()

    @staticmethod
    def __get_api_key(provider: str) -> str:
        keys = {
            "openai": settings.llm.openai_api_key,
            "google_genai": settings.llm.google_api_key,
            "anthropic": settings.llm.anthropic_api_key,
        }
        secret = keys.get(provider)

        if not secret:
            raise ValueError(f"Invalid provider: {provider}")

        return secret.get_secret_value()

    def __build_model(self):
        model = init_chat_model(
            **self.config.model_dump(exclude_unset=True, exclude_none=True),
            api_key=self.__get_api_key(self.config.model_provider),
        )
        return model.with_structured_output(self.response_model)

    async def generate_with_context(self, context: Any, prompt: str) -> BaseModel:
        result = await self.model.ainvoke(
            [SystemMessage(f"{self.system_prompt}\n\n{context}"), HumanMessage(prompt)],
            config={"callbacks": [langfuse_handler]},
        )

        return result

    async def generate(self, prompt: str) -> BaseModel:
        result = await self.model.ainvoke(
            [HumanMessage(prompt)],
            config={"callbacks": [langfuse_handler]},
        )

        return result


@lru_cache
def build_chat_model():
    config = AiModel.GEMINI_2_5_FLASH.value
    response = ChatResponse
    system_prompt = SystemPrompts.CHAT_SYSTEM.value
    return AiModelBase(config, response, system_prompt)


@lru_cache
def build_summary_model():
    config = AiModel.GEMINI_2_5_FLASH.value
    response = SummaryResponse
    system_prompt = SystemPrompts.SUMMARY_SYSTEM.value
    return AiModelBase(config, response, system_prompt)


@lru_cache
def build_merge_validation_model():
    config = AiModel.GEMINI_2_5_FLASH.value
    response = MergeResponse
    system_prompt = SystemPrompts.MERGE_SYSTEM.value
    return AiModelBase(config, response, system_prompt)
