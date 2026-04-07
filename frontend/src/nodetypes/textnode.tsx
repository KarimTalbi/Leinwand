import React, {memo, useState} from 'react';
import {Handle, Position} from '@xyflow/react';
import {Textarea, Field, Fieldset, Button} from "@headlessui/react";
import clsx from "clsx";

import useStore from '../store.ts';
import {TextNodeData} from "../types.ts";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import {PencilIcon, PlayIcon, XMarkIcon} from "@heroicons/react/16/solid";

const TextNode = ({id, data}: { id: string, data: TextNodeData }) => {
    const [loading, setLoading] = useState(false);
    const [hasText, setHasText] = useState(!!data.text);

    const updateNodeData = useStore((s) => s.updateNodeData);
    const saveCanvas = useStore((s) => s.saveCanvas);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateNodeData(id, {text: e.target.value});
    };

    const handleSave = async () => {
        setLoading(true);

        try {
            updateNodeData(id, {label: data.label, text: data.text});
            await saveCanvas();

            setHasText(true);

        } catch (err) {
            console.error('Error saving Text:', err);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-130 h-130 flex flex-col bg-[#309898] rounded-3xl p-0 shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-3 shrink-0">
                <div className="text-base font-bold text-white ">Text Node</div>

                <div className="flex items-center gap-6 mr-2">

                    <Button
                        className="transition-opacity duration-200 hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed">
                        <PencilIcon className="size-6 text-white"/>
                    </Button>

                    <Button
                        className="transition-opacity duration-200 hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed">
                        <XMarkIcon className="size-8 text-white"/>
                    </Button>

                    <Button onClick={handleSave} disabled={loading || hasText}
                            className="transition-opacity duration-200 hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed">
                        <PlayIcon className="size-6 text-white"/>
                    </Button>
                </div>

            </div>

            <div className="flex flex-col flex-1 min-h-0 mt-2 bg-white rounded-3xl">
                <Fieldset className="flex flex-col flex-1 min-h-0 space-y-2 rounded-t-2xl p-6">

                    {!hasText && (
                        <Field className="flex flex-col flex-1 min-h-0">
                            <Textarea
                                value={data.text}
                                onChange={handleTextChange}
                                placeholder='Enter your text...'
                                className={clsx(
                                    'nodrag flex-1 min-h-16 w-full resize-none rounded-xl border-none p-3 text-base text-black',
                                    'transition-all focus:ring ring-gray-300 outline-none ring-offset-4'
                                )}
                            />
                        </Field>
                    )}

                    {hasText && (
                        <>
                            <Field
                                className="flex-1 text-black p-3 rounded-xl min-h-0 overflow-y-auto nowheel">
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
                                        hr: () => <hr className="my-4 border-t border-gray-300"/>,
                                    }}
                                >
                                    {data.text}
                                </ReactMarkdown>
                            </Field>
                        </>
                    )}
                </Fieldset>

                {/* Handles */}
                <Handle id="target-1" type="target" position={Position.Left}
                        className="w-2! h-4! rounded-l-full! rounded-r-none! border-none! bg-[#309898]! -translate-x-1! z-[-1]!"/>
                <Handle id="source-1" type="source" position={Position.Right}
                        className="w-2! h-4! rounded-l-none! rounded-r-full! border-none! bg-[#309898]! translate-x-1! z-[-1]!"/>
            </div>
        </div>
    );
};

export default memo(TextNode);