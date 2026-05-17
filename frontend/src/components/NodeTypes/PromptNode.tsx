import React, {memo, useState} from 'react';
import {NodeProps} from "@xyflow/react";


import useStore from '@/store.ts';
import {AppState, PromptNodeType} from "@/types.ts";
import {
  DisplayUserMessage,
  NodeDisplayMarkdown,
  NodeDisplayThinking,
  NodeTextarea
} from "@/components/NodeElements/TextElements.tsx";
import {DeleteButton, NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {MessagesSquare, Play, Settings2} from "lucide-react";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import {ToolTip} from "@/components/Buttons/ToolTip.tsx";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";


const selector = (state: AppState) => ({
  promptNodeAction: state.promptNodeAction,
});


const PromptNode = (
  {
    id,
    data,
    positionAbsoluteX,
    positionAbsoluteY,
  }: NodeProps<PromptNodeType>
) => {

  const {promptNodeAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;

  const handleClick = () => {
    setLoading(true);
    void promptNodeAction(id);
    setLoading(false);
  }

  return (
    <NodeBackground className="bg-[#ec4899] border-[#ec4899] w-130 min-h-100">
      <NodeHeader title="Chat" icon={<MessagesSquare size={14} color="white"/>}>

        <ToolTip position="top" label="Settings">
          <CustomButton
            onClick={() => null}
            buttonStyle="circle"
            disabled={loading}
            size="xs"
            color="ghost"
            className="text-white hover:border-none hover:bg-transparent hover:shadow-none"
          >
            <Settings2 size={14}/>
          </CustomButton>
        </ToolTip>

        <ToolTip position="top" label="Send to LLM">
          <CustomButton
            onClick={handleClick}
            buttonStyle="circle"
            disabled={loading || !data.prompt || isClosed}
            size="xs"
            color="ghost"
            className="text-white hover:border-none hover:bg-transparent hover:shadow-none"
          >
            <Play size={14}/>
          </CustomButton>
        </ToolTip>

        <ToolTip position="top" label="Delete Node">
          <DeleteButton id={id} loading={loading}/>
        </ToolTip>

      </NodeHeader>

      <NodeForeground>
        {
          isClosed
            ? !!data.response

              ? <div className="gap-2 flex flex-col h-full justify-between">
                <DisplayUserMessage message={data.prompt}/>
                <NodeDisplayMarkdown content={data.response}/>
              </div>

              : <NodeDisplayThinking/>

            : <NodeTextarea id={id} initialValue={data.prompt} placeholder={'Enter your prompt...'}/>
        }


      </NodeForeground>

      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="top"
        nodeId={id}
        style={{'--node-color': '#ec4899'} as React.CSSProperties}
      />

      <ConnectionHandles
        handleId="source-1"
        handleType="source"
        position="bottom"
        nodeId={id}
        style={{'--node-color': '#ec4899'} as React.CSSProperties}

      >

        <AddConnectedNode sourceId={id} posX={positionAbsoluteX} posY={positionAbsoluteY}/>

      </ConnectionHandles>


    </NodeBackground>
  )
};

export default memo(PromptNode);