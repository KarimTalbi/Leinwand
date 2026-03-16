import {memo, useState} from 'react';
import {Handle, Position, useReactFlow} from '@xyflow/react';

const Nodle = ({id, data}) => {
    const {setNodes} = useReactFlow();
    const [Loading, setLoading] = useState(false);
    const [textInput, setTextInput] = useState(data.prompt || '');

    const handleSend = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/llm/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: textInput, target_id: id
                })
            });

            const result = await response.json();

            setNodes((nds) => nds.map((node) => {
                    if (node.id === id) {
                        return {
                            ...node,
                            ...result,
                        };
                    }
                    return node;
                })
            );
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            padding: '10px',
            borderRadius: '10px',
            background: '#ffffff',
            height: '100%',
            minWidth: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        }}>
            <div style={{
                fontSize: '12px',
                fontWeight: 'bold'
            }}>
                {data.label}
            </div>

            <textarea
                className="nodrag xy-theme__textarea"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter prompt..."
            />

            <button
                className="nodrag xy-theme__button"
                onClick={handleSend}
                disabled={Loading}
            >
                {Loading ? 'Sending...' : 'Send to Backend'}
            </button>

            {data.response && (
                <div style={{fontSize: '11px', background: '#f0f0f0', padding: '5px'}}>
                    {data.response}
                </div>
            )}

            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </div>
    );
};

export default memo(Nodle);