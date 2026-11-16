// hands.js — the two-hands prototype: a different way of playing the same method.
//
// The right hand plays the melody and the left hand plays the bass, each on its own
// octave of keys. Whatever belongs between them is supplied by the Elevator (frame.js),
// so the distance between the hands is the floor, and parallel, contrary and oblique
// motion are simply what the hands do. Each hand sounds only its own notes: the right the
// melody, the left the bass and the notes above it. Notes ring until that hand plays again.
//
// This page stands beside the main app and shares its engine, sounds and tunes.

import { h, fill, sheet, deg, acc } from './dom.js';
import { KEYS, SCALES, SCALE_ORDER, harmony, harmonyNotes, harmonyTitle, chordLabel, rootMidi, stepOfMidi, isOn, mod, sameHarmony, pcName } from './theory.js';
import { stations, stationOf, stationPhrase, borrow } from './moves.js';
import { parseChart, readChart } from './harmony.js';
import { TUNES, parseKey } from './tunes.js';
import { unlock } from './audio.js';
import { Synth, PRESETS, presetIds } from './synth.js';
import { KEYS_PER_HAND, BASS_DROP, MIRROR, midiOfRow, rowOfMidi, underPart, frameMotion, noteOfRow, soundingName } from './frame.js';

const VERSION = '0.3.0';   // kept in step with js/app.js and sw.js
const STORE = 'parlor.hands.v1';
const ROLL = 0.014;          // seconds between the notes of the left hand, low to high
const TRAIL_SECONDS = 9;
const TOGETHER = 130;     // milliseconds within which two thumbs count as landing together

// ---------- what is remembered ----------
const DEFAULTS = { home: { root: 0, scale: 'maj6' }, h: { root: 0, scale: 'maj6' }, octave: 0, mirror: false, ring: true, preset: 'tines', tune: null, picks: {}, seen: false };
function load() {
  try {
    const s = { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(STORE)) || {}) };
    const ok = (x) => x && Number.isInteger(x.root) && x.root >= 0 && x.root < 12 && SCALES[x.scale];
    if (!ok(s.home) || s.home.scale === 'dim') s.home = { ...DEFAULTS.home };
    if (!ok(s.h)) s.h = { ...s.home };
    if (!PRESETS[s.preset] || PRESETS[s.preset].kind !== 'keys') s.preset = DEFAULTS.preset;
    s.octave = Math.max(-1, Math.min(1, s.octave | 0));
    s.picks = s.picks && typeof s.picks === 'object' ? s.picks : {};
    if (s.tune && !TUNES.some((t) => t.id === s.tune)) s.tune = null;
    return s;
  } catch (e) { return { ...DEFAULTS }; }
}
const S = load();
const save = () => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* private mode: play on */ } };

// ---------- sound ----------
let rig = null;
function audio() {
  const desk = unlock();
  if (!desk) return null;
  if (!rig) { rig = { desk, under: new Synth(desk, 'pads', 14), mel: new Synth(desk, 'strum', 8) }; applySound(); }
  return rig;
}
function applySound() {
  if (!rig) return;
  const patch = PRESETS[S.preset] || PRESETS.tines;
  rig.under.setPatch(patch); rig.mel.setPatch(patch);
  rig.desk.setPart('pads', { level: 0.74 }); rig.desk.setPart('strum', { level: 0.86 });
  rig.desk.setFx({ delayTime: 0.36, feedback: 0.3, room: 0.5 });
  rig.desk.setMaster(0.85);
}

// ---------- the voices ----------
const floor = () => rootMidi(S.home.root) + 12 * S.octave;     // the pitch row 0 stays near
const hand = { L: { key: null, down: false, pid: null }, R: { key: null, down: false, pid: null } };
let under = null;      // the left hand's notes: { base, rows, h, ids, midis }
let top = null;        // the melody: { row, h, midi, id }
let before = null;     // { bass, melody } a moment ago, for naming the motion
let chart = null;      // a tune being stepped through: { tune, changes, cursor }
let trail = [];        // what has sounded lately, for the picture at the top

const melodyRow = () => (top ? (sameHarmony(top.h, S.h) ? top.row : rowOfMidi(S.h, floor(), top.midi)) : null);
const underRows = () => (under ? (sameHarmony(under.h, S.h) ? under.rows : under.midis.map((m) => rowOfMidi(S.h, floor(), m))) : null);

function releaseUnder() { if (under && rig) for (const id of under.ids) rig.under.noteOff(id); under = null; }
function releaseTop() { if (top && rig) rig.mel.noteOff(top.id); top = null; }

// The left hand's notes give way to the melody: nothing of theirs may sit on it or above it.
function trimUnder() {
  if (!under || !top) return;
  for (let i = under.rows.length - 1; i >= 1; i--) {
    if (under.midis[i] < top.midi) continue;
    if (rig) rig.under.noteOff(under.ids[i]);
    for (const list of [under.rows, under.base, under.midis, under.ids]) list.splice(i, 1);
  }
}

// Put the left hand's notes on new rows. Notes already sounding keep ringing; only the
// new ones are struck and only the ones no longer wanted are let go.
function revoiceUnder(rows) {
  const midis = rows.map((row) => midiOfRow(under.h, floor(), row));
  const old = under.midis.map((midi, i) => ({ midi, id: under.ids[i] }));
  const ids = midis.map((midi, i) => {
    const k = old.findIndex((o) => o && o.midi === midi);
    if (k >= 0) { const { id } = old[k]; old[k] = null; return id; }
    return rig ? rig.under.noteOn(midi, { vel: i ? 0.64 : 0.84 }) : 0;
  });
  if (rig) for (const o of old) if (o) rig.under.noteOff(o.id);
  under.base = [...rows]; under.rows = [...rows]; under.midis = midis; under.ids = ids;
}

let leftAt = 0;
function strikeLeft(key) {
  const r = audio();
  hand.L.key = key;
  leftAt = performance.now();
  const bass = key - BASS_DROP - (S.mirror ? MIRROR : 0);
  const prev = under && sameHarmony(under.h, S.h) ? under.base.slice(1) : null;
  const part = underPart(bass, melodyRow(), prev);
  releaseUnder();
  const h0 = { ...S.h };
  const midis = part.rows.map((row) => midiOfRow(h0, floor(), row));
  const t = r ? r.desk.ctx.currentTime : 0;
  const ids = r ? midis.map((m, i) => r.under.noteOn(m, { when: t + i * ROLL, vel: i === 0 ? 0.84 : 0.64 })) : midis.map(() => 0);
  under = { base: [...part.rows], rows: [...part.rows], h: h0, ids, midis };
  trimUnder();
  announce();
}

function strikeRight(key) {
  const r = audio();
  hand.R.key = key;
  releaseTop();
  const h0 = { ...S.h };
  const midi = midiOfRow(h0, floor(), key);
  top = { row: key, h: h0, midi, id: r ? r.mel.noteOn(midi, { vel: 0.95 }) : 0 };
  // Two thumbs never land at quite the same instant. If the left hand has only just struck,
  // it struck for this melody note: fit its notes to it, whichever thumb arrived first.
  if (under && sameHarmony(under.h, S.h) && performance.now() - leftAt < TOGETHER) {
    revoiceUnder(underPart(under.base[0], key, under.base.slice(1)).rows);
  }
  trimUnder();
  announce();
}

const strike = (side, key) => (side === 'L' ? strikeLeft(key) : strikeRight(key));
function lift(side) {
  hand[side].down = false;
  if (!S.ring) { if (side === 'L') releaseUnder(); else releaseTop(); }
  announce(false);
}

function damp() {
  releaseUnder(); releaseTop();
  before = null;
  announce(false);
}

// one inner voice of the left hand: struck again, or leaning to its neighbor and back
function setVoice(i, row) {
  if (!under || under.rows[i] == null || under.rows[i] === row) return;
  const midi = midiOfRow(under.h, floor(), row);
  if (rig) { rig.under.noteOff(under.ids[i]); under.ids[i] = rig.under.noteOn(midi, { vel: 0.7 }); }
  under.rows[i] = row; under.midis[i] = midi;
  announce(false);
}
function pluck(i) {
  if (!under || under.rows[i] == null) return;
  const r = audio();
  if (r) { r.under.noteOff(under.ids[i], 0, true); under.ids[i] = r.under.noteOn(under.midis[i], { vel: 0.74 }); }
}
function lean(i, dir) {
  if (!under || under.base[i] == null) return false;
  if (!dir) { setVoice(i, under.base[i]); return true; }
  const mel = sameHarmony(under.h, S.h) ? melodyRow() : null;
  const chord = [...under.base, ...(mel != null && mel > under.base[under.base.length - 1] ? [mel] : [])];
  const moved = borrow(chord, chord.length - 1 - i, dir);
  if (!moved) return false;
  setVoice(i, moved[i]);
  return true;
}

// ---------- harmony ----------
// A voice under a thumb keeps its pitch through a change of harmony. A voice left ringing
// keeps its row, so it is re-tuned by a semitone or two: the chord is carried across by the
// shortest route.
function setHarmony(next, why = '') {
  S.h = { root: next.root, scale: next.scale, ...(next.bass != null ? { bass: next.bass } : {}), ...(next.sharp ? { sharp: true } : {}) };
  save();
  const f = floor();
  if (top && !hand.R.down) {
    const midi = midiOfRow(S.h, f, top.row);
    if (midi !== top.midi && rig) { rig.mel.noteOff(top.id); top.id = rig.mel.noteOn(midi, { vel: 0.8 }); }
    top.midi = midi; top.h = { ...S.h };
  }
  if (under && !hand.L.down) {
    const midis = under.rows.map((row) => midiOfRow(S.h, f, row));
    midis.forEach((m, i) => {
      if (m === under.midis[i] || !rig) return;
      rig.under.noteOff(under.ids[i]);
      under.ids[i] = rig.under.noteOn(m, { vel: i ? 0.62 : 0.8 });
    });
    under.midis = midis; under.h = { ...S.h };
    trimUnder();
  }
  drawKeys(); drawStrip(); drawTitle();
  announce(false, why);
}

function setHome(next) {
  S.home = { root: next.root, scale: next.scale };
  damp();
  setHarmony(S.home);
}

// a tune, stepped through by hand: one stop for each change of chord
function loadTune(id) {
  S.tune = id || null;
  const tune = TUNES.find((t) => t.id === S.tune);
  if (!tune) { chart = null; save(); drawStrip(); return; }
  const key = parseKey(tune.key);
  const picks = S.picks[tune.id] || {};
  const read = readChart(parseChart(tune.chart), (i) => picks[i] || 0, key.root, key.minor);
  const changes = [];
  for (const c of read) {
    const last = changes[changes.length - 1];
    if (last && last.symbol === c.symbol && last.use.root === c.use.root && last.use.scale === c.use.scale) continue;
    changes.push(c);
  }
  const cursor = chart && chart.tune.id === tune.id ? Math.min(chart.cursor, changes.length - 1) : 0;
  chart = { tune, changes, cursor };
  if (S.home.root !== key.root || (S.home.scale === 'min6') !== key.minor) { S.home = { root: key.root, scale: key.minor ? 'min6' : 'maj6' }; damp(); }
  gotoChange(cursor);
}
const harmonyOf = (c) => harmony(c.use.root, c.use.scale, { bass: c.root, sharp: !!c.sharp });
function gotoChange(i) {
  if (!chart) return;
  chart.cursor = mod(i, chart.changes.length);
  const c = chart.changes[chart.cursor];
  setHarmony(harmonyOf(c), `${c.text} played as ${c.use.label}: ${c.use.how}.`);
}
function cycleReading() {
  if (!chart) return;
  const c = chart.changes[chart.cursor];
  if (c.options.length < 2) return;
  const picks = { ...(S.picks[chart.tune.id] || {}) };
  picks[c.index] = mod((picks[c.index] || 0) + 1, c.options.length);
  S.picks[chart.tune.id] = picks;
  loadTune(chart.tune.id);
}

// ---------- the page ----------
const el = {
  title: h('button', { type: 'button', class: 'hd-title', 'aria-label': 'Key, tune and sound', onpress: () => menu() }),
  name: h('div', { class: 'hd-name' }),
  notes: h('div', { class: 'hd-notes' }),
  moved: h('div', { class: 'hd-moved' }),
  canvas: h('canvas', { class: 'hd-trail', 'aria-hidden': 'true' }),
  left: h('div', { class: 'hd-hand left', role: 'group', 'aria-label': 'Left hand: the bass' }),
  right: h('div', { class: 'hd-hand right', role: 'group', 'aria-label': 'Right hand: the melody' }),
  center: h('div', { class: 'hd-center' }),
  band: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
  strip: h('div', { class: 'hd-strip' }),
  cap: h('div', { class: 'hd-cap' }),
};
el.band.setAttribute('class', 'hd-band');
el.band.setAttribute('aria-hidden', 'true');
const surface = h('div', { class: 'hd-surface' }, el.left, el.center, el.right, el.band);

function drawTitle() {
  fill(el.title, h('span', { class: 'hd-scale' }, acc(harmonyTitle(S.h))), h('span', { class: 'hd-more' }, 'change'));
}

const keyEls = { L: [], R: [] };
function drawKeys() {
  const f = floor();
  for (const side of ['L', 'R']) {
    const host = side === 'L' ? el.left : el.right;
    keyEls[side] = Array.from({ length: KEYS_PER_HAND }, (_, k) => {
      const row = side === 'L' ? k - BASS_DROP : k;
      const note = noteOfRow(S.h, f, row);
      return h('button', {
        type: 'button', class: `hk ${note.on ? 'on' : 'off'}${note.deg === 0 ? ' root' : ''}`, 'data-k': String(k), style: { '--k': String(k) },
        'aria-label': `${side === 'L' ? 'Bass' : 'Melody'}: ${note.say}, ${note.on ? 'on' : 'off'}, ${note.name}`,
      }, h('span', { class: 'hk-deg' }, deg(note.label)), h('span', { class: 'hk-note' }, note.name));
    });
    const corners = side === 'L'
      ? [h('button', { type: 'button', class: 'hc top', title: 'Stop everything that is ringing (Esc)', onpress: () => damp() }, 'Damp'),
        h('button', { type: 'button', class: `hc bottom${S.mirror ? ' sel' : ''}`, 'aria-pressed': String(S.mirror), title: 'Mirror: the bass an octave lower, for the wide floors (Q)', onpress: () => setMirror(!S.mirror) }, 'Mirror')]
      : [h('button', { type: 'button', class: `hc top${S.octave > 0 ? ' sel' : ''}`, title: 'Both hands up an octave', onpress: () => setOctave(1) }, '8ve ▲'),
        h('button', { type: 'button', class: `hc bottom${S.octave < 0 ? ' sel' : ''}`, title: 'Both hands down an octave', onpress: () => setOctave(-1) }, '8ve ▼')];
    fill(host, keyEls[side], corners);
  }
  light();
}

// which keys are under a thumb, and which are still ringing
function light() {
  for (const side of ['L', 'R']) {
    const alive = side === 'L' ? !!under : !!top;
    keyEls[side].forEach((k, i) => {
      const mine = alive && hand[side].key === i;
      k.classList.toggle('held', mine && hand[side].down);
      k.classList.toggle('ring', mine && !hand[side].down);
    });
  }
}

function setMirror(on) {
  S.mirror = !!on; save();
  drawKeys();
  // with the left hand's notes still sounding, the bass drops (or returns): a pivot
  if (under && hand.L.key != null) strikeLeft(hand.L.key);
  caption(on ? 'Mirror: the bass plays an octave lower. A third becomes a drop 2, a triad a drop 3.' : 'Mirror off: the bass is back in the close floors.');
}
function setOctave(d) {
  const next = Math.max(-1, Math.min(1, S.octave + d));
  if (next === S.octave) return;
  damp();
  S.octave = next; save();
  drawKeys();
  caption(next ? `Both hands ${next > 0 ? 'up' : 'down'} an octave.` : 'Both hands back in the middle.');
}

// ---------- beads: the notes between the hands ----------
// They sit on a line from the left thumb to the right thumb. Tap one to pluck it; push it
// up or down to borrow the note above or below, and let go to give it back.
let beadEls = [];
function centerOf(side) {
  const key = keyEls[side][hand[side].key];
  if (!key) return null;
  const a = key.getBoundingClientRect(); const b = surface.getBoundingClientRect();
  return { x: side === 'L' ? a.right - b.left : a.left - b.left, y: a.top + a.height / 2 - b.top };
}
function drawBeads() {
  const rows = underRows();
  const from = under ? centerOf('L') : null;
  const to = top ? centerOf('R') : null;
  const box = el.center.getBoundingClientRect(); const s = surface.getBoundingClientRect();
  const x0 = box.left - s.left; const w = box.width;
  let line = '';
  beadEls = [];
  if (from && to) line = `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"/>`;
  if (under && rows.length > 1 && from) {
    const names = harmonyNotes(S.h);
    const inner = rows.slice(1);
    const end = to || { x: x0 + w, y: from.y };
    inner.forEach((row, k) => {
      const i = k + 1;
      // evenly along the line, the lower voice nearer the left hand
      const x = x0 + w * (inner.length === 1 ? 0.5 : 0.26 + (0.48 * k) / (inner.length - 1));
      const u = end.x === from.x ? 0.5 : (x - from.x) / (end.x - from.x);
      const y = from.y + (end.y - from.y) * u;
      const step = stepOfMidi(S.h, under.midis[i]);
      const note = step == null ? { label: '·', name: pcName(under.midis[i]), on: isOn(row) } : names[mod(step, 8)];
      const leaning = under.rows[i] !== under.base[i];
      beadEls.push(h('div', { class: `bead ${note.on ? 'on' : 'off'}${leaning ? ' lean' : ''}`, 'data-i': String(i), style: { left: `${x - x0}px`, top: `${y - (box.top - s.top)}px` } },
        h('b', null, deg(note.label)), h('i', null, note.name)));
    });
  }
  el.band.innerHTML = line;
  fill(el.center, beadEls);
}

const bending = new Map();   // pointer id -> { i, y, dir }
el.center.addEventListener('pointerdown', (e) => {
  const b = e.target.closest ? e.target.closest('.bead') : null;
  if (!b) return;
  e.preventDefault();
  try { el.center.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
  const i = Number(b.dataset.i);
  bending.set(e.pointerId, { i, y: e.clientY, dir: 0 });
  pluck(i);
});
el.center.addEventListener('pointermove', (e) => {
  const g = bending.get(e.pointerId);
  if (!g) return;
  const dy = g.y - e.clientY;
  const dir = dy > 16 ? 1 : dy < -16 ? -1 : Math.abs(dy) < 8 ? 0 : g.dir;
  if (dir === g.dir) return;
  if (lean(g.i, dir)) g.dir = dir;
  else if (dir) caption('That voice has nowhere to go: the note next to it is already sounding.');
});
const bendEnd = (e) => {
  const g = bending.get(e.pointerId);
  if (!g) return;
  bending.delete(e.pointerId);
  if (g.dir) lean(g.i, 0);
};
el.center.addEventListener('pointerup', bendEnd);
el.center.addEventListener('pointercancel', bendEnd);

// ---------- saying what happened ----------
let capTimer = 0;
let motionFrom = null;
let motionTimer = 0;
function caption(text) {
  clearTimeout(capTimer);
  el.cap.textContent = text || '';
  el.cap.classList.toggle('lit', !!text);
  if (text) capTimer = setTimeout(() => caption(''), 6500);
}

function nameOfMidi(midi) {
  const step = stepOfMidi(S.h, midi);
  return step == null ? pcName(midi) : harmonyNotes(S.h)[mod(step, 8)].name;
}

function announce(moved = true, why = '') {
  const rows = underRows();
  const mel = melodyRow();
  // a voice leaning to its neighbor does not change what the chord is called
  const leaning = !!under && under.rows.some((r, i) => r !== under.base[i]);
  const named = leaning && sameHarmony(under.h, S.h) ? `${soundingName(under.base, mel)}, a voice borrowing` : soundingName(rows, mel);
  el.name.textContent = named || 'Right thumb, left thumb';
  const midis = [...(under ? under.midis : []), ...(top ? [top.midi] : [])].sort((a, b) => a - b);
  fill(el.notes, midis.length ? acc(midis.map(nameOfMidi).join('  ')) : 'The melody on the right, the bass on the left. The chord fills in between.');
  const now = { bass: rows ? rows[0] : null, melody: mel };
  if (moved) {
    // two thumbs landing together are one move, measured from before either arrived
    if (!motionTimer) motionFrom = before;
    el.moved.textContent = frameMotion(motionFrom, now);
    before = now;
    clearTimeout(motionTimer);
    motionTimer = setTimeout(() => { motionTimer = 0; }, TOGETHER + 30);
  } else if (!rows && mel == null) el.moved.textContent = '';
  if (why) caption(why);
  light();
  drawBeads();
  trail.push({ t: performance.now(), under: under ? [...under.midis] : [], top: top ? top.midi : null, on: rows ? isOn(rows[0]) : true });
  if (trail.length > 400) trail = trail.slice(-300);
  paint();
}

// ---------- the trail: the voices as lines through time ----------
let painting = 0;
function paint() { if (!painting) painting = requestAnimationFrame(frame); }
function frame() {
  painting = 0;
  const c = el.canvas;
  const box = c.getBoundingClientRect();
  if (!box.width) return;
  const scale = Math.min(2, window.devicePixelRatio || 1);
  if (c.width !== Math.round(box.width * scale)) { c.width = Math.round(box.width * scale); c.height = Math.round(box.height * scale); }
  const g = c.getContext('2d');
  g.setTransform(scale, 0, 0, scale, 0, 0);
  g.clearRect(0, 0, box.width, box.height);
  const now = performance.now();
  const span = TRAIL_SECONDS * 1000;
  const lo = floor() - 24; const hi = floor() + 20;
  const x = (t) => box.width - ((now - t) / span) * box.width;
  const y = (m) => box.height - 6 - ((m - lo) / (hi - lo)) * (box.height - 12);
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue('--ink').trim(); const on = css.getPropertyValue('--on').trim(); const off = css.getPropertyValue('--off').trim();
  let live = false;
  for (let i = 0; i < trail.length; i++) {
    const a = trail[i]; const end = i + 1 < trail.length ? trail[i + 1].t : now;
    if (end < now - span) continue;
    const x1 = Math.max(0, x(a.t)); const x2 = x(end);
    if (x2 - x1 < 0.5) continue;
    const seg = (m, color, width, alpha) => { g.strokeStyle = color; g.globalAlpha = alpha; g.lineWidth = width; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y(m)); g.lineTo(x2, y(m)); g.stroke(); };
    a.under.forEach((m, k) => seg(m, k === 0 ? ink : (a.on ? on : off), k === 0 ? 2.6 : 1.6, k === 0 ? 0.75 : 0.7));
    if (a.top != null) seg(a.top, ink, 3, 1);
    if (i === trail.length - 1 && (a.under.length || a.top != null)) live = true;
  }
  g.globalAlpha = 1;
  const last = trail[trail.length - 1];
  if (live || (last && now - last.t < span)) painting = requestAnimationFrame(frame);
}

// ---------- the strip at the bottom: stations, or a tune's changes ----------
function drawStrip() {
  if (chart) {
    const c = chart.changes[chart.cursor];
    const next = chart.changes[mod(chart.cursor + 1, chart.changes.length)];
    fill(el.strip,
      h('button', { type: 'button', class: 'hs-step', 'aria-label': 'Previous chord', onpress: () => gotoChange(chart.cursor - 1) }, '◀'),
      h('button', { type: 'button', class: 'hs-now', title: c.options.length > 1 ? 'Tap for another way to play this chord' : c.use.why, onpress: () => cycleReading() },
        h('span', { class: 'hs-sym' }, acc(c.text)),
        h('span', { class: 'hs-as' }, acc(`as ${c.use.on}`), c.options.length > 1 ? ' ⇄' : ''),
        h('span', { class: 'hs-how' }, `${c.use.how} · ${chart.cursor + 1} of ${chart.changes.length}`)),
      h('button', { type: 'button', class: 'hs-next', 'aria-label': `Next chord: ${next.text}`, onpress: () => gotoChange(chart.cursor + 1) },
        h('span', { class: 'hs-how' }, 'next'), h('span', { class: 'hs-sym' }, acc(next.text)), h('span', { class: 'hs-go' }, '▶')));
    el.strip.dataset.mode = 'tune';
    return;
  }
  const here = stationOf(S.home, S.h);
  fill(el.strip, stations(S.home).map((st) => h('button', {
    type: 'button', class: `hs-chip${here && here.id === st.id ? ' sel' : ''}${st.dominant ? ' dom' : ''}`, title: `${st.name}. ${st.how}`,
    onpress: () => setHarmony(st.h, st.id === 'home' ? 'Home.' : `${st.label}: ${stationPhrase(S.home, st)}. ${st.how}`),
  }, acc(st.label))));
  el.strip.dataset.mode = 'stations';
}

// ---------- the menu: key, tune, sound ----------
function menu() {
  sheet('Two hands', (body, api) => {
    const draw = () => fill(body,
      h('p', { class: 'sheet-label' }, 'Key'),
      h('div', { class: 'chips keys' }, KEYS.slice(0, 12).map((k) => h('button', {
        type: 'button', class: `chip${k.pc === S.home.root ? ' sel' : ''}`, onpress: () => { loadTune(null); setHome(harmony(k.pc, S.home.scale)); draw(); },
      }, k.pc === 6 ? 'G♭' : k.id))),
      h('p', { class: 'sheet-label' }, 'Scale of chords'),
      h('div', { class: 'chips scales' }, SCALE_ORDER.map((id) => h('button', {
        type: 'button', class: `chip${id === S.home.scale ? ' sel' : ''}`, onpress: () => { loadTune(null); setHome(harmony(S.home.root, id)); draw(); },
      }, SCALES[id].name))),
      h('p', { class: 'sheet-label' }, 'Chord changes'),
      h('div', { class: 'chips' },
        h('button', { type: 'button', class: `chip${!S.tune ? ' sel' : ''}`, onpress: () => { loadTune(null); setHarmony(S.home); draw(); } }, 'Stations (free play)'),
        TUNES.map((t) => h('button', { type: 'button', class: `chip${S.tune === t.id ? ' sel' : ''}`, onpress: () => { loadTune(t.id); draw(); } }, acc(t.title)))),
      h('p', { class: 'sheet-label' }, 'Sound'),
      h('div', { class: 'chips' }, presetIds('keys').map((id) => h('button', {
        type: 'button', class: `chip${id === S.preset ? ' sel' : ''}`, onpress: () => { S.preset = id; save(); audio(); applySound(); draw(); },
      }, PRESETS[id].name))),
      h('p', { class: 'sheet-label' }, 'When you lift a thumb'),
      h('div', { class: 'chips scales' },
        h('button', { type: 'button', class: `chip${S.ring ? ' sel' : ''}`, onpress: () => { S.ring = true; save(); draw(); } }, 'Notes ring on'),
        h('button', { type: 'button', class: `chip${!S.ring ? ' sel' : ''}`, onpress: () => { S.ring = false; save(); damp(); draw(); } }, 'Notes stop')),
      h('button', { type: 'button', class: 'primary wide', onpress: () => api.close() }, 'Play'),
      h('p', { class: 'muted small' }, h('a', { href: './', class: 'hd-link' }, 'Back to Parlor'), ` · two-hands prototype ${VERSION}`));
    draw();
  });
}

function welcome() {
  sheet('Two hands', (body, api) => {
    fill(body,
      h('p', null, 'A different way to play the same method. Hold the phone in both hands.'),
      h('ul', { class: 'welcome' },
        h('li', null, h('b', null, 'Right thumb: the melody. '), 'One note at a time.'),
        h('li', null, h('b', null, 'Left thumb: the bass. '), 'The chord fills in between your thumbs. How far apart they are decides how big it is.'),
        h('li', null, h('b', null, 'Same colour, a floor. '), 'Both thumbs on ', h('span', { class: 'ink-on' }, 'green'), ' or both on ', h('span', { class: 'ink-off' }, 'red'), ' gives a third, a triad, a shell, an octave. Different colours, and the melody is borrowed.'),
        h('li', null, h('b', null, 'Notes ring '), 'until that hand plays again. Damp stops them. The row at the bottom changes the chord.')),
      h('button', { type: 'button', class: 'primary wide', onpress: () => { api.close(); audio(); } }, 'Start playing'));
  });
}

// ---------- hands on the keys ----------
function bindHand(host, side) {
  const keyAt = (x, y) => {
    const t = document.elementFromPoint(x, y);
    const k = t && t.closest ? t.closest('.hk') : null;
    return k && host.contains(k) ? Number(k.dataset.k) : null;
  };
  host.addEventListener('pointerdown', (e) => {
    const k = keyAt(e.clientX, e.clientY);
    if (k == null || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    try { host.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
    hand[side].pid = e.pointerId; hand[side].down = true;
    strike(side, k);
  });
  host.addEventListener('pointermove', (e) => {
    if (hand[side].pid !== e.pointerId || !hand[side].down) return;
    const k = keyAt(e.clientX, e.clientY);
    if (k == null || k === hand[side].key) return;
    strike(side, k);
  });
  const end = (e) => {
    if (hand[side].pid !== e.pointerId) return;
    hand[side].pid = null;
    lift(side);
  };
  host.addEventListener('pointerup', end);
  host.addEventListener('pointercancel', end);
  host.addEventListener('contextmenu', (e) => e.preventDefault());
}

// a laptop: left hand on A S D F G and Z X C V, right hand on H J K L ; and N M , .
const CODES = {
  L: { KeyA: 0, KeyZ: 1, KeyS: 2, KeyX: 3, KeyD: 4, KeyC: 5, KeyF: 6, KeyV: 7, KeyG: 8 },
  R: { KeyH: 0, KeyN: 1, KeyJ: 2, KeyM: 3, KeyK: 4, Comma: 5, KeyL: 6, Period: 7, Semicolon: 8 },
};
const pressed = new Map();
window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || document.body.classList.contains('sheet-open')) return;
  const side = e.code in CODES.L ? 'L' : e.code in CODES.R ? 'R' : null;
  if (side) {
    e.preventDefault();
    if (e.repeat || pressed.has(e.code)) return;
    pressed.set(e.code, side);
    hand[side].down = true;
    strike(side, CODES[side][e.code]);
    return;
  }
  if (e.repeat) return;
  if (e.code === 'Space' || e.code === 'ArrowRight') { e.preventDefault(); if (chart) gotoChange(chart.cursor + 1); }
  else if (e.code === 'ArrowLeft') { e.preventDefault(); if (chart) gotoChange(chart.cursor - 1); }
  else if (e.code === 'Escape') damp();
  else if (e.code === 'KeyQ') setMirror(!S.mirror);
  else if (/^Digit[1-8]$/.test(e.code) && !chart) { const st = stations(S.home)[Number(e.code.slice(5)) - 1]; if (st) setHarmony(st.h, `${st.label}: ${stationPhrase(S.home, st)}.`); }
});
window.addEventListener('keyup', (e) => {
  const side = pressed.get(e.code);
  if (!side) return;
  pressed.delete(e.code);
  if (![...pressed.values()].includes(side)) lift(side);
});

// ---------- start ----------
document.body.classList.add('hands');
document.body.append(
  h('header', { class: 'hd-top' }, h('a', { class: 'hd-back', href: './', 'aria-label': 'Back to Parlor' }, '‹ Parlor'), el.title,
    h('button', { type: 'button', class: 'icon-b', 'aria-label': 'How this works', onpress: () => welcome() }, '?')),
  h('section', { class: 'hd-display' }, el.canvas, h('div', { class: 'hd-read' }, el.name, el.notes, el.moved)),
  surface,
  h('footer', { class: 'hd-foot' }, el.cap, el.strip));
bindHand(el.left, 'L');
bindHand(el.right, 'R');
if (S.tune) loadTune(S.tune);
drawTitle(); drawKeys(); drawStrip(); announce(false);
window.addEventListener('resize', () => { drawBeads(); paint(); });

// Sound has to be woken by a touch or a key; a phone only counts the end of a touch.
for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) document.addEventListener(type, () => audio(), { capture: true, passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

if (!S.seen) { S.seen = true; save(); welcome(); }
if ('serviceWorker' in navigator && location.protocol === 'https:') window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

window.hands = { S, get under() { return under; }, get top() { return top; }, strike, lift, damp, setHarmony, setMirror, lean, pluck, loadTune, gotoChange, get chart() { return chart; }, get rig() { return rig; } };
