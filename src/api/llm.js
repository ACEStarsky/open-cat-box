// api/llm.js
// 多厂商统一对话调用封装

import { getActiveModelConfig } from '../utils/settings';

export async function streamChat(messages, options = {}) {
  const { onChunk, onDone, onError, signal } = options;
  const cfg = getActiveModelConfig();

  if (!cfg.apiKey) {
    onError?.(new Error(`未配置 ${cfg.name} 的 API Key，请到设置页填写`));
    return;
  }

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          model: cfg.model,
          messages,
          stream: true,
          temperature: 0.8,
          max_tokens: 2048,
        }),
        signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            onDone?.();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) onChunk?.(delta);
          } catch {
            // 忽略不完整片段
          }
        }
      }
      onDone?.();
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
      if (attempt === maxRetries) {
        onError?.(e);
        return;
      }
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}

export async function generateText(messages) {
  const cfg = getActiveModelConfig();
  if (!cfg.apiKey) throw new Error(`未配置 ${cfg.name} 的 API Key`);

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || '调用失败');
  return data.choices[0].message.content;
}

export async function pingLLM() {
  const cfg = getActiveModelConfig();
  if (!cfg.apiKey) {
    return { ok: false, provider: cfg.name, model: cfg.model, error: '未配置 API Key' };
  }
  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 5,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        ok: false,
        provider: cfg.name,
        model: cfg.model,
        error: err?.error?.message || `HTTP ${res.status}`,
      };
    }
    return { ok: true, provider: cfg.name, model: cfg.model };
  } catch (e) {
    return { ok: false, provider: cfg.name, model: cfg.model, error: e.message };
  }
}