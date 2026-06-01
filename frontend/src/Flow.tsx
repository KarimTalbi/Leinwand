import {useShallow} from 'zustand/react/shallow'
import {Background, BackgroundVariant, ColorMode, Panel, ReactFlow,} from '@xyflow/react';

import useStore from '@/store';
import {AppState} from '@/types'

import {FlowNavBar} from "@/components/navigation/NavBar.tsx";
import {Controls} from "@/components/navigation/Controls.tsx";
import {MiniMapZoomSlider} from "@/components/navigation/MiniMapZoomSlider.tsx";
import {getNodeColor} from "@/lib/utils.ts";
import {nodeTypes} from "@/lib/nodeTypes.ts";
import {useTheme} from "@/hooks/useTheme.ts";
import '@xyflow/react/dist/style.css';
import {useEffect, useState} from "react";
import {Moon, Sun} from "lucide-react";
import {navbarButtonStyle} from "@/lib/styles.ts";


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
  defaultModel: state.defaultModel
});


function Flow() {

  const [colorMode, setColorMode] = useState<ColorMode>("dark");
  const [bgColor, setBgColor] = useState("#262626")
  const [lineColor, setLineColor] = useState("#404040")
  const {theme, toggle} = useTheme()

  const {
    nodes,
    edges,
    locked,
    scrollToZoom,
    onNodesChange,
    onEdgesChange,
    onConnect,
    defaultModel
  } = useStore(
    useShallow(selector)
  );

  const ThemeToggle = colorMode === 'light' ? Moon : Sun

  useEffect(() => {
    setColorMode(theme as ColorMode);
    setBgColor(colorMode === "light" ? "#f5f5f5" : "#171717")
    setLineColor(colorMode === 'light' ? "#a1a1a1" : "#404040")
  }, [toggle]);


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
          maxZoom={2}
          nodesDraggable={!locked}
          nodesConnectable={!locked}
          elementsSelectable={!locked}
          defaultEdgeOptions={{style: {strokeWidth: 2, stroke: "#a1a1a1"}}}
          proOptions={{hideAttribution: true}}
          zoomOnScroll={scrollToZoom}
          panOnScroll={!scrollToZoom}
          colorMode={colorMode}
        >

          {!defaultModel.model && (
            <Panel position="top-center">
              <div role="alert" className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none"
                     viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span>No Api Key set! Go to Settings to add your key and set a model to use.</span>
              </div>
            </Panel>
          )}


          <FlowNavBar>
            <div className="tooltip tooltip-bottom" data-tip="Toggle Theme">
              <button className={navbarButtonStyle} onClick={toggle}>
                <ThemeToggle size={16}/>
              </button>
            </div>
          </FlowNavBar>

          <Background
            gap={[600, 1200]}
            offset={10}
            variant={BackgroundVariant.Lines}
            lineWidth={1}
            color={lineColor}
            bgColor={bgColor}
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