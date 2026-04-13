import {Edge, Node, OnNodesChange, OnEdgesChange, OnConnect} from "@xyflow/react";


export type PromptNodeData = { prompt?: string; response?: string; closed: boolean; }
export type TextNodeData = { text: string; closed: boolean; };
export type MergeNodeData = { context?: string[]; closed: boolean; };
export type SummaryNodeData = {summary: string, closed: boolean};
export type NodePosition = { x: number; y: number; };

export type TextNode = Node<TextNodeData>;
export type PromptNode = Node<PromptNodeData>;
export type MergeNode = Node<MergeNodeData>;
export type SummaryNode = Node<SummaryNodeData>;
export type NodeTypeNames = 'promptNode' | 'textNode' | 'mergeNode' | 'summaryNode';


export interface AppState {
  nodes: (PromptNode | TextNode | MergeNode | SummaryNode)[];
  edges: Edge[];
  syncing: boolean;
  locked: boolean;

  fetchCanvas: () => Promise<void>;
  saveCanvas: () => Promise<void>;
  addNode: (type: NodeTypeNames, position?: NodePosition) => void;
  deleteNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<PromptNodeData> | Partial<TextNodeData> | Partial<MergeNodeData> | Partial<SummaryNodeData>) => void;
  updateNodeClosed: (id: string, status: boolean) => void;

  onNodesChange: OnNodesChange<PromptNode | TextNode | MergeNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setSyncing: (status: boolean) => void;
  setLocked: (status: boolean) => void;
}