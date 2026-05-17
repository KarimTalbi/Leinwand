import {memo} from 'react';
import {NodeProps} from "@xyflow/react";

import useStore from '@/store.ts';
import {AppState, TextNodeType} from "@/types.ts";
import {NodeDisplayText, NodeTextarea} from "@/components/NodeElements/TextElements.tsx";
import {DeleteButton, NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {Lock, LockOpen, LucideTextCursorInput} from "lucide-react";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import {ToolTip} from "@/components/Buttons/ToolTip.tsx";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  deleteNode: state.deleteNode
});


const TextNode = (
  {
    id,
    data,
    positionAbsoluteX,
    positionAbsoluteY,
  }: NodeProps<TextNodeType>
) => {

  const {updateNodeData} = useStore(useShallow(selector));
  const isClosed = data.closed;

  const handleClick = () => {
    updateNodeData(id, {closed: !isClosed})
  }

  return (
    <NodeBackground className="bg-[#309898] border-[#309898] w-130 min-h-100">
      <NodeHeader title="Text Node" icon={<LucideTextCursorInput size={14} color="white"/>}>

        <ToolTip position="top" label="Lock Node">
          <CustomButton
            onClick={handleClick}
            buttonStyle="circle"
            disabled={!data.text}
            size="xs"
            color="ghost"
            className="text-white hover:border-none hover:bg-transparent hover:shadow-none"
          >
            {isClosed ? <LockOpen size={14} color="white"/> : <Lock size={14} color="white"/>}
          </CustomButton>
        </ToolTip>

        <ToolTip position="top" label="Delete Node">
          <DeleteButton id={id}/>
        </ToolTip>

      </NodeHeader>

      <NodeForeground>

        {
          isClosed
            ? <NodeDisplayText>{data.text}</NodeDisplayText>
            : <NodeTextarea id={id} initialValue={data.text} placeholder={'Enter text...'} dataKey="text"/>
        }

      </NodeForeground>

      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="top"
        nodeId={id}
      />

      <ConnectionHandles
        handleId="source-1"
        handleType="source"
        position="top"
        nodeId={id}
      >

        <AddConnectedNode sourceId={id} posX={positionAbsoluteX} posY={positionAbsoluteY}/>

      </ConnectionHandles>

    </NodeBackground>

  )
};

export default memo(TextNode);