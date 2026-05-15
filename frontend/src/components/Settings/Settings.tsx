import {AppState} from "@/types.ts";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import ApiKeyField from "@/components/Settings/ApiKeyField.tsx";

const selector = (state: AppState) => ({
  settingsOpen: state.settingsOpen,
  setSettingsOpen: state.setSettingsOpen,
});

export default function Settings() {
  const {settingsOpen, setSettingsOpen} = useStore(useShallow(selector));
  if (!settingsOpen) return null;

  return (
    <div>
      <div
        className="absolute inset-0 z-40 bg-black/80"
        onClick={() => setSettingsOpen(false)}
      />
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="bg-background rounded-xl shadow-xl p-6 w-10/12 h-10/12">
          <h2>Settings</h2>

          <ApiKeyField></ApiKeyField>

          <button className="btn btn-neutral" onClick={() => setSettingsOpen(false)}>Close</button>
        </div>
      </div>
    </div>
  )
}