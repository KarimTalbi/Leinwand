import {create} from 'zustand';
import {v4 as uuidv4} from 'uuid'
import {addEdge as xyAddEdge, applyNodeChanges, applyEdgeChanges, XYPosition} from "@xyflow/react";

import api, {BASE_URL} from './api';
import {AppState, NodeTypeNames, CanvasRead} from './types';


const nodeInitData = {
  promptNode: {prompt: '', response: '', closed: false},
  textNode: {text: '', closed: false},
  mergeNode: {context: '', closed: false, problems: '', solution: ''},
  summaryNode: {summary: '', closed: false},
};

const useStore = create<AppState>()((set, get) => ({
    // Auth state — restore token from localStorage on init
    token: localStorage.getItem('token'),
    user: null,
    authError: null,

    // Canvas management state
    canvases: [],
    currentCanvasId: null,

    // Flow state
    nodes: [],
    edges: [],
    syncing: false,
    locked: false,


    // ── Auth actions ──────────────────────────────────────────────────────────

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

        set({user: me.data});

      } catch {

        set({authError: 'Invalid username or password.'});

      }
    },

    logout: () => {
      localStorage.removeItem('token');

      set({token: null, user: null, canvases: [], currentCanvasId: null, nodes: [], edges: []});
    },

    register: async (username, password) => {

      set({authError: null});

      const newUserId = String(uuidv4())

      try {

        await api.post('/users/create', {id: newUserId, username: username, password: password});
        await get().login(username, password);

      } catch (err: unknown) {

        const status = (err as { response?: { status?: number } })?.response?.status;
        set({authError: status === 409 ? 'Username already taken.' : 'Registration failed.'});

      }
    },

    clearAuthError: () => set({authError: null}),


    // ── Canvas management actions ─────────────────────────────────────────────

    loadCanvases: async () => {

      try {

        const res = await api.get<CanvasRead[]>('/canvas/list/');
        set({canvases: res.data});

      } catch (err) {

        console.error('Error loading canvases:', err);

      }
    },

    selectCanvas: async (canvasId) => {

      set({nodes: [], edges: [], currentCanvasId: canvasId});

      try {

        const res = await api.get(`/node/list/${canvasId}`)

        set({

          nodes: (res.data.nodes ?? []).map((n: {
            id: string;
            type: string;
            position: { x: number; y: number };
            data: Record<string, unknown>

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
            targetHandle?: string

          }) => ({

            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle ?? null,
            targetHandle: e.targetHandle ?? null,

          }))
        });

      } catch (err) {

        console.error('Error loading canvas:', err);

      }
    },

    createCanvas: async (name) => {

      const newCanvasId = String(uuidv4());

      try {

        await api.post<CanvasRead>('/canvas/create/', {id: newCanvasId, name: name, data: {}});
        await get().loadCanvases()

      } catch (err) {

        console.error('Error creating canvas:', err);

      }
    },

    deleteCanvas: async (canvasId) => {
      try {

        await api.delete(`/canvas/${canvasId}/delete/`);
        await get().loadCanvases()

      } catch (err) {

        console.error('Error deleting canvas:', err);

      }
    },

    exitCanvas: () => set({currentCanvasId: null, nodes: [], edges: []}),


    // ── Flow actions ──────────────────────────────────────────────────────────


    syncCanvas: async () => {

      get().setSyncing(true)

      try {

        const canvasId = get().currentCanvasId;
        if (!canvasId) return;

        const flowData = {nodes: get().nodes, edges: get().edges}

        console.log(flowData)

        await api.post(`/node/sync/${canvasId}/`, flowData);

      } catch (err) {

        console.log("error syncing", err)

      } finally {

        get().setSyncing(false)

      }
    },

    addNode: (type: NodeTypeNames, position?: XYPosition) => {

      const pos = position ?? {x: Math.random() * 400, y: Math.random() * 400};

      const newNode = {
        id: String(uuidv4()),
        type: type,
        position: pos,
        data: nodeInitData[type],
      }

      set({nodes: [...get().nodes, newNode]})

      void get().syncCanvas()

      return newNode.id

    },

    promptNodeAction: async (nodeId) => {
      try {
        const res = await fetch(`${BASE_URL}/node/${nodeId}/streaming_chat/`, {
          headers: {
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },

        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let buffer = '';

        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? {...n, data: {...n.data, response: '', closed: true}}
              : n
          ),
        });

        while (true) {
          const {done, value} = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, {stream: true});
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const token = line.slice(6).replaceAll('\\n', '\n');
            if (token === '[DONE]') break;
            accumulated += token;
          }

          set({
            nodes: get().nodes.map((n) =>
              n.id === nodeId
                ? {...n, data: {...n.data, response: accumulated}}
                : n
            ),
          });
        }

        if (buffer.startsWith('data: ')) {
          const token = buffer.slice(6).replaceAll('\\n', '\n');
          if (token === '[DONE]') accumulated += token;
        }
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? {...n, data: {...n.data, response: accumulated}}
              : n
          ),
        });

      } catch (err) {
        console.error('Error prompting Node', err);
      } finally {

      }
    },

    summaryNodeAction: async (nodeId) => {


      try {
        const res = await api.get(`/node/${nodeId}/summary/`);
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? {...n, data: {...n, summary: res.data.data.summary, closed: true}}
              : n
          ),
        });
      } catch (err) {
        console.error('Error summarizing', err);
      } finally {

      }
    },

    mergeNodeAction: async (nodeId) => {

      try {
        const res = await api.get(`/node/${nodeId}/merge/`);
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? {
                ...n,
                data: {
                  ...n,
                  context: res.data.data.context,
                  problems: res.data.data.problems || "",
                  solution: res.data.data.solution || "",
                  closed: true
                }
              }
              : n
          ),
        });
      } catch (err) {
        console.error('Error Merging', err)
      } finally {
      }
    },

    addEdge: (source, target) => {

      set({
        edges: [
          ...get().edges,
          {
            id: String(uuidv4()),
            source: source,
            target: target,
            sourceHandle: 'source-1',
            targetHandle: 'target-1',
          },
        ]
      });

      void get().syncCanvas()

    },

    deleteNode: (id) => {

      set({
        nodes: get().nodes.filter((n) => n.id !== id),
        edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      });

      void get().syncCanvas()
    },

    updateNodeData: (id, data) => {
      set({
        nodes: get().nodes.map((n) => n.id === id ? {...n, data: {...n.data, ...data}} : n),
      });

      void get().syncCanvas()
    },

    updateNodeClosed: (id, closed) => {
      get().updateNodeData(id, {closed});
    },

    onNodesChange: (changes) => {
      const isDragEnd = changes.some(c => c.type === 'position' && !c.dragging);
      const hasRemovals = changes.some(c => c.type === 'remove');

      set({nodes: applyNodeChanges(changes, get().nodes)});

      if (isDragEnd || hasRemovals) {
        void get().syncCanvas()
      }
    },

    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges)
      });

      void get().syncCanvas()
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

      void get().syncCanvas()

    },

    setSyncing: (status) => set({syncing: status}),
    setLocked: (status) => set({locked: status}),

  }),
);

export default useStore;