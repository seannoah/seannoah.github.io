// loop.js — the Loop screen: rhythm, tempo and swing, four patterns and their chain,
// and the three lanes (chords, bass, drums) as rows of steps to tap.

import { h, fill, icon, segmented, slider } from './dom.js';
import { SIGS, stepsPerBar, patternSteps, resizePattern, putChord, removeChordAt, chordAt, emptyPattern, LANES, PATTERN_IDS, tapTempo, TEMPO_MIN, TEMPO_MAX } from './seq.js';
import { RHYTHMS, KITS, rhythmById, patternOf } from './rhythms.js';
import { ROLES } from './bass.js';
import { SCALES, harmonyNotes, mod, isOn } from './theory.js';
import { shapeOn, shapeSteps, SHAPES } from './floors.js';

const NEXT_HIT = { 0: 2, 2: 3, 3: 1, 1: 0 };   // tap a drum step: on, accent, soft, off

export function loopView(app) {
  const { state, inst, band, events, save } = app;
  const song = () => state.song;
  const sig = () => SIGS[song().sig];
  let viewBar = 0;
  let chordBrush = 'auto';
  let bassBrush = 'R';
  let taps = [];
  let heads = [];
  let nowPlaying = null;

  const top = h('div', { class: 'loop-top' });
  const pats = h('div', { class: 'loop-pats' });
  const lanes = h('div', { class: 'lanes' });
  const el = h('section', { class: 'view loop', 'data-view': 'loop' }, top, pats, lanes);

  // ---------- rhythm, tempo, swing ----------
  function drawTop() {
    const s = song();
    const tempo = slider({
      label: 'Tempo', value: (s.bpm - TEMPO_MIN) / (TEMPO_MAX - TEMPO_MIN), format: (x) => `${Math.round(TEMPO_MIN + x * (TEMPO_MAX - TEMPO_MIN))} beats a minute`,
      onInput: (x) => band.setTempo(TEMPO_MIN + x * (TEMPO_MAX - TEMPO_MIN)),
    });
    const swingName = (v) => (v < 0.515 ? 'even' : Math.abs(v - 2 / 3) < 0.012 ? 'triplet' : v < 0.6 ? 'light' : v > 0.7 ? 'hard' : 'swung');
    const swing = slider({
      label: 'Swing', value: (s.swing - 0.5) / 0.25, format: (x) => swingName(0.5 + x * 0.25),
      onInput: (x) => band.setSwing(0.5 + x * 0.25), hint: 'How late the second eighth note of each beat falls.',
    });
    const tap = h('button', { type: 'button', class: 'pill', title: 'Tap the beat a few times', onclick: () => {
      taps.push(performance.now() / 1000); taps = taps.slice(-6);
      const bpm = tapTempo(taps);
      if (bpm) { band.setTempo(bpm); tempo.set((bpm - TEMPO_MIN) / (TEMPO_MAX - TEMPO_MIN)); }
    } }, 'Tap');
    const click = h('button', { type: 'button', class: `pill toggle${s.click ? ' sel' : ''}`, 'aria-pressed': String(!!s.click), title: 'A click on every beat', onclick: () => { s.click = !s.click; save(); drawTop(); } }, icon('click', 16), 'Click');
    fill(top,
      h('div', { class: 'chips rhythms', role: 'group', 'aria-label': 'Rhythm' }, RHYTHMS.map((r) => h('button', {
        type: 'button', class: `chip${r.id === s.rhythm ? ' sel' : ''}`, title: r.about, onclick: () => { band.setRhythm(r.id); },
      }, r.name))),
      h('p', { class: 'muted small about' }, `${rhythmById(s.rhythm).about} In ${sig().say}.`),
      h('div', { class: 'tempo-row' }, tempo.el, tap, click),
      sig().swings ? swing.el : null);
  }

  // ---------- patterns and the chain ----------
  function drawPats() {
    const s = song();
    const p = s.patterns[s.edit];
    const edit = h('div', { class: 'seg', role: 'group', 'aria-label': 'Pattern to edit' }, PATTERN_IDS.map((id) => h('button', {
      type: 'button', class: `seg-b${id === s.edit ? ' sel' : ''}${id === nowPlaying ? ' now' : ''}`, 'aria-pressed': String(id === s.edit), 'data-pat': id,
      onclick: () => { s.edit = id; viewBar = 0; save(); drawPats(); drawLanes(); },
    }, id)));
    const bars = segmented([1, 2, 4].map((n) => ({ id: n, label: `${n} bar${n > 1 ? 's' : ''}` })), p.bars, (n) => {
      s.patterns[s.edit] = resizePattern(p, sig(), n); viewBar = Math.min(viewBar, n - 1); save(); drawPats(); drawLanes();
    }, 'small');
    fill(pats,
      h('div', { class: 'pat-row' }, h('span', { class: 'row-label' }, 'Pattern'), edit, bars.el),
      h('div', { class: 'pat-row chain-row' }, h('span', { class: 'row-label' }, 'Chain'),
        h('div', { class: 'chain' }, s.chain.map((id, i) => h('button', {
          type: 'button', class: 'link', title: 'Tap to take this out of the chain', 'data-slot': String(i),
          onclick: () => { if (s.chain.length > 1) { s.chain.splice(i, 1); save(); drawPats(); } },
        }, id))),
        h('div', { class: 'chain-add' }, PATTERN_IDS.map((id) => h('button', {
          type: 'button', class: 'mini text', 'aria-label': `Add pattern ${id} to the chain`,
          onclick: () => { if (s.chain.length < 16) { s.chain.push(id); save(); drawPats(); } },
        }, `+${id}`)))));
  }

  // ---------- lanes ----------
  const barsShown = () => (window.innerWidth >= 900 ? 2 : 1);

  function grid(per, from, cell) {
    const shown = Math.min(barsShown(), song().patterns[song().edit].bars - 0);
    const total = patternSteps(song().patterns[song().edit], sig());
    const head = h('i', { class: 'head' });
    heads.push({ el: head, from, count: per * shown });
    const g = h('div', { class: 'grid', style: { gridTemplateColumns: `repeat(${per * shown}, 1fr)` } });
    for (let k = 0; k < per * shown; k++) {
      const s = from + k;
      if (s >= total) break;
      const c = cell(s);
      if (k % sig().spb === 0) c.classList.add('beat');
      if (k % per === 0) c.classList.add('barline');
      g.append(c);
    }
    return h('div', { class: 'grid-wrap' }, g, head);
  }

  function drawLanes() {
    const s = song();
    const sg = sig();
    const p = s.patterns[s.edit];
    const per = stepsPerBar(sg);
    const shown = Math.min(barsShown(), p.bars);
    viewBar = Math.min(viewBar, Math.max(0, p.bars - shown));
    const from = viewBar * per;
    heads = [];
    const kit = KITS[state.drums.kit];
    const notes = harmonyNotes(state.h);

    const pagerEl = p.bars > shown ? h('div', { class: 'bar-pager' },
      h('button', { type: 'button', class: 'mini', 'aria-label': 'Earlier bars', disabled: viewBar === 0, onclick: () => { viewBar -= 1; drawLanes(); } }, icon('left', 16)),
      h('span', null, shown > 1 ? `Bars ${viewBar + 1}–${viewBar + shown} of ${p.bars}` : `Bar ${viewBar + 1} of ${p.bars}`),
      h('button', { type: 'button', class: 'mini', 'aria-label': 'Later bars', disabled: viewBar >= p.bars - shown, onclick: () => { viewBar += 1; drawLanes(); } }, icon('right', 16))) : null;

    const mute = (name) => h('button', { type: 'button', class: `mini text mute${s.mute[name] ? ' sel' : ''}`, 'aria-pressed': String(!!s.mute[name]), onclick: () => { s.mute[name] = !s.mute[name]; save(); drawLanes(); } }, s.mute[name] ? 'Muted' : 'Mute');
    const act = (label, fn) => h('button', { type: 'button', class: 'mini text', onclick: fn }, label);
    const setP = (next) => { s.patterns[s.edit] = next; save(); drawLanes(); };

    // chords
    const brushes = [{ id: 'auto', label: 'Auto', title: 'The on chord nearest the last one, on the floor in use' },
      ...notes.map((n) => ({ id: n.deg, label: n.label, cls: n.on ? 'on' : 'off', title: `${n.say}, ${n.on ? 'on' : 'off'}` })),
      { id: 'stop', label: 'Stop', title: 'Silence from here' }];
    const chordBrushes = h('div', { class: 'brushes' }, brushes.map((b) => h('button', {
      type: 'button', class: `brush ${b.cls || ''}${chordBrush === b.id ? ' sel' : ''}`, title: b.title, onclick: () => { chordBrush = b.id; drawLanes(); },
    }, b.label)));
    const chordCell = (st) => {
      const ev = chordAt(p, st);
      let label = ''; let cls = '';
      if (ev) {
        if (ev.rest) { label = '×'; cls = 'rest'; } else if (ev.n === 'auto') { label = '•'; cls = 'auto'; } else {
          label = SCALES[(ev.h || state.h).scale].labels[mod(ev.n, 8)]; cls = isOn(ev.n) ? 'on' : 'off';
        }
      }
      return h('button', { type: 'button', class: `cell chord ${cls}${ev ? ' full' : ''}`, 'aria-label': `Chord step ${st + 1}${ev ? `: ${label}` : ''}`, onclick: () => {
        const same = ev && ((chordBrush === 'stop' && ev.rest) || (chordBrush === 'auto' && ev.n === 'auto') || (typeof chordBrush === 'number' && !ev.rest && ev.n !== 'auto' && mod(ev.n, 8) === chordBrush));
        if (same) { setP(removeChordAt(p, st)); return; }
        if (chordBrush === 'stop') setP(putChord(p, { s: st, rest: true, len: null }));
        else if (chordBrush === 'auto') setP(putChord(p, { s: st, len: null, n: 'auto', steps: null, floor: null }));
        else {
          const n = chordBrush + 8 * state.octave;
          const steps = shapeSteps(shapeOn(state.floor, state.variants), n);
          setP(putChord(p, { s: st, len: null, n, steps, floor: state.floor, h: { ...state.h } }));
          if (!band.playing) { inst.audio(); inst.sound(steps, state.h, { dur: 0.7 }); }
        }
      } }, label);
    };

    // bass
    const bassBrushes = h('div', { class: 'brushes' }, ROLES.map((r) => h('button', {
      type: 'button', class: `brush${bassBrush === r.id ? ' sel' : ''}`, onclick: () => { bassBrush = r.id; drawLanes(); },
    }, r.name)));
    const bassCell = (st) => {
      const role = p.bass[st];
      return h('button', { type: 'button', class: `cell bass${role ? ' full' : ''}`, 'aria-label': `Bass step ${st + 1}${role ? `: ${role}` : ''}`, onclick: () => {
        const bass = [...p.bass];
        bass[st] = role === bassBrush ? null : bassBrush;
        setP({ ...p, bass });
      } }, role ? (role === 'a' ? '›' : role === 'N' ? '»' : role) : '');
    };

    // drums
    const drumRow = (lane) => h('div', { class: 'lane-row' },
      h('button', { type: 'button', class: 'lane-name', title: 'Hear it', onclick: () => { const r = inst.audio(); if (r) r.drums.trigger(lane, 0, 2); } }, kit.lanes[lane].label),
      grid(per, from, (st) => {
        const v = p.drums[lane][st];
        return h('button', { type: 'button', class: `cell drum v${v}`, 'aria-label': `${kit.lanes[lane].label} step ${st + 1}`, onclick: () => {
          const drums = { ...p.drums, [lane]: [...p.drums[lane]] };
          drums[lane][st] = NEXT_HIT[v] ?? 0;
          if (drums[lane][st] && !band.playing) { const r = inst.audio(); if (r) r.drums.trigger(lane, 0, drums[lane][st]); }
          setP({ ...p, drums });
        } });
      }));

    const shapeName = SHAPES[shapeOn(state.floor, state.variants)].name.toLowerCase();
    fill(lanes,
      pagerEl,
      h('div', { class: 'lane' },
        h('div', { class: 'lane-head' }, h('h3', null, 'Chords'), mute('chords'), act('Fill', () => band.fillComp(s.edit)), act('Clear', () => setP({ ...p, chords: [] }))),
        chordBrushes, grid(per, from, chordCell),
        h('p', { class: 'muted small' }, band.recording ? 'Recording: play the pads and they land here.' : `Choose a note above, then tap a step: it gets a ${shapeName} beneath that note. Or press record and play the pads.`)),
      h('div', { class: 'lane' },
        h('div', { class: 'lane-head' }, h('h3', null, 'Bass'), mute('bass'), act('Clear', () => setP({ ...p, bass: p.bass.map(() => null) }))),
        bassBrushes, grid(per, from, bassCell)),
      h('div', { class: 'lane' },
        h('div', { class: 'lane-head' }, h('h3', null, 'Drums'), h('span', { class: 'muted small' }, kit.name), mute('drums'),
          act('Clear', () => setP({ ...p, drums: emptyPattern(sg, p.bars).drums })),
          act('Reset', () => { const fresh = resizePattern(patternOf(rhythmById(s.rhythm), PATTERN_IDS.indexOf(s.edit) % 2 ? 'B' : 'A'), sg, p.bars); setP({ ...p, drums: fresh.drums, bass: fresh.bass }); })),
        LANES.map(drumRow)));
    placeHeads(-1);
  }

  function placeHeads(step) {
    for (const hd of heads) {
      const k = step - hd.from;
      const on = k >= 0 && k < hd.count;
      hd.el.style.display = on ? 'block' : 'none';
      if (on) { hd.el.style.left = `${(k / hd.count) * 100}%`; hd.el.style.width = `${100 / hd.count}%`; }
    }
  }

  function onStep(q) {
    const s = song();
    if (q.loc.id !== nowPlaying) {
      nowPlaying = q.loc.id;
      pats.querySelectorAll('[data-pat]').forEach((b) => b.classList.toggle('now', b.dataset.pat === nowPlaying));
    }
    pats.querySelectorAll('[data-slot]').forEach((b) => b.classList.toggle('now', Number(b.dataset.slot) === q.loc.slot));
    if (q.loc.id !== s.edit) { placeHeads(-1); return; }
    if (el.hidden) return;
    const per = stepsPerBar(sig());
    const shown = Math.min(barsShown(), s.patterns[s.edit].bars);
    const bar = Math.floor(q.loc.step / per);
    if (bar < viewBar || bar >= viewBar + shown) { viewBar = Math.min(bar, s.patterns[s.edit].bars - shown); drawLanes(); }
    placeHeads(q.loc.step);
  }

  function refresh() { drawTop(); drawPats(); drawLanes(); }

  events.on('song', () => { if (!el.hidden) refresh(); });
  events.on('harmony', () => { if (!el.hidden) drawLanes(); });
  events.on('step', onStep);
  events.on('transport', ({ playing }) => { if (!playing) { nowPlaying = null; placeHeads(-1); pats.querySelectorAll('.now').forEach((b) => b.classList.remove('now')); } if (!el.hidden) drawLanes(); });
  window.addEventListener('resize', () => { if (!el.hidden) drawLanes(); });

  return { el, refresh };
}
