import React, {memo, useState} from 'react';
import {Handle, Position} from '@xyflow/react';
import {Textarea, Field, Fieldset, Legend, Button} from "@headlessui/react";
import clsx from "clsx";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import useStore from './store';
import api from './api'
import {AppNodeData} from "./types.ts";

const Nodle = ({id, data} : {id: string, data: AppNodeData}) => {
    const [loading, setLoading] = useState(false);

    const updateNodeData = useStore((s) => s.updateNodeData);
    const saveCanvas = useStore((s) => s.saveCanvas);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateNodeData(id, {prompt: e.target.value});
    };

    const handleSend = async () => {
        setLoading(true);

        try {
            const res = await api.post('/llm', {
                prompt: data.prompt,
                target_id: id,
            });

            updateNodeData(id, {response: res.data.response});
            await saveCanvas();

        } catch (err) {
            console.error('Error sending prompt to LLM:', err);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-80 max-w-lg bg-white border border-black/10 rounded-xl p-4 shadow-xl">
            <Fieldset className="space-y-2">
                <Legend className="text-lg font-bold text-[#7dacb5]">{data.label}</Legend>

                <Field>
                    <Textarea
                        value={data.prompt}
                        onChange={handleTextChange}
                        placeholder='Enter your prompt...'
                        className={clsx(
                            'nodrag mt-1 block w-full resize-none rounded-lg border-none bg-black/5 px-3 py-1.5 text-sm/6 text-black',
                            'focus:bg-white/80 transition-all focus:ring-1 focus:ring-[#7dacb5]'
                        )}
                        rows={2}
                    />
                </Field>

                <div className="flex justify-end">
                    <Button
                        className="inline-flex items-center gap-2 rounded-md bg-[#7dacb5] px-5 py-1.5 text-sm/6 font-semibold text-white shadow hover:bg-[#6a99a1] disabled:opacity-50 transition-colors"
                        onClick={handleSend}
                        disabled={loading || !data.prompt}
                    >
                        {loading ? 'Thinking...' : 'Send'}
                    </Button>
                </div>

                <div className="text-sm/6 text-black bg-black/5 border border-black/5 p-3 rounded-lg mt-2 min-h-12.5">
                    {data.response ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                        >
                            {data.response}
                        </ReactMarkdown>
                    ) : (
                        <span className="text-gray-400 italic">No response yet</span>
                    )}
                </div>
            </Fieldset>

            {/* Handles */}
            <Handle type="target" position={Position.Left} className="bg-[#7dacb5]! w-3! h-3! border-none!" />
            <Handle type="source" position={Position.Right} className="bg-[#7dacb5]! w-3! h-3! border-none!" />
        </div>
    );
};

export default memo(Nodle);