import React, {memo, useState} from 'react'
import {NodeProps, useNodeConnections, useNodes} from '@xyflow/react'

import AddConnectedNode from '@/components/node-elements/AddConnectedNode'
import {ConnectionHandles} from '@/components/node-elements/ConnectionHandles'
import {NodeHeader} from '@/components/node-elements/NodeHeader'
import {NodeDisplayMarkdown} from '@/components/node-elements/TextElements'
import {usePromptNode} from '@/hooks/node-actions/usePromptNode'
import {useStoreWithId} from '@/hooks/useStoreWithId'
import {
  bubbleLeftStyle,
  bubbleRightStyle,
  NodeBackgroundStyle,
  NodeForegroundStyle,
  nodeHeaderButtonStyle,
  textareaStyle,
  typeProps,
} from '@/lib/styles'
import {PromptNodeType} from '@/types'
import {ArrowUp, Bot, Reply} from 'lucide-react'
import useStore from "@/store";
import TextareaAutosize from 'react-textarea-autosize';
import {cn} from "@/lib/utils.ts";

type NodeState = 'loading' | 'hasResponse' | 'sourceIsPrompt' | 'ready'

const PromptNode = ({id, data}: NodeProps<PromptNodeType>) => {
  const updateNodeData = useStore((s) => s.updateNodeData)
  const {conPrompt} = useStoreWithId(id)
  const {run, isStreaming} = usePromptNode(id)
  const [expanded, setExpanded] = useState(false)
  const isLong = data.prompt ? data.prompt.length > 80 : false

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, {prompt: e.target.value})
  }

  const nodes = useNodes()
  const connections = useNodeConnections({handleId: 'target-1', handleType: 'target'})
  const isConnected = connections.length > 0
  const isSourcePrompt = isConnected
    ? nodes.find((n) => n.id === connections[0].source)?.type === 'promptNode'
    : false

  const getNodeState = (): NodeState => {
    if (isStreaming && !data.response) return 'loading'   // noch kein Text
    if (data.closed || (isStreaming && data.response)) return 'hasResponse'  // streamt oder fertig
    if (isConnected && isSourcePrompt) return 'sourceIsPrompt'
    return 'ready'
  }

  const nodeState = getNodeState()

  return (
    <div className={NodeBackgroundStyle}>

      <NodeHeader
        id={id}
        title="Chat"
        color={typeProps.promptNode.color}
        icon={typeProps.promptNode.icon}
      />


      <div className={NodeForegroundStyle}>

        {nodeState === 'loading' && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ec4899]/20">
                <Bot size={30} className="text-[#ec4899]"></Bot>
              </div>
            </div>
            <div className={bubbleLeftStyle}>
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>

        )}

        <div className="flex flex-col flex-1 justify-between gap-7">

          {nodeState === 'ready' && (
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ec4899]/20">
                  <Bot size={30} className="text-[#ec4899]"></Bot>
                </div>
              </div>
              <div className={bubbleLeftStyle}>How can i help you?</div>
            </div>
          )}

          {(nodeState === 'sourceIsPrompt' || nodeState === 'ready') && (
            <div
              className="bg-neutral-50 ring-2 ring-neutral-200 rounded-2xl mb-1 shadow-sm hover:ring-neutral-300">
              <TextareaAutosize
                value={data.prompt}
                onChange={handleTextChange}
                className={cn(textareaStyle)}
                placeholder="Enter your prompt..."
              />
              <div className="flex justify-end items-center pr-2 pb-2">

                <div className="tooltip" data-tip="Send">
                  <button
                    className={cn("btn btn-ghost bg-[#ec4899] btn-sm btn-circle disabled:opacity-30 transition-opacity")}
                    onClick={run}
                    disabled={!data.prompt || isStreaming}
                  >
                    <ArrowUp size={14} color={"white"}></ArrowUp>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {nodeState === 'hasResponse' && (
          <div className="flex flex-col flex-1 justify-between gap-7">
            <div className="chat chat-end">
              <div className={cn(bubbleRightStyle, "break-all")}>
                <p className={cn(!expanded && "line-clamp-1")}>
                  {data.prompt}
                </p>
                {isLong && (
                  <button
                    className="btn btn-ghost w-full btn-xs bg-transparent border-none shadow-none text-neutral-500"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? 'show less' : 'show more'}
                  </button>
                )}
              </div>
            </div>
            <NodeDisplayMarkdown content={data.response}/>
          </div>
        )}

      </div>

      <div className="flex flex-row items-center justify-between shrink-0 pl-2 py-1 w-full">

        {data.model.model && (
          <div className="flex flex-row items-center justify-start w-full">
            <div className="badge badge-soft badge-secondary">
              <Bot size={14}/> {data.model.model}
            </div>
          </div>
        )}

        {nodeState === 'hasResponse' && (
          <div className="flex flex-row items-center justify-end w-full">
            <div className="tooltip" data-tip="Reply">
              <button className={nodeHeaderButtonStyle} onClick={conPrompt}>
                <Reply size={16} color={typeProps.promptNode.color}></Reply>
              </button>
            </div>
          </div>
        )}

      </div>


      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="top"
        nodeId={id}
        color={typeProps.promptNode.color}
      />

      {nodeState === 'hasResponse' && (
        <ConnectionHandles
          handleId="source-1"
          handleType="source"
          position="bottom"
          nodeId={id}
          color={typeProps.promptNode.color}
        >
          <AddConnectedNode sourceId={id}/>
        </ConnectionHandles>
      )}

    </div>
  )
}

export default memo(PromptNode)