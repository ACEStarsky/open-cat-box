// pages/Playground.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { useStreamingChat } from '../hooks/useStreamingChat';
import { getTemplate, getSave, addSave, updateSave } from '../utils/library';
import { packSave, resolvePortrait } from '../utils/bundle';

export default function Playground() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [save, setSave] = useState(null);
  const [template, setTemplate] = useState(null);
  const [portraitUrl, setPortraitUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);

      let currentSave = location.state?.existingSave;
      let tpl = location.state?.template;

      if (!currentSave) currentSave = await getSave(sessionId);
      if (!tpl && currentSave) tpl = await getTemplate(currentSave.templateId);

      if (!tpl && location.state?.newSave) {
        const s = location.state.newSave;
        await addSave(s);
        currentSave = s;
        tpl = location.state.template;
      }

      if (!currentSave) {
        alert('存档不存在');
        navigate('/chat-picker');
        return;
      }
      if (!tpl) {
        alert('未找到对应模板，请先导入模板');
        navigate('/');
        return;
      }

      const existing = await getSave(currentSave.id);
      if (!existing) await addSave(currentSave);

      setSave(currentSave);
      setTemplate(tpl);
      setLoading(false);

      const url = await resolvePortrait(tpl);
      if (url) setPortraitUrl(url);
    })();
  }, [sessionId, location.state, navigate]);

  const buildMessages = useCallback(
    (history) => {
      if (!template || !save) return history;

      const sys =
        template.systemPrompt ||
        (template.type === 'story'
          ? `故事背景：${template.storyContext}。用户扮演：${template.userRole}。动作描写用英文小括号，心理描写用中文中括号。`
          : `你扮演「${template.name}」。${template.background}。`);

      return [{ role: 'system', content: sys }, ...history];
    },
    [template, save]
  );

  const handleFinish = useCallback(
    async (finalMessages) => {
      if (!save) return;
      const updated = await updateSave(save.id, {
        messages: finalMessages,
        totalMessages: finalMessages.length,
      });
      if (updated) setSave(updated);
    },
    [save]
  );

  const { messages, streamText, streaming, send, stop, reset } =
    useStreamingChat({ buildMessages, onFinish: handleFinish });

  useEffect(() => {
    if (save) reset(save.messages || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  if (loading) return <div className="page">加载中...</div>;
  if (!save || !template) return <div className="page">存档无效</div>;

  return (
    <div className="playground">
      <div className="playground-sidebar">
        <div className="sidebar-character">
          {portraitUrl ? (
            <img src={portraitUrl} alt={template.name || template.title} />
          ) : (
            <div className="card-placeholder">
              {(template.name || template.title || '?').slice(0, 1)}
            </div>
          )}
          <h4>{template.name || template.title}</h4>
          <p className="meta" style={{ padding: '0 10px 10px' }}>
            {template.intro}
          </p>
        </div>
      </div>

      <div className="playground-main">
        <div className="messages">
          {messages.length === 0 && !streamText && (
            <p className="empty">
              开始你的故事吧。你扮演：{save.userRole || '一位旅人'}
            </p>
          )}

          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}

          {streamText && (
            <ChatMessage role="assistant" content={streamText} streaming />
          )}

          <div ref={bottomRef} />
        </div>

        <ChatInput
          onSend={send}
          disabled={streaming}
          placeholder={
            streaming ? '生成中，点击停止可中断' : '输入你的行动或对话...'
          }
        />

        <div className="input-bar" style={{ borderTop: 'none', paddingTop: 0 }}>
          <button onClick={() => packSave(save)}>导出存档</button>
          <button onClick={stop} disabled={!streaming}>
            停止生成
          </button>
          <button onClick={() => navigate('/chat-picker')}>存档列表</button>
        </div>
      </div>
    </div>
  );
}