import {create, useStore as useZustandStore} from 'zustand';
import {temporal} from "zundo";
import {addEdge as xyAddEdge, applyNodeChanges, applyEdgeChanges, XYPosition} from "@xyflow/react";

import api, {BASE_URL} from './api';
import {AppState, NodeTypeNames, CanvasRead} from './types';


const nodeInitData = {
  promptNode: {prompt: '', response: '', closed: false},
  textNode: {text: '', closed: false},
  mergeNode: {context: '', closed: false, problems: '', solution: ''},
  summaryNode: {summary: '', closed: false},
};

// Per-node debounced position updates
let positionUpdateTimeout: ReturnType<typeof setTimeout> | null = null;
const pendingPositionUpdates = new Map<string, { x: number; y: number }>();

const flushPositionUpdates = () => {
  pendingPositionUpdates.forEach((pos, nodeId) => {
    api.put(`/node/${nodeId}/update/`, {position: pos}).catch(console.error);
  });
  pendingPositionUpdates.clear();
};

const debouncedPositionUpdate = (id: string, position: { x: number; y: number }) => {
  pendingPositionUpdates.set(id, position);
  if (positionUpdateTimeout) clearTimeout(positionUpdateTimeout);
  positionUpdateTimeout = setTimeout(flushPositionUpdates, 400);
};


const useStore = create<AppState>()(
  temporal(
    (set, get) => ({
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

      historyTicket: 0,

      saveSnapshot: () => set((state) => ({historyTicket: state.historyTicket + 1})),


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
        try {
          await api.post('/users/create', {username, password});
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
        useStore.temporal.getState().clear()
        set({nodes: [], edges: [], currentCanvasId: canvasId});
        try {
          const [nodesRes, edgesRes] = await Promise.all([
            api.get(`/node/list/${canvasId}/`),
            api.get(`/edge/list/${canvasId}/`),
          ]);
          console.log(nodesRes.data)
          set({
            nodes: (nodesRes.data ?? []).map((n: {
              id: string;
              type: string;
              position: { x: number; y: number };
              data: Record<string, unknown>
            }) => ({
              id: String(n.id),
              type: n.type,
              position: n.position,
              data: n.data,
            })),
            edges: (edgesRes.data ?? []).map((e: {
              id: string;
              source: string;
              target: string;
              sourceHandle?: string;
              targetHandle?: string
            }) => ({
              id: String(e.id),
              source: String(e.source),
              target: String(e.target),
              sourceHandle: e.sourceHandle ?? null,
              targetHandle: e.targetHandle ?? null,
            }))
          });

        } catch (err) {
          console.error('Error loading canvas:', err);
        } finally {
          get().saveSnapshot()
        }
      },

      createCanvas: async (name) => {
        try {
          const res = await api.post<CanvasRead>('/canvas/create/', {name, data: {}});
          set({canvases: [...get().canvases, res.data]});
        } catch (err) {
          console.error('Error creating canvas:', err);
        }
      },

      deleteCanvas: async (canvasId) => {
        try {
          await api.delete(`/canvas/${canvasId}/delete/`);
          set({
            canvases: get().canvases.filter((c) => c.id !== canvasId),
            ...(get().currentCanvasId === canvasId ? {currentCanvasId: null, nodes: [], edges: []} : {}),
          });
        } catch (err) {
          console.error('Error deleting canvas:', err);
        }
      },

      exitCanvas: () => set({currentCanvasId: null, nodes: [], edges: []}),


      // ── Flow actions ──────────────────────────────────────────────────────────

      addNode: async (type: NodeTypeNames, position?: XYPosition) => {
        const canvasId = get().currentCanvasId;
        if (!canvasId) return;

        const pos = position ?? {x: Math.random() * 400, y: Math.random() * 400};
        try {
          const res = await api.post(`/node/create/${canvasId}/`, {
            id: 'tempId',
            type: type,
            position: pos,
            data: nodeInitData[type],
          });
          const node = res.data;

          set({
            nodes: [
              ...get().nodes,
              {
                id: String(node.id),
                type: node.type,
                position: node.position,
                data: node.data
              },
            ]
          });
          return String(node.id);
        } catch (err) {
          console.error('Error creating node:', err);
          return undefined;
        } finally {
          get().saveSnapshot()
        }
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

      addEdge: async (source, target) => {
        const canvasId = get().currentCanvasId;
        if (!canvasId) return;
        try {
          const res = await api.post(`/edge/create/${canvasId}/`, {
            source,
            target,
            source_handle: 'source-1',
            target_handle: 'target-1',
          });
          const edge = res.data;
          set({
            edges: [
              ...get().edges,
              {
                id: String(edge.id),
                source: String(edge.source),
                target: String(edge.target),
                sourceHandle: edge.sourceHandle ?? null,
                targetHandle: edge.targetHandle ?? null,
              },
            ]
          });
        } catch (err) {
          console.error('Error creating edge:', err);
        } finally {
        }
      },

      deleteNode: async (id) => {
        const connectedEdges = get().edges.filter((e) => e.source === id || e.target === id);
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.source !== id && e.target !== id),
        });
        await Promise.all([
          ...connectedEdges.map((e) => api.delete(`/edge/${e.id}/delete/`).catch(console.error)),
          api.delete(`/node/${id}/delete/`).catch(console.error),
        ]);
      },

      updateNodeData: (id, data) => {
        set({
          nodes: get().nodes.map((n) => n.id === id ? {...n, data: {...n.data, ...data}} : n),
        });
        api.put(`/node/${id}/update/`, {data: {...get().nodes.find((n) => n.id === id)?.data, ...data}})
          .catch(console.error);
      },

      updateNodeClosed: (id, closed) => {
        get().updateNodeData(id, {closed});
      },

      onNodesChange: (changes) => {
        const isDragEnd = changes.some(c => c.type === 'position' && !c.dragging);
        const hasRemovals = changes.some(c => c.type === 'remove');

        set({nodes: applyNodeChanges(changes, get().nodes)});

        if (isDragEnd || hasRemovals) {
          get().saveSnapshot()
        }

        for (const change of changes) {
          if (change.type === 'position' && !change.dragging && change.position) {
              debouncedPositionUpdate(change.id, change.position);
          }


          if (change.type === 'remove') {
              api.delete(`/node/${change.id}/delete/`).catch(console.error);
          }
        }
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges)
        });

        for (const change of changes) {
          if (change.type === 'remove') {
            api.delete(`/edge/${change.id}/delete/`).catch(console.error);
          }
        }
      },

      onConnect: (connection) => {
        const canvasId = get().currentCanvasId;
        if (!canvasId) return;

        // Optimistically add edge to state
        const tempId = `temp-${Date.now()}`;
        set({
          edges: xyAddEdge(
            {
              id: tempId,
              ...connection,
              sourceHandle: connection.sourceHandle ?? null,
              targetHandle: connection.targetHandle ?? null,
            },
            get().edges
          ),
        });

        // Persist to backend and replace temp ID with real one
        api.post(`/edge/create/${canvasId}/`, {
          source: connection.source,
          target: connection.target,
          source_handle: connection.sourceHandle ?? null,
          target_handle: connection.targetHandle ?? null,
        })
          .then((res) => {
            const edge = res.data;
            set({
              edges: get().edges.map((e) =>
                e.id === tempId
                  ? {
                    id: String(edge.id),
                    source: String(edge.source),
                    target: String(edge.target),
                    sourceHandle: edge.sourceHandle ?? null,
                    targetHandle: edge.targetHandle ?? null,
                  }
                  : e
              ),
            });
          })
          .catch(console.error);
      },



      setSyncing: (status) => set({syncing: status}),
      setLocked: (status) => set({locked: status}),

    }),
    {
      partialize: (state) => ({
        nodes: state.nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data
        })),
        edges: state.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        })),
        historyTicket: state.historyTicket

      }),
      limit: 50,

      equality: (pastState, currentState) => pastState.historyTicket === currentState.historyTicket,

      onSave: (pastState, currentState) =>
        console.log(pastState, currentState)
    }
  )
);

export default useStore;

export const useTemporalStore = () => useZustandStore(useStore.temporal);