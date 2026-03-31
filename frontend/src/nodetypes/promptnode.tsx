import React, {memo, useEffect, useState} from 'react';
import {Handle, Position} from '@xyflow/react';
import {Textarea, Field, Fieldset, Legend, Button, Label} from "@headlessui/react";
import clsx from "clsx";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import useStore from '../store.ts';
import api from '../api.ts'
import {PromptNodeData} from "../types.ts";

const PromptNode = ({id, data}: { id: string, data: PromptNodeData }) => {
    const [loading, setLoading] = useState(false);
    const [hasResponse, setHasResponse] = useState(false);

    useEffect(() => {
        setHasResponse(!!data.response);
    }, [data]);

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

            updateNodeData(id, {prompt: data.prompt, response: res.data.response, label: res.data.title});
            await saveCanvas();

        } catch (err) {
            console.error('Error sending prompt to LLM:', err);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-250  bg-white border border-black/10 rounded-xl p-4 shadow-xl">
            <Fieldset className="space-y-2">
                <Legend className="text-lg font-bold text-[#7dacb5] pb-1">{data.label}</Legend>

                <Label className="text-sm/6 font-bold text-black/80">Prompt:</Label>
                <Field>
                    {
                        hasResponse
                            ? (
                                <div
                                    className="text-sm/6 text-black bg-black/5 border border-black/5 p-3 rounded-lg mt-2 min-h-12.5">
                                    {data.prompt}
                                </div>
                            ) : (

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
                            )
                    }
                </Field>

                <Label className="text-sm/6 font-bold text-black/80">Response:</Label>
                <div className="text-sm/6 text-black bg-black/5 border border-black/5 p-3 rounded-lg mt-2 min-h-25 max-h-80 overflow-y-auto nowheel">
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


                <div className="flex justify-end">
                    <Button
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7dacb5] mt-2 px-5 py-1.5 text-sm/6 font-semibold text-white shadow hover:bg-[#6a99a1] disabled:opacity-50 transition-colors"
                        onClick={handleSend}
                        disabled={loading || hasResponse}
                    >
                        {loading ? 'Thinking...' : 'Send'}
                    </Button>
                </div>
            </Fieldset>

            {/* Handles */}
            <Handle id="target-1" type="target" position={Position.Top} className="bg-[#7dacb5]! w-3! h-3! border-none!"/>
            <Handle id="source-1" type="source" position={Position.Bottom} className="bg-[#7dacb5]! w-3! h-3! border-none!"/>
        </div>
    );
};

export default memo(PromptNode);