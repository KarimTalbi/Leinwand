from collections.abc import AsyncGenerator
from typing import Annotated, Any

from dotenv import load_dotenv
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage
from langfuse.langchain import CallbackHandler
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

load_dotenv()

langfuse_handler = CallbackHandler()

llm_router = APIRouter(prefix="/llm", tags=["llm"])


class LLMBase(BaseModel):
    config: LLMModelConfig | None = None


class MergeRequest(LLMBase):
    node: NodeRead
    check_consistencies: bool = True


class MergeResponse(BaseModel):
    context: list[dict[str, Any]]
    has_issues: bool
    problems: str | None = None


class LLMMergeResponse(BaseModel):
    response: str
    has_issues: bool


class MergeResolveRequest(LLMBase):
    node: NodeRead

class MergeResolveResponse(BaseModel):
    context: list[dict[str, Any]]

class LLMMergeResolveResponse(BaseModel):
    response: str


class ChatRequest(LLMBase):
    node: NodeRead


class SummaryRequest(LLMBase):
    node: NodeRead


@llm_router.post("/merge/")
async def merge_streams(
        current_user: Annotated[UserAuth, Depends(get_current_active_user)],
        data: MergeRequest,
        session: AsyncSession = Depends(get_async_session),
) -> MergeResponse:
    ancestors: list[dict[str, Any]] = await ns.get_ancestors(session, data.node.id, current_user.id)

    if not data.check_consistencies:
        return MergeResponse(context=ancestors, has_issues=False)

    ancestors = await ns.get_ancestors(session, data.node.id, current_user.id)
    model_config = data.node.data.get("model", {})

    user_model = model_config.get("model", "")
    user_provider = model_config.get("modelProvider", "")
    user_key_id = model_config.get("key_id", "")

    if not (user_model and user_provider and user_key_id):
        raise ValueError("No default model set")

    api_key = await aks.get_key(session, user_key_id, current_user.id)

    config = LLMModelConfig(
        model=user_model,
        api_key=api_key,
        model_provider=user_provider,
    )

    # noinspection PyUnresolvedReferences
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
        data: MergeResolveRequest,
        session: AsyncSession = Depends(get_async_session),
) -> MergeResolveResponse:
    ancestors: list[dict[str, Any]] = await ns.get_ancestors(session, data.node.id, current_user.id)

    ancestors = await ns.get_ancestors(session, data.node.id, current_user.id)
    model_config = data.node.data.get("model", {})

    user_model = model_config.get("model", "")
    user_provider = model_config.get("modelProvider", "")
    user_key_id = model_config.get("key_id", "")

    if not (user_model and user_provider and user_key_id):
        raise ValueError("No default model set")

    api_key = await aks.get_key(session, user_key_id, current_user.id)

    config = LLMModelConfig(
        model=user_model,
        api_key=api_key,
        model_provider=user_provider,
    )

    # noinspection PyUnresolvedReferences
    model = init_chat_model(**config.model_dump(exclude_none=True, exclude_unset=True))
    model_structured = model.with_structured_output(LLMMergeResolveResponse)

    response: LLMMergeResolveResponse = await model_structured.ainvoke(
        [
            SystemMessage(f"{pr.MERGE_RESOLVE_SYSTEM}\n\n{ancestors}"),
            HumanMessage(pr.MERGE_RESOLVE_USER),
        ],
        config={"callbacks": [langfuse_handler]},
    )

    context = ancestors.copy()
    context.append(
        {
            "id": "problem",
            "type": "problemResolution",
            "problems": data.node.data.get("problems"),
            "user": data.node.data.get("solution"),
            "solution": response.response,
        }
    )

    return MergeResolveResponse(context=context)


@llm_router.post("/streaming_chat/")
async def get_streaming_chat_response(
        current_user: Annotated[UserAuth, Depends(get_current_active_user)],
        data: ChatRequest,
        session: AsyncSession = Depends(get_async_session),
) -> StreamingResponse:
    ancestors = await ns.get_ancestors(session, data.node.id, current_user.id)
    model_config = data.node.data.get("model", {})

    user_model = model_config.get("model", "")
    user_provider = model_config.get("modelProvider", "")
    user_key_id = model_config.get("key_id", "")

    if not (user_model and user_provider and user_key_id):
        raise ValueError("No default model set")

    api_key = await aks.get_key(session, user_key_id, current_user.id)

    config = LLMModelConfig(
        model=user_model,
        api_key=api_key,
        model_provider=user_provider,
    )

    model = init_chat_model(**config.model_dump(exclude_none=True, exclude_unset=True))

    async def token_generator() -> AsyncGenerator[str]:
        async for chunk in model.astream(
                [
                    SystemMessage(f"{pr.CHAT_SYSTEM}\n\n{ancestors}"),
                    HumanMessage(data.node.data.get("prompt"))
                ],
                config={"callbacks": [langfuse_handler]},
        ):
            if chunk.content:
                escaped_content = chunk.content.replace("\n", "\\n")
                yield f"data: {escaped_content}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(token_generator(), media_type="text/event-stream")


@llm_router.post("/summary/")
async def get_summary_response(
        current_user: Annotated[UserAuth, Depends(get_current_active_user)],
        data: SummaryRequest,
        session: AsyncSession = Depends(get_async_session),
) -> StreamingResponse:
    ancestors = await ns.get_ancestors(session, data.node.id, current_user.id)
    ancestors = await ns.get_ancestors(session, data.node.id, current_user.id)
    model_config = data.node.data.get("model", {})

    user_model = model_config.get("model", "")
    user_provider = model_config.get("modelProvider", "")
    user_key_id = model_config.get("key_id", "")

    if not (user_model and user_provider and user_key_id):
        raise ValueError("No default model set")

    api_key = await aks.get_key(session, user_key_id, current_user.id)

    config = LLMModelConfig(
        model=user_model,
        api_key=api_key,
        model_provider=user_provider,
    )
    model = init_chat_model(**config.model_dump(exclude_none=True, exclude_unset=True))

    async def token_generator() -> AsyncGenerator[str]:
        async for chunk in model.astream(
                [
                    SystemMessage(f"{pr.SUMMARY_SYSTEM}\n\n{ancestors}"),
                    HumanMessage(pr.SUMMARY_USER)
                ],
                config={"callbacks": [langfuse_handler]},
        ):
            if chunk.content:
                escaped_content = chunk.content.replace("\n", "\\n")
                yield f"data: {escaped_content}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(token_generator(), media_type="text/event-stream")
