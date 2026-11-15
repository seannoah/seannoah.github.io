// sync.js — keeps progress in one file in a private GitHub repository, so it follows
// you between devices without a login service or database.
//
// Each device stores an access token (limited to that one repository) in its own
// localStorage. Syncing is: fetch the file, merge it with this device's copy, and
// write the result back if it changed.

import { state, merge, replaceState, canonical, onChange } from './store.js';

const CFG_KEY = 'woodshed.sync';
const FILE = 'progress.json';
const API = 'https://api.github.com';

export function defaultRepo() {
  const host = location.hostname;
  return host.endsWith('.github.io') ? `${host.split('.')[0]}/woodshed-data` : '';
}

export function config() {
  try { return JSON.parse(localStorage.getItem(CFG_KEY) || 'null') || { token: '', repo: defaultRepo() }; }
  catch (e) { return { token: '', repo: defaultRepo() }; }
}
export function setConfig(cfg) {
  localStorage.setItem(CFG_KEY, JSON.stringify({ token: (cfg.token || '').trim(), repo: (cfg.repo || '').trim() }));
}
export const isSetUp = () => { const c = config(); return !!(c.token && c.repo); };

// status: { phase: 'off' | 'syncing' | 'ok' | 'error', at, message }
export const status = { phase: isSetUpSafe() ? 'ok' : 'off', at: 0, message: '', pulled: false };
function isSetUpSafe() { try { return isSetUp(); } catch (e) { return false; } }
const watchers = new Set();
export const onStatus = (fn) => { watchers.add(fn); return () => watchers.delete(fn); };
function setStatus(phase, message = '', pulled = false) {
  status.phase = phase; status.message = message; status.at = Date.now(); status.pulled = pulled;
  for (const fn of watchers) fn(status);
}

const encode = (text) => {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const decode = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

async function call(path, options = {}) {
  const { token, repo } = config();
  const res = await fetch(`${API}/repos/${repo}/contents/${path}`, {
    cache: 'no-store',
    ...options,
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
  });
  return res;
}

function explain(res) {
  if (res.status === 401) return 'GitHub did not accept the token. It may be mistyped or expired.';
  if (res.status === 403) return 'The token is not allowed to do that. It needs read and write access to Contents.';
  if (res.status === 404) return 'Repository not found. Check its name, and that the token has access to it.';
  return `GitHub answered ${res.status}.`;
}

let running = null;

export function syncNow() {
  if (!isSetUp()) return Promise.resolve(false);
  if (running) return running;
  running = (async () => {
    setStatus('syncing');
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await call(FILE);
        let remote = null;
        let sha;
        if (res.status === 200) {
          const body = await res.json();
          sha = body.sha;
          try { remote = JSON.parse(decode(body.content)); } catch (e) { remote = null; }
        } else if (res.status !== 404) {
          setStatus('error', explain(res));
          return false;
        } else {
          // 404 is either "no file yet" (fine) or "no such repository" (not fine).
          const { token, repo } = config();
          const probe = await fetch(`${API}/repos/${repo}`, { cache: 'no-store', headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` } });
          if (!probe.ok) { setStatus('error', explain(probe)); return false; }
        }
        const merged = remote && remote.v === 1 ? merge(state, remote) : merge(state, {});
        const pulled = canonical(merged) !== canonical(state);
        if (pulled) replaceState(merged);
        if (remote && canonical(remote) === canonical(merged)) { setStatus('ok', '', pulled); return true; }
        const put = await call(FILE, {
          method: 'PUT',
          body: JSON.stringify({ message: 'Sync practice progress', content: encode(JSON.stringify(merged)), ...(sha ? { sha } : {}) }),
        });
        if (put.ok) { setStatus('ok', '', pulled); return true; }
        if (put.status !== 409 && put.status !== 422) { setStatus('error', explain(put)); return false; }
        // Another device wrote in between: go round again with the newer file.
      }
      setStatus('error', 'Two devices were syncing at once. Try again in a moment.');
      return false;
    } catch (e) {
      setStatus('error', navigator.onLine === false ? 'Offline. Progress is saved on this device and will sync later.' : 'Could not reach GitHub.');
      return false;
    } finally {
      running = null;
    }
  })();
  return running;
}

// Sync shortly after anything changes, when the app opens, and when it is put away.
let timer = 0;
export function startAutoSync() {
  onChange(() => { clearTimeout(timer); timer = setTimeout(syncNow, 4000); });
  document.addEventListener('visibilitychange', () => { if (isSetUp()) syncNow(); });
  window.addEventListener('online', () => syncNow());
  syncNow();
}
