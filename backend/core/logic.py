from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from data import CanvasService, get_async_session
from llm_logic import AiModel, get_ai_model
from llm_logic.context import Context

async def get_current_context(
        target_id: str,
        session: AsyncSession = Depends(get_async_session)
) -> str:
    canvas_service = CanvasService(session)
    canvas = await canvas_service.read()

    try:
        context = Context(nodes=canvas.node_map, edges=canvas.edge_map, target_id=target_id)
        return context.build_prompt()
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Target Node not found: {e}")


async def get_ai_response(
        target_id: str,
        context: str = Depends(get_current_context),
        ai_model: AiModel = Depends(get_ai_model),
        session: AsyncSession = Depends(get_async_session)
):
    try:
        response = await ai_model.run_structured(context)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {e}")