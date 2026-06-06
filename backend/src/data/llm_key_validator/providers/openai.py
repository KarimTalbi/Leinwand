import re

import httpx

from ..base import LLMKeyValidator
from ..enums import ModelType, Provider
from exceptions import InvalidApiKeyException


class OpenAIValidator(LLMKeyValidator):
    @property
    def provider(self) -> Provider:
        return Provider.OPENAI

    def _validate_key_format(self, key: str) -> None:
        if not key.startswith("sk-"):
            raise InvalidApiKeyException("OpenAI keys must start with 'sk-'.")

    async def _fetch_models(self, client: httpx.AsyncClient) -> list[str]:
        r = await client.get(
            "https://api.openai.com/v1/models",
            headers={"Authorization": f"Bearer {self._api_key}"},
        )
        r.raise_for_status()
        return [m["id"] for m in r.json()["data"]]

    def _classify(self, model_id: str) -> ModelType:
        m = model_id.lower()
        if re.search(r"^(gpt-|o1|o3|chatgpt)", m):
            return ModelType.CHAT
        return ModelType.OTHER
