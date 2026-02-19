from uuid import UUID
from typing import Any, Type
from data import T, S


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


def to_read_model(schema: Type[S], db_models: list[T]) -> list[S]:
    return [schema.model_validate(m) for m in db_models]
