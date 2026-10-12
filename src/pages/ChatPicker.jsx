// pages/ChatPicker.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSaves, removeSave } from '../utils/library';
import { importSave, packSave } from '../utils/bundle';

export default function ChatPicker() {
  const navigate = useNavigate();
  const [saves, setSaves] = useState([]);
  const fileRef = useRef();

  const refresh = async () => setSaves(await getSaves());

  useEffect(() => {
    refresh();
  }, []);

  const handleImport = async (e) => {
    const files = Array.from(e.target.files || []);
    let ok = 0;
    let fail = 0;
    for (const f of files) {
      try {
        await importSave(f);
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

  const handleDelete = async (id) => {
    if (!confirm('删除该存档？')) return;
    await removeSave(id);
    await refresh();
  };

  return (
    <div className="page">
      <h2>继续聊天</h2>

      <div className="toolbar">
        <button className="primary" onClick={() => fileRef.current.click()}>
          导入存档
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".ocbs"
          multiple
          style={{ display: 'none' }}
          onChange={handleImport}
        />
        <button onClick={() => navigate('/')}>返回广场</button>
      </div>

      {saves.length === 0 ? (
        <p className="empty">
          还没有存档。从广场的模板卡片点"创建存档"，或导入一个 .ocbs 文件。
        </p>
      ) : (
        <div className="list">
          {saves.map((s) => (
            <div key={s.id} className="list-item">
              <div className="list-main">
                <strong>{s.templateName || s.englishId}</strong>
                <span className="meta">
                  消息 {s.totalMessages || s.messages?.length || 0} 条
                </span>
                <span className="meta">标识 {s.englishId}</span>
                <span className="meta">
                  更新 {new Date(s.updatedAt).toLocaleString()}
                </span>
              </div>
              <div className="actions">
                <button
                  className="primary"
                  onClick={() =>
                    navigate(`/play/${s.id}`, {
                      state: { existingSave: s },
                    })
                  }
                >
                  继续
                </button>
                <button onClick={() => packSave(s)}>导出</button>
                <button className="danger" onClick={() => handleDelete(s.id)}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}