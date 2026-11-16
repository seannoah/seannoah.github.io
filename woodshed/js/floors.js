// floors.js — the nine floors of the Elevator, as rules rather than stored diagrams.
//
// A shape is a list of scale steps above its lowest note. Because on and off notes
// alternate, two scale steps is "the next note of the same chord", so every shape
// here is made of even numbers and stays inside one chord (all on, or all off).
//
// Every floor has been checked against Thomas Echols's charts: thirds, triads, shells,
// octaves and drop 2 against the Elevator short lessons; drop 3, drop 2 and 4 and both
// double octaves against "The Elevator Sequence" (Episode 16), p. 5. The tests in
// tests/engine.test.mjs hold the fret numbers read from those charts.
//
// Two naming notes. Octave chords are named here for their lowest three notes, as in
// the Octave Chords short lesson (The Elevator Sequence names the same three voicings
// by their top three notes). The double octave has two versions, both "three notes of
// a drop 2 on the top four strings, plus a bass note": the one charted in The Elevator
// Sequence (`dbl`), and the one it calls the alternate voicing, which is also the one
// drawn in Foundations I fig. 11 and the Reference Library (`dbl.alt`).

import { OPEN, MAX_FRET, SCALES, keyOf, mod, semisAt, isOn } from './theory.js';

const adj = (n) => {
  const out = [];
  for (let top = 6; top - n + 1 >= 1; top--) out.push(Array.from({ length: n }, (_, i) => top - i));
  return out;
};

// `frame` is the floor's outside distance as a two-note shape of its own, and `span` is
// how that distance is spoken of: together they are the "elevator of intervals" (The
// Elevator Sequence, p. 7). From drop 2 upward the spans repeat an octave wider.
export const FLOORS = [
  { id: 'unison', name: 'Single notes', level: 1, shapes: ['unison'], span: 'a unison' },
  { id: 'thirds', name: 'Thirds', level: 2, shapes: ['thirds'], span: 'a third' },
  { id: 'triads', name: 'Triads', level: 3, shapes: ['triads'], frame: 'fifth', span: 'a fifth' },
  { id: 'shells', name: 'Shells', level: 4, shapes: ['shell.low', 'shell.high'], frame: 'sixth', span: 'a sixth' },
  { id: 'octaves', name: 'Octaves', level: 5, shapes: ['oct.triad', 'oct.low', 'oct.high'], frame: 'oct2', span: 'an octave' },
  { id: 'drop2', name: 'Drop 2', level: 6, shapes: ['drop2'], span: 'a third plus an octave' },
  { id: 'drop3', name: 'Drop 3', level: 7, shapes: ['drop3'], span: 'a fifth plus an octave' },
  { id: 'drop24', name: 'Drop 2 and 4', level: 8, shapes: ['drop24'], span: 'a sixth plus an octave' },
  { id: 'dbl', name: 'Double octaves', level: 9, shapes: ['dbl', 'dbl.alt'], span: 'two octaves' },
];

// Two strings with one string between them: where a sixth or an octave sits best.
const SKIP = [[6, 4], [5, 3], [4, 2], [3, 1]];

export const SHAPES = {
  unison: { id: 'unison', floor: 'unison', name: 'Single note', a: 'a single note', steps: [0], sets: adj(1), primary: [2] },
  thirds: { id: 'thirds', floor: 'thirds', name: 'Third', a: 'a third', steps: [0, 2], sets: adj(2), primary: [4, 3] },
  triads: { id: 'triads', floor: 'triads', name: 'Triad', a: 'a triad', steps: [0, 2, 4], sets: adj(3), primary: [4, 3, 2] },
  'shell.low': { id: 'shell.low', floor: 'shells', name: 'Low shell', a: 'a low shell', steps: [0, 2, 6], sets: adj(3), primary: [4, 3, 2] },
  'shell.high': { id: 'shell.high', floor: 'shells', name: 'High shell', a: 'a high shell', steps: [0, 4, 6], sets: adj(3), primary: [4, 3, 2] },
  'oct.triad': { id: 'oct.triad', floor: 'octaves', name: 'Octave (triad)', a: 'an octave chord with a triad below', steps: [0, 2, 4, 8], sets: adj(4), primary: [5, 4, 3, 2] },
  'oct.low': { id: 'oct.low', floor: 'octaves', name: 'Octave (low shell)', a: 'an octave chord with a low shell below', steps: [0, 2, 6, 8], sets: adj(4), primary: [5, 4, 3, 2] },
  'oct.high': { id: 'oct.high', floor: 'octaves', name: 'Octave (high shell)', a: 'an octave chord with a high shell below', steps: [0, 4, 6, 8], sets: adj(4), primary: [5, 4, 3, 2] },
  drop2: { id: 'drop2', floor: 'drop2', name: 'Drop 2', a: 'a drop 2', steps: [0, 4, 6, 10], sets: adj(4), primary: [5, 4, 3, 2] },
  drop3: { id: 'drop3', floor: 'drop3', name: 'Drop 3', a: 'a drop 3', steps: [0, 6, 10, 12], sets: [[6, 4, 3, 2], [5, 3, 2, 1]], primary: [6, 4, 3, 2] },
  drop24: { id: 'drop24', floor: 'drop24', name: 'Drop 2 and 4', a: 'a drop 2 and 4', steps: [0, 4, 10, 14], sets: [[6, 5, 3, 2], [5, 4, 2, 1]], primary: [6, 5, 3, 2] },
  dbl: { id: 'dbl', floor: 'dbl', name: 'Double octave', a: 'a double octave', steps: [0, 10, 12, 16], sets: [[6, 3, 2, 1]], primary: [6, 3, 2, 1] },
  'dbl.alt': { id: 'dbl.alt', floor: 'dbl', name: 'Double octave (alternate)', a: 'an alternate double octave', steps: [0, 6, 10, 16], sets: [[6, 4, 3, 1]], primary: [6, 4, 3, 1] },
  // The frames: the outside notes of a triad, a shell and an octave chord, on their own.
  // Like "thirds", they are counted in scale steps, so a "fifth" is four steps of the
  // eight-note scale and may measure a fourth, a tritone or a fifth on the fretboard.
  fifth: { id: 'fifth', floor: 'triads', frame: true, name: 'Fifth', a: 'a fifth', steps: [0, 4], sets: adj(2), primary: [4, 3] },
  sixth: { id: 'sixth', floor: 'shells', frame: true, name: 'Sixth', a: 'a sixth', steps: [0, 6], sets: SKIP, primary: [4, 2] },
  oct2: { id: 'oct2', floor: 'octaves', frame: true, name: 'Octave', a: 'a bare octave', steps: [0, 8], sets: SKIP, primary: [4, 2] },
};

export const setKey = (set) => set.join('');
export const setLabel = (set) => (set.length === 1 ? `string ${set[0]}` : set.length === 2 ? `strings ${set[0]} and ${set[1]}` : `strings ${set.join('-')}`);
export const floorOf = (shapeId) => FLOORS.find((f) => f.id === SHAPES[shapeId].floor);
// What to call a shape when it is one stop on a ride: its floor, or its own name for a frame.
export const stopName = (shapeId) => (SHAPES[shapeId].frame ? SHAPES[shapeId].name : floorOf(shapeId).name);

const MAX_SPAN = 5;

// Build one voicing with its lowest note at `fret` on the set's lowest string, or null.
function build(keyId, scaleId, shape, set, fret) {
  const key = keyOf(keyId);
  const bottomMidi = OPEN[set[0]] + fret;
  const bottomDeg = SCALES[scaleId].semis.indexOf(mod(bottomMidi - key.pc, 12));
  if (bottomDeg < 0) return null;
  const base = semisAt(scaleId, bottomDeg);
  const notes = shape.steps.map((st, i) => {
    const midi = bottomMidi + semisAt(scaleId, bottomDeg + st) - base;
    return { string: set[i], fret: midi - OPEN[set[i]], midi, deg: mod(bottomDeg + st, 8) };
  });
  if (notes.some((n) => n.fret < 0 || n.fret > MAX_FRET)) return null;
  const fretted = notes.map((n) => n.fret).filter((f) => f > 0);
  const minFret = fretted.length ? Math.min(...fretted) : 0;
  const maxFret = fretted.length ? Math.max(...fretted) : 0;
  if (maxFret - minFret > MAX_SPAN) return null;
  return {
    shape: shape.id, set, notes, on: isOn(bottomDeg),
    bottomDeg, topDeg: notes[notes.length - 1].deg,
    minFret, maxFret, lowFret: Math.min(...notes.map((n) => n.fret)),
  };
}

// Every playable position of a shape on a string set, low to high along the neck.
export function voicings(keyId, scaleId, shapeId, set) {
  const shape = SHAPES[shapeId];
  const out = [];
  for (let fret = 0; fret <= MAX_FRET; fret++) {
    const v = build(keyId, scaleId, shape, set, fret);
    if (v) out.push(v);
  }
  return out;
}

// The voicing whose top (or bottom) note is scale degree `deg`.
// Prefers a position off the open strings and below the 13th fret.
export function voicingFor(keyId, scaleId, shapeId, set, anchor, deg) {
  const all = voicings(keyId, scaleId, shapeId, set).filter((v) => (anchor === 'top' ? v.topDeg : v.bottomDeg) === deg);
  if (!all.length) return null;
  const score = (v) => (v.lowFret === 0 ? 20 : 0) + (v.maxFret > 13 ? 10 + v.maxFret : 0) + v.minFret * 0.1;
  return all.slice().sort((a, b) => score(a) - score(b))[0];
}

export const anchorNote = (v, anchor) => (anchor === 'top' ? v.notes[v.notes.length - 1] : v.notes[0]);

// The voicing whose top (or bottom) note is exactly this pitch, or null.
export function voicingAt(keyId, scaleId, shapeId, set, anchor, midi) {
  if (!set) return null;
  return voicings(keyId, scaleId, shapeId, set).find((v) => anchorNote(v, anchor).midi === midi) || null;
}

// The Elevator as one column: one shape per floor, smallest to largest. The shell and
// octave used are the ones charted first in The Elevator Sequence (pp. 3-4).
export const ELEVATOR = ['unison', 'thirds', 'triads', 'shell.low', 'oct.low', 'drop2', 'drop3', 'drop24', 'dbl'];
export const spanOf = (shapeId) => SHAPES[shapeId].steps[SHAPES[shapeId].steps.length - 1];

// The string set that puts a shape's top note on a given string.
export const setWithTop = (shapeId, string) => SHAPES[shapeId].sets.find((s) => s[s.length - 1] === string) || null;

// Other shapes on the same floor (the other shell, the other octave chords).
export const siblings = (shapeId) => (SHAPES[shapeId].frame ? [shapeId] : FLOORS.find((f) => f.id === SHAPES[shapeId].floor).shapes);

// The elevator of intervals as a column of two-note shapes.
export const INTERVALS = ['unison', 'thirds', 'fifth', 'sixth', 'oct2'];

// ---- floors within floors (The Elevator Sequence, p. 8) ----
// The small shapes that can be found inside a bigger one.
export const PARTS = ['thirds', 'fifth', 'sixth', 'triads', 'shell.low', 'shell.high'];

// Every way of choosing notes of `shapeId` that makes `partId`: lists of note indexes,
// counted from the lowest note. A triad holds two thirds; a drop 2 holds one, in the middle.
export function partsInside(shapeId, partId) {
  const steps = SHAPES[shapeId].steps;
  const want = SHAPES[partId].steps;
  if (want.length >= steps.length) return [];
  const out = [];
  const pick = (from, chosen) => {
    if (chosen.length === want.length) { out.push(chosen); return; }
    for (let i = from; i < steps.length; i++) {
      const k = chosen.length;
      if (k === 0 || steps[i] - steps[chosen[0]] === want[k]) pick(i + 1, [...chosen, i]);
    }
  };
  pick(0, []);
  return out;
}
export const insideOf = (shapeId) => PARTS.flatMap((part) => partsInside(shapeId, part).map((idx) => ({ part, idx })));

// Where a part sits in its chord, in words: "the middle two notes" (or, short, "middle two").
// Positions are never called "second" or "third", which already name notes of the scale.
export function partWhere(count, idx, short = false) {
  const n = idx.length;
  const word = n === 2 ? 'two' : 'three';
  const run = idx.every((x, k) => k === 0 || x === idx[k - 1] + 1);
  const say = (place) => (short ? `${place} ${word}` : `the ${place} ${word} notes`);
  if (run && idx[0] === 0) return say('bottom');
  if (run && idx[n - 1] === count - 1) return say('top');
  if (run) return say('middle');
  if (n === 2 && idx[0] === 0 && idx[1] === count - 1) return short ? 'outside two' : 'the two outside notes';
  const end = idx[0] === 0 ? 'bottom' : 'top';
  return short ? `${end}, and next but one` : `the ${end} note and the next but one`;
}
