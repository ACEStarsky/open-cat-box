// components/ChatMessage.jsx
// 消息气泡：支持流式光标与括号内容高亮

function renderContent(text) {
  if (!text) return null;

  // 将 (动作) 与 [心理] 分别标记为 span，其余原样
  const regex = /(\([^)]*\)|\[[^\]]*\])/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (/^\(.*\)$/.test(part)) {
      return (
        <span key={i} className="action-text">
          {part}
        </span>
      );
    }
    if (/^\[.*\]$/.test(part)) {
      return (
        <span key={i} className="inner-text">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatMessage({ role, content, streaming }) {
  return (
    <div className={`message ${role}`}>
      <div className="message-content">
        {renderContent(content)}
        {streaming && <span className="cursor">|</span>}
      </div>
    </div>
  );
}