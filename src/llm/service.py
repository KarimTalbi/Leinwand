from __future__ import annotations

from typing import TYPE_CHECKING

from src.llm.prompt import SYSTEM_PROMPT
from src.llm.schemas import Prompt

if TYPE_CHECKING:
    from src.llm.model import AiModel
    from src.llm.schemas import AiResponse


class PromptService:
    def __init__(self, model: AiModel) -> None:
        self.model = model

    async def generate_graph_response(self, ctx: str, prompt: str) -> AiResponse:
        txt = Prompt(system=SYSTEM_PROMPT, context=ctx, prompt=prompt)
        return await self.model.run(txt.get)
