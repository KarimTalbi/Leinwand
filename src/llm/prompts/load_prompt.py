from enum import Enum
from pathlib import Path

_DIR = Path(__file__).parent


def _load(name: str) -> str:
    return (_DIR / name).read_text()


class SystemPrompts(Enum):

    PROMPT_NODE_SYSTEM = _load("prompt_node_system.txt")
    SUMMARY_NODE_SYSTEM = _load("summary_node_system.txt")
