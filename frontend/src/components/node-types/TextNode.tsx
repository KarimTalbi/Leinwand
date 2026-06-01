import React, {memo} from 'react'
import {NodeProps} from '@xyflow/react'

import AddConnectedNode from '@/components/node-elements/AddConnectedNode'
import {ConnectionHandles} from '@/components/node-elements/ConnectionHandles'
import {NodeHeader} from '@/components/node-elements/NodeHeader'
import {NodeDisplayMarkdown} from '@/components/node-elements/TextElements'
import {
  flowButtonStyle,
  NodeBackgroundStyle,
  NodeForegroundStyle,
  textareaStyle,
  textAreaWrapper,
  typeProps,
} from '@/lib/styles'
import useStore from '@/store'
import TextareaAutosize from 'react-textarea-autosize';
import {TextNodeType} from '@/types'
import {Pen, Save} from "lucide-react";
import {cn} from "@/lib/utils.ts";

type NodeState =
  | 'closed'
  | 'open'
  | 'empty';

const TextNode = ({id, data}: NodeProps<TextNodeType>) => {
  const updateNodeData = useStore((s) => s.updateNodeData)
  const syncCanvas = useStore((s) => s.syncCanvas)

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, {text: e.target.value})
  }

  const handleClick = () => {
    updateNodeData(id, {closed: !data.closed})
    void syncCanvas()
  }

  const getNodeState = (): NodeState => {
    if (data.text) {
      if (data.closed) return 'closed'
      return 'open'
    }
    return 'empty'
  }

  const nodeState = getNodeState()

  return (
    <div className={cn(NodeBackgroundStyle, "gap-1")}>

      <NodeHeader
        title="Note"
        id={id}
        color={typeProps.textNode.color}
        icon={typeProps.textNode.icon}
      />


      <div className={NodeForegroundStyle}>
        {(nodeState === 'empty' || nodeState === 'open') && (

          <div
            className={textAreaWrapper}>
            <TextareaAutosize
              value={data.text}
              onChange={handleTextChange}
              className={cn(textareaStyle)}
              placeholder="Start writing..."
            />
            <div className="flex justify-end items-center pr-2 pb-2">

              <div className="tooltip" data-tip="Save">
                <button
                  style={{background: typeProps.textNode.color}}
                  className={cn(flowButtonStyle, "btn-sm")}
                  onClick={handleClick}
                  disabled={!data.text}
                >
                  <Save size={16} color={"white"}></Save>
                </button>
              </div>
            </div>
          </div>

        )}

        {nodeState === 'closed' && (
          <NodeDisplayMarkdown content={data.text || ''} className="px-2"/>
        )}
      </div>

      {nodeState === 'closed' && (
        <div className="flex flex-row items-center justify-end w-full shrink-0 pl-2 py-1">
          <div className="tooltip" data-tip="Edit">
            <button className={flowButtonStyle} onClick={handleClick}>
              <Pen size={16} color={typeProps.textNode.color}></Pen>
            </button>
          </div>
        </div>
      )}

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
