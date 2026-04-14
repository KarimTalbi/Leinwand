"""
Provides utilities for analyzing and summarizing hierarchical ancestry data.

This module includes functions to process and summarize data structures
representing hierarchical relationships, such as nodes and streams. It
offers tools for generating both global and detailed summaries and for
retrieving ancestor-related information in a structured format.
"""

from typing import Any

from src.core.service import NodeService


def global_summary(ancestry: tuple[list[dict[str, Any]], ...]) -> list[dict[str, Any]]:
    """
    Generates a global summary from a complex data structure representing ancestry information.

    This function processes a hierarchical structure passed as a tuple of lists of dictionaries
    and creates a detailed summary containing global and per-stream information, including
    the total number of streams, the total number of nodes, and each node's details.

    Args:
        ancestry (tuple[list[dict[str, Any]], ...]): A tuple containing lists of dictionaries,
            where each list represents a stream and each dictionary represents a node.

    Returns:
        list[dict[str, Any]]: A list of dictionaries where the first dictionary provides a
            global summary, followed by individual stream summaries and details for every node.
    """
    summary = [
        {
            "type": "global_summary",
            "total_streams": len(ancestry),
            "total_nodes": sum(len(a) for a in ancestry),
        }
    ]

    for i, a in enumerate(ancestry):
        summary.append(
            {
                "type": "stream_summary",
                "stream_id": str(i + 1),
                "total_nodes": len(a),
            }
        )
        summary.extend(a)

    return summary


async def build_context(
    service: NodeService, node_id: str, targets: int = 1
) -> list[dict[str, Any]]:
    """
    Builds a context containing ancestor nodes for specified targets.

    This function retrieves ancestor information for a node from the given service
    and processes the data based on the number of targets specified. It returns a
    list of dictionaries that summarize the collected data.

    Args:
        service (CanvasService): Service instance used to access node information.
        node_id (str): Identifier of the node for which ancestor data is retrieved.
        targets (int): The number of target contexts to be constructed. Defaults to 1.

    Returns:
        list[dict[str, Any]]: A list of dictionaries summarizing the ancestor data.
    """

    results = []
    for i in range(targets):
        results.append(await service.get_ancestors(node_id, f"target-{i + 1}"))

    return global_summary(tuple(results))
