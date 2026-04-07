import {useEffect} from "react";
import {useShallow} from 'zustand/react/shallow'
import {ReactFlow, Background, Controls, NodeTypes, Panel, useReactFlow, MiniMap} from '@xyflow/react';
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
import {AppState} from './types'

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
  addPromptNode: state.addPromptNode,
  addTextNode: state.addTextNode,
  addMergeNode: state.addMergeNode,
});

function Flow() {
  const {screenToFlowPosition} = useReactFlow()
  const syncing = useStore((state) => state.syncing);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    fetchCanvas,
    addPromptNode,
    addTextNode,
    addMergeNode,
  } = useStore(
    useShallow(selector)
  );

  useEffect(() => {
    void fetchCanvas();
  }, []);

  const onCreatePromptNode = () => {
    const position = screenToFlowPosition(
      {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }
    );
    addPromptNode(position);
  };

  const onCreateTextNode = () => {
    const position = screenToFlowPosition(
      {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }
    );
    addTextNode(position);
  };

  const onCreateMergeNode = () => {
    const position = screenToFlowPosition(
      {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }
    );
    addMergeNode(position);
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
        minZoom={0.2}
        maxZoom={2}
      >

        <Panel position="top-left"
               className="flex flex-row items-center justify-between w-98/100 p-1.5 bg-white/80 rounded-full shadow-lg backdrop-blur-xs">

          <div className="flex flex-row items-center justify-between gap-4 pl-3">
            <Button>
              <MagnifyingGlassPlusIcon className="size-5 fill-black/80"/>
            </Button>
            <Button>
              <MagnifyingGlassMinusIcon className="size-5 fill-black/80"/>
            </Button>
            <Button>
              <ArrowsPointingInIcon className="size-4 fill-black/80"/>
            </Button>
            <Button>
              <LockClosedIcon className="size-4 fill-black/80"/>
            </Button>
            <div className="border-r border-gray-400">&nbsp;</div>
            <Button>
              <MapIcon className="size-5 fill-black/80"/>
            </Button>
            <Button>
              <MoonIcon className="size-4.5 fill-black/80"/>
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
                <button onClick={onCreatePromptNode}
                        className="group flex w-full items-center justify-between rounded-lg px-3 py-1.5 data-focus:bg-black/10">
                  Prompt Node
                  <PlusIcon className="size-4 fill-black/40"/>
                </button>
              </MenuItem>

              <div className="my-0 h-px bg-black/5"/>

              <MenuItem>
                <button onClick={onCreateTextNode}
                        className="group flex w-full items-center justify-between rounded-lg px-3 py-1.5 data-focus:bg-black/10">
                  Text Node
                  <PlusIcon className="size-4 fill-black/40"/>
                </button>
              </MenuItem>

              <div className="my-0 h-px bg-black/5"/>

              <MenuItem>
                <button onClick={onCreateMergeNode}
                        className="group flex w-full items-center justify-between rounded-lg px-3 py-1.5 data-focus:bg-black/10">
                  Merge Node
                  <PlusIcon className="size-4 fill-black/40"/>
                </button>
              </MenuItem>

            </MenuItems>

          </Menu>

          <div className="flex flex-row items-center justify-between gap-4">
            <Button>
              <ArrowUturnLeftIcon className="size-5 fill-black/80"/>
            </Button>
            <Button>
              <ArrowUturnRightIcon className="size-5 fill-black/80"/>
            </Button>
            <Button>
              <ArrowPathIcon className="size-5 fill-black/80"/>
            </Button>
            <Button>
              <UserIcon className="size-5 fill-black/80"/>
            </Button>
            <Button>
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
        <Controls/>
        <MiniMap nodeColor="gray"/>

      </ReactFlow>
    </div>
  );
}

export default Flow;