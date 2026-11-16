// theory.js — the scales of chords as pitches: notes, names, and step arithmetic.
// Adapted from Woodshed's theory.js, with the fretboard taken out: this app is an
// instrument of its own, so everything is counted in scale steps and MIDI numbers.
// Pure data and functions, so it can be tested in Node.

const NATURAL = [0, 2, 4, 5, 7, 9, 11];
const LETTERS = 'CDEFGAB';
const SIMPLE_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const SIMPLE_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

// Chromatic order, for pickers.
export const KEYS = [
  { id: 'C', pc: 0, letter: 0 },
  { id: 'D♭', pc: 1, letter: 1, flat: true },
  { id: 'D', pc: 2, letter: 1 },
  { id: 'E♭', pc: 3, letter: 2, flat: true },
  { id: 'E', pc: 4, letter: 2 },
  { id: 'F', pc: 5, letter: 3, flat: true },
  { id: 'F♯', pc: 6, letter: 3 },
  { id: 'G', pc: 7, letter: 4 },
  { id: 'A♭', pc: 8, letter: 5, flat: true },
  { id: 'A', pc: 9, letter: 5 },
  { id: 'B♭', pc: 10, letter: 6, flat: true },
  { id: 'B', pc: 11, letter: 6 },
  // an alternative spelling of F♯ (kept last so the first twelve stay in chromatic order)
  { id: 'G♭', pc: 6, letter: 4, flat: true },
];
export const keyOf = (id) => KEYS.find((k) => k.id === id) || KEYS[0];
export const mod = (n, m) => ((n % m) + m) % m;
// The key a scale is named in: G♭ rather than F♯ unless sharps are asked for.
export const keyName = (pc, sharp = false) => (mod(pc, 12) === 6 && !sharp ? 'G♭' : KEYS[mod(pc, 12)].id);

// Each scale of chords is eight notes: an "on" chord (slots 0,2,4,6) interleaved
// with an "off" diminished chord (slots 1,3,5,7). The off chord is always the
// major 7th, 2nd, 4th and sharp 5th measured from the on chord's root.
export const SCALES = {
  maj6: {
    id: 'maj6', name: 'Major 6 diminished', short: 'major 6', suffix: '6',
    semis: [0, 2, 4, 5, 7, 8, 9, 11], letters: [0, 1, 2, 3, 4, 4, 5, 6],
    labels: ['R', '2', '3', '4', '5', '♯5', '6', '7'],
    say: ['root', 'second', 'third', 'fourth', 'fifth', 'sharp five', 'sixth', 'major seven'],
  },
  min6: {
    id: 'min6', name: 'Minor 6 diminished', short: 'minor 6', suffix: 'm6',
    semis: [0, 2, 3, 5, 7, 8, 9, 11], letters: [0, 1, 2, 3, 4, 4, 5, 6],
    labels: ['R', '2', '♭3', '4', '5', '♯5', '6', '7'],
    say: ['root', 'second', 'minor third', 'fourth', 'fifth', 'sharp five', 'sixth', 'major seven'],
  },
  dom7: {
    id: 'dom7', name: 'Dominant 7 diminished', short: 'dominant 7', suffix: '7',
    semis: [0, 2, 4, 5, 7, 8, 10, 11], letters: [0, 1, 2, 3, 4, 4, 6, 6],
    labels: ['R', '2', '3', '4', '5', '♯5', '♭7', '7'],
    say: ['root', 'second', 'third', 'fourth', 'fifth', 'sharp five', 'flat seven', 'major seven'],
  },
  dom7b5: {
    id: 'dom7b5', name: 'Dominant 7♭5 diminished', short: 'dominant 7♭5', suffix: '7♭5',
    semis: [0, 2, 4, 5, 6, 8, 10, 11], letters: [0, 1, 2, 3, 4, 4, 6, 6],
    labels: ['R', '2', '3', '4', '♭5', '♯5', '♭7', '7'],
    say: ['root', 'second', 'third', 'fourth', 'flat five', 'sharp five', 'flat seven', 'major seven'],
  },
  // A fifth scale, met only when a tune has a diminished chord of its own: the on chord
  // is a diminished 7th and the off notes sit a half step below each of its notes.
  dim: {
    id: 'dim', name: 'Diminished', short: 'diminished', suffix: '°7', whole: true,
    semis: [0, 2, 3, 5, 6, 8, 9, 11], letters: [0, 1, 2, 3, 4, 5, 5, 6],
    labels: ['R', '·', '♭3', '·', '♭5', '·', '6', '·'],
    say: ['root', 'off note', 'minor third', 'off note', 'flat five', 'off note', 'sixth', 'off note'],
  },
};
export const SCALE_ORDER = ['maj6', 'min6', 'dom7', 'dom7b5'];

export const isOn = (n) => mod(n, 2) === 0;

// Semitones above the root for any scale step n (n may be negative or above 7).
export function semisAt(scaleId, n) {
  const s = SCALES[scaleId].semis;
  return 12 * Math.floor(n / 8) + s[mod(n, 8)];
}

// Distance in semitones from step n to its neighbor (dir = +1 up, -1 down): always 1 or 2.
export function stepSize(scaleId, n, dir = 1) {
  return dir > 0 ? semisAt(scaleId, n + 1) - semisAt(scaleId, n) : semisAt(scaleId, n) - semisAt(scaleId, n - 1);
}

function spell(key, scale, slot) {
  const letter = mod(key.letter + scale.letters[slot], 7);
  const pc = mod(key.pc + scale.semis[slot], 12);
  const acc = mod(pc - NATURAL[letter] + 6, 12) - 6;
  if (Math.abs(acc) > 1) return (key.flat ? SIMPLE_FLAT : SIMPLE_SHARP)[pc];
  return LETTERS[letter] + (acc === 1 ? '♯' : acc === -1 ? '♭' : '');
}

// The eight notes of a scale of chords in a key (by key id, as in Woodshed).
export function scaleNotes(keyId, scaleId) {
  const key = keyOf(keyId);
  const scale = SCALES[scaleId];
  return scale.semis.map((st, i) => ({
    deg: i, pc: mod(key.pc + st, 12), name: spell(key, scale, i),
    label: scale.labels[i], say: scale.say[i], on: isOn(i),
  }));
}

export function chordName(keyId, scaleId, on = true) {
  if (on) return keyId + SCALES[scaleId].suffix;
  return scaleNotes(keyId, scaleId)[7].name + '°7';
}

// ---- a harmony: one scale of chords in one key ----
// { root: pitch class 0-11, scale: id, bass?: the pitch class a bass player would play under
//   it, when that differs from the root (D under F6 standing for Dm7) }
export const harmony = (root, scale, extra = {}) => ({ root: mod(root, 12), scale, ...extra });
export const sameHarmony = (a, b) => !!a && !!b && a.root === b.root && a.scale === b.scale;
export const harmonyNotes = (h) => scaleNotes(keyName(h.root, h.sharp), h.scale);
export const harmonyTitle = (h) => {
  const key = keyName(h.root, h.sharp);
  return SCALES[h.scale].whole ? `${key} ${SCALES[h.scale].short} scale` : `${key} ${SCALES[h.scale].short} diminished`;
};
// "C6" for the on chord, "B°7" for the off chord.
export const chordLabel = (h, on = true) => chordName(keyName(h.root, h.sharp), h.scale, on);
export const noteAt = (h, n) => harmonyNotes(h)[mod(n, 8)];

// Where the pads sit. Step 0 is the root at or above `floor`, so every key lands in the
// same octave-wide window and a change of key never jumps the melody by more than a sixth.
export const REGISTER = 53; // F3
export const rootMidi = (rootPc, floor = REGISTER) => floor + mod(rootPc - floor, 12);
export const midiAt = (h, n, floor = REGISTER) => rootMidi(h.root, floor) + semisAt(h.scale, n);

// The scale step of a MIDI pitch in a harmony, or null when the pitch is not in the scale.
export function stepOfMidi(h, midi, floor = REGISTER) {
  const rel = midi - rootMidi(h.root, floor);
  const deg = SCALES[h.scale].semis.indexOf(mod(rel, 12));
  return deg < 0 ? null : 8 * Math.floor(rel / 12) + deg;
}

// The scale step whose pitch is nearest to a MIDI number; `want` limits it to on notes
// ('on'), off notes ('off') or either (null). Ties go to the lower step.
export function nearestStep(h, midi, want = null, floor = REGISTER) {
  const guess = Math.round(((midi - rootMidi(h.root, floor)) / 12) * 8);
  let best = null;
  for (let n = guess - 4; n <= guess + 4; n++) {
    if (want === 'on' && !isOn(n)) continue;
    if (want === 'off' && isOn(n)) continue;
    const far = Math.abs(midiAt(h, n, floor) - midi);
    if (best === null || far < best.far) best = { n, far };
  }
  return best.n;
}

// Pitch classes of the on chord and of the off chord.
export const chordPcs = (h, on = true) => SCALES[h.scale].semis.filter((_, i) => isOn(i) === on).map((s) => mod(h.root + s, 12));

const NOTE_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
export const pcName = (pc) => NOTE_FLAT[mod(pc, 12)];
export const midiName = (midi) => `${pcName(midi)}${Math.floor(midi / 12) - 1}`;
export const freqOf = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
