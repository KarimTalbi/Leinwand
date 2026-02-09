from typing import Optional, List, Dict, Any, Annotated, Union

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, BaseMessage
from pydantic import BaseModel, PrivateAttr, Field

from llm_logic.prompts import SYSTEM_PROMPT
from llm_logic.types import ModelProvider, GoogleAiModel, OpenAiModel


load_dotenv()



class Response(BaseModel):
    response_text: str


class Prompt(BaseModel):
    system: str = SYSTEM_PROMPT
    context: Optional[str] = None
    user_message: str

    _prompt: List[BaseMessage] = PrivateAttr(default_factory=list)

    def model_post_init(self, __context) -> None:
        self._prompt = [SystemMessage(content=self.system)]

        if self.context:
            self._prompt.append(HumanMessage(content=self.context))

        self._prompt.append(HumanMessage(content=self.user_message))

    @property
    def messages(self) -> List[BaseMessage]:
        return self._prompt


class ConfigBuilder(BaseModel):
    model: Union[GoogleAiModel, OpenAiModel] = "gpt-4o-mini"
    model_provider: ModelProvider = "openai"
    temperature: Annotated[float, Field(ge=0.0, le=2.0)] = 0.7
    max_tokens: Annotated[int, Field(ge=0)] = 1024
    timeout: Annotated[int, Field(ge=0)] = 30
    max_retries: Annotated[int, Field(ge=0)] = 2
    model_kwargs: Dict[str, Any] = Field(default_factory=dict)


class AiModel:
    def __init__(self, config: ConfigBuilder = ConfigBuilder()):
        self._config: Dict[str, Any] = config.model_dump(exclude_none=True)
        self._model = init_chat_model(**self._config)

    def run(self, prompt: Prompt):
        return self._model.invoke(prompt.messages)