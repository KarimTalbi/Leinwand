from typing import Any, Annotated

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
    temperature: Annotated[float, Field(ge=0.0, le=2.0)] | None = None
    max_tokens: Annotated[int, Field(ge=0)] | None = None
    timeout: Annotated[int, Field(ge=0)] | None = None
    max_retries: Annotated[int, Field(ge=0)] | None = None
    model_kwargs: dict[str, Any] | None = None


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

    OPENAI = ModelConfig(
        model="gpt-5-mini",
        model_provider="openai",
    )

    GEMINI_PRO_25 = ModelConfig(
        model="gemini-2.5-pro",
        model_provider="google_genai",
    )

    GEMINI_FLASH_25 = ModelConfig(
        model="gemini-2.5-flash",
        model_provider="google_genai",
    )

    GEMINI_FLASH_LITE_25 = ModelConfig(
        model="gemini-2.5-flash-lite",
        model_provider="google_genai",
    )

    GEMINI_PRO_31 = ModelConfig(
        model="gemini-3.1-pro-preview",
        model_provider="google_genai",
    )

    GEMINI_FLASH_LITE_31 = ModelConfig(
        model="gemini-3.1-flash-lite-preview",
        model_provider="google_genai",
    )

    GEMINI_FLASH_3 = ModelConfig(
        model="gemini-3-flash-preview",
        model_provider="google_genai",
    )

    ANTHROPIC_SONNET_46 = ModelConfig(
        model="claude-sonnet-4-6",
        model_provider="anthropic",
    )

    ANTHROPIC_OPUS_46 = ModelConfig(
        model="claude-opus-4-6",
        model_provider="anthropic",
    )

    ANTHROPIC_HAIKU_46 = ModelConfig(
        model="claude-haiku-4-6",
        model_provider="anthropic",
    )