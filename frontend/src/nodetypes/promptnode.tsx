import React, {memo, useEffect, useState} from 'react';
import {Handle, Position} from '@xyflow/react';
import {useShallow} from 'zustand/react/shallow'
import {Textarea, Field, Button} from "@headlessui/react";
import clsx from "clsx";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {AdjustmentsHorizontalIcon, XMarkIcon, PlayIcon} from '@heroicons/react/16/solid'

import useStore from '../store.ts';
import api from '../api.ts'
import {AppState, PromptNodeData} from "../types.ts";

const selector = (state: AppState) => ({
    setSyncing: state.setSyncing
});

const PromptNode = ({id, data}: { id: string, data: PromptNodeData }) => {
    const [loading, setLoading] = useState(false);
    const [hasResponse, setHasResponse] = useState(false);
    const {setSyncing} = useStore(useShallow(selector));

    useEffect(() => {
        setHasResponse(!!data.response);
    }, [data]);

    const updateNodeData = useStore((s) => s.updateNodeData);
    const saveCanvas = useStore((s) => s.saveCanvas);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateNodeData(id, {prompt: e.target.value});
    };

    const handleSend = async () => {
        setSyncing(true);
        setLoading(true);

        try {
            const res = await api.post('/llm/generate', {
                prompt: data.prompt,
                target_id: id,
            });

            console.log(res.data.response.slice(0, 200))

            updateNodeData(id, {prompt: data.prompt, response: res.data.response, label: res.data.title});
            await saveCanvas();

        } catch (err) {
            console.error('Error sending prompt to LLM:', err);

        } finally {
            setSyncing(false);
            setLoading(false);
        }
    };

    return (
        <div className="w-130 h-170 flex flex-col bg-[#ec4899] rounded-3xl p-0 shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-3 shrink-0">

                <div className="text-base font-bold text-white ">Prompt Node</div>
                <div className="flex items-center gap-6 mr-2">

                    <Button
                        className="transition-opacity duration-200 hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed">
                        <AdjustmentsHorizontalIcon className="size-6 text-white"/>
                    </Button>

                    <Button
                        className="transition-opacity duration-200 hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed">
                        <XMarkIcon className="size-8 text-white"/>
                    </Button>

                    <Button onClick={handleSend} disabled={loading || hasResponse}
                            className="transition-opacity duration-200 hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed">
                        <PlayIcon className="size-6 text-white"/>
                    </Button>

                </div>

            </div>

            <div className="flex flex-col flex-1 min-h-0 mt-2 p-6 bg-white rounded-3xl">

                    {!hasResponse && (
                        <Field className="flex flex-col flex-1 min-h-0">
                            <Textarea
                                value={data.prompt}
                                onChange={handleTextChange}
                                placeholder='Enter your prompt...'
                                className={clsx(
                                    'nodrag flex-1 min-h-16 w-full resize-none rounded-xl border-none p-3 text-base text-black',
                                    'transition-all focus:ring ring-gray-300 outline-none ring-offset-4'
                                )}
                            />
                        </Field>
                    )}

                    {hasResponse && (
                        <>
                            <Field
                                className="flex-1 w-full text-black p-3 rounded-xl min-h-16 overflow-y-auto nowheel">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({children}) => <h1 className="text-lg font-bold mb-3">{children}</h1>,
                                        h2: ({children}) => <h2 className="text-base font-bold mb-3">{children}</h2>,
                                        h3: ({children}) => <h3 className="text-xs font-bold mb-3">{children}</h3>,
                                        p: ({children}) => <p className="text-xs mb-3 whitespace-pre-wrap">{children}</p>,
                                        ul: ({children}) => <ul className="list-disc list-outside pl-5 mb-3 space-y-1">{children}</ul>,
                                        ol: ({children}) => <ol className="list-decimal list-outside pl-5 mb-3 space-y-1">{children}</ol>,
                                        li: ({children}) => <li className="text-xs [&>p]:inline mb-3">{children}</li>,
                                        hr: () => <hr className="my-4 border-t border-gray-300" />,
                                    }}
                                >
                                    {data.response}
                                </ReactMarkdown>
                                <Field className="p-5 bg-gray-100 rounded-xl mt-10">
                                    <p className="text-xs font-bold mb-3">User Message:</p>
                                    <p className="text-xs mb-3">{data.prompt}</p>
                                </Field>

                            </Field>
                        </>
                    )}

                {/* Handles */}
                <Handle id="target-1" type="target" position={Position.Left}
                        className="w-2! h-4! rounded-l-full! rounded-r-none! border-none! bg-[#ec4899]! -translate-x-1! z-[-1]!"/>
                <Handle id="source-1" type="source" position={Position.Right}
                        className="w-2! h-4! rounded-l-none! rounded-r-full! border-none! bg-[#ec4899]! translate-x-1! z-[-1]!"/>
            </div>
        </div>
    );
};

export default memo(PromptNode);