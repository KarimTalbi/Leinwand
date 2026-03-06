from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import CanvasService, EdgeService, NodeService, get_async_session
from llm_logic import AiConfig, AiModel


async def get_canvas_service(session: AsyncSession = Depends(get_async_session)) -> CanvasService:
    return CanvasService(session)


async def get_node_service(session: AsyncSession = Depends(get_async_session)) -> NodeService:
    return NodeService(session)


async def get_edge_service(session: AsyncSession = Depends(get_async_session)) -> EdgeService:
    return EdgeService(session)


def get_ai_model(config: AiConfig = AiConfig(), echo: bool = True) -> AiModel:
    return AiModel(config=config, echo=echo)
