import {memo, useState} from 'react';
import {Handle, Position, useReactFlow} from '@xyflow/react';
import {Textarea, Field, Label, Description, Fieldset, Legend, Button} from "@headlessui/react";
import clsx from "clsx";

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
        <div className="w-100 max-w-lg bg-white border border-black/12  rounded-xl p-4 shadow-xl">
            <Fieldset className="space-y-4">
                <Legend className="text-lg font-bold text-black">{data.label}</Legend>
                <Field>
                    <Label className="text-sm font-medium text-black">Enter prompt</Label>
                    <Textarea
                        className={clsx(
                            'mt-1 block w-full resize-none rounded-lg border-none bg-black/5 px-3 py-1.5 text-sm/6 text-black',
                            'focus:bg-white/80 transition-all focus:ring-1 focus:ring-white/30'
                        )}
                        rows={2}
                    />
                </Field>
                <Button
                    className="inline-flex items-center gap-2 rounded-md bg-black/5  px-3 py-1.5 text-sm/6 font-semibold text-black shadow shadow-gray/5 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                    onClick={handleSend}
                    disabled={Loading}
                >
                    {Loading ? 'Loading...' : 'Send'}
                </Button>
                <div className="text-sm/6 text-black bg-white/5 border border-white/10 p-3 rounded-lg mt-2 italic">
                    {data.response ? data.response : 'No response yet'}
                </div>
            </Fieldset>

            <Handle type="target" position={Position.Left} className="bg-[#7dacb5]! w-3! h-3! border-none!" />
            <Handle type="source" position={Position.Right} className="bg-[#7dacb5]! w-3! h-3! border-none!"/>

        </div>
    );
};

export default memo(Nodle);