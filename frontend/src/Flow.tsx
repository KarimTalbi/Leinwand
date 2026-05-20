import {useShallow} from 'zustand/react/shallow'
import {ReactFlow, Background, NodeTypes, MiniMap, Node, BackgroundVariant} from '@xyflow/react';

import PromptNode from '@/components/NodeTypes/PromptNode.tsx';
import TextNode from '@/components/NodeTypes/TextNode.tsx';
import MergeNode from '@/components/NodeTypes/MergeNode.tsx';
import SummaryNode from '@/components/NodeTypes/SummaryNode.tsx';

import useStore from '@/store';
import {AppState} from '@/types'

import '@xyflow/react/dist/style.css';
import {Navbar} from "@/components/Navigation/NavBar.tsx";
import AddNodeOverlay from "@/components/Navigation/AddNodeOverlay.tsx";
import Settings from "@/components/Settings/Settings.tsx";
import {PanControls} from "@/components/Navigation/PanControls.tsx";
import {ZoomSlider} from "@/components/Navigation/ZoomSlider.tsx";
import {ChevronLeft, Settings2} from "lucide-react";


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
    setSettingsOpen,
    exitCanvas,
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
          maxZoom={2}
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
          centerChild={
            <ZoomSlider></ZoomSlider>
          }
          endChild={
            <div>

              <button className="btn btn-ghost border-none shadow-none" onClick={exitCanvas}>
                <ChevronLeft className="size-4"/>
                <p className="font-normal pr-1">Exit</p>
              </button>


              <button className="btn btn-ghost border-none shadow-none" onClick={() => setSettingsOpen(true)}>
                <Settings2 className="size-4"/>
                <p className="font-normal pr-1">Settings</p>
              </button>


            </div>
          }
          />




          <Background
            id="2"
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
            color="white"
          />

          <Background
            id="1"
            size={4}
            gap={[300, 300]}
            offset={190}
            variant={BackgroundVariant.Lines}
            lineWidth={2}
            color="#ebebeb"
            style={{strokeDasharray: "20, 20", strokeDashoffset: "20"}}
          />


          <MiniMap
            zoomable
            pannable
            bgColor={"rgb(218 218 218 / 0.6)"}
            maskColor={"rgb(255 255 255 / 0.7)"}
            nodeColor={nodeColor}
            nodeBorderRadius={50}
            position="bottom-left"
            style={{
              width: 200,
              height: 150,
              borderRadius: 10,
              border: "1px solid lightgray",
              backdropFilter: "blur(5px)",
              overflow: "hidden",
            }}
          />

          <AddNodeOverlay/>

          <PanControls/>

        </ReactFlow>

        <Settings></Settings>

      </div>
    </div>
  );
}


export default Flow;