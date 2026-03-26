import {Edge, Node, OnNodesChange, OnEdgesChange, OnConnect} from "@xyflow/react";

export type PromptNodeData = {
    label: string;
    prompt?: string;
    response?: string;
}

export type TextNodeData = {
    label: string;
    text: string;
};

export type NodeData = PromptNodeData | TextNodeData;

export type NodeTypes = 'promptNode' | 'textNode'

export type NodePosition = {
    x: number;
    y: number;
};

export type TextNode = Node<TextNodeData>;

export type PromptNode = Node<PromptNodeData>;

export interface AppState {
    nodes: PromptNode[] | TextNode[];
    edges: Edge[];
    syncing: boolean;

    // Actions
    fetchCanvas: () => Promise<void>;
    saveCanvas: () => Promise<void>;
    addNode: (type: NodeTypes, data: NodeData, position?: NodePosition) => void;
    addPromptNode: (position?: NodePosition) => void;
    addTextNode: (position?: NodePosition) => void;
    updateNodeData: (id: string, data: Partial<PromptNodeData> | Partial<TextNodeData>) => void;

    // React Flow Handlers
    onNodesChange: OnNodesChange<PromptNode | TextNode>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setSyncing: (status: boolean) => void;
}