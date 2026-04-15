from fastapi import APIRouter, Depends

from core import NodeService, get_node_service, build_context
from data import MergeRequest, MergeResponse

context_router = APIRouter(prefix="/context", tags=["context"])



@context_router.post("/context/merge")
async def merge_streams(
    data: MergeRequest, service: NodeService = Depends(get_node_service)
) -> MergeResponse:
    """
    Merges streams by building a context and returning the merged result.

    This asynchronous function handles the merging of streams by building the
    required context using the provided service and data. The context is built
    with a specified target ID and a set number of targets, and the result is
    returned in the form of a `MergeResponse` object.

    Args:
        data: An instance of `MergeRequest` containing the data required for
            merging streams.
        service: An instance of `NodeService`, automatically injected by
            the dependency resolver `Depends`, which provides the necessary
            functionalities for building the context.

    Returns:
        MergeResponse: An instance of `MergeResponse` containing the merged
        data based on the constructed context.
    """
    context = await build_context(service, data.target_id, targets=2)
    return MergeResponse(data=context)
