// pages/Square.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import { getTemplates, getSaves, removeTemplate } from '../utils/library';
import {
  importTemplate,
  resolvePortrait,
  clearPortraitCache,
} from '../utils/bundle';

export default function Square() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [saves, setSaves] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState('all');
  const [portraits, setPortraits] = useState({});
  const fileRef = useRef();

  const refresh = async () => {
    const [list, saveList] = await Promise.all([getTemplates(), getSaves()]);
    setTemplates(list);
    setSaves(saveList);

    for (const t of list) {
      if (!t.portraitFile) continue;
      const url = await resolvePortrait(t);
      if (url) setPortraits((prev) => ({ ...prev, [t.id]: url }));
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImport = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    let ok = 0;
    let fail = 0;
    for (const f of files) {
      try {
        await importTemplate(f);
        ok++;
      } catch (err) {
        fail++;
        console.error(f.name, err);
      }
    }
    await refresh();
    alert(`导入完成：成功 ${ok}，失败 ${fail}`);
    e.target.value = '';
  };

  const filtered = templates.filter((t) => {
    if (tab === 'character' && t.type !== 'character') return false;
    if (tab === 'story' && t.type !== 'story') return false;
    if (keyword) {
      const kw = keyword.toLowerCase();
      return [t.name, t.title, t.intro]
        .filter(Boolean)
        .some((s) => s.toLowerCase().includes(kw));
    }
    return true;
  });

  const handleCreateSave = (tpl) => {
    const id = `save_${Date.now().toString(36)}`;
    const save = {
      id,
      templateId: tpl.id,
      englishId: tpl.englishId,
      templateName: tpl.name || tpl.title,
      userRole: tpl.type === 'story' ? tpl.userRole || '一位旅人' : '一位旅人',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    navigate(`/play/${id}`, { state: { newSave: save, template: tpl } });
  };

  const handleStartChat = () => navigate('/chat-picker');

  const handleDelete = async (id) => {
    if (!confirm('删除该模板？已创建的存档不受影响。')) return;
    await removeTemplate(id);
    clearPortraitCache(id);
    await refresh();
  };

  return (
    <div className="square">
      <section className="square-header">
        <div className="square-search">
          <SearchBar value={keyword} onChange={setKeyword} />
          <div className="square-greeting">
            本地模板 {templates.length} 个 · 存档 {saves.length} 个
          </div>
        </div>
        <div className="square-actions">
          <button className="primary" onClick={() => fileRef.current.click()}>
            导入模板
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".ocbch,.ocbst"
            multiple
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <button onClick={handleStartChat}>开始聊天</button>
        </div>
      </section>

      <section className="square-body">
        <div className="tabs">
          <button
            className={tab === 'all' ? 'tab active' : 'tab'}
            onClick={() => setTab('all')}
          >
            全部
          </button>
          <button
            className={tab === 'character' ? 'tab active' : 'tab'}
            onClick={() => setTab('character')}
          >
            角色
          </button>
          <button
            className={tab === 'story' ? 'tab active' : 'tab'}
            onClick={() => setTab('story')}
          >
            故事
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="empty">
            还没有模板。点右上角"导入模板"，或去创建页制作一个。
          </p>
        ) : (
          <div className="card-grid">
            {filtered.map((t) => (
              <div key={t.id} className="square-card template-card">
                {portraits[t.id] ? (
                  <img src={portraits[t.id]} alt={t.name || t.title} />
                ) : (
                  <div className="card-placeholder">
                    {(t.name || t.title || '?').slice(0, 1)}
                  </div>
                )}
                <div className="card-body">
                  <strong>{t.name || t.title}</strong>
                  <p className="card-desc">{t.intro || '无简介'}</p>
                  <div className="card-footer">
                    <span className="badge">
                      {t.type === 'character' ? '角色' : '故事'}
                    </span>
                    <span className="meta">{t.englishId}</span>
                  </div>
                  <div className="template-actions">
                    <button
                      className="primary"
                      onClick={() => handleCreateSave(t)}
                    >
                      创建存档
                    </button>
                    <button onClick={() => handleDelete(t.id)}>删除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}