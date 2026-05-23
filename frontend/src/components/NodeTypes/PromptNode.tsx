import {memo, useLayoutEffect, useState} from 'react';
import {NodeProps, useNodeConnections, useNodes} from "@xyflow/react";

import useStore from '@/store.ts';
import {PromptNodeType} from "@/types.ts";
import {NodeDisplayMarkdown,} from "@/components/NodeElements/TextElements.tsx";
import {NodeHeader} from "@/components/NodeElements/NodeHeader.tsx";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";
import {
  navbarButtonStyle,
  NodeBackgroundStyle,
  nodeColors,
  NodeForegroundStyle,
  pulsingText,
  textareaStyle
} from "@/lib/styles.ts";
import {MessagesSquare} from "lucide-react";
import {useTextarea} from "@/hooks/useTextarea.ts";
import {cn} from "@/lib/utils.ts";

type NodeState =
  | 'loading'
  | 'hasResponse'
  | 'sourceIsPrompt'
  | 'ready';


const PromptNode = (
  {
    id,
    data,
  }: NodeProps<PromptNodeType>
) => {

  const {localText, handleTextChange, textareaRef} = useTextarea(id, data.prompt || "", "prompt")
  const {promptNodeAction, createConnectedNode} = useStore(useShallow((s) => ({
    promptNodeAction: s.promptNodeAction,
    createConnectedNode: s.createConnectedNode,
  })));

  const handleClick = async () => {
    setLoading(true);
    try {
      await promptNodeAction(id);
    } finally {
      setLoading(false);
    }
  }

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localText]);

  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const nodes = useNodes();

  const connections = useNodeConnections({handleId: "target-1", handleType: "target"});
  const isConnected = connections.length > 0;
  const isSourcePrompt = isConnected
    ? nodes.find(n => n.id === connections[0].source)?.type === 'promptNode'
    : false;

  const getNodeState = (): NodeState => {
    if (!isClosed) {
      if (loading) return 'loading';
      if (isConnected && isSourcePrompt) return 'sourceIsPrompt';
      return 'ready';
    }
    return 'hasResponse'
  }

  const nodeState = getNodeState();


  return (
    <div className={NodeBackgroundStyle}>

      <NodeHeader
        id={id}
        title="Chat"
        color={nodeColors.promptNode}
        loading={loading}
        icon={
          <MessagesSquare size={14} color={nodeColors.promptNode} strokeWidth={2.5}/>
        }
      >

      </NodeHeader>

      <div className={NodeForegroundStyle}>

        {nodeState === 'loading' && (
          <div className="flex flex-col flex-1 justify-between gap-5">

            <div className="chat chat-end">
              <div className="chat-bubble text-sm">
                {data.prompt}
              </div>
            </div>

            <div className="chat chat-start">
              <div className="chat-bubble text-sm!">
                <span className={pulsingText}>
                  Thinking...
                </span>
              </div>
            </div>

          </div>
        )}

        <div className="flex flex-col flex-1 justify-between gap-2">

          {nodeState === 'ready' && (
            <div className="chat chat-start">
              <div className="chat-bubble text-sm">
                How can i help you?
              </div>
            </div>
          )}

          {(nodeState === 'sourceIsPrompt' || nodeState === 'ready') && (
            <>
              <textarea
                ref={textareaRef}
                value={localText}
                onChange={handleTextChange}
                className={cn(textareaStyle, "min-h-0")}
                placeholder="Enter your prompt..."
              />

              <div className="flex justify-end pt-1">

                <button
                  className={cn(navbarButtonStyle, "btn-xs")} onClick={() => null}>
                  Settings
                </button>

                <button
                  className={cn(navbarButtonStyle, "btn-xs")} onClick={handleClick} disabled={!data.prompt || loading}>
                  Send
                </button>

              </div>
            </>
          )}

        </div>

        {nodeState === 'hasResponse' && (
          <>
            <div className="flex flex-col flex-1 justify-between gap-5 pb-2">

              <div className="chat chat-end">
                <div className="chat-bubble text-sm">
                  {data.prompt}
                </div>
              </div>

              <NodeDisplayMarkdown content={data.response} className="px-2"/>

            </div>

            <div className="flex justify-end pt-1">

              <button
                className={cn(navbarButtonStyle, "btn-xs")} onClick={() => createConnectedNode("promptNode", id)}>
                Reply
              </button>
            </div>
          </>
        )}

      </div>


      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="top"
        nodeId={id}
        color={nodeColors.promptNode}
      />

      {nodeState === 'hasResponse' && (
        <ConnectionHandles
          handleId="source-1"
          handleType="source"
          position="bottom"
          nodeId={id}
          color={nodeColors.promptNode}
        >
          <AddConnectedNode sourceId={id}/>
        </ConnectionHandles>
      )}


    </div>
  )
};

export default memo(PromptNode);