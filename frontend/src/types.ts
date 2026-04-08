import {Edge, Node, OnNodesChange, OnEdgesChange, OnConnect} from "@xyflow/react";

export type PromptNodeData = {
    label: string;
    prompt?: string;
    response?: string;
    closed: boolean;
}

export type TextNodeData = {
    label: string;
    text: string;
    closed: boolean;
};

export type MergeNodeData = {
    label: string;
    context?: string[];
    closed: boolean;
};


export type NodeData = PromptNodeData | TextNodeData | MergeNodeData;

export type NodeTypes = 'promptNode' | 'textNode' | 'mergeNode'

export type NodePosition = {
    x: number;
    y: number;
};

export type TextNode = Node<TextNodeData>;

export type PromptNode = Node<PromptNodeData>;

export type MergeNode = Node<MergeNodeData>;

export interface AppState {
    nodes: (PromptNode | TextNode | MergeNode)[];
    edges: Edge[];
    syncing: boolean;

    // Actions
    fetchCanvas: () => Promise<void>;
    revertCanvas: () => Promise<void>;
    saveCanvas: () => Promise<void>;
    addNode: (type: NodeTypes, data: NodeData, position?: NodePosition) => void;
    deleteNode: (id: string) => void;
    addPromptNode: (position?: NodePosition) => void;
    addTextNode: (position?: NodePosition, text?: string) => void;
    addMergeNode: (position?: NodePosition) => void;
    updateNodeData: (id: string, data: Partial<PromptNodeData> | Partial<TextNodeData> | Partial<MergeNodeData>) => void;

    // React Flow Handlers
    onNodesChange: OnNodesChange<PromptNode | TextNode | MergeNode>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setSyncing: (status: boolean) => void;
}