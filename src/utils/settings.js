// utils/settings.js
// 模型设置（全部 localStorage）

const KEY = 'ocb_settings';

export const PROVIDERS = {
  kimi: {
    name: 'Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'kimi-k2.6',
    models: ['kimi-k2.6', 'kimi-k2.5', 'kimi-k2-0905-preview'],
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'o3'],
  },
  qwen: {
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen3-max'],
  },
  doubao: {
    name: '豆包',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'doubao-seed-1-6-250615',
    models: ['doubao-seed-1-6-250615', 'doubao-seed-1-6-flash-250615'],
  },
};

const DEFAULT_SETTINGS = {
  provider: 'kimi',
  apiKeys: {
    kimi: '',
    openai: '',
    qwen: '',
    doubao: '',
    agnes: '',
  },
  models: {
    kimi: PROVIDERS.kimi.defaultModel,
    openai: PROVIDERS.openai.defaultModel,
    qwen: PROVIDERS.qwen.defaultModel,
    doubao: PROVIDERS.doubao.defaultModel,
  },
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    const saved = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      apiKeys: { ...DEFAULT_SETTINGS.apiKeys, ...(saved.apiKeys || {}) },
      models: { ...DEFAULT_SETTINGS.models, ...(saved.models || {}) },
    };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function getActiveModelConfig() {
  const s = getSettings();
  const provider = s.provider || 'kimi';
  const def = PROVIDERS[provider];
  return {
    provider,
    name: def?.name || provider,
    baseUrl: def?.baseUrl || '',
    model: s.models?.[provider] || def?.defaultModel || '',
    apiKey: s.apiKeys?.[provider] || '',
    models: def?.models || [],
  };
}

/** Agnes AI Key（图像生成） */
export function getAgnesKey() {
  return getSettings().apiKeys?.agnes || '';
}