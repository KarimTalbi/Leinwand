from pathlib import Path

_DIR = Path(__file__).parent


def _load(name: str) -> str:
    return (_DIR / name).read_text()


class SystemPrompts:

    PROMPT_NODE_SYSTEM: str = _load("prompt_node_system.txt")
    SUMMARY_NODE_SYSTEM: str = _load("summary_node_system.txt")
