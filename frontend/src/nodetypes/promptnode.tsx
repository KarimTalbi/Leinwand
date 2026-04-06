import React, {memo, useEffect, useState} from 'react';
import {Handle, Position} from '@xyflow/react';
import {Textarea, Field, Fieldset, Button} from "@headlessui/react";
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
            setLoading(false);
        }
    };

    // @ts-ignore
    return (
        <div className="w-130 h-170 flex flex-col bg-[#ec4899] rounded-3xl p-0 shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-3 shrink-0">
                <div className="text-base font-bold text-white ">Prompt Node</div>

                <div className="flex items-center gap-6">

                    <Button
                        className="transition-opacity duration-200 hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-6">
                            <path
                                d="M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"/>
                        </svg>
                    </Button>

                    <Button
                        className="transition-opacity duration-200 hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-6">
                            <path fillRule="evenodd"
                                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                                  clipRule="evenodd"/>
                        </svg>
                    </Button>

                    <Button onClick={handleSend} disabled={loading || hasResponse}
                            className="transition-opacity duration-200 hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-6">
                            <path fillRule="evenodd"
                                  d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                                  clipRule="evenodd"/>
                        </svg>
                    </Button>
                </div>

            </div>

            <div className="flex flex-col flex-1 min-h-0 mt-2 bg-white rounded-3xl">
                <Fieldset className="flex flex-col flex-1 min-h-0 space-y-2 rounded-t-2xl p-6">

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
                </Fieldset>

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