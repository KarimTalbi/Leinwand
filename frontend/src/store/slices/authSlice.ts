import {v4 as uuidv4} from 'uuid';
import api from '@/api';
import type {AppState} from '@/types';
import type {StateCreator} from 'zustand';

export type AuthSlice = {
  // State
  token: string | null;
  user: { username: string; disabled: boolean } | null;
  authError: string | null;
  defaultModel: Record<string, unknown>;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string) => Promise<void>;
  clearAuthError: () => void;
};

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────

  token: localStorage.getItem('token'),
  user: null,
  authError: null,
  defaultModel: JSON.parse(localStorage.getItem('defaultModel') || '{}'),

  // ── Actions ────────────────────────────────────────────────────────────────

  login: async (username, password) => {
    set({authError: null});

    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const res = await api.post('/users/token', params, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      });

      const token: string = res.data.access_token;
      localStorage.setItem('token', token);
      set({token});

      const me = await api.get('/users/me');
      const defaultModel = me.data.user_data.data.defaultModel || {};
      localStorage.setItem('defaultModel', JSON.stringify(defaultModel));

      set({
        user: {username: me.data.username, disabled: me.data.disabled},
        defaultModel,
      });
    } catch {
      set({authError: 'Invalid username or password.'});
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('defaultModel');

    set({
      token: null,
      user: null,
      authError: null,
      defaultModel: {},
      // Cross-slice resets — these keys live in other slices but are part of AppState
      canvases: [],
      currentCanvasId: null,
      currentCanvasName: null,
      nodes: [],
      edges: [],
      apiKeys: [],
    });
  },

  register: async (username, password) => {
    set({authError: null});

    const newUserId = String(uuidv4());

    try {
      await api.post('/users/create', {
        id: newUserId,
        username,
        password,
      });
      await get().login(username, password);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      set({authError: status === 409 ? 'Username already taken.' : 'Registration failed.'});
    }
  },

  clearAuthError: () => set({authError: null}),
});