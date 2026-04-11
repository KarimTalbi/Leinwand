import React, {memo, useState} from 'react';
import {cn} from "@/lib/utils";

import useStore from '../store.ts';
import {AppState, TextNodeData} from "../types.ts";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {useShallow} from "zustand/react/shallow";
import BaseNode from "./basenode.tsx"
import {Lock, LockOpen} from "lucide-react";
import NodeMarkdown from "@/components/nodecontent/nodemarkdown.tsx";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  saveCanvas: state.saveCanvas,
  deleteNode: state.deleteNode,
  setSyncing: state.setSyncing,
});

const TextNode = ({id, data}: { id: string, data: TextNodeData }) => {
  const [loading, setLoading] = useState(false);
  const {updateNodeData, saveCanvas, deleteNode, setSyncing,} = useStore(useShallow(selector));


  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, {text: e.target.value});
  };


  const handleSave = async () => {
    setLoading(true);
    setSyncing(true);

    try {
      updateNodeData(id, {label: data.label, text: data.text, closed: true});
      await saveCanvas();

    } catch (err) {
      console.error('Error saving Text:', err);

    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };


  const setClosed = (closed: boolean) => {
    updateNodeData(id, {closed: closed});
  }


  return (
    <BaseNode
      id={id}
      title="TEXT NODE"
      color="bg-[#309898]/80 backdrop-blur-xs"
      loading={loading}
      onDelete={() => deleteNode(id)}
      style={{'--node-color': 'black'} as React.CSSProperties}
      headerActions={
        <Button onClick={data.closed ? () => setClosed(false) : handleSave} disabled={loading}
                className="transition-opacity w-8 h-8 duration-200 bg-transparent rounded-full hover:opacity-70 hover:bg-transparent disabled:opacity-30 disabled:bg-transparent disabled:cursor-not-allowed">

          {data.closed
            ? <LockOpen className="size-5 text-white"/>
            : <Lock className="size-5 text-white"/>
          }
        </Button>

      }
    >

      {!data.closed && (
        <div className="flex flex-col flex-1 min-h-0">
          <Textarea
            aria-label="Textarea"
            value={data.text}
            onChange={handleTextChange}
            placeholder='Enter your text...'
            className={cn(
              'nodrag flex-1 min-h-16 w-full resize-none rounded-xl border-none p-3 text-base text-black',
              'transition-all focus:ring ring-gray-300 outline-none ring-offset-4'
            )}
          />
        </div>
      )}

      {data.closed && (
        <>
          <NodeMarkdown>
            {data.text}
          </NodeMarkdown>
        </>
      )}
    </BaseNode>
  );
};

export default memo(TextNode);