from data import CanvasService, AiResponse, AiRequest
from llm import build_context, PromptNodeModel


async def get_context(data: AiRequest, service: CanvasService) -> str:
    ancestors = await service.get_ancestors(data.target_id, data.source_handle)
    return build_context(ancestors)


async def generate_response(
    data: AiRequest, ai_model: PromptNodeModel, service: CanvasService
) -> AiResponse:
    context = await get_context(data, service)
    return await ai_model.generate(context, data.prompt)
