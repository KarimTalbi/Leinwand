import {useEffect} from "react";
import {useShallow} from 'zustand/react/shallow'
import {ReactFlow, Background, Controls, NodeTypes, Panel, useReactFlow, MiniMap} from '@xyflow/react';
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';
import {ChevronDownIcon, PlusIcon} from '@heroicons/react/16/solid'

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

            {/* React Flow */}
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
                <Background bgColor="#ebebeb" size={2} gap={20} color="#CCCCCC"/>

                {/* Control Panel bottom left */}
                <Controls/>

                {/* Top Panel */}
                <Panel position="top-left" className="flex flex-row justify-between w-full pr-8">

                    <Menu>

                        <MenuButton
                            className="w-40 inline-flex items-center justify-between rounded-md bg-white px-3 py-1.5 text-sm/6 font-semibold text-gray-600  shadow-xl focus:not-data-focus:outline-none data-focus:outline data-focus:outline-gray-600 data-hover:bg-gray-100 data-open:bg-gray-100">
                            Add Node
                            <ChevronDownIcon className="size-4 fill-gray-600"/>
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

                    <div
                        className="z-50 flex items-center gap-2 rounded-full bg-white backdrop-blur-md px-3 py-1 border border-white/20 shadow-lg">

                        <div
                            className={`h-2.5 w-2.5 rounded-full ${syncing ? 'animate-pulse bg-yellow-400' : 'bg-green-500'}`}/>
                        <span className="text-s font-medium text-black/80">{syncing ? 'Syncing...' : 'Saved'}</span>
                    </div>

                </Panel>

                <MiniMap nodeColor="gray"/>

            </ReactFlow>
        </div>
    );
}

export default Flow;