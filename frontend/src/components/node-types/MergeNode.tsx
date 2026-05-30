import React, {memo, useState} from 'react'
import {NodeProps, useEdges, useNodeConnections, useNodes, useReactFlow} from '@xyflow/react'
import {CircleCheck, Info, TriangleAlert} from 'lucide-react'

import AddConnectedNode from '@/components/node-elements/AddConnectedNode'
import {ConnectionHandles} from '@/components/node-elements/ConnectionHandles'
import MergeContent from '@/components/node-elements/MergeSections'
import {NodeHeader} from '@/components/node-elements/NodeHeader'
import {NodeDisplayMarkdown} from '@/components/node-elements/TextElements'
import {useMergeNode} from '@/hooks/node-actions/useMergeNode'
import {cn} from '@/lib/utils'
import {
  NodeBackgroundStyle,
  nodeFooterButtonStyle,
  NodeForegroundStyle,
  pulsingText,
  textareaStyle,
  typeProps,
} from '@/lib/styles'
import useStore from '@/store'
import TextareaAutosize from 'react-textarea-autosize';
import {MergeNodeType} from '@/types'

/**
 * Represents the possible states of the MergeNode.
 * - `needs_connections`: Missing one or both input connections.
 * - `ready`:             Both inputs connected, ready to merge.
 * - `loading`:           Processing a merge or resolution.
 * - `has_problem`:       Merge completed, inconsistencies found.
 * - `merged`:            Merge completed, no issues.
 * - `solved`:            Issue found and resolved.
 */
type NodeState =
  | 'needs_connections'
  | 'ready'
  | 'loading'
  | 'has_problem'
  | 'merged'
  | 'solved'

const MergeNode = ({id, data}: NodeProps<MergeNodeType>) => {
  const {setCenter} = useReactFlow()
  const updateNodeData = useStore((s) => s.updateNodeData)
  const {run, resolve, isLoading} = useMergeNode(id)

  const [checkStreams, setCheckStreams] = useState(true)

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, {solution: e.target.value})
  }

  const connections1 = useNodeConnections({handleId: 'target-1', handleType: 'target'})
  const connections2 = useNodeConnections({handleId: 'target-2', handleType: 'target'})
  const isConnected1 = connections1.length > 0
  const isConnected2 = connections2.length > 0
  const nodes = useNodes()
  const edges = useEdges()

  const getNodeState = (): NodeState => {
    if (isLoading) return 'loading'
    if (data.closed && data.solution) return 'solved'
    if (data.closed && !data.solution) return 'merged'
    if (!data.closed && data.has_issues) return 'has_problem'
    if (isConnected1 && isConnected2) return 'ready'
    return 'needs_connections'
  }

  const nodeState = getNodeState()

  const missingConnections = 2 - (connections1.length + connections2.length)

  const getNodeForHandle = (handleId: string) => {
    const edge = edges.find((e) => e.target === id && e.targetHandle === handleId)
    if (!edge) return null
    return nodes.find((n) => n.id === edge.source) ?? null
  }

  const goToNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    void setCenter(
      node.position.x + (node.measured?.width ?? 200) / 2,
      node.position.y + (node.measured?.height ?? 100) / 2,
      {zoom: 1, duration: 500},
    )
  }

  const handleMerge = () => {
    const node1 = getNodeForHandle('target-1')
    const node2 = getNodeForHandle('target-2')
    if (!node1 || !node2) return
    void run(node1.id, node2.id, checkStreams)
  }

  const BADGES: Partial<Record<NodeState, React.ReactNode>> = {
    needs_connections: (
      <div className="badge badge-soft badge-error badge-xs px-2 gap-1 mb-1">
        <Info size={12}/> {missingConnections} more connection(s) required
      </div>
    ),
    ready: (
      <div className="badge badge-soft badge-warning badge-xs px-2 gap-1 mb-1">
        <CircleCheck size={12}/> Ready
      </div>
    ),
    merged: (
      <div className="badge badge-soft badge-info badge-xs px-2 gap-1 mb-1">
        <CircleCheck size={12}/> No issues detected
      </div>
    ),
    has_problem: (
      <div className="badge badge-soft badge-error badge-xs px-1 gap-1 mb-1">
        <TriangleAlert size={12}/> Issue detected
      </div>
    ),
    solved: (
      <div className="badge badge-soft badge-success badge-xs px-1 gap-1 mb-1">
        <CircleCheck size={12}/> All issues solved
      </div>
    ),
  }

  return (
    <div className={NodeBackgroundStyle}>

      <NodeHeader
        title="Merge"
        color={typeProps.mergeNode.color}
        id={id}
        icon={typeProps.mergeNode.icon}
      >
        {BADGES[nodeState]}
      </NodeHeader>

      <div className={NodeForegroundStyle}>

        {nodeState === 'loading' && (
          <div className={cn(pulsingText, 'flex flex-col w-full justify-center items-center h-15')}>
            <span>Merging...</span>
          </div>
        )}

        {(nodeState === 'ready' || nodeState === 'needs_connections') && (
          <div className="flex flex-col flex-1 nodrag select-text cursor-text">
            <div className="flex justify-between items-center px-10 py-2">
              <NodeDisplayMarkdown content="Check streams for inconsistencies"/>
              <input
                type="checkbox"
                checked={checkStreams}
                onChange={(e) => setCheckStreams(e.target.checked)}
                className="toggle toggle-xs w-8 h-5 border rounded-full"
              />
            </div>
            <div className="flex justify-end w-full items-center gap-1.5 px-2 pt-2">
              <button className={nodeFooterButtonStyle} onClick={() => null}>
                Settings
              </button>
              <button
                className={nodeFooterButtonStyle}
                onClick={handleMerge}
                disabled={nodeState === 'needs_connections'}
              >
                Merge
              </button>
            </div>
          </div>
        )}

        {nodeState === 'has_problem' && (
          <div>
            <div className="flex flex-col flex-1 justify-between gap-5">
              <NodeDisplayMarkdown content={data.problems || ''} className="px-2"/>
              <TextareaAutosize
                value={data.solution}
                onChange={handleTextChange}
                className={textareaStyle}
                placeholder="Enter response..."
              />
            </div>
            <div className="flex justify-end w-full items-center px-2 pt-2 shrink-0">

              <button
                className={nodeFooterButtonStyle}
                onClick={() => void resolve()}
                disabled={!data.solution}
              >
                Solve
              </button>
            </div>
          </div>
        )}

        {(nodeState === 'merged' || nodeState === 'solved') && (
          <>
            <MergeContent sections={data.context ?? []} onGoToNode={goToNode}/>
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

      {!data.closed && (
        <div>
          <ConnectionHandles handleId="target-1" offset={-100} handleType="target" position="top" nodeId={id}
                             color="#f5c45e"/>
          <ConnectionHandles handleId="target-2" offset={100} handleType="target" position="top" nodeId={id}
                             color="#f5c45e"/>
        </div>
      )}

      {(nodeState === 'merged' || nodeState === 'solved') && (
        <ConnectionHandles handleId="source-1" handleType="source" position="bottom" nodeId={id} color="#f5c45e">
          <AddConnectedNode sourceId={id}/>
        </ConnectionHandles>
      )}

    </div>
  )
}

export default memo(MergeNode)