import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import LLMNode from './LLMNode';

const nodeTypes = { llmNode: LLMNode };

const defaultEdgeOptions = {
  style: { strokeWidth: 3 },
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // --- NEW: Sync Status State ---
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'saving', or 'error'

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );


  const loadCanvas = async () => {
  try {
    const response = await fetch('http://localhost:8000/get-canvas');
    if (response.ok) {
      const data = await response.json();

      // We update our state with the nodes and edges from Python/Supabase
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    }
  } catch (error) {
    console.error("Could not load saved data:", error);
  }
};

// This tells React: "Run this function as soon as the component starts up"
useEffect(() => {
  loadCanvas();
}, []); // The empty brackets [] mean "only run once on mount"


  // --- NEW: THE SAVE FUNCTION ---
  const saveCanvas = async () => {
    try {
      const response = await fetch('http://localhost:8000/save-canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // We send the current state of our nodes and edges
        body: JSON.stringify({ nodes, edges }),
      });

      if (response.ok) {
        alert("Saved to Supabase successfully!");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Backend is not running!");
    }
  };

  const addNode = () => {
  // 1. Create a unique ID (using timestamp is an easy trick for now)
  const id = `node_${Date.now()}`;

  // 2. Define the new node object
  const newNode = {
    id: id,
    type: 'llmNode', // Matches our custom component
      position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 }, // Offset position so nodes don't stack
    data: { label: 'New Prompt...', prompt: '', response: '' },
  };

  // 3. Add it to the existing nodes list
  setNodes((nds) => nds.concat(newNode));
};

  useEffect(() => {
    if (nodes.length === 0) return;

    // Set status to saving as soon as the user stops moving things
    setSyncStatus('saving');

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:8000/save-canvas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes, edges }),
        });

        if (response.ok) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (error) {
        setSyncStatus('error');
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [nodes, edges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>

      {/* --- Visual Status Indicator --- */}
      <div style={{
        position: 'absolute', zIndex: 10, bottom: 20, right: 20,
        padding: '8px 12px', borderRadius: '20px', fontSize: '12px',
        backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          backgroundColor: syncStatus === 'saving' ? '#fbbf24' : syncStatus === 'error' ? '#ef4444' : '#22c55e'
        }} />
        <span style={{ color: '#666', fontWeight: '500' }}>
          {syncStatus === 'saving' ? 'Syncing...' : syncStatus === 'error' ? 'Sync Error' : 'All changes saved'}
        </span>
      </div>

      {/* Keep your Add Node button at the top */}
      <div style={{ position: 'absolute', zIndex: 100, top: 10, left: 10 }}>
        <button onClick={addNode} style={{ padding: '10px', cursor: 'pointer', borderRadius: '4px' }}>
          ➕ Add Node
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default App;