from fastapi import APIRouter, Depends

from core import NodeService, get_node_service, build_context
from llm import MergeRequest, MergeResponse

context_router = APIRouter(prefix="/context", tags=["context"])


@context_router.post("/context/merge")
async def merge_streams(
    data: MergeRequest, service: NodeService = Depends(get_node_service)
) -> MergeResponse:
    context = await build_context(service, data.target_id, targets=2)
    return MergeResponse(data=context)
