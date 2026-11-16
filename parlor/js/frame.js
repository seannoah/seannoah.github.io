// frame.js — the rules of the two-hands instrument.
//
// Two voices are played by hand: a bass and a melody. The Elevator supplies whatever
// belongs between them, so the distance between the two hands decides the floor:
//   0 unison, 2 a third, 4 a triad, 6 a shell, 8 an octave chord,
//   10 drop 2, 12 drop 3, 14 drop 2 and 4, 16 a double octave
// (counted in scale steps). The second five are the first five an octave wider, which is
// the course's "mirror": drop the bass an octave and a third becomes a drop 2.
//
// Everything here is counted in rows. A row is a scale step measured from an anchor: the
// on note of the current chord nearest a fixed pitch. So row 0 is always an on note, even
// rows are on and odd rows are off, and when the harmony changes each row moves by a
// semitone or two at most. A chord left on the same rows is thereby carried to the new
// harmony by the shortest route, which is what the course calls transformation.

import { nearestStep, midiAt, isOn, mod, harmonyNotes } from './theory.js';
import { FLOORS, SHAPES, shapeOfSteps } from './floors.js';
import { voiceWords } from './moves.js';

export const KEYS_PER_HAND = 9;   // an octave of the scale, from an on note to the same note above
export const BASS_DROP = 4;       // the left hand's keys sit this many rows below the right hand's
export const MIRROR = 8;          // the mirror: the bass an octave lower still

// The scale step under row 0: the on note nearest the floor pitch.
export const anchorStep = (h, floorMidi) => nearestStep(h, floorMidi, 'on');
export const stepOfRow = (h, floorMidi, row) => anchorStep(h, floorMidi) + row;
export const midiOfRow = (h, floorMidi, row) => midiAt(h, stepOfRow(h, floorMidi, row));
// The row nearest a pitch (for a note that was struck in another harmony).
export const rowOfMidi = (h, floorMidi, midi) => nearestStep(h, midi) - anchorStep(h, floorMidi);

// The rows of each hand's keys, bottom key first.
export const rightRows = () => Array.from({ length: KEYS_PER_HAND }, (_, k) => k);
export const leftRows = (mirror = false) => rightRows().map((k) => k - BASS_DROP - (mirror ? MIRROR : 0));

const near = (rows, prev) => rows.reduce((sum, n) => sum + Math.min(...prev.map((p) => Math.abs(p - n))), 0);

// What the left hand sounds: the bass and whatever the Elevator puts between it and the
// melody. The notes always belong to the bass's chord, on or off; the melody is free.
//   bass, melody   rows (melody may be null: the bass alone)
//   prev           the inner voices sounding before, so that where a floor has more than
//                  one shape the one that moves least is chosen
// Returns { rows, inner, kind, floor, shape }:
//   kind 'floor'     the two hands agree (both on, or both off): a floor of the Elevator
//        'borrowed'  they disagree: the chord under the melody is the bass's, and the
//                    melody is a borrowed note above it
//        'unison' | 'bass' | 'crossed' | 'wide'   nothing lies between
export function underPart(bass, melody, prev = null) {
  const alone = (kind) => ({ rows: [bass], inner: [], kind, floor: kind === 'unison' ? 0 : null, shape: kind === 'unison' ? 'unison' : null });
  if (melody == null) return alone('bass');
  const span = melody - bass;
  if (span < 0) return alone('crossed');
  if (span === 0) return alone('unison');
  if (span > 16) return alone('wide');
  const even = span % 2 === 0;
  // when the hands disagree, take the floor whose top would be the note just above the
  // melody (the melody has borrowed below it), or just below when that is out of reach
  const size = even ? span : (span + 1 <= 16 ? span + 1 : span - 1);
  let best = null;
  for (const id of FLOORS[size / 2].shapes) {
    const rows = SHAPES[id].steps.map((s) => bass + s).filter((n) => n < melody);
    const cost = prev && prev.length ? near(rows.slice(1), prev) : 0;
    if (!best || cost < best.cost) best = { cost, rows, shape: id };
  }
  return { rows: best.rows, inner: best.rows.slice(1), kind: even ? 'floor' : 'borrowed', floor: size / 2, shape: best.shape };
}

// The whole chord, low to high: what the left hand sounds, then the melody.
export const chordRows = (part, melody) => (melody == null || part.kind === 'unison' ? part.rows : part.kind === 'crossed' ? [melody, ...part.rows] : [...part.rows, melody]);

// What to call what is sounding.
export function frameName(bass, melody, part) {
  if (bass == null && melody == null) return '';
  if (bass == null) return 'Melody alone';
  if (melody == null) return 'Bass alone';
  switch (part.kind) {
    case 'unison': return 'Unison';
    case 'crossed': return 'Bass above the melody';
    case 'wide': return 'Two voices, far apart';
    case 'floor': return SHAPES[part.shape].name;
    default: return isOn(bass) ? 'On chord beneath a borrowed melody' : 'Off chord beneath the melody';
  }
}

// What the two hands did between one moment and the next, in the method's words.
export function frameMotion(from, to) {
  if (!from || !to || from.bass == null || from.melody == null || to.bass == null || to.melody == null) return '';
  const b = to.bass - from.bass;
  const m = to.melody - from.melody;
  if (!b && !m) return '';
  const kind = !b || !m ? 'oblique' : Math.sign(b) === Math.sign(m) ? 'parallel' : 'contrary';
  return `Melody ${voiceWords(m)}, bass ${voiceWords(b)}: ${kind}.`;
}

// The note names of some rows in a harmony, low to high.
export function spell(h, floorMidi, rows) {
  const names = harmonyNotes(h);
  const a = anchorStep(h, floorMidi);
  return rows.map((r) => names[mod(a + r, 8)].name);
}
export const noteOfRow = (h, floorMidi, row) => harmonyNotes(h)[mod(anchorStep(h, floorMidi) + row, 8)];

// What to call what is actually ringing: the left hand's notes (rows, bass first) and the
// melody, either of which may be missing. A chord that is one of the floors gets its name;
// one made by a hand moving while the other stayed is described by its parts.
export function soundingName(under, melody) {
  if (!under && melody == null) return '';
  if (!under) return 'Melody alone';
  if (melody == null) return under.length > 1 ? `${SHAPES[shapeOfSteps(under)] ? SHAPES[shapeOfSteps(under)].name : 'Chord'} alone` : 'Bass alone';
  const bass = under[0];
  if (melody < bass) return 'Bass above the melody';
  if (melody === bass) return 'Unison';
  const whole = shapeOfSteps([...under.filter((r) => r < melody), melody]);
  if (whole) return SHAPES[whole].name;
  if (isOn(bass) !== isOn(melody)) return isOn(bass) ? 'On chord beneath a borrowed melody' : 'Off chord beneath the melody';
  const part = under.length > 1 ? shapeOfSteps(under) : null;
  if (part) return `${SHAPES[part].name} beneath the melody`;
  if (under.length > 1) return 'A chord beneath the melody';
  const span = melody - bass;
  return span <= 16 ? `Two voices, ${FLOORS[span / 2].span} apart` : 'Two voices, far apart';
}
