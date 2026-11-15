// theory.js — the four scales of chords: notes, names, and step arithmetic.
// Everything here is pure data and functions, so it can be tested in Node.

export const OPEN = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 }; // MIDI of open strings
export const STRINGS = [6, 5, 4, 3, 2, 1];
export const MAX_FRET = 17;

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
  // an alternative spelling of F♯, used when a tune is written in flats (kept last so
  // the first twelve entries stay in chromatic order)
  { id: 'G♭', pc: 6, letter: 4, flat: true },
];
// The order keys are introduced in practice: start in C, then widen.
export const KEY_ORDER = ['C', 'G', 'F', 'D', 'B♭', 'A', 'E♭', 'E', 'A♭', 'B', 'D♭', 'F♯'];
export const keyOf = (id) => KEYS.find((k) => k.id === id) || KEYS[0];

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
};
// A fifth scale of chords, used over diminished chords in tunes: the on chord is a
// diminished 7th and the off notes sit a half step below each of its notes (Foundations
// IV, pp. 61-65). It is not part of the ladder, so it is kept out of SCALE_ORDER.
SCALES.dim = {
  id: 'dim', name: 'Diminished', short: 'diminished', suffix: '°7', whole: true,
  semis: [0, 2, 3, 5, 6, 8, 9, 11], letters: [0, 1, 2, 3, 4, 5, 5, 6],
  labels: ['R', '2', '♭3', '4', '♭5', '♭6', '6', '7'],
  say: ['root', 'second', 'minor third', 'fourth', 'flat five', 'flat six', 'sixth', 'major seven'],
};
export const SCALE_ORDER = ['maj6', 'min6', 'dom7', 'dom7b5'];

export const mod = (n, m) => ((n % m) + m) % m;
export const isOn = (deg) => mod(deg, 2) === 0;

// Semitones above the root for any scale step n (n may be negative or above 7).
export function semisAt(scaleId, n) {
  const s = SCALES[scaleId].semis;
  return 12 * Math.floor(n / 8) + s[mod(n, 8)];
}

// Distance in semitones from degree `deg` to its neighbor (dir = +1 up, -1 down): always 1 or 2.
export function stepSize(scaleId, deg, dir = 1) {
  return dir > 0
    ? semisAt(scaleId, deg + 1) - semisAt(scaleId, deg)
    : semisAt(scaleId, deg) - semisAt(scaleId, deg - 1);
}

function spell(key, scale, slot) {
  const letter = mod(key.letter + scale.letters[slot], 7);
  const pc = mod(key.pc + scale.semis[slot], 12);
  let acc = mod(pc - NATURAL[letter] + 6, 12) - 6;
  if (Math.abs(acc) > 1) return (key.flat ? SIMPLE_FLAT : SIMPLE_SHARP)[pc];
  return LETTERS[letter] + (acc === 1 ? '♯' : acc === -1 ? '♭' : '');
}

// The eight notes of a scale of chords in a key.
export function scaleNotes(keyId, scaleId) {
  const key = keyOf(keyId);
  const scale = SCALES[scaleId];
  return scale.semis.map((st, i) => ({
    deg: i,
    pc: mod(key.pc + st, 12),
    name: spell(key, scale, i),
    label: scale.labels[i],
    say: scale.say[i],
    on: isOn(i),
  }));
}

export function chordName(keyId, scaleId, on = true) {
  if (on) return keyId + SCALES[scaleId].suffix;
  return scaleNotes(keyId, scaleId)[7].name + '°7';
}

export function scaleTitle(keyId, scaleId) {
  return SCALES[scaleId].whole ? `${keyId} ${SCALES[scaleId].short} scale` : `${keyId} ${SCALES[scaleId].short} diminished`;
}

// Which scale degree (0-7) a MIDI note is in this key and scale, or -1.
export function degOfMidi(keyId, scaleId, midi) {
  const key = keyOf(keyId);
  return SCALES[scaleId].semis.indexOf(mod(midi - key.pc, 12));
}

export const midiAt = (string, fret) => OPEN[string] + fret;

// The pitch `steps` scale steps above (or below) a pitch that is in the scale.
export function stepMidi(keyId, scaleId, midi, steps) {
  const deg = degOfMidi(keyId, scaleId, midi);
  return midi + semisAt(scaleId, deg + steps) - semisAt(scaleId, deg);
}

// How many scale steps apart two pitches of the scale are (positive when b is higher).
export function stepsBetween(keyId, scaleId, a, b) {
  const index = (midi) => {
    const deg = degOfMidi(keyId, scaleId, midi);
    return 8 * Math.round((midi - keyOf(keyId).pc - SCALES[scaleId].semis[deg]) / 12) + deg;
  };
  return index(b) - index(a);
}

// Every position of the scale on one string, from fret `lo` to `hi`.
export function stringPath(keyId, scaleId, string, lo = 0, hi = MAX_FRET) {
  const out = [];
  for (let fret = lo; fret <= hi; fret++) {
    const deg = degOfMidi(keyId, scaleId, midiAt(string, fret));
    if (deg >= 0) out.push({ string, fret, deg, midi: midiAt(string, fret) });
  }
  return out;
}

// Where a one-octave walk on a string should begin: at the root when the root sits low
// on that string, otherwise at the lowest on-chord note (never an open string).
export function walkStart(keyId, scaleId, string) {
  const path = stringPath(keyId, scaleId, string, 1, 12);
  const root = path.find((n) => n.deg === 0);
  if (root && root.fret <= 3) return root.fret;
  return path.find((n) => isOn(n.deg)).fret;
}

// One octave of the scale on a string, starting from the lowest scale note at or above `from`.
export function walkPath(keyId, scaleId, string, from = 0) {
  const all = stringPath(keyId, scaleId, string, from, from + 24);
  return all.slice(0, 9);
}
