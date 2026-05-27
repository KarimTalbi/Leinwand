from abc import ABC, abstractmethod

import httpx

from .enums import ModelType, Provider
from .exceptions import InvalidApiKeyError, ProviderError, RateLimitError


class LLMKeyValidator(ABC):
    def __init__(self, api_key: str, timeout: float = 10.0) -> None:
        if not isinstance(api_key, str) or not api_key.strip():
            raise InvalidApiKeyError("API key must be a non-empty string.")
        self._validate_key_format(api_key)
        self._api_key = api_key
        self._timeout = timeout
        self._models: list[str] | None = None

    @property
    @abstractmethod
    def provider(self) -> Provider: ...

    @abstractmethod
    def _validate_key_format(self, key: str) -> None: ...

    @abstractmethod
    async def _fetch_models(self, client: httpx.AsyncClient) -> list[str]: ...

    @abstractmethod
    def _classify(self, model_id: str) -> ModelType:
        """Map a single model ID to its ModelType."""
        ...

    # ── Public API ────────────────────────────────────────────────────────────

    @property
    def masked_key(self) -> str:
        return f"{self._api_key[:6]}...{self._api_key[-4:]}"

    async def get_models(self) -> list[str]:
        if self._models is not None:
            return self._models
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            try:
                self._models = sorted(await self._fetch_models(client))
            except httpx.HTTPStatusError as e:
                self._handle_http_error(e)
        return self._models  # type: ignore[return-value]

    async def get_models_by_type(self, model_type: ModelType) -> list[str]:
        return [m for m in await self.get_models() if self._classify(m) == model_type]

    async def get_models_grouped(self) -> dict[ModelType, list[str]]:
        result: dict[ModelType, list[str]] = {t: [] for t in ModelType}
        for model in await self.get_models():
            result[self._classify(model)].append(model)
        return {t: models for t, models in result.items() if models}  # drop empty types

    async def validate(self) -> bool:
        try:
            await self.get_models()
            return True
        except InvalidApiKeyError, ProviderError, RateLimitError:
            return False

    def clear_cache(self) -> None:
        self._models = None

    def __repr__(self) -> str:
        return (
            f"{self.__class__.__name__}(provider={self.provider}, "
            f"key={self.masked_key})"
        )

    @staticmethod
    def _handle_http_error(e: httpx.HTTPStatusError) -> None:
        status = e.response.status_code
        if status == 401:
            raise InvalidApiKeyError("API key is invalid or revoked.") from e
        if status == 403:
            raise InvalidApiKeyError("API key does not have permission.") from e
        if status == 429:
            raise RateLimitError("Rate limited — try again later.") from e
        raise ProviderError(f"Unexpected provider error: {status}") from e
