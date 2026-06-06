import {v4 as uuidv4} from 'uuid';
import {addEdge as xyAddEdge, applyEdgeChanges, applyNodeChanges, type XYPosition,} from '@xyflow/react';
import api from '@/api';
import type {AppState, NodeTypeNames} from '@/types';
import type {StateCreator} from 'zustand';
import {DEFAULT_COLLISION_OPTIONS, resolveCollisions} from '@/lib/resolveCollisions';

const nodeInitData = {
  promptNode: {prompt: '', response: '', closed: false, model: {}},
  textNode: {text: '', closed: false, model: {}},
  mergeNode: {context: '', closed: false, problems: '', solution: '', model: {}},
  summaryNode: {response: '', closed: false, model: {}},
};

export type FlowSlice = {
  // State
  nodes: AppState['nodes'];
  edges: AppState['edges'];
  locked: boolean;
  scrollToZoom: boolean;
  aiSettingsOpen: boolean;
  userSettingsOpen: boolean;
  projectsOpen: boolean;
  loginOpen: boolean;


  // Actions
  syncCanvas: () => Promise<void>;
  addNode: (type: NodeTypeNames, position?: XYPosition) => string;
  moveNode: (nodeId: string, position: XYPosition) => void;
  createConnectedNode: (type: NodeTypeNames, source: string) => void;
  deleteNode: (id: string) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  updateNodeClosed: (id: string, closed: boolean) => void;

  addEdge: (source: string, target: string) => void;
  onNodesChange: AppState['onNodesChange'];
  onEdgesChange: AppState['onEdgesChange'];
  onConnect: AppState['onConnect'];

  setNodes: (nodes: AppState['nodes']) => void;
  setEdges: (edges: AppState['edges']) => void;
  setLocked: () => void;
  setAiSettingsOpen: (status: boolean) => void;
  setUserSettingsOpen: (status: boolean) => void;
  setScrollToZoom: () => void;
  setProjectsOpen: (status: boolean) => void;
  setLoginOpen: (status: boolean) => void;
};

/** Zustand slice that manages the ReactFlow graph state and all node/edge mutations. */
export const createFlowSlice: StateCreator<AppState, [], [], FlowSlice> = (set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────

  nodes: [],
  edges: [],
  locked: false,
  scrollToZoom: false,
  aiSettingsOpen: false,
  userSettingsOpen: false,
  projectsOpen: false,
  loginOpen: false,

  // ── Sync ───────────────────────────────────────────────────────────────────

  /** Resolves node collisions locally, then persists the full canvas state to the server. */
  syncCanvas: async () => {
    try {
      const canvasId = get().currentCanvasId;
      if (!canvasId) return;

      const resolved = resolveCollisions(get().nodes, DEFAULT_COLLISION_OPTIONS);
      get().setNodes(resolved);

      await api.post(`/node/sync/${canvasId}/`, {
        nodes: get().nodes,
        edges: get().edges,
        time: Date.now(),
      });
    } catch (err) {
      console.error('Error syncing canvas:', err);
    }
  },

  // ── Node actions ───────────────────────────────────────────────────────────

  addNode: (type, position) => {
    const pos = position ?? {x: Math.random() * 400, y: Math.random() * 400};
    const newNodeId = String(uuidv4());

    set({
      nodes: [
        ...get().nodes,
        {id: newNodeId, type, position: pos, data: nodeInitData[type]},
      ],
    });

    void get().syncCanvas();
    return newNodeId;
  },

  moveNode: (nodeId, position) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node || !position) return;

    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? {...n, position: {x: n.position.x + position.x, y: n.position.y + position.y}}
          : n
      ),
    });

    void get().syncCanvas();
  },

  /** Adds a new node directly below the source node and creates an edge connecting them. */
  createConnectedNode: (type, source) => {
    const node = get().nodes.find((n) => n.id === source);
    if (!node) return;

    const sourceHeight = node.measured?.height;
    if (!sourceHeight) return;

    const pos = {x: node.position.x, y: node.position.y + sourceHeight + 40};
    const newNodeId = String(uuidv4());

    set({
      nodes: [...get().nodes, {id: newNodeId, type, position: pos, data: nodeInitData[type]}],
      edges: [
        ...get().edges,
        {
          id: String(uuidv4()),
          source,
          target: newNodeId,
          sourceHandle: 'source-1',
          targetHandle: 'target-1',
        },
      ],
    });

    void get().syncCanvas();
  },

  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    });

    void get().syncCanvas();
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) => (n.id === id ? {...n, data: {...n.data, ...data}} : n)),
    });
  },

  updateNodeClosed: (id, closed) => {
    get().updateNodeData(id, {closed});
  },

  // ── Edge actions ───────────────────────────────────────────────────────────

  addEdge: (source, target) => {
    set({
      edges: [
        ...get().edges,
        {
          id: String(uuidv4()),
          source,
          target,
          sourceHandle: 'source-1',
          targetHandle: 'target-1',
        },
      ],
    });

    void get().syncCanvas();
  },

  /** ReactFlow handler — syncs to the server after a drag ends or a node is removed. */
  onNodesChange: (changes) => {
    const isDragEnd = changes.some((c) => c.type === 'position' && !c.dragging);
    const hasRemovals = changes.some((c) => c.type === 'remove');

    set({nodes: applyNodeChanges(changes, get().nodes)});

    if (isDragEnd || hasRemovals) void get().syncCanvas();
  },

  onEdgesChange: (changes) => {
    set({edges: applyEdgeChanges(changes, get().edges)});
    void get().syncCanvas();
  },

  onConnect: (connection) => {
    set({
      edges: xyAddEdge(
        {
          id: String(uuidv4()),
          ...connection,
          sourceHandle: connection.sourceHandle ?? null,
          targetHandle: connection.targetHandle ?? null,
        },
        get().edges
      ),
    });

    void get().syncCanvas();
  },

  // ── Setters ────────────────────────────────────────────────────────────────

  setNodes: (nodes) => set({nodes}),
  setEdges: (edges) => set({edges}),
  setLocked: () => set({locked: !get().locked}),

  setAiSettingsOpen: (status) => {
    if (status) {
      set({projectsOpen: false, loginOpen: false, userSettingsOpen: false})
    }
    set({aiSettingsOpen: status})
  },

  setProjectsOpen: (status) => {
    if (status) {
      set({aiSettingsOpen: false, loginOpen: false, userSettingsOpen: false})
    }
    set({projectsOpen: status})
  },

  setLoginOpen: (status) => {
    if (status) {
      set({aiSettingsOpen: false, projectsOpen: false, userSettingsOpen: false})
    }
    set({loginOpen: status})
  },

  setUserSettingsOpen: (status) => {
    if (status) {
      set({projectsOpen: false, loginOpen: false, aiSettingsOpen: false})
    }
    set({userSettingsOpen: status})
  },

  setScrollToZoom: () => set({scrollToZoom: !get().scrollToZoom})
});
