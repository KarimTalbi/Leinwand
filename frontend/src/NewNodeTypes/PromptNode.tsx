import React, {memo, useState} from 'react';
import {NodeProps} from "@xyflow/react";


import useStore from '../store.ts';
import {AppState, PromptNodeType} from "../types.ts";
import {
  DisplayUserMessage,
  NodeDisplayText,
  NodeDisplayThinking,
  NodeTextarea
} from "@/components/NodeElements/TextElements.tsx";
import {DeleteButton, NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import CircleIconButton from "@/components/menus/CircleButton.tsx";
import {Play, Settings2, Undo2} from "lucide-react";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  deleteNode: state.deleteNode,
  promptNodeAction: state.promptNodeAction,
});


const PromptNode = (
  {
    id,
    data,
  }: NodeProps<PromptNodeType>
) => {

  const {updateNodeData, promptNodeAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;

  const handleClick = () => {
    setLoading(true);

    isClosed
      ? updateNodeData(id, {closed: false})
      : promptNodeAction(id, data.prompt || '', 'chat');

    setLoading(false);
  }

  return (
    <NodeBackground style={{'--node-color': '#ec4899'} as React.CSSProperties}>
      <NodeHeader title="Prompt Node">

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
          title={isClosed ? 'Reset' : 'Send to LLM'}
          tooltipPosition="top"
          bigTooltip={true}
          disabled={loading || !data.prompt}
          className="bg-white text-black  border-[#e5e5e5] border"
        >
          {isClosed ? <Undo2/> : <Play/>}
        </CircleIconButton>

        <DeleteButton id={id} loading={loading}/>

      </NodeHeader>

      <NodeForeground>
        {
          isClosed
            ? !!data.response

              ? <div className="flex flex-col h-full justify-between">
                <NodeDisplayText>{data.response}</NodeDisplayText>
                <DisplayUserMessage>
                  {data.prompt}
                </DisplayUserMessage>
              </div>
              : <NodeDisplayThinking/>

            : <NodeTextarea id={id} initialValue={data.prompt} placeholder={'Enter your prompt...'}/>
        }

      </NodeForeground>

      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="left"
        nodeId={id}
        style={{'--node-color': '#ec4899'} as React.CSSProperties}
      />

      <ConnectionHandles
        handleId="source-1"
        handleType="source"
        position="right"
        nodeId={id}
        style={{'--node-color': '#ec4899'} as React.CSSProperties}
      />

    </NodeBackground>

  )
};

export default memo(PromptNode);