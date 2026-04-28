import logging

from fastapi import FastAPI, Request, Response
from fastapi.exception_handlers import http_exception_handler
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.responses import JSONResponse

from exceptions.custom_exceptions import (
    CanvasNotFoundException,
    EdgeNotFoundException,
    InactiveUserException,
    NodeNotFoundException,
    UserAlreadyExistsException,
)

logger = logging.getLogger(__name__)


# --- Domain exceptions → HTTP responses ---


async def node_not_found_handler(_: Request, exc: NodeNotFoundException) -> JSONResponse:
    logger.debug("Node not found: %s", exc.node_id)
    return JSONResponse(status_code=404, content={"detail": str(exc)})


async def edge_not_found_handler(_: Request, exc: EdgeNotFoundException) -> JSONResponse:
    logger.debug("Edge not found: %s", exc.edge_id)
    return JSONResponse(status_code=404, content={"detail": str(exc)})


async def canvas_not_found_handler(_: Request, exc: CanvasNotFoundException) -> JSONResponse:
    logger.debug("Canvas not found: %s", exc.canvas_id)
    return JSONResponse(status_code=404, content={"detail": str(exc)})


async def user_already_exists_handler(_: Request, exc: UserAlreadyExistsException) -> JSONResponse:
    logger.debug("User already exists: %s", exc.username)
    return JSONResponse(status_code=409, content={"detail": str(exc)})


async def inactive_user_handler(_: Request, exc: InactiveUserException) -> JSONResponse:
    logger.debug("Inactive user: %s", exc.username)
    return JSONResponse(status_code=400, content={"detail": str(exc)})


# --- FastAPI / HTTP exceptions ---


async def http_exception_handler_with_logging(request: Request, exc: HTTPException) -> Response:
    if exc.status_code >= 500:
        logger.error("HTTP %s on %s %s", exc.status_code, request.method, request.url.path)
    else:
        logger.debug("HTTP %s on %s %s", exc.status_code, request.method, request.url.path)
    return await http_exception_handler(request, exc)


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    logger.debug("Request validation failed on %s: %s", request.url.path, exc.errors())
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


# --- Catch-all ---


async def unhandled_exception_handler(request: Request, _: Exception) -> JSONResponse:
    logger.error(
        "Unhandled exception on %s %s",
        request.method,
        request.url.path,
        exc_info=True,
    )
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# --- Registration ---


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(
        NodeNotFoundException,
        node_not_found_handler,  # pyright: ignore[reportArgumentType]
    )
    app.add_exception_handler(
        EdgeNotFoundException,
        edge_not_found_handler,  # pyright: ignore[reportArgumentType]
    )
    app.add_exception_handler(
        CanvasNotFoundException,
        canvas_not_found_handler,  # pyright: ignore[reportArgumentType]
    )
    app.add_exception_handler(
        UserAlreadyExistsException,
        user_already_exists_handler,  # pyright: ignore[reportArgumentType]
    )
    app.add_exception_handler(
        InactiveUserException,
        inactive_user_handler,  # pyright: ignore[reportArgumentType]
    )
    app.add_exception_handler(
        HTTPException,
        http_exception_handler_with_logging,  # pyright: ignore[reportArgumentType]
    )
    app.add_exception_handler(
        RequestValidationError,
        validation_exception_handler,  # pyright: ignore[reportArgumentType]
    )
    app.add_exception_handler(Exception, unhandled_exception_handler)
