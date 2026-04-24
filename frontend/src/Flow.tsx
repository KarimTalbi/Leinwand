import {useState} from "react";
import {useShallow} from 'zustand/react/shallow'
import {ReactFlow, Background, NodeTypes, useReactFlow, MiniMap, Node, Panel} from '@xyflow/react';
import {ZoomInIcon, ZoomOutIcon, LucideScan, Lock, LockOpen, Map, Undo2, Redo2} from "lucide-react";

import PromptNode from './nodetypes/promptnode.tsx';
import TextNode from './nodetypes/textnode.tsx';
import MergeNode from './nodetypes/mergenode.tsx';
import SummaryNode from './nodetypes/summarynode.tsx';

import useStore from './store';
import {AppState, NodeTypeNames} from './types'

import NavigationBar from '@/components/navbar/navbar.tsx';
import UserSettings from '@/components/Settings/usersettings.tsx'

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
  syncing: state.syncing,
  locked: state.locked,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  addNode: state.addNode,
  setLocked: state.setLocked,
  exitCanvas: state.exitCanvas,
});


function Flow() {
  const {screenToFlowPosition, zoomIn, zoomOut, zoomTo} = useReactFlow()
  const [isMapOpen, setIsMapOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);


  const {
    nodes,
    edges,
    syncing,
    locked,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setLocked,
    exitCanvas,
  } = useStore(
    useShallow(selector)
  );


  const lockIcon = () => {
    return locked
      ? <LockOpen className="size-6 text-black"/>
      : <Lock className="size-6 text-black"/>
  }


  const controls = [
    {icon: <ZoomInIcon className="size-6 text-black"/>, onClick: () => zoomIn()},
    {icon: <ZoomOutIcon className="size-6 text-black"/>, onClick: () => zoomOut()},
    {icon: <LucideScan className="size-6 text-black"/>, onClick: () => zoomTo(1)},
    {icon: lockIcon(), onClick: () => setLocked(!locked)},
    {icon: <Map className="size-6 text-black"/>, onClick: () => setIsMapOpen(!isMapOpen)},
  ]


  const undoControls = [
    {icon: <Undo2 className="size-6 text-black"/>, onClick: () => console.log('undo')},
    {icon: <Redo2 className="size-6 text-black"/>, onClick: () => console.log('redo')},
  ]


  const addItem = [
    {text: "Prompt Node", onClick: () => onCreateNode('promptNode')},
    {text: "Text Node", onClick: () => onCreateNode('textNode')},
    {text: "Merge Node", onClick: () => onCreateNode('mergeNode')},
    {text: "Summary Node", onClick: () => onCreateNode('summaryNode')},
  ]

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  }


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


  const onCreateNode = (type: NodeTypeNames) => {
    const position = screenToFlowPosition(
      {x: window.innerWidth / 2, y: window.innerHeight / 2}
    );
    void addNode(type, position);
  };


  return (

    <div className="flex h-screen w-screen overflow-hidden">

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        snapToGrid={false}
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
      >

        <NavigationBar
          syncing={syncing}
          undoControls={undoControls}
          controls={controls}
          addItem={addItem}
          onExit={exitCanvas}
          onSettings={toggleSettings}
        />


        <Background
          bgColor="#ebebeb"
          size={2}
          gap={20}
          color="#CCCCCC"
        />

        {isSettingsOpen && (

          <Panel position="center-left" className=" w-[60%] h-[60%] bg-white rounded-lg shadow-xl">
            <div className="flex flex-row  items-center justify-center">
              <UserSettings></UserSettings>
            </div>
          </Panel>

        )}

        {isMapOpen && (

          <MiniMap
            nodeColor={nodeColor}
            nodeBorderRadius={100}
            pannable
            zoomable
          />
        )}


      </ReactFlow>

    </div>
  );
}


export default Flow;