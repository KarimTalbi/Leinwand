import api from '@/api';
import {AnyNodeType, Section} from "@/types.ts";

export type MergeResult = {
  context: Section[];
  problems: string;
  has_issues: boolean;
};

export async function mergeNodes(node: AnyNodeType, checkStreams: boolean): Promise<MergeResult> {
  const res = await api.post('/llm/merge/', {...node, check_consistencies: checkStreams});
  return res.data;
}

export async function resolveMerge(node: AnyNodeType): Promise<{ context: Section[] }> {
  const res = await api.post('/llm/merge/resolve/', {...node});
  return res.data;
}