import {useShallow} from 'zustand/react/shallow'
import {ReactFlow, Background, NodeTypes, MiniMap, Node} from '@xyflow/react';

import PromptNode from '@/components/NodeTypes/PromptNode.tsx';
import TextNode from '@/components/NodeTypes/TextNode.tsx';
import MergeNode from '@/components/NodeTypes/MergeNode.tsx';
import SummaryNode from '@/components/NodeTypes/SummaryNode.tsx';

import useStore from '@/store';
import {AppState} from '@/types'

import '@xyflow/react/dist/style.css';
import {NavBar} from "@/components/Navigation/NavBar.tsx";
import AddNodeOverlay from "@/components/Navigation/AddNodeOverlay.tsx";
import Settings from "@/components/Settings/Settings.tsx";


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
  settingsOpen: state.settingsOpen,
  setSettingsOpen: state.setSettingsOpen,
  scrollToZoom: state.scrollToZoom
});


function Flow() {


  const {
    nodes,
    edges,
    locked,
    scrollToZoom,
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
    <div className="relative">

    <div className="flex h-screen w-screen overflow-hidden">



      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        snapToGrid={true}
        snapGrid={[20, 20]}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={!locked}
        nodesConnectable={!locked}
        elementsSelectable={!locked}
        defaultEdgeOptions={{style: {strokeWidth: 4, strokeColor: "black"}}}
        proOptions={{hideAttribution: true}}
        colorMode="light"
        zoomOnScroll={scrollToZoom}
        panOnScroll={!scrollToZoom}
      >

        <NavBar/>


        <Background
          className="bg-white!"
          size={4}
          gap={60}
        />

        <MiniMap
          className="rounded-lg border-2 border-gray-200 bg-white/70! backdrop-blur-sm shadow-xs"
          bgColor="white"
          maskColor={"transparent"}
          nodeColor={nodeColor}
          nodeBorderRadius={50}
          position="bottom-left"
          pannable
          zoomable
          style={{
            width: 150,
            height: 120,
          }}
        />

        <AddNodeOverlay/>


      </ReactFlow>

      <Settings></Settings>

    </div>
    </div>
  );
}


export default Flow;