"""
helper functions.
"""

from typing import Iterable, overload
from uuid import UUID

from src.utils.types import T1, T2, Identifiable


@overload
def map_items(c1: Iterable[T1]) -> tuple[dict[UUID, T1]]: ...


@overload
def map_items(c1: Iterable[T1], c2: Iterable[T2]) -> tuple[dict[UUID, T1], dict[UUID, T2]]: ...


def map_items(*collections: Iterable[Identifiable]) -> tuple[dict[UUID, Identifiable], ...]:
    return tuple({item.id: item for item in collection} for collection in collections)
