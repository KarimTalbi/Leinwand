import {ZoomSlider} from "@/components/Navigation/ZoomSlider.tsx";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {ChevronLeft, Settings2} from "lucide-react";
import {AppState} from "@/types.ts";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {useState} from "react";
import {Panel} from "@xyflow/react";

const selector = (state: AppState) => ({
  exitCanvas: state.exitCanvas,
});


export const NavBar = () => {
  const {exitCanvas} = useStore(useShallow(selector));
  const [openSettings, setOpenSettings] = useState(false);


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


            <CustomButton onClick={() => setOpenSettings(!openSettings)}>
              <Settings2 className="size-4"/>
              <p className="font-normal pr-1">Settings</p>
            </CustomButton>

        </div>
      </div>
      {openSettings && (
        <Panel position="top-center">
        <div className="absolute top-[50vh] w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Theme</label>
              <select className="border border-gray-300 rounded-md px-3 py-2 w-full">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>
        </Panel>
      )}
    </div>
  )
}