from enum import StrEnum


class Provider(StrEnum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GEMINI = "google_genai"


class ModelType(StrEnum):
    CHAT = "chat"
    OTHER = "other"
