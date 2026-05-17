import {memo, useState} from 'react';
import {NodeProps, useNodeConnections, useNodes} from "@xyflow/react";

import useStore from '../../store.ts';
import {AppState, SummaryNodeType} from "@/types.ts";
import {NodeDisplayText, NodeDisplayThinking} from "@/components/NodeElements/TextElements.tsx";
import {DeleteButton, NodeBackground, NodeForeground, NodeHeader} from "@/components/NodeElements/NodeElements.tsx";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {Minimize2, Play, Settings2} from "lucide-react";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import {ToolTip} from "@/components/Buttons/ToolTip.tsx";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";

const selector = (state: AppState) => ({
  summaryNodeAction: state.summaryNodeAction,
});


const SummaryNode = (
  {
    id,
    data,
    positionAbsoluteX,
    positionAbsoluteY,
  }: NodeProps<SummaryNodeType>
) => {

  const {summaryNodeAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const nodes = useNodes();

  const connections = useNodeConnections({handleId: "target-1", handleType: "target"});
  const isConnected = connections.length > 0;
  const isSourceSummary = isConnected
    ? nodes.find(n => n.id === connections[0].source)?.type === 'summaryNode'
    : false;

  const handleClick = () => {
    setLoading(true);
    void summaryNodeAction(id);
    setLoading(false);
  }

  return (
    <NodeBackground className="bg-[#bf4546] border-[#bf4546] w-130 min-h-100">
      <NodeHeader title="Summary Node" icon={<Minimize2 className="rotate-45" size={14} color="white"/>}>

        <ToolTip position="top" label="Settings">
          <CustomButton
            onClick={() => null}
            buttonStyle="circle"
            disabled={loading}
            size="xs"
            color="ghost"
            className="text-white hover:border-none hover:bg-transparent hover:shadow-none"
          >
            <Settings2 size={16}/>
          </CustomButton>
        </ToolTip>

        <ToolTip position="top" label="Get Summary">
          <CustomButton
            onClick={handleClick}
            buttonStyle="circle"
            disabled={loading || isClosed || isSourceSummary || !isConnected}
            size="xs"
            color="ghost"
            className="text-white hover:border-none hover:bg-transparent hover:shadow-none"
          >
            <Play size={16}/>
          </CustomButton>
        </ToolTip>

        <ToolTip position="top" label="Delete Node">
          <DeleteButton id={id} loading={loading}/>
        </ToolTip>

      </NodeHeader>

      <NodeForeground>

        {
          isClosed
            ? !!data.response

              ? <div className="flex flex-col h-full justify-between">
                <NodeDisplayText>{data.response}</NodeDisplayText>
              </div>
              : <NodeDisplayThinking/>

            : <div className="flex flex-col h-full justify-center items-center">
              <p className="text-sm font-bold mb-15">Connect Node and press Play to get a summary</p>
            </div>
        }

      </NodeForeground>

      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="top"
        nodeId={id}
      />

      <ConnectionHandles
        handleId="source-1"
        handleType="source"
        position="bottom"
        nodeId={id}
      >

        <AddConnectedNode sourceId={id} posX={positionAbsoluteX} posY={positionAbsoluteY}/>

      </ConnectionHandles>

    </NodeBackground>

  )
};

export default memo(SummaryNode);