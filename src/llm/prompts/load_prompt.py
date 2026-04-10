from pathlib import Path

_DIR = Path(__file__).parent


def _load(name: str) -> str:
    """
    Reads the content of a file within a specified directory and returns it as a string.

    Args:
        name (str): The name of the file to be read.

    Returns:
        str: Contents of the specified file.
    """
    return (_DIR / name).read_text()


class SystemPrompts:
    """Handles system-level textual prompts for various operations.

    This class is designed to load and manage system prompts required for the
    operation of nodes or other system components. The primary usage revolves
    around accessing predefined prompts stored in associated resources.

    Attributes:
        PROMPT_NODE_SYSTEM (str): The system prompt text for nodes, loaded from
        a predefined resource file.
    """

    PROMPT_NODE_SYSTEM: str = _load("prompt_node_system.txt")
