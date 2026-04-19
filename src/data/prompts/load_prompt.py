from enum import Enum
from pathlib import Path

_DIR = Path(__file__).parent


def _load(name: str) -> str:
    return (_DIR / name).read_text()


class SystemPrompts(Enum):

    CHAT_SYSTEM = _load("chat_system.txt")
    SUMMARY_SYSTEM = _load("summary_system.txt")
    MERGE_SYSTEM = _load("merge_system.txt")
    MERGE_RESOLVE_SYSTEM = _load("merge_resolve_system.txt")
