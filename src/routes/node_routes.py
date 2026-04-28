from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from data import (
    NodeCreate,
    NodeRead,
    NodeUpdate,
    UserAuth,
    get_async_session,
)
from llm import (
    build_chat_model,
    build_merge_resolution_model,
    build_merge_validation_model,
    build_summary_model,
)
from service import get_current_active_user
from service import node_service as ns

node_router = APIRouter(prefix="/node", tags=["node"])


@node_router.get("/list/{canvas_id}/", response_model=list[NodeRead])
async def get_nodes(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await ns.list_nodes(session, current_user.id, UUID(canvas_id))


@node_router.get("/{node_id}", response_model=NodeRead)
async def get_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    node_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await ns.get_node(session, UUID(node_id), current_user.id)


@node_router.post("/create/{canvas_id}/", response_model=NodeRead)
async def create_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    node_create: NodeCreate,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await ns.create_node(session, node_create, UUID(canvas_id), current_user.id)


@node_router.delete("/{node_id}/delete/")
async def delete_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    node_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> UUID:
    return await ns.delete_node(session, UUID(node_id), current_user.id)


@node_router.put("/{node_id}/update/", response_model=NodeRead)
async def update_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    node_id: str,
    node_update: NodeUpdate,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await ns.update_node(session, UUID(node_id), node_update, current_user.id)


@node_router.get("/{node_id}/merge/", response_model=NodeRead)
async def get_context(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    node_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    node = await ns.get_node(session, UUID(node_id), current_user.id)

    problems = node.data.get("problems")
    solution = node.data.get("solution")

    if problems and solution:
        context: list[dict[str, Any]] = node.data.get("context", {})

        model = build_merge_resolution_model()
        result = await model.generate_with_context(
            context,
            "write a solution that will be appended"
            "at the end of the text so we know which"
            "truth will be accepted from now on.",
        )

        context.append(
            {
                "type": "problemResolution",
                "ai": problems,
                "user": solution,
                "solution": result.response,
            }
        )

        return await ns.update_node_data(
            session,
            UUID(node_id),
            current_user.id,
            {"context": context, "problems": "", "solution": "", "closed": True},
        )

    ancestors = await ns.get_ancestors(session, node.id, current_user.id)
    model = build_merge_validation_model()
    result = await model.generate_with_context(ancestors, "check the context for inconsistencies")

    if result.has_issues:  # type: ignore
        return await ns.update_node_data(
            session,
            UUID(node_id),
            current_user.id,
            {"context": ancestors, "problems": result.response},
        )

    return await ns.update_node_data(
        session, UUID(node_id), current_user.id, {"context": ancestors, "closed": True}
    )


@node_router.get("/{node_id}/chat/", response_model=NodeRead)
async def get_chat_response(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    node_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    node = await ns.get_node(session, UUID(node_id), current_user.id)
    model = build_chat_model()

    ancestors = await ns.get_ancestors(session, node.id, current_user.id)
    response = await model.generate_with_context(ancestors, node.data.get("prompt", ""))

    return await ns.update_node_data(
        session,
        node.id,
        current_user.id,
        {"response": response.response, "closed": True},
    )


@node_router.get("/{node_id}/streaming_chat/")
async def get_streaming_chat_response(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    node_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> StreamingResponse:
    node = await ns.get_node(session, UUID(node_id), current_user.id)
    model = build_chat_model()

    ancestors = await ns.get_ancestors(session, node.id, current_user.id)

    async def token_generator():
        accumulated = ""
        async for token in model.stream_with_context(ancestors, node.data.get("prompt", "")):
            accumulated += token  # type: ignore
            yield f"data: {token.replace(chr(10), '\\n')}\n\n"

        await ns.update_node_data(
            session, node.id, current_user.id, {"response": accumulated, "closed": True}
        )
        yield "data: [DONE]\n\n"

    return StreamingResponse(token_generator(), media_type="text/event-stream")


@node_router.get("/{node_id}/summary", response_model=NodeRead)
async def get_summary(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    node_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    ancestors = await ns.get_ancestors(session, UUID(node_id), current_user.id)
    model = build_summary_model()
    response = await model.generate_with_context(
        ancestors,
        "summarize the topics in the context. Don't mention it being the context or being"
        "a summary. Summarize as if i would tell you to summarize a topic.",
    )

    return await ns.update_node_data(
        session,
        UUID(node_id),
        current_user.id,
        {"summary": response.response, "closed": True},
    )
