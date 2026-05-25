import React, {memo, useState} from 'react';
import {NodeProps, useNodeConnections, useNodes} from "@xyflow/react";

import useStore from '../../store.ts';
import {SummaryNodeType} from "@/types.ts";
import {NodeDisplayMarkdown,} from "@/components/NodeElements/TextElements.tsx";
import {NodeHeader} from "@/components/NodeElements/NodeHeader.tsx";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";
import {navbarButtonStyle, NodeBackgroundStyle, nodeTypeProperties, NodeForegroundStyle, pulsingText} from "@/lib/styles.ts";
import {Info, TriangleAlert} from "lucide-react";
import {cn} from "@/lib/utils.ts";

type NodeState =
  | 'loading'
  | 'hasResponse'
  | 'sourceIsSummary'
  | 'ready'
  | 'needs_connection';

const SummaryNode = (
  {
    id,
    data,
  }: NodeProps<SummaryNodeType>
) => {

  const {summaryNodeAction} = useStore(useShallow((s) => ({
    summaryNodeAction: s.summaryNodeAction,
  })));

  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const nodes = useNodes();

  const connections = useNodeConnections({handleId: "target-1", handleType: "target"});
  const isConnected = connections.length > 0;
  const isSourceSummary = isConnected
    ? nodes.find(n => n.id === connections[0].source)?.type === 'summaryNode'
    : false;

  const handleClick = async () => {
    setLoading(true);
    try {
      await summaryNodeAction(id);
    } finally {
      setLoading(false);
    }
  }

  const getNodeState = (): NodeState => {
    if (!isClosed) {
      if (loading) return 'loading';
      if (isSourceSummary) return 'sourceIsSummary';
      if (!isConnected) return 'needs_connection';
      return 'ready';
    }
    return 'hasResponse'
  }

  const nodeState = getNodeState();

  const BADGES: Partial<Record<NodeState, React.ReactNode>> = {
    needs_connection: (
      <div className="badge badge-outline badge-secondary badge-sm px-2 gap-1">
        <Info size={12}/> Connection required
      </div>
    ),

    sourceIsSummary: (
      <div className="badge badge-outline badge-error badge-sm px-1 gap-1">
        <TriangleAlert size={12}/> Source can't be a summary
      </div>
    ),
  };

  return (
    <div className={NodeBackgroundStyle}>
      <NodeHeader
        title="Summary"
        color={nodeTypeProperties.summaryNode.color}
        id={id}
        loading={loading}
        icon={nodeTypeProperties.summaryNode.icon}
      >

        <div className="flex-1 items-center px-2 justify-start">
          {BADGES[nodeState]}
        </div>

      </NodeHeader>

      <div className={NodeForegroundStyle}>

        {(nodeState === 'ready' || nodeState === 'needs_connection' || nodeState === 'sourceIsSummary') && (
          <div className="flex justify-around pt-1">

            <button
              className={cn(navbarButtonStyle, "btn-xs")} onClick={() => null}>
              Settings
            </button>

            <button
              className={cn(navbarButtonStyle, "btn-xs")}
              onClick={handleClick}
              disabled={nodeState === 'sourceIsSummary' || nodeState === 'needs_connection'}
            >
              Summarize
            </button>

          </div>
        )}

        {nodeState === "loading" && (

          <div className={cn(pulsingText, "flex flex-col w-full justify-center items-center h-15")}>
            <span>generating summary...</span>
          </div>

        )}

        {nodeState === 'hasResponse' && (
          <NodeDisplayMarkdown content={data.response} className="px-2 pb-2"/>
        )}

      </div>

      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="top"
        nodeId={id}
        color="#bf4546"
      />

      {nodeState === 'hasResponse' && (
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