import {memo, useState} from 'react';
import {NodeProps, useNodeConnections, useNodes} from "@xyflow/react";

import useStore from '../../store.ts';
import {AppState, LLMConfig, SummaryNodeType} from "@/types.ts";
import {
  NodeDisplayPulsingText,
  NodeDisplayMarkdown,
} from "@/components/NodeElements/TextElements.tsx";
import {NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";
import {NodeBackgroundStyle, nodeColors, NodeForegroundStyle} from "@/lib/styles.ts";
import {MessagesSquare} from "lucide-react";

const defaultLLMConfig = {
  model: 'gpt-5-mini',
  temperature: 0,
  max_tokens: 0,
  timeout: 0,
  max_retries: 0,
}

const DisplaySummaryScreen = (summary: string) => (
      <NodeDisplayMarkdown content={summary}/>
)

const DefaultScreen = (
  onSettings: () => void,
  onSend: () => void,
  sendDisabled: boolean,
) => {
  return (
  <div className="flex flex-col flex-1 justify-end chat chat-start nodrag select-text cursor-text">
    <div className="chat-bubble text-sm mx-3">
      Connect a Node and press "Summarize" to get a summary
    </div>
    <div className="flex w-full items-center justify-end px-2 pt-2 shrink-0">
      <div className="flex items-center gap-1.5">
        <button
          className="btn btn-ghost btn-sm" onClick={onSettings}>
          Settings
        </button>
        <button
          className="btn btn-ghost btn-sm" onClick={onSend} disabled={sendDisabled}>
          Summarize
        </button>
      </div>
    </div>
  </div>
  )
}

const DisplayLoadingScreen = () => (
    <div className="flex flex-col flex-1 justify-end chat chat-start nodrag select-text cursor-text">
      <div className="chat-bubble text-sm mx-3">
        <NodeDisplayPulsingText>
          Summarizing...
        </NodeDisplayPulsingText>
      </div>
    </div>
)




const selector = (state: AppState) => ({
  summaryNodeAction: state.summaryNodeAction,
});


const SummaryNode = (
  {
    id,
    data,
  }: NodeProps<SummaryNodeType>
) => {
  if (!data.config) data.config = defaultLLMConfig as LLMConfig

  const {summaryNodeAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const nodes = useNodes();

  const connections = useNodeConnections({handleId: "target-1", handleType: "target"});
  const isConnected = connections.length > 0;
  const isSourceSummary = isConnected
    ? nodes.find(n => n.id === connections[0].source)?.type === 'summaryNode'
    : false;

  const handleClick = () => {
    setLoading(true);
    void summaryNodeAction(id);
    setLoading(false);
  }

  const foreground = () => {
    if (!isClosed) return DefaultScreen(() => null, handleClick, loading || !isConnected || isSourceSummary)
    if (!!data.response) return DisplaySummaryScreen(data.response)
    return DisplayLoadingScreen()
  }

  return (
    <div className={NodeBackgroundStyle}>
      <NodeHeader title="Summary" color={nodeColors.summaryNode} id={id} loading={loading}>
        <MessagesSquare size={14} color={nodeColors.summaryNode} strokeWidth={2.5}/>
      </NodeHeader>

      <div className={NodeForegroundStyle}>
        {foreground()}
      </div>


      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="top"
        nodeId={id}
        color="#bf4546"
      />

      {!!data.response && (
      <ConnectionHandles
        handleId="source-1"
        handleType="source"
        position="bottom"
        nodeId={id}
        color="#bf4546"
      >

        <AddConnectedNode sourceId={id}/>

      </ConnectionHandles>
      )}

    </div>

  )
};

export default memo(SummaryNode);