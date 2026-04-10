import {useEffect, useState} from "react";
import {useShallow} from 'zustand/react/shallow'
import {ReactFlow, Background, NodeTypes, Panel, useReactFlow, MiniMap} from '@xyflow/react';
import {Button, Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';
import {
  ChevronDownIcon,
  MagnifyingGlassPlusIcon,
  PlusIcon,
  UserIcon,
  ArrowPathIcon,
  MoonIcon,
  MapIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  MagnifyingGlassMinusIcon,
  Bars3Icon,
  ArrowsPointingInIcon,
  LockClosedIcon
} from '@heroicons/react/16/solid'

import PromptNode from './nodetypes/promptnode.tsx';
import TextNode from './nodetypes/textnode.tsx';
import MergeNode from './nodetypes/mergenode.tsx';
import useStore from './store';
import {AppState, NodeTypeNames} from './types'

import '@xyflow/react/dist/style.css';

const nodeTypes: NodeTypes = {
  promptNode: PromptNode,
  textNode: TextNode,
  mergeNode: MergeNode,
};

const defaultEdgeOptions = {
  style: {strokeWidth: 6}
};

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  fetchCanvas: state.fetchCanvas,
  addNode: state.addNode,
  setLocked: state.setLocked,
});

function Flow() {
  const {screenToFlowPosition, zoomIn, zoomOut, zoomTo} = useReactFlow()
  const syncing = useStore((state) => state.syncing);
  const locked = useStore((state) => state.locked);
  const [isMapOpen, setIsMapOpen] = useState(true);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    fetchCanvas,
    addNode,
    setLocked,
  } = useStore(
    useShallow(selector)
  );

  useEffect(() => {
    void fetchCanvas();
  }, [fetchCanvas]);

  const onCreateNode = (type: NodeTypeNames) => {
    const position = screenToFlowPosition(
      {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }
    );
    addNode(type, position);
    };


  return (
    <div className="relative h-screen w-screen overflow-hidden">

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        snapToGrid={true}
        snapGrid={[20, 20]}
        defaultEdgeOptions={defaultEdgeOptions}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={!locked}
        nodesConnectable={!locked}
        elementsSelectable={!locked}
      >

        <Panel position="top-left"
               className="flex flex-row items-center justify-between w-98/100 gap-4 rounded-full  bg-white/50 p-2 shadow-lg backdrop-blur-xs">

          <div className="flex flex-row items-center justify-between gap-4 pl-3">

            <Button onClick={() => zoomIn()}
                    className="w-8 h-8 pl-1.5 text-center transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
              <MagnifyingGlassPlusIcon className="size-5 fill-black/80"/>
            </Button>

            <Button onClick={() => zoomOut()}
                    className="w-8 h-8 pl-1.5 transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
              <MagnifyingGlassMinusIcon className="size-5 fill-black/80"/>
            </Button>

            <Button onClick={() => zoomTo(1)}
                    className="w-8 h-8 pl-1.5 transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowsPointingInIcon className="size-5 fill-black/80"/>
            </Button>

            <Button onClick={() => setLocked(!locked)}
                    className="w-8 h-8 pl-1.5 transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
              <LockClosedIcon className="size-5 fill-black/80"/>
            </Button>

            <div className="border-r border-gray-400">&nbsp;</div>

            <Button onClick={() => setIsMapOpen(!isMapOpen)}
                    className="w-8 h-8 pl-1.5 transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
              <MapIcon className="size-5 fill-black/80"/>
            </Button>

            <Button
              className="w-8 h-8 pl-1.5 transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
              <MoonIcon className="size-5 fill-black/80"/>
            </Button>

          </div>

          <Menu>

            <MenuButton
              className="inline-flex items-center gap-1 justify-between rounded-full px-3 py-1.5 text-sm/6 font-semibold text-gray-800 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-gray-600 data-hover:bg-gray-200 data-open:bg-gray-200">
              Add Node
              <ChevronDownIcon className="size-5 fill-gray-600"/>
            </MenuButton>

            <MenuItems
              transition
              anchor='bottom start'
              className="w-40 origin-top-right rounded-xl border border-white/5 bg-white p-1 text-sm/6 text-black font-bold transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
            >


              <MenuItem>
                <button onClick={() => onCreateNode('promptNode')}
                        className="group flex w-full items-center justify-between rounded-lg px-3 py-1.5 data-focus:bg-black/10">
                  Prompt Node
                  <PlusIcon className="size-4 fill-black/40"/>
                </button>
              </MenuItem>

              <div className="my-0 h-px bg-black/5"/>

              <MenuItem>
                <button onClick={() => onCreateNode('textNode')}
                        className="group flex w-full items-center justify-between rounded-lg px-3 py-1.5 data-focus:bg-black/10">
                  Text Node
                  <PlusIcon className="size-4 fill-black/40"/>
                </button>
              </MenuItem>

              <div className="my-0 h-px bg-black/5"/>

              <MenuItem>
                <button onClick={() => onCreateNode('mergeNode')}
                        className="group flex w-full items-center justify-between rounded-lg px-3 py-1.5 data-focus:bg-black/10">
                  Merge Node
                  <PlusIcon className="size-4 fill-black/40"/>
                </button>
              </MenuItem>

            </MenuItems>

          </Menu>

          <div className="flex flex-row items-center justify-between gap-4">

            <Button
              className="w-8 h-8 pl-1.5 transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowUturnLeftIcon className="size-5 fill-black/80"/>
            </Button>

            <Button
              className="w-8 h-8 pl-1.5 transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowUturnRightIcon className="size-5 fill-black/80"/>
            </Button>

            <Button onClick={() => fetchCanvas()}
                    className="w-8 h-8 pl-1.5 transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowPathIcon className="size-5 fill-black/80"/>
            </Button>

            <Button
              className="w-8 h-8 pl-1.5 transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
              <UserIcon className="size-5 fill-black/80"/>
            </Button>

            <Button
              className="w-8 h-8 pl-1.5 transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
              <Bars3Icon className="size-5 fill-black/80"/>
            </Button>

            <div
              className="z-50 flex items-center gap-2 rounded-full px-3 py-1">
              <span className="text-s font-medium text-black/80">Sync</span>
              <div
                className={`h-2.5 w-2.5 rounded-full ${syncing ? 'animate-pulse bg-yellow-400' : 'bg-green-500'}`}/>

            </div>
          </div>

        </Panel>

        <Background bgColor="#ebebeb" size={2} gap={20} color="#CCCCCC"/>

        {isMapOpen && (
          <MiniMap nodeColor="gray"/>
        )}

      </ReactFlow>
    </div>
  );
}

export default Flow;