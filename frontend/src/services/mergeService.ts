import api from '@/api';
import {AnyNodeType, Section} from "@/types.ts";

export type MergeResult = {
  context: Section[];
  problems: string;
  has_issues: boolean;
};

/**
 * Sends a merge node to the backend to analyse incoming streams for conflicts.
 * @param checkStreams - When true, the server also checks for cross-stream consistency issues.
 */
export async function mergeNodes(node: AnyNodeType, checkStreams: boolean): Promise<MergeResult> {
  const res = await api.post('/llm/merge/', {...node, check_consistencies: checkStreams});
  return res.data;
}

/** Asks the LLM to resolve previously detected merge conflicts and returns the unified context. */
export async function resolveMerge(node: AnyNodeType): Promise<{ context: Section[] }> {
  const res = await api.post('/llm/merge/resolve/', {...node});
  return res.data;
}