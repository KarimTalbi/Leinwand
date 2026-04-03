from data import NodeService, AiResponse, AiRequest
from llm import build_context, PromptNodeModel


async def get_context(
    data: AiRequest,
    node_service: NodeService,
) -> str:
    ancestors = await node_service.ancestors(data.target_id, data.source_handle)
    return build_context(ancestors)


async def generate_response(
    data: AiRequest, ai_model: PromptNodeModel, node_service: NodeService
) -> AiResponse:
    context = await get_context(data, node_service)
    return await ai_model.generate(context, data.prompt)
