from uuid import UUID

import uvicorn
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from core import get_ai_model, get_canvas_service, get_context
from data import CanvasRead, CanvasService, CanvasUpdate, get_async_session
from llm_logic import AiModel, Response

app: FastAPI = FastAPI()

app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware(middleware_type="http")
async def global_exception_handler(request: Request, call_next) -> JSONResponse:  # pyright: ignore[reportUnknownParameterType, reportMissingParameterType]
    try:
        return await call_next(request)  # pyright: ignore[reportUnknownVariableType]

    except Exception as e:
        if isinstance(e, SQLAlchemyError):
            return JSONResponse(status_code=503, content={"detail": "Database error"})

        return JSONResponse(status_code=500, content={"detail": str(e)})


@app.get("/health")
async def health_check(session: AsyncSession = Depends(get_async_session)):
    await session.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.post("/generate/{target}", response_model=Response)
async def generate_response(
    _target: UUID,
    model: AiModel = Depends(get_ai_model),
    context: str = Depends(get_context),
) -> Response:
    return await model.run_structured(context)


@app.get("/canvas", response_model=CanvasRead)
async def load_canvas(
    service: CanvasService = Depends(get_canvas_service),
) -> CanvasRead:
    return await service.get()


@app.post("/canvas/save", response_model=CanvasRead)
async def save_canvas(
    data: CanvasUpdate, service: CanvasService = Depends(get_canvas_service)
) -> CanvasRead:
    return await service.save(data)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
