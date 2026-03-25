import {useEffect} from "react";
import {useShallow} from 'zustand/react/shallow'
import {ReactFlow, Background, Controls, NodeTypes, Panel, useReactFlow} from '@xyflow/react';

import Nodle from './nodle.tsx';
import useStore from './store';
import {AppState} from './types'

import '@xyflow/react/dist/style.css';

const nodeTypes: NodeTypes = {
    nodle: Nodle,
};
const defaultEdgeOptions = {
    style: {strokeWidth: 4}
};

const gridSize = 20;


const selector = (state: AppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    fetchCanvas: state.fetchCanvas,
    addNode: state.addNode,
});

function Flow() {
    const {screenToFlowPosition} = useReactFlow()
    const syncing = useStore((state) => state.syncing);
    const {nodes, edges, onNodesChange, onEdgesChange, onConnect, fetchCanvas, addNode} = useStore(
        useShallow(selector)
    );

    useEffect(() => {
        void fetchCanvas();
    }, [fetchCanvas]);

    const onCreateNode = () => {
        const position = screenToFlowPosition(
            {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            }
        );

        addNode(position);
    }

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
                snapGrid={[gridSize, gridSize]}
                defaultEdgeOptions={defaultEdgeOptions}
                onConnect={onConnect}
                fitView
                nodeTypes={nodeTypes}
            >
                <Background/>
                <Controls/>
                <Panel position="top-left" className="flex gap-2">
                    <button
                        onClick={onCreateNode}
                        className="bg-[#7dacb5] hover:bg-[#6a99a1] text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors border border-white/20"
                    >
                        Add Node
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
}

export default Flow;