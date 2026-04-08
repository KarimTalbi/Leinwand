import {create} from 'zustand';
import {v4 as uuid} from 'uuid';
import {addEdge, applyNodeChanges, applyEdgeChanges} from "@xyflow/react";

import api from './api'
import {PromptNode, TextNode, AppState, NodeTypes, NodeData, NodePosition, HistorySnapshot} from './types'

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

const debouncedSave = (saveCanvas: () => Promise<void>) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => void saveCanvas(), 100);
};

const useStore = create<AppState>((set, get) => ({
    nodes: [],
    edges: [],
    syncing: false,
    historyList: [] as HistorySnapshot[],
    historyIndex: null,

    fetchCanvas: async () => {
        set({syncing: true})

        try {
            const res = await api.get("/canvas");
            set({
                nodes: res.data.nodes || [],
                edges: res.data.edges || [],
            });

        } catch (err) {
            console.error("Error loading canvas:", err);

        } finally {
            set({syncing: false});
        }
    },

    fetchHistory: async () => {
        try {
            const res = await api.get("/canvas/history");
            set({historyList: res.data || []});
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    },

    revertBack: async () => {
        const {historyList, historyIndex, fetchHistory} = get();

        let list = historyList;
        if (list.length === 0) {
            await fetchHistory();
            list = get().historyList;
        }

        const nextIndex = historyIndex === null ? 0 : historyIndex + 1;
        if (nextIndex >= list.length) return;

        set({syncing: true});
        try {
            const res = await api.post(`/canvas/revert/${list[nextIndex].id}`);
            set({
                nodes: res.data.nodes || [],
                edges: res.data.edges || [],
                historyIndex: nextIndex,
            });
        } catch (err) {
            console.error("Error reverting canvas:", err);
        } finally {
            set({syncing: false});
        }
    },

    revertForward: async () => {
        const {historyList, historyIndex} = get();
        if (historyIndex === null) return;

        set({syncing: true});
        try {
            if (historyIndex === 0) {
                const res = await api.get("/canvas");
                set({
                    nodes: res.data.nodes || [],
                    edges: res.data.edges || [],
                    historyIndex: null,
                });
            } else {
                const res = await api.post(`/canvas/revert/${historyList[historyIndex - 1].id}`);
                set({
                    nodes: res.data.nodes || [],
                    edges: res.data.edges || [],
                    historyIndex: historyIndex - 1,
                });
            }
        } catch (err) {
            console.error("Error going forward:", err);
        } finally {
            set({syncing: false});
        }
    },

    saveCanvas: async () => {
        set({syncing: true});

        const {historyList, historyIndex} = get();
        const currentHistoryId = historyIndex !== null ? historyList[historyIndex]?.id : undefined;

        try {
            await api.post("/canvas", {
                nodes: get().nodes,
                edges: get().edges,
                ...(currentHistoryId && {currentHistoryId}),
            });

            if (historyIndex !== null) {
                set({historyIndex: null, historyList: []});
            }

        } catch (err) {
            console.error("Error saving canvas:", err);

        } finally {
            set({syncing: false});
        }
    },

    addNode: (type: NodeTypes, data: NodeData, position?: NodePosition) => {
        const newNode: PromptNode | TextNode = {
            id: uuid(),
            type: type,
            position: position ?? {x: Math.random() * 400, y: Math.random() * 400},
            data: data,
        };

        set({nodes: [...get().nodes, newNode]});
        debouncedSave(get().saveCanvas);
    },

    deleteNode: (id: string) => {
        set({
            nodes: get().nodes.filter((n) => n.id !== id),
            edges: get().edges.filter((e) => e.source !== id && e.target !== id),
        });
        debouncedSave(get().saveCanvas);
    },

    addPromptNode: (position?: NodePosition) => {
        get().addNode( 'promptNode', {label: "New Node", prompt: '', response: '', closed: false}, position)
    },

    addTextNode: (position?: NodePosition, text?: string) => {
        get().addNode( 'textNode', {label: "TEXT", text: text ? text : '', closed: false}, position)
    },

    addMergeNode: (position?: NodePosition) => {
        get().addNode('mergeNode', {label: "MERGE", closed: false}, position)
    },

    updateNodeData: (id, data) => {
        set({
            nodes: get().nodes.map((n) => n.id === id ? {...n, data: {...n.data, ...data}} : n)
        });
    },

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes)
        });

        if (changes.some(c => (c.type === 'position' && !c.dragging) || c.type === 'remove')) {
            debouncedSave(get().saveCanvas);
        }
    },


    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges)
        });

        if (changes.some(c => c.type === 'remove')) {
            debouncedSave(get().saveCanvas);
        }
    },

    onConnect: (connection) => {
        console.log("New Connection Data:", connection);
        set({
            edges: addEdge(
                {
                    id: uuid(),
                    ...connection,
                    sourceHandle: connection.sourceHandle ?? null,
                    targetHandle: connection.targetHandle ?? null,
                },
                get().edges
            )
        });
        debouncedSave(get().saveCanvas);
    },

    setSyncing: (status) => {
        set({syncing: status})
    }
}));

export default useStore;