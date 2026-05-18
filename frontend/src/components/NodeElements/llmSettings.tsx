import {LLMConfig, PromptNodeData} from "@/types.ts";


const models = [
  {
    name: "gpt-5-mini",
    provider: "openai",
  },
  {
    name: "gpt-3.5-turbo",
    provider: "openai",
  },
  {
    name: "gpt-4",
    provider: "openai",
  },
  {
    name: "gemini-2.5-flash",
    provider: "google_genai",
  }
]

interface SettingsScreenProps {
  config: LLMConfig;
  id: string;
  updateNodeData: (id: string, data: Partial<PromptNodeData>) => void;
  closeSettings: () => void;
}

export const DisplaySettingsScreen = ({config, id, updateNodeData, closeSettings}: SettingsScreenProps) => {
  return (
    <div className="flex flex-col flex-1 justify-between gap-5">
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Models</legend>

        <select
          value={config.model}
          className="select nodrag select-sm border-[lightgray]"
          onChange={(e) => updateNodeData(id, {config: {...config, model: e.target.value}})}
        >
          <option disabled value="Pick a model">Pick a model</option>
          {models.map(model => (
            <option key={model.name} value={model.name}>{model.name}</option>
          ))}
        </select>
        <span className="label text-[9px]">You can add your API-Key in the Canvas Settings.
          The available models are automatically fetched</span>
      </fieldset>
      <div className="flex items-center justify-end px-2 pt-2 shrink-0">
        <button
          className="btn btn-ghost btn-sm" onClick={closeSettings}>
          Close
        </button>
      </div>
    </div>

  )
}

export const temperatureSlider = () => {
  return (
    <div className="w-full max-w-xs">
      <input type="range" min={0} max={2} value={0.7} className="range" step={0.1}/>
      <div className="flex justify-between px-2.5 mt-2 text-xs">
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
      </div>
      <div className="flex justify-between px-2.5 mt-2 text-xs">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  )
}