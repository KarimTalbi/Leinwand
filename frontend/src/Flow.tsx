import {useShallow} from 'zustand/react/shallow'
import {
  ReactFlow,
  Background,
  NodeTypes,
  BackgroundVariant,
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
import {LucideChevronLeft, LucideFolder, LucideHexagon, LucideSettings2, LucideSpline} from "lucide-react";
import {navbarButtonStyle} from "@/lib/styles.ts";
import {getNodeColor} from "@/lib/utils.ts";
import {useFlowContextMenu} from "@/hooks/useFlowContextMenu.ts";
import {CustomButton, CustomButtonProps} from "@/components/ui/UiElements.tsx";


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

  const {
    menu,
    closeMenu,
    onPaneContextMenu,
    menuStyle,
    contextMenuButtons,
    viewportButton
  } = useFlowContextMenu()


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
  } = useStore(
    useShallow(selector)
  );




  const navbarCenterGlobal: Partial<CustomButtonProps> = {
    disabled: true,
    tooltipPosition: "bottom",
    className: navbarButtonStyle
  }

  const navbarCenterChild: CustomButtonProps[] = [
    {icon: LucideFolder, tooltipLabel: "Project Title", children: currentCanvasName, ...navbarCenterGlobal},
    {icon: LucideHexagon, tooltipLabel: "Node Count", children: nodeCount, ...navbarCenterGlobal},
    {icon: LucideSpline, tooltipLabel: "Edge Count", children: edgeCount, ...navbarCenterGlobal}
  ]

  const navbarEndGlobal: Partial<CustomButtonProps> = {
    tooltipDisabled: true,
    className: navbarButtonStyle
  }

  const navbarEndChild: CustomButtonProps[] = [
    {icon: LucideChevronLeft, children: "Exit", onClick: exitCanvas, ...navbarEndGlobal},
    {
      icon: LucideSettings2, children: "Settings", onClick: () => {
      }, ...navbarEndGlobal
    }
  ]


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

            centerChild={
              <div className="flex gap-2 mr-2 text-sm items-center">
                {navbarCenterChild.map((props, i) => (<CustomButton key={i} {...props}/>))}
              </div>
            }

            endChild={
              <div className="flex gap-1 mr-2">
                {navbarEndChild.map((props, i) => (<CustomButton key={i} {...props}/>))}
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

              <div style={{position: 'fixed', inset: 0, zIndex: 10}} onMouseDown={closeMenu}/>
              <div style={{position: 'fixed', ...menuStyle, zIndex: 100}}>

                <ul className="menu bg-white rounded-box ring-1 ring-neutral-200 w-50">

                  <div
                    className="px-0.5 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 select-none">
                    Add Node

                    {contextMenuButtons.map((button, index) => (
                      <li key={index} className="tracking-normal">
                        <CustomButton {...button}/>
                      </li>
                      ))}

                  </div>

                  <div className="my-1 border-t-2 border-gray-100"/>

                  <div
                    className="px-0.5 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 select-none">
                    Viewport

                    <li className="tracking-normal">
                      <CustomButton {...viewportButton}/>
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