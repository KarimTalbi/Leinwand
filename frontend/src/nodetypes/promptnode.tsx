import React, {memo, useState} from 'react';
import {NodeProps} from "@xyflow/react";
import {Undo2, Play} from "lucide-react";
import {useShallow} from "zustand/react/shallow";

import useStore from '../store.ts';
import {AppState, PromptNodeType} from "../types.ts";

import {NodeTextarea, NodeHeaderButton, DefaultHandles, NodeDisplayText} from "@/components/nodes/nodeelements.tsx";
import BaseNode from "@/components/nodes/basenode.tsx";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  deleteNode: state.deleteNode,
  setSyncing: state.setSyncing,
  updateNodeClosed: state.updateNodeClosed,
  promptNodeAction: state.promptNodeAction,
});

const PromptNode = ({id, data, positionAbsoluteX, positionAbsoluteY}: NodeProps<PromptNodeType>) => {
  const {updateNodeData, deleteNode, updateNodeClosed, promptNodeAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, {prompt: e.target.value});
  };

  const content = () => {
    if (isClosed && data.response) {
      return <NodeDisplayText children={data.response}/>;
    }
    else if (isClosed && !data.response) {
      return <NodeDisplayText></NodeDisplayText>
    }
    return <NodeTextarea value={data.prompt} handleTextChange={handleTextChange} placeholder='Enter your prompt...'/>
  }

  const playIcon = () => {
    return isClosed
      ? <Undo2 className="size-6 text-white"/>
      : <Play className="size-6 text-white"/>
  }

  const handleClick = () => {
    setLoading(true);

    isClosed
      ? updateNodeClosed(id, false)
      : promptNodeAction(id);

    setLoading(false);
  }

  return (
    <BaseNode
      id={id}
      title="Prompt Node"
      loading={loading}
      onDelete={() => void deleteNode(id)}
      style={{'--node-color': '#ec4899'} as React.CSSProperties}
      headerActions={
        <div className="flex items-center gap-3">

          <NodeHeaderButton onClick={handleClick} icon={playIcon} disabled={loading}/>
        </div>
      }>

      {content()}

      {isClosed && (
        <div className="p-5 bg-gray-100 rounded-xl">
          <p className="text-base font-bold mb-3">User Message:</p>
          <p className="text-base mb-3">{data.prompt}</p>
        </div>
      )}

      <DefaultHandles sourceId={id} posX={positionAbsoluteX} posY={positionAbsoluteY}
                      style={{'--node-color': '#ec4899'} as React.CSSProperties}/>


    </BaseNode>

  );
};

export default memo(PromptNode);