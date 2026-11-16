// app.js — puts the instrument on the page: the top bar and transport, the four tabs,
// the keyboard, the guide, and offline support.

import { h, fill, icon, sheet, sheetIsOpen, bus } from './dom.js';
import { load, save as store, saveNow } from './store.js';
import { createInstrument } from './instrument.js';
import { createBand } from './band.js';
import { playView } from './play.js';
import { loopView } from './loop.js';
import { soundView } from './sound.js';
import { tuneView } from './tune.js';
import { createDesk } from './audio.js';
import { Synth, PRESETS } from './synth.js';
import { Drums } from './drums.js';
import { KITS } from './rhythms.js';
import { LANES } from './seq.js';

export const VERSION = '0.2.0';

const state = load();
const events = bus();
const save = () => store(state);
const inst = createInstrument(state, events, save);
const band = createBand(state, inst, events, save);
const app = { state, events, inst, band, save, version: VERSION };

// ---------- the top bar ----------
const playBtn = h('button', { type: 'button', class: 'transport play', 'aria-label': 'Play', title: 'Play or stop the loop (space bar)', onpress: () => band.toggle() }, icon('play', 20));
const recBtn = h('button', { type: 'button', class: 'transport rec', 'aria-label': 'Record', 'aria-pressed': 'false', title: 'Record what the pads play into the loop (R)', onpress: () => band.setRecord(!band.recording) }, icon('rec', 20));
const tempoBtn = h('button', { type: 'button', class: 'tempo', title: 'Tempo: open the Loop screen', onclick: () => go('loop') });
const beat = h('i', { class: 'beat-dot' });
const drawTempo = () => fill(tempoBtn, beat, h('b', null, String(state.song.bpm)), h('span', null, 'bpm'));

const header = h('header', { class: 'top' },
  h('button', { type: 'button', class: 'brand', title: 'What is this?', onclick: () => guide() }, 'Parlor'),
  h('div', { class: 'top-right' }, tempoBtn, recBtn, playBtn,
    h('button', { type: 'button', class: 'icon-b', 'aria-label': 'Guide', onclick: () => guide() }, icon('help', 22))));

// ---------- tabs ----------
const TABS = [
  { id: 'play', label: 'Play', icon: 'pads' },
  { id: 'loop', label: 'Loop', icon: 'loop' },
  { id: 'sound', label: 'Sound', icon: 'sound' },
  { id: 'tune', label: 'Tune', icon: 'tune' },
];
const views = { play: playView(app), loop: loopView(app), sound: soundView(app), tune: tuneView(app) };
const main = h('main', { id: 'view' }, Object.values(views).map((v) => v.el));
const nav = h('nav', { class: 'tabs', 'aria-label': 'Sections' }, TABS.map((t) => h('a', { href: `#${t.id}`, 'data-tab': t.id }, icon(t.icon, 22), h('span', null, t.label))));
let current = 'play';

function go(id) {
  if (!views[id]) id = 'play';
  current = id;
  for (const [name, v] of Object.entries(views)) v.el.hidden = name !== id;
  nav.querySelectorAll('a').forEach((a) => a.classList.toggle('sel', a.dataset.tab === id));
  document.body.dataset.tab = id;
  views[id].refresh();
  main.scrollTop = 0;
  if (location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`);
}
window.addEventListener('hashchange', () => go(location.hash.slice(1)));

// ---------- transport ----------
let wake = null;
events.on('transport', ({ playing, recording }) => {
  fill(playBtn, icon(playing ? 'stop' : 'play', 20));
  playBtn.setAttribute('aria-label', playing ? 'Stop' : 'Play');
  playBtn.classList.toggle('on', playing);
  recBtn.classList.toggle('on', recording);
  recBtn.setAttribute('aria-pressed', String(recording));
  document.body.classList.toggle('playing', playing);
  if (!playing) beat.classList.remove('hit', 'one');
  // keep the screen awake while the loop plays
  if (playing && navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then((w) => { wake = w; w.addEventListener('release', () => { wake = null; }); }).catch(() => {});
  if (!playing && wake) { wake.release().catch(() => {}); wake = null; }
});
events.on('tempo', drawTempo);
events.on('song', drawTempo);
events.on('step', (q) => {
  const sig = band.sig();
  if (q.step % sig.spb !== 0) return;
  beat.classList.toggle('one', q.step % (sig.spb * sig.beats) === 0);
  beat.classList.remove('hit');
  void beat.offsetWidth;
  beat.classList.add('hit');
});

// ---------- the keyboard ----------
const ON_KEYS = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK'];
const OFF_KEYS = ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma'];
const STATION_KEYS = ['KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight'];
const MOTION_KEYS = { KeyQ: 'parallel', KeyW: 'contrary', KeyE: 'oblique' };
const pressed = new Map();

const typing = (e) => { const t = e.target; return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable); };
const padOf = (code) => (ON_KEYS.includes(code) ? ON_KEYS.indexOf(code) * 2 : OFF_KEYS.includes(code) ? OFF_KEYS.indexOf(code) * 2 + 1 : null);

window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || typing(e) || sheetIsOpen()) return;
  const play = views.play;
  const pad = padOf(e.code);
  if (pad != null) {
    e.preventDefault();
    if (e.repeat || pressed.has(e.code)) return;
    pressed.set(e.code, pad);
    play.press(`k${e.code}`, pad);
    return;
  }
  if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
    e.preventDefault();
    if (e.repeat || pressed.has(e.code)) return;
    pressed.set(e.code, 'lean');
    play.borrowDown(e.code === 'ArrowUp' ? 1 : -1);
    return;
  }
  if (e.repeat) return;
  if (e.code === 'Space') { e.preventDefault(); band.toggle(); }
  else if (e.code === 'Enter') { e.preventDefault(); inst.strumAll(e.shiftKey ? -1 : 1); }
  else if (/^Digit[1-9]$/.test(e.code)) play.setFloor(Number(e.code.slice(5)) - 1);
  else if (MOTION_KEYS[e.code]) play.setMotion(MOTION_KEYS[e.code]);
  else if (STATION_KEYS.includes(e.code)) play.station(STATION_KEYS.indexOf(e.code));
  else if (e.code === 'KeyR') band.setRecord(!band.recording);
  else if (e.code === 'KeyL') play.setHold(!state.hold);
  else if (e.code === 'Semicolon') play.mirror();
  else if (e.code === 'ArrowLeft') { e.preventDefault(); play.cycleVoice(-1); }
  else if (e.code === 'ArrowRight') { e.preventDefault(); play.cycleVoice(1); }
  else if (e.code === 'Minus') play.octave(-1);
  else if (e.code === 'Equal') play.octave(1);
  else if (e.code === 'Period') band.nextEntry(e.shiftKey ? -1 : 1);
});
function keyUp(code) {
  if (!pressed.has(code)) return;
  const what = pressed.get(code);
  pressed.delete(code);
  if (what === 'lean') views.play.borrowUp(); else views.play.lift(`k${code}`, what);
}
window.addEventListener('keyup', (e) => keyUp(e.code));
window.addEventListener('blur', () => { for (const code of [...pressed.keys()]) keyUp(code); inst.unleanAll(); });

// ---------- the guide ----------
function guide() {
  sheet('Parlor', (body) => {
    const sec = (title, ...kids) => h('section', { class: 'guide-sec' }, h('h3', null, title), ...kids);
    const p = (...kids) => h('p', null, ...kids);
    const on = (t) => h('span', { class: 'ink-on' }, t);
    const off = (t) => h('span', { class: 'ink-off' }, t);
    const k = (t) => h('kbd', null, t);
    fill(body,
      p('An instrument for the scales of chords. You practise in the woodshed. This is where you play.'),
      sec('The pads',
        p('Eight pads are the eight notes of the scale. The top row is the ', on('on'), ' chord: root, third, fifth, sixth. The bottom row is the ', off('off'), ' chord, a diminished chord: second, fourth, sharp five, major seven. Zig-zag across them and you walk the scale.'),
        p('Each pad plays its note as the melody, with a chord built beneath it. Slide a finger from pad to pad to walk. Say the name as you land: "fifth, on".')),
      sec('The Elevator',
        p('The numbered rail chooses the floor: how much chord sits under the melody, from a single note (1) through thirds, triads, shells and octaves to drop 2 (6) and the wide floors. Tap the lit floor again to hear its other shape, where it has one.'),
        p('It works while a chord is ringing. Hold a pad and slide a finger along the rail: the melody stays, and the chord opens and closes beneath it.'),
        p(h('b', null, 'Mirror'), ' swaps a floor for its reflection: thirds for drop 2, triads for drop 3, shells for drop 2 and 4, octaves for double octaves. The melody stays and the bass jumps an octave. That is a pivot.')),
      sec('Motion',
        p(h('b', null, 'Parallel'), ': the floor stays, so the bass follows the melody. ', h('b', null, 'Contrary'), ': step the melody up and the floor grows, so the bass steps down; step down and it closes again. ', h('b', null, 'Oblique'), ': the bass holds while the melody moves.')),
      sec('Borrowing',
        p('Every note has a neighbour a step above and a step below, and the neighbour always belongs to the other chord. Borrowing is letting one voice of a chord step to its neighbour while the rest keep ringing, and then step back. The chord leans, then settles.'),
        p('The row of keys above the pads is the chord you are on, one key for each voice, lowest on the left. Press the ', h('b', null, 'top'), ' half of a key to borrow above and the ', h('b', null, 'bottom'), ' half to borrow below. Let go and the voice goes home. Hold a pad with one hand and lean its voices with the other, two at a time if you like. With no pad down, a voice key strikes your last chord again, leaning.'),
        p(h('b', null, 'On chord under off notes'), ' keeps the on chord beneath an off melody note, so only the melody leans.')),
      sec('Stations and family',
        p(h('b', null, 'Stations'), ' are the chords round your home key. The last five are five ways to play the V chord, each one the off chord with a note moved a half step: minor 6 on the 5, tritone’s minor, true dominant, tritone substitute, dominant 7♭5. The bass keeps the V underneath, so you hear what each one does.'),
        p(h('b', null, 'Family'), ' moves a 6th chord to its brothers and sisters: forward, backward, across, up or down a family, major or minor. The formula from home is shown as you go.'),
        p('A pad under your finger stays in the scale it was played in, so you can choose the next station while it rings. With ', h('b', null, 'Hold'), ' on, a chord rings after you lift, and then a station or a family move takes that chord with it by the shortest route, each voice moving as little as it can. That is transformation, played.')),
      sec('Strings',
        p('The plate is strung with the chord of the last pad, across three octaves. Drag across it to strum, or tap one string. Switch it to Scale for single-note lines.')),
      sec('Loop and Tune',
        p('Loop is a drummer, a bass player and a chord lane. Pick a rhythm, press play, and play over it. Press record and what the pads play is written into the loop. Or tap steps in by hand.'),
        p('Tune loads a tune’s changes. The pads retune themselves chord by chord, the way the method reads a chart, and on a dominant you can swap the substitution as it goes by.')),
      sec('On a keyboard',
        h('ul', { class: 'keys-list' },
          h('li', null, k('A'), k('S'), k('D'), k('F'), ' on pads, ', k('Z'), k('X'), k('C'), k('V'), ' off pads'),
          h('li', null, k('1'), '–', k('9'), ' floor · ', k(';'), ' mirror · ', k('Q'), k('W'), k('E'), ' parallel, contrary, oblique'),
          h('li', null, k('↑'), k('↓'), ' borrow above, below · ', k('←'), k('→'), ' which voice'),
          h('li', null, k('T'), k('Y'), k('U'), k('I'), k('O'), k('P'), k('['), k(']'), ' stations'),
          h('li', null, k('Enter'), ' strum · ', k('Space'), ' play or stop · ', k('R'), ' record · ', k('L'), ' hold · ', k('−'), k('='), ' octave · ', k('.'), ' next chart chord'))),
      h('p', { class: 'muted small' }, `Parlor ${VERSION}. Built on Thomas Echols’s Labyrinth of Limitations, after Barry Harris. The explanations here are this app’s own.`));
  }, { wide: true });
}

// The first visit gets three lines and a button. (Tapping the button also wakes the sound.)
function welcome() {
  sheet('Parlor', (body, api) => {
    fill(body,
      h('p', null, 'An instrument for the scales of chords. You practise in the woodshed. This is where you play.'),
      h('ul', { class: 'welcome' },
        h('li', null, h('b', null, 'Tap a pad. '), 'Its note is the melody, with a chord beneath it. The top row is the ', h('span', { class: 'ink-on' }, 'on'), ' chord, the bottom row the ', h('span', { class: 'ink-off' }, 'off'), ' chord.'),
        h('li', null, h('b', null, 'Drag across the strings. '), 'They are tuned to the chord you just played.'),
        h('li', null, h('b', null, 'Press play. '), 'A drummer and a bass player come in, and follow where you go.')),
      h('p', { class: 'muted small' }, 'The question mark at the top explains every control.'),
      h('button', { type: 'button', class: 'primary wide', onclick: () => api.close() }, 'Start playing'));
  });
}

// ---------- measuring the sound without hearing it ----------
// Renders every voice and every drum offline and reports how loud each comes out. Used
// when checking a build: run `parlor.probe()` in the console.
async function probe() {
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const measure = async (seconds, build) => {
    const ctx = new OAC(2, Math.floor(44100 * seconds), 44100);
    const desk = createDesk(ctx);
    build(desk);
    const buf = await ctx.startRendering();
    let peak = 0; let sum = 0; let bad = 0;
    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) { const v = d[i]; if (!Number.isFinite(v)) bad += 1; else { peak = Math.max(peak, Math.abs(v)); sum += v * v; } }
    }
    return { peak: +peak.toFixed(3), rms: +Math.sqrt(sum / (buf.length * buf.numberOfChannels)).toFixed(4), bad };
  };
  const out = { voices: {}, drums: {}, mix: null };
  for (const [id, preset] of Object.entries(PRESETS)) {
    out.voices[id] = await measure(2.5, (desk) => {
      const part = preset.kind === 'bass' ? 'bass' : 'pads';
      const s = new Synth(desk, part); s.setPatch(preset); desk.setPart(part, { level: 0.8 });
      const notes = preset.kind === 'bass' ? [36] : [55, 60, 64, 69];
      notes.forEach((m, i) => s.noteOn(m, { when: 0.05 + i * 0.011, vel: 0.82, dur: 1.2 }));
    });
  }
  for (const kit of Object.keys(KITS)) for (const lane of LANES) {
    out.drums[`${kit}.${lane}`] = await measure(1.2, (desk) => { const d = new Drums(desk); d.setKit(kit); desk.setPart('drums', { level: 0.7 }); d.trigger(lane, 0.05, 3); });
  }
  // everything at once: a full chord, a strum, a bass note and a bar of drums
  out.mix = await measure(3, (desk) => {
    const pads = new Synth(desk, 'pads'); pads.setPatch(PRESETS.tines); desk.setPart('pads', { level: 0.8 });
    const strum = new Synth(desk, 'strum'); strum.setPatch(PRESETS.harp); desk.setPart('strum', { level: 0.75 });
    const bass = new Synth(desk, 'bass'); bass.setPatch(PRESETS.upright); desk.setPart('bass', { level: 0.8 });
    const d = new Drums(desk); d.setKit('sticks'); desk.setPart('drums', { level: 0.7 });
    [55, 60, 64, 69].forEach((m) => pads.noteOn(m, { when: 0.05, vel: 0.9, dur: 2 }));
    [48, 52, 55, 57, 60, 64, 67, 69, 72, 76, 79, 81].forEach((m, i) => strum.noteOn(m, { when: 0.05 + i * 0.02, vel: 0.9, dur: 2 }));
    bass.noteOn(36, { when: 0.05, vel: 0.9, dur: 1 });
    for (const lane of LANES) d.trigger(lane, 0.05, 3);
  });
  return out;
}

// ---------- start ----------
document.body.append(header, main, nav);
drawTempo();
go(location.hash.slice(1) || 'play');

// Sound has to be woken by a touch or a key. Do it on the very first one, wherever it lands.
// (A phone only counts the end of a touch as permission, so listen for that as well.)
const wakeAudio = () => inst.audio();
for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) document.addEventListener(type, wakeAudio, { capture: true, passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(state); });
window.addEventListener('pagehide', () => saveNow(state));

if (!state.seen.guide) { state.seen.guide = true; save(); welcome(); }

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

window.parlor = { state, inst, band, events, probe, go, version: VERSION };
