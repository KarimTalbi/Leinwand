import {useShallow} from 'zustand/react/shallow'
import {
  ReactFlow,
  Background,
  NodeTypes,
  BackgroundVariant,
  useViewport,
} from '@xyflow/react';

import PromptNode from '@/components/NodeTypes/PromptNode.tsx';
import TextNode from '@/components/NodeTypes/TextNode.tsx';
import MergeNode from '@/components/NodeTypes/MergeNode.tsx';
import SummaryNode from '@/components/NodeTypes/SummaryNode.tsx';

import useStore from '@/store';
import {AppState} from '@/types'

import '@xyflow/react/dist/style.css';
import {Navbar} from "@/components/Navigation/NavBar.tsx";
import {Controls} from "./components/Navigation/Controls.tsx";
import {MiniMapZoomSlider} from "./components/Navigation/MiniMapZoomSlider.tsx";
import {
  Axis3D,
  ChevronLeft,
  Folder,
  Hexagon,
  Settings2,
  Spline
} from "lucide-react";
import {navbarButtonStyle, tooltipStyle} from "@/lib/styles.ts";
import {cn, getNodeColor} from "@/lib/utils.ts";
import {useFlowContextMenu} from "@/hooks/useFlowContextMenu.ts";



const nodeTypes: NodeTypes = {
  promptNode: PromptNode,
  textNode: TextNode,
  mergeNode: MergeNode,
  summaryNode: SummaryNode,
};


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
});



function Flow() {
  const {x, y} = useViewport();
  const {menu, closeMenu, onPaneContextMenu, setViewport} = useFlowContextMenu()


  const {
    nodes,
    edges,
    locked,
    scrollToZoom,
    onNodesChange,
    onEdgesChange,
    onConnect,
    exitCanvas,
    currentCanvasName,
    nodeCount,
    edgeCount,
    addNode,
  } = useStore(
    useShallow(selector)
  );

  const menuStyle = (() => {
    if (!menu) return {};
    const W = window.innerWidth;
    const H = window.innerHeight;
    const MENU_W = 192; // matches min-w-48 below
    const MENU_H = 260; // rough estimate
    return {
      top:  menu.screenY + MENU_H > H ? menu.screenY - MENU_H : menu.screenY,
      left: menu.screenX + MENU_W > W ? menu.screenX - MENU_W : menu.screenX,
    };
  })();


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
          onPaneContextMenu={onPaneContextMenu}
        >

          <Navbar

            child2={
              <div className="flex gap-2 mr-2 text-sm items-center">


                <div className={cn(tooltipStyle, "tooltip-bottom")} data-tip="Project Title">
                  <button className={cn(navbarButtonStyle, "disabled:opacity-100")} disabled={true}>
                    <Folder size={14}/>
                    <p>{currentCanvasName}</p>
                  </button>
                </div>

                <div className={cn(tooltipStyle, "tooltip-bottom")} data-tip="Node Count">
                  <button className={cn(navbarButtonStyle, "disabled:opacity-100")} disabled={true}>
                    <Hexagon size={14}/>
                    <p>{nodeCount}</p>
                  </button>
                </div>

                <div className={cn(tooltipStyle, "tooltip-bottom")} data-tip="Edge Count">
                  <button className={cn(navbarButtonStyle, "disabled:opacity-100")} disabled={true}>
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

                <button className={cn(navbarButtonStyle)} onClick={() => null}>
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

          <MiniMapZoomSlider nodeColor={getNodeColor}/>

          <Controls/>

          {menu && (
            <>

              <div style={{position: 'fixed', inset: 0, zIndex: 10}} onMouseDown={() => closeMenu()}/>

              <div style={{position: 'fixed', ...menuStyle, zIndex: 100}}>

                <ul className="menu bg-white rounded-box ring-1 ring-neutral-200">

                  <div className="pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 select-none">
                    Add Node

                  <li>
                    <button
                      className="btn btn-ghost border-none justify-start"
                      onClick={() => {
                        closeMenu()
                        addNode("promptNode", menu.flowPos)
                      }}
                    >
                      Chat
                    </button>
                  </li>

                    <div className="border-t border-gray-100" />

                  <li>
                    <button
                      className="flex flex-row items-center justify-start gap-2 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 tracking-normal"
                      onClick={() => {
                        closeMenu()
                        addNode("textNode", menu.flowPos)
                      }}
                    >

                      Note
                    </button>
                  </li>

                    <div className="border-t border-gray-100" />

                  <li>
                    <button
                      className="flex flex-row items-center justify-start gap-2 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 tracking-normal"
                      onClick={() => {
                        closeMenu()
                        addNode("summaryNode", menu.flowPos)
                      }}
                    >
                      Summary
                    </button>
                  </li>

                    <div className="border-t border-gray-100" />

                  <li>
                    <button
                      className="flex flex-row items-center justify-start gap-2 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 tracking-normal"
                      onClick={() => {
                        closeMenu()
                        addNode("mergeNode", menu.flowPos)
                      }}
                    >
                      merge
                    </button>
                  </li>

                  </div>

                  <div className="my-1 border-t-2 border-gray-100" />

                  <div className="px-2 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 select-none">
                    Viewport

                  <li>
                    <button
                      className="flex flex-row items-center justify-start gap-2 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 tracking-normal"
                      onClick={() => {
                        closeMenu()
                        void setViewport({x: 0, y: 0, zoom: 1})
                      }}
                    >
                      Return to center
                    </button>
                  </li>

                  </div>

                </ul>
              </div>
            </>
          )}

        </ReactFlow>






      </div>
    </div>
  )
    ;
}


export default Flow;