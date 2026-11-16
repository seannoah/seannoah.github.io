// sound.js — the Sound screen: a voice for each part with its synth controls, the drum
// kits, and the mixer with the shared effects.

import { h, fill, icon, segmented, slider } from './dom.js';
import { PRESETS, presetIds, resolvePatch, CONTROLS, WAVES, waveById, fromSlider, toSlider } from './synth.js';
import { KITS, KIT_IDS } from './rhythms.js';
import { LANES } from './seq.js';

const TABS = [
  { id: 'pads', label: 'Pads' }, { id: 'strum', label: 'Strings' }, { id: 'bass', label: 'Bass' }, { id: 'drums', label: 'Drums' }, { id: 'mix', label: 'Mix' },
];

const show = (c, v) => {
  if (c.unit === 'Hz') return v >= 1000 ? `${(v / 1000).toFixed(1)} kHz` : `${Math.round(v)} Hz`;
  if (c.unit === 's') return v < 1 ? `${Math.round(v * 1000)} ms` : `${v.toFixed(1)} s`;
  if (c.unit === 'cents') return `${Math.round(v)} cents`;
  if (c.max === 1) return `${Math.round(v * 100)}%`;
  return v.toFixed(1);
};

export function soundView(app) {
  const { state, inst, save } = app;
  let tab = 'pads';
  const panel = h('div', { class: 'sound-panel' });
  const tabs = segmented(TABS, tab, (id) => { tab = id; draw(); }, 'sound-tabs');
  const el = h('section', { class: 'view sound', 'data-view': 'sound' }, tabs.el, panel);

  const apply = () => { inst.applySound(); save(); };
  const level = (label, get, set) => slider({ label, value: get(), format: (x) => `${Math.round(x * 100)}%`, onInput: (x) => { set(x); apply(); } }).el;

  function drawSynth(name) {
    const part = state.parts[name];
    const patch = resolvePatch(part.preset, part.changes);
    const changed = Object.keys(part.changes).length > 0;
    const wave = waveById(patch.wave);
    const groups = [...new Set(CONTROLS.map((c) => c.group))];
    const set = (id, v) => { part.changes = { ...part.changes, [id]: v }; apply(); };
    fill(panel,
      h('div', { class: 'sound-head' },
        h('div', null, h('h2', null, `${PRESETS[part.preset].name}${changed ? ', changed' : ''}`),
          h('p', { class: 'muted small' }, name === 'pads' ? 'What the pads play.' : name === 'strum' ? 'What the string plate plays.' : 'What the bass line plays.')),
        h('button', { type: 'button', class: 'pill', onclick: () => inst.audition(name) }, icon('play', 14), 'Hear it')),
      h('div', { class: 'chips' }, presetIds(name === 'bass' ? 'bass' : 'keys').map((id) => h('button', {
        type: 'button', class: `chip${id === part.preset ? ' sel' : ''}`,
        onclick: () => { part.preset = id; part.changes = {}; apply(); draw(); inst.audition(name); },
      }, PRESETS[id].name))),
      h('div', { class: 'group' }, h('h3', null, 'Wave'),
        h('div', { class: 'chips waves' }, WAVES.map((w) => h('button', {
          type: 'button', class: `chip${w.id === patch.wave ? ' sel' : ''}`, onclick: () => { set('wave', w.id); draw(); inst.audition(name); },
        }, w.name))),
        h('div', { class: 'oct-row' }, h('span', { class: 'sl-l' }, 'Octave'),
          h('button', { type: 'button', class: 'mini', 'aria-label': 'Octave down', onclick: () => { set('octave', Math.max(-2, patch.octave - 1)); draw(); } }, icon('minus', 16)),
          h('span', { class: 'oct-v' }, patch.octave > 0 ? `+${patch.octave}` : String(patch.octave)),
          h('button', { type: 'button', class: 'mini', 'aria-label': 'Octave up', onclick: () => { set('octave', Math.min(2, patch.octave + 1)); draw(); } }, icon('plus', 16)))),
      groups.map((g) => h('div', { class: 'group' }, h('h3', null, g),
        h('div', { class: 'sliders' }, CONTROLS.filter((c) => c.group === g).map((c) => slider({
          label: c.id === 'color' ? wave.color : c.name, value: toSlider(c, patch[c.id]), hint: c.hint,
          format: (x) => show(c, fromSlider(c, x)), onInput: (x) => set(c.id, fromSlider(c, x)), onChange: () => { if (!changed) draw(); },
        }).el)))),
      h('div', { class: 'group' }, h('h3', null, 'Level'), h('div', { class: 'sliders' }, level('Volume', () => part.level, (x) => { part.level = x; }))),
      changed ? h('button', { type: 'button', class: 'pill', onclick: () => { part.changes = {}; apply(); draw(); } }, `Back to ${PRESETS[part.preset].name} as it was`) : null);
  }

  function drawDrums() {
    const kit = KITS[state.drums.kit];
    fill(panel,
      h('div', { class: 'sound-head' }, h('div', null, h('h2', null, kit.name), h('p', { class: 'muted small' }, 'Every sound is made from sine waves and noise. Tap one to hear it.'))),
      h('div', { class: 'chips' }, KIT_IDS.map((id) => h('button', {
        type: 'button', class: `chip${id === state.drums.kit ? ' sel' : ''}`, onclick: () => { state.drums.kit = id; apply(); draw(); },
      }, KITS[id].name))),
      h('div', { class: 'kit' }, LANES.map((lane) => h('button', {
        type: 'button', class: 'kit-pad', onpointerdown: (e) => { e.preventDefault(); const r = inst.audio(); if (r) r.drums.trigger(lane, 0, 3); },
      }, kit.lanes[lane].label))),
      h('div', { class: 'group' }, h('h3', null, 'Level'), h('div', { class: 'sliders' }, level('Volume', () => state.drums.level, (x) => { state.drums.level = x; }))));
  }

  function drawMix() {
    const fx = state.fx;
    fill(panel,
      h('div', { class: 'sound-head' }, h('div', null, h('h2', null, 'Mix'), h('p', { class: 'muted small' }, 'How loud each part is, and the effects they share.'))),
      h('div', { class: 'group' }, h('h3', null, 'Levels'), h('div', { class: 'sliders' },
        level('Pads', () => state.parts.pads.level, (x) => { state.parts.pads.level = x; }),
        level('Strings', () => state.parts.strum.level, (x) => { state.parts.strum.level = x; }),
        level('Bass', () => state.parts.bass.level, (x) => { state.parts.bass.level = x; }),
        level('Drums', () => state.drums.level, (x) => { state.drums.level = x; }),
        level('Everything', () => state.master, (x) => { state.master = x; }))),
      h('div', { class: 'group' }, h('h3', null, 'Shared effects'), h('div', { class: 'sliders' },
        slider({ label: 'Delay time', value: (fx.delayTime - 0.05) / 0.95, format: (x) => `${Math.round((0.05 + x * 0.95) * 1000)} ms`, onInput: (x) => { fx.delayTime = 0.05 + x * 0.95; apply(); }, hint: 'The gap between echoes.' }).el,
        slider({ label: 'Delay repeats', value: fx.feedback / 0.8, format: (x) => `${Math.round(x * 100)}%`, onInput: (x) => { fx.feedback = x * 0.8; apply(); }, hint: 'How many times an echo comes back.' }).el,
        slider({ label: 'Room size', value: fx.room, format: (x) => (x < 0.25 ? 'small room' : x < 0.6 ? 'hall' : 'cathedral'), onInput: (x) => { fx.room = x; apply(); }, hint: 'How long the reverb rings.' }).el)),
      h('p', { class: 'muted small' }, 'How much of each effect a part gets is set on that part: Pads, Strings and Bass each have chorus, delay and reverb sliders.'));
  }

  function draw() {
    tabs.set(tab);
    if (tab === 'drums') drawDrums(); else if (tab === 'mix') drawMix(); else drawSynth(tab);
  }

  return { el, refresh: draw };
}
