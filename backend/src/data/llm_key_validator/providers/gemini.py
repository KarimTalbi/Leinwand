import re

import httpx

from ..base import LLMKeyValidator
from ..enums import ModelType, Provider
from exceptions import InvalidApiKeyException


class GeminiValidator(LLMKeyValidator):
    @property
    def provider(self) -> Provider:
        return Provider.GEMINI

    def _validate_key_format(self, key: str) -> None:
        if len(key) < 10:
            raise InvalidApiKeyException("Gemini API key looks too short.")

    async def _fetch_models(self, client: httpx.AsyncClient) -> list[str]:
        r = await client.get(
            "https://generativelanguage.googleapis.com/v1beta/models",
            params={"key": self._api_key},
        )
        r.raise_for_status()
        return [m["name"].removeprefix("models/") for m in r.json()["models"]]

    def _classify(self, model_id: str) -> ModelType:
        m = model_id.lower()
        if re.search(r"deep|banana|lyria|001|custom|2.0|embedding|image|tts|audio", m):
            return ModelType.OTHER
        if re.search(r"pro|flash", m):
            return ModelType.CHAT
        return ModelType.OTHER
