// bass.js — a bass line written as jobs ("root", "fifth", "walk") and turned into notes
// against whatever harmony is sounding. The bass keeps the root a bass player would keep:
// under F major 6 standing for Dm7 it plays D, and under D minor 6 standing for G7 it
// plays G, which is what lets a substitution be heard for what it is.

import { mod, chordPcs } from './theory.js';

export const BASS_FLOOR = 33; // A1: roots sit in the octave above this

// Jobs a step of the bass lane can hold.
export const ROLES = [
  { id: 'R', name: 'Root' },
  { id: '5', name: 'Fifth' },
  { id: '3', name: 'Third' },
  { id: '7', name: 'Seventh' },
  { id: '8', name: 'Octave' },
  { id: 'a', name: 'Approach' },
  { id: 'N', name: 'Next root' },
  { id: 'W', name: 'Walk' },
];
export const ROLE_IDS = ROLES.map((r) => r.id);

const BY_FAMILY = {
  maj: [4, 7, 9], dom: [4, 7, 10], dom7b5: [4, 6, 10], min7: [3, 7, 10], min6: [3, 7, 9], hdim: [3, 6, 10], dim: [3, 6, 9],
};

export const bassRootPc = (h) => mod(h.bass != null ? h.bass : h.root, 12);

// The third, fifth and seventh a bass line uses over a harmony, in semitones above its
// bass root. From the chart chord's kind when there is one; otherwise read off the notes
// of the on chord, so the line agrees with the substitution being played.
export function bassTones(h) {
  if (h.family && BY_FAMILY[h.family]) {
    const [third, fifth, seventh] = BY_FAMILY[h.family];
    return { third, fifth, seventh };
  }
  const root = bassRootPc(h);
  const have = new Set(chordPcs(h, true).map((pc) => mod(pc - root, 12)));
  const first = (list, fallback) => list.find((s) => have.has(s)) ?? fallback;
  return { third: first([4, 3], 4), fifth: first([7, 6, 8], 7), seventh: first([10, 11, 9], 10) };
}

export const bassRootMidi = (h, floor = BASS_FLOOR) => floor + mod(bassRootPc(h) - floor, 12);

// The pitch nearest to `near` that has pitch class `pc`.
export function nearestPc(pc, near) {
  const up = near + mod(pc - near, 12);
  return up - near <= 6 ? up : up - 12;
}

// A half step into the next root, from the side the line is already on.
export function approach(nextRoot, from) {
  if (from == null || from === nextRoot) return nextRoot - 1;
  return from > nextRoot ? nextRoot + 1 : nextRoot - 1;
}

// Four shapes a walking bar can take once it has stated the root, as jobs for the notes
// that follow. The last note before a change of chord, or of bar, is always an approach.
const WALKS = [['3', '5'], ['5', '3'], ['7', '5'], ['2', '3']];

// One bass note.
//   role   a job id from ROLES
//   h      the harmony sounding now
//   ctx    { next: the harmony at the following bass note (or null), prev: the last bass
//            pitch (or null), count: bass notes since this harmony began (0 = first),
//            last: true when this is the final bass note before a new bar, bar: bar number }
// Returns a MIDI number, or null for a rest.
export function bassNote(role, h, ctx = {}) {
  if (!role || !h) return null;
  const root = bassRootMidi(h);
  const t = bassTones(h);
  const next = ctx.next || h;
  const nextRoot = bassRootMidi(next);
  switch (role) {
    case 'R': return root;
    case '3': return root + t.third;
    case '5': return root + t.fifth;
    case '7': return root + t.seventh;
    case '2': return root + 2;
    case '8': return root + 12;
    case 'N': return nextRoot;
    case 'a': return approach(nextRoot, ctx.prev ?? root);
    case 'W': {
      const count = ctx.count || 0;
      if (count === 0) return root;
      const changing = bassRootPc(next) !== bassRootPc(h);
      if (changing || ctx.last) return bassNote('a', h, ctx);
      const walk = WALKS[mod(ctx.bar || 0, WALKS.length)];
      return bassNote(walk[(count - 1) % walk.length], h, ctx);
    }
    default: return null;
  }
}
