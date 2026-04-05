import {memo, useEffect, useState} from 'react';
import {Handle, Position} from '@xyflow/react';
import {Button, Field, Fieldset, Legend, Textarea} from "@headlessui/react";

import {MergeNodeData} from "../types.ts";
import useStore from "../store.ts";
import api from "../api.ts";
import clsx from "clsx";

const MergeNode = ({id, data}: {id: string, data: MergeNodeData}) => {
    const [loading, setLoading] = useState(false);
    const [hasContext, setHasContext] = useState(false);
    const [hasConflicts, setHasConflicts] = useState(false);
    const [customResolution, setCustomResolution] = useState('');

    const updateNodeData = useStore((s) => s.updateNodeData);
    const saveCanvas = useStore((s) => s.saveCanvas);

    useEffect(() => {
        setHasContext(!!data.context);
        setHasConflicts(!!data.conflicts);
    }, [data]);

    // First request: analyze branches for conflicts
    const handleMerge = async () => {
        setLoading(true);
        try {
            const res = await api.post('/llm/merge', {
                target_id: id,
            });

            updateNodeData(id, {
                conflicts: res.data.conflicts,
                hasConflicts: res.data.hasConflicts,
                options: res.data.options,       // string[] from LLM e.g. ["Use Branch A: ...", "Use Branch B: ..."]
                context: res.data.context,        // set directly if no conflicts
                prompt: '',
            });

            await saveCanvas();
        } catch (err) {
            console.error('Error merging:', err);
        } finally {
            setLoading(false);
        }
    };

    // Second request: resolve with chosen or custom resolution
    const handleResolve = async (resolution: string) => {
        if (!resolution.trim()) return;
        setLoading(true);
        try {
            const res = await api.post('/llm/merge/resolve', {
                target_id: id,
            });

            updateNodeData(id, {
                context: res.data.context,
                conflicts: [],
                hasConflicts: false,
                options: [],
                prompt: '',
            });

            setCustomResolution('');
            await saveCanvas();
        } catch (err) {
            console.error('Error resolving conflict:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-100 flex items-center justify-center bg-white border border-black/10 rounded-xl p-4 shadow-xl">
            <Fieldset className="space-y-2 w-full">

                {/* Header */}
                <Field className="flex items-center justify-between">
                    <Legend className="text-lg font-bold text-[#7dacb5]">MERGE</Legend>
                    {hasContext && (
                        <span className="text-xs text-green-500 font-medium">✓ Merged</span>
                    )}
                </Field>

                {/* Initial state: Merge button */}
                {!hasContext && !hasConflicts && (
                    <Button
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7dacb5] px-5 py-1.5 text-sm/6 font-semibold text-white shadow hover:bg-[#6a99a1] disabled:opacity-50 transition-colors"
                        onClick={handleMerge}
                        disabled={loading}
                    >
                        {loading ? 'Analyzing...' : 'Merge'}
                    </Button>
                )}

                {/* Conflict state */}
                {hasConflicts && (
                    <div className="space-y-2">

                        {/* Conflict description from LLM */}
                        <div className="text-sm text-black bg-amber-50 border border-amber-200 p-3 rounded-lg">
                            {data.conflicts}
                        </div>

                        {/* Quick-select buttons from LLM-provided options */}
                        {data.options && data.options.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                {data.options.map((option: string, i: number) => (
                                    <Button
                                        key={i}
                                        className="w-full text-left px-3 py-2 text-sm rounded-md bg-[#7dacb5]/10 border border-[#7dacb5]/30 hover:bg-[#7dacb5]/20 hover:border-[#7dacb5] transition-colors disabled:opacity-50"
                                        onClick={() => handleResolve(option)}
                                        disabled={loading}
                                    >
                                        {option}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Divider */}
                        <div className="flex items-center gap-2 text-xs text-black/30">
                            <div className="flex-1 h-px bg-black/10"/>
                            or describe your own resolution
                            <div className="flex-1 h-px bg-black/10"/>
                        </div>

                        {/* Custom resolution textarea */}
                        <Textarea
                            value={customResolution}
                            onChange={(e) => setCustomResolution(e.target.value)}
                            placeholder="Explain how to resolve the conflict..."
                            className={clsx(
                                'nodrag block w-full resize-none rounded-lg border-none bg-black/5 px-3 py-1.5 text-sm/6 text-black',
                                'focus:bg-white/80 transition-all focus:ring-1 focus:ring-[#7dacb5]'
                            )}
                            rows={2}
                        />

                        <Button
                            className="w-full inline-flex items-center justify-center rounded-md bg-[#7dacb5] px-5 py-1.5 text-sm/6 font-semibold text-white shadow hover:bg-[#6a99a1] disabled:opacity-50 transition-colors"
                            onClick={() => handleResolve(customResolution)}
                            disabled={loading || !customResolution.trim()}
                        >
                            {loading ? 'Resolving...' : 'Resolve'}
                        </Button>
                    </div>
                )}

            </Fieldset>

            <Handle id="source-1" type="source" position={Position.Bottom} className="bg-[#7dacb5]! w-3! h-3! border-none!"/>
            <Handle id="target-1" type="target" position={Position.Top} style={{left: '25%'}} className="bg-[#7dacb5]! w-3! h-3! border-none!"/>
            <Handle id="target-2" type="target" position={Position.Top} style={{left: '75%'}} className="bg-[#7dacb5]! w-3! h-3! border-none!"/>
        </div>
    );
};

export default memo(MergeNode);