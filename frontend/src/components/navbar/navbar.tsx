import {Panel, useReactFlow} from "@xyflow/react";
import {NavbarButton, NavBarButtonGroup, SyncIndicator} from "@/components/navbar/navbarelements.tsx";
import {
  ChevronLeft,
  Lock,
  LockOpen,
  LucideScan,
  Redo2,
  Undo2,
  ZoomInIcon,
  ZoomOutIcon
} from "lucide-react";
import {DropdownMenu} from "@/components/menus/dropdownmenu.tsx";

import useStore from "@/store.ts";
import {AppState, NodeTypeNames} from "@/types.ts";
import {useShallow} from "zustand/react/shallow";

const selector = (state: AppState) => ({
  syncing: state.syncing,
  locked: state.locked,
  addNode: state.addNode,
  setLocked: state.setLocked,
  exitCanvas: state.exitCanvas,
});

const NavigationBar = () => {
  const {screenToFlowPosition, zoomIn, zoomOut, zoomTo} = useReactFlow()

  const {syncing, locked, addNode, setLocked, exitCanvas} = useStore(useShallow(selector));

  const addItem = [
    {text: "Prompt Node", onClick: () => onCreateNode('promptNode')},
    {text: "Text Node", onClick: () => onCreateNode('textNode')},
    {text: "Merge Node", onClick: () => onCreateNode('mergeNode')},
    {text: "Summary Node", onClick: () => onCreateNode('summaryNode')},
  ]

  const onCreateNode = (type: NodeTypeNames) => {
    const position = screenToFlowPosition(
      {x: window.innerWidth / 2, y: window.innerHeight / 2}
    );
    void addNode(type, position);
  };

  return (
    <div>
      <Panel position="top-center" className="flex flex-row items-center justify-between gap-4">

        <NavBarButtonGroup>

          <NavbarButton onClick={() => zoomIn()}>
            <ZoomInIcon className="size-6 text-black"/>
          </NavbarButton>

          <NavbarButton onClick={() => zoomOut()}>
            <ZoomOutIcon className="size-6 text-black"/>
          </NavbarButton>

          <NavbarButton onClick={() => zoomTo(1)}>
            <LucideScan className="size-6 text-black"/>
          </NavbarButton>

          <NavbarButton onClick={() => setLocked(!locked)}>
            {locked ? <LockOpen className="size-6 text-black"/> : <Lock className="size-6 text-black"/>}
          </NavbarButton>

        </NavBarButtonGroup>


        <NavBarButtonGroup>

          <DropdownMenu items={addItem}/>

        </NavBarButtonGroup>


        <NavBarButtonGroup>

          <NavbarButton onClick={() => console.log('undo')}>
            <Undo2 className="size-6 text-black"/>
          </NavbarButton>

          <NavbarButton onClick={() => console.log('redo')}>
            <Redo2 className="size-6 text-black"/>
          </NavbarButton>

        </NavBarButtonGroup>

      </Panel>


      <Panel position="top-right" className="flex flex-row items-center justify-between gap-4">

        <NavBarButtonGroup>

          <NavbarButton onClick={exitCanvas}>
            <ChevronLeft className="size-6 text-black"/>
          </NavbarButton>

        </NavBarButtonGroup>


        <NavBarButtonGroup>

          <SyncIndicator syncing={syncing} label="Status"/>

        </NavBarButtonGroup>

      </Panel>
    </div>
  )
};

export default NavigationBar;