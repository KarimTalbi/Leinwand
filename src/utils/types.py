from typing import Protocol, TypeVar
from uuid import UUID


class Identifiable(Protocol):
    id: UUID


T1 = TypeVar("T1", bound=Identifiable)
T2 = TypeVar("T2", bound=Identifiable)
