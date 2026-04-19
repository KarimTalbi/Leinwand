import React, {memo, useState} from 'react';
import {useShallow} from "zustand/react/shallow";

import {AppState, SummaryNodeType} from "@/types.ts";
import useStore from "@/store.ts";
import BaseNode from "@/components/nodes/basenode.tsx";
import {NodeHeaderButton, DefaultHandles, NodeDisplayText} from "@/components/nodes/nodeelements.tsx";
import {Play, RefreshCcw} from "lucide-react";
import {NodeProps} from "@xyflow/react";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  deleteNode: state.deleteNode,
  setSyncing: state.setSyncing,
  updateNodeClosed: state.updateNodeClosed,
  summaryNodeAction: state.summaryNodeAction
});


const SummaryNode = ({id, positionAbsoluteX, positionAbsoluteY, data}: NodeProps<SummaryNodeType>) => {
  if (!data) return null;
  const {deleteNode, updateNodeClosed, summaryNodeAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;

  const playIcon = () => {
    return data.summary
      ? <RefreshCcw className="size-6 text-white"/>
      : <Play className="size-6 text-white"/>
  }

  const content = () => {
    return isClosed && data.summary
      ? <NodeDisplayText>{data.summary}</NodeDisplayText>
      : <div className="flex justify-center items-center h-full">
        <div className="flex flex-col justify-center align-middle">
          <p className="text-xl font-bold mb-15">Connect Nodes and run to Summarize!</p>
        </div>
      </div>
  }

  const handleClick = () => {
    setLoading(true);
    isClosed
      ? updateNodeClosed(id, false)
      : void summaryNodeAction(id);
    setLoading(false);
  }


  return (
    <BaseNode
      id={id}
      title="Summary Node"
      loading={loading}
      onDelete={() => void deleteNode(id)}
      style={{'--node-color': '#bf4546'} as React.CSSProperties}
      headerActions={

        <NodeHeaderButton onClick={handleClick} icon={playIcon} disabled={loading}/>

      }>

      {content()}

      <DefaultHandles sourceId={id} posX={positionAbsoluteX} posY={positionAbsoluteY} style={{'--node-color': '#bf4546'} as React.CSSProperties}/>

    </BaseNode>
  )
}

export default memo(SummaryNode);