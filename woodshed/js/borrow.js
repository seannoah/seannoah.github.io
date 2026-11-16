// borrow.js — borrowing: one voice of a chord steps to its neighbor on the path, so an
// off note sits inside an on chord (or the reverse), and usually steps back again.
//
// Two situations, both from the course:
//   1. You are holding a chord and borrow above or below one of its voices
//      (Foundations I, pp. 33-35; "5 Chord Melody Games", scenario 5).
//   2. The melody itself is an off note, and you keep an on chord beneath it
//      ("5 Chord Melody Games", scenario 4).

import { MAX_FRET, stepMidi, degOfMidi, isOn } from './theory.js';
import { voicings } from './floors.js';

const prefer = (v) => (v.lowFret === 0 ? 20 : 0) + (v.maxFret > 12 ? 10 + v.maxFret : 0) + Math.abs(v.minFret - 5) * 0.1;
const playable = (notes) => {
  const fretted = notes.map((n) => n.fret).filter((f) => f > 0);
  return notes.every((n) => n.fret >= 0 && n.fret <= MAX_FRET) && (!fretted.length || Math.max(...fretted) - Math.min(...fretted) <= 5);
};

// Voices are named from the top down, as you hear them.
export const VOICES = {
  2: ['top', 'bottom'],
  3: ['top', 'middle', 'bottom'],
  4: ['top', 'upper middle', 'lower middle', 'bottom'],
};
export const voiceName = (count, fromTop) => (VOICES[count] || [])[fromTop] || 'top';

// A voicing with one voice (counted from the top, 0 = top) moved one scale step up or down
// on its own string. Returns null if that is unplayable or the voice would cross another.
export function borrowIn(keyId, scaleId, voicing, fromTop, dir) {
  const i = voicing.notes.length - 1 - fromTop;
  const old = voicing.notes[i];
  if (!old) return null;
  const midi = stepMidi(keyId, scaleId, old.midi, dir);
  const moved = { string: old.string, fret: old.fret + (midi - old.midi), midi, deg: degOfMidi(keyId, scaleId, midi) };
  const below = voicing.notes[i - 1];
  const above = voicing.notes[i + 1];
  if ((below && midi <= below.midi) || (above && midi >= above.midi)) return null;
  const notes = voicing.notes.map((n, k) => (k === i ? moved : n));
  if (!playable(notes)) return null;
  return { notes, moved, old, index: i, size: Math.abs(midi - old.midi), base: voicing, on: voicing.on };
}

// item: { scale, shape, set, voice (0 = top), dir (1 | -1), deg (top degree of the chord) }
export function borrowPair(keyId, it) {
  const starts = voicings(keyId, it.scale, it.shape, it.set).filter((v) => v.topDeg === it.deg).sort((a, b) => prefer(a) - prefer(b));
  for (const v of starts) {
    const b = borrowIn(keyId, it.scale, v, it.voice, it.dir);
    if (b) return b;
  }
  return null;
}

// An on chord kept beneath an off melody note: the shape that belongs under the on note
// next to it (`from` = 1 for the note above, -1 for the note below), with its top voice
// moved to the melody note.
// item: { scale, shape, set, from, deg (the melody's degree) }; `midi` fixes the pitch in a tune.
export function underBorrowed(keyId, it, midi = null) {
  const all = voicings(keyId, it.scale, it.shape, it.set)
    .filter((v) => v.topDeg === ((it.deg + it.from) % 8 + 8) % 8)
    .sort((a, b) => prefer(a) - prefer(b));
  for (const v of all) {
    const b = borrowIn(keyId, it.scale, v, 0, -it.from);
    if (b && (midi == null || b.moved.midi === midi)) return b;
  }
  return null;
}

// In words: which degree took which neighbor.
export function borrowWords(scale, b, say) {
  const dir = b.moved.midi > b.old.midi ? 'above' : 'below';
  const kind = isOn(b.moved.deg) ? 'on' : 'off';
  const home = isOn(b.old.deg) ? 'on' : 'off';
  return `The ${say(scale, b.old.deg)} borrows the ${say(scale, b.moved.deg)}, a ${b.size === 1 ? 'half' : 'whole'} step ${dir}: ${kind === 'off' ? 'an off' : 'an on'} note in ${home === 'on' ? 'an on' : 'an off'} chord.`;
}
