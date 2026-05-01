import {Panel, useReactFlow} from "@xyflow/react";
import {ChevronLeft, Lock, LockOpen, LucideScan, Redo2, Undo2, ZoomInIcon, ZoomOutIcon} from "lucide-react";

import useStore, {useTemporalStore} from "@/store.ts";
import {AppState} from "@/types.ts";
import {useShallow} from "zustand/react/shallow";

import {NavbarButton, NavBarButtonGroup, SyncIndicator} from "@/components/navbar/navbarelements.tsx";
import AddNodeMenu from '@/components/nodes/addnode.tsx'


const selector = (state: AppState) => ({
  syncing: state.syncing,
  locked: state.locked,
  setLocked: state.setLocked,
  exitCanvas: state.exitCanvas,
});


const NavigationBar = () => {
  const {zoomIn, zoomOut, zoomTo} = useReactFlow()
  const {syncing, locked, setLocked, exitCanvas} = useStore(useShallow(selector));
  const {undo, redo, pastStates, futureStates} = useTemporalStore();


  return (
    <div>
      <Panel position="bottom-center" className="flex flex-row items-center justify-between gap-4">


        <NavBarButtonGroup>



          <NavbarButton onClick={() => zoomIn()} title="Zoom In">
            <ZoomInIcon className="size-6 text-black"/>
          </NavbarButton>

          <NavbarButton onClick={() => zoomOut()} title="Zoom Out">
            <ZoomOutIcon className="size-6 text-black"/>
          </NavbarButton>

          <NavbarButton onClick={() => zoomTo(1)} title="Reset Zoom">
            <LucideScan className="size-6 text-black"/>
          </NavbarButton>

          <NavbarButton onClick={() => setLocked(!locked)} title="Lock Canvas">
            {locked ? <LockOpen className="size-6 text-black"/> : <Lock className="size-6 text-black"/>}
          </NavbarButton>

        </NavBarButtonGroup>


        <NavBarButtonGroup>

          <AddNodeMenu isOnNode={false}/>

        </NavBarButtonGroup>


        <NavBarButtonGroup>

          <NavbarButton onClick={() => undo()} disabled={pastStates.length === 0} title="Undo">
            <Undo2 className="size-6 text-black"/>
          </NavbarButton>

          <NavbarButton onClick={() => redo()} disabled={futureStates.length === 0} title="Redo">
            <Redo2 className="size-6 text-black"/>
          </NavbarButton>

        </NavBarButtonGroup>


      </Panel>


      <Panel position="top-right" className="flex flex-row items-center justify-between gap-4">


        <NavBarButtonGroup>

          <NavbarButton onClick={exitCanvas} title="Exit Canvas">
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