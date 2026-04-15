import logging
from typing import Any

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain.messages import HumanMessage, SystemMessage
from langfuse.langchain import CallbackHandler

from data import AiResponse
from src.llm.prompts.load_prompt import SystemPrompts
from utils.config import AiModelConfigs, ModelConfig

logger = logging.getLogger("app.ai_model")

load_dotenv()
langfuse_handler = CallbackHandler()


class AiModelBase[_T]:
    """Base class for managing AI models with structured output and system prompts.

    This class serves as a foundation for implementing AI models that generate
    structured responses based on given system prompts and user input. It initializes
    the AI model using a provided configuration and allows for asynchronous generation
    of responses based on context and prompts.

    Attributes:
        model (Any): An instance of the AI chat model configured using the provided
            `ModelConfig` and structured output type.
        system (str): The system prompt used to guide the AI model in generating responses.
    """

    def __init__(self, config: ModelConfig, response: _T, system_prompt: str) -> None:
        self.model = init_chat_model(
            **config.model_dump(exclude_none=True)
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


class PromptNodeModel(AiModelBase[AiResponse]):
    """
    Represents a prompt-based AI model node.

    This class is designed to encapsulate the structure for a prompt-based AI model.
    It serves as a specialized implementation of a base AI model focused on prompt
    generation and response handling. This class is intended for scenarios where a
    structured system prompt and model configuration are required to interact with
    a prompt-based AI system.

    Attributes:
        config (ModelConfig): Configuration settings for the AI model.
        system_prompt (str): System prompt used to align AI responses.
    """

    def __init__(
        self,
        config: ModelConfig = AiModelConfigs.GEMINI_FLASH_LITE_25,
        system_prompt: str = SystemPrompts.PROMPT_NODE_SYSTEM,
    ) -> None:
        super().__init__(config, AiResponse, system_prompt)


class SummaryNodeModel(AiModelBase[AiResponse]):
    def __init__(
        self,
        config: ModelConfig = AiModelConfigs.GEMINI_FLASH_LITE_25,
        system_prompt: str = SystemPrompts.SUMMARY_NODE_SYSTEM,
    ) -> None:
        super().__init__(config, AiResponse, system_prompt)
