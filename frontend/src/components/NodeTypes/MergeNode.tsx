import {memo, useState} from 'react';
import {NodeProps, useNodeConnections} from "@xyflow/react";


import useStore from '@/store.ts';
import {AppState, LLMConfig, MergeNodeType} from "@/types.ts";
import {
  NodeDisplayPulsingText,
  NodeTextarea, ChatBubble, NodeDisplayMarkdown
} from "@/components/NodeElements/TextElements.tsx";
import {NodeHeader} from "@/components/NodeElements/NodeHeader.tsx";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";
import {NodeBackgroundStyle, NodeForegroundStyle, nodeColors} from "@/lib/styles.ts";
import {MergeIcon} from "lucide-react";

const defaultLLMConfig = {
  model: 'gpt-5-mini',
  temperature: 0,
  max_tokens: 0,
  timeout: 0,
  max_retries: 0,
}

const DefaultScreen = (
  onSettings: () => void,
  onSend: () => void,
  sendDisabled: boolean,
) => {
  return (
    <div className="flex flex-col flex-1 justify-end chat chat-start nodrag select-text cursor-text">
      <div className="chat-bubble text-sm mx-3">
        Connect 2 Nodes and press "Merge" to merge their context
      </div>
      <div className="flex w-full items-center justify-end px-2 pt-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            className="btn btn-ghost btn-sm" onClick={onSettings}>
            Settings
          </button>
          <button
            className="btn btn-ghost btn-sm" onClick={onSend} disabled={sendDisabled}>
            Merge
          </button>
        </div>
      </div>
    </div>
  )
}

const DisplayLoadingScreen = () => (
  <div className="flex flex-col flex-1 justify-end chat chat-start nodrag select-text cursor-text">
    <div className="chat-bubble text-sm mx-3">
      <NodeDisplayPulsingText>
        Merging...
      </NodeDisplayPulsingText>
    </div>
  </div>
)

const DisplayMergeScreen = (problems?: string, context?: Record<string, string>[]) => {
  if (!problems) return (
    <ChatBubble position="left">
      Merging Successful! <br/>
      No Contradictions detected. <br/>
      This Node holds the context of both Streams.
    </ChatBubble>
  )
  if (!context) return null
  const lastItem = context[context.length - 1]
  const solution = lastItem?.solution
  return (
    <div>
    <ChatBubble position="left">
      Merging Successful! <br/>
      Contradictions solved!. <br/>
      This Node holds the context of both Streams.
    </ChatBubble>
      <ChatBubble position="left" maxHeight={false}>
        <NodeDisplayMarkdown content={solution}></NodeDisplayMarkdown>
      </ChatBubble>
    </div>
  )
}


const DisplayMergeProblemScreen = (
  id: string,
  onSend: () => void,
  sendDisabled: boolean,
  problems?: string,
  solution?: string,
) => (
  <div>
    <div className="flex flex-col flex-1 justify-between gap-5">
      <NodeDisplayMarkdown content={problems || ""} className="px-2"/>
      <NodeTextarea id={id} initialValue={solution} placeholder={'Enter your solution...'} dataKey="solution"/>
    </div>
    <div className="flex w-full items-center justify-end px-2 pt-2 shrink-0">
      <button
        className="btn btn-ghost btn-sm" onClick={onSend} disabled={sendDisabled}>
        Merge
      </button>
    </div>
  </div>
)

const selector = (state: AppState) => ({
  mergeNodeAction: state.mergeNodeAction,
  mergeNodeResolveAction: state.mergeNodeResolveAction,
});


const MergeNode = (
  {
    id,
    data,
  }: NodeProps<MergeNodeType>
) => {
  if (!data.config) data.config = defaultLLMConfig as LLMConfig

  const {mergeNodeAction, mergeNodeResolveAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const hasProblem = data.has_issues;

  const connections1 = useNodeConnections({handleId: "target-1", handleType: "target"});
  const connections2 = useNodeConnections({handleId: "target-2", handleType: "target"});
  const isConnected1 = connections1.length > 0;
  const isConnected2 = connections2.length > 0;

  const handleClick = () => {
    setLoading(true);
    if (hasProblem) {
      void mergeNodeResolveAction(id)
    } else {
      void mergeNodeAction(id)
    }
    setLoading(false);
  }

  const foreground = () => {
    if (!isClosed) return DefaultScreen(() => null, handleClick, loading || !isConnected1 || !isConnected2)
    if (hasProblem) return DisplayMergeProblemScreen(id, handleClick, loading || !data.solution, data.problems, data.solution)
    if (!!data.context) return DisplayMergeScreen(data.problems, data.context)
    return DisplayLoadingScreen()
  }

  return (
    <div className={NodeBackgroundStyle}>
      <NodeHeader
        title="Merge"
        color={nodeColors.mergeNode}
        id={id}
        loading={loading}
      >
        <MergeIcon className="rotate-90" size={14} color={nodeColors.mergeNode} strokeWidth={2.5}/>
      </NodeHeader>

      <div className={NodeForegroundStyle}>
        {foreground()}
      </div>

      <ConnectionHandles
        handleId="target-1"
        offset={-100}
        handleType="target"
        position="top"
        nodeId={id}
        color="#f5c45e"
      />

      <ConnectionHandles
        handleId="target-2"
        offset={100}
        handleType="target"
        position="top"
        nodeId={id}
        color="#f5c45e"
      />

      {!!data.context && (
      <ConnectionHandles
        handleId="source-1"
        handleType="source"
        position="bottom"
        nodeId={id}
        color="#f5c45e"
      >

        <AddConnectedNode sourceId={id}/>

      </ConnectionHandles>
      )}

    </div>

  )
};

export default memo(MergeNode);