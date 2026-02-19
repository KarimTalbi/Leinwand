from fastapi import Depends, HTTPException

from core import get_canvas_service
from data import CanvasService
from llm_logic import AiModel, get_ai_model
from llm_logic.context import Context


async def get_current_context(
    target_id: str, service: CanvasService = Depends(get_canvas_service)
) -> str:
    canvas = await service.get(mode="canvas")

    try:
        context = Context(
            nodes=canvas.node_map, edges=canvas.edge_map, target_id=target_id
        )
        return context.build_prompt()
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Target Node not found: {e}")


async def get_ai_response(
    target_id: str,
    context: str = Depends(get_current_context),
    ai_model: AiModel = Depends(get_ai_model),
):
    try:
        response = await ai_model.run_structured(context)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {e}")

    return response
