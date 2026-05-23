import {useShallow} from 'zustand/react/shallow'
import {
  ReactFlow,
  Background,
  NodeTypes,
  Node,
  BackgroundVariant,
  useViewport,
  useReactFlow
} from '@xyflow/react';

import PromptNode from '@/components/NodeTypes/PromptNode.tsx';
import TextNode from '@/components/NodeTypes/TextNode.tsx';
import MergeNode from '@/components/NodeTypes/MergeNode.tsx';
import SummaryNode from '@/components/NodeTypes/SummaryNode.tsx';

import useStore from '@/store';
import {AppState} from '@/types'

import '@xyflow/react/dist/style.css';
import {Navbar} from "@/components/Navigation/NavBar.tsx";
import Settings from "@/components/Settings/Settings.tsx";
import {Controls} from "./components/Navigation/Controls.tsx";
import {MiniMapZoomSlider} from "./components/Navigation/MiniMapZoomSlider.tsx";
import {Axis3D, ChevronLeft, Folder, Hexagon, Settings2, Spline} from "lucide-react";
import {navbarButtonStyle, tooltipStyle} from "@/lib/styles.ts";
import {cn} from "@/lib/utils.ts";


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
  settingsOpen: state.settingsOpen,
  setSettingsOpen: state.setSettingsOpen,
  scrollToZoom: state.scrollToZoom,
  exitCanvas: state.exitCanvas,
  setLocked: state.setLocked,
  setScrollToZoom: state.setScrollToZoom,
  currentCanvasName: state.currentCanvasName,
  nodeCount: state.nodes.length,
  edgeCount: state.edges.length,
});


function Flow() {
  const {x, y} = useViewport();
  const {setViewport} = useReactFlow();

  const {
    nodes,
    edges,
    locked,
    scrollToZoom,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSettingsOpen,
    exitCanvas,
    currentCanvasName,
    nodeCount,
    edgeCount,
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
          snapGrid={[300, 1]}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          minZoom={0.5}
          maxZoom={1.5}
          nodesDraggable={!locked}
          nodesConnectable={!locked}
          elementsSelectable={!locked}
          defaultEdgeOptions={{style: {strokeWidth: 2, strokeColor: "black"}}}
          proOptions={{hideAttribution: true}}
          colorMode="light"
          zoomOnScroll={scrollToZoom}
          panOnScroll={!scrollToZoom}
          className="download-image"
        >

          <Navbar

            child2={
              <div className="flex gap-2 mr-2 text-sm items-center">


                <div className={cn(tooltipStyle, "tooltip-bottom")} data-tip="Project Title">
                  <button className={cn(navbarButtonStyle)} disabled={true}>
                    <Folder size={14}/>
                    <p>{currentCanvasName}</p>
                  </button>
                </div>

                <div className={cn(tooltipStyle, "tooltip-bottom")} data-tip="Node Count">
                  <button className={cn(navbarButtonStyle)} disabled={true}>
                    <Hexagon size={14}/>
                    <p>{nodeCount}</p>
                  </button>
                </div>

                <div className={cn(tooltipStyle, "tooltip-bottom")} data-tip="Edge Count">
                  <button className={cn(navbarButtonStyle)} disabled={true}>
                    <Spline size={14}/>
                    <p>{edgeCount}</p>
                  </button>
                </div>


              </div>

            }

            child3={
              <div className="flex-1 justify-start">
                <div className={cn(tooltipStyle, "tooltip-bottom")} data-tip="Current Viewport Position click to reset to (0, 0)">
                  <button className={cn(navbarButtonStyle, "flex-1 justify-start")}
                          onClick={() => setViewport({x: 0, y: 0, zoom: 1})}>
                    <Axis3D size={14}/>
                    <p className="tabular-nums text-right">
                      {Math.round(x)}, {Math.round(y)}
                    </p>
                  </button>
                </div>
              </div>
            }

            child4={
              <div className="flex gap-1 mr-2">

                <button className={cn(navbarButtonStyle)} onClick={exitCanvas}>
                  <ChevronLeft size={14}/>
                  <p>Exit</p>
                </button>

                <button className={cn(navbarButtonStyle)} onClick={() => setSettingsOpen(true)}>
                  <Settings2 size={14}/>
                  <p>Settings</p>
                </button>

              </div>
            }
          />


          <Background
            id="2"
            bgColor="#f5f5f5"
            size={4}
            gap={[60, 60]}
            offset={162}
          />

          <Background
            id="3"
            size={6}
            gap={[300, 300]}
            offset={190}
            variant={BackgroundVariant.Lines}
            lineWidth={12}
            color="#f5f5f5"
          />
          {/*#f5f5f5*/}
          <Background
            id="1"
            size={4}
            gap={[300, 300]}
            offset={190}
            variant={BackgroundVariant.Lines}
            lineWidth={2}
            color="#e5e5e5"
            style={{strokeDasharray: "20, 20", strokeDashoffset: "20"}}
          />

          <MiniMapZoomSlider nodeColor={nodeColor}/>

          <Controls/>

        </ReactFlow>

        <Settings></Settings>

      </div>
    </div>
  )
    ;
}


export default Flow;