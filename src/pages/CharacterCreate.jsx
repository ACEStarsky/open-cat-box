// pages/CharacterCreate.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterForm from '../components/CharacterForm';
import { generatePortrait } from '../api/agnes';
import { packCharacter } from '../utils/bundle';

export default function CharacterCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    intro: '',
    appearance: '',
    background: '',
    systemPrompt: '',
    englishId: '',
  });
  const [portraitUrl, setPortraitUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [packing, setPacking] = useState(false);

  const handleGenerate = async () => {
    if (!form.appearance.trim()) return alert('请先填写外貌描述');
    setGenerating(true);
    try {
      setPortraitUrl(await generatePortrait(form.appearance));
    } catch (e) {
      alert('立绘生成失败：' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePack = async () => {
    if (!form.name.trim()) return alert('请填写角色名称');
    if (!form.englishId.trim()) return alert('请填写英文标识符');

    setPacking(true);
    try {
      // 第二个参数 true：创建后同时导入本地库
      await packCharacter({ ...form, portraitUrl }, true);
      alert('已生成 .ocbch 文件，并导入本地库');
      navigate('/');
    } catch (e) {
      alert('打包失败：' + e.message);
    } finally {
      setPacking(false);
    }
  };

  return (
    <div className="page">
      <h2>创建角色</h2>

      <div className="form-group">
        <label>角色名称</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>英文标识符（用于文件名，建议纯英文字母）</label>
        <input
          value={form.englishId}
          onChange={(e) => setForm({ ...form, englishId: e.target.value })}
          placeholder="例如 aria"
        />
      </div>

      <div className="form-group">
        <label>简介</label>
        <input
          value={form.intro}
          onChange={(e) => setForm({ ...form, intro: e.target.value })}
          placeholder="一句话介绍角色"
        />
      </div>

      <CharacterForm
        value={form}
        onChange={setForm}
        onGenerate={handleGenerate}
        generating={generating}
      />

      {portraitUrl && (
        <div className="portrait-preview">
          <img src={portraitUrl} alt="角色立绘" />
        </div>
      )}

      <div className="toolbar">
        <button className="primary" onClick={handlePack} disabled={packing}>
          {packing ? '打包中...' : '下载 .ocbch 文件'}
        </button>
        <button onClick={() => navigate('/')}>返回广场</button>
      </div>
    </div>
  );
}