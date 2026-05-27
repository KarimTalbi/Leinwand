import re

import httpx

from ..base import LLMKeyValidator
from ..enums import ModelType, Provider
from ..exceptions import InvalidApiKeyError


class GroqValidator(LLMKeyValidator):
    @property
    def provider(self) -> Provider:
        return Provider.GROQ

    def _validate_key_format(self, key: str) -> None:
        if not key.startswith("gsk_"):
            raise InvalidApiKeyError("Groq keys must start with 'gsk_'.")

    async def _fetch_models(self, client: httpx.AsyncClient) -> list[str]:
        r = await client.get(
            "https://api.groq.com/openai/v1/models",
            headers={"Authorization": f"Bearer {self._api_key}"},
        )
        r.raise_for_status()
        return [m["id"] for m in r.json()["data"]]

    def _classify(self, model_id: str) -> ModelType:
        m = model_id.lower()
        if re.search(r"whisper", m):
            return ModelType.AUDIO
        if re.search(r"llama|mixtral|gemma|deepseek|qwen", m):
            return ModelType.CHAT
        return ModelType.OTHER
