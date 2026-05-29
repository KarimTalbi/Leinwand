
import logging
from logging import Logger

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
    InvalidApiKeyException, UserNotFoundException, ProviderError, RateLimitError
)

logger: Logger = logging.getLogger(__name__)


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


async def api_key_not_found_handler(_: Request, exc: InvalidApiKeyException) -> JSONResponse:
    logger.debug("API Key Error: %s", exc.message)
    return JSONResponse(status_code=404, content={"detail": str(exc)})


async def rate_limit_handler(_: Request, exc: RateLimitError) -> JSONResponse:
    logger.debug("Rate limit Error: %s", exc.message)
    return JSONResponse(status_code=429, content={"detail": str(exc)})


async def Provider_error_handler(_: Request, exc: ProviderError) -> JSONResponse:
    logger.debug("Provider Error: %s", exc.message)
    return JSONResponse(status_code=500, content={"detail": str(exc)})


async def user_not_found_handler(_: Request, exc: UserNotFoundException) -> JSONResponse:
    logger.debug("User not found:")
    return JSONResponse(status_code=404, content={"detail": str(exc)})


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


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    known = (ValueError, KeyError)
    if isinstance(exc, known):
        logger.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc)
    else:
        logger.error("Unhandled exception on %s %s", request.method, request.url.path, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# --- Registration ---


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(
        NodeNotFoundException,
        # pyrefly: ignore [bad-argument-type]
        node_not_found_handler,
    )
    app.add_exception_handler(
        EdgeNotFoundException,
        # pyrefly: ignore [bad-argument-type]
        edge_not_found_handler,
    )
    app.add_exception_handler(
        CanvasNotFoundException,
        # pyrefly: ignore [bad-argument-type]
        canvas_not_found_handler,
    )
    app.add_exception_handler(
        UserAlreadyExistsException,
        # pyrefly: ignore [bad-argument-type]
        user_already_exists_handler,
    )
    app.add_exception_handler(
        InactiveUserException,
        # pyrefly: ignore [bad-argument-type]
        inactive_user_handler,
    )
    app.add_exception_handler(
        HTTPException,
        # pyrefly: ignore [bad-argument-type]
        http_exception_handler_with_logging,
    )
    app.add_exception_handler(
        RequestValidationError,
        # pyrefly: ignore [bad-argument-type]
        validation_exception_handler,
    )
    app.add_exception_handler(
        InvalidApiKeyException,
        # pyrefly: ignore [bad-argument-type]
        api_key_not_found_handler,
    )
    app.add_exception_handler(
        UserNotFoundException,
        # pyrefly: ignore [bad-argument-type]
        user_not_found_handler,
    )
    app.add_exception_handler(
        RateLimitError,
        # pyrefly: ignore [bad-argument-type]
        rate_limit_handler,
    )
    app.add_exception_handler(
        ProviderError,
        # pyrefly: ignore [bad-argument-type]
        Provider_error_handler,
    )
    app.add_exception_handler(Exception, unhandled_exception_handler)
