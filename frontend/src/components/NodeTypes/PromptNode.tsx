import {memo, useState} from 'react';
import {NodeProps, useNodeConnections, useNodes} from "@xyflow/react";

import useStore from '@/store.ts';
import {AppState, LLMConfig, PromptNodeType} from "@/types.ts";
import {
  ChatBubble,
  NodeDisplayMarkdown,
  NodeDisplayPulsingText,
  NodeTextarea
} from "@/components/NodeElements/TextElements.tsx";
import {NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";
import {DisplaySettingsScreen} from "@/components/NodeElements/llmSettings.tsx";
import {NodeBackgroundStyle, nodeColors, NodeForegroundStyle} from "@/lib/styles.ts";
import {MessagesSquare} from "lucide-react";



const defaultLLMConfig = {
  model: 'gpt-5-mini',
  temperature: 0,
  max_tokens: 0,
  timeout: 0,
  max_retries: 0,
}

interface DisplayResponseScreenProps {
  prompt: string;
  response: string;
  onReply: () => void;
}

const DisplayResponseScreen = ({prompt, response, onReply}: DisplayResponseScreenProps) => (
  <div>
    <div className="flex flex-col flex-1 justify-between gap-5 pb-2">
      <ChatBubble position="right">{prompt}</ChatBubble>
      <NodeDisplayMarkdown content={response} className="px-2"/>
    </div>
    <div className="flex items-center justify-end px-2 pt-2 shrink-0">
      <button
        className="btn btn-ghost btn-sm" onClick={onReply}>
        Reply
      </button>
    </div>
  </div>
)


const DisplayThinkingScreen = ({prompt}: { prompt: string }) => (
  <div className="flex flex-col flex-1 justify-between gap-5">
    <ChatBubble position="right">{prompt}</ChatBubble>
    <ChatBubble position="left"><NodeDisplayPulsingText children="Thinking..."/></ChatBubble>
  </div>
)

interface DisplayInputScreenProps {
  id: string;
  prompt: string;
  isSourcePrompt: boolean;
  onSettings: () => void;
  onSend: () => void;
  sendDisabled: boolean;
}

const DisplayInputScreen = ({id, prompt, isSourcePrompt, onSettings, onSend, sendDisabled,}: DisplayInputScreenProps
) => (
  <div>
    <div className="flex flex-col flex-1 justify-between gap-5">
      {!isSourcePrompt && (
        <ChatBubble position="left">How can i help you?</ChatBubble>
      )}
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
  createConnectedNode: state.createConnectedNode,
  updateNodeData: state.updateNodeData,
});


const PromptNode = (
  {
    id,
    data,
  }: NodeProps<PromptNodeType>
) => {
  if (!data.config) data.config = defaultLLMConfig as LLMConfig

  const {promptNodeAction, createConnectedNode, updateNodeData} = useStore(useShallow(selector));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const nodes = useNodes();

  const connections = useNodeConnections({handleId: "target-1", handleType: "target"});
  const isConnected = connections.length > 0;
  const isSourcePrompt = isConnected
    ? nodes.find(n => n.id === connections[0].source)?.type === 'promptNode'
    : false;

  const handleClick = () => {
    setLoading(true);
    void promptNodeAction(id);
    setLoading(false);
  }


  const foreground = () => {
    if (settingsOpen) {
      return (
            <DisplaySettingsScreen id={id} config={data.config || defaultLLMConfig}  updateNodeData={updateNodeData} closeSettings={() => setSettingsOpen(false)}/>
          )
    }
    if (!isClosed) return (
      <DisplayInputScreen id={id} prompt={data.prompt || ""} isSourcePrompt={isSourcePrompt} onSettings={() => setSettingsOpen(!settingsOpen)} onSend={handleClick} sendDisabled={loading || !data.prompt}/>
    )
    if (!!data.response) return (
      <DisplayResponseScreen prompt={data.prompt || ""} response={data.response} onReply={() => createConnectedNode("promptNode", id)}/>
    )

    return <DisplayThinkingScreen prompt={data.prompt || ""}/>
  }

  return (
    <div className={NodeBackgroundStyle}>

      <NodeHeader id={id} title="Chat" color={nodeColors.promptNode} loading={loading}>
        <MessagesSquare size={14} color={nodeColors.promptNode} strokeWidth={2.5}/>
      </NodeHeader>

      <div className={NodeForegroundStyle}>
        {foreground()}
      </div>


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


    </div>
  )
};

export default memo(PromptNode);