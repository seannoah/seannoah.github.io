// motion.js — two chords in a row, and what the outer voices did between them.
//
// The Elevator rule that makes this work: under the same top note, each floor up puts
// the bottom note one chord-note (two scale steps) lower. So with the top on one string:
//   same floor, top steps        -> the bass steps the same way        (parallel)
//   floor up, top steps up       -> the bass steps down                (contrary)
//   floor down, top steps down   -> the bass steps up                  (contrary)
//   top holds, a lower floor steps beneath it                          (oblique)
// These match the worked examples in The Elevator Sequence, pp. 2 and 7.

import { OPEN, MAX_FRET, degOfMidi, stepMidi, stepsBetween, isOn } from './theory.js';
import { SHAPES, ELEVATOR, voicings, voicingAt, setWithTop, siblings, floorOf } from './floors.js';

export const TOP_STRING = 2;   // the melody string for these moves
const UNDER_STRING = 3;        // where a moving floor's top note sits beneath a held melody note

const prefer = (v) => (v.lowFret === 0 ? 20 : 0) + (v.maxFret > 12 ? 10 + v.maxFret : 0) + Math.abs(v.minFret - 5) * 0.1;
const top = (v) => v.notes[v.notes.length - 1];
const spanOk = (notes) => {
  const fretted = notes.map((n) => n.fret).filter((f) => f > 0);
  return notes.every((n) => n.fret >= 0 && n.fret <= MAX_FRET) && (!fretted.length || Math.max(...fretted) - Math.min(...fretted) <= 5);
};

// What the outer voices did between two chords: steps moved by top and bass, and the kind of motion.
export function describeMove(keyId, scaleId, from, to) {
  const t = stepsBetween(keyId, scaleId, top(from).midi, top(to).midi);
  const b = stepsBetween(keyId, scaleId, from.notes[0].midi, to.notes[0].midi);
  const motion = t === 0 && b === 0 ? 'none' : t === 0 || b === 0 ? 'oblique' : Math.sign(t) === Math.sign(b) ? 'parallel' : 'contrary';
  return { top: t, bass: b, motion };
}

const named = (v, shapeId, keyId, scaleId) => ({ ...v, shape: shapeId, floorName: shapeId ? floorOf(shapeId).name : null, mixed: false });

// A held melody note with a smaller floor placed beneath it.
function stack(keyId, scaleId, under, held) {
  const notes = [...under.notes, held];
  if (!spanOk(notes)) return null;
  const on = isOn(held.deg);
  return { notes, on, mixed: under.on !== on, shape: null, floorName: null, under };
}

// The two chords of a move item, or null if this key has no playable position for it.
// it: { scale, move: 'par' | 'con' | 'obl', floor: shape id, dir: 1 | -1, deg }
export function movePair(keyId, it) {
  const s = it.scale;
  if (it.move === 'obl') {
    const set = setWithTop(it.floor, UNDER_STRING);
    const helds = [];
    for (let fret = 0; fret <= MAX_FRET; fret++) {
      const midi = OPEN[TOP_STRING] + fret;
      if (degOfMidi(keyId, s, midi) === it.deg) helds.push({ string: TOP_STRING, fret, midi, deg: it.deg });
    }
    const options = [];
    for (const held of helds) {
      const near = voicingAt(keyId, s, it.floor, set, 'top', stepMidi(keyId, s, held.midi, -2));
      const far = voicingAt(keyId, s, it.floor, set, 'top', stepMidi(keyId, s, held.midi, -3));
      if (!near || !far) continue;
      const a = stack(keyId, s, near, held);
      const b = stack(keyId, s, far, held);
      if (a && b) options.push({ a, b, held, score: prefer(near) + prefer(far) });
    }
    if (!options.length) return null;
    const best = options.sort((x, y) => x.score - y.score)[0];
    // dir -1: the lower floor steps away (down); dir +1: it steps back up into line
    const [from, to] = it.dir < 0 ? [best.a, best.b] : [best.b, best.a];
    return { from, to, given: [best.held], accept: [to.notes], ...describeMove(keyId, s, from, to), moving: it.floor };
  }

  const i = ELEVATOR.indexOf(it.floor);
  const toShape = it.move === 'par' ? it.floor : ELEVATOR[i + it.dir];
  if (!toShape) return null;
  const fromSet = setWithTop(it.floor, TOP_STRING);
  const toSet = setWithTop(toShape, TOP_STRING);
  if (!fromSet || !toSet) return null;
  const starts = voicings(keyId, s, it.floor, fromSet).filter((v) => v.topDeg === it.deg).sort((x, y) => prefer(x) - prefer(y));
  for (const from of starts) {
    const target = stepMidi(keyId, s, top(from).midi, it.dir);
    const to = voicingAt(keyId, s, toShape, toSet, 'top', target);
    if (!to) continue;
    // any shape of the target floor with the same outer voices is a right answer
    const accept = siblings(toShape)
      .map((id) => voicingAt(keyId, s, id, setWithTop(id, TOP_STRING), 'top', target))
      .filter((v) => v && v.notes[0].midi === to.notes[0].midi)
      .map((v) => v.notes);
    const a = named(from, it.floor, keyId, s);
    const b = named(to, toShape, keyId, s);
    return { from: a, to: b, given: [top(to)], accept: accept.length ? accept : [to.notes], ...describeMove(keyId, s, a, b) };
  }
  return null;
}

// In words: what each outer voice did.
const stepWords = (n, voice) => {
  if (n === 0) return `the ${voice} held`;
  const size = Math.abs(n) === 1 ? 'stepped' : 'leapt';
  return `the ${voice} ${size} ${n > 0 ? 'up' : 'down'}`;
};
export function moveWords(d) {
  const outer = `${stepWords(d.top, 'melody')}, ${stepWords(d.bass, 'bass')}`;
  return `${outer.charAt(0).toUpperCase()}${outer.slice(1)}: ${d.motion} motion.`;
}

// The floor reached from a starting floor by a kind of step.
// how: 'out' (melody up, bass down), 'in' (melody down, bass up), 'par' (both the same way)
export function floorAfter(shapeId, how) {
  const i = ELEVATOR.indexOf(shapeId);
  return ELEVATOR[i + (how === 'out' ? 1 : how === 'in' ? -1 : 0)] || null;
}

export const shapeName = (id) => SHAPES[id].name.toLowerCase();
