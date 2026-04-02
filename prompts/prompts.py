from pathlib import Path
from typing import Any

_DIR = Path(__file__).parent


def _load(name: str, directory: str) -> str:
    return (_DIR / directory / name).read_text()


class SystemPrompts:
    PROMPT_NODE: str = _load("prompt_node.txt", "system")


class ContextPrompts:
    SEC_PROMPT_NODE: str = _load("section_prompt_node.txt", "context")
    SEC_TEXT_NODE: str = _load("section_text_node.txt", "context")
    SEC_MERGE_NODE: str = _load("section_merge_node.txt", "context")
    SUMMARY_STREAM: str = _load("summary_stream.txt", "context")
    SUMMARY_GLOBAL: str = _load("summary_global.txt", "context")
    NO_CONTEXT: str = _load("no_context.txt", "context")


def prompt_format(prompt: str, params: tuple[Any, ...]) -> str:
    return prompt.format(*params)
