// pages/Settings.jsx
// 模型设置与用户昵称（纯 localStorage）

import { useState } from 'react';
import {
  getSettings,
  saveSettings,
  getActiveModelConfig,
  PROVIDERS,
} from '../utils/settings';
import { pingLLM } from '../api/llm';
import { getLocalUserName, setLocalUserName } from '../utils/localUser';

export default function Settings() {
  const [settings, setSettingsState] = useState(getSettings());
  const [nickname, setNickname] = useState(getLocalUserName());
  const [testingLLM, setTestingLLM] = useState(false);
  const [llmTestResult, setLlmTestResult] = useState(null);
  const [savedTip, setSavedTip] = useState('');

  const set = (patch) => setSettingsState((s) => ({ ...s, ...patch }));

  const setApiKey = (provider, value) => {
    setSettingsState((s) => ({
      ...s,
      apiKeys: { ...s.apiKeys, [provider]: value },
    }));
  };

  const setModel = (provider, value) => {
    setSettingsState((s) => ({
      ...s,
      models: { ...s.models, [provider]: value },
    }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setLocalUserName(nickname);
    setSavedTip('设置已保存');
    setTimeout(() => setSavedTip(''), 2000);
  };

  const handleTestLLM = async () => {
    saveSettings(settings);
    setTestingLLM(true);
    setLlmTestResult(null);
    setLlmTestResult(await pingLLM());
    setTestingLLM(false);
  };

  const activeModel = getActiveModelConfig();
  const currentProvider = PROVIDERS[settings.provider];

  return (
    <div className="page">
      <h2>设置</h2>

      {/* ---------- AI 对话模型 ---------- */}
      <section className="settings-section">
        <h3 className="settings-title">AI 对话模型</h3>

        <div className="switch-row">
          <div className="switch-label">
            <strong>当前使用：{activeModel.name}</strong>
            <span className="meta">
              {activeModel.model} · {activeModel.baseUrl || '未配置'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>模型厂商</label>
          <div className="provider-grid">
            {Object.entries(PROVIDERS).map(([key, p]) => (
              <button
                key={key}
                type="button"
                className={`provider-btn ${
                  settings.provider === key ? 'active' : ''
                }`}
                onClick={() => set({ provider: key })}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {currentProvider && (
          <>
            <div className="form-group">
              <label>{currentProvider.name} API Key</label>
              <input
                type="password"
                value={settings.apiKeys[settings.provider] || ''}
                onChange={(e) => setApiKey(settings.provider, e.target.value)}
                placeholder="填写该厂商的 API Key"
              />
            </div>

            <div className="form-group">
              <label>模型名称</label>
              <select
                value={
                  settings.models[settings.provider] ||
                  currentProvider.defaultModel
                }
                onChange={(e) => setModel(settings.provider, e.target.value)}
              >
                {currentProvider.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Base URL（自动填充）</label>
              <input
                value={currentProvider.baseUrl}
                readOnly
                style={{ background: '#f5f6f8', color: '#666' }}
              />
            </div>
          </>
        )}

        <div className="toolbar">
          <button className="primary" onClick={handleSave}>
            保存设置
          </button>
          <button onClick={handleTestLLM} disabled={testingLLM}>
            {testingLLM ? '测试中...' : '测试模型连接'}
          </button>
          {savedTip && <span className="tip-ok">{savedTip}</span>}
        </div>

        {llmTestResult && (
          <div className={llmTestResult.ok ? 'tip-ok' : 'tip-err'}>
            {llmTestResult.ok
              ? `连接成功：${llmTestResult.provider} / ${llmTestResult.model}`
              : `连接失败：${llmTestResult.error}`}
          </div>
        )}
      </section>

      {/* ---------- 图像生成 ---------- */}
      <section className="settings-section">
        <h3 className="settings-title">图像生成（Agnes AI）</h3>

        <div className="form-group">
          <label>Agnes AI API Key</label>
          <input
            type="password"
            value={settings.apiKeys.agnes || ''}
            onChange={(e) => setApiKey('agnes', e.target.value)}
            placeholder="填写 Agnes AI 的 API Key"
          />
        </div>

        <div className="toolbar">
          <button className="primary" onClick={handleSave}>
            保存设置
          </button>
        </div>

        <ul className="settings-note" style={{ marginTop: 12 }}>
          <li>申请地址：https://agnes-ai.cn</li>
          <li>用于角色立绘生成，留空则创建角色时无法生成立绘。</li>
        </ul>
      </section>

      {/* ---------- 用户 ---------- */}
      <section className="settings-section">
        <h3 className="settings-title">用户</h3>
        <div className="form-group">
          <label>你的昵称</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
      </section>

      {/* ---------- 说明 ---------- */}
      <section className="settings-section">
        <h3 className="settings-title">说明</h3>
        <ul className="settings-note">
          <li>切换模型厂商后，下一次发送消息即使用新模型，无需刷新。</li>
          <li>API Key 仅保存在浏览器 localStorage，不会上传到任何服务器。</li>
          <li>
            各厂商 Key 申请地址：Kimi（platform.moonshot.cn）、OpenAI（platform.openai.com）、
            通义千问（bailian.console.aliyun.com）、豆包（console.volcengine.com/ark）。
          </li>
        </ul>
      </section>
    </div>
  );
}