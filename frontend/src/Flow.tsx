import {useShallow} from 'zustand/react/shallow'
import {ReactFlow, Background, NodeTypes, MiniMap, Node, Panel} from '@xyflow/react';

import PromptNode from '@/components/NodeTypes/PromptNode.tsx';
import TextNode from '@/components/NodeTypes/TextNode.tsx';
import MergeNode from '@/components/NodeTypes/MergeNode.tsx';
import SummaryNode from '@/components/NodeTypes/SummaryNode.tsx';

import useStore from '@/store';
import {AppState} from '@/types'

import '@xyflow/react/dist/style.css';
import {NavBar} from "@/components/Navigation/NavBar.tsx";
import {AddNodeButton} from "@/components/Buttons/AddNodeButton.tsx";


const nodeTypes: NodeTypes = {
  promptNode: PromptNode,
  textNode: TextNode,
  mergeNode: MergeNode,
  summaryNode: SummaryNode,
};


const nodeColors = {
  promptNode: '#ec4899',
  textNode: '#309898',
  mergeNode: '#f5c45e',
  summaryNode: '#bf4546',
};


const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  locked: state.locked,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  addNode: state.addNode,
  setLocked: state.setLocked,
});


function Flow() {


  const {
    nodes,
    edges,
    locked,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(
    useShallow(selector)
  );


  const nodeColor = (node: Node) => {
    switch (node.type) {
      case 'promptNode':
        return nodeColors.promptNode;
      case 'textNode':
        return nodeColors.textNode;
      case 'mergeNode':
        return nodeColors.mergeNode;
      case 'summaryNode':
        return nodeColors.summaryNode;
      default:
        return 'gray';
    }
  };


  return (

    <div className="flex h-screen w-screen overflow-hidden">



      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        snapToGrid={true}
        snapGrid={[20, 20]}
        defaultEdgeOptions={{style: {strokeWidth: 6}}}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={!locked}
        nodesConnectable={!locked}
        elementsSelectable={!locked}
        proOptions={{hideAttribution: true}}
        colorMode="light"
      >

        <NavBar/>


        <Background
          className="bg-white!"
          size={4}
          gap={60}
        />

        <MiniMap
          className="rounded-2xl border-2 border-gray-200 bg-white/70! backdrop-blur-sm shadow-xs"
          bgColor="white"
          maskColor={"transparent"}
          nodeColor={nodeColor}
          nodeBorderRadius={100}
          position="bottom-left"
          pannable
          zoomable
        />

        <Panel
          position="bottom-right"
        >
          <AddNodeButton
            size="xl"
            color="secondary"
            style="circle"
            orientation={"vertical"}
            toolTipPosition={"left"}
          />
        </Panel>


      </ReactFlow>

    </div>
  );
}


export default Flow;