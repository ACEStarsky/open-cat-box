// components/CharacterForm.jsx
// 受控表单：由父组件管理 state 与提交

export default function CharacterForm({ value, onChange, onGenerate, generating }) {
  const set = (field) => (e) =>
    onChange({ ...value, [field]: e.target.value });

  return (
    <>
      <div className="form-group">
        <label>角色名称</label>
        <input
          value={value.name}
          onChange={set('name')}
          placeholder="例如：艾莉娅"
        />
      </div>

      <div className="form-group">
        <label>外貌描述（用于生成立绘）</label>
        <textarea
          rows={3}
          value={value.appearance}
          onChange={set('appearance')}
          placeholder="银白色长发，红色瞳孔，身穿深紫色法师长袍，手持水晶法杖"
        />
        {onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
          >
            {generating ? '生成中...' : '生成立绘'}
          </button>
        )}
      </div>

      <div className="form-group">
        <label>人物背景</label>
        <textarea
          rows={4}
          value={value.background}
          onChange={set('background')}
          placeholder="身世、性格、世界观设定..."
        />
      </div>

      <div className="form-group">
        <label>角色 Prompt（可选，留空自动生成）</label>
        <textarea
          rows={3}
          value={value.systemPrompt}
          onChange={set('systemPrompt')}
          placeholder="用于驱动 Kimi 大模型进行角色扮演的系统提示词"
        />
      </div>
    </>
  );
}