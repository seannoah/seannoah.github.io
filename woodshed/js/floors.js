// floors.js — the nine floors of the Elevator, as rules rather than stored diagrams.
//
// A shape is a list of scale steps above its lowest note. Because on and off notes
// alternate, two scale steps is "the next note of the same chord", so every shape
// here is made of even numbers and stays inside one chord (all on, or all off).
//
// Thirds, triads, shells, octaves and drop 2 were checked against the charts in the
// Elevator short lessons; drop 2 and 4 against the Reference Library. Drop 3 and
// double octaves have no full chart in the materials, so they are derived from the
// voicing definitions and checked against the two example diagrams of each
// (Foundations I fig. 11 and Reference Library p. 4). They are marked `derived`.

import { OPEN, MAX_FRET, SCALES, keyOf, mod, semisAt, isOn } from './theory.js';

const adj = (n) => {
  const out = [];
  for (let top = 6; top - n + 1 >= 1; top--) out.push(Array.from({ length: n }, (_, i) => top - i));
  return out;
};

export const FLOORS = [
  { id: 'unison', name: 'Single notes', level: 1, shapes: ['unison'] },
  { id: 'thirds', name: 'Thirds', level: 2, shapes: ['thirds'] },
  { id: 'triads', name: 'Triads', level: 3, shapes: ['triads'] },
  { id: 'shells', name: 'Shells', level: 4, shapes: ['shell.low', 'shell.high'] },
  { id: 'octaves', name: 'Octaves', level: 5, shapes: ['oct.triad', 'oct.low', 'oct.high'] },
  { id: 'drop2', name: 'Drop 2', level: 6, shapes: ['drop2'] },
  { id: 'drop3', name: 'Drop 3', level: 7, shapes: ['drop3'] },
  { id: 'drop24', name: 'Drop 2 and 4', level: 8, shapes: ['drop24'] },
  { id: 'dbl', name: 'Double octaves', level: 9, shapes: ['dbl'] },
];

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
  drop3: { id: 'drop3', floor: 'drop3', name: 'Drop 3', a: 'a drop 3', steps: [0, 6, 10, 12], sets: [[6, 4, 3, 2], [5, 3, 2, 1]], primary: [6, 4, 3, 2], derived: true },
  drop24: { id: 'drop24', floor: 'drop24', name: 'Drop 2 and 4', a: 'a drop 2 and 4', steps: [0, 4, 10, 14], sets: [[6, 5, 3, 2], [5, 4, 2, 1]], primary: [6, 5, 3, 2] },
  dbl: { id: 'dbl', floor: 'dbl', name: 'Double octave', a: 'a double octave', steps: [0, 6, 10, 16], sets: [[6, 4, 3, 1]], primary: [6, 4, 3, 1], derived: true },
};

export const setKey = (set) => set.join('');
export const setLabel = (set) => (set.length === 1 ? `string ${set[0]}` : `strings ${set.join('-')}`);
export const floorOf = (shapeId) => FLOORS.find((f) => f.id === SHAPES[shapeId].floor);

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
