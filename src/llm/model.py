from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain.messages import SystemMessage, HumanMessage
from pydantic import BaseModel

from data import AiResponse
from src.config import ModelConfig, AiModelConfigs
from src.llm.prompts.load_prompt import SystemPrompts

load_dotenv()


class AiModelBase[_T: BaseModel]:
    def __init__(self, config: ModelConfig, response: _T, system_prompt: str) -> None:
        self.model = init_chat_model(
            **config.model_dump(exclude_none=True)
        ).with_structured_output(response)

        self.system = system_prompt

    async def generate(self, context: str, prompt: str) -> _T:
        return await self.model.ainvoke(
            [SystemMessage(f"{self.system}\n\n{context}"), HumanMessage(prompt)]
        )


class PromptNodeModel(AiModelBase[AiResponse]):
    def __init__(
        self,
        config: ModelConfig = AiModelConfigs.PROMPT_NODE,
        system_prompt: str = SystemPrompts.PROMPT_NODE_SYSTEM,
    ) -> None:
        super().__init__(config, AiResponse, system_prompt)
