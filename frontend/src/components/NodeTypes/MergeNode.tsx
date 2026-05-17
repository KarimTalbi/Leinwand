import {memo, useState} from 'react';
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
import {MergeIcon, Play, Settings2} from "lucide-react";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import MergeContent from "@/components/NodeElements/MergeSections.tsx";
import {ToolTip} from "@/components/Buttons/ToolTip.tsx";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";


const selector = (state: AppState) => ({
  mergeNodeAction: state.mergeNodeAction,
  mergeNodeResolveAction: state.mergeNodeResolveAction,
});


const MergeNode = (
  {
    id,
    data,
    positionAbsoluteX,
    positionAbsoluteY,
  }: NodeProps<MergeNodeType>
) => {

  const {mergeNodeAction, mergeNodeResolveAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const hasProblem = data.has_issues;

  const connections1 = useNodeConnections({handleId: "target-1", handleType: "target"});
  const connections2 = useNodeConnections({handleId: "target-2", handleType: "target"});
  const isConnected1 = connections1.length > 0;
  const isConnected2 = connections2.length > 0;

  const handleClick = () => {
    setLoading(true);
    if (hasProblem) {
      void mergeNodeResolveAction(id)
    } else {
      void mergeNodeAction(id)
    }
    setLoading(false);
  }

  return (
    <NodeBackground className="bg-[#f5c45e] border-[#f5c45e] w-130 min-h-100">
      <NodeHeader title="Merge Node" icon={<MergeIcon className="rotate-90" size={14} color="white"/>}>

        <ToolTip position="top" label="Settings">
          <CustomButton
            onClick={() => null}
            buttonStyle="circle"
            disabled={loading}
            size="xs"
            color="ghost"
            className="text-white hover:border-none hover:bg-transparent hover:shadow-none"
          >
            <Settings2 size={16}/>
          </CustomButton>
        </ToolTip>

        <ToolTip position="top" label="Merge Streams">
          <CustomButton
            onClick={handleClick}
            buttonStyle="circle"
            disabled={loading || !isConnected1 || !isConnected2 || !!data.problems && !data.solution || isClosed && !hasProblem}
            size="xs"
            color="ghost"
            className="text-white hover:border-none hover:bg-transparent hover:shadow-none"
          >
            <Play size={16}/>
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
            <NodeTextarea id={id} initialValue={data.solution} placeholder={'Enter your answer...'} dataKey="solution"/>
          </div>)

          : isClosed && !!data.context

            ? <MergeContent sections={data.context}/>
            : isClosed && !data.context

              ? <NodeDisplayThinking/>
              : (<div className="flex flex-col h-full justify-center items-center">
                <p className="text-sm font-bold mb-15">Connect Node and press Play to get a summary</p>
              </div>)
        }

      </NodeForeground>

      <ConnectionHandles
        handleId="target-1"
        offset={-100}
        handleType="target"
        position="top"
        nodeId={id}
      />

      <ConnectionHandles
        handleId="target-2"
        offset={100}
        handleType="target"
        position="top"
        nodeId={id}
      />

      <ConnectionHandles
        handleId="source-1"
        handleType="source"
        position="bottom"
        nodeId={id}
      >

        <AddConnectedNode sourceId={id} posX={positionAbsoluteX} posY={positionAbsoluteY}/>

      </ConnectionHandles>

    </NodeBackground>

  )
};

export default memo(MergeNode);