// mirror.js — pivoting "through the looking glass" (The Elevator Sequence, pp. 11-13).
//
// The outside distances of the floors repeat. Thirds, triads, shells and octaves span a
// third, a fifth, a sixth and an octave; drop 2, drop 3, drop 2 and 4 and the double
// octave span the same four distances, one octave wider. Each wide floor is the
// "reflection" of a small one.
//
// To pivot, play the reflection of the floor that was due. One outer voice carries on by
// step as planned. The other lands an octave away from where it was heading, so a voice
// that would have stepped up drops a seventh instead. This is Barry Harris's pivot for a
// single line (go up a chord, but drop everything after the first note an octave), done
// to one voice of a chord.

import { stepMidi, stepsBetween } from './theory.js';
import { SHAPES, ELEVATOR, voicings, voicingAt, siblings, floorOf } from './floors.js';

// The floor four stops up (or down) the elevator: the same outside distance, an octave wider (or narrower).
export const reflect = (shapeId, wider = true) => ELEVATOR[ELEVATOR.indexOf(shapeId) + (wider ? 4 : -4)] || null;
// The same, by floor id: reflectFloor('triads') is 'drop3'.
export function reflectFloor(floorId, wider = true) {
  const shape = ELEVATOR.find((id) => SHAPES[id].floor === floorId);
  const other = shape && reflect(shape, wider);
  return other ? SHAPES[other].floor : null;
}

const top = (v) => v.notes[v.notes.length - 1];
const comfy = (v) => (v.lowFret === 0 ? 20 : 0) + (v.maxFret > 12 ? 8 + (v.maxFret - 12) * 3 : 0) + Math.abs(v.minFret - 6) * 0.15;
const named = (v, shapeId) => ({ ...v, shape: shapeId, floorName: floorOf(shapeId).name, mixed: false });

// Every position of any shape on a floor whose top (or bottom) note is exactly this pitch.
function allAt(keyId, s, shapeId, anchor, midi) {
  const out = [];
  for (const id of siblings(shapeId)) {
    for (const set of SHAPES[id].sets) {
      const v = voicingAt(keyId, s, id, set, anchor, midi);
      if (v) out.push(named(v, id));
    }
  }
  return out;
}

// The two chords of a pivot, or null if this key has no playable place for it.
// it: { scale, floor: shape id, how: 'in' | 'out', deg }
//   in:  the voices are closing. The melody steps down as planned; the bass, due to step
//        up, drops a seventh, and the chord is the reflection of the next floor down.
//   out: the voices are opening. The bass steps down as planned; the melody, due to step
//        up, leaps a ninth, and the chord is the reflection of the next floor up.
export function pivotPair(keyId, it) {
  const s = it.scale;
  const i = ELEVATOR.indexOf(it.floor);
  const expected = ELEVATOR[i + (it.how === 'in' ? -1 : 1)];
  const mirror = expected && reflect(expected);
  if (!mirror) return null;
  const anchor = it.how === 'in' ? 'top' : 'bottom';
  const kept = (v) => (anchor === 'top' ? top(v) : v.notes[0]);
  let best = null;
  for (const fromSet of SHAPES[it.floor].sets) {
    for (const from of voicings(keyId, s, it.floor, fromSet)) {
      if (from.topDeg !== it.deg || from.lowFret === 0) continue;
      const target = stepMidi(keyId, s, kept(from).midi, -1);
      for (const to of allAt(keyId, s, mirror, anchor, target)) {
        if (to.lowFret === 0) continue;
        const score = comfy(from) + comfy(to) + Math.abs(from.minFret - to.minFret) * 1.5
          + (kept(to).string === kept(from).string ? 0 : 4) + (to.shape === mirror ? 0 : 1);
        if (!best || score < best.score) best = { score, from, to, target };
      }
    }
  }
  if (!best) return null;
  const from = named(best.from, it.floor);
  const { to } = best;
  const given = kept(to);
  // any shape of the mirror floor that holds the given note and has the same outside notes
  const accept = allAt(keyId, s, mirror, anchor, best.target)
    .filter((v) => kept(v).string === given.string && v.notes[0].midi === to.notes[0].midi && top(v).midi === top(to).midi)
    .map((v) => v.notes);
  // the chord that was due, for comparison
  const straight = allAt(keyId, s, expected, anchor, best.target)
    .sort((a, b) => Math.abs(a.minFret - from.minFret) - Math.abs(b.minFret - from.minFret) || (a.shape === expected ? -1 : 1))[0] || null;
  return {
    from, to, straight, expected, mirror, given: [given], accept, how: it.how,
    top: stepsBetween(keyId, s, top(from).midi, top(to).midi),
    bass: stepsBetween(keyId, s, from.notes[0].midi, to.notes[0].midi),
    motion: 'pivot',
  };
}

// A whole line in which the melody walks down one step per chord while the floors close
// in, as on pp. 12-13 of The Elevator Sequence. With `pivotAt`, the chord at that index
// is traded for its reflection and the line carries on from there. Without it, the line
// ends when the two voices meet on a single note.
// opts: { start: shape id, top: MIDI of the first melody note, count, pivotAt }
export function mirrorLine(keyId, s, opts) {
  const out = [];
  let floor = ELEVATOR.indexOf(opts.start);
  let midi = opts.top;
  let around = null;
  for (let k = 0; k < (opts.count || 9); k++) {
    if (k > 0) {
      floor -= 1;
      midi = stepMidi(keyId, s, midi, -1);
      if (k === opts.pivotAt) floor += 4;
    }
    if (floor < 0 || floor >= ELEVATOR.length) break;
    const options = allAt(keyId, s, ELEVATOR[floor], 'top', midi);
    if (!options.length) break;
    const prev = out[out.length - 1];
    // near the last chord, toward the middle of the neck, and with the melody kept on its string where that is easy
    const cost = (v) => (v.lowFret === 0 ? 20 : 0) + (around == null ? Math.abs(v.minFret - 8) * 0.2 : Math.abs(v.minFret - around) + Math.abs(v.minFret - 7) * 0.5)
      + (prev && top(prev.voicing).string !== top(v).string ? 1.5 : 0) + (v.shape === ELEVATOR[floor] ? 0 : 1.25);
    const voicing = options.sort((a, b) => cost(a) - cost(b))[0];
    around = voicing.minFret;
    out.push({ voicing, floor: ELEVATOR[floor], pivot: k === opts.pivotAt, expected: k === opts.pivotAt ? ELEVATOR[floor - 4] : null });
    if (floor === 0) break;
  }
  return out;
}

// Barry Harris's pivot for a single line: the notes of a four-note chord going up, and
// the same notes with everything after the first dropped an octave.
export function pivotNotes(keyId, s, midi) {
  const up = [0, 2, 4, 6].map((n) => stepMidi(keyId, s, midi, n));
  return { up, pivoted: [up[0], ...up.slice(1).map((m) => m - 12)] };
}
