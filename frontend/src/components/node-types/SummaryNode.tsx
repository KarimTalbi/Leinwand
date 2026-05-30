import React, {memo} from 'react'
import {NodeProps, useNodeConnections, useNodes} from '@xyflow/react'
import {Bot, CircleCheck, Info, Play, TriangleAlert} from 'lucide-react'

import AddConnectedNode from '@/components/node-elements/AddConnectedNode'
import {ConnectionHandles} from '@/components/node-elements/ConnectionHandles'
import {NodeHeader} from '@/components/node-elements/NodeHeader'
import {NodeDisplayMarkdown} from '@/components/node-elements/TextElements'
import {useSummaryNode} from '@/hooks/node-actions/useSummaryNode'
import {cn} from '@/lib/utils'
import {NodeBackgroundStyle, NodeForegroundStyle, nodeHeaderButtonStyle, typeProps} from '@/lib/styles'
import {SummaryNodeType} from '@/types'

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
      <div className="badge badge-soft badge-error px-2 gap-1">
        <Info size={12}/> Connection required
      </div>
    ),

    ready: (
      <div className="badge badge-soft badge-info px-2 gap-1">
        <CircleCheck size={12}/> Ready
      </div>
    ),

    sourceIsSummary: (
      <div className="badge badge-soft badge-error px-1 gap-1">
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


        {nodeState === 'loading' && (
          <div className={cn('flex w-full justify-center items-center p-1')}>
            <span className="loading loading-dots loading-lg"></span>
          </div>
        )}

        {(nodeState === 'streaming' || nodeState === 'hasResponse') && (
          <NodeDisplayMarkdown content={data.response}/>
        )}

      </div>

      <div className="flex flex-row items-center justify-between shrink-0 pl-2 py-1 w-full">

        {data.model.model && nodeState === 'hasResponse' && (
          <div className="flex flex-row justify-start items-center w-full">
            <div className="badge badge-soft badge-secondary">
              <Bot size={14}/> {data.model.model}
            </div>
          </div>
        )}

        {isIdle && (
          <div className="flex flex-row items-center justify-end w-full">
            <div className="tooltip" data-tip="Summarize">
              <button
                className={cn(nodeHeaderButtonStyle, "bg-[#bf4546] disabled:opacity-30")}
                onClick={run}
                disabled={isDisabled}
              >
                <Play size={16} color="white"></Play>
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