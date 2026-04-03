import textwrap

from data import AncestorNode, AncestorResponse
from utils import extract_by_keys


def _prompt_node(node: AncestorNode) -> str:
    label, prompt, response = extract_by_keys(
        node.data, ["label", "prompt", "response"]
    )

    section = textwrap.dedent(f"""\
    ### NODE: {label} (Pos: {node.position})
    Depth: {node.depth} Type: {node.type}
    Content:
    User: {prompt}
    AI: {response}
    """)

    return section


def _text_node(node: AncestorNode) -> str:
    label, text = extract_by_keys(node.data, ["label", "text"])

    section = textwrap.dedent(f"""\
    ### NODE: {label} (Pos: {node.position})
    Depth: {node.depth} Type: {node.type}
    Content:
    Text: {text}
    """)

    return section


def _merge_node(node: AncestorNode) -> str:
    label, context = extract_by_keys(node.data, ["label", "context"])

    section = textwrap.dedent(f"""\
    ### NODE: {label} (Pos: {node.position})
    Depth: {node.depth} Type: {node.type}
    Content:
    Pre-Merge-Context:
    {context}
    """)

    return section


def _node(node: AncestorNode) -> str:
    funcs = {
        "mergeNode": _merge_node,
        "promptNode": _prompt_node,
        "textNode": _text_node,
    }

    return funcs.get(node.type, _prompt_node)(node)


def _stream(ancestry: AncestorResponse, stream_id: int) -> str:
    max_depth = max([n.depth for n in ancestry.ancestors])

    summary = textwrap.dedent(f"""\
    ### STREAM {stream_id} SUMMARY:
    Node Count: {ancestry.total}
    Max Depth: {max_depth}
    \n""")

    return summary


def _global(*ancestry: AncestorResponse) -> str:
    stream_count = len(ancestry)
    node_count = sum([a.total for a in ancestry])

    summary = textwrap.dedent(f"""\
    ### GLOBAL SUMMARY:
    Total Streams: {stream_count}
    Total Nodes: {node_count}
    \n""")

    return summary


def build_context(*ancestry: AncestorResponse) -> str:
    if not ancestry[0].total:
        return "NO PREVIOUS CONTEXT, THIS IS A ROOT NODE"

    summary = _global(*ancestry)

    for i, a in enumerate(ancestry, 1):
        stream_summary = _stream(a, i)
        node_summaries = "\n".join([_node(n) for n in a.ancestors])
        full = f"{stream_summary}{node_summaries}"
        summary += full

    return summary
