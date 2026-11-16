// moves.js — the method's moves as things an instrument can do between one chord and the next.
//
// Everything is counted in scale steps. A chord is a list of steps, low to high; its last
// entry is the melody note.
//
//   motion     what the outer voices do when the melody moves (parallel, contrary, oblique)
//   borrowing  one voice steps to its neighbor on the path, and back
//   family     the brothers and sisters of a 6th chord, and the formula between any two
//   stations   the chords round a home key that lead back to it (substitution)

import { harmony, mod, isOn, SCALES, keyName, chordLabel, nearestStep, midiAt } from './theory.js';
import { FLOORS, shapeOn, shapeSteps } from './floors.js';

// ---------- motion ----------
// The Elevator rule: under the same melody note, each floor up puts the bass one chord
// note (two scale steps) lower. So, with the melody moving `delta` steps:
//   bass move = melody move - 2 x floors climbed
export const MOTIONS = ['parallel', 'contrary', 'oblique'];
export const bassMove = (melody, floors) => melody - 2 * floors;

const clampFloor = (i) => Math.max(0, Math.min(FLOORS.length - 1, i));

// The chord for a new melody note, given the chord before it and the kind of motion wanted.
//   parallel  the floor stays, so the bass follows the melody
//   contrary  the floor grows as the melody rises and shrinks as it falls, so the bass
//             goes the other way
//   oblique   the bass holds: by a change of floor when the melody leaps inside the
//             chord, otherwise by keeping the lower voices and moving only the melody
// prev: { steps, floor } or null. Returns { steps, floor, shape } (shape is null for a
// chord that is not one of the floors).
export function nextChord(mode, prev, topN, floor, variants = {}) {
  const plain = (f) => ({ steps: shapeSteps(shapeOn(f, variants), topN), floor: f, shape: shapeOn(f, variants) });
  if (!prev || mode === 'parallel') return plain(floor);
  const delta = topN - prev.steps[prev.steps.length - 1];
  if (delta === 0) return plain(floor);
  if (mode === 'contrary') {
    const want = floor + Math.sign(delta) * Math.ceil((Math.abs(delta) + 1) / 2);
    return plain(clampFloor(want));
  }
  // oblique
  if (delta % 2 === 0) {
    const want = floor + delta / 2;
    if (want >= 0 && want < FLOORS.length) {
      const next = plain(want);
      if (next.steps[0] === prev.steps[0]) return next;
    }
  }
  const held = prev.steps.slice(0, -1).filter((n) => n < topN);
  return { steps: [...held, topN], floor, shape: held.length ? null : shapeOn(0, variants) };
}

// What the outer voices did between two chords.
export function describeMotion(from, to) {
  const top = to[to.length - 1] - from[from.length - 1];
  const bass = to[0] - from[0];
  const motion = top === 0 && bass === 0 ? 'none' : top === 0 || bass === 0 ? 'oblique' : Math.sign(top) === Math.sign(bass) ? 'parallel' : 'contrary';
  return { top, bass, motion };
}

const COUNT = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
export function voiceWords(n) {
  if (n === 0) return 'holds';
  const way = n > 0 ? 'up' : 'down';
  const size = Math.abs(n);
  if (size === 1) return `steps ${way}`;
  if (size === 2) return `leaps ${way} to the next note of the chord`;
  return `leaps ${way} ${COUNT[size] || size} steps`;
}
export const motionWords = (d) => (d.motion === 'none' ? '' : `Melody ${voiceWords(d.top)}, bass ${voiceWords(d.bass)}: ${d.motion}.`);

// ---------- the mirror ----------
// The outside distances of the floors repeat an octave wider: thirds and drop 2, triads
// and drop 3, shells and drop 2 and 4, octaves and double octaves (and a single note with
// an octave chord). Each is the reflection of the other: under the same melody note, the
// same bass note an octave away. Playing the reflection of the floor that is due is a pivot.
export const reflect = (floorIndex) => (floorIndex <= 4 ? floorIndex + 4 : floorIndex - 4);

// ---------- carrying a chord into a new harmony ----------
// Transformation heard from the inside: the same shape, beneath whichever note of the new
// chord moves the voices least. `midis` is the chord as it sounds now, low to high; `on`
// keeps an on chord on and an off chord off.
export function carry(midis, shapeId, h, on = true) {
  const want = on ? 'on' : 'off';
  const near = nearestStep(h, midis[midis.length - 1], want);
  let best = null;
  for (const top of [near, near - 2, near + 2]) {
    const steps = shapeSteps(shapeId, top);
    // compare voice with voice, counting from the melody down
    let cost = 0;
    for (let k = 1; k <= Math.min(steps.length, midis.length); k++) cost += Math.abs(midiAt(h, steps[steps.length - k]) - midis[midis.length - k]);
    cost += 0.01 * Math.abs(midiAt(h, top) - midis[midis.length - 1]);
    if (!best || cost < best.cost) best = { cost, top, steps };
  }
  return { top: best.top, steps: best.steps };
}

// ---------- borrowing ----------
// Voices are named from the top down, as you hear them.
export const VOICES = {
  1: ['top'],
  2: ['top', 'bottom'],
  3: ['top', 'middle', 'bottom'],
  4: ['top', 'upper middle', 'lower middle', 'bottom'],
};
export const voiceName = (count, fromTop) => (VOICES[count] || VOICES[4])[Math.min(fromTop, count - 1)] || 'top';

// A chord with one voice (counted from the top, 0 = top) moved one scale step up or down.
// Null when the voice would land on, or cross, the voice next to it.
export function borrow(steps, fromTop, dir) {
  const i = steps.length - 1 - fromTop;
  if (i < 0 || i >= steps.length) return null;
  const moved = steps[i] + dir;
  if ((i > 0 && moved <= steps[i - 1]) || (i < steps.length - 1 && moved >= steps[i + 1])) return null;
  return steps.map((n, k) => (k === i ? moved : n));
}

// Several voices leaning at once. `leans` maps a voice (counted from the top) to +1 or -1.
// They are moved from the top down, and one that would land on its neighbor stays put.
export function leanAll(steps, leans) {
  let out = steps;
  for (const voice of Object.keys(leans).map(Number).sort((a, b) => a - b)) {
    const moved = borrow(out, voice, leans[voice]);
    if (moved) out = moved;
  }
  return out;
}

// An on chord kept beneath an off melody note (or the reverse): the shape that belongs
// under the note next to it, with its top voice moved to the melody. `from` = 1 uses the
// note above (the top voice borrows below), -1 the note below.
export function underBorrowed(shapeId, topN, from = 1) {
  const steps = shapeSteps(shapeId, topN + from);
  if (steps.length === 1) return [topN];
  steps[steps.length - 1] = topN;
  return steps;
}

// ---------- the family of a 6th chord ----------
// Four 6th chords a minor third apart share one place under the hand. Drawn as a circle
// (root, third, fifth, sixth in the bass), a move is:
//   forward    the chord a minor third lower      backward  a minor third higher
//   across     the chord a tritone away
//   up / down  the next family: the same shape a half step higher or lower
//   major / minor   raise or lower the third
// Any two 6th chords are joined by exactly one such formula.
const SHIFT = { forward: -3, backward: 3, across: 6, up: 1, down: -1 };
const BY_INTERVAL = [
  [null, null], [null, 'up'], ['backward', 'down'], ['backward', null], ['backward', 'up'], ['across', 'down'],
  ['across', null], ['across', 'up'], ['forward', 'down'], ['forward', null], ['forward', 'up'], [null, 'down'],
];
export const FAMILY_MOVES = ['backward', 'forward', 'across', 'down', 'up', 'major', 'minor'];
export const isSixth = (scale) => scale === 'maj6' || scale === 'min6';

export function familyMove(h, move) {
  if (move === 'major' || move === 'minor') {
    if (!isSixth(h.scale)) return null;
    return harmony(h.root, move === 'major' ? 'maj6' : 'min6');
  }
  if (!(move in SHIFT)) return null;
  return harmony(h.root + SHIFT[move], h.scale);
}

export function formulaBetween(from, to) {
  const [dir, family] = BY_INTERVAL[mod(to.root - from.root, 12)];
  return { dir, family, quality: to.scale === from.scale ? null : to.scale === 'maj6' ? 'major' : to.scale === 'min6' ? 'minor' : null };
}
export function applyFormula(h, f) {
  const root = h.root + (SHIFT[f.dir] || 0) + (SHIFT[f.family] || 0);
  return harmony(root, f.quality === 'major' ? 'maj6' : f.quality === 'minor' ? 'min6' : h.scale);
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export function formulaText(f) {
  const parts = [f.dir, f.family, f.quality].filter(Boolean).map(cap);
  return `[${parts.length ? parts.join(', ') : 'Stay'}]`;
}
// The four members of a chord's family, starting with the chord itself and going forward.
export const familyOf = (h) => [0, -3, -6, -9].map((s) => harmony(h.root + s, h.scale));

// ---------- stations: the chords round a home key ----------
// The off chord of a key is a diminished 7: the major seven, second, fourth and sharp five
// of the tonic. Move one of its notes a half step and it becomes a chord that leads home:
//   raise a note -> a minor 6 chord        lower a note -> a dominant 7 chord
// `bass` is the root a bass player keeps underneath (the dominant's, or the ii chord's),
// which is what lets the substitution be heard for what it is.
const STATION_DEFS = {
  home: { name: 'Home', short: 'home', at: 0, bass: 0 },
  ii: { name: 'The ii, as its major 6', short: 'the ii, by its other name', at: 5, scale: 'maj6', bass: 2, how: 'A minor 7 chord has the same four notes as the major 6 a minor third above it.' },
  iio: { name: 'The ii, as its minor 6', short: 'the ii, by its other name', at: 5, scale: 'min6', bass: 2, how: 'A half-diminished chord has the same four notes as the minor 6 a minor third above it.' },
  iv: { name: 'Minor iv', short: 'minor iv', at: 5, scale: 'min6', bass: 5, how: 'The off chord with its major seven raised. The wistful road home.' },
  rel: { name: 'Relative major', short: 'relative major', at: 3, scale: 'maj6', bass: 3, how: 'The major 6 a minor third above a minor home.' },
  on5: { name: 'Minor 6 on the 5', short: 'minor 6 on the 5', at: 2, scale: 'min6', bass: 7, how: 'The off chord with its sharp five raised. Every note stays in the key.' },
  tm: { name: 'Tritone’s minor', short: 'tritone’s minor', at: 8, scale: 'min6', bass: 7, how: 'The off chord with its second raised. The darkest road home.' },
  td: { name: 'True dominant', short: 'true dominant', at: 7, scale: 'dom7', bass: 7, how: 'The off chord with its sharp five lowered: the V chord itself.' },
  tt: { name: 'Tritone substitute', short: 'tritone substitute', at: 1, scale: 'dom7', bass: 1, how: 'The off chord with its second lowered: the dominant a tritone from the V.' },
  b5: { name: 'Dominant 7♭5', short: 'dominant 7♭5', at: 7, scale: 'dom7b5', bass: 7, how: 'The off chord with its sharp five and its second both lowered.' },
};
const MAJOR_STATIONS = ['home', 'ii', 'iv', 'on5', 'tm', 'td', 'tt', 'b5'];
const MINOR_STATIONS = ['home', 'iio', 'rel', 'on5', 'tm', 'td', 'tt', 'b5'];
// The ways of playing the V chord.
export const V_POSTS = ['on5', 'tm', 'td', 'tt', 'b5'];

export function stations(home) {
  const ids = home.scale === 'min6' ? MINOR_STATIONS : MAJOR_STATIONS;
  return ids.map((id) => {
    const d = STATION_DEFS[id];
    const h = harmony(home.root + d.at, d.scale || home.scale, { bass: mod(home.root + d.bass, 12) });
    return { id, name: d.name, short: d.short, how: d.how || '', label: chordLabel(h), dominant: V_POSTS.includes(id), h };
  });
}
export const stationOf = (home, h) => stations(home).find((s) => s.h.root === h.root && s.h.scale === h.scale) || null;

// "D minor 6 diminished, the minor 6 on the 5 of G7": what a station is, in a phrase.
export function stationPhrase(home, st) {
  const five = `${keyName(home.root + 7)}7`;
  if (st.id === 'home') return 'home';
  if (st.id === 'on5' || st.id === 'tm' || st.id === 'tt') return `the ${st.name.toLowerCase()} of ${five}`;
  if (st.id === 'td') return `the true dominant, ${five}`;
  if (st.id === 'b5') return `${five} with a flat five`;
  if (st.id === 'ii' || st.id === 'iio') return `the ii chord, ${keyName(home.root + 2)}${st.id === 'ii' ? 'm7' : 'm7♭5'}, by its other name`;
  return st.name.toLowerCase();
}

export const scaleShort = (h) => `${keyName(h.root, h.sharp)} ${SCALES[h.scale].short}`;
export { isOn };
