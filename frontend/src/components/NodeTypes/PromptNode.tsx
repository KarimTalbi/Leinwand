import React, {memo, useState} from 'react';
import {NodeProps} from "@xyflow/react";

import useStore from '@/store.ts';
import {AppState, PromptNodeType} from "@/types.ts";
import {NodeDisplayMarkdown, NodeDisplayThinking, NodeTextarea} from "@/components/NodeElements/TextElements.tsx";
import {DeleteButton, NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {MessagesSquare, Play, Settings2} from "lucide-react";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import {ToolTip} from "@/components/Buttons/ToolTip.tsx";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";


const DisplayResponseScreen = (prompt: string, response: string) => (
  <div className="flex flex-col flex-1 justify-between gap-5">
    <div className="chat chat-end nodrag select-text cursor-text">
      <div className="chat-bubble text-sm">{prompt}</div>
    </div>
    <div className="chat chat-start nodrag select-text cursor-text">
      <div className="chat-bubble text-base w-full">
        <NodeDisplayMarkdown content={response}/>
      </div>
    </div>
  </div>
)


const DisplayThinkingScreen = (prompt: string) => (
  <div className="flex flex-col flex-1 justify-between gap-5">
    <div className="chat chat-end nodrag select-text cursor-text">
      <div className="chat-bubble text-sm">{prompt}</div>
    </div>
    <div className="chat chat-start nodrag select-text cursor-text">
      <div className="chat-bubble text-base">
        <NodeDisplayThinking/>
      </div>
    </div>
  </div>
)


const DisplayInputScreen = (id: string, prompt: string) => (
  <div className="flex flex-col flex-1 justify-between gap-5">
    <div className="chat chat-start nodrag select-text cursor-text">
      <div className="chat-bubble text-base">How can i help you?</div>
    </div>
    <NodeTextarea id={id} initialValue={prompt} placeholder={'Enter your prompt...'}/>
  </div>
)


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
    void promptNodeAction(id);
    setLoading(false);
  }

  const foreground = () => {
    if (!isClosed) return DisplayInputScreen(id, data.prompt || "")
    if (!!data.response) return DisplayResponseScreen(data.prompt || "", data.response)
    return DisplayThinkingScreen(data.prompt || "")
  }

  return (
    <NodeBackground className="bg-[#ec4899] border-[#ec4899] w-158 min-h-80">
      <NodeHeader title="Chat" icon={<MessagesSquare size={14} color="white"/>}>

        <ToolTip position="top" label="Settings">
          <CustomButton
            onClick={() => null}
            buttonStyle="circle"
            disabled={loading}
            size="xs"
            color="ghost"
            className="text-white hover:border-none hover:bg-transparent hover:shadow-none"
          >
            <Settings2 size={14}/>
          </CustomButton>
        </ToolTip>

        <ToolTip position="top" label="Send to LLM">
          <CustomButton
            onClick={handleClick}
            buttonStyle="circle"
            disabled={loading || !data.prompt || isClosed}
            size="xs"
            color="ghost"
            className="text-white hover:border-none hover:bg-transparent hover:shadow-none"
          >
            <Play size={14}/>
          </CustomButton>
        </ToolTip>

        <ToolTip position="top" label="Delete Node">
          <DeleteButton id={id} loading={loading}/>
        </ToolTip>

      </NodeHeader>

      <NodeForeground>
        {foreground()}
      </NodeForeground>

      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="top"
        nodeId={id}
        style={{'--node-color': '#ec4899'} as React.CSSProperties}
      />

      <ConnectionHandles
        handleId="source-1"
        handleType="source"
        position="bottom"
        nodeId={id}
        style={{'--node-color': '#ec4899'} as React.CSSProperties}

      >

        <AddConnectedNode sourceId={id}/>

      </ConnectionHandles>


    </NodeBackground>
  )
};

export default memo(PromptNode);