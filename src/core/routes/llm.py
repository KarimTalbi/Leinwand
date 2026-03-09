from fastapi import APIRouter, Depends

from llm import AiModel, Response
from llm.service import PromptService
from src.core.dependencies import get_ai_model, get_context

llm_router = APIRouter(prefix="/llm", tags=["LLM"])


@llm_router.post("/generate/{target_id}")
async def generate_response(
    ctx: str = Depends(get_context),
    ai_model: AiModel = Depends(get_ai_model),
) -> Response:
    service = PromptService(ai_model)
    return await service.generate_graph_response(ctx)
