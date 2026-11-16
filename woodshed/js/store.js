// store.js — everything the app remembers: settings, a spaced-repetition record per
// practice item, and a per-day practice log. Kept in localStorage, and shaped so two
// devices' copies can be merged without losing anything (see merge()).

const KEY = 'woodshed.v1';
const DEVICE_KEY = 'woodshed.device';
const INTERVALS = [0, 1, 2, 4, 8, 16, 32]; // days until an item is due again, by box
export const LEARNED = 2;  // box at which an item counts as learned
export const SOLID = 4;    // box at which it counts as solid

const blank = () => ({
  v: 1,
  settings: { mode: 'away', minutes: 10, sound: true, bpm: 60 },
  settingsAt: 0,
  resetAt: 0,   // when progress was last erased; older records are dropped on merge
  items: {},  // id -> { b: box, d: due day number, n: times seen, r: times right, t: last seen (ms) }
  units: {},  // id -> { read: ms, on: ms }
  days: {},   // 'YYYY-MM-DD' -> { [device]: { n, ok, s } }
  songs: {},  // id -> { title, key, chart, melody, prefs, t } for your own tunes; { prefs, t } for built-in ones
  // the Ear tab, kept apart from the ladder's items so its games never change what is due:
  //   games: id -> { best: { [level]: most right in a round }, plays, t }
  //   stats: what was asked -> { n: times asked, x: times missed, t }
  ear: { games: {}, stats: {} },
});

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && raw.v === 1) return { ...blank(), ...raw, settings: { ...blank().settings, ...raw.settings }, ear: { ...blank().ear, ...raw.ear } };
  } catch (e) { /* corrupt or unavailable storage: start fresh */ }
  return blank();
}

export const state = typeof localStorage === 'undefined' ? blank() : load();

function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) { id = Math.random().toString(36).slice(2, 8); localStorage.setItem(DEVICE_KEY, id); }
    return id;
  } catch (e) { return 'local'; }
}
const DEVICE = typeof localStorage === 'undefined' ? 'test' : deviceId();

const listeners = new Set();
export const onChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export function save(silent = false) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  if (!silent) for (const fn of listeners) fn();
}

// ---- days ----
export function dayNumber(ms = Date.now()) {
  const d = new Date(ms);
  return Math.floor((ms - d.getTimezoneOffset() * 60000) / 86400000);
}
export function dayKey(ms = Date.now()) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// ---- items ----
export const rec = (id) => state.items[id];
export const isNew = (id) => !state.items[id];
export const box = (id) => (state.items[id] ? state.items[id].b : 0);
export const isDue = (id) => !!state.items[id] && state.items[id].d <= dayNumber();
export const isLearned = (id) => box(id) >= LEARNED;
export const everRight = (id) => !!state.items[id] && state.items[id].r > 0;

// result: 'right' | 'shaky' | 'wrong'
export function grade(id, result, seconds = 0) {
  const now = Date.now();
  const today = dayNumber(now);
  const it = state.items[id] || { b: 0, d: today, n: 0, r: 0, t: 0 };
  it.n += 1;
  it.t = now;
  if (result === 'right') {
    it.r += 1;
    it.b = Math.min(INTERVALS.length - 1, it.b + 1);
    it.d = today + INTERVALS[it.b];
  } else if (result === 'shaky') {
    it.b = Math.max(1, it.b);
    it.d = today + 1;
  } else {
    it.b = Math.max(0, it.b - 2);
    it.d = today;
  }
  state.items[id] = it;
  logPractice(result === 'right', seconds, now);
}

// One more exercise done today, on this device. Everything that counts as practice goes
// through here, so the streak and the calendar include the Ear tab.
export function logPractice(ok, seconds = 0, now = Date.now()) {
  const key = dayKey(now);
  const day = (state.days[key] = state.days[key] || {});
  const mine = (day[DEVICE] = day[DEVICE] || { n: 0, ok: 0, s: 0 });
  mine.n += 1;
  if (ok) mine.ok += 1;
  mine.s += Math.min(120, Math.round(seconds));
  save(true);
}

// ---- the Ear tab ----
export const earRecord = (id) => state.ear.games[id] || { best: {}, plays: 0, t: 0 };
// A finished round: keeps the best score at that level. Returns true if it is a new best.
export function recordRound(id, level, score) {
  const r = (state.ear.games[id] = state.ear.games[id] || { best: {}, plays: 0, t: 0 });
  const better = score > (r.best[level] || 0);
  if (better) r.best[level] = score;
  r.plays += 1;
  r.t = Date.now();
  save();
  return better;
}
// One answer: remembered by what was asked, so later rounds can lean on what is missed.
export function recordAnswer(key, ok) {
  if (!key) return;
  const s = (state.ear.stats[key] = state.ear.stats[key] || { n: 0, x: 0, t: 0 });
  // only the last thirty or so answers count, so an old weak spot can heal
  if (s.n >= 30) { s.n = Math.round(s.n * 0.8); s.x = Math.round(s.x * 0.8); }
  s.n += 1;
  if (!ok) s.x += 1;
  s.t = Date.now();
  save(true);
}

export function dayTotal(key) {
  const day = state.days[key];
  const total = { n: 0, ok: 0, s: 0 };
  if (day) for (const d of Object.values(day)) { total.n += d.n; total.ok += d.ok; total.s += d.s; }
  return total;
}

export function streak() {
  let count = 0;
  let ms = Date.now();
  if (dayTotal(dayKey(ms)).n === 0) ms -= 86400000; // today not practiced yet: the streak can still be alive
  while (dayTotal(dayKey(ms)).n > 0) { count++; ms -= 86400000; }
  return count;
}

// ---- units and settings ----
export function markUnit(id, field) {
  const u = (state.units[id] = state.units[id] || {});
  if (!u[field]) { u[field] = Date.now(); save(); }
}
export const unitFlag = (id, field) => !!(state.units[id] && state.units[id][field]);

export function setSetting(name, value) {
  state.settings[name] = value;
  state.settingsAt = Date.now();
  save();
}

export function resetAll() {
  const fresh = blank();
  fresh.settings = { ...state.settings };
  fresh.settingsAt = state.settingsAt || 0;
  fresh.resetAt = Date.now();
  fresh.songs = state.songs || {}; // erasing practice progress keeps your tunes
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, fresh);
  save();
}

// ---- merging two copies (this device and the synced file) ----
// Items: the most recently practiced record wins. Days: counts are kept per device, so
// merging is a union and can be repeated safely. Units: earliest timestamps are kept.
// Ear games: the best score at each level is kept; for the answer counts, the copy that
// has seen more wins. Anything older than the latest "erase progress" on either side is dropped.
export function merge(a, b) {
  const out = blank();
  const newer = (b.settingsAt || 0) > (a.settingsAt || 0) ? b : a;
  out.settings = { ...out.settings, ...newer.settings };
  out.settingsAt = newer.settingsAt || 0;
  const resetAt = Math.max(a.resetAt || 0, b.resetAt || 0);
  const resetDay = resetAt ? dayKey(resetAt) : '';
  out.resetAt = resetAt;
  for (const src of [a, b]) {
    for (const [id, it] of Object.entries(src.items || {})) {
      if (it.t < resetAt) continue;
      if (!out.items[id] || it.t > out.items[id].t) out.items[id] = { ...it };
    }
    for (const [key, day] of Object.entries(src.days || {})) {
      if (key < resetDay) continue;
      const target = (out.days[key] = out.days[key] || {});
      for (const [dev, d] of Object.entries(day)) {
        if (!target[dev] || d.n > target[dev].n) target[dev] = { ...d };
      }
    }
    for (const [id, song] of Object.entries(src.songs || {})) {
      if (!out.songs[id] || (song.t || 0) > (out.songs[id].t || 0)) out.songs[id] = song;
    }
    for (const [id, g] of Object.entries((src.ear && src.ear.games) || {})) {
      if ((g.t || 0) < resetAt) continue;
      const target = (out.ear.games[id] = out.ear.games[id] || { best: {}, plays: 0, t: 0 });
      for (const [level, score] of Object.entries(g.best || {})) target.best[level] = Math.max(target.best[level] || 0, score);
      target.plays = Math.max(target.plays, g.plays || 0);
      target.t = Math.max(target.t, g.t || 0);
    }
    for (const [key, st] of Object.entries((src.ear && src.ear.stats) || {})) {
      if ((st.t || 0) < resetAt) continue;
      const have = out.ear.stats[key];
      if (!have || st.n > have.n || (st.n === have.n && (st.t || 0) > (have.t || 0))) out.ear.stats[key] = { ...st };
    }
    for (const [id, u] of Object.entries(src.units || {})) {
      for (const [field, ts] of Object.entries(u)) {
        if (ts < resetAt) continue;
        const target = (out.units[id] = out.units[id] || {});
        if (!target[field] || ts < target[field]) target[field] = ts;
      }
    }
  }
  return out;
}

export function replaceState(next) {
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, next);
  save(true);
}

// A stable text form, used to tell whether two copies differ.
export function canonical(s) {
  const sortKeys = (o) => (o && typeof o === 'object' && !Array.isArray(o)
    ? Object.keys(o).sort().reduce((acc, k) => { acc[k] = sortKeys(o[k]); return acc; }, {})
    : o);
  return JSON.stringify(sortKeys({ v: 1, settings: s.settings, settingsAt: s.settingsAt || 0, resetAt: s.resetAt || 0, items: s.items || {}, units: s.units || {}, days: s.days || {}, songs: s.songs || {}, ear: { games: (s.ear && s.ear.games) || {}, stats: (s.ear && s.ear.stats) || {} } }));
}
