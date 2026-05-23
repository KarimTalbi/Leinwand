import {memo, useState} from 'react';
import {NodeProps, useEdges, useNodeConnections, useNodes, useReactFlow} from "@xyflow/react";


import useStore from '@/store.ts';
import {AppState, MergeNodeType} from "@/types.ts";
import {ChatBubble, NodeDisplayMarkdown, NodeTextarea} from "@/components/NodeElements/TextElements.tsx";
import {NodeHeader} from "@/components/NodeElements/NodeHeader.tsx";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";
import {navbarButtonStyle, NodeBackgroundStyle, nodeColors, NodeForegroundStyle} from "@/lib/styles.ts";
import {MergeIcon} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import MergeContent from "@/components/NodeElements/MergeSections.tsx";


const selector = (state: AppState) => ({
  mergeNodeAction: state.mergeNodeAction,
  mergeNodeResolveAction: state.mergeNodeResolveAction,
});


const MergeNode = (
  {
    id,
    data,
  }: NodeProps<MergeNodeType>
) => {

  const {setCenter} = useReactFlow();
  const {mergeNodeAction, mergeNodeResolveAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const hasProblem = data.has_issues;

  const connections1 = useNodeConnections({handleId: "target-1", handleType: "target"});
  const connections2 = useNodeConnections({handleId: "target-2", handleType: "target"});
  const isConnected1 = connections1.length > 0;
  const isConnected2 = connections2.length > 0;
  const nodes = useNodes();
  const edges = useEdges();


  const getNodeForHandle = (handleId: string) => {
    const edge = edges.find(e => e.target === id && e.targetHandle === handleId);
    if (!edge) return null;
    return nodes.find(n => n.id === edge.source) ?? null;
  };


  const goToNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    void setCenter(
      node.position.x + (node.measured?.width ?? 200) / 2,
      node.position.y + (node.measured?.height ?? 100) / 2,
      { zoom: 1, duration: 500 }
    );
  };


  const handleClick = () => {
    setLoading(true);
    if (hasProblem) {
      void mergeNodeResolveAction(id)
    } else {

      const node1 = getNodeForHandle("target-1")
      const node2 = getNodeForHandle("target-2")

      if (!node1 || !node2) return
      void mergeNodeAction(id, node1.id, node2.id)

    }
    setLoading(false);
  }

  const getSolution = () => {
    if (!data.context) return null
    const lastItem = data.context[data.context.length - 1]
    return lastItem?.solution
  }

  return (
    <div className={NodeBackgroundStyle}>
      <NodeHeader
        title="Merge"
        color={nodeColors.mergeNode}
        id={id}
        loading={loading}
      >
        <MergeIcon className="rotate-90" size={14} color={nodeColors.mergeNode} strokeWidth={2.5}/>
      </NodeHeader>

      <div className={NodeForegroundStyle}>
        {!isClosed && !loading && (
          <div className="flex flex-col flex-1 justify-end chat chat-start nodrag select-text cursor-text">
            <div className="chat-bubble text-sm mx-3">
              Connect 2 Nodes and press "Merge" to merge their context
            </div>
            <div className="flex w-full items-center justify-end px-2 pt-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  className="btn btn-ghost btn-sm" onClick={() => null}>
                  Settings
                </button>
                <button
                  className="btn btn-ghost btn-sm" onClick={handleClick}
                  disabled={loading || !isConnected1 || !isConnected2}>
                  Merge
                </button>
              </div>
            </div>
          </div>
        )}

        {!isClosed && hasProblem && !loading && (
          <div>
            <div className="flex flex-col flex-1 justify-between gap-5">
              <NodeDisplayMarkdown content={data.problems || ""} className="px-2"/>
              <NodeTextarea id={id} initialValue={data.solution} placeholder={'Enter your solution...'}
                            dataKey="solution"/>
            </div>
            <div className="flex w-full items-center justify-end px-2 pt-2 shrink-0">
              <button
                className="btn btn-ghost btn-sm" onClick={handleClick} disabled={loading || !data.solution}>
                Merge
              </button>
            </div>
          </div>
        )}

        {isClosed && !loading && (
          !hasProblem
            ? <div>

            <MergeContent sections={data.context || []}></MergeContent>

              <div className="flex justify-around pt-1">

                <button
                  className={cn(navbarButtonStyle, "btn-xs")} onClick={() => goToNode(data.incomer1 || "")}>
                  Go to Stream 1
                </button>

                <button
                  className={cn(navbarButtonStyle, "btn-xs")} onClick={() => goToNode(data.incomer2 || "")}>
                  Go to Stream 2
                </button>

              </div>
            </div>
            : <div>
              <ChatBubble position="left">
                Merging Successful! <br/>
                Contradictions solved!. <br/>
                This Node holds the context of both Streams.
              </ChatBubble>
              <ChatBubble position="left" maxHeight={false}>
                <NodeDisplayMarkdown content={getSolution() || "No solution found."}></NodeDisplayMarkdown>
              </ChatBubble>
            </div>
          )}
      </div>

      <ConnectionHandles
        handleId="target-1"
        offset={-100}
        handleType="target"
        position="top"
        nodeId={id}
        color="#f5c45e"
      />

      <ConnectionHandles
        handleId="target-2"
        offset={100}
        handleType="target"
        position="top"
        nodeId={id}
        color="#f5c45e"
      />

      {!!data.context && (
        <ConnectionHandles
          handleId="source-1"
          handleType="source"
          position="bottom"
          nodeId={id}
          color="#f5c45e"
        >

          <AddConnectedNode sourceId={id}/>

        </ConnectionHandles>
      )}

    </div>

  )
};

export default memo(MergeNode);