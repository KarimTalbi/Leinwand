import React, {memo, useState} from 'react';
import {useShallow} from "zustand/react/shallow";
import {Lock, LockOpen} from "lucide-react";

import useStore from '@/store.ts';
import {AppState, TextNodeData} from "@/types.ts";

import BaseNode from "@/components/nodes/basenode.tsx"
import {NodeHeaderButton, NodeMarkdown, NodeTextarea, DefaultHandles} from "@/components/nodes/nodeelements.tsx";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  saveCanvas: state.saveCanvas,
  deleteNode: state.deleteNode,
  setSyncing: state.setSyncing,
  updateNodeClosed: state.updateNodeClosed,
});

const TextNode = ({id, data}: { id: string, data: TextNodeData }) => {
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const {updateNodeData, saveCanvas, deleteNode, setSyncing, updateNodeClosed} = useStore(useShallow(selector));

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, {text: e.target.value});
  };

  const lockIcon = () => {
    return isClosed
      ? <LockOpen className="size-5 text-white"/>
      : <Lock className="size-5 text-white"/>
  }

  const handleClick = () => {
    isClosed
      ? updateNodeClosed(id, false)
      : void handleSave();
  }

  const content = () => {
    return isClosed
      ? <NodeMarkdown children={data.text}/>
      : <NodeTextarea value={data.text} handleTextChange={handleTextChange} placeholder='Enter your text...'/>
  }

  const handleSave = async () => {
    setLoading(true);
    setSyncing(true);

    try {
      updateNodeData(id, {text: data.text, closed: true});
      await saveCanvas();

    } catch (err) {
      console.error('Error saving Text:', err);

    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  return (
    <BaseNode
      id={id}
      title="Text Node"
      loading={loading}
      onDelete={() => deleteNode(id)}
      style={{'--node-color': '#309898'} as React.CSSProperties}
      headerActions={

        <NodeHeaderButton onClick={handleClick} icon={lockIcon} disabled={loading}/>

      }>

      {content()}

      <DefaultHandles style={{'--node-color': '#309898'} as React.CSSProperties}/>

    </BaseNode>
  );
};

export default memo(TextNode);