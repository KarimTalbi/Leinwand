import {SettingsNavbar} from "@/components/Navigation/NavBar.tsx";
import {useEffect, useState} from "react";
import {Check, KeyRound, Trash2} from "lucide-react";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";


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
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [key_id, setKeyId] = useState<string | null>(null);


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
    <div className="min-h-screen bg-white flex flex-col">
      <SettingsNavbar/>
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">

        <form onSubmit={handleCreate}>

          <div className="join flex items-center justify-between mb-4">

            <div className="text-xs uppercase font-semibold opacity-60 tracking-wide">
              Current Default:
              <div
                className="badge badge-outline badge-xs badge-info ml-2">{defaultModel.model || "no default set"}</div>
            </div>

            <div className="flex flex-row justify-around">

              <div>

                <label className="input input-sm validator rounded-l-md join-item flex flex-end">
                  <KeyRound size={12}/>
                  <input
                    type="password"
                    placeholder="API Key"
                    required value={newKey || ""}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                </label>
                <p className="label text-[10px] text-neutral-500">only OpenAi, Google and Anthropic are supported</p>
              </div>

              <button className="btn btn-sm join-item">
                Add
              </button>

            </div>
          </div>

        </form>

        {apiKeys.length === 0 ? (

          <div className="text-center py-16 text-neutral-400">
            <KeyRound className="size-6 mx-auto mb-2 opacity-50"/>
            <p className="text-xs">No API-Keys yet. Add one to get started.</p>
          </div>

        ) : (

          <ul className="list bg-base-100">

            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Your API-Keys:</li>

            {apiKeys.map((key) => (

              <li className="list-row">

                <div>
                  <div>{key.key}</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    {key.modelProvider || "no provider found"}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <select
                    onChange={(e) => {
                      setSelectedModel(e.target.value)
                      setKeyId(key.id)
                    }}
                    className="select select-sm focus:outline-none"
                    defaultValue="placeholder">
                    <option value="placeholder" disabled>Models</option>
                    {key.models?.map((model) => (
                      <option value={model} className="disabled:text-neutral-600">{model}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-row items-center justify-center gap-2">

                  <div className="tooltip" data-tip="Set as default">
                    <button className="btn btn-sm btn-square btn-success"
                            disabled={key_id !== key.id || selectedModel === defaultModel.model}>
                      <Check size={14} onClick={() => setDefaultApiKey(selectedModel || "", key.id)}/>
                    </button>
                  </div>

                  <div className="tooltip" data-tip="Delete">
                    <button className="btn btn-sm btn-square btn-error">
                      <Trash2 size={14} onClick={() => deleteApiKey(key.id)}/>
                    </button>
                  </div>

                </div>
              </li>

            ))}

          </ul>

        )}


      </main>
    </div>
  )
}