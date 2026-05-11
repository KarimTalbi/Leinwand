import React, {memo} from 'react';
import {NodeProps} from "@xyflow/react";

import useStore from '../store.ts';
import {AppState, TextNodeType} from "../types.ts";
import {NodeDisplayText, NodeTextarea} from "@/components/NodeElements/TextElements.tsx";
import {DeleteButton, NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import CircleIconButton from "@/components/menus/CircleButton.tsx";
import {Lock, LockOpen} from "lucide-react";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  deleteNode: state.deleteNode
});


const TextNode = (
  {
    id,
    data,
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

        <CircleIconButton
          onClick={handleClick}
          title={isClosed ? 'Unlock' : 'Lock'}
          tooltipPosition="top"
          bigTooltip={true}
          disabled={!data.text}
          className="bg-white text-black  border-[#e5e5e5] border"
        >
          {isClosed ? <LockOpen/> : <Lock/>}
        </CircleIconButton>

        <DeleteButton id={id}/>

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
      />

    </NodeBackground>

  )
};

export default memo(TextNode);