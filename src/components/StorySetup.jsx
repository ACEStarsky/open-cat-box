// components/StorySetup.jsx
// 故事创建表单：选择角色、填写剧情与用户身份

export default function StorySetup({
  value,
  onChange,
  characters = [],
}) {
  const set = (field) => (e) =>
    onChange({ ...value, [field]: e.target.value });

  const toggleCharacter = (id) => {
    const ids = new Set(value.characterIds || []);
    if (ids.has(id)) {
      ids.delete(id);
    } else {
      if (ids.size >= 10) {
        alert('最多选择 10 个角色');
        return;
      }
      ids.add(id);
    }
    onChange({ ...value, characterIds: [...ids] });
  };

  return (
    <>
      <div className="form-group">
        <label>故事标题</label>
        <input
          value={value.title}
          onChange={set('title')}
          placeholder="例如：迷雾森林的清晨"
        />
      </div>

      <div className="form-group">
        <label>
          选择出演角色（1-10 个，已选 {(value.characterIds || []).length}）
        </label>
        {characters.length === 0 ? (
          <p className="empty small">暂无角色，请先创建角色</p>
        ) : (
          <div className="character-select-grid">
            {characters.map((c) => {
              const selected = (value.characterIds || []).includes(c._id);
              return (
                <div
                  key={c._id}
                  className={`character-select-item ${selected ? 'selected' : ''}`}
                  onClick={() => toggleCharacter(c._id)}
                >
                  {c.portraitUrl && <img src={c.portraitUrl} alt={c.name} />}
                  <span>{c.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>剧情世界观与事件</label>
        <textarea
          rows={5}
          value={value.storyContext}
          onChange={set('storyContext')}
          placeholder="故事发生在...，主要事件是..."
        />
      </div>

      <div className="form-group">
        <label>用户扮演的身份</label>
        <input
          value={value.userRole}
          onChange={set('userRole')}
          placeholder="例如：一位失忆的旅人"
        />
      </div>
    </>
  );
}