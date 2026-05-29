import httpx

from ..base import LLMKeyValidator
from ..enums import ModelType, Provider
from exceptions import InvalidApiKeyException


class AnthropicValidator(LLMKeyValidator):
    @property
    def provider(self) -> Provider:
        return Provider.ANTHROPIC

    def _validate_key_format(self, key: str) -> None:
        if not key.startswith("sk-ant-"):
            raise InvalidApiKeyException("Anthropic keys must start with 'sk-ant-'.")

    async def _fetch_models(self, client: httpx.AsyncClient) -> list[str]:
        r = await client.get(
            "https://api.anthropic.com/v1/models",
            headers={
                "x-api-key": self._api_key,
                "anthropic-version": "2023-06-01",
            },
        )
        r.raise_for_status()
        return [m["id"] for m in r.json()["data"]]

    def _classify(self, model_id: str) -> ModelType:
        if model_id.lower().startswith("claude"):
            return ModelType.CHAT
        return ModelType.OTHER
