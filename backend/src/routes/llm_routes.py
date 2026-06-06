"""
This module defines the API routes for Language Model (LLM) interactions.

It provides endpoints for:
- Merging and checking the consistency of data streams using an LLM.
- Resolving inconsistencies in data streams with LLM assistance.
- Generating streaming chat responses based on a given context.
- Generating streaming summaries of a given context.

The routes leverage LangChain for model initialization and Langfuse for tracing.
"""
import os
from collections.abc import AsyncGenerator
from typing import Annotated, Any

from dotenv import load_dotenv
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage
from langfuse.langchain import CallbackHandler
from langfuse.langchain.CallbackHandler import LangchainCallbackHandler
from sqlalchemy.ext.asyncio import AsyncSession

from data import (
    LLMMergeResponse,
    LLMModelConfig,
    LlmResponse,
    MergeRequest,
    MergeResolveResponse,
    MergeResponse,
    NodeRead,
    UserAuth,
    get_async_session,
)
from data import (
    prompts as pr,
)
from service import api_key_service as aks
from service import get_current_active_user
from service import node_service as ns
from utils import extract_content

load_dotenv()

langfuse_handler = None

if os.getenv("LANGFUSE_PUBLIC_KEY") and os.getenv("LANGFUSE_SECRET_KEY"):
    langfuse_handler = CallbackHandler()

llm_router = APIRouter(prefix="/llm", tags=["llm"])


@llm_router.post("/merge/", response_model=MergeResponse)
async def merge_streams(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    data: MergeRequest,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    """
    Analyzes the ancestors of a given node for inconsistencies using an LLM.

    It retrieves the history (ancestors) of a node and asks an LLM to check for
    logical issues or problems. It returns the context and a flag indicating
    if any issues were found.

    Args:
        current_user: The authenticated user.
        data: The request data, including the node to check.
        session: The database session.

    Returns:
        A MergeResponse object containing the context and any identified problems.
    """
    ancestors: list[dict[str, Any]] = await ns.get_ancestors(session, data.id, current_user.id)

    if not data.check_consistencies:
        return MergeResponse(context=ancestors, has_issues=False)

    config: LLMModelConfig = await aks.get_llm_model_config(session, data, current_user.id)

    model = init_chat_model(**config.model_dump(exclude_none=True, exclude_unset=True))
    model_structured = model.with_structured_output(LLMMergeResponse)

    callbacks = [langfuse_handler] if langfuse_handler else []

    response: LLMMergeResponse = await model_structured.ainvoke(
        [
            SystemMessage(f"{pr.MERGE_SYSTEM}\n\n{ancestors}"),
            HumanMessage(pr.MERGE_USER),
        ],
        config={"callbacks": callbacks},
    )

    if response.has_issues:
        return MergeResponse(context=ancestors, has_issues=True, problems=response.response)

    return MergeResponse(context=ancestors, has_issues=False)


@llm_router.post("/merge/resolve/")
async def resolve_merge(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    data: MergeRequest,
    session: AsyncSession = Depends(get_async_session),
) -> MergeResolveResponse:
    """
    Uses an LLM to propose a resolution for identified inconsistencies in a data stream.

    Given a node, its history, and a user-provided suggestion, this endpoint
    asks an LLM to generate a corrected or resolved version of the data.

    Args:
        current_user: The authenticated user.
        data: The request data, including the node, its context, and a user solution.
        session: The database session.

    Returns:
        A MergeResolveResponse object containing the resolved context.
    """
    ancestors: list[dict[str, Any]] = await ns.get_ancestors(session, data.id, current_user.id)
    config: LLMModelConfig = await aks.get_llm_model_config(session, data, current_user.id)

    model = init_chat_model(**config.model_dump(exclude_none=True, exclude_unset=True))
    model_structured = model.with_structured_output(LlmResponse)

    callbacks = [langfuse_handler] if langfuse_handler else []

    response: LlmResponse = await model_structured.ainvoke(
        [
            SystemMessage(f"{pr.MERGE_RESOLVE_SYSTEM}\n\n{ancestors}"),
            HumanMessage(data.data.get("solution", "Use whatever makes more sense")),
        ],
        config={"callbacks": callbacks},
    )

    context: list[dict[str, Any]] = ancestors.copy()
    context.append(
        {
            "id": "problem",
            "type": "problemResolution",
            "problems": data.data.get("problems"),
            "user": data.data.get("solution"),
            "solution": response.response,
        }
    )

    return MergeResolveResponse(context=context)


@llm_router.post("/streaming_chat/")
async def get_streaming_chat_response(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    data: NodeRead,
    session: AsyncSession = Depends(get_async_session),
) -> StreamingResponse:
    """
    Generates a streaming chat response from an LLM based on node context.

    This endpoint takes a node, retrieves its ancestral context, and streams
    a response from the LLM based on a prompt contained within the node's data.

    Args:
        current_user: The authenticated user.
        data: The node data, including the prompt.
        session: The database session.

    Returns:
        A StreamingResponse that yields server-sent events for the chat response.
    """
    ancestors: list[dict[str, Any]] = await ns.get_ancestors(session, data.id, current_user.id)
    config: LLMModelConfig = await aks.get_llm_model_config(session, data, current_user.id)

    model = init_chat_model(**config.model_dump(exclude_none=True, exclude_unset=True))

    callbacks = [langfuse_handler] if langfuse_handler else []

    async def token_generator() -> AsyncGenerator[str]:
        async for chunk in model.astream(
            [
                SystemMessage(f"{pr.CHAT_SYSTEM}\n\n{ancestors}"),
                HumanMessage(data.data.get("prompt")),
            ],
            config={"callbacks": callbacks},
        ):
            content: str = extract_content(chunk)
            if content:
                escaped: str = content.replace("\n", "\\n")
                yield f"data: {escaped}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(token_generator(), media_type="text/event-stream")


@llm_router.post("/summary/")
async def get_summary_response(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    data: NodeRead,
    session: AsyncSession = Depends(get_async_session),
) -> StreamingResponse:
    """
    Generates a streaming summary of a node's context using an LLM.

    This endpoint retrieves the ancestral context of a node and asks the LLM
    to provide a summary, which is then streamed back to the client.

    Args:
        current_user: The authenticated user.
        data: The node for which to generate a summary.
        session: The database session.

    Returns:
        A StreamingResponse that yields server-sent events for the summary.
    """
    ancestors: list[dict[str, Any]] = await ns.get_ancestors(session, data.id, current_user.id)
    config: LLMModelConfig = await aks.get_llm_model_config(session, data, current_user.id)

    model = init_chat_model(**config.model_dump(exclude_none=True, exclude_unset=True))

    callbacks = [langfuse_handler] if langfuse_handler else []

    async def token_generator() -> AsyncGenerator[str]:
        async for chunk in model.astream(
            [SystemMessage(f"{pr.SUMMARY_SYSTEM}\n\n{ancestors}"), HumanMessage(pr.SUMMARY_USER)],
            config={"callbacks": callbacks},
        ):
            content: str = extract_content(chunk)
            if content:
                escaped: str = content.replace("\n", "\\n")
                yield f"data: {escaped}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(token_generator(), media_type="text/event-stream")
