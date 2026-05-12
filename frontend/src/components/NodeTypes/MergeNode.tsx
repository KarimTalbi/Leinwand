import React, {memo, useState} from 'react';
import {NodeProps, useNodeConnections} from "@xyflow/react";


import useStore from '@/store.ts';
import {AppState, MergeNodeType} from "@/types.ts";
import {
  NodeDisplayText,
  NodeDisplayThinking,
  NodeTextarea
} from "@/components/NodeElements/TextElements.tsx";
import {DeleteButton, NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {Play, Settings2} from "lucide-react";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import MergeContent from "@/components/NodeElements/MergeSections.tsx";
import {ToolTip} from "@/components/Buttons/ToolTip.tsx";


const selector = (state: AppState) => ({
  mergeNodeAction: state.mergeNodeAction,
});


const MergeNode = (
  {
    id,
    data,
  }: NodeProps<MergeNodeType>
) => {

  const {mergeNodeAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const hasProblem = data.problems;

  const connections1 = useNodeConnections({handleId: "target-1", handleType: "target"});
  const connections2 = useNodeConnections({handleId: "target-2", handleType: "target"});
  const isConnected1 = connections1.length > 0;
  const isConnected2 = connections2.length > 0;

  const handleClick = () => {
    setLoading(true);
    void mergeNodeAction(id);
    setLoading(false);
  }

  return (
    <NodeBackground style={{'--node-color': '#f5c45e'} as React.CSSProperties}>
      <NodeHeader title="Merge Node">

        <ToolTip position="top" label="Settings">
          <CustomButton
            onClick={() => null}
            buttonStyle="circle"
            disabled={loading}
            className="bg-white text-black  border-[#e5e5e5] border"
          >
            <Settings2/>
          </CustomButton>
        </ToolTip>

        <ToolTip position="top" label="Merge Streams">
          <CustomButton
            onClick={handleClick}
            buttonStyle="circle"
            disabled={loading || !isConnected1 || !isConnected2 || !!data.problems && !data.solution || isClosed}
            className="bg-white text-black  border-[#e5e5e5] border"
          >
            <Play/>
          </CustomButton>
        </ToolTip>

        <ToolTip position="top" label="Delete Node">
          <DeleteButton id={id} loading={loading}/>
        </ToolTip>

      </NodeHeader>

      <NodeForeground>
        {hasProblem

          ? (<div className="flex flex-col items-center justify-center h-full w-full">
            <NodeDisplayText>{data.problems}</NodeDisplayText>
            <NodeTextarea id={id} initialValue={data.solution} placeholder={'Enter your answer...'}/>
          </div>)

          : isClosed && !!data.context

            ? <MergeContent sections={data.context}/>
            : isClosed && !data.context

              ? <NodeDisplayThinking/>
              : (<div className="flex flex-col h-full justify-center items-center">
                <p className="text-2xl font-bold mb-15">Connect Node and press Play to get a summary</p>
              </div>)
        }

      </NodeForeground>

      <ConnectionHandles
        handleId="target-1"
        offset={20}
        handleType="target"
        position="left"
        nodeId={id}
        style={{'--node-color': '#f5c45e'} as React.CSSProperties}
      />

      <ConnectionHandles
        handleId="target-2"
        offset={-20}
        handleType="target"
        position="left"
        nodeId={id}
        style={{'--node-color': '#f5c45e'} as React.CSSProperties}
      />

      <ConnectionHandles
        handleId="source-1"
        handleType="source"
        position="right"
        nodeId={id}
        style={{'--node-color': '#f5c45e'} as React.CSSProperties}
      />

    </NodeBackground>

  )
};

export default memo(MergeNode);