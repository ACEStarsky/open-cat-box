// pages/StoryCreate.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StorySetup from '../components/StorySetup';
import { getTemplates } from '../utils/library';
import { packStory } from '../utils/bundle';

export default function StoryCreate() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    title: '',
    intro: '',
    englishId: '',
    characterIds: [],
    storyContext: '',
    userRole: '',
  });
  const [packing, setPacking] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await getTemplates();
      setTemplates(list.filter((t) => t.type === 'character'));
    })();
  }, []);

  const handlePack = async () => {
    if (!form.title.trim()) return alert('请填写故事标题');
    if (!form.englishId.trim()) return alert('请填写英文标识符');
    if (!form.characterIds.length) return alert('请至少选择一个角色');

    setPacking(true);
    try {
      const refs = templates.filter((t) => form.characterIds.includes(t.id));
      // 第三个参数 true：创建后同时导入本地库
      await packStory(form, refs, true);
      alert('已生成 .ocbst 文件，并导入本地库');
      navigate('/');
    } catch (e) {
      alert('打包失败：' + e.message);
    } finally {
      setPacking(false);
    }
  };

  return (
    <div className="page">
      <h2>创建故事</h2>

      <div className="form-group">
        <label>故事标题</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>英文标识符</label>
        <input
          value={form.englishId}
          onChange={(e) => setForm({ ...form, englishId: e.target.value })}
          placeholder="例如 mist_forest"
        />
      </div>

      <div className="form-group">
        <label>简介</label>
        <input
          value={form.intro}
          onChange={(e) => setForm({ ...form, intro: e.target.value })}
        />
      </div>

      <StorySetup
        value={form}
        onChange={setForm}
        characters={templates.map((t) => ({
          _id: t.id,
          name: t.name,
          portraitUrl: t._portraitUrl || null,
        }))}
      />

      <div className="toolbar">
        <button className="primary" onClick={handlePack} disabled={packing}>
          {packing ? '打包中...' : '下载 .ocbst 文件'}
        </button>
        <button onClick={() => navigate('/')}>返回广场</button>
      </div>
    </div>
  );
}