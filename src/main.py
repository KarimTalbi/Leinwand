import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from data import engine, init_db
from llm import PromptNodeModel
from routes import user_router, canvas_router, llm_router, context_router
from utils.config import setup_logging

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

app.include_router(user_router)
app.include_router(canvas_router)
app.include_router(llm_router)
app.include_router(context_router)


app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
