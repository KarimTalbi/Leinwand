import {SettingsNavbar} from "@/components/Navigation/NavBar.tsx";
import {useEffect, useState} from "react";
import {KeyRound, Trash2} from "lucide-react";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";


export default function Settings() {
  const {apiKeys, deleteApiKey, loadApiKeys, createApiKey} = useStore(useShallow((state) => ({
    apiKeys: state.apiKeys,
    loadApiKeys: state.loadApiKeys,
    createApiKey: state.createApiKey,
    deleteApiKey: state.deleteApiKey,
  })));

  const [newKey, setNewKey] = useState("");


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

          <div className="join flex items-center justify-end mb-4">

            <div>

              <label className="input input-sm validator join-item">
                <KeyRound size={12}/>
                <input
                  type="password"
                  placeholder="API Key"
                  required value={newKey || ""}
                  onChange={(e) => setNewKey(e.target.value
                  )}
                />
              </label>

            </div>

            <button className="btn btn-sm join-item">
              Add
            </button>

          </div>

        </form>

        {apiKeys.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <KeyRound className="size-6 mx-auto mb-2 opacity-50"/>
            <p className="text-xs">No API-Keys yet. Add one to get started.</p>
          </div>
        ) : (
          <ul className="list bg-base-100 rounded-box shadow-md">

            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Your API-Keys:</li>

            <div className="divider px-4 py-2 text-xs opacity-60 tracking-wide"/>

            {apiKeys.map((key) => (

            <li className="list-row">
              <div>
                <div>...{key.key}</div>
                <div className="text-xs uppercase font-semibold opacity-60">{key.provider || "no provider found"}</div>
              </div>
              <select className="select" defaultValue="See Available Models">
                {key.models?.map((model) => (
                  <option>{model}</option>
                ))}
              </select>
              <div className="px-5">{key.key}</div>
              <button className="btn btn-sm btn-square btn-error mr-2">
                <Trash2 size={14} onClick={() => deleteApiKey(key.id)}/>
              </button>
            </li>

            ))}

          </ul>

        )}


      </main>
    </div>
  )
}