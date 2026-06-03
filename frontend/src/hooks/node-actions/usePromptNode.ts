import {useState} from 'react';
import useStore from '@/store';
import {streamingChat} from '@/services/llmService';

/**
 * Manages the run lifecycle for a prompt node — streams the LLM response token
 * by token into `updateNodeData` and syncs the canvas when complete.
 */
export function usePromptNode(nodeId: string) {
  const [isStreaming, setIsStreaming] = useState(false);

  const node = useStore((s) => s.nodes.find((n) => n.id === nodeId));
  const defaultPromptModel = useStore((s) => s.defaultPromptModel);
  const defaultModel = useStore((s) => s.defaultModel);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const syncCanvas = useStore((s) => s.syncCanvas);
  const model = defaultPromptModel?.model ? defaultPromptModel : defaultModel;

  const run = async () => {
    if (!node) return;

    console.log(model)


    setIsStreaming(true);
    await syncCanvas()
    updateNodeData(nodeId, {model: model, response: ''});

    try {
      const token = localStorage.getItem('token') ?? '';
      const nodeWithModel = {...node, data: {...node.data, model: model}};

      await streamingChat(nodeWithModel, token, (partial) => {
        updateNodeData(nodeId, {response: partial, closed: true});
      });

    } catch (err) {
      console.error('Error prompting node:', err);
    } finally {
      setIsStreaming(false);
      void syncCanvas();
    }
  };

  return {run, isStreaming};
}