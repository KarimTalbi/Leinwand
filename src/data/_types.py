from typing import TypeVar, TypedDict, List, Set, Any, Type
from uuid import UUID

from pydantic import BaseModel

from data import Base, BaseRead, BaseCreate, BaseUpdate, BaseMap, CanvasRead

T = TypeVar("T", bound=Base)
S = TypeVar("S", bound=BaseModel)
C = TypeVar("C", bound=BaseCreate)
U = TypeVar("U", bound=BaseUpdate)
R = TypeVar("R", bound=BaseRead)
M = TypeVar("M", bound=BaseMap)
CR = TypeVar("CR", bound=CanvasRead)


class SyncTask(TypedDict):
    items: List[BaseModel]
    db_ids: Set[UUID]
    service: Any
    create_schema: Type[BaseModel]
    update_schema: Type[BaseModel]
