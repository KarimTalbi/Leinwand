import {create} from 'zustand';
import {v4 as uuidv4} from 'uuid'
import {addEdge as xyAddEdge, applyNodeChanges, applyEdgeChanges, XYPosition} from "@xyflow/react";

import api, {BASE_URL} from '@/api';
import {AppState, NodeTypeNames, CanvasRead, ApiKeyRead} from '@/types';
import {DEFAULT_COLLISION_OPTIONS, resolveCollisions} from "@/lib/resolve-collisions.ts";


const nodeInitData = {
  promptNode: {prompt: '', response: '', closed: false},
  textNode: {text: '', closed: false},
  mergeNode: {context: '', closed: false, problems: '', solution: ''},
  summaryNode: {response: '', closed: false},
};

const useStore = create<AppState>()((set, get) => (
  {
    // Auth state — restore token from localStorage on init
    token: localStorage.getItem('token'),
    user: null,
    authError: null,

    // Canvas management state
    canvases: [],
    currentCanvasId: null,
    currentCanvasName: null,

    // Flow state
    nodes: [],
    edges: [],
    locked: false,
    scrollToZoom: false,

    settingsOpen: false,
    // state

    apiKeys: [],
    defaultModel: null,


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

      set({
        token: null,
        user: null,
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

    selectCanvas: async (canvasId, canvasName) => {

      set({nodes: [], edges: [], currentCanvasId: canvasId, currentCanvasName: canvasName});

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
      const createdAt = Date.now()

      try {

        await api.post<CanvasRead>('/canvas/create/', {
          id: newCanvasId,
          name: name,
          updated_at: createdAt,
          data: {}
        });

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

    updateCanvas: async (canvasId: string, canvasName: string) => {

      set({
        canvases: get().canvases.map((c) =>
          c.id === canvasId
            ? {...c, name: canvasName}
            : c
        ),
      });


      try {
        await api.put(`/canvas/update`, {
          canvas_id: canvasId,
          canvas_name: canvasName,
        })
      } catch (err) {
        console.log(err)
      }
    },

    exitCanvas: () => set({currentCanvasId: null, currentCanvasName: null, nodes: [], edges: []}),

    // ── Api Key management actions ─────────────────────────────────────────────

    loadApiKeys: async () => {
      try {

        const res = await api.get<ApiKeyRead[]>('/api_key/list/')
        set({apiKeys: res.data})

      } catch (err) {
        console.log("Error retrieving API Keys" ,err)
      }
    },


    createApiKey: async (key) => {
      const newKeyId = uuidv4()
      const newKey: ApiKeyRead = {
        id: newKeyId,
        key: key
      }

      try {
        await api.post<ApiKeyRead>('/api_key/create/', newKey)
        void get().loadApiKeys()

      } catch (err) {
        console.log("Error creating API Key" ,err)
      }
    },


    deleteApiKey: async (id) => {
      try {

        await api.delete(`/api_key/${id}/delete/`)
        void get().loadApiKeys()

      } catch (err) {
        console.log("Error deleting API Key" ,err)
      }
    },


    // ── Flow actions ──────────────────────────────────────────────────────────


    syncCanvas: async () => {

      try {

        const canvasId = get().currentCanvasId;
        if (!canvasId) return;

        const resolved = resolveCollisions(get().nodes, DEFAULT_COLLISION_OPTIONS);
        get().setNodes(resolved)

        const flowData = {nodes: get().nodes, edges: get().edges, time: Date.now()}

        await api.post(`/node/sync/${canvasId}/`, flowData);

      } catch (err) {

        console.log("error syncing", err)

      } finally {


      }
    },

    addNode: (type: NodeTypeNames, position?: XYPosition) => {

      const pos = position ?? {x: Math.random() * 400, y: Math.random() * 400};
      const newNodeId = String(uuidv4());

      const newNode = {
        id: newNodeId,
        type: type,
        position: pos,
        data: nodeInitData[type as NodeTypeNames],
      }

      set({nodes: [...get().nodes, newNode]})

      void get().syncCanvas()

      return newNodeId

    },

    moveNode: (nodeId: string, position) => {
      const node = get().nodes.find((node) => node.id === nodeId)
      if (!node || !position) return null

      node.position.y = node.position.y + position.y
      node.position.x = node.position.x + position.x

      set({
        nodes: get().nodes.map((n) =>
          n.id === nodeId
            ? {...n, position: node.position}
            : n
        ),
      });
      void get().syncCanvas()
    },

    createConnectedNode: (type: NodeTypeNames, source: string) => {
      const node = get().nodes.find((node) => node.id === source)
      if (!node) return null
      const sourcePos = node.position
      const sourceHeight = node.measured?.height
      const gap = 30

      if (!sourceHeight) return null

      const newY = sourcePos.y + sourceHeight + gap


      const pos = {
        x: sourcePos.x,
        y: newY
      }

      const newNodeId = String(uuidv4())


      const newNode = {
        id: newNodeId,
        type: type,
        position: pos,
        data: nodeInitData[type],
      }

      set({nodes: [...get().nodes, newNode]})

      set({
        edges: [
          ...get().edges,
          {
            id: String(uuidv4()),
            source: source,
            target: newNodeId,
            sourceHandle: 'source-1',
            targetHandle: 'target-1',
          },
        ]
      });

      void get().syncCanvas()

    },

    promptNodeAction: async (nodeId) => {
      const node = get().nodes.find((node) => node.id === nodeId)
      try {
        const res = await fetch(`${BASE_URL}/llm/streaming_chat/`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          method: 'POST',
          body:
            JSON.stringify({node: node}),
        });

        if (!res.ok || !res.body) {
          console.error(`HTTP ${res.status} or no response body`);
          return;
        }

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
        void get().createConnectedNode("promptNode", nodeId)
      }
    },

    summaryNodeAction: async (nodeId) => {
      const node = get().nodes.find((node) => node.id === nodeId)
      try {
        const res = await fetch(`${BASE_URL}/llm/summary/`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          method: 'POST',
          body:
            JSON.stringify({node}),
        });

        if (!res.ok || !res.body) {
          console.error(`HTTP ${res.status} or no response body`);
          return;
        }

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
        void get().syncCanvas()
      }
    },

    mergeNodeAction: async (nodeId, incomer1, incomer2, checkStreams) => {
      const node = get().nodes.find((node) => node.id === nodeId)

      try {
        const res = await api.post(`/llm/merge/`,
          {node: node, check_consistencies: checkStreams},
        );
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? {
                ...n, data: {
                  ...n.data,
                  context: res.data.context,
                  problems: res.data.problems,
                  has_issues: res.data.has_issues,
                  incomer1: incomer1,
                  incomer2: incomer2,
                  closed: !res.data.has_issues
                }
              }
              : n
          ),
        });

        if (!res.data.has_issues) {
          set({
            edges: get().edges.filter((e) => e.target !== nodeId),
          })
        }

      } catch (err) {

        console.error('Error Merging', err)

      } finally {

        void get().syncCanvas()

      }
    },

    mergeNodeResolveAction: async (nodeId) => {
      const node = get().nodes.find((node) => node.id === nodeId)

      try {
        const res = await api.post(`/llm/merge/resolve/`,
          {node: node},
        );
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? {
                ...n, data: {
                  ...n.data,
                  context: res.data.context,
                  has_issues: false,
                  closed: true
                }
              }
              : n
          ),
        });

        set({
          edges: get().edges.filter((e) => e.target !== nodeId),
        })

      } catch (err) {

        console.error('Error Merging', err)

      } finally {

        void get().syncCanvas()

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

    setNodes: (nodes) => set({nodes: nodes}),
    setEdges: (edges) => set({edges: edges}),

    setLocked: () => set({locked: !get().locked}),
    setSettingsOpen: () => set({settingsOpen: !get().settingsOpen}),
    setScrollToZoom: () => set({scrollToZoom: !get().scrollToZoom}),

  }),
);

export default useStore;