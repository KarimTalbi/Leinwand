from functools import lru_cache
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.context import Context, build_context, build_prompt
from data import CanvasService, EdgeService, NodeService, get_async_session
from llm import AiModel, AiResponse, ModelConfig, PromptService


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


async def get_context(
    target_id: UUID, service: CanvasService = Depends(get_canvas_service)
) -> str:
    canvas = await service.load()
    context = Context.from_canvas(target_id, canvas)
    build_context(context)
    build_prompt(context)
    return context.prompt


@lru_cache
def get_ai_model() -> AiModel:
    return AiModel(config=ModelConfig(), structure=AiResponse)


async def get_prompt_service(
    model: AiModel = Depends(get_ai_model),
) -> PromptService:
    return PromptService(model)
