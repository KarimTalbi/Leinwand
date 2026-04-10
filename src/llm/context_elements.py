import json
from typing import Any

from data import AncestorNode, AncestorResponse


def _prompt_node(node: AncestorNode, stream: str) -> list[dict[str, Any]]:
    return {
        "label": node.data.get("label", ""),
        "position": node.position,
        "depth": node.depth,
        "type": node.type,
        "branch": stream,
        "prompt": node.data.get("prompt", ""),
        "response": node.data.get("response", ""),
    }


def _text_node(node: AncestorNode, stream: str) -> str:
    return {
        "label": node.data.get("label", ""),
        "position": node.position,
        "depth": node.depth,
        "type": node.type,
        "branch": stream,
        "text": node.data.get("text", ""),
    }


def _merge_node(node: AncestorNode, stream: str) -> str:
    return {
        "label": node.data.get("label", ""),
        "position": node.position,
        "depth": node.depth,
        "type": node.type,
        "branch": stream,
        "context": node.data.get("context", ""),
    }


def _node(node: AncestorNode, branch: int) -> str:
    funcs = {
        "mergeNode": _merge_node,
        "promptNode": _prompt_node,
        "textNode": _text_node,
    }
    stream = {1: "A", 2: "B"}.get(branch)

    return funcs.get(node.type, _prompt_node)(node, stream)


def _stream(ancestry: AncestorResponse, stream_id: int) -> str:
    max_depth = max([n.depth for n in ancestry.ancestors])

    return {
        "stream_id": stream_id,
        "total": ancestry.total,
        "max_depth": max_depth,
        "type": "stream summary",
    }


def _global(ancestry: list[AncestorResponse]):
    stream_count = len(ancestry)
    node_count = sum([a.total for a in ancestry])

    return {
        "total_streams": stream_count,
        "total_nodes": node_count,
        "type": "global summary",
    }


def build_context_sectioned(ancestry: list[AncestorResponse]) -> str:
    if not ancestry[0].total:
        return [{"node": "no previous context, this is a root node", "type": "empty"}]

    summary = [_global(ancestry)]

    for i, a in enumerate(ancestry, 1):
        summary.append(_stream(a, i))
        summary.extend([_node(n, i) for n in a.ancestors])

    return summary


def get_rows(result, handle: str):
    rows = []
    for row in result.mappings():
        r = dict(row)
        r["position"] = (
            json.loads(r["position"])
            if isinstance(r["position"], str)
            else r["position"]
        )
        r["data"] = json.loads(r["data"]) if isinstance(r["data"], str) else r["data"]
        rows.append(r)
        r["branch"] = "A" if handle == "target-1" else "B"

    return rows
