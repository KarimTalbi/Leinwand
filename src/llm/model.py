from typing import Annotated, Any

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field, ConfigDict

from prompts import SystemPrompts

load_dotenv()


class ModelConfig(BaseModel):
    model: str
    model_provider: str
    temperature: Annotated[float, Field(ge=0.0, le=2.0)]
    max_tokens: Annotated[int, Field(ge=0)]
    timeout: Annotated[int, Field(ge=0)]
    max_retries: Annotated[int, Field(ge=0)]
    model_kwargs: dict[str, Any] = Field(default_factory=dict)


class AiModelConfigs:
    PROMPT_NODE = ModelConfig(
        model="gpt-4o-mini",
        model_provider="openai",
        temperature=0.7,
        max_tokens=1024,
        timeout=30,
        max_retries=2,
    )


class AiResponse(BaseModel):
    title: str
    response: str


class AiRequest(BaseModel):
    prompt: str
    target_id: str
    source_handle: str | None = Field(default=None, alias="sourceHandle")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


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
        system_prompt: str = SystemPrompts.PROMPT_NODE,
    ) -> None:
        super().__init__(config, AiResponse, system_prompt)
