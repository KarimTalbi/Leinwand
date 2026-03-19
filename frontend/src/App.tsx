import {useEffect} from "react";
import {useShallow} from 'zustand/react/shallow'
import {ReactFlow, Background, Controls, NodeTypes} from '@xyflow/react';

import Nodle from './nodle.tsx';
import useStore from './store';
import {AppState} from './types'

import '@xyflow/react/dist/style.css';

const nodeTypes: NodeTypes = {
    nodle: Nodle,
};

const selector = (state: AppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    fetchCanvas: state.fetchCanvas,
});

function Flow() {
    const syncing = useStore((state) => state.syncing);
    const {nodes, edges, onNodesChange, onEdgesChange, onConnect, fetchCanvas} = useStore(
        useShallow(selector)
    );

    useEffect(() => {
        void fetchCanvas();
    }, [fetchCanvas]);

    return (
        <div className="relative h-screen w-screen overflow-hidden">

            {/* Sync Indicator */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 border border-white/20 shadow-lg">
                <div className={`h-2 w-2 rounded-full ${syncing ? 'animate-pulse bg-yellow-400' : 'bg-green-500'}`} />
                <span className="text-xs font-medium text-black/80">
                    {syncing ? 'Syncing...' : 'Saved'}
                </span>
            </div>

            {/* React Flow */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                nodeTypes={nodeTypes}
            >
                <Background/>
                <Controls/>
            </ReactFlow>
        </div>
    );
}

export default Flow;