from typing import Any


def extract_by_keys(data: dict[str, Any], keys: list[str]) -> tuple[Any, ...]:
    return tuple(data.get(key, "") for key in keys)
