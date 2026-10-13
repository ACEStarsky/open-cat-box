// api/agnes.js
// Agnes AI 图像生成
// API Key 从 localStorage 读取（设置页填写）

import { getAgnesKey } from '../utils/settings';

const AGNES_BASE = '/api/agnes';
const MODEL = 'agnes-image-2.0-flash';

/**
 * 文生图，返回图片 URL
 * @param {string} prompt - 外貌描述
 * @param {string} size - '1024x768' | '1024x1024' | '768x1024'
 * @returns {Promise<string>} 图片 URL
 */
export async function generatePortrait(prompt, size = '1024x768') {
  const API_KEY = getAgnesKey();
  if (!API_KEY) {
    throw new Error('未配置 Agnes AI 的 API Key，请到设置页填写');
  }

  const res = await fetch(`${AGNES_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: `角色立绘，${prompt}，视觉小说风格，清晰细节，柔和光照`,
      size,
      extra_body: { response_format: 'url' },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Agnes AI 图像生成失败');
  }
  return data.data[0].url;
}
