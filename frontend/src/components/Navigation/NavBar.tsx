import {ZoomSlider} from "@/components/Navigation/ZoomSlider.tsx";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {ChevronLeft, Settings2} from "lucide-react";
import {AppState} from "@/types.ts";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";

const selector = (state: AppState) => ({
  exitCanvas: state.exitCanvas,
  setSettingsOpen: state.setSettingsOpen,
});


export const NavBar = () => {
  const {exitCanvas, setSettingsOpen} = useStore(useShallow(selector));


  return (
    <div className="navbar bg-base-100/70 backdrop-blur-md shadow-sm z-100 flex-row items-center justify-between">
      <div >
        <h1 className="text-xl font-bold px-3">LEINWAND</h1>
      </div>
      <div className="border-x border-gray-300 px-5">
        <ZoomSlider></ZoomSlider>
      </div>
      <div>
        <div className="menu menu-horizontal px-1">

            <CustomButton onClick={exitCanvas}>
              <ChevronLeft className="size-4"/>
              <p className="font-normal pr-1">Exit</p>
            </CustomButton>


            <CustomButton onClick={() => setSettingsOpen(true)}>
              <Settings2 className="size-4"/>
              <p className="font-normal pr-1">Settings</p>
            </CustomButton>

        </div>
      </div>
    </div>
  )
}