import {memo, useState} from 'react';
import {NodeProps} from "@xyflow/react";

import useStore from '@/store.ts';
import {AppState, TextNodeType} from "@/types.ts";
import {
  NodeDisplayMarkdown, NodeDisplayText,
  NodeTextarea
} from "@/components/NodeElements/TextElements.tsx";
import {NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  deleteNode: state.deleteNode
});


const DisplayTextScreen = (text: string, onSettings: () => void, onSend: () => void, useMarkdown: boolean) => (
  <div className="flex flex-col flex-1 justify-between gap-5">
    {useMarkdown
    ? <NodeDisplayMarkdown content={text} className="px-2"/>
    : <NodeDisplayText>{text}</NodeDisplayText>
    }
    <div className="flex items-center justify-end px-2 pt-2 shrink-0">
      <button
        className="btn btn-ghost btn-sm" onClick={onSettings}>
        Settings
      </button>
      <button
        className="btn btn-ghost btn-sm" onClick={onSend}>
        Edit
      </button>
    </div>
  </div>
)

const DisplayInputScreen = (
  id: string,
  text: string,
  onSend: () => void,
  sendDisabled: boolean,
) => (
  <div>
    <div className="flex flex-col flex-1 justify-between gap-5">
      <NodeTextarea id={id} initialValue={text} placeholder={'Enter text...'} dataKey="text"/>
    </div>
    <div className="flex items-center justify-end px-2 pt-2 shrink-0">
      <button
        className="btn btn-ghost btn-sm" onClick={onSend} disabled={sendDisabled}>
        Save
      </button>
    </div>
  </div>
)

const TextNode = (
  {
    id,
    data,
  }: NodeProps<TextNodeType>
) => {

  const {updateNodeData} = useStore(useShallow(selector));
  const isClosed = data.closed;
  const [useMarkdown, setUseMarkdown] = useState(true);

  const handleClick = () => {
    updateNodeData(id, {closed: !isClosed})
  }

  const foreground = () => {
    if (!isClosed) return DisplayInputScreen(id, data.text || "", handleClick, !data.text)
    return DisplayTextScreen(data.text, () => setUseMarkdown(!useMarkdown), handleClick, useMarkdown)
  }

  return (
    <NodeBackground>
      <NodeHeader title="Text" id={id} color="#309898" loading={false}/>


      <NodeForeground>
        {foreground()}
      </NodeForeground>

      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="top"
        nodeId={id}
        color="#309898"
      />

      {!!data.text && (
      <ConnectionHandles
        handleId="source-1"
        handleType="source"
        position="bottom"
        nodeId={id}
        color="#309898"
      >

        <AddConnectedNode sourceId={id}/>

      </ConnectionHandles>
      )}

    </NodeBackground>

  )
};

export default memo(TextNode);