import {useShallow} from 'zustand/react/shallow'
import {ReactFlow, Background, NodeTypes, MiniMap, Node} from '@xyflow/react';

import PromptNode from './NewNodeTypes/PromptNode.tsx';
import TextNode from './nodetypes/textnode.tsx';
import MergeNode from './nodetypes/mergenode.tsx';
import SummaryNode from './nodetypes/summarynode.tsx';

import useStore from './store';
import {AppState} from './types'

import NavigationBar from '@/components/Navigation/navigation-bar.tsx';

import '@xyflow/react/dist/style.css';


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
      >

        <NavigationBar />


        <Background
          bgColor="#ebebeb"
          size={8}
          gap={60}
          color="#CCCCCC"
        />

          <MiniMap
            className="rounded-2xl shadow-md backdrop-blur-lg backdrop-saturate-150"
            bgColor="#ffffff7e"
            maskColor={"transparent"}
            nodeColor={nodeColor}
            nodeBorderRadius={100}
            pannable
            zoomable
          />



      </ReactFlow>

    </div>
  );
}


export default Flow;