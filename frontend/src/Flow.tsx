import {useShallow} from 'zustand/react/shallow'
import {Background, BackgroundVariant, ReactFlow,} from '@xyflow/react';

import useStore from '@/store';
import {AppState} from '@/types'

import '@xyflow/react/dist/style.css';
import {FlowNavBar} from "@/components/navigation/NavBar.tsx";
import {Controls} from "@/components/navigation/Controls.tsx";
import {MiniMapZoomSlider} from "@/components/navigation/MiniMapZoomSlider.tsx";
import {getNodeColor} from "@/lib/utils.ts";
import {nodeTypes} from "@/lib/nodeTypes.ts";


const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  locked: state.locked,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  scrollToZoom: state.scrollToZoom,
  exitCanvas: state.exitCanvas,
  setLocked: state.setLocked,
  setScrollToZoom: state.setScrollToZoom,
  currentCanvasName: state.currentCanvasName,
  nodeCount: state.nodes.length,
  edgeCount: state.edges.length,
  addNode: state.addNode,
  setNodes: state.setNodes,
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

  return (
    <div className="relative">

      <div className="flex h-screen w-screen overflow-hidden">


        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}

          snapToGrid={true}
          snapGrid={[300, 1]}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          minZoom={0.5}
          maxZoom={1.5}
          nodesDraggable={!locked}
          nodesConnectable={!locked}
          elementsSelectable={!locked}
          defaultEdgeOptions={{style: {strokeWidth: 2, stroke: "#a1a1a1"}}}
          proOptions={{hideAttribution: true}}
          colorMode="light"
          zoomOnScroll={scrollToZoom}
          panOnScroll={!scrollToZoom}
        >

          <FlowNavBar/>

          <Background
            id="1"
            bgColor="white"
            size={3}
            gap={[60, 60]}
            offset={162}
          />

          <Background
            id="2"
            size={6}
            gap={[300, 300]}
            offset={190}
            variant={BackgroundVariant.Lines}
            lineWidth={12}
            color="white"
          />

          <Background
            id="3"
            size={4}
            gap={[300, 300]}
            offset={190}
            variant={BackgroundVariant.Lines}
            lineWidth={1}
            color="#e5e5e5"
            style={{strokeDasharray: "15, 10", strokeDashoffset: "20"}}
          />


          <MiniMapZoomSlider nodeColor={getNodeColor}/>
          <Controls/>

        </ReactFlow>


      </div>
    </div>
  )
    ;
}


export default Flow;