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
  problems?: string;
  solution?: string;
  closed: boolean;
}

export interface SummaryNodeData extends Record<string, unknown> {
  summary: string,
  closed: boolean
}

export type PartialNodeData = Partial<PromptNodeData | TextNodeData | MergeNodeData | SummaryNodeData>;

export type TextNodeType = Node<TextNodeData>;
export type PromptNodeType = Node<PromptNodeData>;
export type MergeNodeType = Node<MergeNodeData>;
export type SummaryNodeType = Node<SummaryNodeData>;
export type NodeTypes = TextNodeType | PromptNodeType | MergeNodeType | SummaryNodeType;
export type NodeTypeNames = 'promptNode' | 'textNode' | 'mergeNode' | 'summaryNode';


export interface UserRead {
  username: string;
  disabled: boolean;
}

export interface CanvasRead {
  id: string;
  name: string;
  data: Record<string, unknown>;
}


export interface AppState {
  // Auth
  token: string | null;
  user: UserRead | null;
  authError: string | null;

  // Canvas management
  canvases: CanvasRead[];
  currentCanvasId: string | null;

  // Flow state
  nodes: (NodeTypes)[];
  edges: Edge[];
  syncing: boolean;
  locked: boolean;

  historyTicket: number;
  saveSnapshot: () => void;

  // Auth actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string) => Promise<void>;
  clearAuthError: () => void;



  // Canvas management actions
  loadCanvases: () => Promise<void>;
  selectCanvas: (canvasId: string) => Promise<void>;
  createCanvas: (name: string) => Promise<void>;
  deleteCanvas: (canvasId: string) => Promise<void>;
  exitCanvas: () => void;

  // Flow actions
  addNode: (type: NodeTypeNames, position?: XYPosition) => Promise<string | undefined>;
  promptNodeAction: (id: string) => Promise<void>;
  summaryNodeAction: (id: string) => Promise<void>;
  mergeNodeAction: (id: string) => Promise<void>;
  addEdge: (source: string, target: string) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  updateNodeData: (id: string, data: PartialNodeData) => void;
  updateNodeClosed: (id: string, status: boolean) => void;

  onNodesChange: OnNodesChange<NodeTypes>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  setSyncing: (status: boolean) => void;
  setLocked: (status: boolean) => void;
}
