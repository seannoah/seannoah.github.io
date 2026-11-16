// floors.js — the nine floors of the Elevator, as rules.
//
// A shape is a list of scale steps above its lowest note. Because on and off notes
// alternate, two scale steps is "the next note of the same chord", so every shape here
// is made of even numbers and stays inside one chord (all on, or all off).
//
// The shapes are the ones Woodshed checks against the course charts. Here they are
// voiced as pitches under a melody note instead of as frets on strings.

import { midiAt, mod, isOn, REGISTER } from './theory.js';

export const SHAPES = {
  unison: { id: 'unison', floor: 'unison', name: 'Single note', steps: [0] },
  thirds: { id: 'thirds', floor: 'thirds', name: 'Third', steps: [0, 2] },
  triads: { id: 'triads', floor: 'triads', name: 'Triad', steps: [0, 2, 4] },
  'shell.low': { id: 'shell.low', floor: 'shells', name: 'Low shell', steps: [0, 2, 6] },
  'shell.high': { id: 'shell.high', floor: 'shells', name: 'High shell', steps: [0, 4, 6] },
  'oct.triad': { id: 'oct.triad', floor: 'octaves', name: 'Octave, triad below', steps: [0, 2, 4, 8] },
  'oct.low': { id: 'oct.low', floor: 'octaves', name: 'Octave, low shell below', steps: [0, 2, 6, 8] },
  'oct.high': { id: 'oct.high', floor: 'octaves', name: 'Octave, high shell below', steps: [0, 4, 6, 8] },
  drop2: { id: 'drop2', floor: 'drop2', name: 'Drop 2', steps: [0, 4, 6, 10] },
  drop3: { id: 'drop3', floor: 'drop3', name: 'Drop 3', steps: [0, 6, 10, 12] },
  drop24: { id: 'drop24', floor: 'drop24', name: 'Drop 2 and 4', steps: [0, 4, 10, 14] },
  dbl: { id: 'dbl', floor: 'dbl', name: 'Double octave', steps: [0, 10, 12, 16] },
  'dbl.alt': { id: 'dbl.alt', floor: 'dbl', name: 'Double octave, alternate', steps: [0, 6, 10, 16] },
};

// `span` is how the floor's outside distance is spoken of: the "elevator of intervals".
// From drop 2 upward the spans repeat an octave wider.
export const FLOORS = [
  { id: 'unison', name: 'Single notes', short: 'Single', level: 1, shapes: ['unison'], span: 'a unison' },
  { id: 'thirds', name: 'Thirds', short: 'Thirds', level: 2, shapes: ['thirds'], span: 'a third' },
  { id: 'triads', name: 'Triads', short: 'Triads', level: 3, shapes: ['triads'], span: 'a fifth' },
  { id: 'shells', name: 'Shells', short: 'Shells', level: 4, shapes: ['shell.low', 'shell.high'], span: 'a sixth' },
  { id: 'octaves', name: 'Octaves', short: 'Octaves', level: 5, shapes: ['oct.low', 'oct.triad', 'oct.high'], span: 'an octave' },
  { id: 'drop2', name: 'Drop 2', short: 'Drop 2', level: 6, shapes: ['drop2'], span: 'a third plus an octave' },
  { id: 'drop3', name: 'Drop 3', short: 'Drop 3', level: 7, shapes: ['drop3'], span: 'a fifth plus an octave' },
  { id: 'drop24', name: 'Drop 2 and 4', short: 'Drop 2+4', level: 8, shapes: ['drop24'], span: 'a sixth plus an octave' },
  { id: 'dbl', name: 'Double octaves', short: 'Double', level: 9, shapes: ['dbl', 'dbl.alt'], span: 'two octaves' },
];
export const floorIndexOf = (shapeId) => FLOORS.findIndex((f) => f.id === SHAPES[shapeId].floor);
export const spanOf = (shapeId) => SHAPES[shapeId].steps[SHAPES[shapeId].steps.length - 1];

// The shape used on a floor: the first one, unless a variant is chosen for that floor
// (`variants` maps floor id to an index into its shapes: the other shell, the other octaves).
export function shapeOn(floorIndex, variants = {}) {
  const floor = FLOORS[Math.max(0, Math.min(FLOORS.length - 1, floorIndex))];
  return floor.shapes[mod(variants[floor.id] || 0, floor.shapes.length)];
}

// The scale steps of a shape with its top note on step `topN`, low to high.
export function shapeSteps(shapeId, topN) {
  const steps = SHAPES[shapeId].steps;
  const span = steps[steps.length - 1];
  return steps.map((st) => topN - span + st);
}

// Scale steps as sounding notes in a harmony: [{ n, midi, deg, on }], low to high.
export function realize(h, steps, floor = REGISTER) {
  return steps.map((n) => ({ n, midi: midiAt(h, n, floor), deg: mod(n, 8), on: isOn(n) }));
}

// A floor's chord beneath a melody note.
export const voicing = (h, shapeId, topN, floor = REGISTER) => realize(h, shapeSteps(shapeId, topN), floor);

// ---- floors within floors ----
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

// The name of a set of scale steps, when it is one of the shapes ("Drop 2"), else null.
export function shapeOfSteps(steps) {
  const rel = steps.map((n) => n - steps[0]).join(',');
  const hit = Object.values(SHAPES).find((s) => s.steps.join(',') === rel);
  return hit ? hit.id : null;
}
