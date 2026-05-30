import React, {memo, useState} from 'react'
import {NodeProps, useNodeConnections, useNodes} from '@xyflow/react'
import {useShallow} from 'zustand/react/shallow'
import {Info, TriangleAlert} from 'lucide-react'

import AddConnectedNode from '@/components/NodeElements/AddConnectedNode'
import {ConnectionHandles} from '@/components/NodeElements/ConnectionHandles'
import {NodeHeader} from '@/components/NodeElements/NodeHeader'
import {NodeDisplayMarkdown} from '@/components/NodeElements/TextElements'
import {cn} from '@/lib/utils'
import {NodeBackgroundStyle, nodeFooterButtonStyle, NodeForegroundStyle, pulsingText, typeProps,} from '@/lib/styles'
import useStore from '@/store'
import {SummaryNodeType} from '@/types'

/**
 * Represents the possible states of the SummaryNode.
 * - `loading`: The node is currently generating a summary.
 * - `hasResponse`: The node has successfully generated and is displaying a summary.
 * - `sourceIsSummary`: The node is connected to another SummaryNode, which is an invalid state.
 * - `ready`: The node is connected and ready to generate a summary.
 * - `needs_connection`: The node is not connected to any source.
 */
type NodeState =
  | 'loading'
  | 'hasResponse'
  | 'sourceIsSummary'
  | 'ready'
  | 'needs_connection';

/**
 * A node designed to summarize the content from its preceding nodes.
 * It requires a connection to at least one other node to function. It cannot be
 * connected to another SummaryNode. Once triggered, it generates a summary
 * and displays it, providing an output handle to continue the flow.
 *
 * @param props - The properties of the node, provided by React Flow.
 * @param props.id - The unique ID of the node.
 * @param props.data - The data associated with the node, such as its response.
 * @returns The SummaryNode component.
 */
const SummaryNode = ({id, data}: NodeProps<SummaryNodeType>) => {
  const {summaryNodeAction} = useStore(useShallow((s) => ({
    summaryNodeAction: s.summaryNodeAction,
  })))

  const [loading, setLoading] = useState(false)
  const isClosed = data.closed
  const nodes = useNodes()

  const connections = useNodeConnections({handleId: 'target-1', handleType: 'target'})
  const isConnected = connections.length > 0
  const isSourceSummary = isConnected
    ? nodes.find(n => n.id === connections[0].source)?.type === 'summaryNode'
    : false

  const handleClick = async () => {
    setLoading(true)
    try {
      await summaryNodeAction(id)
    } finally {
      setLoading(false)
    }
  }

  const getNodeState = (): NodeState => {
    if (!isClosed) {
      if (loading) return 'loading'
      if (isSourceSummary) return 'sourceIsSummary'
      if (!isConnected) return 'needs_connection'
      return 'ready'
    }
    return 'hasResponse'
  }

  const nodeState = getNodeState()

  const BADGES: Partial<Record<NodeState, React.ReactNode>> = {
    needs_connection: (
      <div className="badge badge-soft badge-error badge-xs px-2 gap-1 mb-1">
        <Info size={12}/> Connection required
      </div>
    ),

    sourceIsSummary: (
      <div className="badge badge-soft badge-error badge-xs px-1 gap-1 mb-1">
        <TriangleAlert size={12}/> Source can't be a summary
      </div>
    ),
  }

  return (
    <div className={NodeBackgroundStyle}>
      <NodeHeader
        title="Summary"
        color={typeProps.summaryNode.color}
        id={id}
        icon={typeProps.summaryNode.icon}
      >


        {BADGES[nodeState]}


      </NodeHeader>

      <div className={NodeForegroundStyle}>

        {(nodeState === 'ready' || nodeState === 'needs_connection' || nodeState === 'sourceIsSummary') && (

          <div className="flex justify-end pt-1">

            <button
              className={nodeFooterButtonStyle} onClick={() => null}>
              Settings
            </button>

            <button
              className={nodeFooterButtonStyle}
              onClick={handleClick}
              disabled={nodeState === 'sourceIsSummary' || nodeState === 'needs_connection'}
            >
              Summarize
            </button>

          </div>
        )}

        {nodeState === 'loading' && (

          <div className={cn(pulsingText, 'flex flex-col w-full justify-center items-center h-15')}>
            <span>generating summary...</span>
          </div>

        )}

        {nodeState === 'hasResponse' && (
          <>
            <NodeDisplayMarkdown content={data.response} className="px-2 pb-2"/>
            {data.model.model && (
              <div className="flex justify-start items-center">
                <div className="badge badge-soft badge-secondary badge-xs">
                  <Info size={12}/>
                  {data.model.model}
                </div>
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
        color="#bf4546"
      />

      {
        nodeState === 'hasResponse' && (
          <ConnectionHandles
            handleId="source-1"
            handleType="source"
            position="bottom"
            nodeId={id}
            color="#bf4546"
          >

            <AddConnectedNode sourceId={id}/>

          </ConnectionHandles>
        )
      }

    </div>

  )
}

export default memo(SummaryNode)
