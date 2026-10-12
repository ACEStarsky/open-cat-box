// utils/library.js
// 模板库与存档库（IndexedDB）

import { dbPut, dbGet, dbGetAll, dbDelete, STORES } from './db';

/* ---------- 模板 ---------- */

export async function getTemplates() {
  const list = await dbGetAll(STORES.TEMPLATES);
  return list.sort(
    (a, b) => new Date(b.importedAt || 0) - new Date(a.importedAt || 0)
  );
}

export async function getTemplate(id) {
  return dbGet(STORES.TEMPLATES, id);
}

export async function addTemplate(tpl) {
  await dbPut(STORES.TEMPLATES, tpl);
  return tpl;
}

export async function updateTemplate(id, patch) {
  const cur = await getTemplate(id);
  if (!cur) return null;
  const next = { ...cur, ...patch };
  await dbPut(STORES.TEMPLATES, next);
  return next;
}

export async function removeTemplate(id) {
  await dbDelete(STORES.TEMPLATES, id);
}

/* ---------- 存档 ---------- */

export async function getSaves() {
  const list = await dbGetAll(STORES.SAVES);
  return list.sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt || 0) -
      new Date(a.updatedAt || a.createdAt || 0)
  );
}

export async function getSave(id) {
  return dbGet(STORES.SAVES, id);
}

export async function addSave(save) {
  await dbPut(STORES.SAVES, save);
  return save;
}

export async function updateSave(id, patch) {
  const cur = await getSave(id);
  if (!cur) return null;
  const next = {
    ...cur,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await dbPut(STORES.SAVES, next);
  return next;
}

export async function removeSave(id) {
  await dbDelete(STORES.SAVES, id);
}

/* ---------- 工具 ---------- */

export function genId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}