import React, {memo, useState} from 'react';
import {useShallow} from "zustand/react/shallow";
import {Play, RefreshCcw} from "lucide-react";

import useStore from '../store.ts';
import {AppState, MergeNodeType} from '../types.ts';

import BaseNode from '@/components/nodes/basenode.tsx';
import MergeContent from '@/components/nodes/mergenodesections.tsx';
import {MergeHandles, NodeDisplayText, NodeHeaderButton, NodeTextarea} from '@/components/nodes/nodeelements.tsx'
import {NodeProps} from "@xyflow/react";

const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  deleteNode: state.deleteNode,
  setSyncing: state.setSyncing,
  mergeNodeAction: state.mergeNodeAction,
});

const MergeNode = ({id, positionAbsoluteX, positionAbsoluteY, data}: NodeProps<MergeNodeType>) => {
  const {updateNodeData, mergeNodeAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const hasProblem = data.problems;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, {solution: e.target.value});
  };

  const playIcon = () => {
    return data.context
      ? <RefreshCcw className="size-6 text-white"/>
      : <Play className="size-6 text-white"/>
  }

  const content = () => {
    if (hasProblem) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <NodeDisplayText children={data.problems}/>
          <NodeTextarea value={data.solution} handleTextChange={handleTextChange} placeholder='Enter your answer...'/>
        </div>
      )
    }

    return isClosed && data.context
      ? <MergeContent sections={data.context}/>
      : <div className="flex justify-center items-center h-full">
        <div className="flex flex-col justify-center align-middle">
          <p className="text-xl font-bold mb-15">Connect 2 Streams and Press Run!</p>
        </div>
      </div>
  }

  const handleClick = () => {
    setLoading(true);
        void mergeNodeAction(id)
    setLoading(false);
  }

  return (
    <BaseNode
      id={id}
      title="Merge Node"
      loading={loading}
      style={{'--node-color': '#f5c45e'} as React.CSSProperties}
      headerActions={
        <NodeHeaderButton onClick={handleClick} icon={playIcon} disabled={loading}/>
      }
    >
      {content()}

      <MergeHandles sourceId={id} posX={positionAbsoluteX} posY={positionAbsoluteY}
                    style={{'--node-color': '#f5c45e'} as React.CSSProperties}/>
    </BaseNode>
  );
};

export default memo(MergeNode);