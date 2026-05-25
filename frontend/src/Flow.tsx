import {useShallow} from 'zustand/react/shallow'
import {
  ReactFlow,
} from '@xyflow/react';

import useStore from '@/store';
import {AppState} from '@/types'

import '@xyflow/react/dist/style.css';
import {FlowNavBar} from "@/components/Navigation/NavBar.tsx";
import {Controls} from "./components/Navigation/Controls.tsx";
import {MiniMapZoomSlider} from "./components/Navigation/MiniMapZoomSlider.tsx";
import {getNodeColor} from "@/lib/utils.ts";
import {useFlowContextMenu} from "@/hooks/useFlowContextMenu.ts";
import ContextMenu from "@/components/Navigation/ContextMenu.tsx";
import {CustomBackground} from "@/components/ui/CustomBackground.tsx";
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
  promptNodeAction: state.promptNodeAction,
});


function Flow() {

  const {
    closeMenu,
    menuStyle,
    contextMenuButtons,
    viewportButton,
    menu,
    onPaneContextMenu
  } = useFlowContextMenu()


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
          onPaneContextMenu={onPaneContextMenu as any}
        >

          <FlowNavBar/>
          <CustomBackground/>
          <MiniMapZoomSlider nodeColor={getNodeColor}/>
          <Controls/>
          <ContextMenu menu={menu} closeMenu={closeMenu} menuStyle={menuStyle} contextMenuButtons={contextMenuButtons}
                       viewportButton={viewportButton}/>

        </ReactFlow>


      </div>
    </div>
  )
    ;
}


export default Flow;