from uuid import UUID
from typing import Any, Type, TypeVar, Sequence
from pydantic import BaseModel
from sqlalchemy.orm import DeclarativeBase

_T = TypeVar("_T", bound=DeclarativeBase)
_S = TypeVar("_S", bound=BaseModel)


def is_valid_uuid(val: Any) -> bool:
    """check if a value is a vaild UUID or a string representation of one"""
    if isinstance(val, UUID):
        return True
    try:
        UUID(str(val))
        return True
    except (ValueError, TypeError):
        return False


def extract_id(obj: Any) -> str:
    return str(obj.id)


def extract_ids(objs: list[Any]) -> list[str]:
    return list(map(extract_id, objs))
