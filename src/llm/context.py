from data import AncestorNode, AncestorResponse, NodeType
from prompts import prompt_format, ContextPrompts


def _prompt_node(node: AncestorNode) -> str:
    params = (
        node.data.get("label", "Node"),
        node.position,
        node.depth,
        node.type,
        node.data.get("prompt", ""),
        node.data.get("response", ""),
    )

    return prompt_format(ContextPrompts.SEC_PROMPT_NODE, params)


def _text_node(node: AncestorNode) -> str:
    params = (
        node.data.get("label", "Node"),
        node.position,
        node.depth,
        node.type,
        node.data.get("text", ""),
    )

    return prompt_format(ContextPrompts.SEC_TEXT_NODE, params)


def _merge_node(node: AncestorNode) -> str:
    params = (
        node.data.get("label", "Node"),
        node.position,
        node.depth,
        node.type,
        node.data.get("context", ""),
    )

    return prompt_format(ContextPrompts.SEC_MERGE_NODE, params)


def _node(node: AncestorNode) -> str:
    funcs = {
        NodeType.MERGE.value: _merge_node,
        NodeType.PROMPT.value: _prompt_node,
        NodeType.TEXT.value: _text_node,
    }

    return funcs.get(node.type, _prompt_node)(node)


def _stream(ancestry: AncestorResponse, stream_id: int) -> str:
    params = (stream_id, ancestry.total, max([n.depth for n in ancestry.ancestors]))
    return prompt_format(ContextPrompts.SUMMARY_STREAM, params) + "\n\n"


def _global(*ancestry: AncestorResponse) -> str:
    params = (len(ancestry), sum([a.total for a in ancestry]))
    return prompt_format(ContextPrompts.SUMMARY_GLOBAL, params) + "\n\n"


def build_context(*ancestry: AncestorResponse) -> str:
    if not ancestry[0].total:
        return ContextPrompts.NO_CONTEXT

    summary = _global(*ancestry)

    for i, a in enumerate(ancestry, 1):
        stream_summary = _stream(a, i)
        node_summaries = "\n".join([_node(n) for n in a.ancestors])
        full = f"{stream_summary}{node_summaries}"
        summary += full

    return summary
