import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {Node} from "@xyflow/react";
import {nodeTypeProperties} from "@/lib/styles.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateStr: string): string {
  console.log(dateStr)
  const diff = Date.now() - new Date(Number(dateStr)).getTime();
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
  switch (node.type) {
    case 'promptNode':
      return nodeTypeProperties.promptNode.color;
    case 'textNode':
      return nodeTypeProperties.textNode.color;
    case 'mergeNode':
      return nodeTypeProperties.mergeNode.color;
    case 'summaryNode':
      return nodeTypeProperties.summaryNode.color;
    default:
      return 'gray';
  }
}