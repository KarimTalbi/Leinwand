import logging
import sys
from typing import Annotated, Any

from pydantic import BaseModel, Field


class ModelConfig(BaseModel):
    """
    Configuration class for model parameters.

    This class encapsulates the configuration settings for a model, including its
    provider, operational parameters, and optional keyword arguments. It is used to
    standardize and validate model-related settings, ensuring they adhere to
    specified constraints.

    Attributes:
        model (str): The name of the model to be used.
        model_provider (str): The provider or service offering the model.
        temperature (float): Sampling temperature, must be within the range
            [0.0, 2.0].
        max_tokens (int): The maximum number of tokens allowed for a model output.
            Must be zero or greater.
        timeout (int): Timeout duration in seconds for model-related operations.
            Must be zero or greater.
        max_retries (int): The maximum number of retries allowed for failed
            operations. Must be zero or greater.
        model_kwargs (dict[str, Any]): Additional keyword arguments for model
            configuration, with an empty dictionary as the default value.
    """

    model: str
    model_provider: str
    temperature: Annotated[float, Field(ge=0.0, le=2.0)]
    max_tokens: Annotated[int, Field(ge=0)]
    timeout: Annotated[int, Field(ge=0)]
    max_retries: Annotated[int, Field(ge=0)]
    model_kwargs: dict[str, Any] = Field(default_factory=dict)


class AiModelConfigs:
    """
    Represents the configuration for AI model settings.

    This class contains predefined model configurations and their parameters
    specific to the AI model being used. These configurations are stored as
    static attributes of the class and are intended to provide a central
    location for storing model initialization details.

    Attributes:
        PROMPT_NODE (ModelConfig): Predefined configuration for an AI model
            with specific settings, including model name, provider,
            temperature, token limits, timeout duration, and retry attempts.
    """

    PROMPT_NODE = ModelConfig(
        model="gpt-5-mini",
        model_provider="openai",
        temperature=0.7,
        max_tokens=2048,
        timeout=30,
        max_retries=2,
    )

    SUMMARY_NODE = ModelConfig(
        model="gpt-5-mini",
        model_provider="openai",
        temperature=0.7,
        max_tokens=2048,
        timeout=30,
        max_retries=2,
    )


def setup_logging():
    """
    Configures and sets up logging for the application, defining outputs and log levels
    for multiple components, including the main application and specific libraries.

    The function initializes logging with a specified format and routes log messages to both
    stdout and a file. Additionally, it adjusts the logging levels for libraries and the application
    logger to streamline output and separate log severity levels.

    No arguments are required, and the function modifies logging configurations in place.

    Raises:
        ValueError: If there are invalid configurations used during logging setup.
    """
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
