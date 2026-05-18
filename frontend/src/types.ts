import {Edge, Node, OnNodesChange, OnEdgesChange, OnConnect, XYPosition} from "@xyflow/react";



export interface LLMConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  timeout: number;
  max_retries: number;
}

export interface PromptNodeData extends Record<string, unknown> {
  prompt?: string;
  response?: string;
  closed: boolean;
  config?: LLMConfig;
}

export interface TextNodeData extends Record<string, unknown> {
  text: string;
  closed: boolean;
}

export interface MergeNodeData extends Record<string, unknown> {
  context?: Record<string, string>[];
  problems?: string;
  solution?: string;
  has_issues?: boolean;
  closed: boolean;
  config?: LLMConfig;
}

export interface SummaryNodeData extends Record<string, unknown> {
  response: string,
  closed: boolean
  config?: LLMConfig;
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
  scrollToZoom: boolean;

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
  settingsOpen: boolean;
  setSettingsOpen: (status: boolean) => void;

  // Flow actions
  syncCanvas: () => Promise<void>;
  addNode: (type: NodeTypeNames, position?: XYPosition) => string | undefined;
  createConnectedNode: (type: NodeTypeNames, sourceId: string) => void;
  promptNodeAction: (id: string) => Promise<void>;
  summaryNodeAction: (id: string) => Promise<void>;
  mergeNodeAction: (id: string) => Promise<void>;
  mergeNodeResolveAction: (id: string) => Promise<void>;
  addEdge: (source: string, target: string) => void;
  deleteNode: (id: string) => void;
  updateNodeData: (id: string, data: PartialNodeData) => void;
  updateNodeClosed: (id: string, status: boolean) => void;

  onNodesChange: OnNodesChange<NodeTypes>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  setSyncing: (status: boolean) => void;
  setLocked: (status: boolean) => void;
  setScrollToZoom: (status: boolean) => void;
}
