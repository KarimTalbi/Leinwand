from typing import Literal, List

from langchain_core.messages import BaseMessage

ModelProvider = Literal["openai", "google_genai"]
GoogleAiModel = Literal["gemini-2.5-flash", "gemini-3.0-flash-preview"]
OpenAiModel = Literal["gpt-4.1-mini", "gpt-4o-mini", "gpt-5-mini"]

Prompt = List[BaseMessage]
