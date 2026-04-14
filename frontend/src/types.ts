import {Edge, Node, OnNodesChange, OnEdgesChange, OnConnect, XYPosition} from "@xyflow/react";


export interface PromptNodeData extends Record<string, unknown> {
  prompt?: string;
  response?: string;
  closed: boolean;
}

export interface TextNodeData extends Record<string, unknown> {
  text: string;
  closed: boolean;
}

export interface MergeNodeData extends Record<string, unknown> {
  context?: string[];
  closed: boolean;
}

export interface SummaryNodeData extends Record<string, unknown> {
  summary: string,
  closed: boolean
}

export type TextNodeType = Node<TextNodeData>;
export type PromptNodeType = Node<PromptNodeData>;
export type MergeNodeType = Node<MergeNodeData>;
export type SummaryNodeType = Node<SummaryNodeData>;
export type NodeTypeNames = 'promptNode' | 'textNode' | 'mergeNode' | 'summaryNode';


export interface AppState {
  nodes: (PromptNodeType | TextNodeType | MergeNodeType | SummaryNodeType)[];
  edges: Edge[];
  syncing: boolean;
  locked: boolean;

  fetchCanvas: () => Promise<void>;
  saveCanvas: () => Promise<void>;
  addNode: (type: NodeTypeNames, position?: XYPosition) => string;
  addEdge: (source: string, target: string) => string;
  deleteNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<PromptNodeData> | Partial<TextNodeData> | Partial<MergeNodeData> | Partial<SummaryNodeData>) => void;
  updateNodeClosed: (id: string, status: boolean) => void;

  onNodesChange: OnNodesChange<PromptNodeType | TextNodeType | MergeNodeType | SummaryNodeType>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setSyncing: (status: boolean) => void;
  setLocked: (status: boolean) => void;
}