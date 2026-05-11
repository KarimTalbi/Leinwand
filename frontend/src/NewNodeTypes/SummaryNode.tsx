import React, {memo, useState} from 'react';
import {NodeProps, useNodeConnections, useNodes} from "@xyflow/react";

import useStore from '../store.ts';
import {AppState, SummaryNodeType} from "../types.ts";
import {NodeDisplayText, NodeDisplayThinking} from "@/components/NodeElements/TextElements.tsx";
import {DeleteButton, NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import CircleIconButton from "@/components/menus/CircleButton.tsx";
import {Play, Settings2} from "lucide-react";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";

const prompt = "summarize the topics in the context. Don't mention it being the context or being a summary. Summarize as if i would tell you to summarize a topic.";

const selector = (state: AppState) => ({
  promptNodeAction: state.promptNodeAction,
});


const SummaryNode = (
  {
    id,
    data,
  }: NodeProps<SummaryNodeType>
) => {

  const {promptNodeAction} = useStore(useShallow(selector));
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
    void promptNodeAction(id, prompt, 'summary');
    setLoading(false);
  }

  return (
    <NodeBackground style={{'--node-color': '#bf4546'} as React.CSSProperties}>
      <NodeHeader title="Summary Node">

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
          title={!isConnected ? 'Connect Node' : isSourceSummary ? "Can't summarize from a summary" : "Get Summary"}
          tooltipPosition="top"
          bigTooltip={true}
          disabled={loading || isClosed || isSourceSummary || !isConnected}
          className="bg-white text-black  border-[#e5e5e5] border"
        >
          <Play/>
        </CircleIconButton>

        <DeleteButton id={id} loading={loading}/>

      </NodeHeader>

      <NodeForeground>

        {
          isClosed
            ? !!data.response

              ? <div className="flex flex-col h-full justify-between">
                <NodeDisplayText>{data.response}</NodeDisplayText>
              </div>
              : <NodeDisplayThinking/>

            : <div className="flex flex-col h-full justify-center items-center">
              <p className="text-2xl font-bold mb-15">Connect Node and press Play to get a summary</p>
            </div>
        }

      </NodeForeground>

      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="left"
        nodeId={id}
        style={{'--node-color': '#bf4546'} as React.CSSProperties}
      />

      <ConnectionHandles
        handleId="source-1"
        handleType="source"
        position="right"
        nodeId={id}
        style={{'--node-color': '#bf4546'} as React.CSSProperties}
      />

    </NodeBackground>

  )
};

export default memo(SummaryNode);