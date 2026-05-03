import React, {memo, useState} from 'react';
import {NodeProps} from "@xyflow/react";
import {Undo2, Play, Settings2} from "lucide-react";
import {useShallow} from "zustand/react/shallow";
import { useDebouncedCallback } from 'use-debounce';


import useStore from '../store.ts';
import {AppState, PromptNodeType} from "../types.ts";

import {NodeTextarea, NodeHeaderButton, DefaultHandles, NodeDisplayText} from "@/components/nodes/nodeelements.tsx";
import BaseNode from "@/components/nodes/basenode.tsx";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  deleteNode: state.deleteNode,
  updateNodeClosed: state.updateNodeClosed,
  promptNodeAction: state.promptNodeAction,
});

const PromptNode = ({id, data, positionAbsoluteX, positionAbsoluteY}: NodeProps<PromptNodeType>) => {
  const {updateNodeData, updateNodeClosed, promptNodeAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const [localPrompt, setLocalPrompt] = useState(data.prompt);

  const debouncedUpdate = useDebouncedCallback((value: string) => {
    updateNodeData(id, { prompt: value });
  }, 500);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPrompt(e.target.value);
    debouncedUpdate(e.target.value);
  };

  const content = () => {
    if (isClosed && data.response) {
      return <NodeDisplayText children={data.response}/>;
    }
    else if (isClosed && !data.response) {
      return <NodeDisplayText></NodeDisplayText>
    }
    return <NodeTextarea value={localPrompt} handleTextChange={handleTextChange} placeholder='Enter your prompt...'/>
  }

  const playIcon = () => {
    return isClosed
      ? <Undo2 className="size-8 text-white"/>
      : <Play className="size-8 text-white"/>
  }

  const titleText = () => {
    return isClosed
      ? 'Reset'
      : 'Send to LLM'
  }

  const settingsIcon = () => {
    return <Settings2 className="size-8 text-white"/>
  }

  const handleClick = () => {
    setLoading(true);

    isClosed
      ? updateNodeClosed(id, false)
      : promptNodeAction(id, data.prompt || '', 'chat');

    setLoading(false);
  }

  return (
    <BaseNode
      id={id}
      title="Prompt Node"
      loading={loading}
      style={{'--node-color': '#ec4899'} as React.CSSProperties}
      headerActions={
        <div className="flex items-center gap-6">
          <NodeHeaderButton onClick={() => null} icon={settingsIcon} disabled={loading} title="Settings"/>
          <NodeHeaderButton onClick={handleClick} icon={playIcon} disabled={loading || !localPrompt} title={titleText()}/>
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