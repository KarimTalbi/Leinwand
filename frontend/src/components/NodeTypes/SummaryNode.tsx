import {memo, useState} from 'react';
import {NodeProps, useNodeConnections, useNodes} from "@xyflow/react";

import useStore from '../../store.ts';
import {SummaryNodeType} from "@/types.ts";
import {NodeDisplayMarkdown,} from "@/components/NodeElements/TextElements.tsx";
import {NodeHeader} from "@/components/NodeElements/NodeHeader.tsx";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";
import {navbarButtonStyle, NodeBackgroundStyle, nodeColors, NodeForegroundStyle, pulsingText} from "@/lib/styles.ts";
import {MessagesSquare} from "lucide-react";
import {cn} from "@/lib/utils.ts";


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

  const handleClick = () => {
    setLoading(true);
    void summaryNodeAction(id);
    setLoading(false);
  }

  return (
    <div className={NodeBackgroundStyle}>
      <NodeHeader title="Summary" color={nodeColors.summaryNode} id={id} loading={loading}>
        <MessagesSquare size={14} color={nodeColors.summaryNode} strokeWidth={2.5}/>
      </NodeHeader>

      <div className={NodeForegroundStyle}>
        {!isClosed && (

          <>
            <div className="chat chat-start">
              <div className="chat-bubble text-sm">
                Connect a Node and press "Summarize" to get a summary
              </div>
            </div>

            <div className="flex justify-end pt-1">

                <button
                  className={cn(navbarButtonStyle, "btn-xs")} onClick={() => null}>
                  Settings
                </button>

                <button
                  className={cn(navbarButtonStyle, "btn-xs")}
                  onClick={handleClick}
                  disabled={!isConnected || isSourceSummary}
                >
                  Summarize
                </button>

            </div>
          </>

        )}

        {!data.response && isClosed && (

          <div className="chat chat-start">
            <div className="chat-bubble text-sm!">
                <span className={pulsingText}>
                  Generating Summary...
                </span>
            </div>
          </div>

        )}

        {data.response && isClosed && (

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