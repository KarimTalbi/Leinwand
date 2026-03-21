import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.routes import canvas_router, edge_router, llm_router, node_router
from data import ResourceNotFoundError, engine, init_db

logging.basicConfig(level=logging.INFO)
logging.getLogger("app").setLevel(logging.DEBUG)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Initializing database...")
    await init_db()
    print("✅ Database ready")

    yield

    await engine.dispose()


app: FastAPI = FastAPI(lifespan=lifespan)

app.include_router(node_router)
app.include_router(edge_router)
app.include_router(canvas_router)
app.include_router(llm_router)


app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ResourceNotFoundError)
async def not_found(request: Request, exc: ResourceNotFoundError):
    return JSONResponse(status_code=404, content={"detail": "entity not found"})


@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        return JSONResponse(
            status_code=500, content={"detail": f"{type(e).__name__}: {e}"}
        )


@app.get("/")
async def root():
    return {"message": "API is online"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
