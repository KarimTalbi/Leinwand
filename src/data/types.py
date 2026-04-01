from enum import Enum
from typing import Any, Protocol


class ModelT(Protocol):
    id: Any


class SchemaT(Protocol):
    id: Any

    def model_dump(self, *args, **kwargs) -> dict: ...

    @classmethod
    def model_validate(cls, obj: Any, **kwargs) -> Any: ...


class NodeType(str, Enum):
    PROMPT = "prompt"
    MERGE = "merge"
    TEXT = "text"


class QueryType(str, Enum):
    ANCESTORS = "get_ancestors"
