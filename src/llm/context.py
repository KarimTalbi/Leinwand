from data import AncestorNode, AncestorResponse


def _prompt_node(node: AncestorNode) -> str:
    return (
        f"### NODE: {node.data.get('label', 'Node')} (Pos: {node.position})\n"
        f"Depth: {node.depth} Type: {node.type}\n"
        f"Content:\n"
        f"User: {node.data.get('prompt', '')}\n"
        f"AI: {node.data.get('response', '')}\n"
    )


def _text_node(node: AncestorNode) -> str:
    return (
        f"### NODE: {node.data.get('label', 'Node')} (Pos: {node.position})\n"
        f"Depth: {node.depth} Type: {node.type}\n"
        f"Content:\n"
        f"Text: {node.data.get('text', '')}\n"
    )


def _merge_node(node: AncestorNode) -> str:
    return (
        f"### NODE: {node.data.get('label', 'Node')} (Pos: {node.position})\n"
        f"Depth: {node.depth} Type: {node.type}\n"
    )


def _node(node: AncestorNode) -> str:
    if node.type == "textNode":
        return _text_node(node)

    return _prompt_node(node)


def _stream(ancestry: AncestorResponse, stream_id: int) -> str:
    return (
        f"### STREAM {stream_id} SUMMARY:\nNode Count: {ancestry.total}\n"
        f"Max Depth: {max([n.depth for n in ancestry.ancestors])}\n\n"
    )


def _global(*ancestry: AncestorResponse) -> str:
    return (
        f"### GLOBAL SUMMARY:\n"
        f"Total Streams: {len(ancestry)}\n"
        f"Total Nodes: {sum([a.total for a in ancestry])}\n\n"
    )


def build_context(*ancestry: AncestorResponse) -> str:
    if not ancestry[0].total:
        return "NO PREVIOUS CONTEXT, ROOT NODE"
    summary = _global(*ancestry)

    for i, a in enumerate(ancestry, 1):
        stream_summary = _stream(a, i)
        node_summaries = "\n".join([_node(n) for n in a.ancestors])
        full = f"{stream_summary}{node_summaries}"
        summary += full

    print(summary)
    return summary
