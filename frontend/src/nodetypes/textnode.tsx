import React, {memo, useState} from 'react';
import {Handle, Position} from '@xyflow/react';
import {Textarea, Field, Fieldset, Legend, Button} from "@headlessui/react";
import clsx from "clsx";

import useStore from '../store.ts';
import {TextNodeData} from "../types.ts";

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
        <div className="w-250  bg-white border border-black/10 rounded-xl p-4 shadow-xl">
            <Fieldset className="space-y-2">
                <Legend className="text-lg font-bold text-[#7dacb5] pb-1">{data.label}</Legend>

                <Field>
                    {
                        hasText
                            ? (
                                <div
                                    className="text-sm/6 text-black bg-black/5 border border-black/5 p-3 rounded-lg mt-2 min-h-12.5">
                                    {data.text}
                                </div>
                            ) : (

                                <Textarea
                                    value={data.text}
                                    onChange={handleTextChange}
                                    placeholder='Enter your text...'
                                    className={clsx(
                                        'nodrag mt-1 block w-full resize-none rounded-lg border-none bg-black/5 px-3 py-1.5 text-sm/6 text-black',
                                        'focus:bg-white/80 transition-all focus:ring-1 focus:ring-[#7dacb5]'
                                    )}
                                    rows={2}
                                />
                            )
                    }
                </Field>

                <div className="flex justify-end">
                    <Button
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7dacb5] mt-2 px-5 py-1.5 text-sm/6 font-semibold text-white shadow hover:bg-[#6a99a1] disabled:opacity-50 transition-colors"
                        onClick={handleSave}
                        disabled={loading || hasText}
                    >
                        {loading ? 'saving...' : 'saved'}
                    </Button>
                </div>
            </Fieldset>

            {/* Handles */}
            <Handle type="source" position={Position.Bottom} className="bg-[#7dacb5]! w-3! h-3! border-none!"/>
        </div>
    );
};

export default memo(TextNode);