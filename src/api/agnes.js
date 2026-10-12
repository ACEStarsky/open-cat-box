// api/agnes.js
// Agnes AI 图像生成调用封装
// 文档：https://agnes-ai.cn

const AGNES_BASE = 'https://api.agnes-ai.cn/v1';
const API_KEY = import.meta.env.VITE_AGNES_API_KEY;
const MODEL = 'agnes-image-2.0-flash';

/**
 * 文生图，返回图片 URL
 * @param {string} prompt - 外貌描述
 * @param {string} size - '1024x768' | '1024x1024' | '768x1024'
 * @returns {Promise<string>} 图片 URL
 */
export async function generatePortrait(prompt, size = '1024x768') {
  if (!API_KEY) {
    throw new Error('未配置 VITE_AGNES_API_KEY');
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