import React, {memo, useState} from 'react';
import {useShallow} from "zustand/react/shallow";
import {Lock, LockOpen} from "lucide-react";

import useStore from '@/store.ts';
import {AppState, TextNodeType} from "@/types.ts";

import BaseNode from "@/components/nodes/basenode.tsx"
import {NodeHeaderButton, NodeTextarea, DefaultHandles, NodeDisplayText} from "@/components/nodes/nodeelements.tsx";
import {NodeProps} from "@xyflow/react";
import {useDebouncedCallback} from "use-debounce";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  updateNodeClosed: state.updateNodeClosed,
});

const TextNode = ({id, positionAbsoluteX, positionAbsoluteY, data}: NodeProps<TextNodeType>) => {
  const isClosed = data.closed;
  const {updateNodeData, updateNodeClosed} = useStore(useShallow(selector));
  const [localText, setLocalText] = useState(data.text);

  const debouncedUpdate = useDebouncedCallback((value: string) => {
    updateNodeData(id, { text: value });
  }, 500);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
    debouncedUpdate(e.target.value);
  };
  const lockIcon = () => {
    return isClosed
      ? <LockOpen className="size-7 text-white mb-2"/>
      : <Lock className="size-7 text-white mb-2"/>
  }

  const titleText = () => {
    return isClosed
      ? 'Unlock'
      : 'Lock'
  }

  const handleClick = () => {
    isClosed ? updateNodeClosed(id, false) : handleSave();
  }

  const content = () => {
    return isClosed
      ? <NodeDisplayText children={data.text}/>
      : <NodeTextarea value={localText} handleTextChange={handleTextChange} placeholder='Enter your text...'/>
  }

  const handleSave = () => {
    updateNodeData(id, {text: data.text, closed: true});
  };


  return (
    <BaseNode
      id={id}
      title="Text Node"
      style={{'--node-color': '#309898'} as React.CSSProperties}
      headerActions={

        <NodeHeaderButton onClick={handleClick} icon={lockIcon} title={titleText()}/>

      }>

      {content()}

      <DefaultHandles sourceId={id} posX={positionAbsoluteX} posY={positionAbsoluteY} style={{'--node-color': '#309898'} as React.CSSProperties}/>

    </BaseNode>
  );
};

export default memo(TextNode);