import PromptNode from "@/components/NodeTypes/PromptNode.tsx";
import TextNode from "@/components/NodeTypes/TextNode.tsx";
import MergeNode from "@/components/NodeTypes/MergeNode.tsx";
import SummaryNode from "@/components/NodeTypes/SummaryNode.tsx";
import {NodeTypes} from "@xyflow/react";

export const nodeTypes: NodeTypes = {
  promptNode: PromptNode,
  textNode: TextNode,
  mergeNode: MergeNode,
  summaryNode: SummaryNode,
};