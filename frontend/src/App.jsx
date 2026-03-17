import {useState, useCallback} from "react";
import {ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, MiniMap } from '@xyflow/react';

import Nodle from './Nodle.jsx';

import '@xyflow/react/dist/style.css';

const nodeTypes = {
    Nodle,
};

const initialNodes = [
    {
        id: '5e3be38bc1024aa892059d994c24f9a9',
        position: {x: 0, y: 0},
        data: {
            label: 'Adding Markdown to React Flow',
            prompt: 'How do i add markdown to the response area?',
            response: ``
        },
        type: 'Nodle',
    },
    {
        id: 'ea66cce1c0c04b308477b93ada616f48',
        position: {x: 100, y: 100},
        data: {label: 'Node 2'},
        type: 'Nodle',
    }
];

const initialEdges = [
    {
        id: 'n1-n2',
        source: 'n1',
        target: 'n2',
        type: 'default',
    },
];

function Flow() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    return (

    <div className="relative h-screen w-screen overflow-hidden">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            nodeTypes={nodeTypes}
            fitViewOptions={{padding: 0.5}}
        >
            <Background />
        <Controls/>
            </ReactFlow>
        </div>
    );
}

export default Flow;