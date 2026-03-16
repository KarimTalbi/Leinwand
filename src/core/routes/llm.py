import uuid
from uuid import UUID

from fastapi import APIRouter, Depends

from data import NodeRead, PromptRequest
from llm import AiModel, Response
from llm.service import PromptService
from src.core.context.model import Context
from src.core.dependencies import get_ai_model, get_context

llm_router = APIRouter(prefix="/llm", tags=["LLM"])


@llm_router.post("/generate/{target_id}")
async def generate_response(
    ctx: Context = Depends(get_context),
    ai_model: AiModel = Depends(get_ai_model),
) -> Response:
    service = PromptService(ai_model)
    return await service.generate_graph_response(ctx)


@llm_router.post("/test")
async def test_response(request: PromptRequest) -> NodeRead:
    node = NodeRead(
        id=request.target_id,
        type="Nodle",
        pos_x=100,
        pos_y=100,
        data={
            "label": "test label",
            "prompt": request.prompt,
            "response": "test response",
        },
    )
    return node
