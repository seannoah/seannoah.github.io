// subs.js — substitution, seen from the diminished chord at its center.
//
// The off chord of a key is a diminished 7 chord: the major seven, second, fourth and
// sharp five of the tonic. Move one of its notes one fret and it becomes a chord that
// leads home (Foundations I pp. 12-24 and 45-46, Foundations IV pp. 32-34 and 76):
//   raise a note  ->  a minor 6 chord, and the raised note is its fifth
//   lower a note  ->  a dominant 7 chord, and the lowered note is its root
// The same note raised or lowered gives a minor 6 and the dominant it is "on the 5" of.
//
//   sharp five    up: the minor 6 on the 5      down: the true dominant
//   second        up: the tritone's minor       down: the tritone substitute
//   major seven   up: the minor iv              down: the dominant that stands for it
//   fourth        up and down: the pair that leads to the relative minor instead
//   sharp five and second both down: the dominant 7♭5
//
// Also here: the other direction ("where can I use this chord?", Foundations I fig. 14),
// and chains of grips that move as little as possible (Foundations I pp. 43-47).

import { mod, SCALES, degOfMidi, stepMidi, scaleNotes, chordName } from './theory.js';
import { voicings } from './floors.js';
import { scaleKey } from './harmony.js';

const SET52 = [5, 4, 3, 2];
export const OFF_SAY = { 11: 'major seven', 2: 'second', 5: 'fourth', 8: 'sharp five' };
const OFF_DEG = { 11: 7, 2: 1, 5: 3, 8: 5 };     // where each off note sits in the eight-note scale

// Each post: which off notes move (semitones above the tonic, and which way), the chord
// that results (semitones above the tonic, kind), and the chart dominant it is a way of
// playing (`of`, semitones above the tonic).
export const POSTS = {
  on5: { name: 'minor 6 on the 5', moves: [[8, 1]], chord: [2, 'min6'], of: 7, inside: true },
  td: { name: 'true dominant', moves: [[8, -1]], chord: [7, 'dom7'], of: 7, inside: true },
  tm: { name: 'tritone’s minor', moves: [[2, 1]], chord: [8, 'min6'], of: 7 },
  tt: { name: 'tritone substitute', moves: [[2, -1]], chord: [1, 'dom7'], of: 7 },
  b5: { name: 'dominant 7♭5', moves: [[8, -1], [2, -1]], chord: [7, 'dom7b5'], of: 7 },
  iv: { name: 'minor iv', moves: [[11, 1]], chord: [5, 'min6'], of: 10 },
  bd: { name: 'minor iv’s dominant', moves: [[11, -1]], chord: [10, 'dom7'], of: 10 },
  rm: { name: 'minor 6 on the 5 of the relative minor’s dominant', moves: [[5, 1]], chord: [11, 'min6'], of: 4, away: true },
  rd: { name: 'relative minor’s dominant', moves: [[5, -1]], chord: [4, 'dom7'], of: 4, away: true },
};
export const POST_IDS = Object.keys(POSTS);
// The ways of playing the V chord, and the pairs made by one note going up or down.
export const V_POSTS = ['on5', 'td', 'tm', 'tt', 'b5'];
export const PAIRS = [['on5', 'td'], ['tm', 'tt'], ['iv', 'bd'], ['rm', 'rd']];

export const chordOf = (root, scale) => ({ root: mod(root, 12), scale });
export const nameOf = (c) => `${scaleKey(c.root)}${SCALES[c.scale].suffix}`;
const noteName = (c, midi) => scaleNotes(scaleKey(c.root), c.scale)[degOfMidi(scaleKey(c.root), c.scale, midi)].name;

// A post in a key: its chord, the dominant it stands for, and each note that moves.
export function postIn(id, tonicPc) {
  const p = POSTS[id];
  const key = scaleKey(tonicPc);
  const chord = chordOf(tonicPc + p.chord[0], p.chord[1]);
  return {
    ...p, id, chord, label: nameOf(chord),
    center: chordName(key, 'maj6', false),
    stands: nameOf(chordOf(tonicPc + p.of, 'dom7')),
    moves: p.moves.map(([semis, by]) => ({
      semis, by, say: OFF_SAY[semis],
      from: scaleNotes(key, 'maj6')[OFF_DEG[semis]].name,
      to: noteName(chord, tonicPc + semis + by),
      // what the moved note is in the new chord: the fifth of a minor 6, the root of a dominant
      becomes: SCALES[chord.scale].say[degOfMidi(scaleKey(chord.root), chord.scale, tonicPc + semis + by)],
    })),
  };
}

// A post in words: "the minor 6 on the 5 of G7", "the true dominant", "the minor iv".
export const postPhrase = (post) => (['td', 'b5', 'iv', 'bd'].includes(post.id) ? `the ${post.name}`
  : post.id === 'rd' ? 'the dominant of the relative minor'
  : post.id === 'rm' ? `the minor 6 on the 5 of ${post.stands}`
  : `the ${post.name} of ${post.stands}`);
// What was done to the off chord, as a sentence or two.
export function postStory(post) {
  const how = post.moves.map((m) => `${m.by > 0 ? 'raise' : 'lower'} the ${m.say}, ${m.from} to ${m.to}`).join(', and ');
  const last = post.moves.length > 1 ? 'They become its root and its flat five.'
    : `The ${post.moves[0].by > 0 ? 'raised' : 'lowered'} note is its ${post.moves[0].becomes}.`;
  return `${how.charAt(0).toUpperCase()}${how.slice(1)}: ${post.label}, ${postPhrase(post)}. ${last}`;
}
// The post a chart reading names ("tritone's minor"), if it is one.
const BY_HOW = { 'minor 6 on the 5': 'on5', "tritone's minor": 'tm', 'true dominant': 'td', 'tritone substitute': 'tt', 'dominant 7♭5': 'b5' };
export const postOfHow = (how) => BY_HOW[how] || null;

// The post reached by moving one off note (semitones above the tonic) up or down a fret.
export const postFor = (semis, by) => POST_IDS.find((id) => POSTS[id].moves.length === 1 && POSTS[id].moves[0][0] === semis && POSTS[id].moves[0][1] === by);

// The off chord of a key as drop 2 grips with a chosen off note in the bass
// (pos 0-3: major seven, second, fourth, sharp five).
const centers = (tonicPc, pos, set) => voicings(scaleKey(tonicPc), 'maj6', 'drop2', set).filter((v) => !v.on && v.bottomDeg === [7, 1, 3, 5][pos]);

// The move on the neck: the off chord, the chord a post turns it into (each note named
// in its new chord), which voices moved, and the tonic chord it resolves to. Of the
// places the off chord can be played, the one that keeps every finger on a fret wins.
export function hubPair(tonicPc, id, pos, set = SET52, around = 6) {
  const key = scaleKey(tonicPc);
  const post = postIn(id, tonicPc);
  const tkey = scaleKey(post.chord.root);
  let best = null;
  for (const center of centers(tonicPc, pos, set)) {
    const moved = [];
    const notes = center.notes.map((n, i) => {
      const mv = POSTS[id].moves.find(([semis]) => mod(n.midi - tonicPc, 12) === semis);
      const by = mv ? mv[1] : 0;
      if (mv) moved.push(i);
      return { string: n.string, fret: n.fret + by, midi: n.midi + by, deg: degOfMidi(tkey, post.chord.scale, n.midi + by) };
    });
    const frets = [...center.notes, ...notes].map((n) => n.fret);
    if (Math.min(...frets) < 0) continue;
    const cost = (Math.min(...frets) === 0 ? 40 : 0) + (Math.max(...frets) > 13 ? 15 + Math.max(...frets) : 0) + Math.abs(center.minFret - around);
    if (!best || cost < best.cost) best = { cost, center, notes, moved };
  }
  if (!best) return null;
  const { center, notes, moved } = best;
  const ons = voicings(key, 'maj6', 'drop2', set).filter((v) => v.on);
  const bass = center.notes[0].midi;
  const home = ons.find((v) => v.notes[0].midi === stepMidi(key, 'maj6', bass, -1) && v.lowFret > 0)
    || ons.find((v) => v.notes[0].midi === stepMidi(key, 'maj6', bass, 1)) || null;
  return { key, post, center, to: { notes, set, chord: post.chord, label: post.label }, moved, home };
}

// ---- one chord, many jobs ----
// Where a chord can be used. `to` is the root of the chart chord it serves, in semitones
// above its own root; with `leads`, it is the chord it resolves to instead.
export const JOBS = {
  maj6: [
    { id: 'self', to: 0, symbol: '6', line: 'the chord itself, as a I chord or a IV chord' },
    { id: 'm7', to: 9, symbol: 'm7', line: 'a minor 7 chord with the same four notes', ask: 'has the same four notes as which minor 7 chord?' },
    { id: 'on5', to: 5, symbol: 'maj7', line: 'the major 6 on the 5 of a major chord, for a major 9 sound', ask: 'is the major 6 on the 5 of which chord?' },
  ],
  min6: [
    { id: 'self', to: 0, symbol: 'm6', line: 'the chord itself, as a minor i chord or a minor iv' },
    { id: 'hdim', to: 9, symbol: 'm7♭5', line: 'a half-diminished chord with the same four notes', ask: 'has the same four notes as which half-diminished chord?' },
    { id: 'on5', to: 5, symbol: '7', line: 'the minor 6 on the 5 of a dominant, a 9 chord without its root', ask: 'is the minor 6 on the 5 of which dominant?' },
    { id: 'tm', to: 11, symbol: '7', line: 'the tritone’s minor of a dominant', ask: 'is the tritone’s minor of which dominant?' },
    { id: 'iv', to: 7, symbol: '6', leads: true, line: 'the minor iv on the way home to a major chord', ask: 'is the minor iv on the way home to which chord?' },
  ],
  dom7: [
    { id: 'self', to: 0, symbol: '7', line: 'the chord itself, as a V chord' },
    { id: 'tt', to: 6, symbol: '7', line: 'the tritone substitute of another dominant', ask: 'is the tritone substitute of which dominant?' },
    { id: 'bd', to: 2, symbol: '6', leads: true, line: 'the minor iv’s dominant, resolving up a whole step', ask: 'resolves up a whole step, as the minor iv’s dominant, to which chord?' },
  ],
};
export const jobById = (scale, id) => JOBS[scale].find((j) => j.id === id);
// The jobs of a chord, each with the chart chord it serves spelled out.
export function jobsOf(chord) {
  return JOBS[chord.scale].map((j) => ({ ...j, root: mod(chord.root + j.to, 12), label: `${scaleKey(chord.root + j.to)}${j.symbol}` }));
}

// ---- grips that move as little as possible ----
const grips = (c, set) => voicings(scaleKey(c.root), c.scale, 'drop2', set).filter((v) => v.on);
// Open strings and the top of the neck are allowed when a chain needs them, at a price.
const awkward = (v) => (v.lowFret === 0 ? 2 : 0) + (v.maxFret > 14 ? 3 : 0);

// A chord progression as a chain of drop 2 grips: the first with a chosen note in the bass
// (0-3, counting up the chord from its root), each later one the nearest grip of its chord.
// Where the first chord can be played in two places, the one whose whole chain is easier wins.
export function gripChain(chords, bass = 0, set = SET52, around = 5) {
  let best = null;
  for (const first of grips(chords[0], set).filter((v) => v.bottomDeg === bass * 2)) {
    const out = [first];
    let cost = awkward(first) + Math.abs(first.minFret - around) * 0.3;
    for (const c of chords.slice(1)) {
      const prev = out[out.length - 1];
      // each step is simply the nearest grip; how awkward it is only counts toward choosing where to start
      const far = (v) => v.notes.reduce((sum, n, i) => sum + Math.abs(n.fret - prev.notes[i].fret), 0);
      const next = grips(c, set).sort((x, y) => far(x) - far(y) || awkward(x) - awkward(y))[0];
      cost += far(next) + awkward(next);
      out.push(next);
    }
    if (!best || cost < best.cost) best = { cost, out };
  }
  if (!best) return null;
  const { out } = best;
  return out.map((voicing, i) => ({ voicing, chord: chords[i], label: nameOf(chords[i]), moves: i ? voicing.notes.map((n, k) => n.fret - out[i - 1].notes[k].fret) : null }));
}

// The first eight bars of Take the "A" Train as Foundations I plays them (Substitution
// Ex. 4): each chart chord, and the chord that stands in for it. Roots are semitones above
// the key.
export const A_TRAIN = [
  { bars: 'Bars 1–2', chart: [0, '6'], chord: [0, 'maj6'], how: 'the I chord' },
  { bars: 'Bars 3–4', chart: [2, '7'], chord: [9, 'min6'], how: 'the minor 6 on the 5' },
  { bars: 'End of bar 4', chart: null, chord: [0, 'dim'], how: 'a passing diminished chord' },
  { bars: 'Bar 5', chart: [2, 'm7'], chord: [5, 'maj6'], how: 'the major 6 with the same four notes' },
  { bars: 'Bar 6', chart: [7, '7'], chord: [8, 'min6'], how: 'the tritone’s minor' },
  { bars: 'Bar 7', chart: [0, '6'], chord: [0, 'maj6'], how: 'home' },
];
export function aTrain(tonicPc, bass = 0, set = SET52) {
  const chain = gripChain(A_TRAIN.map((s) => chordOf(tonicPc + s.chord[0], s.chord[1])), bass, set);
  return chain && chain.map((st, i) => ({ ...A_TRAIN[i], ...st, chartLabel: A_TRAIN[i].chart ? `${scaleKey(tonicPc + A_TRAIN[i].chart[0])}${A_TRAIN[i].chart[1]}` : null }));
}
