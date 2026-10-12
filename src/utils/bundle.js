// utils/bundle.js
// 打包/解包 .ocbch / .ocbst / .ocbs

import JSZip from 'jszip';
import {
  addTemplate,
  addSave,
  genId,
  updateTemplate,
} from './library';

/* ---------- 下载工具 ---------- */

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function fetchAsBlob(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('图片下载失败');
  return res.blob();
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/* ---------- 打包：角色 .ocbch ---------- */

export async function packCharacter(character, alsoImport = false) {
  const zip = new JSZip();

  let portraitFile = null;
  if (character.portraitUrl) {
    try {
      const blob = await fetchAsBlob(character.portraitUrl);
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      portraitFile = `portrait.${ext}`;
      zip.file(portraitFile, blob);
    } catch {
      /* 跳过 */
    }
  }

  const meta = {
    type: 'character',
    id: genId('char'),
    name: character.name,
    intro: character.intro || character.background?.slice(0, 60) || '',
    englishId: character.englishId || genId('char_en'),
    appearance: character.appearance || '',
    background: character.background || '',
    systemPrompt: character.systemPrompt || '',
    portraitFile,
    version: 1,
    createdAt: new Date().toISOString(),
  };

  zip.file('character.json', JSON.stringify(meta, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `${meta.englishId}.ocbch`);

  if (alsoImport) {
    const buf = await blob.arrayBuffer();
    const bundleData = arrayBufferToBase64(buf);
    await addTemplate({
      ...meta,
      bundleData,
      importedAt: new Date().toISOString(),
    });
  }

  return meta;
}

/* ---------- 打包：故事 .ocbst ---------- */

export async function packStory(story, characters = [], alsoImport = false) {
  const zip = new JSZip();

  const meta = {
    type: 'story',
    id: genId('story'),
    title: story.title,
    intro: story.intro || story.storyContext?.slice(0, 60) || '',
    englishId: story.englishId || genId('story_en'),
    characterIds: story.characterIds || [],
    storyContext: story.storyContext || '',
    userRole: story.userRole || '',
    version: 1,
    createdAt: new Date().toISOString(),
  };

  zip.file('story.json', JSON.stringify(meta, null, 2));

  if (characters.length) {
    const snapshot = characters.map((c) => ({
      id: c.id,
      name: c.name,
      systemPrompt: c.systemPrompt,
      appearance: c.appearance,
      background: c.background,
      portraitFile: c.portraitFile || null,
    }));
    zip.file('characters.json', JSON.stringify(snapshot, null, 2));
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `${meta.englishId}.ocbst`);

  if (alsoImport) {
    const buf = await blob.arrayBuffer();
    const bundleData = arrayBufferToBase64(buf);
    await addTemplate({
      ...meta,
      bundleData,
      importedAt: new Date().toISOString(),
    });
  }

  return meta;
}

/* ---------- 打包：存档 .ocbs ---------- */

export function packSave(save) {
  const data = {
    type: 'save',
    id: save.id,
    templateId: save.templateId,
    englishId: save.englishId,
    templateName: save.templateName || '',
    totalMessages: (save.messages || []).length,
    messages: save.messages || [],
    userRole: save.userRole || '',
    version: 1,
    createdAt: save.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  downloadBlob(blob, `${data.englishId}_${data.id}.ocbs`);
}

/* ---------- 解包：导入模板 ---------- */

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
}

export async function importTemplate(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith('.ocbs')) {
    throw new Error('这是存档文件，请到"继续聊天"处导入');
  }
  if (!name.endsWith('.ocbch') && !name.endsWith('.ocbst')) {
    throw new Error('仅支持 .ocbch 与 .ocbst');
  }

  const buf = await readFileAsArrayBuffer(file);
  const zip = await JSZip.loadAsync(buf);

  const charEntry = zip.file('character.json');
  const storyEntry = zip.file('story.json');

  let meta = null;
  if (charEntry) meta = JSON.parse(await charEntry.async('string'));
  else if (storyEntry) meta = JSON.parse(await storyEntry.async('string'));
  else throw new Error('压缩包中未找到 character.json 或 story.json');

  const bundleData = arrayBufferToBase64(buf);

  const record = {
    ...meta,
    bundleData,
    importedAt: new Date().toISOString(),
  };
  await addTemplate(record);
  return record;
}

/* ---------- 动态解压立绘 ---------- */

const portraitCache = new Map(); // id -> blob url

export async function resolvePortrait(template) {
  if (!template) return null;

  if (portraitCache.has(template.id)) {
    return portraitCache.get(template.id);
  }

  if (!template.bundleData || !template.portraitFile) return null;

  try {
    const buf = base64ToArrayBuffer(template.bundleData);
    const zip = await JSZip.loadAsync(buf);
    const entry = zip.file(template.portraitFile);
    if (!entry) return null;

    const blob = await entry.async('blob');
    const url = URL.createObjectURL(blob);
    portraitCache.set(template.id, url);
    return url;
  } catch {
    return null;
  }
}

export function clearPortraitCache(id) {
  if (id) {
    const url = portraitCache.get(id);
    if (url) URL.revokeObjectURL(url);
    portraitCache.delete(id);
  } else {
    portraitCache.forEach((url) => URL.revokeObjectURL(url));
    portraitCache.clear();
  }
}

/* ---------- 解包：导入存档 ---------- */

export async function importSave(file) {
  const name = file.name.toLowerCase();
  if (!name.endsWith('.ocbs')) {
    throw new Error('存档文件后缀必须为 .ocbs');
  }
  const text = await file.text();
  const json = JSON.parse(text);
  if (json.type !== 'save' || !Array.isArray(json.messages)) {
    throw new Error('存档格式无效');
  }
  json.id = json.id || genId('save');
  json.importedAt = new Date().toISOString();
  await addSave(json);
  return json;
}