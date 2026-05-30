import React, {memo} from 'react'
import {NodeProps, useNodeConnections, useNodes} from '@xyflow/react'
import {Info, TriangleAlert} from 'lucide-react'

import AddConnectedNode from '@/components/node-elements/AddConnectedNode'
import {ConnectionHandles} from '@/components/node-elements/ConnectionHandles'
import {NodeHeader} from '@/components/node-elements/NodeHeader'
import {NodeDisplayMarkdown} from '@/components/node-elements/TextElements'
import {useSummaryNode} from '@/hooks/node-actions/useSummaryNode'
import {cn} from '@/lib/utils'
import {NodeBackgroundStyle, nodeFooterButtonStyle, NodeForegroundStyle, pulsingText, typeProps} from '@/lib/styles'
import {SummaryNodeType} from '@/types'

/**
 * Represents the possible states of the SummaryNode.
 * - `loading`:          Waiting for the first streaming chunk.
 * - `streaming`:        Actively receiving and displaying streamed content.
 * - `hasResponse`:      Summary complete.
 * - `sourceIsSummary`:  Connected to another SummaryNode — invalid.
 * - `ready`:            Connected and ready to summarize.
 * - `needs_connection`: Not connected to any source.
 */
type NodeState =
  | 'loading'
  | 'streaming'
  | 'hasResponse'
  | 'sourceIsSummary'
  | 'ready'
  | 'needs_connection'

const SummaryNode = ({id, data}: NodeProps<SummaryNodeType>) => {
  const {run, isStreaming} = useSummaryNode(id)

  const nodes = useNodes()
  const connections = useNodeConnections({handleId: 'target-1', handleType: 'target'})
  const isConnected = connections.length > 0
  const isSourceSummary = isConnected
    ? nodes.find((n) => n.id === connections[0].source)?.type === 'summaryNode'
    : false

  const getNodeState = (): NodeState => {
    if (isStreaming && !data.response) return 'loading'
    if (isStreaming && data.response) return 'streaming'
    if (data.closed) return 'hasResponse'
    if (isSourceSummary) return 'sourceIsSummary'
    if (!isConnected) return 'needs_connection'
    return 'ready'
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

  const isIdle = nodeState === 'ready' || nodeState === 'needs_connection' || nodeState === 'sourceIsSummary'
  const isDisabled = nodeState === 'sourceIsSummary' || nodeState === 'needs_connection' || isStreaming

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

        {isIdle && (
          <div className="flex justify-end pt-1">
            <button className={nodeFooterButtonStyle} onClick={() => null}>
              Settings
            </button>
            <button
              className={nodeFooterButtonStyle}
              onClick={run}
              disabled={isDisabled}
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

        {(nodeState === 'streaming' || nodeState === 'hasResponse') && (
          <>
            <NodeDisplayMarkdown content={data.response} className="px-2 pb-2"/>
            {data.model.model && (
              <div className="flex justify-start items-center">
                <div className="badge badge-soft badge-secondary badge-xs">
                  <Info size={12}/> {data.model.model}
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

      {nodeState === 'hasResponse' && (
        <ConnectionHandles
          handleId="source-1"
          handleType="source"
          position="bottom"
          nodeId={id}
          color="#bf4546"
        >
          <AddConnectedNode sourceId={id}/>
        </ConnectionHandles>
      )}

    </div>
  )
}

export default memo(SummaryNode)