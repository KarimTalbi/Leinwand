from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.language_models import BaseChatModel

from src.llm_logic.schemas import AiConfig, Prompt, Response

load_dotenv()


class AiModel:
    def __init__(self, config: AiConfig, echo: bool = False):
        self._model: BaseChatModel = init_chat_model(**config.model_dump(exclude_none=True))
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
        return result  # pyright: ignore[reportReturnType]

    # async def stream(self, prompt: Prompt):
    #     async for chunk in self._model.astream(prompt()):
    #         content = chunk.content
    #         if content:
    #             yield content

    def echo(self, is_active: bool):
        self._echo = is_active
