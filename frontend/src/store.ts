import {create} from 'zustand';
import {v4 as uuid} from 'uuid';
import {addEdge, applyNodeChanges, applyEdgeChanges} from "@xyflow/react";

import api from './api'
import {PromptNode, TextNode, AppState, NodeTypes, NodeData, NodePosition} from './types'

const useStore = create<AppState>((set, get) => ({
    nodes: [],
    edges: [],
    syncing: false,

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

    saveCanvas: async () => {
        set({syncing: true});

        try {
            await api.post("/canvas", {
                nodes: get().nodes,
                edges: get().edges,
            });

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
            data: data
        };

        set({nodes: [...get().nodes, newNode]});
        void get().saveCanvas()
    },

    addPromptNode: (position?: NodePosition) => {
        get().addNode( 'promptNode', {label: "New Node", prompt: '', response: ''}, position)
    },

    addTextNode: (position?: NodePosition) => {
        get().addNode( 'textNode', {label: "New Node", text: ''}, position)
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

            void get().saveCanvas()
        }
    },


    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges)
        });

        if (changes.some(c => c.type === 'remove')) {
            void get().saveCanvas()
        }
    },

    onConnect: (connection) => {
        set({edges: addEdge({id: uuid(), ...connection}, get().edges)});
        void get().saveCanvas()
    },

    setSyncing: (status) => {
        set({syncing: status})
    }
}));

export default useStore;