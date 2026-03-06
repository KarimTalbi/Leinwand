import logging

import uvicorn
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core import get_canvas_service
from core.routes import edge_router, node_router
from data import CanvasRead, CanvasService, ResourceNotFoundError

logging.basicConfig(level=logging.INFO)
logging.getLogger("app").setLevel(logging.DEBUG)
app: FastAPI = FastAPI(title="NodeLLM")

app.include_router(node_router)
app.include_router(edge_router)


app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ResourceNotFoundError)
async def not_found(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": f"{exc.model.__name__} not found"})


@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"{type(e).__name__}: {e}"})


@app.get("/")
async def root():
    return {"message": "API is online"}


@app.get("/canvas")
async def canvas(service: CanvasService = Depends(get_canvas_service)) -> CanvasRead:
    return await service.load_canvas()


# add endpoint for streaming response
# add context limit
# add summary option for context over limit
# try RAG for context
# customize context on nodes


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
