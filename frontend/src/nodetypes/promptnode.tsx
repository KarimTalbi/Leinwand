import React, {memo, useState} from 'react';
import {Undo2, Play} from "lucide-react";
import {useShallow} from "zustand/react/shallow";

import useStore from '../store.ts';
import api from '../api.ts'
import {AppState, PromptNodeData} from "../types.ts";

import {NodeTextarea, NodeHeaderButton, DefaultHandles, NodeDisplayText} from "@/components/nodes/nodeelements.tsx";
import {Switch} from "@/components/ui/switch.tsx";
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
  const [includeContext, setIncludeContext] = useState(true);
  const isClosed = data.closed;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, {prompt: e.target.value});
  };

  const content = () => {
    return isClosed
      ? <NodeDisplayText children={data.response}/>
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
        include_context: includeContext,
      });

      console.log(res.data.response.slice(0, 200))

      updateNodeData(id, {prompt: data.prompt, response: res.data.response, closed: true});
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
        <div className="flex items-center gap-3">

          <NodeHeaderButton onClick={handleClick} icon={playIcon} disabled={loading}/>
        </div>
      }>

      {content()}

      {isClosed
        ? <div className="p-5 bg-gray-100 rounded-xl">
           <p className="text-xs font-bold mb-3">User Message:</p>
           <p className="text-xs mb-3">{data.prompt}</p>
         </div>
        : <div className="w-full flex items-center justify-end pt-3">
          <p className="text-xs font-bold mr-2">Include Context</p>
          <Switch checked={includeContext} onCheckedChange={() => setIncludeContext(!includeContext)} size="default"/>
        </div>
      }

      <DefaultHandles style={{'--node-color': '#ec4899'} as React.CSSProperties}/>


    </BaseNode>

  );
};

export default memo(PromptNode);