import {memo, useLayoutEffect, useState} from 'react'
import {NodeProps, useNodeConnections, useNodes} from '@xyflow/react'
import {useShallow} from 'zustand/react/shallow'

import AddConnectedNode from '@/components/NodeElements/AddConnectedNode'
import {ConnectionHandles} from '@/components/NodeElements/ConnectionHandles'
import {NodeHeader} from '@/components/NodeElements/NodeHeader'
import {NodeDisplayMarkdown} from '@/components/NodeElements/TextElements'
import {useTextarea} from '@/hooks/useTextarea'
import {
  NodeBackgroundStyle,
  nodeFooterButtonStyle,
  NodeForegroundStyle,
  pulsingText,
  textareaStyle,
  typeProps,
} from '@/lib/styles'
import useStore from '@/store'
import {PromptNodeType} from '@/types'

/**
 * Represents the possible states of the PromptNode, which dictate its UI and available actions.
 * - `loading`: The node is currently waiting for a response from the AI.
 * - `hasResponse`: The node has received a response and is in a "closed" state.
 * - `sourceIsPrompt`: The node is connected to another PromptNode, altering its initial display.
 * - `ready`: The node is ready to accept user input.
 */
type NodeState =
  | 'loading'
  | 'hasResponse'
  | 'sourceIsPrompt'
  | 'ready';


/**
 * A node that facilitates interaction with an AI model.
 * It allows users to input a prompt, sends it to the AI, and displays the response.
 * The node's state and appearance change based on whether it's awaiting input,
 * processing, or displaying a response.
 *
 * @param props - The properties of the node, provided by React Flow.
 * @param props.id - The unique ID of the node.
 * @param props.data - The data associated with the node, such as its prompt and response.
 * @returns The PromptNode component.
 */
const PromptNode = (
  {
    id,
    data,
  }: NodeProps<PromptNodeType>,
) => {

  const {promptNodeAction, updateNodeData} = useStore(useShallow((s) => ({
    promptNodeAction: s.promptNodeAction,
    updateNodeData: s.updateNodeData,
  })))

  const {localText, handleTextChange, textareaRef} = useTextarea(
    data.prompt || '',
    (value) => updateNodeData(id, {prompt: value}),
  )


  const handleClick = async () => {
    setLoading(true)
    try {
      await promptNodeAction(id)
    } finally {
      setLoading(false)
    }
  }

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [localText])

  const [loading, setLoading] = useState(false)
  const isClosed = data.closed
  const nodes = useNodes()

  const connections = useNodeConnections({handleId: 'target-1', handleType: 'target'})
  const isConnected = connections.length > 0
  const isSourcePrompt = isConnected
    ? nodes.find(n => n.id === connections[0].source)?.type === 'promptNode'
    : false

  const getNodeState = (): NodeState => {
    if (!isClosed) {
      if (loading) return 'loading'
      if (isConnected && isSourcePrompt) return 'sourceIsPrompt'
      return 'ready'
    }
    return 'hasResponse'
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
              <div className="chat-bubble text-sm">
                {data.prompt}
              </div>
            </div>

            <div className="chat chat-start">
              <div className="chat-bubble text-sm">
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
                className={textareaStyle}
                placeholder="Enter your prompt..."
              />

              <div className="flex justify-end pt-1">

                <button
                  className={nodeFooterButtonStyle} onClick={() => null}>
                  Settings
                </button>

                <button
                  className={nodeFooterButtonStyle} onClick={handleClick} disabled={!data.prompt || loading}>
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
