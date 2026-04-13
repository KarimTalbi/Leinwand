import React, {memo, useState} from 'react';
import {useShallow} from "zustand/react/shallow";

import {AppState, SummaryNodeData} from "@/types.ts";
import useStore from "@/store.ts";
import api from "@/api.ts";
import BaseNode from "@/components/nodes/basenode.tsx";
import {NodeHeaderButton, NodeMarkdown, DefaultHandles} from "@/components/nodes/nodeelements.tsx";
import {Play, RefreshCcw} from "lucide-react";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  saveCanvas: state.saveCanvas,
  deleteNode: state.deleteNode,
  setSyncing: state.setSyncing,
  updateNodeClosed: state.updateNodeClosed,
});


const SummaryNode = ({id, data}: {id: string, data: SummaryNodeData}) => {
  if (!data) return null;
  const {updateNodeData, saveCanvas, deleteNode, setSyncing, updateNodeClosed} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;

  const playIcon = () => {
    return data.summary
      ? <RefreshCcw className="size-6 text-white"/>
      : <Play className="size-6 text-white"/>
  }

  const content = () => {
    return isClosed && data.summary
      ? <NodeMarkdown children={data.summary}/>
      : <div className="flex justify-center items-center h-full">
        <div className="flex flex-col justify-center align-middle">
          <p className="text-xl font-bold mb-15">Connect Nodes and run to Summarize!</p>
        </div>
      </div>
  }

  const handleClick = () => {
    isClosed
      ? updateNodeClosed(id, false)
      : void handleSummarize();
  }

  const handleSummarize = async () => {
    setSyncing(true);
    setLoading(true);

    try {
      const res = await api.post('/llm/summarize', {
        target_id: id,
      })

      updateNodeData(id, {summary: res.data.response, closed: true});
      await saveCanvas();

    } catch (err) {
      console.error('Error summarizing:', err);

    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  return (
    <BaseNode
      id={id}
      title="Summary Node"
      loading={loading}
      onDelete={() => deleteNode(id)}
      style={{'--node-color': '#bf4546'} as React.CSSProperties}
      headerActions={

        <NodeHeaderButton onClick={handleClick} icon={playIcon} disabled={loading}/>

      }>

      {content()}

      <DefaultHandles style={{'--node-color': '#bf4546'} as React.CSSProperties}/>

    </BaseNode>
  )
}

export default memo(SummaryNode);