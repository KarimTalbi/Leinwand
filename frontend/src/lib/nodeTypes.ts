import PromptNode from "@/components/node-types/PromptNode.tsx";
import TextNode from "@/components/node-types/TextNode.tsx";
import MergeNode from "@/components/node-types/MergeNode.tsx";
import SummaryNode from "@/components/node-types/SummaryNode.tsx";
import {NodeTypes} from "@xyflow/react";

export const nodeTypes: NodeTypes = {
  promptNode: PromptNode,
  textNode: TextNode,
  mergeNode: MergeNode,
  summaryNode: SummaryNode,
};