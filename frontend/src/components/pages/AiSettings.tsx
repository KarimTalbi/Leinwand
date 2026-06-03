import {useEffect, useState} from "react";
import {Bot, Check, KeyRound, Plus, Trash2} from "lucide-react";
import useStore from "@/store";
import {useShallow} from "zustand/react/shallow";
import {bgColor, flowButtonStyle, foreground, inputWithIcon, ring, text} from "@/lib/styles.ts";
import {cn} from "@/lib/utils.ts";

export default function AiSettings() {
  const {
    apiKeys,
    deleteApiKey,
    loadApiKeys,
    createApiKey,
    setDefaultModel,
    defaultModel
  } = useStore(useShallow((state) => ({
    apiKeys: state.apiKeys,
    loadApiKeys: state.loadApiKeys,
    createApiKey: state.createApiKey,
    deleteApiKey: state.deleteApiKey,
    setDefaultModel: state.setDefaultModel,
    defaultModel: state.defaultModel,
  })));

  const [newKey, setNewKey] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(defaultModel?.model || null);
  const [key_id, setKeyId] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null)


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
    <div className={cn(bgColor, ring, "rounded-3xl")}>
      <div className="flex flex-col w-145 p-3 gap-1">

        <form onSubmit={handleCreate}>


          <div className="flex flex-row items-center justify-between gap-5 w-full">

            <div className="flex flex-row uppercase font-semibold opacity-60 tracking-wide items-center">
              <Bot size={24} className={cn(text)}></Bot>
              <div
                className="flex flex-row badge badge-sm badge-info ml-2">{defaultModel?.model || "no default set"}</div>
            </div>

            <div className="flex flex-row gap-1 items-center">

              <div className={cn(inputWithIcon)}>
                <KeyRound size={12}/>
                <input
                  type="password"
                  required
                  value={newKey || ""}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="New Api-Key..."
                  className="focus:outline-none w-full text-sm h-7"
                />
              </div>

              <button
                type='submit'
                disabled={!newKey}
                className={cn(flowButtonStyle, "btn-sm")}
              >
                <Plus size={16}/>
              </button>

            </div>

          </div>

        </form>

        {apiKeys.length === 0 ? (

          <div className="text-center py-16 opacity-50">
            <KeyRound strokeWidth={1.5} className="size-10 mx-auto mb-2"/>
            <p className="text-sm">No API-Keys yet. Add one to get started.</p>
          </div>

        ) : (

          <div className="flex flex-col gap-2 px-2 pt-2">

            {apiKeys.map((key, index) => (

              <div key={index} className={cn("flex flex-row items-center justify-between gap-2 py-2 text-sm", text)}>

                <div>
                  <div>{key.key}</div>
                  <div className="text-[10px] uppercase opacity-60">
                    {key.modelProvider || "no provider found"}
                  </div>
                </div>

                <div className={cn("flex flex-row items-center justify-center gap-2 px-2")}>

                  <div className={cn(foreground, ring, "flex flex-row w-60 rounded-full h-7 items-center px-2")}>
                    <select
                      onChange={(e) => {
                        setSelectedModel(e.target.value)
                        setKeyId(key.id)
                        setProvider(key.modelProvider || null)
                      }}
                      className="w-full"
                      defaultValue="placeholder">
                      <option value="placeholder" disabled>Select model</option>
                      {key.models?.map((model, index) => (
                        <option key={index} value={model} className="disabled:text-neutral-600">{model}</option>
                      ))}
                    </select>
                  </div>

                  <div className="tooltip tooltip-bottom" data-tip="Set as default">
                    <button className={cn(flowButtonStyle, "btn-sm")}
                            disabled={key_id !== key.id || selectedModel === defaultModel?.model}>
                      <Check size={14}
                             onClick={() => {
                               setDefaultModel({
                                 model: selectedModel,
                                 key_id: key_id,
                                 model_provider: provider
                               }, 'default')
                             }
                             }/>
                    </button>
                  </div>

                  <div className="tooltip tooltip-bottom" data-tip="Delete">
                    <button className={cn(flowButtonStyle, "btn-sm")}>
                      <Trash2 size={14} onClick={() => deleteApiKey(key.id)}/>
                    </button>
                  </div>

                </div>
              </div>

            ))}

          </div>

        )}

        <div className="flex flex-row justify-center mt-2">
          <p className="text-xs text-neutral-500">Currently only OpenAi, Google and Anthropic are supported.</p>
        </div>
      </div>
    </div>
  )
}