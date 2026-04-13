import React, {memo, useState} from 'react';

import useStore from '../store.ts';
import api from '../api.ts'
import {AppState, MergeNodeData} from "../types.ts";
import MergeContent from "@/components/nodecontent/mergenodesections.tsx";
import {MergeHandles} from "@/components/nodecontent/nodehandles.tsx";
import {useShallow} from "zustand/react/shallow";
import {Play, RefreshCcw} from "lucide-react";
import BaseNode from "@/nodetypes/basenode.tsx";
import NodeHeaderButton from "@/components/nodecontent/nodeheaderbutton.tsx";

const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  saveCanvas: state.saveCanvas,
  deleteNode: state.deleteNode,
  setSyncing: state.setSyncing,
});

const MergeNode = ({id, data}: { id: string, data: MergeNodeData }) => {
  const {updateNodeData, saveCanvas, deleteNode, setSyncing} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;

  const playIcon = () => {
    return data.context
      ? <RefreshCcw className="size-6 text-white"/>
      : <Play className="size-6 text-white"/>
  }

  const content = () => {
    return isClosed && data.context
    ? <MergeContent sections={data.context}/>
    : <div className="flex justify-center items-center h-full">
        <div className="flex flex-col justify-center align-middle">
          <p className="text-xl font-bold mb-15">Connect 2 Streams and Press Run!</p>
        </div>
      </div>
  }

  const handleGet = async () => {
    setSyncing(true);
    setLoading(true);

    try {
      const res = await api.post('/context/merge', {
        target_id: id,
      });

      console.log(res.data)

      updateNodeData(id, {context: res.data.data, closed: true});
      await saveCanvas();

    } catch (err) {
      console.error('Error getting context:', err);

    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };


  return (
    <BaseNode
    id={id}
    title="Merge Node"
    loading={loading}
    onDelete={(() => deleteNode(id))}
    style={{'--node-color': '#f5c45e'} as React.CSSProperties}
    headerActions={
      <NodeHeaderButton onClick={handleGet} icon={playIcon} disabled={loading}/>
    }
    >
      {content()}

      <MergeHandles style={{'--node-color': '#f5c45e'} as React.CSSProperties} />
    </BaseNode>
  );
};

export default memo(MergeNode);