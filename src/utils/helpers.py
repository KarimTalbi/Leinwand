import json
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from sqlalchemy import Result


def get_rows(data: Result[tuple[Any, ...]]) -> list[dict[str, Any]]:
    rows = []
    for row in data.mappings():
        r = dict(row)
        r["position"] = (
            json.loads(r["position"])
            if isinstance(r["position"], str)
            else r["position"]
        )
        r["data"] = json.loads(r["data"]) if isinstance(r["data"], str) else r["data"]
        rows.append(r)
    return rows


def extract_by_keys(data: dict[str, Any], keys: list[str]) -> tuple[Any, ...]:
    return tuple(data.get(key, "") for key in keys)
