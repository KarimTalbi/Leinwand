from .base import LLMKeyValidator
from .enums import Provider
from .providers import (
    AnthropicValidator,
    GeminiValidator,
    OpenAIValidator,
)

_VALIDATORS: dict[Provider, type[LLMKeyValidator]] = {
    Provider.OPENAI: OpenAIValidator,
    Provider.ANTHROPIC: AnthropicValidator,
    Provider.GEMINI: GeminiValidator,
}


def create_validator(provider: Provider | str, api_key: str) -> LLMKeyValidator:
    return _VALIDATORS[Provider(provider)](api_key)


def detect_provider(api_key: str) -> Provider:
    if api_key.startswith("sk-ant-"):
        return Provider.ANTHROPIC
    if api_key.startswith("sk-"):
        return Provider.OPENAI
    return Provider.GEMINI
