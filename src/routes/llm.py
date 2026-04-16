from fastapi import APIRouter, Depends

from core import NodeService, get_node_service, get_ai_model, build_context
from llm import AiRequest, AiResponse, SummaryRequest
from llm import PromptNodeModel, SummaryNodeModel

llm_router = APIRouter(prefix="/llm", tags=["llm"])


@llm_router.post("/llm/generate")
async def get_response(
    data: AiRequest,
    service: NodeService = Depends(get_node_service),
    ai_model: PromptNodeModel = Depends(get_ai_model),
) -> AiResponse:
    if not data.include_context:
        return await ai_model.generate_without_context(data.prompt)

    context = await build_context(service, data.target_id)
    return await ai_model.generate(context, data.prompt)


@llm_router.post("/llm/summarize")
async def summarize(
    data: SummaryRequest,
    service: NodeService = Depends(get_node_service),
    ai_model: SummaryNodeModel = Depends(get_ai_model),
) -> AiResponse:
    context = await build_context(service, data.target_id)
    return await ai_model.generate(context, "generate a summary")
