import {useEffect} from "react";
import {useShallow} from 'zustand/react/shallow'
import {ReactFlow, Background, Controls, NodeTypes, Panel, useReactFlow} from '@xyflow/react';

import PromptNode from './nodetypes/promptnode.tsx';
import TextNode from './nodetypes/textnode.tsx';
import MergeNode from './nodetypes/mergenode.tsx';
import useStore from './store';
import {AppState} from './types'

import '@xyflow/react/dist/style.css';
import api from "./api.ts";

const nodeTypes: NodeTypes = {
    promptNode: PromptNode,
    textNode: TextNode,
    mergeNode: MergeNode,
};
const defaultEdgeOptions = {
    style: {strokeWidth: 4}
};

const selector = (state: AppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    fetchCanvas: state.fetchCanvas,
    addPromptNode: state.addPromptNode,
    addTextNode: state.addTextNode,
    addMergeNode: state.addMergeNode,
});

function Flow() {
    const {screenToFlowPosition} = useReactFlow()
    const syncing = useStore((state) => state.syncing);

    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        fetchCanvas,
        addPromptNode,
        addTextNode,
        addMergeNode,
    } = useStore(
        useShallow(selector)
    );

    useEffect(() => {
        void fetchCanvas();
    }, []);

    const onCreatePromptNode = () => {
        const position = screenToFlowPosition(
            {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            }
        );

        addPromptNode(position);
    };

    const onCreateTextNode = () => {
        const position = screenToFlowPosition(
            {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            }
        );

        addTextNode(position);
    };

    const onCreateMergeNode = () => {
        const position = screenToFlowPosition(
            {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            }
        );

        addMergeNode(position);
    };

    const onTest = async () => {

        try {
            await api.get('/test');

        } catch (err) {
            console.error('Error testing:', err);
        }
    };


    return (
        <div className="relative h-screen w-screen overflow-hidden">

            {/* Sync Indicator */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-white backdrop-blur-md px-3 py-1 border border-white/20 shadow-lg">
                <div className={`h-2.5 w-2.5 rounded-full ${syncing ? 'animate-pulse bg-yellow-400' : 'bg-green-500'}`} />
                <span className="text-s font-medium text-black/80">
                    {syncing ? 'Syncing...' : 'Saved'}
                </span>
            </div>

            {/* React Flow */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                snapToGrid={true}
                snapGrid={[30, 30]}
                defaultEdgeOptions={defaultEdgeOptions}
                onConnect={onConnect}
                fitView
                nodeTypes={nodeTypes}
            >
                <Background bgColor="#ebebeb" size={3} gap={30} color="#7dacb5"/>
                <Controls/>
                <Panel position="top-left" className="flex gap-2">
                    <button
                        onClick={onCreatePromptNode}
                        className="bg-[#7dacb5] hover:bg-[#6a99a1] text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors border border-white/20"
                    >
                        PromptNode
                    </button>
                    <button
                        onClick={onCreateTextNode}
                        className="bg-[#7dacb5] hover:bg-[#6a99a1] text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors border border-white/20"
                    >
                        TextNode
                    </button>
                    <button
                        onClick={onCreateMergeNode}
                        className="bg-[#7dacb5] hover:bg-[#6a99a1] text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors border border-white/20"
                    >
                        MergeNode
                    </button>
                    <button
                        onClick={onTest}
                        className="bg-[#7dacb5] hover:bg-[#6a99a1] text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors border border-white/20"
                    >
                        test
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
}

export default Flow;