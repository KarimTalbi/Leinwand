"""
Main entry point for the NodeLLM FastAPI application.
"""

import logging

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.routes import edge_router, node_router, canvas_router
from data import ResourceNotFoundError

logging.basicConfig(level=logging.INFO)
logging.getLogger("app").setLevel(logging.DEBUG)
app: FastAPI = FastAPI(title="NodeLLM")

app.include_router(node_router)
app.include_router(edge_router)
app.include_router(canvas_router)


app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ResourceNotFoundError)
async def not_found(request: Request, exc: ResourceNotFoundError):
    """
    Handles ResourceNotFoundError by returning a 404 response.

    Args:
        request: The incoming request.
        exc: The raised exception.

    Returns:
        A JSON response with a 404 status code.
    """
    return JSONResponse(status_code=404, content={"detail": "entity not found"})


@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    """
    Middleware to handle global exceptions and return a 500 response.

    Args:
        request: The incoming request.
        call_next: The next handler in the chain.

    Returns:
        The response from the next handler or a 500 JSON response.
    """
    try:
        return await call_next(request)
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"{type(e).__name__}: {e}"})


@app.get("/")
async def root():
    """
    Root endpoint to check API status.

    Returns:
        A message indicating the API is online.
    """
    return {"message": "API is online"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
