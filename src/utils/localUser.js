// utils/localUser.js

const UID_KEY = 'ai_roleplay_local_uid';
const NAME_KEY = 'ai_roleplay_local_name';

function randomId() {
  return 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getLocalUserId() {
  let uid = localStorage.getItem(UID_KEY);
  if (!uid) {
    uid = randomId();
    localStorage.setItem(UID_KEY, uid);
  }
  return uid;
}

export function getLocalUserName() {
  return localStorage.getItem(NAME_KEY) || '匿名旅人';
}

export function setLocalUserName(name) {
  localStorage.setItem(NAME_KEY, name || '匿名旅人');
}