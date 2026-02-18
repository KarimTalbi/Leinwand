import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from data import CanvasRead, CanvasService, CanvasUpdate
from data.db_session import get_async_session
from llm_logic.ai_model import Prompt
from utils import logger, setup_logging, log_performance
from llm_logic import AiModel, get_ai_model
from core import get_current_context

setup_logging()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def global_exception_handler(request: Request, call_next):
    try:
        return await call_next(request)

    except Exception as e:

        logger.error(f"Request failed: {type(e).__name__} - {e}", exc_info=True)

        if isinstance(e, SQLAlchemyError):
            return JSONResponse(
                status_code=503, content={"detail": "Database error"}
            )

        return JSONResponse(
            status_code=500, content={"detail": str(e)}
        )


@app.get("/health")
@log_performance
async def health_check(session: AsyncSession = Depends(get_async_session)):
    """pings the DB with a minimal query"""
    await session.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.post("/generate")
async def generate_response(
        target_id: str,
        context: str = Depends(get_current_context),
        ai_model: AiModel = Depends(get_ai_model)
):
    prompt = Prompt(context=context)
    return ai_model.run(prompt)


@app.post("/steam-completion/")
async def steam_completion(
        target_id: str,
        contex: str = Depends(get_current_context),
        ai_model: AiModel = Depends(get_ai_model),
):
    prompt = Prompt(context=contex)

    return StreamingResponse(
        ai_model.stream(prompt), media_type="text/plain"
    )


@app.get("/canvas", response_model=CanvasRead)
async def load_canvas(session: AsyncSession = Depends(get_async_session)):
    canvas_service = CanvasService(session)
    return await canvas_service.read()


@app.post("/canvas/save", response_model=CanvasUpdate)
async def save_canvas(
        canvas_service: CanvasUpdate,
        session: AsyncSession = Depends(get_async_session)
):
    service = CanvasService(session)
    try:
        return await service.save(canvas_service)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save canvas: {e}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
