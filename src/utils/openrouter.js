export async function streamChat({ workerUrl, messages, settings, onChunk, onError }) {
  if (!workerUrl) {
    onError('Worker URL not configured. Set VITE_WORKER_URL in your environment and rebuild.');
    return;
  }

  const body = {
    model: settings.model,
    messages,
    stream: true,
    temperature: parseFloat(settings.temperature),
    safe_prompt: settings.safePrompt,
  };
  if (settings.maxTokens) {
    body.max_tokens = parseInt(settings.maxTokens, 10);
  }

  let res;
  try {
    res = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    onError(err.message || 'Network error');
    return;
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    onError(`API error ${res.status}: ${errText}`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') return;
      try {
        const chunk = JSON.parse(data);
        if (chunk.error) {
          onError(chunk.error.message || JSON.stringify(chunk.error));
          return;
        }
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch {
        // ignore malformed chunks
      }
    }
  }
}
