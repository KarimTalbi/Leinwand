import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import setup_logging
from core import (
    CanvasService,
    get_canvas_service,
    build_context,
    NodeService,
    get_node_service,
)
from data import (
    AiRequest,
    AiResponse,
    CanvasRead,
    MergeRequest,
    engine,
    init_db,
    MergeResponse,
    SummaryRequest,
)
from llm import PromptNodeModel, SummaryNodeModel

# initialize logging
setup_logging()
logger = logging.getLogger("app.http")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the lifecycle for the application, including initializing required
    resources and releasing them during shutdown.

    This function acts as an asynchronous context manager for setting up and
    tearing down resources like the database connection and AI model used
    within the FastAPI app.

    Args:
        app (FastAPI): The FastAPI application instance for which the lifecycle
            management is performed.

    Yields:
        None: Allows the application to operate between the setup and teardown
            of necessary resources.
    """
    await init_db(reset=False)

    app.state.ai_model = PromptNodeModel()

    yield

    await engine.dispose()


# FastAPI app setup
app: FastAPI = FastAPI(lifespan=lifespan)


app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_ai_model(request: Request) -> PromptNodeModel:
    """
    Retrieves the AI model instance from the application state.

    This function accesses the `ai_model` stored in the application's state and
    returns it as a `PromptNodeModel`. It assumes that the application structure
    includes the `ai_model` in its state.

    Args:
        request (Request): The FastAPI request object containing the app state.

    Returns:
        PromptNodeModel: The AI model instance stored in the application's state.
    """
    return request.app.state.ai_model


@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    """
    Middleware for handling database session lifecycle during HTTP requests.

    This middleware captures all incoming HTTP requests and attempts to process
    them while maintaining error handling mechanisms. In case of an unhandled
    exception, it responds with a 500 status code and provides an error
    message with the exception details in JSON format.

    Args:
        request (Request): The incoming HTTP request.
        call_next (Callable): A callable function to process the request and
            produce a response.

    Returns:
        Response: The HTTP response after processing the request. In case of
        an error, a JSON response with status code 500 is returned.
    """
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(
            "Unhandled exception on %s %s",
            request.method,
            request.url.path,
            exc_info=True,
        )
        return JSONResponse(
            status_code=500, content={"detail": f"{type(e).__name__}: {e}"}
        )


# --- CANVAS DATA ---
@app.get("/canvas")
async def canvas(
    service: CanvasService = Depends(get_canvas_service),
) -> CanvasRead:
    """
    Handles the GET request to the '/canvas' endpoint.

    This function retrieves the list of canvas objects by invoking the
    CanvasService's `list` method. The CanvasService instance is provided via
    dependency injection.

    Args:
        service: The CanvasService instance retrieved via the dependency injection
            system.

    Returns:
        CanvasRead: An instance of CanvasRead containing the result of the
        canvas service's list operation.
    """
    return await service.list()


@app.post("/canvas")
async def canvas_sync(
    data: CanvasRead, service: CanvasService = Depends(get_canvas_service)
) -> None:
    """
    Handles the synchronization of canvas data by invoking the relevant service.

    This endpoint is responsible for receiving and processing the canvas data
    and delegating the synchronization task to the corresponding service.

    Args:
        data: An instance of CanvasRead containing the canvas data to be synchronized.
        service: An optional dependency injection of CanvasService that provides
            the necessary synchronization functionality. Defaults to fetching the
            service instance via `get_canvas_service`.

    """
    await service.sync(data)


# --- AI ---
@app.post("/llm/generate")
async def get_response(
    data: AiRequest,
    service: NodeService = Depends(get_node_service),
    ai_model: PromptNodeModel = Depends(get_ai_model),
) -> AiResponse:
    """
    Handles AI response generation from a given prompt and context through a specified AI model and service.

    This function processes an input request to generate a response using the provided
    service and AI model dependencies. The function first builds the required context
    based on the target ID and then generates a response by invoking the AI model with
    the generated context and input prompt.

    Args:
        data (AiRequest): Input request object containing the prompt and target identifier.
        service (NodeService): Dependency that provides the node service instance.
        ai_model (PromptNodeModel): Dependency that provides the AI model instance.

    Returns:
        AiResponse: The response generated by the AI model based on the input prompt and context.
    """
    if not data.include_context:
        logger.info("Generating response without context")
        return await ai_model.generate_without_context(data.prompt)

    context = await build_context(service, data.target_id)
    return await ai_model.generate(context, data.prompt)


@app.post("/llm/summarize")
async def summarize(
    data: SummaryRequest,
    service: NodeService = Depends(get_node_service),
    ai_model: SummaryNodeModel = Depends(get_ai_model),
) -> AiResponse:
    context = await build_context(service, data.target_id)
    return await ai_model.generate(context, "generate a summary")


# --- CONTEXT ---
@app.post("/context/merge")
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


if __name__ == "__main__":
    # Run the FastAPI app
    uvicorn.run(app, host="0.0.0.0", port=8000)
