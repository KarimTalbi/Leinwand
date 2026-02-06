import { useState } from 'react'; // Added useState
import { Handle, Position, useReactFlow } from 'reactflow';
import ReactMarkdown from 'react-markdown';

export default function LLMNode({ id, data }) {
  const { setNodes } = useReactFlow();

  // 1. Create a "loading" state just for this specific node
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // 2. The Text Change function (already had this)
  const handleTextChange = (evt) => {
    const newText = evt.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, prompt: newText } };
        }
        return node;
      })
    );
  };

  // 3. The Run AI function (Add it here!)
  const handleRunAI = async () => {
    setLoading(true);
    try {
        const response = await fetch(`http://localhost:8000/run-node/${id}`, {
            method: 'POST',
        });

        if (response.ok) {
            const result = await response.json(); // Get the AI response from Python

            // UPDATE THE CANVAS STATE IMMEDIATELY
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                response: result.response, // Put AI text into memory
                            },
                        };
                    }
                    return node;
                })
            );
        }
    } catch (err) {
        console.error("AI request failed", err);
    } finally {
        setLoading(false);
    }
};

  // 4. The Visuals (UI)
  return (
    <div style={{ background: '#fff', border: '2px solid #222', borderRadius: '8px', padding: '10px', width: '300px' }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: '14px',
          height: '14px',
          background: '#555',
          backgroundClip: 'content-box',
          borderRadius: '50%',
          left: '-7px'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{id}</div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded ? (
      <>
      {data.response ? (
        <div style={{
          fontSize: '12px',
          color: '#333',
          padding: '5px',
          background: '#f0f0f0',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap'
        }}>
          {data.prompt}
        </div>
      ) : (
        <textarea
          value={data.prompt || ""}
          onChange={handleTextChange}
          placeholder="Ask the LLM something..."
          style={{
            width: '100%',
            height: '60px',
            fontSize: '12px',
            border: '1px solid #eee',
            padding: '4px',
            boxSizing: 'border-box'
          }}
        />
      )}

      <hr style={{ margin: '10px 0', border: '0', borderTop: '1px solid #eee' }} />

      <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5px' }}>AI RESPONSE</div>
      <div style={{
          fontSize: '12px',
          color: '#444',
          minHeight: '20px',
          background: '#f9f9f9',
          padding: '5px',
          overflow: 'auto'
      }}>
        {data.response ? <ReactMarkdown>{data.response}</ReactMarkdown> : "No response yet..."}
      </div>

      {/* 5. Update the button to use handleRunAI and show loading status */}
      {!data.response && (
      <button
  type="button"
  onClick={(e) => {
    console.log("BUTTON PHYSICALLY CLICKED");
    handleRunAI();
  }}
  style={{
    marginTop: '10px',
    width: '100%',
    padding: '10px',
    backgroundColor: '#3b82f6',
    color: 'white',
    zIndex: 999,      // Ensures it's on top of everything
    position: 'relative'
  }}
>
  Run AI
</button>
      )}
      </>
      ) : (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {data.prompt ? (data.prompt.length > 50 ? data.prompt.slice(0, 50) + '...' : data.prompt) : "..."}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: '14px',
          height: '14px',
          background: '#555',
          backgroundClip: 'content-box',
          borderRadius: '50%',
          right: '-7px'
        }}
      />
    </div>
  );
}