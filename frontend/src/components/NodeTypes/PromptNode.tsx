import {memo, useState} from 'react';
import {NodeProps} from "@xyflow/react";

import useStore from '@/store.ts';
import {AppState, PromptNodeType} from "@/types.ts";
import {
  ChatBubble,
  NodeDisplayMarkdown,
  NodeDisplayPulsingText,
  NodeTextarea
} from "@/components/NodeElements/TextElements.tsx";
import {NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";


const DisplayResponseScreen = (prompt: string, response: string) => (
  <div className="flex flex-col flex-1 justify-between gap-5 pb-2">
    <ChatBubble position="right">{prompt}</ChatBubble>
    <NodeDisplayMarkdown content={response} className="px-2"/>
  </div>
)


const DisplayThinkingScreen = (prompt: string) => (
  <div className="flex flex-col flex-1 justify-between gap-5">
    <ChatBubble position="right">{prompt}</ChatBubble>
    <ChatBubble position="left"><NodeDisplayPulsingText children="Thinking..."/></ChatBubble>
  </div>
)


const DisplayInputScreen = (
  id: string,
  prompt: string,
  onSettings: () => void,
  onSend: () => void,
  sendDisabled: boolean,
) => (
  <div>
    <div className="flex flex-col flex-1 justify-between gap-5">
      <ChatBubble position="left">How can i help you?</ChatBubble>
      <NodeTextarea id={id} initialValue={prompt} placeholder={'Enter your prompt...'}/>
    </div>
    <div className="flex items-center justify-end px-2 pt-2 shrink-0">
      <div className="flex items-center gap-1.5">
        <button
          className="btn btn-ghost btn-sm" onClick={onSettings}>
          Settings
        </button>
        <button
          className="btn btn-ghost btn-sm" onClick={onSend} disabled={sendDisabled}>
          Send
        </button>
      </div>
    </div>
  </div>
)


const selector = (state: AppState) => ({
  promptNodeAction: state.promptNodeAction,
  deleteNode: state.deleteNode,
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
    if (!isClosed) return (
      DisplayInputScreen(id, data.prompt || "", () => null, handleClick, loading || !data.prompt)
    )
    if (!!data.response) return DisplayResponseScreen(data.prompt || "", data.response)
    return DisplayThinkingScreen(data.prompt || "")
  }

  return (
    <NodeBackground className="bg-white/70 border-[lightgray] border-2 w-132 backdrop-blur-sm backdrop-saturate-150">

      <NodeHeader id={id} color="#ec4899" title="Chat" loading={loading}/>

      <NodeForeground>
        {foreground()}
      </NodeForeground>


      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="top"
        nodeId={id}
        color="#ec4899"
      />

      {!!data.response && (
        <ConnectionHandles
          handleId="source-1"
          handleType="source"
          position="bottom"
          nodeId={id}
          color="#ec4899"

        >

          <AddConnectedNode sourceId={id}/>

        </ConnectionHandles>
      )}


    </NodeBackground>
  )
};

export default memo(PromptNode);