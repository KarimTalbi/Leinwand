from enum import Enum
from pathlib import Path
from typing import Any

from sqlalchemy import TextClause, text


def load_query(name: Enum) -> str:
    return (Path(__file__).parent / f"{name.value}.sql").read_text()


def get_text_clause(name: Enum, params: dict[str, Any] | None = None) -> TextClause:
    query = load_query(name)
    return text(query).bindparams(**params) if params else text(query)
