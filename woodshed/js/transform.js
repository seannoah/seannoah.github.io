// transform.js — transformation: turning one 6th chord into another with the least
// movement, described by a short formula instead of chord names.
//
// A drop 2 major 6 or minor 6 chord can sit under the hand four ways, named for what is in
// the bass: root, third, fifth or sixth. Keep the hand in place and change what the bass
// note *is*, and you reach the other members of the chord's family: four chords of the same
// kind whose roots are a minor third apart. Drawn as a circle (root, third, fifth, sixth,
// clockwise), a move is:
//   forward   clockwise:        the bass becomes the next role, the chord is a minor third lower
//   backward  anti-clockwise:   the chord is a minor third higher
//   across                      the chord a tritone away
//   up / down                   the same shape one fret higher or lower: the next family
//   major / minor               raise or lower the third
// Any two 6th chords are related by exactly one such formula.
// Sources: Foundations I pp. 47-53; Foundations IV pp. 15-31.

import { mod, SCALES } from './theory.js';
import { voicings } from './floors.js';
import { scaleKey } from './harmony.js';

export const ROLES = [
  { id: 'r', deg: 0, name: 'root' },
  { id: '3', deg: 2, name: 'third' },
  { id: '5', deg: 4, name: 'fifth' },
  { id: '6', deg: 6, name: 'sixth' },
];
export const roleIndex = (id) => ROLES.findIndex((r) => r.id === String(id));
const SHIFT = { forward: -3, backward: 3, across: 6 };
const TURN = { forward: 1, backward: -1, across: 2 };
const BY_INTERVAL = [
  [null, null], [null, 'up'], ['backward', 'down'], ['backward', null], ['backward', 'up'], ['across', 'down'],
  ['across', null], ['across', 'up'], ['forward', 'down'], ['forward', null], ['forward', 'up'], [null, 'down'],
];

export const chord = (root, scale) => ({ root: mod(root, 12), scale });
export const chordLabel = (c) => `${scaleKey(c.root)}${SCALES[c.scale].suffix}`;
export const isSixth = (scale) => scale === 'maj6' || scale === 'min6';

// The formula that takes one 6th chord to another.
export function formulaBetween(from, to) {
  const [dir, family] = BY_INTERVAL[mod(to.root - from.root, 12)];
  return { dir, family, quality: to.scale === from.scale ? null : to.scale === 'maj6' ? 'major' : 'minor' };
}
export function applyFormula(c, f) {
  const root = c.root + (SHIFT[f.dir] || 0) + (f.family === 'up' ? 1 : f.family === 'down' ? -1 : 0);
  return chord(root, f.quality === 'major' ? 'maj6' : f.quality === 'minor' ? 'min6' : c.scale);
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export function formulaText(f) {
  const parts = [f.dir, f.family, f.quality].filter(Boolean).map(cap);
  return `[${parts.length ? parts.join(', ') : 'Stay'}]`;
}
// The same formula in a sentence.
export function formulaWords(f) {
  const parts = [];
  if (f.dir) parts.push(f.dir === 'across' ? 'across the circle' : `${f.dir} round the circle`);
  if (f.family) parts.push(`${f.family} a family (one fret)`);
  if (f.quality) parts.push(f.quality === 'major' ? 'minor becomes major' : 'major becomes minor');
  return parts.length ? parts.join(', ') : 'nothing moves';
}
// What is in the bass after moving round the circle.
export const roleAfter = (role, dir) => mod(role + (TURN[dir] || 0), 4);

// In one hand position the bass of some family members sits a fret higher: the "tall" ones.
export const tallRoles = (scale) => (scale === 'maj6' ? ['third', 'fifth'] : ['fifth']);

const sixths = (c, set) => voicings(scaleKey(c.root), c.scale, 'drop2', set).filter((v) => v.on);
export const roleOf = (v) => ROLES.findIndex((r) => r.deg === v.bottomDeg);

// A drop 2 voicing of a 6th chord with the given role in the bass, nearest fret `around`.
export function sixthVoicing(c, role, set = [5, 4, 3, 2], around = 5) {
  const all = sixths(c, set).filter((v) => v.bottomDeg === ROLES[role].deg);
  if (!all.length) return null;
  const far = (v) => (v.lowFret === 0 ? 100 : 0) + Math.abs(v.notes[0].fret - around);
  return all.sort((a, b) => far(a) - far(b))[0];
}

// From a voicing in the hand, the nearest voicing of the next chord with the right note in
// the bass. The bass never has to travel more than three frets; null if it runs off the neck.
export function follow(from, target, role, set = [5, 4, 3, 2]) {
  const near = sixths(target, set)
    .filter((v) => v.bottomDeg === ROLES[role].deg && Math.abs(v.notes[0].midi - from.notes[0].midi) <= 3)
    .sort((a, b) => Math.abs(a.notes[0].midi - from.notes[0].midi) - Math.abs(b.notes[0].midi - from.notes[0].midi));
  return near[0] || null;
}

// These are grips, so a position high on the neck is better than one that uses open strings.
const awkward = (v) => (v.lowFret === 0 ? 60 : 0) + (v.maxFret > 12 ? 20 + (v.maxFret - 12) * 5 : 0) + (v.maxFret > 15 ? 50 : 0);

// A run of transformations played in one place on the neck: a start chord with a role in
// the bass, then one formula after another. Returns one step per chord, or null.
export function transformChain(start, role, formulas, set = [5, 4, 3, 2]) {
  let best = null;
  for (const first of sixths(start, set).filter((v) => v.bottomDeg === ROLES[role].deg)) {
    const steps = [{ chord: start, role, voicing: first, formula: null, moves: null }];
    let cost = awkward(first) + Math.abs(first.minFret - 5);
    for (const f of formulas) {
      const prev = steps[steps.length - 1];
      const target = applyFormula(prev.chord, f);
      const nextRole = roleAfter(prev.role, f.dir);
      const v = follow(prev.voicing, target, nextRole, set);
      if (!v) { cost = Infinity; break; }
      cost += awkward(v);
      steps.push({ chord: target, role: nextRole, voicing: v, formula: f, moves: v.notes.map((n, i) => n.midi - prev.voicing.notes[i].midi) });
    }
    if (cost < Infinity && (!best || cost < best.cost)) best = { cost, steps };
  }
  return best ? best.steps : null;
}

// The two voicings of one transformation: a start chord with a role in the bass, and where
// the formula takes it. The bass moves as little as possible, so the hand stays in position.
export function transformPair(start, role, f, set = [5, 4, 3, 2]) {
  const steps = transformChain(start, role, [f], set);
  if (!steps) return null;
  const [a, b] = steps;
  return { from: a.voicing, to: b.voicing, fromChord: a.chord, toChord: b.chord, fromRole: a.role, toRole: b.role, formula: f, moves: b.moves };
}

// "+1, 0, −1, 0": how far each voice moved, low string to high.
export const movesText = (moves) => moves.map((m) => (m > 0 ? `+${m}` : m < 0 ? `−${-m}` : '0')).join(', ');

// ---- the moves worth knowing by name ----
// Each is given relative to the tonic of the key: [semitones above the tonic, kind of chord].
export const MOVES = {
  'ii-tm': { context: 'a major ii–V–I', from: [5, 'maj6'], to: [8, 'min6'], fromName: 'the ii chord (as its major 6)', toName: 'the tritone’s minor of the V chord' },
  'tm-I': { context: 'a major ii–V–I', from: [8, 'min6'], to: [0, 'maj6'], fromName: 'the tritone’s minor of the V chord', toName: 'the I chord' },
  'ii-on5': { context: 'a major ii–V–I', from: [5, 'maj6'], to: [2, 'min6'], fromName: 'the ii chord (as its major 6)', toName: 'the minor 6 on the 5 of the V chord' },
  'on5-I': { context: 'a major ii–V–I', from: [2, 'min6'], to: [0, 'maj6'], fromName: 'the minor 6 on the 5 of the V chord', toName: 'the I chord' },
  'on5-I5': { context: 'a major ii–V–I', from: [2, 'min6'], to: [7, 'maj6'], fromName: 'the minor 6 on the 5 of the V chord', toName: 'the I chord (as the major 6 on its 5)' },
  'tm-I5': { context: 'a major ii–V–I', from: [8, 'min6'], to: [7, 'maj6'], fromName: 'the tritone’s minor of the V chord', toName: 'the I chord (as the major 6 on its 5)' },
  'on5-tm': { context: 'a major ii–V–I', from: [2, 'min6'], to: [8, 'min6'], fromName: 'the minor 6 on the 5 of the V chord', toName: 'its tritone’s minor' },
  'iio-tm': { context: 'a minor ii–V–i', from: [5, 'min6'], to: [8, 'min6'], fromName: 'the half-diminished ii chord (as its minor 6)', toName: 'the tritone’s minor of the V chord', minor: true },
  'tm-i': { context: 'a minor ii–V–i', from: [8, 'min6'], to: [0, 'min6'], fromName: 'the tritone’s minor of the V chord', toName: 'the minor i chord', minor: true },
  'IV-iv': { context: 'a minor iv progression', from: [5, 'maj6'], to: [5, 'min6'], fromName: 'the IV chord', toName: 'the minor iv' },
  'iv-I': { context: 'a minor iv progression', from: [5, 'min6'], to: [0, 'maj6'], fromName: 'the minor iv', toName: 'the I chord' },
  'iv-I5': { context: 'a minor iv progression', from: [5, 'min6'], to: [7, 'maj6'], fromName: 'the minor iv', toName: 'the I chord (as the major 6 on its 5)' },
  'I-ii': { context: 'a major key', from: [0, 'maj6'], to: [5, 'maj6'], fromName: 'the I chord', toName: 'the ii chord (as its major 6)' },
  'I-iii': { context: 'the movement to iii', from: [0, 'maj6'], to: [9, 'min6'], fromName: 'the I chord', toName: 'the half-diminished chord on the sharp four (as its minor 6)' },
};
export const MOVE_IDS = Object.keys(MOVES);

// A named move in a key: its two chords and its formula.
export function moveIn(moveId, tonicPc) {
  const m = MOVES[moveId];
  const from = chord(tonicPc + m.from[0], m.from[1]);
  const to = chord(tonicPc + m.to[0], m.to[1]);
  return { ...m, id: moveId, fromChord: from, toChord: to, formula: formulaBetween(from, to) };
}

// The named move, if any, that two chords of a tune are an instance of: same kinds of chord,
// same formula. Returns the move and the tonic that makes it fit.
export function namedMove(from, to, prefer = []) {
  const ids = [...prefer, ...MOVE_IDS];
  for (const id of ids) {
    const m = MOVES[id];
    if (m.from[1] !== from.scale || m.to[1] !== to.scale) continue;
    if (mod(m.to[0] - m.from[0], 12) !== mod(to.root - from.root, 12)) continue;
    return { id, tonic: mod(from.root - m.from[0], 12) };
  }
  return null;
}

// Chains of moves that make whole progressions (Foundations IV's movements).
export const CHAINS = [
  { id: 'major-on5', name: 'Inside', long: 'Major ii–V–I by the minor 6 on the 5', steps: ['ii-on5', 'on5-I'], says: ['ii', 'V', 'I'] },
  { id: 'major-tm', name: 'Outside', long: 'Major ii–V–I by the tritone’s minor', steps: ['ii-tm', 'tm-I'], says: ['ii', 'V', 'I'] },
  { id: 'major-both', name: 'Both', long: 'Major ii–V–I with both minors on the V', steps: ['ii-on5', 'on5-tm', 'tm-I'], says: ['ii', 'V', 'V', 'I'] },
  { id: 'major-soft', name: 'Soft landing', long: 'Major ii–V–I landing on the major 6 on the 5', steps: ['ii-on5', 'on5-tm', 'tm-I5'], says: ['ii', 'V', 'V', 'I'] },
  { id: 'minor', name: 'Minor ii–V–i', long: 'Minor ii–V–i', steps: ['iio-tm', 'tm-i'], says: ['iiø', 'V', 'i'] },
  { id: 'minor-iv', name: 'Minor iv', long: 'IV, minor iv, I', steps: ['IV-iv', 'iv-I'], says: ['IV', 'iv', 'I'] },
  { id: 'to-ii', name: 'I to ii', long: 'From the I chord to the ii chord', steps: ['I-ii'], says: ['I', 'ii'] },
];
export const chainById = (id) => CHAINS.find((c) => c.id === id);

// A chain in a key, voiced: [{ chord, role, voicing, formula, moves, says }].
export function chainIn(chainId, tonicPc, role, set = [5, 4, 3, 2]) {
  const chain = chainById(chainId);
  const moves = chain.steps.map((id) => moveIn(id, tonicPc));
  const steps = transformChain(moves[0].fromChord, role, moves.map((m) => m.formula), set);
  return steps ? steps.map((st, i) => ({ ...st, says: chain.says[i] })) : null;
}
