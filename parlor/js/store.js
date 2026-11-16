// store.js — everything the instrument remembers between visits, kept in this browser.

import { rhythmById, patternsOf, KITS } from './rhythms.js';
import { SIGS, PATTERN_IDS, LANES, stepsPerBar } from './seq.js';
import { PRESETS } from './synth.js';
import { SCALES } from './theory.js';

const KEY = 'parlor.v1';

export function defaults() {
  const rhythm = rhythmById('ballad');
  return {
    v: 1,
    home: { root: 0, scale: 'maj6' },       // the home key the stations are measured from
    h: { root: 0, scale: 'maj6' },          // the scale of chords the pads are playing now
    floor: 5,                               // index into FLOORS: drop 2
    variants: {},                           // which shell, which octave chord
    motion: 'parallel',
    keepOn: false,                          // keep the on chord under an off melody note
    borrowVoice: 1,                         // counted from the top
    octave: 0,
    hold: false,
    page: 'stations',                       // 'stations' | 'family'
    plate: 'chord',                         // 'chord' | 'scale'
    parts: {
      pads: { preset: 'tines', changes: {}, level: 0.8 },
      strum: { preset: 'harp', changes: {}, level: 0.75 },
      bass: { preset: 'upright', changes: {}, level: 0.8 },
    },
    drums: { kit: rhythm.kit, level: 0.7 },
    fx: { delayTime: 0.36, feedback: 0.34, room: 0.45 },
    master: 0.85,
    song: {
      rhythm: rhythm.id, sig: rhythm.sig, bpm: rhythm.bpm, swing: rhythm.swing,
      patterns: patternsOf(rhythm), chain: ['A'], edit: 'A', click: false,
      mute: { chords: false, bass: false, drums: false },
    },
    tune: { id: null, transpose: 0, picks: {}, custom: '| Dm7 | G7 | C6 | % |', customBeats: 4 },
    seen: {},
  };
}

// Keep only what still makes sense: a saved copy from an older version, or one that was
// damaged, must never stop the instrument from opening.
function mend(saved) {
  const base = defaults();
  if (!saved || typeof saved !== 'object') return base;
  const s = { ...base, ...saved };
  const okH = (h) => h && Number.isInteger(h.root) && h.root >= 0 && h.root < 12 && SCALES[h.scale];
  if (!okH(s.home) || s.home.scale === 'dim') s.home = base.home;
  if (!okH(s.h)) s.h = { ...s.home };
  if (!Number.isInteger(s.floor) || s.floor < 0 || s.floor > 8) s.floor = base.floor;
  if (!['parallel', 'contrary', 'oblique'].includes(s.motion)) s.motion = 'parallel';
  if (!['stations', 'family', 'chart'].includes(s.page)) s.page = 'stations';
  if (!['chord', 'scale'].includes(s.plate)) s.plate = 'chord';
  s.variants = s.variants && typeof s.variants === 'object' ? s.variants : {};
  s.octave = Math.max(-1, Math.min(1, s.octave | 0));
  s.parts = { ...base.parts, ...(s.parts || {}) };
  for (const name of Object.keys(base.parts)) {
    const p = { ...base.parts[name], ...(s.parts[name] || {}) };
    if (!PRESETS[p.preset]) { p.preset = base.parts[name].preset; p.changes = {}; }
    p.changes = p.changes && typeof p.changes === 'object' ? p.changes : {};
    s.parts[name] = p;
  }
  s.drums = { ...base.drums, ...(s.drums || {}) };
  if (!KITS[s.drums.kit]) s.drums.kit = base.drums.kit;
  s.fx = { ...base.fx, ...(s.fx || {}) };
  s.tune = { ...base.tune, ...(s.tune || {}) };
  s.tune.picks = s.tune.picks && typeof s.tune.picks === 'object' ? s.tune.picks : {};
  s.seen = s.seen && typeof s.seen === 'object' ? s.seen : {};
  s.song = mendSong(s.song, base.song);
  return s;
}

function mendSong(song, base) {
  if (!song || !SIGS[song.sig] || !song.patterns) return base;
  const per = stepsPerBar(SIGS[song.sig]);
  for (const id of PATTERN_IDS) {
    const p = song.patterns[id];
    const ok = p && [1, 2, 4].includes(p.bars) && Array.isArray(p.bass) && p.bass.length === p.bars * per && Array.isArray(p.chords)
      && p.drums && LANES.every((lane) => Array.isArray(p.drums[lane]) && p.drums[lane].length === p.bars * per);
    if (!ok) return base;
  }
  const s = { ...base, ...song };
  s.chain = Array.isArray(s.chain) && s.chain.length && s.chain.every((id) => PATTERN_IDS.includes(id)) ? s.chain.slice(0, 16) : ['A'];
  if (!PATTERN_IDS.includes(s.edit)) s.edit = 'A';
  s.bpm = Math.max(40, Math.min(240, Number(s.bpm) || base.bpm));
  s.swing = Math.max(0.5, Math.min(0.75, Number(s.swing) || 0.5));
  s.mute = { ...base.mute, ...(s.mute || {}) };
  return s;
}

export function load() {
  try { return mend(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return defaults(); }
}

let timer = 0;
export function save(state) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode or full: play on */ }
  }, 400);
}
export function saveNow(state) {
  clearTimeout(timer);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* as above */ }
}
export function reset() {
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing to clear */ }
}
export { mend };
