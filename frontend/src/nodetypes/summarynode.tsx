import React, {memo, useState} from 'react';
import {useShallow} from "zustand/react/shallow";

import {AppState, SummaryNodeType} from "@/types.ts";
import useStore from "@/store.ts";
import BaseNode from "@/components/nodes/basenode.tsx";
import {NodeHeaderButton, DefaultHandles, NodeDisplayText} from "@/components/nodes/nodeelements.tsx";
import {Play, RefreshCcw} from "lucide-react";
import {NodeProps, useNodeConnections, useNodes} from "@xyflow/react";


const selector = (state: AppState) => ({
  updateNodeClosed: state.updateNodeClosed,
  promptNodeAction: state.promptNodeAction,
});

const prompt = "summarize the topics in the context. Don't mention it being the context or being a summary. Summarize as if i would tell you to summarize a topic.";


const SummaryNode = ({id, positionAbsoluteX, positionAbsoluteY, data}: NodeProps<SummaryNodeType>) => {
  if (!data) return null;
  const {updateNodeClosed, promptNodeAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const nodes = useNodes();

  const connections = useNodeConnections({handleId: "target-1", handleType: "target"});
  const isConnected = connections.length > 0;

  const isSourceSummary = isConnected
    ? nodes.find(n => n.id === connections[0].source)?.type === 'summaryNode'
    : false;

  const playIcon = () => {
    return data.response
      ? <RefreshCcw className="size-8 text-white"/>
      : <Play className="size-8 text-white"/>
  }

  const titleText = () => {
    return data.response
      ? 'Refresh Summary'
      : 'Summarize'
  }

  const content = () => {
    if (isClosed && data.response) {
            return <NodeDisplayText children={data.response}/>;
          }
    else if (isClosed && !data.response) {
      return <NodeDisplayText></NodeDisplayText>
    }

     return ( <div className="flex justify-center items-center h-full">
        <div className="flex flex-col justify-center align-middle">
          <p className="text-2xl font-bold mb-15">Connect Nodes and run to Summarize!</p>
        </div>
      </div> )
  }

  const handleClick = () => {
    setLoading(true);
    isClosed
      ? updateNodeClosed(id, false)
      : void promptNodeAction(id, prompt, 'summary');
    setLoading(false);
  }


  return (
    <BaseNode
      id={id}
      title="Summary Node"
      loading={loading}
      style={{'--node-color': '#bf4546'} as React.CSSProperties}
      headerActions={

        <NodeHeaderButton onClick={handleClick} icon={playIcon} disabled={loading || !isConnected || isSourceSummary} title={titleText()}/>

      }>

      {content()}

      <DefaultHandles sourceId={id} posX={positionAbsoluteX} posY={positionAbsoluteY} style={{'--node-color': '#bf4546'} as React.CSSProperties}/>

    </BaseNode>
  )
}

export default memo(SummaryNode);