import {v4 as uuidv4} from 'uuid';
import api from '@/api';
import type {ApiKeyRead, AppState, CanvasRead} from '@/types';
import type {StateCreator} from 'zustand';

export type CanvasSlice = {
  // State
  canvases: CanvasRead[];
  currentCanvasId: string | null;
  currentCanvasName: string | null;
  apiKeys: ApiKeyRead[];

  // Actions
  loadCanvases: () => Promise<void>;
  selectCanvas: (canvasId: string, canvasName: string) => Promise<void>;
  createCanvas: (name: string) => Promise<void>;
  deleteCanvas: (canvasId: string) => Promise<void>;
  updateCanvas: (canvasId: string, canvasName: string) => Promise<void>;
  exitCanvas: () => void;

  loadApiKeys: () => Promise<void>;
  createApiKey: (key: string) => Promise<void>;
  deleteApiKey: (id: string) => Promise<void>;
  setDefaultModel: (modelData: Record<string, any>, type: string) => Promise<void>;
};

/** Zustand slice that manages canvas CRUD and API key management. */
export const createCanvasSlice: StateCreator<AppState, [], [], CanvasSlice> = (set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────

  canvases: [],
  currentCanvasId: null,
  currentCanvasName: null,
  apiKeys: [],

  // ── Canvas actions ─────────────────────────────────────────────────────────

  loadCanvases: async () => {
    try {
      const res = await api.get<CanvasRead[]>('/canvas/list/');
      set({canvases: res.data});
    } catch (err) {
      console.error('Error loading canvases:', err);
    }
  },

  /** Loads nodes and edges for the given canvas and sets it as the active canvas. */
  selectCanvas: async (canvasId, canvasName) => {
    set({nodes: [], edges: [], currentCanvasId: canvasId, currentCanvasName: canvasName, projectsOpen: false});

    try {
      const res = await api.get(`/node/list/${canvasId}`);

      set({
        nodes: (res.data.nodes ?? []).map((n: {
          id: string;
          type: string;
          position: { x: number; y: number };
          data: Record<string, unknown>;
        }) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
        })),

        edges: (res.data.edges ?? []).map((e: {
          id: string;
          source: string;
          target: string;
          sourceHandle?: string;
          targetHandle?: string;
        }) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle ?? null,
          targetHandle: e.targetHandle ?? null,
        })),
      });
    } catch (err) {
      console.error('Error loading canvas:', err);
    }
  },

  createCanvas: async (name) => {
    const newCanvasId = String(uuidv4());
    const createdAt = Date.now();

    try {
      await api.post<CanvasRead>('/canvas/create/', {
        id: newCanvasId,
        name,
        updated_at: createdAt,
        data: {},
      });
      await get().loadCanvases();
      await get().selectCanvas(newCanvasId, name);
    } catch (err) {
      console.error('Error creating canvas:', err);
    }
  },

  deleteCanvas: async (canvasId) => {
    try {
      await api.delete(`/canvas/${canvasId}/delete/`);
      await get().loadCanvases();

      const currentCanvas = get().currentCanvasId

      if (currentCanvas === canvasId) {
        get().exitCanvas()
      }

    } catch (err) {
      console.error('Error deleting canvas:', err);
    }
  },

  /** Renames a canvas with an optimistic local update before the API call. */
  updateCanvas: async (canvasId, canvasName) => {
    // Optimistic update
    set({
      canvases: get().canvases.map((c) =>
        c.id === canvasId ? {...c, name: canvasName} : c
      ),
    });

    try {
      await api.put('/canvas/update', {canvas_id: canvasId, canvas_name: canvasName});
    } catch (err) {
      console.error('Error updating canvas:', err);
    }
  },

  exitCanvas: () =>
    set({
      currentCanvasId: null,
      currentCanvasName: null,
      nodes: [],
      edges: [],
    }),

  // ── API key actions ────────────────────────────────────────────────────────

  loadApiKeys: async () => {
    try {
      const res = await api.get<ApiKeyRead[]>('/api_key/list/');
      set({apiKeys: res.data});
    } catch (err) {
      console.error('Error retrieving API keys:', err);
    }
  },

  createApiKey: async (key) => {
    const newKey: ApiKeyRead = {id: String(uuidv4()), key};

    try {
      await api.post<ApiKeyRead>('/api_key/create/', newKey);
      void get().loadApiKeys();
    } catch (err) {
      console.error('Error creating API key:', err);
    }
  },

  deleteApiKey: async (id) => {
    try {
      await api.delete(`/api_key/delete/${id}/`);

      if (get().defaultModel?.key_id === id) {
        localStorage.removeItem('default');
        set({defaultModel: null});
      }

      if (get().defaultPromptModel?.key_id === id) {
        localStorage.removeItem('promptNode');
        set({defaultPromptModel: null});
      }

      if (get().defaultSummaryModel?.key_id === id) {
        localStorage.removeItem('summaryNode');
        set({defaultSummaryModel: null});
      }

      if (get().defaultMergeModel?.key_id === id) {
        localStorage.removeItem('mergeNode');
        set({defaultMergeModel: null});
      }

      void get().loadApiKeys();

    } catch (err) {
      console.error('Error deleting API key:', err);
    }
  },

  /** Persists the chosen model/key pair to localStorage and syncs it with the server. */
  setDefaultModel: async (modelData, type) => {
    localStorage.setItem(type, JSON.stringify(modelData));

    switch (type) {
      case 'default':
        set({defaultModel: modelData});
        break;
      case 'promptNode':
        set({defaultPromptModel: modelData});
        break;
      case 'summaryNode':
        set({defaultSummaryModel: modelData});
        break
      case 'mergeNode':
        set({defaultMergeModel: modelData});
        break
    }

    try {
      await api.put('/users/update', {
        data: {
          default_models: {
            default: get().defaultModel,
            promptNode: get().defaultPromptModel,
            summaryNode: get().defaultSummaryModel,
            mergeNode: get().defaultMergeModel,
          }
        }
      });

    } catch (err) {
      console.error('Error setting default model:', err);
    }
  },
});