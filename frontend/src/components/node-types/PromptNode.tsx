import React, {memo} from 'react'
import {NodeProps, useNodeConnections, useNodes} from '@xyflow/react'

import AddConnectedNode from '@/components/node-elements/AddConnectedNode'
import {ConnectionHandles} from '@/components/node-elements/ConnectionHandles'
import {NodeHeader} from '@/components/node-elements/NodeHeader'
import {NodeDisplayMarkdown} from '@/components/node-elements/TextElements'
import {usePromptNode} from '@/hooks/node-actions/usePromptNode'
import {useStoreWithId} from '@/hooks/useStoreWithId'
import {
  NodeBackgroundStyle,
  nodeFooterButtonStyle,
  NodeForegroundStyle,
  pulsingText,
  textareaStyle,
  typeProps,
} from '@/lib/styles'
import {PromptNodeType} from '@/types'
import {Info} from 'lucide-react'
import useStore from "@/store";
import TextareaAutosize from 'react-textarea-autosize';

/**
 * Represents the possible states of the PromptNode.
 * - `loading`:        Waiting for a response from the AI.
 * - `hasResponse`:    Response received, node is closed.
 * - `sourceIsPrompt`: Connected to another PromptNode.
 * - `ready`:          Waiting for user input.
 */
type NodeState = 'loading' | 'hasResponse' | 'sourceIsPrompt' | 'ready'

const PromptNode = ({id, data}: NodeProps<PromptNodeType>) => {
  const updateNodeData = useStore((s) => s.updateNodeData)
  const {conPrompt} = useStoreWithId(id)
  const {run, isStreaming} = usePromptNode(id)

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
          <div className="flex flex-col flex-1 justify-between gap-5">
            <div className="chat chat-end">
              <div className="chat-bubble text-sm">{data.prompt}</div>
            </div>
            <div className="chat chat-start">
              <div className="chat-bubble text-sm">
                <span className={pulsingText}>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 justify-between gap-2">

          {nodeState === 'ready' && (
            <div className="chat chat-start">
              <div className="chat-bubble text-sm">How can i help you?</div>
            </div>
          )}

          {(nodeState === 'sourceIsPrompt' || nodeState === 'ready') && (
            <>
              <TextareaAutosize
                value={data.prompt}
                onChange={handleTextChange}
                className={textareaStyle}
                placeholder="Enter your prompt..."
              />
              <div className="flex justify-end pt-1">

                <button className={nodeFooterButtonStyle} onClick={() => null}>
                  Settings
                </button>

                <button
                  className={nodeFooterButtonStyle}
                  onClick={run}
                  disabled={!data.prompt || isStreaming}
                >
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
                <div className="chat-bubble text-sm">{data.prompt}</div>
              </div>
              <NodeDisplayMarkdown content={data.response} className="px-2"/>
            </div>

            {data.model.model && (
              <div className="flex justify-between items-center">
                <div className="badge badge-soft badge-secondary badge-xs">
                  <Info size={12}/> {data.model.model}
                </div>
                <button className={nodeFooterButtonStyle} onClick={conPrompt}>
                  Reply
                </button>
              </div>
            )}
          </>
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