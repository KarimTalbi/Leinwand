import {Edge, Node, OnNodesChange, OnEdgesChange, OnConnect} from "@xyflow/react";

export type AppNodeData = {
    label: string;
    prompt?: string;
    response?: string;
}

export type AppNode = Node<AppNodeData>;

export interface CanvasWrite {
    nodes?: AppNode[];
    edges?: Edge[];
}

export interface AppState {
    nodes: AppNode[];
    edges: Edge[];
    syncing: boolean;

    // Actions
    fetchCanvas: () => Promise<void>;
    saveCanvas: () => Promise<void>;
    addNode: (label: string) => void;
    updateNodeData: (id: string, data: Partial<AppNodeData>) => void;

    // React Flow Handlers
    onNodesChange: OnNodesChange<AppNode>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setSyncing: (status: boolean) => void;
}