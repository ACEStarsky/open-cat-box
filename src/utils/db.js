// utils/db.js
// IndexedDB 极简封装

const DB_NAME = 'ocb_db';
const DB_VERSION = 1;
const STORE_TEMPLATES = 'templates';
const STORE_SAVES = 'saves';

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_TEMPLATES)) {
        db.createObjectStore(STORE_TEMPLATES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SAVES)) {
        db.createObjectStore(STORE_SAVES, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return dbPromise;
}

async function tx(storeName, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    let result;
    try {
      result = fn(store);
    } catch (e) {
      reject(e);
      return;
    }
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/* ---------- 通用 CRUD ---------- */

export async function dbPut(storeName, value) {
  return tx(storeName, 'readwrite', (store) => store.put(value));
}

export async function dbGet(storeName, key) {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readonly');
  return reqToPromise(transaction.objectStore(storeName).get(key));
}

export async function dbGetAll(storeName) {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readonly');
  return reqToPromise(transaction.objectStore(storeName).getAll());
}

export async function dbDelete(storeName, key) {
  return tx(storeName, 'readwrite', (store) => store.delete(key));
}

export async function dbClear(storeName) {
  return tx(storeName, 'readwrite', (store) => store.clear());
}

export const STORES = {
  TEMPLATES: STORE_TEMPLATES,
  SAVES: STORE_SAVES,
};