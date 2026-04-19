import logging
from typing import Any

from langchain.chat_models import init_chat_model
from langchain.messages import HumanMessage, SystemMessage
from langfuse.langchain import CallbackHandler

from src.llm.prompts.load_prompt import SystemPrompts

logger = logging.getLogger(__name__)

langfuse_handler = CallbackHandler()


class AiModelBase[_T]:

    def __init__(self, config: ModelConfig, response: _T, system_prompt: str) -> None:
        self.model = init_chat_model(
            **config.model_dump(exclude_none=True), api_key=""
        ).with_structured_output(response)

        self.system = system_prompt

    async def generate(self, context: Any, prompt: str) -> _T:
        result = await self.model.ainvoke(
            [SystemMessage(f"{self.system}\n\n{context}"), HumanMessage(prompt)],
            config={"callbacks": [langfuse_handler]},
        )

        return result

    async def generate_without_context(self, prompt: str) -> _T:
        result = await self.model.ainvoke(
            [HumanMessage(prompt)],
            config={"callbacks": [langfuse_handler]},
        )

        return result


class ChatModel(AiModelBase[AiResponse]):
    def __init__(
        self,
        config: ModelConfig = AiModelConfigs.GEMINI_FLASH_LITE_25,
        system_prompt: str = SystemPrompts.PROMPT_NODE_SYSTEM,
    ) -> None:
        super().__init__(config, AiResponse, system_prompt)


class SummaryModel(AiModelBase[AiResponse]):
    def __init__(
        self,
        config: ModelConfig = AiModelConfigs.GEMINI_FLASH_LITE_25,
        system_prompt: str = SystemPrompts.SUMMARY_NODE_SYSTEM,
    ) -> None:
        super().__init__(config, AiResponse, system_prompt)
