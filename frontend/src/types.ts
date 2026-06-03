import {Edge, Node, OnConnect, OnEdgesChange, OnNodesChange, XYPosition} from "@xyflow/react";

/** A single content block within a merge node's context, representing one stream of LLM output. */
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

export interface LLMModelConfig {
  temperature?: number,
  max_tokens?: number,
  timeout?: number,
  max_retries?: number,
}

/** The selected LLM model and associated API key used when running a node. */
export interface LLMModel {
  model?: string | null;
  key_id?: string | null;
  model_provider?: string | null;
  model_config?: LLMModelConfig | null;
}

/** A ReactFlow node that holds a chat prompt and its LLM response. */
export type PromptNodeType = Node<{
  prompt?: string;
  response?: string;
  closed: boolean;
  model: Record<string, any>
}>;

/** A ReactFlow node that stores free-form text (no LLM interaction). */
export type TextNodeType = Node<{
  text?: string;
  closed: boolean;
  model: Record<string, any>
}>;

/** A ReactFlow node that merges two incoming streams and surfaces any conflicts. */
export type MergeNodeType = Node<{
  context?: Section[];
  problems?: string;
  solution?: string;
  has_issues?: boolean;
  incomer1?: string;
  incomer2?: string;
  closed: boolean;
  model: Record<string, any>
}>;

/** A ReactFlow node that summarises all upstream node outputs into one response. */
export type SummaryNodeType = Node<{
  response?: string,
  closed: boolean
  model: Record<string, any>
}>;


export type PromptNodeData = PromptNodeType['data'];
export type SummaryNodeData = SummaryNodeType['data'];
export type TextNodeData = TextNodeType['data'];
export type MergeNodeData = MergeNodeType['data'];

/** Union of all supported node variants in the canvas. */
export type AnyNodeType = PromptNodeType | TextNodeType | MergeNodeType | SummaryNodeType;
/** Partial data bag accepted by `updateNodeData` for any node type. */
export type PartialNodeData = Partial<PromptNodeData | TextNodeData | MergeNodeData | SummaryNodeData>;
/** String literals that identify each supported node type in ReactFlow. */
export type NodeTypeNames = 'promptNode' | 'textNode' | 'mergeNode' | 'summaryNode';


/** Authenticated user returned from `/users/me`. */
export interface UserRead {
  username: string;
  user_data: { default_models: Record<NodeTypeNames | 'default', LLMModel> } | null;
  disabled: boolean;
}

/** Raw node/edge payload stored inside a canvas document. */
export interface CanvasReadData {
  nodes: (AnyNodeType)[],
  edges: Edge[],
}

/** A canvas document as returned by the API. */
export interface CanvasRead {
  id: string;
  name: string;
  updatedAt: number;
  data: CanvasReadData;
}

/** An API key record as returned by the API. */
export interface ApiKeyRead {
  id: string;
  key: string;
  modelProvider?: string;
  models?: string[];
}


export interface AppState {

  // Auth state
  token: string | null;
  user: UserRead | null;
  authError: string | null;

  // Auth actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string) => Promise<void>;
  clearAuthError: () => void;

  // Canvas state
  canvases: CanvasRead[];
  currentCanvasId: string | null;
  currentCanvasName: string | null;

  // Canvas actions
  loadCanvases: () => Promise<void>;
  selectCanvas: (canvasId: string, canvasName: string) => Promise<void>;
  createCanvas: (name: string) => Promise<void>;
  deleteCanvas: (canvasId: string) => Promise<void>;
  exitCanvas: () => void;
  updateCanvas: (id: string, name: string) => Promise<void>;

  // Api key state
  apiKeys: ApiKeyRead[];
  defaultModel: LLMModel | null;
  defaultPromptModel: LLMModel | null;
  defaultSummaryModel: LLMModel | null;
  defaultMergeModel: LLMModel | null;

  // Api key actions
  loadApiKeys: () => Promise<void>;
  createApiKey: (key: string) => Promise<void>;
  deleteApiKey: (id: string) => Promise<void>;

  // Flow state
  nodes: AnyNodeType[];
  edges: Edge[];
  locked: boolean;
  scrollToZoom: boolean;
  aiSettingsOpen: boolean;
  userSettingsOpen: boolean;
  projectsOpen: boolean;
  loginOpen: boolean;

  // Flow actions
  syncCanvas: () => Promise<void>;
  addNode: (type: NodeTypeNames, position?: XYPosition) => string | undefined;
  moveNode: (id: string, position: XYPosition) => void;
  createConnectedNode: (type: NodeTypeNames, sourceId: string) => void;
  addEdge: (source: string, target: string) => void;
  deleteNode: (id: string) => void;
  updateNodeData: (id: string, data: PartialNodeData) => void;
  updateNodeClosed: (id: string, status: boolean) => void;

  // Flow handlers
  onNodesChange: OnNodesChange<AnyNodeType>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  // setters
  setAiSettingsOpen: (status: boolean) => void;
  setUserSettingsOpen: (status: boolean) => void;
  setDefaultModel: (modelData: LLMModel, type: NodeTypeNames | 'default') => void;
  setLocked: () => void;
  setScrollToZoom: () => void;
  setNodes: (nodes: AnyNodeType[]) => void;
  setEdges: (edges: Edge[]) => void;
  setProjectsOpen: (status: boolean) => void;
  setLoginOpen: (status: boolean) => void;
}
