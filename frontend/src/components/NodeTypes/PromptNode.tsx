import React, {memo, useState} from 'react';
import {NodeProps} from "@xyflow/react";


import useStore from '@/store.ts';
import {AppState, PromptNodeType} from "@/types.ts";
import {
  DisplayUserMessage,
  NodeDisplayText,
  NodeDisplayThinking,
  NodeTextarea
} from "@/components/NodeElements/TextElements.tsx";
import {DeleteButton, NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {Play, Settings2} from "lucide-react";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import {ToolTip} from "@/components/Buttons/ToolTip.tsx";


const selector = (state: AppState) => ({
  promptNodeAction: state.promptNodeAction,
});


const PromptNode = (
  {
    id,
    data,
  }: NodeProps<PromptNodeType>
) => {

  const {promptNodeAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;

  const handleClick = () => {
    setLoading(true);
    void promptNodeAction(id, data.prompt || '', 'chat');
    setLoading(false);
  }

  return (
    <NodeBackground style={{'--node-color': '#ec4899'} as React.CSSProperties}>
      <NodeHeader title="Prompt Node">

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

        <ToolTip position="top" label="Send to LLM">
          <CustomButton
            onClick={handleClick}
            buttonStyle="circle"
            disabled={loading || !data.prompt || isClosed}
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