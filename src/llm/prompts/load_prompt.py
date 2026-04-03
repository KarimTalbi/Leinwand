from pathlib import Path

_DIR = Path(__file__).parent


def _load(name: str, directory: str) -> str:
    return (_DIR / directory / name).read_text()


class SystemPrompts:
    PROMPT_NODE_SYSTEM: str = _load("prompt_node_system.txt", "prompts")
