import React, {memo, useState} from 'react'
import {NodeProps, useEdges, useNodeConnections, useNodes, useReactFlow} from '@xyflow/react'
import {ArrowUp, Bot, CircleCheck, Info, Play, TriangleAlert} from 'lucide-react'

import AddConnectedNode from '@/components/node-elements/AddConnectedNode'
import {ConnectionHandles} from '@/components/node-elements/ConnectionHandles'
import MergeContent from '@/components/node-elements/MergeSections'
import {NodeHeader} from '@/components/node-elements/NodeHeader'
import {NodeDisplayMarkdown} from '@/components/node-elements/TextElements'
import {useMergeNode} from '@/hooks/node-actions/useMergeNode'
import {cn} from '@/lib/utils'
import {NodeBackgroundStyle, NodeForegroundStyle, nodeHeaderButtonStyle, textareaStyle, typeProps,} from '@/lib/styles'
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
      <div className="badge badge-soft badge-error px-2 gap-1">
        <Info size={12}/> {missingConnections} more connection(s) required
      </div>
    ),
    ready: (
      <div className="badge badge-soft badge-warning px-2 gap-1">
        <CircleCheck size={12}/> Ready
      </div>
    ),
    merged: (
      <div className="badge badge-soft badge-info px-2 gap-1">
        <CircleCheck size={12}/> No issues detected
      </div>
    ),
    has_problem: (
      <div className="badge badge-soft badge-error px-1 gap-1">
        <TriangleAlert size={12}/> Issue detected
      </div>
    ),
    solved: (
      <div className="badge badge-soft badge-success px-1 gap-1">
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
          <div className={cn('flex w-full justify-center items-center p-1')}>
            <span className="loading loading-dots loading-lg"></span>
          </div>
        )}

        {nodeState === 'has_problem' && (
          <div>
            <div className="flex flex-col flex-1 justify-between gap-5">
              <NodeDisplayMarkdown content={data.problems || ''} className="px-2"/>

              <div
                className="bg-neutral-50 ring-2 ring-neutral-200 rounded-2xl mb-1 shadow-sm hover:ring-neutral-300">
                <TextareaAutosize
                  value={data.solution}
                  onChange={handleTextChange}
                  className={cn(textareaStyle)}
                  placeholder="Enter your prompt..."
                />
                <div className="flex justify-end items-center pr-2 pb-2">

                  <div className="tooltip" data-tip="Send">
                    <button
                      className={cn("btn btn-ghost bg-[#f5c45e] btn-sm btn-circle disabled:opacity-30 transition-opacity")}
                      onClick={resolve}
                      disabled={!data.solution}
                    >
                      <ArrowUp size={14} color={"white"}></ArrowUp>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {(nodeState === 'merged' || nodeState === 'solved') && (
          <MergeContent sections={data.context ?? []} onGoToNode={goToNode}/>
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

        {(nodeState === 'ready' || nodeState === 'needs_connections') && (
          <div className="flex flex-row items-center justify-between w-full">

            <div className="flex flex-row items-center gap-2">
              <p className="text-sm font-semibold text-neutral-600">Check for inconsistencies</p>
              <input
                type="checkbox"
                checked={checkStreams}
                onChange={(e) => setCheckStreams(e.target.checked)}
                className="toggle toggle-xs w-8 h-5 border rounded-full text-[#f5c45e]"
              />
            </div>

            <div className="tooltip" data-tip="Summarize">
              <button
                className={cn(nodeHeaderButtonStyle, "bg-[#f5c45e] disabled:opacity-30")}
                onClick={handleMerge}
                disabled={!isConnected1 || !isConnected2}
              >
                <Play size={16} color="white"></Play>
              </button>
            </div>

          </div>
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