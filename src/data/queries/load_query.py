from pathlib import Path
from typing import Any

from sqlalchemy import TextClause, text


def load_query(name: str) -> str:
    return (Path(__file__).parent / f"{name}.sql").read_text()


def get_text_clause(name: str, params: dict[str, Any] | None = None) -> TextClause:
    query = load_query(name)
    return text(query).bindparams(**params) if params else text(query)


def get_ancestors_recursive(node_id: str) -> TextClause:
    return get_text_clause(
        "get_ancestors",
        {"node_id": node_id},
    )
