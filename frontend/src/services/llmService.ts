import {BASE_URL} from '@/api';

/**
 * Sends a prompt node to the LLM streaming endpoint and calls `onChunk` with
 * the accumulated response text after each SSE token.
 * @returns The full accumulated response string.
 */
export async function streamingChat(
  node: unknown,
  token: string,
  onChunk: (accumulated: string) => void
): Promise<string> {
  const res = await fetch(`${BASE_URL}/llm/streaming_chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(node),
  });

  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`);
  }

  return readSSEStream(res.body, onChunk);
}

/**
 * Sends a summary node to the LLM summary endpoint and calls `onChunk` with
 * the accumulated response text after each SSE token.
 * @returns The full accumulated response string.
 */
export async function streamingSummary(
  node: unknown,
  token: string,
  onChunk: (accumulated: string) => void
): Promise<string> {
  const res = await fetch(`${BASE_URL}/llm/summary/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(node),
  });

  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`);
  }

  return readSSEStream(res.body, onChunk);
}

/**
 * Reads an SSE `ReadableStream`, concatenates `data:` lines into a running
 * string, calls `onChunk` after each decoded chunk, and returns the final
 * accumulated text when the stream closes or `[DONE]` is received.
 */
async function readSSEStream(
  body: ReadableStream<Uint8Array>,
  onChunk: (accumulated: string) => void
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  let buffer = '';

  while (true) {
    const {done, value} = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, {stream: true});
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const token = line.slice(6).replaceAll('\\n', '\n');
      if (token === '[DONE]') break;
      accumulated += token;
    }

    onChunk(accumulated);
  }

  if (buffer.startsWith('data: ')) {
    const token = buffer.slice(6).replaceAll('\\n', '\n');
    if (token !== '[DONE]') accumulated += token;
  }

  return accumulated;
}