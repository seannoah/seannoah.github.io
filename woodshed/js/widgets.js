// widgets.js — interactive figures shared by the lessons and the Explore page.

import { h, icon } from './dom.js';
import { neck, windowFor } from './neck.js';
import * as audio from './audio.js';
import { SCALES, SCALE_ORDER, scaleNotes, chordName, stepSize, walkPath, stepMidi, mod } from './theory.js';
import { SHAPES, ELEVATOR, voicings, voicingAt, voicingFor, setWithTop, setLabel, floorOf } from './floors.js';
import { describeMove, moveWords, TOP_STRING } from './motion.js';
import { borrowIn, borrowWords, voiceName } from './borrow.js';
import { ROLES, chord as sixth, chordLabel, applyFormula, formulaText, formulaWords, roleAfter, tallRoles, sixthVoicing, follow, movesText, chainById, chainIn } from './transform.js';
import { pickRow } from './dom.js';

const kindOf = (deg) => (deg % 2 === 0 ? 'on' : 'off');
export const labelOf = (scale, deg) => SCALES[scale].labels[deg];

// A small text button with an optional leading icon.
export const pill = (text, onclick, ic) => h('button', { class: 'pill', onclick }, ic ? icon(ic, 16) : null, text);

// One octave of a scale on one string. Tap a note to hear it.
export function scaleStrip(keyId, scaleId, string = 2, opts = {}) {
  const path = walkPath(keyId, scaleId, string, opts.from ?? 1);
  const notes = scaleNotes(keyId, scaleId);
  let filter = 'all';
  const marks = () => path
    .filter((n) => filter === 'all' || kindOf(n.deg) === filter)
    .map((n) => ({ string, fret: n.fret, kind: kindOf(n.deg), label: opts.names ? notes[n.deg].name : labelOf(scaleId, n.deg) }));
  const lo = path[0].fret === 0 ? 0 : Math.max(1, path[0].fret - 1);
  const board = neck({
    lo, hi: path[8].fret, focus: [string], marks: marks(),
    onTap: (s, fret) => { const n = path.find((p) => p.fret === fret); if (n) audio.note(n.midi); },
  });
  const show = (f) => { filter = f; board.draw(marks()); };
  const on = path.filter((n) => n.deg % 2 === 0).map((n) => n.midi);
  const off = path.filter((n) => n.deg % 2 === 1).map((n) => n.midi);
  const controls = h('div', { class: 'pills' },
    pill('Play the scale', () => { show('all'); audio.stopAll(); audio.line(path.map((n) => n.midi), 0.36); }, 'play'),
    pill(`On: ${chordName(keyId, scaleId, true)}`, () => { show('on'); audio.stopAll(); audio.line(on.slice(0, 4), 0.3); }),
    pill(`Off: ${chordName(keyId, scaleId, false)}`, () => { show('off'); audio.stopAll(); audio.line(off.slice(0, 4), 0.3); }),
    pill('Off, then on', () => {
      show('all'); audio.stopAll();
      audio.chord(off.slice(0, 4), 0, 0.03, 0.5);
      audio.chord(on.slice(0, 4), 1.1, 0.03, 0.5);
    }),
  );
  return h('figure', { class: 'fig' }, board.el, controls, opts.caption ? h('figcaption', null, opts.caption) : null);
}

// The path of one scale as a row of degrees with H and W between them.
export function pathChips(scaleId, compareTo = null) {
  const row = h('div', { class: 'path-row' });
  for (let d = 0; d < 8; d++) {
    const size = stepSize(scaleId, d, 1);
    const differs = compareTo && stepSize(compareTo, d, 1) !== size;
    row.append(h('span', { class: `chip ${kindOf(d)}` }, labelOf(scaleId, d)));
    row.append(h('span', { class: 'step' + (differs ? ' differs' : '') }, size === 1 ? 'H' : 'W'));
  }
  row.append(h('span', { class: 'chip on' }, 'R'));
  return row;
}

// All four paths stacked, with the steps that differ from major 6 picked out.
export function pathCompare() {
  return h('figure', { class: 'fig' },
    SCALE_ORDER.map((s) => h('div', { class: 'path-block' },
      h('div', { class: 'path-name' }, SCALES[s].name),
      pathChips(s, s === 'maj6' ? null : 'maj6'))),
    h('figcaption', null, 'H is a half step (one fret), W is a whole step (two frets). Outlined steps differ from major 6.'));
}

// Step through every position of one shape along the neck.
export function shapeBrowser(init) {
  const cfg = { key: 'C', scale: 'maj6', shape: 'thirds', set: null, names: false, ...init };
  const root = h('figure', { class: 'fig browser' });
  let list = [];
  let i = 0;

  function render() {
    const shape = SHAPES[cfg.shape];
    const set = cfg.set && shape.sets.some((s) => s.join() === cfg.set.join()) ? cfg.set : shape.primary;
    list = voicings(cfg.key, cfg.scale, cfg.shape, set);
    if (cfg.start != null) { i = Math.max(0, list.findIndex((v) => v.lowFret >= cfg.start)); cfg.start = null; }
    i = Math.min(i, Math.max(0, list.length - 1));
    const v = list[i];
    const notes = scaleNotes(cfg.key, cfg.scale);
    const all = list.flatMap((x) => x.notes.map((n) => n.fret));
    const win = cfg.wide ? { lo: Math.min(...all) === 0 ? 0 : 1, hi: Math.max(...all, 12) } : windowFor(v.notes.map((n) => n.fret), 6);
    const board = neck({
      lo: win.lo, hi: win.hi, focus: set,
      marks: v.notes.map((n) => ({ string: n.string, fret: n.fret, kind: kindOf(n.deg), label: cfg.names ? notes[n.deg].name : labelOf(cfg.scale, n.deg) })),
      onTap: (s, fret) => { const n = v.notes.find((p) => p.string === s && p.fret === fret); if (n) audio.note(n.midi); },
    });
    const play = () => { audio.stopAll(); audio.chord(v.notes.map((n) => n.midi), 0, 0.05); };
    const step = (d) => { i = mod(i + d, list.length); render(); const nv = list[i]; audio.stopAll(); audio.chord(nv.notes.map((n) => n.midi), 0, 0.04); };
    const title = h('div', { class: 'browser-title' },
      h('span', { class: `tag ${v.on ? 'on' : 'off'}` }, v.on ? 'on' : 'off'),
      h('strong', null, chordName(cfg.key, cfg.scale, v.on)),
      h('span', { class: 'muted' }, ` ${shape.name.toLowerCase()} · ${setLabel(set)} · ${i + 1} of ${list.length}`));
    const spoken = v.notes.map((n) => SCALES[cfg.scale].say[n.deg]).join(', ');
    root.replaceChildren(
      title, board.el,
      h('div', { class: 'browser-controls' },
        h('button', { class: 'round', 'aria-label': 'Previous position', onclick: () => step(-1) }, icon('back', 20)),
        h('button', { class: 'pill', onclick: play }, icon('play', 16), 'Play'),
        h('button', { class: 'pill', onclick: () => { audio.stopAll(); audio.line(v.notes.map((n) => n.midi), 0.3); } }, 'One by one'),
        h('button', { class: 'round', 'aria-label': 'Next position', onclick: () => step(1) }, icon('next', 20))),
      h('figcaption', null, `Low to high: ${spoken}.`),
    );
    if (cfg.wide) requestAnimationFrame(() => board.reveal(v.minFret || 1));
  }
  render();
  return {
    el: root,
    set(next) { Object.assign(cfg, next); if (next.shape || next.set || next.key || next.scale) i = 0; render(); },
    playAll() {
      audio.stopAll();
      list.slice(0, 9).forEach((v, k) => audio.chord(v.notes.map((n) => n.midi), k * 0.62, 0.02, 0.5));
    },
  };
}

// Ride the elevator: keep a melody note on string 2 and change what the melody and the
// floor do, one step at a time. The caption says what the outer voices did.
export function elevatorRide(init = {}) {
  const cfg = { key: 'C', scale: 'maj6', floor: 'triads', deg: 4, max: 'drop24', ...init };
  const column = ELEVATOR.slice(0, ELEVATOR.indexOf(cfg.max) + 1);
  const at = (shapeId, topMidi) => voicingAt(cfg.key, cfg.scale, shapeId, setWithTop(shapeId, TOP_STRING), 'top', topMidi);
  let floor = cfg.floor;
  let cur = voicingFor(cfg.key, cfg.scale, floor, setWithTop(floor, TOP_STRING), 'top', cfg.deg);
  let prev = null;
  let note = 'Use the buttons to move the melody, change floor, or do both at once.';
  const root = h('figure', { class: 'fig browser ride' });
  const topOf = (v) => v.notes[v.notes.length - 1];

  function go(floorStep, melodyStep) {
    const nextFloor = column[column.indexOf(floor) + floorStep];
    const next = nextFloor ? at(nextFloor, stepMidi(cfg.key, cfg.scale, topOf(cur).midi, melodyStep)) : null;
    if (!next) {
      note = floorStep && !nextFloor ? (floorStep > 0 ? 'That is the top floor here.' : 'That is the ground floor.') : 'That runs off the neck. Try the other direction.';
      return render();
    }
    prev = cur; cur = next;
    const from = floorOf(floor).name; const to = floorOf(nextFloor).name;
    floor = nextFloor;
    const d = describeMove(cfg.key, cfg.scale, prev, cur);
    note = `${from === to ? `${from}, same floor` : `${from} to ${to.toLowerCase()}`}. ${moveWords(d)}`;
    audio.stopAll();
    audio.chord(prev.notes.map((n) => n.midi), 0, 0.03, 0.5);
    audio.chord(cur.notes.map((n) => n.midi), 0.9, 0.03, 0.55);
    render();
  }

  function render() {
    const all = [...cur.notes, ...(prev ? prev.notes : [])].map((n) => n.fret);
    const fretted = all.filter((f) => f > 0);
    const low = fretted.length ? Math.min(...fretted) : 1;
    const lo = all.includes(0) || low <= 2 ? 0 : low - 1;
    const hi = Math.max(Math.max(...all, 1) + 1, (lo || 1) + 7);
    const ghosts = prev ? prev.notes.filter((n) => !cur.notes.some((c) => c.string === n.string && c.fret === n.fret)).map((n) => ({ string: n.string, fret: n.fret, kind: 'from', label: labelOf(cfg.scale, n.deg) })) : [];
    const board = neck({
      lo, hi, focus: [...new Set([...cur.notes, ...(prev ? prev.notes : [])].map((n) => n.string))],
      marks: [...ghosts, ...cur.notes.map((n) => ({ string: n.string, fret: n.fret, kind: kindOf(n.deg), label: labelOf(cfg.scale, n.deg) }))],
      onTap: (s, f) => { const n = cur.notes.find((p) => p.string === s && p.fret === f); if (n) audio.note(n.midi); },
    });
    const btn = (label, fs, ms) => h('button', { class: 'pill', onclick: () => go(fs, ms) }, label);
    root.replaceChildren(
      h('div', { class: 'browser-title' },
        h('span', { class: `tag ${cur.on ? 'on' : 'off'}` }, cur.on ? 'on' : 'off'),
        h('strong', null, chordName(cfg.key, cfg.scale, cur.on)),
        h('span', { class: 'muted' }, floor === 'unison' ? ` the ${SCALES[cfg.scale].say[topOf(cur).deg]} alone` : ` ${floorOf(floor).name.toLowerCase()} beneath the ${SCALES[cfg.scale].say[topOf(cur).deg]}`)),
      board.el,
      h('div', { class: 'ride-grid' },
        h('span', { class: 'ride-label' }, 'Same floor'), btn('Melody down', 0, -1), btn('Melody up', 0, 1),
        h('span', { class: 'ride-label' }, 'Contrary'), btn('In: floor down', -1, -1), btn('Out: floor up', 1, 1),
        h('span', { class: 'ride-label' }, 'Melody holds'), btn('Floor down', -1, 0), btn('Floor up', 1, 0)),
      h('figcaption', null, note),
    );
  }
  render();
  return root;
}

// Borrow above or below any voice of a chord, and give it back.
export function borrowDemo(init = {}) {
  const cfg = { key: 'C', scale: 'maj6', shape: 'triads', set: [4, 3, 2], deg: 4, ...init };
  const base = voicingFor(cfg.key, cfg.scale, cfg.shape, cfg.set, 'top', cfg.deg);
  const say = (scale, deg) => SCALES[scale].say[deg];
  let cur = null;
  let note = 'Pick a voice and a direction.';
  const root = h('figure', { class: 'fig browser ride' });
  const sound = (v) => audio.chord(v.notes.map((n) => n.midi), 0, 0.03, 0.55);
  function borrow(voice, dir) {
    const b = borrowIn(cfg.key, cfg.scale, base, voice, dir);
    audio.stopAll();
    if (!b) { note = 'That voice has no room to move there.'; return render(); }
    cur = b; note = borrowWords(cfg.scale, b, say); sound(b); render();
  }
  function render() {
    const notes = cur ? cur.notes : base.notes;
    const all = [...base.notes, ...(cur ? [cur.moved] : [])].map((n) => n.fret);
    const lo = Math.max(1, Math.min(...all) - 2);
    const marks = notes.map((n) => ({ string: n.string, fret: n.fret, kind: kindOf(n.deg) + (cur && n === cur.moved ? ' anchor' : ''), label: labelOf(cfg.scale, n.deg) }));
    if (cur) marks.push({ string: cur.old.string, fret: cur.old.fret, kind: 'from', label: labelOf(cfg.scale, cur.old.deg) });
    const board = neck({ lo, hi: Math.max(Math.max(...all) + 2, lo + 6), focus: cfg.set, marks });
    const count = base.notes.length;
    const row = (voice) => [
      h('span', { class: 'ride-label' }, voiceName(count, voice)),
      h('button', { class: 'pill', onclick: () => borrow(voice, -1) }, 'Borrow below'),
      h('button', { class: 'pill', onclick: () => borrow(voice, 1) }, 'Borrow above'),
    ];
    root.replaceChildren(
      h('div', { class: 'browser-title' },
        h('span', { class: `tag ${cur ? 'off' : 'on'}` }, cur ? 'borrowed' : 'on'),
        h('strong', null, chordName(cfg.key, cfg.scale, true)),
        h('span', { class: 'muted' }, ` ${SHAPES[cfg.shape].name.toLowerCase()} beneath the ${say(cfg.scale, cfg.deg)}`)),
      board.el,
      h('div', { class: 'ride-grid' }, ...Array.from({ length: count }, (_, v) => row(v)).flat()),
      h('div', { class: 'pills center' }, h('button', { class: 'pill', onclick: () => { cur = null; note = 'Given back: all on again.'; audio.stopAll(); sound(base); render(); } }, 'Give it back')),
      h('figcaption', null, note),
    );
  }
  render();
  return root;
}

// ---- transformation ----
const SET52 = [5, 4, 3, 2];
const NODE_AT = [[52, 16], [88, 52], [52, 88], [16, 52]];
// The family circle: root, third, fifth, sixth, clockwise. Tall siblings get a gold ring.
function familyCircle(scale, now, was = null) {
  const tall = tallRoles(scale);
  const nodes = ROLES.map((r, i) => {
    const cls = ['node', i === now ? 'now' : '', i === was && was !== now ? 'was' : '', tall.includes(r.name) ? 'tall' : ''].filter(Boolean).join(' ');
    return `<g class="${cls}"><circle cx="${NODE_AT[i][0]}" cy="${NODE_AT[i][1]}" r="13"/><text x="${NODE_AT[i][0]}" y="${NODE_AT[i][1]}">${i === 0 ? 'R' : r.id}</text></g>`;
  }).join('');
  return h('div', {
    class: 'circle', role: 'img', 'aria-label': `The family circle: root, third, fifth, sixth, clockwise. The ${ROLES[now].name} is in the bass.`,
    html: `<svg viewBox="0 0 104 104" width="104" height="104"><circle class="ring" cx="52" cy="52" r="36"/><path class="arrow" d="M62 52a10 10 0 1 1-10-10"/><path class="arrow" d="M48.500 38.500l3.500 3.500-3.500 3.500"/>${nodes}</svg>`,
  });
}

const sixthMarks = (v, scale, prev = null) => [
  ...(prev ? prev.notes.filter((n, i) => n.fret !== v.notes[i].fret).map((n) => ({ string: n.string, fret: n.fret, kind: 'from', label: '' })) : []),
  ...v.notes.map((n, i) => ({ string: n.string, fret: n.fret, kind: i === 0 ? 'on anchor' : 'on', label: labelOf(scale, n.deg) })),
];
// At most eight frets wide, so the figure never scrolls sideways on a phone.
const sixthWindow = (voicings) => {
  const all = voicings.flatMap((v) => v.notes.map((n) => n.fret));
  const min = Math.min(...all);
  const max = Math.max(...all);
  if (min === 0) return { lo: 0, hi: Math.max(max + 1, 6) };
  const lo = Math.max(1, min - 1);
  return { lo, hi: Math.max(max + 1, lo + 6) };
};

// Turn one 6th chord into another, one move at a time, and watch what the bass becomes.
// With `full`, the family (up, down) and kind (major, minor) moves are there too.
export function transformLab(init = {}) {
  const cfg = { root: 5, scale: 'min6', role: 0, around: 6, full: false, ...init };
  const start = sixth(cfg.root, cfg.scale);
  let cur = { chord: start, role: cfg.role, voicing: sixthVoicing(start, cfg.role, SET52, cfg.around) };
  let prev = null;
  let note = cfg.full ? 'Each button is one part of a formula. Try two or three in a row.' : 'Move round the circle and watch the bass note.';
  const root = h('figure', { class: 'fig browser ride' });

  function go(f) {
    const target = applyFormula(cur.chord, f);
    const role = roleAfter(cur.role, f.dir);
    const v = follow(cur.voicing, target, role, SET52);
    if (!v || v.lowFret === 0 || v.maxFret > 15) { note = 'That runs off the neck. Try the other direction.'; return render(); }
    prev = cur;
    cur = { chord: target, role, voicing: v };
    const moves = v.notes.map((n, i) => n.midi - prev.voicing.notes[i].midi);
    const bass = moves[0] === 0 ? 'The bass note stays.' : `The bass moves ${Math.abs(moves[0]) === 1 ? 'a fret' : `${Math.abs(moves[0])} frets`} ${moves[0] > 0 ? 'up' : 'down'}.`;
    note = `${chordLabel(prev.chord)} becomes ${chordLabel(cur.chord)}, with the ${ROLES[role].name} in the bass. ${bass} Voices, low to high: ${movesText(moves)}.`;
    audio.stopAll();
    audio.chord(prev.voicing.notes.map((n) => n.midi), 0, 0.03, 0.5);
    audio.chord(v.notes.map((n) => n.midi), 0.9, 0.03, 0.55);
    render();
  }

  function render() {
    const win = sixthWindow(prev ? [cur.voicing, prev.voicing] : [cur.voicing]);
    const board = neck({
      lo: win.lo, hi: win.hi, focus: SET52, marks: sixthMarks(cur.voicing, cur.chord.scale, prev && prev.voicing),
      onTap: (s, f) => { const n = cur.voicing.notes.find((x) => x.string === s && x.fret === f); if (n) audio.note(n.midi); },
    });
    const btn = (label, f) => h('button', { class: 'pill', onclick: () => go({ dir: null, family: null, quality: null, ...f }) }, label);
    const isTall = tallRoles(cur.chord.scale).includes(ROLES[cur.role].name);
    const major = cur.chord.scale === 'maj6';
    root.replaceChildren(
      h('div', { class: 'lab-top' },
        familyCircle(cur.chord.scale, cur.role, prev ? prev.role : null),
        h('div', { class: 'browser-title' },
          h('strong', null, chordLabel(cur.chord)),
          h('span', { class: 'muted' }, `${ROLES[cur.role].name} in the bass`),
          isTall ? h('span', { class: 'tag off' }, 'tall') : null)),
      board.el,
      h('div', { class: 'lab-grid' },
        h('span', { class: 'ride-label' }, 'Circle'), btn('Forward', { dir: 'forward' }), btn('Backward', { dir: 'backward' }), btn('Across', { dir: 'across' }),
        ...(cfg.full ? [
          h('span', { class: 'ride-label' }, 'Family'), btn('Down', { family: 'down' }), btn('Up', { family: 'up' }), h('span'),
          h('span', { class: 'ride-label' }, 'Kind'), btn(major ? 'Minor' : 'Major', { quality: major ? 'minor' : 'major' }), h('span'), h('span'),
        ] : [])),
      h('figcaption', null, note),
    );
  }
  render();
  return root;
}

// Step through a whole progression as a chain of formulas, from any starting bass note.
export function chainPlayer(init = {}) {
  const cfg = { chains: ['major-on5', 'major-tm'], tonic: 10, role: 0, ...init };
  let chainId = cfg.chains[0];
  let role = cfg.role;
  let i = 0;
  const root = h('figure', { class: 'fig browser ride' });
  const sound = (v, at = 0) => audio.chord(v.notes.map((n) => n.midi), at, 0.03, 0.55);

  function render() {
    const chain = chainById(chainId);
    const steps = chainIn(chainId, cfg.tonic, role);
    i = Math.min(i, steps.length - 1);
    const st = steps[i];
    const win = sixthWindow(steps.map((x) => x.voicing));
    const board = neck({
      lo: win.lo, hi: win.hi, focus: SET52, marks: sixthMarks(st.voicing, st.chord.scale, i > 0 ? steps[i - 1].voicing : null),
      onTap: (s, f) => { const n = st.voicing.notes.find((x) => x.string === s && x.fret === f); if (n) audio.note(n.midi); },
    });
    const jump = (k) => { i = k; render(); audio.stopAll(); sound(steps[k].voicing); };
    const row = h('div', { class: 'chain' });
    steps.forEach((x, k) => {
      if (k > 0) row.append(h('span', { class: 'chain-arrow' }, h('span', { class: 'formula' }, formulaText(x.formula)), '→'));
      row.append(h('button', { class: 'chain-step' + (k === i ? ' sel' : ''), onclick: () => jump(k) }, h('small', null, x.says), chordLabel(x.chord)));
    });
    const caption = i === 0
      ? `${chain.long}. Start on ${chordLabel(st.chord)} with the ${ROLES[st.role].name} in the bass.`
      : `${chordLabel(steps[i - 1].chord)} to ${chordLabel(st.chord)}: ${formulaWords(st.formula)}. Now the ${ROLES[st.role].name} is in the bass. Voices, low to high: ${movesText(st.moves)}.`;
    root.replaceChildren(...[
      cfg.chains.length > 1 ? pickRow('Path', cfg.chains.map((id) => [id, chainById(id).name]), chainId, (v) => { chainId = v; i = 0; render(); }) : null,
      pickRow('Start with', ROLES.map((r, k) => [k, `${r.name} in the bass`]), role, (v) => { role = v; i = 0; render(); audio.stopAll(); sound(chainIn(chainId, cfg.tonic, role)[0].voicing); }),
      row, board.el,
      h('div', { class: 'browser-controls' },
        h('button', { class: 'round', 'aria-label': 'Previous chord', onclick: () => jump(mod(i - 1, steps.length)) }, icon('back', 20)),
        h('button', { class: 'pill', onclick: () => { audio.stopAll(); steps.forEach((x, k) => sound(x.voicing, k * 1.2)); } }, icon('play', 16), 'Play it through'),
        h('button', { class: 'round', 'aria-label': 'Next chord', onclick: () => jump(mod(i + 1, steps.length)) }, icon('next', 20))),
      h('figcaption', null, caption),
    ].filter(Boolean));
  }
  render();
  return root;
}
