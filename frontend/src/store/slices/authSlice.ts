import {v4 as uuidv4} from 'uuid';
import api from '@/api';
import type {AppState, LLMModel, UserRead} from '@/types';
import type {StateCreator} from 'zustand';

export type AuthSlice = {
  // State
  token: string | null;
  user: UserRead | null;
  authError: string | null;
  defaultModel: LLMModel | null;
  defaultPromptModel: LLMModel | null;
  defaultSummaryModel: LLMModel | null;
  defaultMergeModel: LLMModel | null;


  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string) => Promise<void>;
  clearAuthError: () => void;
  updateUsername: (newUsername: string) => void;
  updatePassword: (current: string, next: string) => void;
  deleteUser: () => void;
};

/** Zustand slice that manages authentication state and user session. */
export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────

  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || '{}'),
  authError: null,


  defaultModel: JSON.parse(localStorage.getItem('default') || '{}'),
  defaultPromptModel: JSON.parse(localStorage.getItem('promptNode') || '{}'),
  defaultSummaryModel: JSON.parse(localStorage.getItem('summaryNode') || '{}'),
  defaultMergeModel: JSON.parse(localStorage.getItem('mergeNode') || '{}'),

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Authenticates with username/password, stores the JWT, and hydrates user + defaultModel. */
  login: async (username, password) => {
    set({authError: null});

    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const res = await api.post('/users/token/', params, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      });

      const token: string = res.data.access_token;
      localStorage.setItem('token', token);
      set({token});

      const me = await api.get<UserRead>('/users/me/');
      const defaultModel = me.data.user_data?.default_models.default || {};
      const promptModel = me.data.user_data?.default_models.promptNode || {};
      const summaryModel = me.data.user_data?.default_models.summaryNode || {};
      const mergeModel = me.data.user_data?.default_models.mergeNode || {};

      localStorage.setItem('user', JSON.stringify(me.data))
      localStorage.setItem('default', JSON.stringify(defaultModel));
      localStorage.setItem('promptNode', JSON.stringify(promptModel));
      localStorage.setItem('summaryNode', JSON.stringify(summaryModel));
      localStorage.setItem('mergeNode', JSON.stringify(mergeModel));

      set({
        user: me.data,
        loginOpen: false,
        defaultModel,
        defaultPromptModel: promptModel,
        defaultSummaryModel: summaryModel,
        defaultMergeModel: mergeModel
      });

    } catch {
      set({authError: 'Invalid username or password.'});
    }
  },

  /** Clears the JWT and resets all user-specific state across slices. */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('default');
    localStorage.removeItem('promptNode');
    localStorage.removeItem('summaryNode');
    localStorage.removeItem('mergeNode');

    set({
      token: null,
      user: null,
      authError: null,
      defaultModel: {},
      canvases: [],
      currentCanvasId: null,
      currentCanvasName: null,
      nodes: [],
      edges: [],
      apiKeys: [],
    });
  },

  /** Creates a new user account then immediately logs in. */
  register: async (username, password) => {
    set({authError: null});

    const newUserId = String(uuidv4());

    try {
      await api.post('/users/create/', {
        id: newUserId,
        username,
        password,
      });
      await get().login(username, password);
      set({loginOpen: false})
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      set({authError: status === 409 ? 'Username already taken.' : 'Registration failed.'});
    }
  },

  updateUsername: async (newUsername: string) => {
    set({authError: null});

    try {
      await api.put('/users/update_username/', {
        name: newUsername
      })

    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      set({authError: status === 409 ? 'Username already taken.' : 'Registration failed.'});
    }

    if (!get().authError) {
      get().logout();
    }
  },

  updatePassword: async (current: string, next: string) => {
    set({authError: null});

    try {
      await api.put('/users/update_password/', {
        old_password: current,
        new_password: next
      })

    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      set({authError: status === 409 ? 'Username already taken.' : 'Registration failed.'});
    }

    if (!get().authError) {
      get().logout();
    }
  },

  deleteUser: async () => {
    set({authError: null});

    try {
      await api.delete('/users/delete/')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      set({authError: status === 409 ? 'Username already taken.' : 'Registration failed.'});
    }

    if (!get().authError) {
      get().logout();
    }
  },

  clearAuthError: () => set({authError: null}),
});