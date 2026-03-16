import {useState, useCallback} from "react";
import {ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, MiniMap } from '@xyflow/react';

import Nodle from './Nodle.jsx';

import '@xyflow/react/dist/style.css';

const nodeTypes = {
    Nodle,
};

const initialNodes = [
    {
        id: 'n1',
        position: {x: 0, y: 0},
        data: {label: 'Node 1'},
        type: 'Nodle',
        style: {backgroundColor: 'white', color: 'black'}
    },
    {
        id: 'n2',
        position: {x: 100, y: 100},
        data: {label: 'Node 2'},
        type: 'Nodle',
        style: {backgroundColor: 'white', color: 'black'}
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

const nodeColor = (node) => {
    switch (node.type) {
        case 'input':
            return '#6ede87';
        case 'output':
            return '#6865A5';
        default:
            return '#ff0072';
    }
};

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
        <div style={{width: '100vw', height: '100vh'}}>
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
                <Background/>
                <Controls/>
                <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
            </ReactFlow>
        </div>
    );
}

export default Flow;