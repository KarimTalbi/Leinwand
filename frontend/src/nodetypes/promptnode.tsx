import React, {memo, useState} from 'react';
import {NodeProps} from "@xyflow/react";
import {Undo2, Play, Settings2, X} from "lucide-react";
import {useShallow} from "zustand/react/shallow";
import {useDebouncedCallback} from 'use-debounce';


import useStore from '../store.ts';
import {AppState, PromptNodeType} from "../types.ts";

import {NodeTextarea, NodeHeaderButton, DefaultHandles, NodeDisplayText} from "@/components/nodes/nodeelements.tsx";
import BaseNode from "@/nodetypes/BaseNode.tsx";
import CircleIconButton from "@/components/menus/CircleButton.tsx";



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
  const [settingsOpen, setSettingsOpen] = useState(false);

  const debouncedUpdate = useDebouncedCallback((value: string) => {
    updateNodeData(id, {prompt: value});
  }, 500);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPrompt(e.target.value);
    debouncedUpdate(e.target.value);
  };

  const content = () => {

    if (isClosed && data.response) {
      return <NodeDisplayText children={data.response}/>;
    } else if (isClosed && !data.response) {
      return <NodeDisplayText></NodeDisplayText>
    }
    return <NodeTextarea value={localPrompt} handleTextChange={handleTextChange} placeholder='Enter your prompt...'/>
  }

  const playIcon = () => {
    return isClosed
      ? <Undo2 />
      : <Play />
  }

  const titleText = () => {
    return isClosed
      ? 'Reset'
      : 'Send to LLM'
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
        <div className="flex items-center gap-3">
          <CircleIconButton
            onClick={() => null}
            title="Config"
            tooltipPosition="top"
            bigTooltip={true}
            disabled={loading}
            className="bg-white text-black  border-[#e5e5e5] border"
          >
            <Settings2/>
          </CircleIconButton>

          <CircleIconButton
            onClick={handleClick}
            title={titleText()}
            tooltipPosition="top"
            bigTooltip={true}
            disabled={loading || !data.prompt}
            className="bg-white text-black  border-[#e5e5e5] border"
          >

            {playIcon()}

          </CircleIconButton>

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