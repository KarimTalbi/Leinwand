import React, {memo} from 'react';
import {NodeProps} from "@xyflow/react";

import useStore from '@/store.ts';
import {AppState, TextNodeType} from "@/types.ts";
import {NodeDisplayText, NodeTextarea} from "@/components/NodeElements/TextElements.tsx";
import {DeleteButton, NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {Lock, LockOpen} from "lucide-react";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import {ToolTip} from "@/components/Buttons/ToolTip.tsx";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  deleteNode: state.deleteNode
});


const TextNode = (
  {
    id,
    data,
    positionAbsoluteX,
    positionAbsoluteY,
  }: NodeProps<TextNodeType>
) => {

  const {updateNodeData} = useStore(useShallow(selector));
  const isClosed = data.closed;

  const handleClick = () => {
    updateNodeData(id, {closed: !isClosed})
  }

  return (
    <NodeBackground style={{'--node-color': '#309898'} as React.CSSProperties}>
      <NodeHeader title="Text Node">

        <ToolTip position="top" label="Lock Node">
          <CustomButton
            onClick={handleClick}
            buttonStyle="circle"
            disabled={!data.text}
            size="xs"
            className="bg-white text-black  border-[#e5e5e5] border"
          >
            {isClosed ? <LockOpen size={16}/> : <Lock size={16}/>}
          </CustomButton>
        </ToolTip>

        <ToolTip position="top" label="Delete Node">
          <DeleteButton id={id}/>
        </ToolTip>

      </NodeHeader>

      <NodeForeground>

        {
          isClosed
            ? <NodeDisplayText>{data.text}</NodeDisplayText>
            : <NodeTextarea id={id} initialValue={data.text} placeholder={'Enter text...'} dataKey="text"/>
        }

      </NodeForeground>

      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="left"
        nodeId={id}
        style={{'--node-color': '#309898'} as React.CSSProperties}
      />

      <ConnectionHandles
        handleId="source-1"
        handleType="source"
        position="right"
        nodeId={id}
        style={{'--node-color': '#309898'} as React.CSSProperties}
      >

        <AddConnectedNode sourceId={id} posX={positionAbsoluteX} posY={positionAbsoluteY}/>

      </ConnectionHandles>

    </NodeBackground>

  )
};

export default memo(TextNode);