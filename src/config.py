import logging
import sys
from typing import Annotated, Any

from pydantic import BaseModel, Field


class ModelConfig(BaseModel):
    model: str
    model_provider: str
    temperature: Annotated[float, Field(ge=0.0, le=2.0)]
    max_tokens: Annotated[int, Field(ge=0)]
    timeout: Annotated[int, Field(ge=0)]
    max_retries: Annotated[int, Field(ge=0)]
    model_kwargs: dict[str, Any] = Field(default_factory=dict)


class AiModelConfigs:
    PROMPT_NODE = ModelConfig(
        model="gemini-2.5-flash",
        model_provider="google_genai",
        temperature=0.7,
        max_tokens=1024,
        timeout=30,
        max_retries=2,
    )


def setup_logging():
    logging.basicConfig(
        level=logging.WARNING,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("app.log"),
        ],
    )

    logging.getLogger("app").setLevel(logging.DEBUG)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("uvicorn").setLevel(logging.INFO)
