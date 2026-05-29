import {memo, useLayoutEffect} from 'react'
import {NodeProps} from '@xyflow/react'
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
  textareaStyle,
  typeProps,
} from '@/lib/styles'
import useStore from '@/store'
import {TextNodeType} from '@/types'


/**
 * Represents the possible states of the TextNode.
 * - `closed`: The node has content and is in a read-only state.
 * - `open`: The node has content and is in an editable state.
 * - `empty`: The node has no content and is in an editable state.
 */
type NodeState =
  | 'closed'
  | 'open'
  | 'empty';

/**
 * A simple node for adding and displaying text or notes.
 * The node can be in an "open" state for editing or a "closed" state for display.
 * It provides input and output handles to be integrated into a flow.
 *
 * @param props - The properties of the node, provided by React Flow.
 * @param props.id - The unique ID of the node.
 * @param props.data - The data associated with the node, such as its text content.
 * @returns The TextNode component.
 */
const TextNode = ({id, data}: NodeProps<TextNodeType>) => {
  const {updateNodeData} = useStore(useShallow((s) => ({updateNodeData: s.updateNodeData})))

  const {localText, handleTextChange, textareaRef} = useTextarea(
    data.text || '',
    (value) => updateNodeData(id, {text: value}),
  )


  const handleClick = () => {
    updateNodeData(id, {closed: !data.closed})
  }

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [localText, handleClick])

  const getNodeState = (): NodeState => {
    if (data.text) {
      if (data.closed) return 'closed'
      return 'open'
    }
    return 'empty'
  }

  const nodeState = getNodeState()

  return (
    <div className={NodeBackgroundStyle}>

      <NodeHeader
        title="Note"
        id={id}
        color={typeProps.textNode.color}
        icon={typeProps.textNode.icon}
      />


      <div className={NodeForegroundStyle}>
        {(nodeState === 'empty' || nodeState === 'open') && (
          <>
            <textarea
              ref={textareaRef}
              value={localText}
              onChange={handleTextChange}
              className={textareaStyle}
              placeholder="Enter your note..."
            />

            <div className="flex justify-end pt-1">

              <button
                className={nodeFooterButtonStyle}
                onClick={handleClick}
                disabled={nodeState === 'empty'}
              >
                Save
              </button>

            </div>
          </>
        )}

        {nodeState === 'closed' && (
          <>

            <NodeDisplayMarkdown content={data.text || ''} className="px-2"/>

            <div className="flex justify-end pt-1">

              <button
                className={nodeFooterButtonStyle}
                onClick={handleClick}
                disabled={!data.text}
              >
                Edit
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
        color={typeProps.textNode.color}
      />

      {nodeState !== 'empty' && (
        <ConnectionHandles
          handleId="source-1"
          handleType="source"
          position="bottom"
          nodeId={id}
          color={typeProps.textNode.color}
        >
          <AddConnectedNode sourceId={id}/>
        </ConnectionHandles>
      )}

    </div>

  )
}

export default memo(TextNode)
