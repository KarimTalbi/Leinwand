from pathlib import Path
from typing import Any

from sqlalchemy import TextClause, text


def load_query(name: str) -> str:
    """Loads the contents of a SQL file and returns it as a string.

    This function constructs the path to a SQL file using the given name
    and reads its contents as text.

    Args:
        name (str): The name of the SQL file (without the `.sql` extension)
            located in the same directory as this script.

    Returns:
        str: The contents of the specified SQL file as a string.
    """
    return (Path(__file__).parent / f"{name}.sql").read_text()


def get_text_clause(name: str, params: dict[str, Any] | None = None) -> TextClause:
    """
    Gets a textual SQL clause based on a query name and optional parameters.

    This function retrieves a SQL query by its name, converts it to a textual
    SQL clause, and optionally binds input parameters to it, allowing dynamic
    query execution.

    Args:
        name (str): The name of the query to load.
        params (dict[str, Any] | None): A dictionary of parameters to bind to the
            query, or None if no parameters are required.

    Returns:
        TextClause: A textual SQL clause ready for execution.
    """
    query = load_query(name)
    return text(query).bindparams(**params) if params else text(query)


def get_ancestors_recursive(
    node_id: str, target_handle: str | None = None
) -> TextClause:
    """
    Recursively retrieves the ancestors of a given node and constructs a textual clause
    representation.

    The function generates a textual clause describing the recursive relationship between
    a node and its ancestors. This is useful for representing hierarchical relationships
    within a system or a dataset.

    Args:
        node_id (str): The identifier of the node whose ancestors need to be retrieved.
        target_handle (str | None): An optional parameter specifying a specific target
            to handle within the relationship resolution process.

    Returns:
        TextClause: A textual representation of the recursive query for the node's
        ancestors.
    """
    return get_text_clause(
        "get_ancestors",
        {"node_id": node_id, "target_handle": target_handle},
    )
