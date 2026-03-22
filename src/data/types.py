from typing import Any, Protocol
from uuid import UUID


class ModelT(Protocol):
    id: Any


class SchemaT(Protocol):
    id: Any

    def model_dump(self, *args, **kwargs) -> dict: ...

    @classmethod
    def model_validate(cls, obj: Any, **kwargs) -> Any: ...
