from functools import lru_cache

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import CanvasService, EdgeService, NodeService, get_async_session
from llm import AiResponse, ModelConfig, PromptService


async def get_canvas_service(
    session: AsyncSession = Depends(get_async_session),
) -> CanvasService:
    return CanvasService(session)


async def get_node_service(
    session: AsyncSession = Depends(get_async_session),
) -> NodeService:
    return NodeService(session)


async def get_edge_service(
    session: AsyncSession = Depends(get_async_session),
) -> EdgeService:
    return EdgeService(session)


@lru_cache
def get_ai_model() -> PromptNodeModel:
    return PromptNodeModel(config=ModelConfig(), structure=AiResponse)


async def get_prompt_service(
    model: PromptNodeModel = Depends(get_ai_model),
) -> PromptService:
    return PromptService(model)
