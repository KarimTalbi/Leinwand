import {useEffect, useState} from "react";
import {Bot, KeyRound, Plus, Trash2} from "lucide-react";
import useStore from "@/store";
import {useShallow} from "zustand/react/shallow";
import {bgColor, flowButtonStyle, foreground, inputWithIcon, ring, text, typeProps} from "@/lib/styles.ts";
import {cn} from "@/lib/utils.ts";
import {NodeTypeNames} from "@/types.ts";

export default function AiSettings() {
  const {
    apiKeys,
    deleteApiKey,
    loadApiKeys,
    createApiKey,
    setDefaultModel,
    defaultModel,
    defaultPromptModel,
    defaultSummaryModel,
    defaultMergeModel
  } = useStore(useShallow((state) => ({
    apiKeys: state.apiKeys,
    loadApiKeys: state.loadApiKeys,
    createApiKey: state.createApiKey,
    deleteApiKey: state.deleteApiKey,
    setDefaultModel: state.setDefaultModel,
    defaultModel: state.defaultModel,
    defaultPromptModel: state.defaultPromptModel,
    defaultSummaryModel: state.defaultSummaryModel,
    defaultMergeModel: state.defaultMergeModel
  })));

  const [newKey, setNewKey] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
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

  const handleSet = (type: NodeTypeNames | 'default') => {
    setDefaultModel({
      model: selectedModel,
      key_id: key_id,
      model_provider: provider
    }, type)
  }


  return (
    <div className="flex flex-col gap-3">
      <div className={cn(bgColor, ring, "rounded-3xl")}>
        <div className="flex flex-row w-145 p-3 gap-1 items-center justify-between">

          <div className="flex flex-row gap-1 items-center justify-between w-full">

            <div className="tooltip" data-tip="default model">
              <div className={cn("flex flex-row gap-2 items-center")}>
                <Bot size={20}/>
                <div className="flex flex-row badge badge-soft badge-sm badge-info">
                  {defaultModel?.model || "no default set"}
                </div>
              </div>
            </div>

            <div className="tooltip" data-tip="default chat model">
              <div className={cn("flex flex-row gap-2 items-center")}>
                <typeProps.promptNode.icon size={20} color={typeProps.promptNode.color}/>
                <div className="flex flex-row badge badge-soft badge-sm badge-info">
                  {defaultPromptModel?.model || "no default set"}
                </div>
              </div>
            </div>

            <div className="tooltip" data-tip="default summary model">
              <div className={cn("flex flex-row gap-2 items-center")}>
                <typeProps.summaryNode.icon size={20} color={typeProps.summaryNode.color}/>
                <div className="flex flex-row badge badge-soft badge-sm badge-info">
                  {defaultSummaryModel?.model || "no default set"}
                </div>
              </div>
            </div>

            <div className="tooltip" data-tip="default merge model">
              <div className={cn("flex flex-row gap-2 items-center")}>
                <typeProps.mergeNode.icon size={20} color={typeProps.mergeNode.color}/>
                <div className="flex flex-row badge badge-soft badge-sm badge-info">
                  {defaultMergeModel?.model || "no default set"}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>


      <div className={cn(bgColor, ring, "rounded-3xl")}>
        <div className="flex flex-col w-145 p-3 gap-1">

          <form onSubmit={handleCreate}>


            <div className="flex flex-row items-center justify-end w-full">

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

                    <div className={cn(foreground, ring, "flex flex-row w-40 rounded-full h-7 items-center px-2")}>
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

                    <div className="tooltip tooltip-bottom" data-tip="Set default">
                      <button
                        className={cn(flowButtonStyle, "btn-sm")}
                        disabled={key_id !== key.id}
                        onClick={() => handleSet('default')}
                      >
                        <Bot size={14}/>
                      </button>
                    </div>

                    <div className="tooltip tooltip-bottom" data-tip="Set default chat">
                      <button
                        className={cn(flowButtonStyle, "btn-sm")}
                        disabled={key_id !== key.id}
                        onClick={() => handleSet('promptNode')}
                      >
                        <typeProps.promptNode.icon size={14} color={typeProps.promptNode.color}/>
                      </button>
                    </div>

                    <div className="tooltip tooltip-bottom" data-tip="Set default summary">
                      <button
                        className={cn(flowButtonStyle, "btn-sm")}
                        disabled={key_id !== key.id}
                        onClick={() => handleSet('summaryNode')}
                      >
                        <typeProps.summaryNode.icon size={14} color={typeProps.summaryNode.color}/>
                      </button>
                    </div>

                    <div className="tooltip tooltip-bottom" data-tip="Set default merge">
                      <button
                        className={cn(flowButtonStyle, "btn-sm")}
                        disabled={key_id !== key.id}
                        onClick={() => handleSet('mergeNode')}
                      >
                        <typeProps.mergeNode.icon size={14} color={typeProps.mergeNode.color}/>
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
    </div>
  )
}