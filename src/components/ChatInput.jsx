// components/ChatInput.jsx
// 输入框：Enter 发送，Shift+Enter 换行

import { useState } from 'react';

export default function ChatInput({ onSend, disabled, placeholder }) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-bar">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || '输入你的行动或对话...（Enter 发送，Shift+Enter 换行）'}
        rows={2}
        disabled={disabled}
      />
      <button
        type="button"
        className="primary"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
      >
        {disabled ? '生成中' : '发送'}
      </button>
    </div>
  );
}