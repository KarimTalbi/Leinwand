import {memo} from 'react';
import {Handle, Position} from '@xyflow/react';
import {Fieldset, Legend} from "@headlessui/react";

const MergeNode = () => {

    return (
        <div className="w-80 h-25 flex items-center justify-center bg-white border border-black/10 rounded-xl p-4 shadow-xl">
            <Fieldset className="space-y-2">
                <Legend className="text-lg font-bold text-[#7dacb5] p-20">MERGE</Legend>
            </Fieldset>

            <Handle id="source-1" type="source" position={Position.Bottom} className="bg-[#7dacb5]! w-3! h-3! border-none!"/>
            <Handle id="target-1" type="target" position={Position.Top} style={{left: '25%'}} className="bg-[#7dacb5]! w-3! h-3! border-none!"/>
            <Handle id="target-2" type="target" position={Position.Top} style={{left: '75%'}} className="bg-[#7dacb5]! w-3! h-3! border-none!"/>

        </div>
    );
};

export default memo(MergeNode);