from typing import Any

from src.core.service import CanvasService


def global_summary(ancestry: tuple[list[dict[str, Any]], ...]) -> list[dict[str, Any]]:
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

        print(summary)

    return summary


async def build_context(
    service: CanvasService, node_id: str, targets: int = 1
) -> list[dict[str, Any]]:

    results = []
    for i in range(targets):
        results.append(await service.nodes.get_ancestors(node_id, f"target-{i+1}"))

    return global_summary(tuple(results))
