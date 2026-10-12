// hooks/useStreamingChat.js
// 流式对话 Hook

import { useState, useRef, useCallback } from 'react';
import { streamChat } from '../api/llm';

export function useStreamingChat({ buildMessages, onFinish } = {}) {
  const [messages, setMessages] = useState([]);
  const [streamText, setStreamText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const send = useCallback(
    async (userText) => {
      if (!userText?.trim() || streaming) return;

      const userMsg = { role: 'user', content: userText.trim() };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setStreamText('');
      setError(null);
      setStreaming(true);

      const apiMessages = buildMessages
        ? buildMessages(nextMessages)
        : nextMessages;

      const controller = new AbortController();
      abortRef.current = controller;

      let accumulated = '';

      await streamChat(apiMessages, {
        signal: controller.signal,
        onChunk: (chunk) => {
          accumulated += chunk;
          setStreamText(accumulated);
        },
        onDone: () => {
          const assistantMsg = { role: 'assistant', content: accumulated };
          const finalMessages = [...nextMessages, assistantMsg];
          setMessages(finalMessages);
          setStreamText('');
          setStreaming(false);
          abortRef.current = null;
          onFinish?.(finalMessages);
        },
        onError: (e) => {
          setError(e);
          setStreaming(false);
          setStreamText('');
          abortRef.current = null;
        },
      });
    },
    [messages, streaming, buildMessages, onFinish]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const reset = useCallback((initial = []) => {
    setMessages(initial);
    setStreamText('');
    setStreaming(false);
    setError(null);
  }, []);

  return {
    messages,
    streamText,
    streaming,
    error,
    send,
    stop,
    reset,
    setMessages,
  };
}