from collections.abc import AsyncGenerator
from typing import Annotated, Any

from dotenv import load_dotenv
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage
from langfuse.langchain import CallbackHandler
from langfuse.langchain.CallbackHandler import LangchainCallbackHandler
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from data import (
    LLMModelConfig,
    NodeRead,
    UserAuth,
    get_async_session,
    prompts as pr,
)
from service import get_current_active_user, node_service as ns, api_key_service as aks
from utils import extract_content

load_dotenv()

langfuse_handler: LangchainCallbackHandler = CallbackHandler()

llm_router = APIRouter(prefix="/llm", tags=["llm"])


class LlmResponse(BaseModel):
    response: str


class MergeResponse(BaseModel):
    context: list[dict[str, Any]]
    has_issues: bool
    problems: str | None = None


class LLMMergeResponse(LlmResponse):
    has_issues: bool


class MergeResolveResponse(BaseModel):
    context: list[dict[str, Any]]


class MergeRequest(NodeRead):
    check_consistencies: bool = True

class ChatRequest(NodeRead):
    node: NodeRead


@llm_router.post("/merge/", response_model=MergeResponse)
async def merge_streams(
        current_user: Annotated[UserAuth, Depends(get_current_active_user)],
        data: MergeRequest,
        session: AsyncSession = Depends(get_async_session),
) -> Any:
    ancestors: list[dict[str, Any]] = await ns.get_ancestors(session, data.id, current_user.id)

    if not data.check_consistencies:
        return MergeResponse(context=ancestors, has_issues=False)

    config: LLMModelConfig = await aks.get_llm_model_config(session, data, current_user.id)

    model = init_chat_model(**config.model_dump(exclude_none=True, exclude_unset=True))
    model_structured = model.with_structured_output(LLMMergeResponse)

    response: LLMMergeResponse = await model_structured.ainvoke(
        [
            SystemMessage(f"{pr.MERGE_SYSTEM}\n\n{ancestors}"),
            HumanMessage(pr.MERGE_USER),
        ],
        config={"callbacks": [langfuse_handler]},
    )

    if response.has_issues:
        return MergeResponse(
            context=ancestors, has_issues=True, problems=response.response
        )

    return MergeResponse(context=ancestors, has_issues=False)


@llm_router.post("/merge/resolve/")
async def resolve_merge(
        current_user: Annotated[UserAuth, Depends(get_current_active_user)],
        data: MergeRequest,
        session: AsyncSession = Depends(get_async_session),
) -> MergeResolveResponse:
    ancestors: list[dict[str, Any]] = await ns.get_ancestors(session, data.id, current_user.id)
    config: LLMModelConfig = await aks.get_llm_model_config(session, data, current_user.id)

    model = init_chat_model(**config.model_dump(exclude_none=True, exclude_unset=True))
    model_structured = model.with_structured_output(LlmResponse)

    response: LlmResponse = await model_structured.ainvoke(
        [
            SystemMessage(f"{pr.MERGE_RESOLVE_SYSTEM}\n\n{ancestors}"),
            HumanMessage(data.data.get("solution", "Use whatever makes more sense")),
        ],
        config={"callbacks": [langfuse_handler]},
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
    ancestors: list[dict[str, Any]] = await ns.get_ancestors(session, data.id, current_user.id)
    config: LLMModelConfig = await aks.get_llm_model_config(session, data, current_user.id)

    model = init_chat_model(**config.model_dump(exclude_none=True, exclude_unset=True))

    async def token_generator() -> AsyncGenerator[str]:
        async for chunk in model.astream(
                [
                    SystemMessage(f"{pr.CHAT_SYSTEM}\n\n{ancestors}"),
                    HumanMessage(data.data.get("prompt"))
                ],
                config={"callbacks": [langfuse_handler]},
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
    ancestors: list[dict[str, Any]] = await ns.get_ancestors(session, data.id, current_user.id)
    config: LLMModelConfig = await aks.get_llm_model_config(session, data, current_user.id)

    model = init_chat_model(**config.model_dump(exclude_none=True, exclude_unset=True))

    async def token_generator() -> AsyncGenerator[str]:
        async for chunk in model.astream(
                [
                    SystemMessage(f"{pr.SUMMARY_SYSTEM}\n\n{ancestors}"),
                    HumanMessage(pr.SUMMARY_USER)
                ],
                config={"callbacks": [langfuse_handler]},
        ):
            content: str = extract_content(chunk)
            if content:
                escaped: str = content.replace("\n", "\\n")
                yield f"data: {escaped}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(token_generator(), media_type="text/event-stream")
