// ear.js — the Ear tab's games, as data and question makers.
//
// Nothing here touches the page or the speaker. A question says what to play (a list of
// timed events), what the choices are, and what to show afterwards, so every game can
// be tested without a browser. The page that runs them is earui.js.
//
// Three shelves:
//   listen   hear it, name it           on or off, which degree, which floor, what the
//                                        voices did, roads home
//   echo     hear it, play it back      echo (tap or play a phrase), sing it first
//   make     no wrong answers           resolve it
//
// A round is a handful of questions at one level. Every level is open from the start;
// getting most of a round right marks the level as passed and moves the suggestion on.

import { OPEN, SCALES, SCALE_ORDER, KEY_ORDER, keyOf, mod, chordName, scaleTitle, stringPath, stepMidi, degOfMidi } from './theory.js';
import { SHAPES, FLOORS, ELEVATOR, voicings, voicingAt, voicingFor, setWithTop } from './floors.js';
import { movePair, leapPair, moveWords, describeMove, TOP_STRING } from './motion.js';
import { pivotPair } from './mirror.js';
import { chordOf, nameOf, gripChain } from './subs.js';

const ALL = [0, 1, 2, 3, 4, 5, 6, 7];
const ON = [0, 2, 4, 6];
const say = (scale, deg) => SCALES[scale].say[deg];
const lab = (scale, deg) => SCALES[scale].labels[deg];
const kc = (deg) => (deg % 2 === 0 ? 'on' : 'off');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const mark = (n, scale, kind) => ({ string: n.string, fret: n.fret, kind: kind || kc(n.deg), label: lab(scale, n.deg) });
const same = (a, b) => a.string === b.string && a.fret === b.fret;
const ONE = { unison: 'a single note', thirds: 'a third', triads: 'a triad', shells: 'a shell', octaves: 'an octave chord', drop2: 'a drop 2', drop3: 'a drop 3', drop24: 'a drop 2 and 4', dbl: 'a double octave' };

// A stretch of neck that holds these frets, at least seven frets wide.
function frameOf(frets) {
  const fretted = frets.filter((f) => f > 0);
  const low = fretted.length ? Math.min(...fretted) : 1;
  const high = fretted.length ? Math.max(...fretted) : 1;
  const lo = frets.includes(0) ? 0 : Math.max(1, low - 1);
  return { lo, hi: Math.max(high + 1, (lo || 1) + 6) };
}

// ---- sound, as timed events ----
// { at: seconds, midis, strum?, gain, solo?: a single plucked note, dur? }
const chordEv = (midis, at = 0, strum = 0.03, gain = 0.55) => ({ at, midis, strum, gain });
const noteEv = (midi, at = 0, gain = 0.9, dur = 2.4) => ({ at, midis: [midi], gain, solo: true, dur });
const lineEv = (midis, at = 0, gap = 0.5, gain = 0.8) => midis.map((m, i) => noteEv(m, at + i * gap, gain, Math.max(1.2, gap * 2.2)));
const CUE = 1.45;   // how long the key chord rings before the thing to listen for

function cueMidis(key, scale) {
  const all = voicings(key, scale, 'drop2', [5, 4, 3, 2]).filter((v) => v.on);
  const v = all.find((x) => x.minFret >= 2 && x.maxFret <= 10) || all[0];
  return v.notes.map((n) => n.midi);
}
const cue = (key, scale) => [chordEv(cueMidis(key, scale), 0, 0.11, 0.5)];
// A degree in a comfortable octave, the same for every question in a key.
export function earMidi(key, scale, deg) {
  const pc = keyOf(key).pc;
  return 60 + pc - (pc > 5 ? 12 : 0) + SCALES[scale].semis[deg];
}

// ---- the games ----
export const GAMES = [
  {
    id: 'onoff', shelf: 'listen', title: 'On or off', count: 10,
    blurb: 'Does the note rest in the chord, or lean on it?',
    tip: 'You hear a chord, then one note. An on note belongs to the chord and sounds settled. An off note belongs to the diminished chord and wants to move. The top levels give you a few seconds to answer.',
    levels: [
      { name: 'C major 6', keys: ['C'], scales: ['maj6'] },
      { name: 'Five keys', keys: 5, scales: ['maj6'] },
      { name: 'Major 6 and minor 6, against the clock', keys: 8, scales: ['maj6', 'min6'], seconds: 7 },
      { name: 'All four scales, fast', keys: 12, scales: SCALE_ORDER, seconds: 5 },
    ],
  },
  {
    id: 'degree', shelf: 'listen', title: 'Which degree', count: 10,
    blurb: 'Name a note by its job in the chord',
    tip: 'This is the skill behind everything else: a sound in your head becomes "fifth, on", and then you know what belongs under it. Later levels play the chord less often, so you have to hold the key in your ear.',
    levels: [
      { name: 'Root, third, fifth, sixth', degs: ON, keys: ['C'], scales: ['maj6'] },
      { name: 'Add the second and the major seven', degs: [0, 1, 2, 4, 6, 7], keys: ['C'], scales: ['maj6'] },
      { name: 'All eight notes', degs: ALL, keys: ['C'], scales: ['maj6'] },
      { name: 'A new key each round, the chord heard less often', degs: ALL, keys: 5, scales: ['maj6'], cueEvery: 3 },
      { name: 'Major or minor 6, the chord heard once', degs: ALL, keys: 8, scales: ['maj6', 'min6'], cueEvery: 0, oneScale: true },
    ],
  },
  {
    id: 'floor', shelf: 'listen', title: 'Which floor', count: 10,
    blurb: 'How many notes, and how far apart?',
    tip: 'Listen for how many notes there are, then for the distance between the top and the bottom. You hear the chord together, then one note at a time.',
    levels: [
      { name: 'One note, a third or a triad', floors: ['unison', 'thirds', 'triads'] },
      { name: 'Add shells', floors: ['unison', 'thirds', 'triads', 'shells'] },
      { name: 'Add octave chords and drop 2', floors: ['thirds', 'triads', 'shells', 'octaves', 'drop2'] },
      { name: 'The wide floors', floors: ['drop2', 'drop3', 'drop24', 'dbl'] },
      { name: 'All nine floors', floors: FLOORS.map((f) => f.id) },
    ],
  },
  {
    id: 'voices', shelf: 'listen', title: 'What the voices did', count: 10,
    blurb: 'Follow the top note and the bottom note',
    tip: 'Two chords. Hear the top note and the bottom note as two singers. Do they move the same way, opposite ways, or does one stay put? You can ask for the outer voices on their own.',
    levels: [
      { name: 'Together or apart', kind: 'motion', types: ['par', 'con'] },
      { name: 'Add a voice that holds', kind: 'motion', types: ['par', 'con', 'obl'] },
      { name: 'The bass: step, hold or leap', kind: 'bass', types: ['step', 'hold', 'leap'] },
      { name: 'Straight on, or through the mirror', kind: 'mirror', types: ['straight', 'mirror'] },
    ],
  },
  {
    id: 'roads', shelf: 'listen', title: 'Roads home', count: 10,
    blurb: 'Which chord took you back to the tonic?',
    tip: 'Three chords. The first and the last are always the same, and the one in the middle is a way of playing the V chord, or the minor iv. Listen for whether it stays inside the key.',
    levels: [
      { name: 'Inside or outside', roads: ['on5', 'tm'], keys: ['B♭', 'C', 'F'] },
      { name: 'Add the minor iv', roads: ['on5', 'iv', 'tm'], keys: 5 },
      { name: 'Three roads, every key', roads: ['on5', 'iv', 'tm'], keys: 12 },
      { name: 'Five ways home', roads: ['on5', 'td', 'iv', 'tm', 'tt'], keys: 12 },
    ],
  },
  {
    id: 'echo', shelf: 'echo', title: 'Echo', count: 8,
    blurb: 'Hear a phrase, play it back',
    tip: 'A short phrase on one string. Away from the guitar you tap it back on the neck. With the guitar you play it, then check. Name each note as you go if you can.',
    levels: [
      { name: 'One step from a note you can see', notes: 2, keys: ['C'] },
      { name: 'Three notes by step', notes: 3, keys: 3 },
      { name: 'Three notes, with skips', notes: 3, leaps: true, keys: 5 },
      { name: 'Four notes', notes: 4, leaps: true, keys: 5 },
      { name: 'Four notes, the first one unseen', notes: 4, leaps: true, keys: 8, blind: true },
    ],
  },
  {
    id: 'sing', shelf: 'echo', title: 'Sing it first', count: 8,
    blurb: 'Hear the note in your head before it sounds',
    tip: 'The app names a note. Sing it, hum it or just imagine it, then check. You mark yourself. This is the slowest game and the one that does the most for improvising.',
    levels: [
      { name: 'Root, third, fifth, sixth', degs: ON, count: 1, keys: ['C'] },
      { name: 'All eight notes', degs: ALL, count: 1, keys: 3 },
      { name: 'Two notes in a row', count: 2, keys: 5 },
      { name: 'Three-note lines', count: 3, keys: 5 },
    ],
  },
  {
    id: 'resolve', shelf: 'make', title: 'Resolve it', count: 6, free: true,
    blurb: 'You are left hanging. Choose where to land.',
    tip: 'The app plays the home chord, then leaves you on an off chord. Pick a way to resolve it and hear what you chose. There are no wrong answers here. Try each one and notice which you like.',
    levels: [
      { name: 'Single notes', floor: 'unison' },
      { name: 'Thirds', floor: 'thirds' },
      { name: 'Triads', floor: 'triads' },
    ],
  },
];
export const SHELVES = [
  { id: 'listen', title: 'Listen', blurb: 'Hear it, name it' },
  { id: 'echo', title: 'Echo', blurb: 'Hear it, play it back' },
  { id: 'make', title: 'Make', blurb: 'No wrong answers' },
];
export const gameById = (id) => GAMES.find((g) => g.id === id);

// How many right answers pass a level, and which level to suggest next.
export const passMark = (game) => Math.ceil(game.count * 0.8);
export const passed = (game, record, level) => !game.free && ((record && record.best && record.best[level]) || 0) >= passMark(game);
export function suggested(game, record) {
  if (game.free) return 0;
  const i = game.levels.findIndex((_, k) => !passed(game, record, k));
  return i < 0 ? game.levels.length - 1 : i;
}

// ---- choosing what to ask ----
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const keysOf = (level) => (Array.isArray(level.keys) ? level.keys : KEY_ORDER.slice(0, level.keys || 5));
// One of the options, leaning toward the ones missed most, and never the same three times running.
function choose(ctx, options, statOf) {
  const weight = (o) => { const s = ctx.stats[statOf(o)]; return 1 + 3 * (s && s.n >= 3 ? s.x / s.n : 0.25); };
  const total = options.reduce((sum, o) => sum + weight(o), 0);
  const draw = () => {
    let r = ctx.rng() * total;
    for (const o of options) { r -= weight(o); if (r <= 0) return o; }
    return options[options.length - 1];
  };
  let got = draw();
  const last = ctx.prev.slice(-2);
  for (let tries = 0; tries < 6 && options.length > 1 && last.length === 2 && last.every((x) => x === got); tries++) got = draw();
  ctx.prev.push(got);
  return got;
}

// Where a degree lives on one string, measured from the nearer root: for showing the answer.
function spot(key, scale, deg, rng) {
  const pc = keyOf(key).pc;
  const fits = [6, 5, 4, 3, 2, 1].map((s) => ({ string: s, root: mod(pc - OPEN[s], 12) })).filter((o) => o.root >= 1 && o.root <= 5);
  const { string, root } = pick(rng, fits.length ? fits : [{ string: 2, root: mod(pc - OPEN[2], 12) || 12 }]);
  const semis = SCALES[scale].semis[deg];
  const rootFret = semis > 5 ? root + 12 : root;
  const fret = root + semis;
  const marks = [{ string, fret: rootFret, kind: 'on', label: 'R' }];
  if (deg !== 0) marks.push({ string, fret, kind: kc(deg), label: lab(scale, deg) });
  return { focus: [string], marks, ...frameOf([rootFret, fret]), where: deg === 0 ? 'the root itself' : semis > 5 ? `${12 - semis} below the root` : `${semis} above the root` };
}
const frets = (text) => text.replace(/^(\d+) /, (_, n) => `${n} fret${n === '1' ? '' : 's'} `);

// ---- question makers: (level, ctx) -> question ----
// ctx: { rng, stats, prev, key, index, always: play the key chord every time }
const MAKE = {
  onoff(level, ctx) {
    const scale = pick(ctx.rng, level.scales);
    const deg = choose(ctx, ALL, (d) => `onoff|${scale}|${d}`);
    const on = deg % 2 === 0;
    const where = spot(ctx.key, scale, deg, ctx.rng);
    return {
      form: 'choice', stat: `onoff|${scale}|${deg}`, target: deg,
      kicker: `On or off · ${scaleTitle(ctx.key, scale)}`,
      prompt: 'On or off?',
      hint: `You hear ${chordName(ctx.key, scale, true)}, then one note.`,
      choices: [{ value: 'on', label: 'On', sub: 'at rest', cls: 'on' }, { value: 'off', label: 'Off', sub: 'wants to move', cls: 'off' }],
      layout: 'two', answer: on ? 'on' : 'off', seconds: level.seconds || 0,
      sound: [...cue(ctx.key, scale), noteEv(earMidi(ctx.key, scale, deg), CUE)],
      reveal: { text: `${on ? 'On' : 'Off'}: that was the ${say(scale, deg)}. On this string it is ${frets(where.where)}.`, neck: where },
    };
  },

  degree(level, ctx) {
    const scale = level.oneScale ? ctx.scale : pick(ctx.rng, level.scales);
    const deg = choose(ctx, level.degs, (d) => `degree|${scale}|${d}`);
    const every = level.cueEvery;
    const withCue = ctx.always || every == null || (every === 0 ? ctx.index === 0 : ctx.index % every === 0);
    const midi = earMidi(ctx.key, scale, deg);
    const where = spot(ctx.key, scale, deg, ctx.rng);
    return {
      form: 'choice', stat: `degree|${scale}|${deg}`, target: deg,
      kicker: `Which degree · ${scaleTitle(ctx.key, scale)}`,
      prompt: 'Which degree is the note?',
      hint: withCue ? `You hear ${chordName(ctx.key, scale, true)}, then one note.` : 'No chord this time. Keep the key in your ear.',
      choices: level.degs.slice().sort((a, b) => a - b).map((d) => ({ value: d, label: lab(scale, d), sub: say(scale, d) })),
      layout: 'grid', answer: deg,
      sound: withCue ? [...cue(ctx.key, scale), noteEv(midi, CUE)] : [noteEv(midi, 0)],
      again: withCue ? [] : [{ label: 'Hear the chord', sound: cue(ctx.key, scale) }],
      reveal: { text: `The ${say(scale, deg)}, ${kc(deg)}. On this string it is ${frets(where.where)}.`, neck: where },
    };
  },

  floor(level, ctx) {
    const target = choose(ctx, level.floors, (f) => `floor|${f}`);
    const floor = FLOORS.find((f) => f.id === target);
    const key = pick(ctx.rng, KEY_ORDER.slice(0, 5));
    const shapeId = pick(ctx.rng, floor.shapes);
    const set = SHAPES[shapeId].primary;
    const all = voicings(key, 'maj6', shapeId, set);
    const pool = all.filter((v) => v.minFret >= 1 && v.maxFret <= 12);
    const v = pick(ctx.rng, pool.length ? pool : all);
    const midis = v.notes.map((n) => n.midi);
    const n = level.floors.length;
    return {
      form: 'choice', stat: `floor|${target}`, target,
      kicker: `Which floor · ${scaleTitle(key, 'maj6')}`,
      prompt: 'Which floor is this?',
      hint: 'Count the notes, then judge how far apart the outer two are.',
      choices: level.floors.map((id) => ({ value: id, label: FLOORS.find((f) => f.id === id).name })),
      layout: n === 3 ? 'three' : n > 6 ? 'three small' : 'pairs', answer: target,
      sound: [chordEv(midis, 0, 0.02, 0.6), ...(midis.length > 1 ? lineEv(midis, 1.5, 0.28, 0.6) : [])],
      reveal: {
        text: `${floor.name}: ${SHAPES[shapeId].name.toLowerCase()} of ${chordName(key, 'maj6', v.on)}, with ${floor.span} between the outside notes.`,
        neck: { focus: set, marks: v.notes.map((x) => mark(x, 'maj6')), ...frameOf(v.notes.map((x) => x.fret)) },
      },
    };
  },

  voices(level, ctx) {
    const target = choose(ctx, level.types, (t) => `voices|${t}`);
    const scale = 'maj6';
    const outer = (c) => [c.notes[0].midi, c.notes[c.notes.length - 1].midi];
    let key = 'C';
    let from = null;
    let to = null;
    let text = '';
    for (let tries = 0; tries < 60 && !to; tries++) {
      key = tries > 40 ? 'C' : pick(ctx.rng, KEY_ORDER.slice(0, 5));
      const deg = pick(ctx.rng, ALL);
      if (level.kind === 'mirror') {
        const p = pivotPair(key, { scale, floor: pick(ctx.rng, ['shell.low', 'triads', 'oct.low']), how: 'in', deg });
        if (!p || !p.straight) continue;
        from = p.from;
        to = target === 'mirror' ? p.to : p.straight;
        text = target === 'mirror'
          ? `Through the mirror: ${ONE[SHAPES[p.expected].floor]} was due, and its reflection, ${ONE[SHAPES[p.mirror].floor]}, was played. The bass dropped a seventh.`
          : `Straight on, to ${ONE[SHAPES[p.expected].floor]}: the melody stepped down and the bass stepped up to meet it.`;
        continue;
      }
      let pair = null;
      if (level.kind === 'motion') {
        const floor = pick(ctx.rng, target === 'obl' ? ['unison', 'thirds'] : ['thirds', 'triads', 'shell.low']);
        pair = movePair(key, { scale, move: target, floor, dir: pick(ctx.rng, [1, -1]), deg });
      } else if (target === 'step') {
        pair = movePair(key, { scale, move: pick(ctx.rng, ['par', 'con']), floor: pick(ctx.rng, ['thirds', 'triads', 'shell.low']), dir: pick(ctx.rng, [1, -1]), deg });
      } else {
        const moves = target === 'hold'
          ? [['thirds', 2, 1], ['triads', 2, 1], ['triads', -2, -1], ['shell.low', -2, -1]]
          : [['triads', 1, -1], ['shell.low', 1, -1], ['thirds', -1, 1], ['triads', -1, 1], ['thirds', 2, 2], ['shell.low', -2, -2], ['triads', 2, 0], ['triads', -2, 0]];
        const [floor, t, df] = pick(ctx.rng, moves);
        pair = leapPair(key, { scale, floor, t, df, deg });
      }
      if (!pair) continue;
      from = pair.from; to = pair.to;
      text = moveWords(pair);
    }
    const NAMES = {
      par: ['Parallel', 'same direction'], con: ['Contrary', 'opposite directions'], obl: ['Oblique', 'one voice holds'],
      step: ['Stepped', 'to the next note'], hold: ['Held', 'the same note'], leap: ['Leapt', 'skipped a note'],
      straight: ['Straight on', 'the voices keep closing'], mirror: ['Through the mirror', 'the bass drops away'],
    };
    const all = [...from.notes, ...to.notes];
    return {
      form: 'choice', stat: `voices|${target}`, target,
      kicker: `What the voices did · ${scaleTitle(key, scale)}`,
      prompt: level.kind === 'bass' ? 'What did the bass do?' : level.kind === 'mirror' ? 'Straight on, or through the mirror?' : 'What did the outer voices do?',
      hint: level.kind === 'bass' ? 'Two chords. Follow the bottom note only.' : level.kind === 'mirror' ? 'The melody steps down both times. Does the bass step up to meet it, or fall away?' : 'Two chords. Follow the top note and the bottom note.',
      choices: level.types.map((t) => ({ value: t, label: NAMES[t][0], sub: NAMES[t][1] })),
      layout: level.types.length === 2 ? 'two' : 'three', answer: target,
      sound: [chordEv(from.notes.map((n) => n.midi), 0), chordEv(to.notes.map((n) => n.midi), 1.15)],
      again: [{ label: 'Outer voices only', sound: [chordEv(outer(from), 0, 0.02, 0.6), chordEv(outer(to), 1.15, 0.02, 0.6)] }],
      reveal: {
        text,
        neck: {
          focus: [...new Set(all.map((n) => n.string))],
          marks: [...from.notes.filter((n) => !to.notes.some((x) => same(x, n))).map((n) => mark(n, scale, 'from')), ...to.notes.map((n) => mark(n, scale))],
          ...frameOf(all.map((n) => n.fret)),
        },
      },
    };
  },

  roads(level, ctx) {
    const ROADS = {
      on5: { chord: [2, 'min6'], label: 'Minor 6 on the 5', sub: 'inside the key', short: 'Inside', why: 'Every note of the middle chord belongs to the key.' },
      tm: { chord: [8, 'min6'], label: 'Tritone’s minor', sub: 'outside the key', short: 'Outside', why: 'The middle chord has two notes from outside the key.' },
      iv: { chord: [5, 'min6'], label: 'Minor iv', sub: 'the first chord turns minor', why: 'The first chord keeps its root and its third drops a fret.' },
      td: { chord: [7, 'dom7'], label: 'True dominant', sub: 'the V chord itself', why: 'The plain V7 chord, root and all.' },
      tt: { chord: [1, 'dom7'], label: 'Tritone substitute', sub: 'a dominant a half step above home', why: 'A dominant chord that slides down a half step to the tonic.' },
    };
    const target = choose(ctx, level.roads, (r) => `roads|${r}`);
    const key = pick(ctx.rng, keysOf(level));
    const tonic = keyOf(key).pc;
    const chords = [chordOf(tonic + 5, 'maj6'), chordOf(tonic + ROADS[target].chord[0], ROADS[target].chord[1]), chordOf(tonic, 'maj6')];
    const chain = gripChain(chords, pick(ctx.rng, [0, 1, 2, 3]));
    const mid = chain[1];
    const two = level.roads.length === 2;
    return {
      form: 'choice', stat: `roads|${target}`, target,
      kicker: `Roads home · going to ${key}`,
      prompt: two ? 'Inside or outside?' : 'Which road home was that?',
      hint: 'Three chords. The first and last are always the same. Listen to the one in the middle.',
      choices: level.roads.map((r) => (two ? { value: r, label: ROADS[r].short, sub: ROADS[r].label.toLowerCase() } : { value: r, label: ROADS[r].label, sub: ROADS[r].sub })),
      layout: two ? 'two' : 'stack', answer: target,
      sound: chain.map((st, k) => chordEv(st.voicing.notes.map((n) => n.midi), k * 1.25)),
      reveal: {
        text: `${ROADS[target].label}: ${chain.map((st) => st.label).join(', ')}. ${ROADS[target].why}`,
        neck: {
          focus: [5, 4, 3, 2],
          marks: mid.voicing.notes.map((n) => ({ string: n.string, fret: n.fret, kind: 'on', label: lab(mid.chord.scale, n.deg) })),
          ...frameOf(chain.flatMap((st) => st.voicing.notes.map((n) => n.fret))),
        },
      },
    };
  },

  echo(level, ctx) {
    const scale = 'maj6';
    const string = pick(ctx.rng, [2, 3]);
    const path = stringPath(ctx.key, scale, string, 1, 14);
    const steps = level.leaps ? [1, -1, 1, -1, 2, -2] : [1, -1];
    let line = null;
    for (let tries = 0; tries < 80 && !line; tries++) {
      const idx = [2 + Math.floor(ctx.rng() * (path.length - 4))];
      while (idx.length < level.notes) idx.push(idx[idx.length - 1] + pick(ctx.rng, steps));
      const notes = idx.map((i) => path[i]);
      if (notes.some((n) => !n)) continue;
      const span = Math.max(...notes.map((n) => n.fret)) - Math.min(...notes.map((n) => n.fret));
      // a phrase that fits one hand position and does not just rock between two notes
      if (span > 5 || (notes.length > 2 && new Set(idx).size < 3)) continue;
      // with the first note unseen, stay close to a root so both fit on screen
      if (level.blind && !path.some((n) => n.deg === 0 && [...notes, n].reduce((w, x) => Math.max(w, Math.abs(x.fret - n.fret)), 0) <= 5 && Math.max(...notes.map((x) => x.fret), n.fret) - Math.min(...notes.map((x) => x.fret), n.fret) <= 6)) continue;
      line = notes;
    }
    if (!line) line = [path[3], path[4], path[5], path[4]].slice(0, level.notes);
    const all = line.map((n) => n.fret);
    // with the first note unseen, the nearest root is marked instead
    const roots = path.filter((n) => n.deg === 0).sort((a, b) => Math.abs(a.fret - line[0].fret) - Math.abs(b.fret - line[0].fret));
    const landmark = level.blind ? { string, fret: roots[0].fret, kind: 'on', label: 'R' } : null;
    const lo = Math.max(1, Math.min(...all, landmark ? landmark.fret : 99) - 1);
    const hi = Math.max(Math.max(...all, landmark ? landmark.fret : 0) + 1, lo + 6);
    const names = line.map((n) => say(scale, n.deg));
    return {
      form: 'tap', stat: `echo|${ctx.level}`, target: ctx.level,
      kicker: `Echo · ${scaleTitle(ctx.key, scale)}`,
      prompt: 'Play back what you hear.',
      hint: level.blind ? 'Only the root is marked. Find the first note by ear, then the rest.' : `The first note is marked: the ${names[0]}. Tap the rest in order.`,
      guitarHint: `On string ${string}. ${level.blind ? 'Only the root is marked.' : `It starts on the ${names[0]}, shown here.`} Play it, then check.`,
      scale, string, notes: line.map((n) => ({ ...n })), shown: level.blind ? 0 : 1, landmark, lo, hi,
      sound: [...cue(ctx.key, scale), ...lineEv(line.map((n) => n.midi), CUE - 0.2, 0.55)],
      phrase: lineEv(line.map((n) => n.midi), 0, 0.55),
      reveal: { text: `${cap(names.join(', '))}.` },
    };
  },

  sing(level, ctx) {
    const scale = 'maj6';
    const chord = chordName(ctx.key, scale, true);
    if (level.count === 1) {
      const deg = choose(ctx, level.degs, (d) => `sing|${d}`);
      return {
        form: 'self', stat: `sing|${deg}`, target: deg,
        kicker: `Sing it first · ${scaleTitle(ctx.key, scale)}`,
        prompt: `Hear the ${say(scale, deg)} over ${chord}.`,
        hint: 'Sing it, hum it or imagine it. Then check.',
        sound: cue(ctx.key, scale),
        check: [noteEv(earMidi(ctx.key, scale, deg), 0)],
        reveal: { text: `That is the ${say(scale, deg)}, ${kc(deg)}.` },
      };
    }
    // a little line: start on an on note, then steps and the odd skip, staying near home
    let midis = null;
    for (let tries = 0; tries < 40 && !midis; tries++) {
      const line = [earMidi(ctx.key, scale, pick(ctx.rng, ON))];
      let away = 0;
      while (line.length < level.count) {
        const step = pick(ctx.rng, [1, -1, 1, -1, 2, -2]);
        away += step;
        line.push(stepMidi(ctx.key, scale, line[line.length - 1], step));
      }
      if (Math.abs(away) <= 3 && new Set(line).size === line.length) midis = line;
    }
    if (!midis) { const a = earMidi(ctx.key, scale, 4); midis = [a, stepMidi(ctx.key, scale, a, 1), stepMidi(ctx.key, scale, a, 2)].slice(0, level.count); }
    const names = midis.map((m) => say(scale, degOfMidi(ctx.key, scale, m)));
    ctx.prev.push(names.join());
    return {
      form: 'self', stat: `sing|line${level.count}`, target: names.join(),
      kicker: `Sing it first · ${scaleTitle(ctx.key, scale)}`,
      prompt: `Hear this over ${chord}: the ${names.join(', then the ')}.`,
      hint: 'You get the chord, and nothing else. Sing the line, then check.',
      sound: cue(ctx.key, scale),
      check: lineEv(midis, 0, 0.6),
      reveal: { text: `${cap(names.join(', '))}.` },
    };
  },

  resolve(level, ctx) {
    const scale = 'maj6';
    const shape = level.floor;
    const i = ELEVATOR.indexOf(shape);
    const set = setWithTop(shape, TOP_STRING);
    const at = (shapeId, midi) => voicingAt(ctx.key, scale, shapeId, setWithTop(shapeId, TOP_STRING), 'top', midi);
    let from = null;
    let options = [];
    for (let tries = 0; tries < 30 && options.length < 2; tries++) {
      const deg = pick(ctx.rng, [1, 3, 5, 7]);
      from = voicingFor(ctx.key, scale, shape, set, 'top', deg);
      if (!from) continue;
      const top = from.notes[from.notes.length - 1].midi;
      const ways = [
        { id: 'down', label: 'Melody down', sub: 'the bass follows', shape, by: -1 },
        { id: 'up', label: 'Melody up', sub: 'the bass follows', shape, by: 1 },
        { id: 'in', label: 'Close in', sub: 'melody down, bass up', shape: ELEVATOR[i - 1], by: -1 },
        { id: 'out', label: 'Open out', sub: 'melody up, bass down', shape: ELEVATOR[i + 1], by: 1 },
      ];
      options = ways.filter((w) => w.shape).map((w) => {
        const to = at(w.shape, stepMidi(ctx.key, scale, top, w.by));
        if (!to) return null;
        const landed = to.notes[to.notes.length - 1];
        const d = describeMove(ctx.key, scale, from, to);
        const under = w.shape === 'unison' ? 'on its own' : `with ${SHAPES[w.shape].a} beneath it`;
        return {
          id: w.id, label: w.label, sub: shape === 'unison' && w.id !== 'out' ? '' : w.sub, landed: landed.deg,
          sound: [chordEv(from.notes.map((n) => n.midi), 0), chordEv(to.notes.map((n) => n.midi), 0.95)],
          text: `You landed on the ${say(scale, landed.deg)}, ${under}. ${moveWords(d)}`,
          neck: {
            focus: [...new Set([...from.notes, ...to.notes].map((n) => n.string))],
            marks: [...from.notes.filter((n) => !to.notes.some((x) => same(x, n))).map((n) => mark(n, scale, 'from')), ...to.notes.map((n) => mark(n, scale))],
          },
        };
      }).filter(Boolean);
    }
    const topNote = from.notes[from.notes.length - 1];
    const allFrets = [...from.notes.map((n) => n.fret), ...options.flatMap((o) => o.neck.marks.map((m) => m.fret))];
    // one window for the whole turn when it fits a phone; otherwise each way out gets its own
    const whole = frameOf(allFrets);
    const fits = whole.hi - Math.max(1, whole.lo) <= 7;
    const frame = fits ? whole : frameOf(from.notes.map((n) => n.fret));
    const frameFor = (o) => (fits ? whole : frameOf([...from.notes.map((n) => n.fret), ...o.neck.marks.map((m) => m.fret)]));
    return {
      form: 'free', stat: null, target: topNote.deg,
      kicker: `Resolve it · ${scaleTitle(ctx.key, scale)}`,
      prompt: 'Where do you land?',
      hint: `You are on ${chordName(ctx.key, scale, false)}, the off chord, with the ${say(scale, topNote.deg)} on top. Choose a way home to ${chordName(ctx.key, scale, true)}.`,
      sound: [...cue(ctx.key, scale), chordEv(from.notes.map((n) => n.midi), CUE)],
      neck: { focus: from.set || set, marks: from.notes.map((n) => mark(n, scale)), ...frame },
      options: options.map((o) => ({ ...o, neck: { ...o.neck, ...frameFor(o) } })),
    };
  },
};

// ---- rounds ----
const context = (opts) => ({ rng: opts.rng || Math.random, stats: opts.stats || {}, prev: [], index: 0, always: false });

// One round of a game at a level: { game, level, key, questions }.
export function makeRound(gameId, level, opts = {}) {
  const game = gameById(gameId);
  const lv = game.levels[level];
  const ctx = { ...context(opts), level };
  // games about one note against a chord stay in one key for the round, so the ear can settle
  ctx.key = pick(ctx.rng, keysOf(lv));
  ctx.scale = lv.scales ? pick(ctx.rng, lv.scales) : 'maj6';
  const questions = [];
  for (let k = 0; k < game.count; k++) {
    ctx.index = k;
    questions.push({ ...MAKE[gameId](lv, ctx), game: gameId, level });
  }
  return { game, level, key: ctx.key, title: game.title, questions };
}

// A two-minute mix of the listening games and one echo, each at the level you have reached.
const QUICK = ['degree', 'onoff', 'floor', 'degree', 'voices', 'roads', 'degree', 'floor', 'onoff', 'echo'];
export function makeQuick(records = {}, opts = {}) {
  const base = context(opts);
  const order = QUICK.map((id) => ({ id, r: base.rng() })).sort((a, b) => a.r - b.r).map((x) => x.id);
  const questions = order.map((id, k) => {
    const game = gameById(id);
    const level = suggested(game, records[id]);
    const lv = game.levels[level];
    const ctx = { ...base, prev: [], index: k, always: true, level, key: pick(base.rng, keysOf(lv)), scale: lv.scales ? pick(base.rng, lv.scales) : 'maj6' };
    return { ...MAKE[id](lv, ctx), game: id, level, seconds: 0 };
  });
  return { game: null, level: null, title: 'Quick round', questions };
}

// ---- what a statistic is about, in words ----
const VOICE_WORDS = { par: 'parallel motion', con: 'contrary motion', obl: 'oblique motion', step: 'a stepping bass', hold: 'a held bass', leap: 'a leaping bass', straight: 'a line that goes straight on', mirror: 'a line that goes through the mirror' };
const ROAD_WORDS = { on5: 'the minor 6 on the 5', tm: 'the tritone’s minor', iv: 'the minor iv', td: 'the true dominant', tt: 'the tritone substitute' };
export function statLabel(key) {
  const p = key.split('|');
  const scale = SCALES[p[1]] ? (p[1] === 'maj6' ? '' : ` in ${SCALES[p[1]].short}`) : '';
  if (p[0] === 'onoff') return `whether the ${say(p[1], +p[2])} is on or off${scale}`;
  if (p[0] === 'degree') return `the ${say(p[1], +p[2])}${scale}`;
  if (p[0] === 'floor') return FLOORS.find((f) => f.id === p[1]).name.toLowerCase();
  if (p[0] === 'voices') return VOICE_WORDS[p[1]];
  if (p[0] === 'roads') return ROAD_WORDS[p[1]];
  if (p[0] === 'echo') return `echo phrases at level ${+p[1] + 1}`;
  if (p[0] === 'sing') return p[1].startsWith('line') ? `singing ${p[1].slice(4)}-note lines` : `singing the ${say('maj6', +p[1])}`;
  return key;
}
export const statGame = (key) => gameById(key.split('|')[0]);

// The things missed most, among those asked often enough to judge.
export function weakest(stats, max = 3) {
  return Object.entries(stats || {})
    .filter(([, s]) => s.n >= 4 && s.x / s.n >= 0.3)
    .sort(([, a], [, b]) => b.x / b.n - a.x / a.n || b.n - a.n)
    .slice(0, max)
    .map(([key, s]) => ({ key, label: statLabel(key), game: statGame(key), missed: s.x, asked: s.n }));
}
