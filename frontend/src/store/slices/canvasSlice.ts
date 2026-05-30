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
  setDefaultApiKey: (model: string, key_id: string, provider: string) => Promise<void>;
};

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

  selectCanvas: async (canvasId, canvasName) => {
    set({nodes: [], edges: [], currentCanvasId: canvasId, currentCanvasName: canvasName});

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
    } catch (err) {
      console.error('Error creating canvas:', err);
    }
  },

  deleteCanvas: async (canvasId) => {
    try {
      await api.delete(`/canvas/${canvasId}/delete/`);
      await get().loadCanvases();
    } catch (err) {
      console.error('Error deleting canvas:', err);
    }
  },

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
      void get().loadApiKeys();
    } catch (err) {
      console.error('Error deleting API key:', err);
    }
  },

  setDefaultApiKey: async (model, key_id, provider) => {
    const defaultModel = {model, key_id, modelProvider: provider};
    localStorage.setItem('defaultModel', JSON.stringify(defaultModel));
    set({defaultModel});

    try {
      await api.put('/users/update', {data: {defaultModel}});
    } catch (err) {
      console.error('Error setting default model:', err);
    }
  },
});