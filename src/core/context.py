from typing import Any

from src.core.service import CanvasService


def _add_stream_id(ancestry: list[dict], stream_id: str):
    for a in ancestry:
        a["stream_id"] = stream_id
    return ancestry


def global_summary(ancestry: tuple[list[dict[str, Any]], ...]) -> list[dict[str, Any]]:

    if len(ancestry) > 1:
        ancestry_a, ancestry_b = ancestry
        ancestry_a = _add_stream_id(ancestry_a, "A")
        ancestry_b = _add_stream_id(ancestry_b, "B")

        summary = {
            "type": "global_summary",
            "total_streams": 2,
            "total_nodes": len(ancestry_a) + len(ancestry_b),
        }

        return [summary] + ancestry_a + ancestry_b

    ancestry_a = ancestry[0]

    summary = {
        "type": "global_summary",
        "total_streams": 1,
        "total_nodes": len(ancestry_a),
    }

    return [summary] + ancestry_a


async def build_context(service: CanvasService, node_id: str, targets: int = 1):

    results = []
    for i in range(targets):
        results.append(await service.nodes.get_ancestors(node_id, f"target-{i+1}"))

    return global_summary(tuple(results))
