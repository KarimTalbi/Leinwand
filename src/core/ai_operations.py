from data import NodeService
from llm import build_context, PromptNodeModel, AiResponse


async def get_context(
    target_id: str,
    node_service: NodeService,
    target_handle: str | None = None,
) -> str:
    ancestors = await node_service.ancestors(target_id, target_handle)
    return build_context(ancestors)


async def generate_response(
    target_id: str,
    prompt: str,
    ai_model: PromptNodeModel,
    node_service: NodeService,
    target_handle: str | None = None,
) -> AiResponse:
    context = await get_context(target_id, node_service, target_handle)
    return await ai_model.generate(context, prompt)
