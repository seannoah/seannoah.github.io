// widgets.js — interactive figures shared by the lessons and the Explore page.

import { h, icon } from './dom.js';
import { neck, windowFor } from './neck.js';
import * as audio from './audio.js';
import { SCALES, SCALE_ORDER, OPEN, scaleNotes, chordName, stepSize, walkPath, stepMidi, degOfMidi, mod } from './theory.js';
import { SHAPES, ELEVATOR, voicings, voicingAt, voicingFor, setWithTop, setLabel, stopName, insideOf, partWhere } from './floors.js';
import { mirrorLine, pivotNotes } from './mirror.js';
import { POSTS, postIn, hubPair, postPhrase, postStory, chordOf, nameOf, jobsOf, aTrain } from './subs.js';
import { scaleKey } from './harmony.js';
import { describeMove, moveWords, nearestUnder, bassMove, TOP_STRING } from './motion.js';
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
  const cfg = { key: 'C', scale: 'maj6', floor: 'triads', deg: 4, max: 'drop24', rows: 'steps', ...init };
  // the stops: the floors up to `max`, or any other column (the elevator of intervals)
  const column = cfg.column || ELEVATOR.slice(0, ELEVATOR.indexOf(cfg.max) + 1);
  const at = (shapeId, topMidi) => voicingAt(cfg.key, cfg.scale, shapeId, setWithTop(shapeId, TOP_STRING), 'top', topMidi);
  let floor = cfg.floor;
  let cur = voicingFor(cfg.key, cfg.scale, floor, setWithTop(floor, TOP_STRING), 'top', cfg.deg);
  let prev = null;
  let note = cfg.rows === 'leaps' ? 'Each button moves the melody and changes floor at once. Watch what the bass does.' : 'Use the buttons to move the melody, change floor, or do both at once.';
  const root = h('figure', { class: 'fig browser ride' });
  const topOf = (v) => v.notes[v.notes.length - 1];
  // floors are named in the plural ("Triads"); the stops of another column by their own names ("Fifth")
  const nameOf = (id) => (cfg.column ? SHAPES[id].name : stopName(id));

  function go(floorStep, melodyStep) {
    const nextFloor = column[column.indexOf(floor) + floorStep];
    const target = stepMidi(cfg.key, cfg.scale, topOf(cur).midi, melodyStep);
    // With leaps the hand is followed: a bass that holds stays under its finger, and the
    // melody may cross to the next string. Otherwise the melody stays on string 2.
    const held = bassMove(melodyStep, floorStep) === 0 ? cur.notes[0] : null;
    const next = !nextFloor ? null
      : cfg.rows === 'leaps' ? (held && nearestUnder(cfg.key, cfg.scale, nextFloor, target, cur, held)) || nearestUnder(cfg.key, cfg.scale, nextFloor, target, cur)
      : at(nextFloor, target);
    if (!next) {
      note = floorStep && !nextFloor ? (floorStep > 0 ? 'That is as far out as this goes.' : 'That is as far in as this goes.') : 'That runs off the neck. Try the other direction.';
      return render();
    }
    prev = cur; cur = next;
    const from = nameOf(floor); const to = nameOf(nextFloor);
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
        h('span', { class: 'muted' }, floor === 'unison' ? ` the ${SCALES[cfg.scale].say[topOf(cur).deg]} alone` : ` ${(cfg.column ? SHAPES[floor].a : stopName(floor).toLowerCase())} beneath the ${SCALES[cfg.scale].say[topOf(cur).deg]}`)),
      board.el,
      cfg.rows === 'leaps' ? h('div', { class: 'ride-grid' },
        h('span', { class: 'ride-label' }, 'Bass holds'), btn('Melody leaps down', -1, -2), btn('Melody leaps up', 1, 2),
        h('span', { class: 'ride-label' }, 'Bass leaps'), btn('Melody steps down', 1, -1), btn('Melody steps up', -1, 1),
        h('span', { class: 'ride-label' }, 'Both leap'), btn('Together, in', -2, -2), btn('Apart, out', 2, 2),
        h('span', { class: 'ride-label' }, 'Same floor'), btn('Leap down', 0, -2), btn('Leap up', 0, 2))
      : h('div', { class: 'ride-grid' },
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

// ---- floors within floors ----
// One chord, and every smaller floor that can be found inside it. Tap a part to see and hear it.
export function insideFigure(init = {}) {
  const cfg = { key: 'C', scale: 'maj6', shape: 'drop2', shapes: ['drop2', 'oct.low', 'shell.low', 'shell.high', 'triads', 'drop3', 'drop24'], ...init };
  let shapeId = cfg.shape;
  let at = 0;
  let sel = null;
  const root = h('figure', { class: 'fig browser ride' });
  const short = { 'oct.low': 'Octave', 'shell.low': 'Low shell', 'shell.high': 'High shell' };
  const nameOf = (id) => short[id] || SHAPES[id].name;

  function render() {
    const shape = SHAPES[shapeId];
    const list = voicings(cfg.key, cfg.scale, shapeId, shape.primary).filter((v) => v.on && v.lowFret > 0 && v.maxFret <= 13);
    at = mod(at, list.length);
    const v = list[at];
    const parts = insideOf(shapeId);
    const part = sel != null ? parts[sel] : null;
    const win = sixthWindow([v]);
    const board = neck({
      lo: win.lo, hi: win.hi, focus: v.set,
      marks: v.notes.map((n, i) => ({ string: n.string, fret: n.fret, label: labelOf(cfg.scale, n.deg), kind: !part ? kindOf(n.deg) : part.idx.includes(i) ? `${kindOf(n.deg)} anchor` : 'from' })),
      onTap: (s, f) => { const n = v.notes.find((x) => x.string === s && x.fret === f); if (n) audio.note(n.midi); },
    });
    const whole = () => { audio.stopAll(); audio.chord(v.notes.map((n) => n.midi), 0, 0.04, 0.55); };
    const pick = (k) => {
      sel = k; render();
      audio.stopAll();
      audio.chord(v.notes.map((n) => n.midi), 0, 0.03, 0.45);
      audio.chord(parts[k].idx.map((i) => v.notes[i].midi), 1.0, 0.03, 0.6);
    };
    const said = part ? part.idx.map((i) => SCALES[cfg.scale].say[v.notes[i].deg]).join(', ') : '';
    root.replaceChildren(
      pickRow('Look inside', cfg.shapes.map((id) => [id, nameOf(id)]), shapeId, (id) => { shapeId = id; sel = null; at = 0; render(); }),
      h('div', { class: 'browser-title' },
        h('strong', null, chordName(cfg.key, cfg.scale, true)),
        h('span', { class: 'muted' }, ` ${shape.name.toLowerCase()} · ${setLabel(v.set)}`)),
      board.el,
      h('div', { class: 'parts-row' }, parts.map((x, k) => h('button', { class: 'part-chip' + (k === sel ? ' sel' : ''), onclick: () => pick(k) },
        SHAPES[x.part].name, h('small', null, partWhere(v.notes.length, x.idx, true))))),
      h('div', { class: 'browser-controls' },
        h('button', { class: 'round', 'aria-label': 'Previous position', onclick: () => { at -= 1; render(); } }, icon('back', 20)),
        h('button', { class: 'pill', onclick: () => { sel = null; render(); whole(); } }, icon('play', 16), 'Whole chord'),
        h('button', { class: 'round', 'aria-label': 'Next position', onclick: () => { at += 1; render(); } }, icon('next', 20))),
      h('figcaption', null, part
        ? `${partWhere(v.notes.length, part.idx).replace(/^t/, 'T')} make ${SHAPES[part.part].a}: ${said}.`
        : `${parts.length} smaller shapes live inside this one. Tap each to hear the whole chord, then the part.`),
    );
  }
  render();
  return root;
}

// ---- pivoting ----
// Where a pitch sits inside one hand position (frets lo to lo + 4).
function inPosition(midi, lo = 4) {
  for (const string of [6, 5, 4, 3, 2, 1]) {
    const fret = midi - OPEN[string];
    if (fret >= lo && fret <= lo + 4) return { string, fret, midi };
  }
  return null;
}

// Barry Harris's pivot in single notes: a chord, or the scale, straight and then pivoted.
export function pivotFigure(init = {}) {
  const cfg = { key: 'C', scale: 'maj6', from: 60, ...init };
  const chord = pivotNotes(cfg.key, cfg.scale, cfg.from);
  const up = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => stepMidi(cfg.key, cfg.scale, cfg.from, n));
  const LINES = {
    chord: { straight: chord.up, pivoted: chord.pivoted },
    scale: { straight: up, pivoted: [...up.slice(0, 3), ...up.slice(3).map((m) => m - 12)] },
  };
  const SAYS = {
    chord: { straight: 'Up a chord: root, third, fifth, sixth.', pivoted: 'The same four notes, with everything after the first an octave lower. The line falls a sixth, then climbs.' },
    scale: { straight: 'Up the scale, root to root.', pivoted: 'Three notes up, then the rest of the scale from an octave below. One long climb becomes a drop and a climb.' },
  };
  let line = 'chord';
  let how = 'straight';
  let timers = [];
  const root = h('figure', { class: 'fig browser ride' });

  function render(play) {
    timers.forEach(clearTimeout); timers = [];
    const notes = LINES[line][how].map((m) => inPosition(m)).filter(Boolean);
    const marks = notes.map((n) => { const deg = degOfMidi(cfg.key, cfg.scale, n.midi); return { string: n.string, fret: n.fret, kind: kindOf(deg), label: labelOf(cfg.scale, deg) }; });
    const board = neck({ lo: 3, hi: 9, marks: play ? [] : marks, onTap: (s, f) => { const n = notes.find((x) => x.string === s && x.fret === f); if (n) audio.note(n.midi); } });
    const btn = (id, text) => h('button', { class: 'pill' + (how === id ? ' sel' : ''), onclick: () => { how = id; render(true); } }, icon('play', 16), text);
    root.replaceChildren(
      pickRow('Line', [['chord', 'A chord'], ['scale', 'The scale']], line, (v) => { line = v; how = 'straight'; render(true); }),
      board.el,
      h('div', { class: 'pills center' }, btn('straight', 'Straight'), btn('pivoted', 'Pivoted')),
      h('figcaption', null, SAYS[line][how]),
    );
    if (play) {
      const gap = line === 'chord' ? 0.42 : 0.34;
      audio.stopAll();
      audio.line(notes.map((n) => n.midi), gap);
      // the notes appear as they sound
      notes.forEach((n, k) => timers.push(setTimeout(() => board.draw(marks.slice(0, k + 1)), k * gap * 1000)));
    }
  }
  render(false);
  return root;
}

const STOP_SHORT = { unison: 'one note', thirds: 'third', triads: 'triad', shells: 'shell', octaves: 'octave', drop2: 'drop 2', drop3: 'drop 3', drop24: 'drop 2 & 4', dbl: 'double' };
const STOP_ONE = { unison: 'a single note', thirds: 'a third', triads: 'a triad', shells: 'a shell', octaves: 'an octave chord', drop2: 'a drop 2', drop3: 'a drop 3', drop24: 'a drop 2 and 4', dbl: 'a double octave' };

// A line of chords with the melody walking down and the floors closing in, straight or
// through the mirror (The Elevator Sequence, p. 12).
export function mirrorRide(init = {}) {
  const cfg = { key: 'C', scale: 'maj6', start: 'drop2', ...init };
  let scale = cfg.scale;
  let start = cfg.start;
  let pivot = true;
  let i = 0;
  const root = h('figure', { class: 'fig browser ride' });
  const sound = (v, t = 0) => audio.chord(v.notes.map((n) => n.midi), t, 0.03, 0.55);
  const floorId = (st) => SHAPES[st.voicing.shape].floor;

  function render() {
    const steps = mirrorLine(cfg.key, scale, { start, top: 72 + SCALES[scale].semis[2], count: 9, pivotAt: pivot ? 3 : undefined });
    i = Math.min(i, steps.length - 1);
    const st = steps[i];
    const v = st.voicing;
    const prev = i > 0 ? steps[i - 1].voicing : null;
    const win = sixthWindow(prev ? [v, prev] : [v]);
    const moved = (n) => !v.notes.some((x) => x.string === n.string && x.fret === n.fret);
    const board = neck({
      lo: win.lo, hi: win.hi, focus: [...new Set([...v.notes, ...(prev ? prev.notes : [])].map((n) => n.string))],
      marks: [
        ...(prev ? prev.notes.filter(moved).map((n) => ({ string: n.string, fret: n.fret, kind: 'from', label: labelOf(scale, n.deg) })) : []),
        ...v.notes.map((n) => ({ string: n.string, fret: n.fret, kind: kindOf(n.deg), label: labelOf(scale, n.deg) })),
      ],
      onTap: (s, f) => { const n = v.notes.find((x) => x.string === s && x.fret === f); if (n) audio.note(n.midi); },
    });
    const jump = (k) => { i = k; render(); audio.stopAll(); sound(steps[k].voicing); };
    const row = h('div', { class: 'chain' }, steps.map((x, k) =>
      h('button', { class: 'chain-step' + (k === i ? ' sel' : '') + (x.pivot ? ' pivot' : ''), onclick: () => jump(k) },
        h('small', null, chordName(cfg.key, scale, x.voicing.on)), STOP_SHORT[floorId(x)])));
    const say = SCALES[scale].say;
    const topNote = v.notes[v.notes.length - 1];
    const last = i === steps.length - 1;
    const caption = st.pivot
      ? `${STOP_ONE[SHAPES[st.expected].floor].replace(/^a/, 'A')} was due here. This is its reflection, ${STOP_ONE[floorId(st)]}. The melody steps down to the ${say[topNote.deg]} as planned, and the bass lands an octave lower than it was heading.`
      : i === 0 ? `The melody starts on the ${say[topNote.deg]} and walks down one step per chord. Each chord is one floor smaller, so the bass climbs to meet it.`
      : last && floorId(st) === 'unison' ? 'The two voices have met on one note. Without a pivot the line ends here.'
      : `${STOP_ONE[floorId(st)].replace(/^a/, 'A')} beneath the ${say[topNote.deg]}: the melody down a step, the bass up a step.`;
    root.replaceChildren(
      pickRow('Scale', [['maj6', `${cfg.key} major 6`], ['min6', `${cfg.key} minor 6`]], scale, (x) => { scale = x; i = 0; render(); }),
      pickRow('Start on', [['drop2', 'Drop 2'], ['drop3', 'Drop 3']], start, (x) => { start = x; i = 0; render(); }),
      pickRow('Line', [[true, 'Through the mirror'], [false, 'Straight on']], pivot, (x) => { pivot = x; i = 0; render(); }),
      row, board.el,
      h('div', { class: 'browser-controls' },
        h('button', { class: 'round', 'aria-label': 'Previous chord', onclick: () => jump(mod(i - 1, steps.length)) }, icon('back', 20)),
        h('button', { class: 'pill', onclick: () => { audio.stopAll(); steps.forEach((x, k) => sound(x.voicing, k * 0.95)); } }, icon('play', 16), 'Play it through'),
        h('button', { class: 'round', 'aria-label': 'Next chord', onclick: () => jump(mod(i + 1, steps.length)) }, icon('next', 20))),
      h('div', { class: 'pills center' }, pill('Bass line alone', () => { audio.stopAll(); audio.line(steps.map((x) => x.voicing.notes[0].midi), 0.4); })),
      h('figcaption', null, caption),
    );
  }
  render();
  return root;
}

// ---- substitution ----
// The off chord of a key in the middle, and the chords one fret away from it. Each button
// moves one note of the off chord up or down.
export function subHub(init = {}) {
  const cfg = { tonic: 10, all: false, pos: 2, ...init };
  const key = scaleKey(cfg.tonic);
  let pos = cfg.pos;
  let cur = null;                 // the post showing, or null for the off chord itself
  let around = 6;
  let note = 'This is the off chord. Each button moves one of its notes one fret.';
  const root = h('figure', { class: 'fig browser ride' });
  const strum = (notes, at = 0) => audio.chord(notes.map((n) => n.midi), at, 0.03, 0.55);

  function show(id) {
    const hb = hubPair(cfg.tonic, id, pos, SET52, around);
    const was = cur;
    cur = id;
    note = `${postStory(hb.post)}${POSTS[id].away ? ` This one leads to ${scaleKey(cfg.tonic + 9)} minor, not home to ${key}.` : ''}`;
    audio.stopAll();
    if (!was) { strum(hb.center.notes); strum(hb.to.notes, 1.0); } else strum(hb.to.notes);
    render();
  }

  function render() {
    const hb = hubPair(cfg.tonic, cur || 'on5', pos, SET52, around);
    around = hb.center.minFret;
    const post = cur ? hb.post : null;
    const lo = Math.max(1, hb.center.minFret - 2);
    const board = neck({
      lo, hi: Math.max(hb.center.maxFret + 2, lo + 6), focus: SET52,
      marks: post
        ? [...hb.center.notes.filter((_, i) => hb.moved.includes(i)).map((n) => ({ string: n.string, fret: n.fret, kind: 'from', label: labelOf('maj6', n.deg) })),
          ...hb.to.notes.map((n, i) => ({ string: n.string, fret: n.fret, kind: hb.moved.includes(i) ? 'on anchor' : 'on', label: labelOf(hb.to.chord.scale, n.deg) }))]
        : hb.center.notes.map((n) => ({ string: n.string, fret: n.fret, kind: 'off', label: labelOf('maj6', n.deg) })),
      onTap: (s, f) => { const n = (post ? hb.to.notes : hb.center.notes).find((x) => x.string === s && x.fret === f); if (n) audio.note(n.midi); },
    });
    const btn = (id, text) => h('button', { class: 'pill' + (cur === id ? ' sel' : ''), onclick: () => show(id) }, text);
    const rows = [
      h('span', { class: 'ride-label' }, 'Sharp five'), btn('on5', 'Up: minor 6 on the 5'), btn('td', 'Down: true dominant'),
      h('span', { class: 'ride-label' }, 'Second'), btn('tm', 'Up: tritone’s minor'), btn('tt', 'Down: tritone sub'),
      ...(cfg.all ? [
        h('span', { class: 'ride-label' }, 'Major seven'), btn('iv', 'Up: minor iv'), btn('bd', 'Down: its dominant'),
        h('span', { class: 'ride-label' }, 'Fourth'), btn('rm', `Up: ${postIn('rm', cfg.tonic).label}`), btn('rd', `Down: ${postIn('rd', cfg.tonic).label}`),
      ] : []),
    ];
    root.replaceChildren(
      h('div', { class: 'browser-title' },
        h('span', { class: `tag ${post ? 'on' : 'off'}` }, !post ? 'off' : hb.moved.length > 1 ? 'two notes away' : 'one note away'),
        h('strong', null, post ? post.label : hb.post.center),
        h('span', { class: 'muted' }, post ? ` ${postPhrase(post)}` : ` the off chord of ${key}`)),
      board.el,
      h('div', { class: 'ride-grid' }, rows),
      h('div', { class: 'pills center' },
        btn('b5', 'Both down: dominant 7♭5'),
        pill('Back to the off chord', () => { cur = null; note = `${hb.post.center}: the major seven, second, fourth and sharp five of ${key}.`; audio.stopAll(); strum(hb.center.notes); render(); }),
        pill(`Resolve to ${key}6`, () => { audio.stopAll(); strum(post ? hb.to.notes : hb.center.notes); if (hb.home) strum(hb.home.notes, 1.1); }, 'play'),
        pill('Another position', () => { pos = mod(pos + 1, 4); around = 6; render(); })),
      h('figcaption', null, note),
    );
  }
  render();
  return root;
}

// One chord and every job it can do. Each job plays the same grip over a different bass note.
export function jobsFigure(init = {}) {
  const cfg = { root: 0, scale: 'min6', ...init };
  let scale = cfg.scale;
  let sel = -1;
  const root = h('figure', { class: 'fig browser ride' });
  const LEADS = { on5: 10, tm: 4, iv: 7, bd: 2, tt: 11 };   // where the chord goes next in that job, above its own root

  function render() {
    const c = chordOf(cfg.root, scale);
    const jobs = jobsOf(c);
    const all = voicings(scaleKey(c.root), scale, 'drop2', SET52).filter((v) => v.on && v.lowFret > 0 && v.maxFret <= 14);
    const v = all.find((x) => x.bottomDeg === 0) || all[0];
    const win = sixthWindow([v]);
    const board = neck({
      lo: win.lo, hi: win.hi, focus: SET52,
      marks: v.notes.map((n) => ({ string: n.string, fret: n.fret, kind: 'on', label: labelOf(scale, n.deg) })),
      onTap: (s, f) => { const n = v.notes.find((x) => x.string === s && x.fret === f); if (n) audio.note(n.midi); },
    });
    const play = (k) => {
      const job = jobs[k];
      sel = k; render();
      audio.stopAll();
      // the bass note of the chord being served, below the grip
      audio.note(40 + mod((job.leads ? c.root : job.root) - 40, 12), 0, 0.75, 2.2);
      audio.chord(v.notes.map((n) => n.midi), 0.12, 0.03, 0.5);
      const lead = scale === 'maj6' || job.id === 'self' ? null : LEADS[job.id];
      if (lead != null) {
        const home = voicings(scaleKey(c.root + lead), 'maj6', 'drop2', SET52).filter((x) => x.on && x.lowFret > 0)
          .sort((a, b) => Math.abs(a.notes[0].fret - v.notes[0].fret) - Math.abs(b.notes[0].fret - v.notes[0].fret))[0];
        audio.note(40 + mod(c.root + lead - 40, 12), 1.5, 0.75, 2.2);
        audio.chord(home.notes.map((n) => n.midi), 1.62, 0.03, 0.5);
      }
    };
    const job = jobs[sel];
    const caption = !job ? 'Tap a job to hear the same grip over a different bass note.'
      : job.leads ? `${nameOf(c)}, then ${scaleKey(job.root)}6: ${job.line}.`
      : `${nameOf(c)} over ${scaleKey(job.root)} in the bass: ${job.line}.`;
    root.replaceChildren(
      pickRow('Chord', [['maj6', `${scaleKey(cfg.root)} major 6`], ['min6', `${scaleKey(cfg.root)} minor 6`], ['dom7', `${scaleKey(cfg.root)} dominant 7`]], scale, (x) => { scale = x; sel = -1; render(); }),
      board.el,
      h('div', { class: 'jobs' }, jobs.map((j, k) => h('button', { class: 'job' + (k === sel ? ' sel' : ''), onclick: () => play(k) },
        h('strong', null, j.label), h('span', null, j.line)))),
      h('figcaption', null, caption),
    );
  }
  render();
  return root;
}

// The first eight bars of Take the "A" Train as a chain of grips, each chart chord with
// the chord that is played for it.
export function aTrainFigure(init = {}) {
  const cfg = { tonic: 0, bass: 1, ...init };
  let bass = cfg.bass;
  let i = 0;
  const root = h('figure', { class: 'fig browser ride' });
  const sound = (v, at = 0) => audio.chord(v.notes.map((n) => n.midi), at, 0.03, 0.55);
  const names = (c) => scaleNotes(scaleKey(c.root), c.scale);

  function render() {
    const steps = aTrain(cfg.tonic, bass);
    i = Math.min(i, steps.length - 1);
    const st = steps[i];
    const prev = i > 0 ? steps[i - 1].voicing : null;
    const win = sixthWindow(steps.map((x) => x.voicing));
    const board = neck({
      lo: win.lo, hi: win.hi, focus: SET52,
      marks: [
        ...(prev ? prev.notes.filter((n, k) => n.fret !== st.voicing.notes[k].fret).map((n) => ({ string: n.string, fret: n.fret, kind: 'from', label: '' })) : []),
        ...st.voicing.notes.map((n) => ({ string: n.string, fret: n.fret, kind: st.chord.scale === 'dim' ? 'off' : 'on', label: names(st.chord)[n.deg].name })),
      ],
      onTap: (s, f) => { const n = st.voicing.notes.find((x) => x.string === s && x.fret === f); if (n) audio.note(n.midi); },
    });
    const jump = (k) => { i = k; render(); audio.stopAll(); sound(steps[k].voicing); };
    const row = h('div', { class: 'chain' }, steps.map((x, k) =>
      h('button', { class: 'chain-step' + (k === i ? ' sel' : ''), onclick: () => jump(k) }, h('small', null, x.chartLabel || 'passing'), x.label)));
    const moved = st.moves ? ` Frets moved, low string to high: ${movesText(st.moves)}.` : '';
    const caption = st.chartLabel
      ? `${st.bars}: the chart says ${st.chartLabel}. Play ${st.label}, ${st.how}.${moved}`
      : `${st.bars}: ${st.label}, ${st.how}, on the way to the next bar.${moved}`;
    root.replaceChildren(
      pickRow('Start with', ROLES.map((r, k) => [k, `${r.name} in the bass`]), bass, (x) => { bass = x; i = 0; render(); audio.stopAll(); sound(aTrain(cfg.tonic, bass)[0].voicing); }),
      row, board.el,
      h('div', { class: 'browser-controls' },
        h('button', { class: 'round', 'aria-label': 'Previous chord', onclick: () => jump(mod(i - 1, steps.length)) }, icon('back', 20)),
        h('button', { class: 'pill', onclick: () => { audio.stopAll(); steps.forEach((x, k) => sound(x.voicing, k * 1.15)); } }, icon('play', 16), 'Play it through'),
        h('button', { class: 'round', 'aria-label': 'Next chord', onclick: () => jump(mod(i + 1, steps.length)) }, icon('next', 20))),
      h('figcaption', null, caption),
    );
  }
  render();
  return root;
}
