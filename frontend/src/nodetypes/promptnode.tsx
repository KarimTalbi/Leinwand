import React, {memo, useState} from 'react';
import {Undo2, Play} from "lucide-react";
import {useShallow} from "zustand/react/shallow";

import useStore from '../store.ts';
import api from '../api.ts'
import {AppState, PromptNodeData} from "../types.ts";

import {NodeMarkdown, NodeTextarea, NodeHeaderButton, DefaultHandles} from "@/components/nodes/nodeelements.tsx";
import BaseNode from "@/components/nodes/basenode.tsx";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  saveCanvas: state.saveCanvas,
  deleteNode: state.deleteNode,
  setSyncing: state.setSyncing,
  updateNodeClosed: state.updateNodeClosed,
});

const PromptNode = ({id, data}: { id: string, data: PromptNodeData }) => {
  const {updateNodeData, saveCanvas, deleteNode, setSyncing, updateNodeClosed} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, {prompt: e.target.value});
  };

  const content = () => {
    return isClosed
      ? <NodeMarkdown children={data.response}/>
      : <NodeTextarea value={data.prompt} handleTextChange={handleTextChange} placeholder='Enter your prompt...'/>
  }

  const playIcon = () => {
    return isClosed
      ? <Undo2 className="size-6 text-white"/>
      : <Play className="size-6 text-white"/>
  }

  const handleClick = () => {
    isClosed
      ? updateNodeClosed(id, false)
      : void handleSend();
  }

  const handleSend = async () => {
    setSyncing(true);
    setLoading(true);

    try {
      const res = await api.post('/llm/generate', {
        prompt: data.prompt,
        target_id: id,
      });

      console.log(res.data.response.slice(0, 200))

      updateNodeData(id, {prompt: data.prompt, response: res.data.response, label: res.data.title, closed: true});
      await saveCanvas();

    } catch (err) {
      console.error('Error sending prompt to LLM:', err);

    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  return (
    <BaseNode
      id={id}
      title="Prompt Node"
      loading={loading}
      onDelete={() => deleteNode(id)}
      style={{'--node-color': '#ec4899'} as React.CSSProperties}
      headerActions={

        <NodeHeaderButton onClick={handleClick} icon={playIcon} disabled={loading}/>

      }>

      {content()}

      {isClosed && (
        <div className="p-5 bg-gray-100 rounded-xl">
          <p className="text-xs font-bold mb-3">User Message:</p>
          <p className="text-xs mb-3">{data.prompt}</p>
        </div>
      )}

      <DefaultHandles style={{'--node-color': '#ec4899'} as React.CSSProperties}/>


    </BaseNode>

  );
};

export default memo(PromptNode);