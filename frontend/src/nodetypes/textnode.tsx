import React, {memo} from 'react';
import {useShallow} from "zustand/react/shallow";
import {Lock, LockOpen} from "lucide-react";

import useStore from '@/store.ts';
import {AppState, TextNodeType} from "@/types.ts";

import BaseNode from "@/components/nodes/basenode.tsx"
import {NodeHeaderButton, NodeTextarea, DefaultHandles, NodeDisplayText} from "@/components/nodes/nodeelements.tsx";
import {NodeProps} from "@xyflow/react";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  deleteNode: state.deleteNode,
  updateNodeClosed: state.updateNodeClosed,
});

const TextNode = ({id, positionAbsoluteX, positionAbsoluteY, data}: NodeProps<TextNodeType>) => {
  const isClosed = data.closed;
  const {updateNodeData, deleteNode, updateNodeClosed} = useStore(useShallow(selector));

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, {text: e.target.value});
  };

  const lockIcon = () => {
    return isClosed
      ? <LockOpen className="size-5 text-white"/>
      : <Lock className="size-5 text-white"/>
  }

  const handleClick = () => {
    isClosed ? updateNodeClosed(id, false) : handleSave();
  }

  const content = () => {
    return isClosed
      ? <NodeDisplayText children={data.text}/>
      : <NodeTextarea value={data.text} handleTextChange={handleTextChange} placeholder='Enter your text...'/>
  }

  const handleSave = () => {
    updateNodeData(id, {text: data.text, closed: true});
  };


  return (
    <BaseNode
      id={id}
      title="Text Node"
      onDelete={() => void deleteNode(id)}
      style={{'--node-color': '#309898'} as React.CSSProperties}
      headerActions={

        <NodeHeaderButton onClick={handleClick} icon={lockIcon}/>

      }>

      {content()}

      <DefaultHandles sourceId={id} posX={positionAbsoluteX} posY={positionAbsoluteY} style={{'--node-color': '#309898'} as React.CSSProperties}/>

    </BaseNode>
  );
};

export default memo(TextNode);