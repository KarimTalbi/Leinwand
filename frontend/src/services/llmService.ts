import {BASE_URL} from '@/api';

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