import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {Node} from "@xyflow/react";
import {typeProps} from "@/lib/styles.ts";
import {NodeTypeNames} from "@/types.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: number): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function getNodeColor(node: Node): string {
  const nodeType = node.type as NodeTypeNames;
  if (!nodeType) return 'gray';
  return typeProps[nodeType].color;
}
