import React, {memo, useLayoutEffect, useState} from 'react'
import {NodeProps, useEdges, useNodeConnections, useNodes, useReactFlow} from '@xyflow/react'
import {useShallow} from 'zustand/react/shallow'
import {CircleCheck, Info, TriangleAlert} from 'lucide-react'

import AddConnectedNode from '@/components/NodeElements/AddConnectedNode'
import {ConnectionHandles} from '@/components/NodeElements/ConnectionHandles'
import MergeContent from '@/components/NodeElements/MergeSections'
import {NodeHeader} from '@/components/NodeElements/NodeHeader'
import {NodeDisplayMarkdown} from '@/components/NodeElements/TextElements'
import {useTextarea} from '@/hooks/useTextarea'
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
import {AppState, MergeNodeType} from '@/types'

/**
 * Represents the possible states of the MergeNode, which dictate its UI and available actions.
 * - `needs_connections`: The node is missing one or both input connections.
 * - `ready`: The node has both input connections and is ready to perform a merge.
 * - `loading`: The node is currently processing a merge or resolution.
 * - `pending_merge`: (Not currently used) A state for when a merge is queued.
 * - `has_problem`: The merge operation completed and found inconsistencies.
 * - `merged`: The merge completed successfully with no issues.
 * - `solved`: An issue was found, and a resolution has been provided and applied.
 */
type NodeState =
  | 'needs_connections'
  | 'ready'
  | 'loading'
  | 'pending_merge'
  | 'has_problem'
  | 'merged'
  | 'solved';

/**
 * Zustand selector for picking state and actions from the store.
 * This selector is optimized with `useShallow` to prevent unnecessary re-renders.
 *
 * @param state - The global application state.
 * @returns An object containing the selected state and actions.
 */
const selector = (state: AppState) => ({
  mergeNodeAction: state.mergeNodeAction,
  mergeNodeResolveAction: state.mergeNodeResolveAction,
  updateNodeData: state.updateNodeData,
})

/**
 * A specialized node for merging two branches of a conversation flow.
 * It requires two input connections. It can check for inconsistencies between the branches,
 * display them, and allow the user to provide a resolution. Once merged or solved,
 * it provides a single output handle to continue the flow.
 *
 * @param props - The properties of the node, provided by React Flow.
 * @param props.id - The unique ID of the node.
 * @param props.data - The data associated with the node, such as its state and content.
 * @returns The MergeNode component.
 */
const MergeNode = ({id, data}: NodeProps<MergeNodeType>) => {
  const {setCenter} = useReactFlow()
  const {mergeNodeAction, mergeNodeResolveAction, updateNodeData} = useStore(useShallow((selector)))
  const [loading, setLoading] = useState(false)
  const [checkStreams, setCheckStreams] = useState(true)
  const {localText, handleTextChange, textareaRef} = useTextarea(
    data.solution || '',
    (value) => updateNodeData(id, {solution: value}),
  )

  const isClosed = data.closed
  const hasProblem = data.has_issues

  const connections1 = useNodeConnections({handleId: 'target-1', handleType: 'target'})
  const connections2 = useNodeConnections({handleId: 'target-2', handleType: 'target'})
  const isConnected1 = connections1.length > 0
  const isConnected2 = connections2.length > 0
  const nodes = useNodes()
  const edges = useEdges()

  const getNodeState = (): NodeState => {
    if (!loading) {
      if (isClosed && data.solution) return 'solved'
      if (isClosed && !data.solution) return 'merged'
      if (!isClosed && hasProblem) return 'has_problem'
      if (isConnected1 && isConnected2) return 'ready'
      return 'needs_connections'
    }
    return 'loading'
  }

  const nodeState = getNodeState()

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [localText])

  const missingConnections = 2 - (connections1.length + connections2.length)

  const getNodeForHandle = (handleId: string) => {
    const edge = edges.find(e => e.target === id && e.targetHandle === handleId)
    if (!edge) return null
    return nodes.find(n => n.id === edge.source) ?? null
  }

  const goToNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    void setCenter(
      node.position.x + (node.measured?.width ?? 200) / 2,
      node.position.y + (node.measured?.height ?? 100) / 2,
      {zoom: 1, duration: 500},
    )
  }

  const handleMerge = async () => {
    const node1 = getNodeForHandle('target-1')
    const node2 = getNodeForHandle('target-2')
    if (!node1 || !node2) return
    setLoading(true)
    try {
      await mergeNodeAction(id, node1.id, node2.id, checkStreams)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    setLoading(true)
    try {
      await mergeNodeResolveAction(id)
    } finally {
      setLoading(false)
    }
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

              <NodeDisplayMarkdown content={'Check streams for inconsistencies'}/>

              <input
                type="checkbox"
                checked={checkStreams}
                onChange={(e) => setCheckStreams(e.target.checked)}
                className="toggle toggle-xs w-8 h-5 border rounded-full"
              />

            </div>

            <div className="flex justify-end w-full items-center gap-1.5 px-2 pt-2">
              <button className={nodeFooterButtonStyle} onClick={() => null}>Settings</button>
              <button className={nodeFooterButtonStyle} onClick={handleMerge}
                      disabled={nodeState === 'needs_connections'}>Merge
              </button>
            </div>

          </div>
        )}

        {nodeState === 'has_problem' && (
          <div>
            <div className="flex flex-col flex-1 justify-between gap-5">
              <NodeDisplayMarkdown content={data.problems || ''} className="px-2"/>

              <textarea
                ref={textareaRef}
                value={localText}
                onChange={handleTextChange}
                className={cn(textareaStyle, 'min-h-0')}
                placeholder="Enter your prompt..."
              />

            </div>

            <div className="flex justify-end w-full items-center px-2 pt-2 shrink-0">
              <button className={nodeFooterButtonStyle} onClick={handleResolve} disabled={!data.solution}>
                Solve
              </button>
            </div>

          </div>
        )}

        {(nodeState === 'merged' || nodeState === 'solved') && (
          <MergeContent sections={data.context ?? []} onGoToNode={goToNode}/>
        )}

      </div>

      {!isClosed && (
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
