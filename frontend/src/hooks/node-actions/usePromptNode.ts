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
  const defaultModel = useStore((s) => s.defaultModel);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const syncCanvas = useStore((s) => s.syncCanvas);

  const run = async () => {
    if (!node) return;

    setIsStreaming(true);
    await syncCanvas()
    updateNodeData(nodeId, {model: defaultModel, response: ''});

    try {
      const token = localStorage.getItem('token') ?? '';
      const nodeWithModel = {...node, data: {...node.data, model: defaultModel}};

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