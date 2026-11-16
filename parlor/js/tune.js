// tune.js — the Tune screen: choose a tune's changes, see how each chord is read as a
// scale of chords, change the reading, change the key, or type in changes of your own.

import { h, fill, icon, segmented, acc } from './dom.js';
import { TUNES } from './tunes.js';
import { keyName, mod } from './theory.js';
import { parseChart } from './harmony.js';

export function tuneView(app) {
  const { state, band, events, save } = app;
  const list = h('div', { class: 'tune-list' });
  const body = h('div', { class: 'tune-body' });
  const el = h('section', { class: 'view tune', 'data-view': 'tune' }, list, body);

  function drawList() {
    const id = state.tune.id;
    const chip = (tid, label, sub) => h('button', { type: 'button', class: `tune-chip${tid === id ? ' sel' : ''}`, onclick: () => { band.setTune(tid); } },
      h('span', { class: 'tune-name' }, acc(label)), sub ? h('span', { class: 'st-name' }, sub) : null);
    fill(list,
      h('div', { class: 'tune-group' }, chip(null, 'Free play', 'no chart')),
      h('p', { class: 'row-label' }, 'Movements'),
      h('div', { class: 'tune-group' }, TUNES.filter((t) => t.kind === 'movement').map((t) => chip(t.id, t.title, t.form))),
      h('p', { class: 'row-label' }, 'Tunes'),
      h('div', { class: 'tune-group' }, TUNES.filter((t) => t.kind !== 'movement').map((t) => chip(t.id, t.title, t.form)), chip('custom', 'My changes', 'type your own')));
  }

  function drawBody() {
    const tl = band.timeline;
    const tune = band.tune;
    if (!tune || !tl) {
      fill(body, h('div', { class: 'card' }, h('h2', null, 'Free play'),
        h('p', { class: 'muted' }, 'No chart is loaded. The pads stay in the key and scale you choose, and the stations on the Play screen take you round it.'),
        h('p', { class: 'muted' }, 'Choose a tune and the pads retune themselves chord by chord. Each chart chord is read as a scale of chords, the way the method reads a chart: a minor 7 chord becomes the major 6 with the same four notes, and a dominant chord becomes one of its substitutions.')));
      return;
    }
    const cur = band.cursor;
    const e = tl.entries[cur] || tl.entries[0];
    const rows = [];
    for (let b = 0; b < tl.bars; b += 4) rows.push([b, b + 1, b + 2, b + 3].filter((x) => x < tl.bars));
    const keyLabel = tl.home != null ? `Key of ${keyName(tl.home)}${tl.minor ? ' minor' : ''}` : 'As written';

    const custom = tune.id === 'custom' ? customEditor() : null;
    fill(body,
      h('div', { class: 'tune-head' },
        h('div', null, h('h2', null, acc(tune.title)), h('p', { class: 'muted small' }, [tune.by, tune.year, tune.form].filter(Boolean).join(' · '))),
        h('div', { class: 'transpose' },
          h('button', { type: 'button', class: 'mini', 'aria-label': 'Down a half step', onclick: () => { band.setTranspose((state.tune.transpose || 0) - 1); } }, icon('minus', 16)),
          h('span', { class: 'transpose-key' }, keyLabel),
          h('button', { type: 'button', class: 'mini', 'aria-label': 'Up a half step', onclick: () => { band.setTranspose((state.tune.transpose || 0) + 1); } }, icon('plus', 16)))),
      custom,
      tl.entries.length ? h('div', { class: 'chart' }, rows.map((row) => h('div', { class: 'chart-row' }, row.map((b) => {
        const inBar = tl.entries.filter((x) => x.bar === b);
        return h('div', { class: 'bar' }, h('span', { class: 'bar-n' }, String(b + 1)),
          inBar.map((x) => h('button', {
            type: 'button', class: `chord-cell${x.index === cur ? ' now' : ''}`, 'data-index': String(x.index), style: { flex: String(x.to - x.from) },
            title: `${x.symbol}: ${x.how}`, onclick: () => { band.gotoEntry(x.index); drawBody(); },
          }, h('span', { class: 'sym cc-sym' }, x.symbol), h('span', { class: `sym cc-use ${x.h.scale}` }, x.options[x.pick].on))));
      })))) : h('p', { class: 'muted' }, 'No chords yet. Type some changes above.'),
      tl.entries.length ? h('div', { class: 'card reading-card' },
        h('h3', null, h('span', { class: 'sym' }, e.symbol), ` in bar ${e.bar + 1}`),
        h('p', { class: 'muted small' }, e.options.length > 1 ? 'Ways to play it. Tap one to change the reading.' : 'Played as:'),
        h('div', { class: 'readings wide' }, e.options.map((o, i) => h('button', {
          type: 'button', class: `reading${i === e.pick ? ' sel' : ''}`, onclick: () => { band.setPick(e.index, i); drawBody(); },
        }, h('span', { class: 'sym' }, o.on), h('span', { class: 'st-name' }, o.how)))),
        h('p', { class: 'muted small' }, `${e.options[e.pick].label} diminished: ${e.options[e.pick].why}.${e.movement ? ` Part of a movement: ${e.movement}.` : ''}`)) : null,
      h('p', { class: 'muted small' }, 'Press play and the pads follow the chart. Or stop, and step through it by hand with the arrows on the Play screen, in your own time.'));
  }

  function customEditor() {
    const area = h('textarea', { class: 'chart-input', rows: '4', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'Chord changes' });
    area.value = state.tune.custom;
    const beats = segmented([{ id: 4, label: 'In 4' }, { id: 3, label: 'In 3' }, { id: 6, label: 'In 6' }], state.tune.customBeats || 4, (n) => { state.tune.custom = area.value; state.tune.customBeats = n; save(); band.setTune('custom'); }, 'small');
    const note = h('p', { class: 'muted small' });
    const count = () => { const bars = parseChart(area.value); note.textContent = bars.length ? `${bars.length} bar${bars.length > 1 ? 's' : ''} read.` : 'Put chords between bar lines: | Dm7 | G7 | C6 | % |'; };
    count();
    area.addEventListener('input', count);
    return h('div', { class: 'card' },
      h('p', { class: 'muted small' }, 'Bars go between | signs. Two chords in a bar share it. % repeats the bar before.'),
      area,
      h('div', { class: 'custom-row' }, beats.el, h('button', { type: 'button', class: 'pill', onclick: () => { state.tune.custom = area.value; state.tune.picks.custom = {}; save(); band.rebuild(); band.gotoEntry(0); drawBody(); } }, 'Use these changes')),
      note);
  }

  function refresh() { drawList(); drawBody(); }

  events.on('tune', () => { if (!el.hidden) refresh(); });
  events.on('timeline', () => { if (!el.hidden) drawBody(); });
  events.on('entry', (entry) => {
    if (el.hidden) return;
    body.querySelectorAll('.chord-cell').forEach((c) => c.classList.toggle('now', Number(c.dataset.index) === entry.index));
    if (band.playing) {
      const now = body.querySelector('.chord-cell.now');
      if (now && now.scrollIntoView) now.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });

  return { el, refresh, mod };
}
