import React, {memo, useState} from 'react';
import {NodeProps} from "@xyflow/react";
import {Undo2, Play, Settings2} from "lucide-react";
import {useShallow} from "zustand/react/shallow";
import {useDebouncedCallback} from 'use-debounce';


import useStore from '../store.ts';
import {AppState, PromptNodeConfig, PromptNodeType} from "../types.ts";

import {NodeTextarea, NodeHeaderButton, DefaultHandles, NodeDisplayText} from "@/components/nodes/nodeelements.tsx";
import BaseNode from "@/components/nodes/basenode.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Input} from "@/components/ui/input.tsx";


const selector = (state: AppState) => ({
  updateNodeData: state.updateNodeData,
  deleteNode: state.deleteNode,
  updateNodeClosed: state.updateNodeClosed,
  promptNodeAction: state.promptNodeAction,
});

const PromptNode = ({id, data, positionAbsoluteX, positionAbsoluteY}: NodeProps<PromptNodeType>) => {
  const {updateNodeData, updateNodeClosed, promptNodeAction} = useStore(useShallow(selector));
  const [loading, setLoading] = useState(false);
  const isClosed = data.closed;
  const [localPrompt, setLocalPrompt] = useState(data.prompt);
  const config = data.config ?? {inheritConfig: true};
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleConfigChange = (newConfig: PromptNodeConfig) => {
    updateNodeData(id, {config: newConfig});
  }

  const debouncedUpdate = useDebouncedCallback((value: string) => {
    updateNodeData(id, {prompt: value});
  }, 500);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPrompt(e.target.value);
    debouncedUpdate(e.target.value);
  };

  const content = () => {
    if (settingsOpen) {
      return (
        <div>
          <div className="p-5 bg-gray-100 rounded-xl mb-2">
            <p className="text-base font-bold mb-3">Configuration:</p>
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="inheritConfig" className="text-base">Inherit from parent</label>
              <Switch
                size="default"
                onCheckedChange={(checked: boolean) => handleConfigChange({...config, inheritConfig: checked})}
                checked={config.inheritConfig}
              />
            </div>
          </div>
          <div className="p-5 bg-gray-100 rounded-xl">
            <p className="text-base font-bold mb-3">LLM model</p>
            <div className="bg-gray-100 rounded-xl">
              <Input
                type='text'
                value={data.config.model} onChange={(e) => handleConfigChange({...config, model: e.target.value})}
                placeholder='Enter model name...'
                className="w-full bg-white h-12 text-base rounded-lg nodrag"
              />
              <Input
                type='text'
                value={data.config.provider} onChange={(e) => handleConfigChange({...config, provider: e.target.value})}
                placeholder='Enter provider name...'
                className="w-full bg-white h-12 text-base rounded-lg nodrag mt-3"
              />
            </div>

          </div>
        </div>
      )
    }

    if (isClosed && data.response) {
      return <NodeDisplayText children={data.response}/>;
    } else if (isClosed && !data.response) {
      return <NodeDisplayText></NodeDisplayText>
    }
    return <NodeTextarea value={localPrompt} handleTextChange={handleTextChange} placeholder='Enter your prompt...'/>
  }

  const playIcon = () => {
    return isClosed
      ? <Undo2 className="size-8 text-white"/>
      : <Play className="size-8 text-white"/>
  }

  const titleText = () => {
    return isClosed
      ? 'Reset'
      : 'Send to LLM'
  }

  const settingsIcon = () => {
    return <Settings2 className="size-8 text-white"/>
  }

  const handleClick = () => {
    setLoading(true);

    isClosed
      ? updateNodeClosed(id, false)
      : promptNodeAction(id, data.prompt || '', 'chat');

    setLoading(false);
  }

  return (
    <BaseNode
      id={id}
      title="Prompt Node"
      loading={loading}
      style={{'--node-color': '#ec4899'} as React.CSSProperties}
      headerActions={
        <div className="flex items-center gap-6">
          <NodeHeaderButton
            onClick={() => setSettingsOpen(!settingsOpen)}
            icon={settingsIcon}
            disabled={loading || !!data.response}
            title="Settings"
          />

          <NodeHeaderButton
            onClick={handleClick}
            icon={playIcon}
            disabled={loading || !data.prompt}
            title={titleText()}
          />
        </div>
      }>

      {content()}

      {isClosed && (
        <div className="p-5 bg-gray-100 rounded-xl">
          <p className="text-base font-bold mb-3">User Message:</p>
          <p className="text-base mb-3">{data.prompt}</p>
        </div>
      )}

      <DefaultHandles sourceId={id} posX={positionAbsoluteX} posY={positionAbsoluteY}
                      style={{'--node-color': '#ec4899'} as React.CSSProperties}/>


    </BaseNode>

  );
};

export default memo(PromptNode);