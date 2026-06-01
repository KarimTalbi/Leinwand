import {SettingsNavbar} from "@/components/navigation/NavBar.tsx";
import {useEffect, useState} from "react";
import {Check, KeyRound, Plus, Trash2} from "lucide-react";
import useStore from "@/store";
import {useShallow} from "zustand/react/shallow";
import {useTheme} from "@/hooks/useTheme.ts";
import {bgColor} from "@/lib/styles.ts";
import {cn} from "@/lib/utils.ts";

export default function Settings() {
  const {
    apiKeys,
    deleteApiKey,
    loadApiKeys,
    createApiKey,
    setDefaultApiKey,
    defaultModel
  } = useStore(useShallow((state) => ({
    apiKeys: state.apiKeys,
    loadApiKeys: state.loadApiKeys,
    createApiKey: state.createApiKey,
    deleteApiKey: state.deleteApiKey,
    setDefaultApiKey: state.setDefaultApiKey,
    defaultModel: state.defaultModel,
  })));

  const [newKey, setNewKey] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(defaultModel.model || null);
  const [key_id, setKeyId] = useState<string | null>(null);
  const {theme} = useTheme()


  useEffect(() => {
    void loadApiKeys();
  }, [loadApiKeys]);


  const handleCreate = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const key = newKey.trim();
    if (!key) return;
    await createApiKey(key);
    setNewKey("");
  }

  return (
    <div className={cn(bgColor, "min-h-screen flex flex-col")}>
      <SettingsNavbar/>
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10">

        <form onSubmit={handleCreate}>

          <div className="join flex items-center justify-between mb-4">

            <div className="flex flex-row text-xs uppercase font-semibold opacity-60 tracking-wide items-center">
              Current Default:
              <div
                className="badge badge-sm badge-info ml-2">{defaultModel.model || "no default set"}</div>
            </div>

            <div className="flex flex-row justify-around">

              <div>

                <label
                  className="input input-sm rounded-l-full outline-none join-item flex flex-end">
                  <KeyRound size={12}/>
                  <input
                    type="password"
                    placeholder="API Key"
                    required value={newKey || ""}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                </label>
              </div>

              <button
                className="btn btn-sm pr-4 bg-neutral-300 join-item rounded-r-full text-neutral-800 hover:bg-neutral-400">
                <Plus size={14}></Plus>
                <p>Add</p>
              </button>

            </div>
          </div>

        </form>

        {apiKeys.length === 0 ? (

          <div className="text-center py-16 text-neutral-400">
            <KeyRound className="size-10 mx-auto mb-2 opacity-50"/>
            <p>No API-Keys yet. Add one to get started.</p>
          </div>

        ) : (

          <ul className="list bg-neutral-100">

            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Your API-Keys:</li>

            {apiKeys.map((key, index) => (

              <li key={index} className="list-row">

                <div>
                  <div>{key.key}</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    {key.modelProvider || "no provider found"}
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <select
                    onChange={(e) => {
                      setSelectedModel(e.target.value)
                      setKeyId(key.id)
                    }}
                    className="select select-sm border-none ring-1 ring-neutral-300 focus:outline-none max-w-60 mx-3"
                    defaultValue="placeholder">
                    <option value="placeholder" disabled>Models</option>
                    {key.models?.map((model, index) => (
                      <option key={index} value={model} className="disabled:text-neutral-600">{model}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-row items-center justify-center gap-2">

                  <div className="tooltip" data-tip="Set as default">
                    <button className="btn btn-sm btn-circle btn-ghost"
                            disabled={key_id !== key.id || selectedModel === defaultModel.model}>
                      <Check size={14}
                             onClick={() => setDefaultApiKey(selectedModel || "", key.id, key.modelProvider || "")}/>
                    </button>
                  </div>

                  <div className="tooltip" data-tip="Delete">
                    <button className="btn btn-sm btn-circle btn-ghost">
                      <Trash2 size={14} onClick={() => deleteApiKey(key.id)}/>
                    </button>
                  </div>

                </div>
              </li>

            ))}

          </ul>

        )}

        <div className="flex flex-row justify-center mt-2">
          <p className="text-xs text-neutral-500">Currently only OpenAi, Google and Anthropic are supported.</p>
        </div>
      </main>
    </div>
  )
}