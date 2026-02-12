from typing import runtime_checkable, Protocol, Optional, TypeVar, TypedDict, List, Set, Any, Type
from uuid import UUID

from pydantic import BaseModel

from data import Base


@runtime_checkable
class Identifiable(Protocol):
    id: Optional[UUID | str]

    def model_dump(self, **kwargs) -> dict: ...


T = TypeVar("T", bound=Base)
C = TypeVar("C", bound=BaseModel)
U = TypeVar("U", bound=BaseModel)
R = TypeVar("R", bound=Identifiable)


class SyncTask(TypedDict):
    items: List[BaseModel]
    db_ids: Set[UUID]
    service: Any
    create_schema: Type[BaseModel]
    update_schema: Type[BaseModel]