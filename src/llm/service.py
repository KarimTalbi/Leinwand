from __future__ import annotations

from typing import TYPE_CHECKING

from src.llm.schemas import Prompt

if TYPE_CHECKING:
    from src.llm.model import AiModel
    from src.llm.schemas import AiResponse


SYSTEM_PROMPT = (
    "SYSTEM INSTRUCTIONS:\n"
    "You are analyzing a Directed Acyclic Graph (DAG) representing a logic workflow.\n"
    "- NODES are provided in TOPOLOGICAL ORDER (logical sequence).\n"
    "- PREREQUISITES: Requirements that must be satisfied before the current node.\n"
    "- LOGIC STREAMS: Parallel paths; nodes in the same stream are part of a specific flow.\n"
    "- TARGET NODE: The specific node we are currently evaluating. Use its lineage to provide context.\n"
    "If a node has 'No previous response', it has not yet been executed in the workflow.\n"
    '- DO NOT apologize for "inconsistencies" or "memory errors" occurring across different branches. '
    "Understand that they were parallel paths.\n"
    "When there is only the Target Node provided, that means it is a new root node without any lineage\n"
    "Use Markdown for formatting\n"
    "Additionaly return a short title that is descriptive of the content of the response"
    f"{'=' * 50}"
)


class PromptService:
    def __init__(self, model: AiModel) -> None:
        self.model = model

    async def generate_graph_response(self, ctx: str, prompt: str) -> AiResponse:
        txt = Prompt(system=SYSTEM_PROMPT, context=ctx, prompt=prompt)
        return await self.model.run(txt.get)
