import {Panel, useReactFlow} from "@xyflow/react";
import {ChevronLeft, Lock, LockOpen, LucideScan, Redo2, Undo2, ZoomInIcon, ZoomOutIcon} from "lucide-react";

import useStore from "@/store.ts";
import {AppState} from "@/types.ts";
import {useShallow} from "zustand/react/shallow";

import {NavbarButton, SyncIndicator} from "@/components/navbar/navbarelements.tsx";
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


  return (
    <div>
      <Panel position="bottom-center" className="flex flex-row items-center justify-between gap-4">


        <div className="flex flex-row items-center justify-between mb-3 bg-white/50 rounded-full shadow-md backdrop-blur-sm">



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

        </div>


        <div className="flex flex-row items-center justify-between mb-3 bg-white/50 rounded-full shadow-md backdrop-blur-sm">

          <AddNodeMenu isOnNode={false}/>

        </div>


        <div className="flex flex-row items-center justify-between mb-3 bg-white/50 rounded-full shadow-md backdrop-blur-sm">

          <NavbarButton onClick={() => console.log("undo")} title="Undo">
            <Undo2 className="size-6 text-black"/>
          </NavbarButton>

          <NavbarButton onClick={() => console.log("redo")} title="Redo">
            <Redo2 className="size-6 text-black"/>
          </NavbarButton>

        </div>


      </Panel>


      <Panel position="top-right" className="flex flex-row items-center justify-between gap-4">


        <div className="flex flex-row items-center justify-between mb-3 bg-white/50 rounded-full shadow-md backdrop-blur-sm">

          <NavbarButton onClick={exitCanvas} title="Exit Canvas">
            <ChevronLeft className="size-6 text-black"/>
          </NavbarButton>

        </div>


        <div className="flex flex-row items-center justify-between mb-3 bg-white/50 rounded-full shadow-md backdrop-blur-sm">

          <SyncIndicator syncing={syncing} label="Status"/>

        </div>


      </Panel>
    </div>
  )
};

export default NavigationBar;