import {Edge, Node, OnNodesChange, OnEdgesChange, OnConnect, XYPosition} from "@xyflow/react";

export interface Section {
  id: string;
  type: string;
  stream_id: number;
  depth: number;
  prompt?: string;
  response?: string;
  text?: string;
  problems?: string;
  user?: string;
  solution?: string;
}

export interface CanvasReadData {
  updated_at: string,
  node_count: number,
  nodes: (NodeTypes)[],
  edges: Edge[],
}

export interface PromptNodeData extends Record<string, unknown> {
  prompt?: string;
  response?: string;
  closed: boolean;
}

export interface TextNodeData extends Record<string, unknown> {
  text?: string;
  closed: boolean;
}

export interface MergeNodeData extends Record<string, unknown> {
  context?: Section[];
  problems?: string;
  solution?: string;
  has_issues?: boolean;
  incomer1?: string;
  incomer2?: string;
  closed: boolean;
}

export interface SummaryNodeData extends Record<string, unknown> {
  response?: string,
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
  data: CanvasReadData;
}


export interface AppState {
  // Auth
  token: string | null;
  user: UserRead | null;
  authError: string | null;

  // Canvas management
  canvases: CanvasRead[];
  currentCanvasId: string | null;
  currentCanvasName: string | null;
  updateCanvas: (id: string, name: string) => Promise<void>;

  // Flow state
  nodes: (NodeTypes)[];
  edges: Edge[];
  locked: boolean;
  scrollToZoom: boolean;

  // Auth actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string) => Promise<void>;
  clearAuthError: () => void;


  // Canvas management actions
  loadCanvases: () => Promise<void>;
  selectCanvas: (canvasId: string, canvasName: string) => Promise<void>;
  createCanvas: (name: string) => Promise<void>;
  deleteCanvas: (canvasId: string) => Promise<void>;
  exitCanvas: () => void;
  settingsOpen: boolean;
  setSettingsOpen: () => void;

  // Flow actions
  syncCanvas: () => Promise<void>;
  addNode: (type: NodeTypeNames, position?: XYPosition) => string | undefined;
  moveNode: (id: string, position: string) => void;
  createConnectedNode: (type: NodeTypeNames, sourceId: string) => void;
  promptNodeAction: (id: string) => Promise<void>;
  summaryNodeAction: (id: string) => Promise<void>;
  mergeNodeAction: (id: string, incomer1: string, incomer2: string, checkStreams: boolean) => Promise<void>;
  mergeNodeResolveAction: (id: string) => Promise<void>;
  addEdge: (source: string, target: string) => void;
  deleteNode: (id: string) => void;
  updateNodeData: (id: string, data: PartialNodeData) => void;
  updateNodeClosed: (id: string, status: boolean) => void;

  onNodesChange: OnNodesChange<NodeTypes>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setLocked: () => void;
  setScrollToZoom: () => void;
}
