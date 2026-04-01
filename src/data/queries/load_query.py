from enum import Enum
from pathlib import Path


def load_query(name: Enum) -> str:
    return (Path(__file__).parent / f"{name.value}.sql").read_text()
