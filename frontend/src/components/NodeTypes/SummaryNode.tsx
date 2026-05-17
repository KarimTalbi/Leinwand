import {memo, useState} from 'react';
import {NodeProps, useNodeConnections, useNodes} from "@xyflow/react";

import useStore from '../../store.ts';
import {AppState, SummaryNodeType} from "@/types.ts";
import {
  NodeDisplayPulsingText,
  NodeDisplayMarkdown,
} from "@/components/NodeElements/TextElements.tsx";
import {NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";


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
    <NodeBackground>
      <NodeHeader title="Summary" color="#bf4546" id={id} loading={loading}/>

      <NodeForeground>
        {foreground()}
      </NodeForeground>


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

    </NodeBackground>

  )
};

export default memo(SummaryNode);