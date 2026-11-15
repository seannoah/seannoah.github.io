// harmony.js — reading a chord chart the way the method does: every chart chord is
// played with a scale of chords, often by substitution.
//
//   major (maj7, 6)      the major 6 on its root, or the major 6 on its 5th
//   minor 7              the major 6 a minor third up (same four notes), e.g. Dm7 = F6
//   minor, minor 6       the minor 6 on its root
//   half-diminished      the minor 6 a minor third up (same four notes), e.g. Dm7b5 = Fm6
//   dominant 7           minor 6 on the 5, the tritone's minor, the true dominant,
//                        the dominant 7b5, or the tritone substitute
//   diminished 7         the diminished scale
//
// Sources: Foundations I pp. 42-47, Foundations IV, and the Standards Series charts.

import { KEYS, SCALES, mod, chordName } from './theory.js';

const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const keyName = (pc) => KEYS[mod(pc, 12)].id;       // the key ids the theory engine uses
const pretty = (s) => s.replace(/b/g, '♭').replace(/#/g, '♯');

// Chord qualities grouped into the families that matter for choosing a scale.
const FAMILIES = [
  ['hdim', /^(m7b5|min7b5|-7b5|ø7?|m7\(b5\))/],
  ['dim', /^(dim7?|o7?|°7?)$/],
  ['min7', /^(m|min|-)(7|9|11|13)/],
  ['min6', /^(m|min|-)(6|69|6\/9|maj7|Maj7|M7|\(maj7\)|\(Maj7\)|Δ7?)?$/],
  ['dom7b5', /^7(b5|\(b5\))$/],
  ['dom', /^(7|9|11|13|\+7|aug7|7sus4?|9sus4?|13sus4?|sus4?|\+|aug)/],
  ['maj', /^(maj|M|Δ|6|69|6\/9|add9|2)?/],
];

// "Bbmaj7" -> { root: 10, family: 'maj', text: 'B♭maj7' }. Returns null if it is not a chord.
export function parseChord(symbol) {
  const m = /^([A-G])([b#♭♯]?)(.*)$/.exec(String(symbol).trim());
  if (!m) return null;
  const acc = m[2] === 'b' || m[2] === '♭' ? -1 : m[2] === '#' || m[2] === '♯' ? 1 : 0;
  const root = mod(LETTER_PC[m[1]] + acc, 12);
  // drop a slash bass note ("Bb/F"), but keep "6/9"
  const quality = m[3].replace(/♭/g, 'b').replace(/♯/g, '#').replace(/\/[A-G][b#]?$/, '');
  const family = (FAMILIES.find(([, re]) => re.test(quality)) || ['maj'])[0];
  return { root, family, quality, text: pretty(`${m[1]}${m[2]}${m[3]}`), sharp: acc > 0 };
}

export const FAMILY_NAME = { maj: 'major', min7: 'minor 7', min6: 'minor', hdim: 'half-diminished', dom: 'dominant 7', dom7b5: 'dominant 7♭5', dim: 'diminished 7' };

// The key a scale is named in: G♭ rather than F♯ unless the chart itself is written in sharps.
export const scaleKey = (pc, sharp = false) => (mod(pc, 12) === 6 && !sharp ? 'G♭' : keyName(pc));
let sharpContext = false;
const opt = (scale, rootPc, how, why) => {
  const key = scaleKey(rootPc, sharpContext);
  return { scale, root: mod(rootPc, 12), key, how, why, on: chordName(key, scale, true), label: `${key} ${SCALES[scale].short}` };
};

// Every scale of chords the method offers for a chord, best default first.
// `resolves` says whether a dominant moves down a fifth to the next chord.
export function scaleOptions(chord, resolves = true) {
  const r = chord.root;
  sharpContext = !!chord.sharp;
  switch (chord.family) {
    case 'maj': return [
      opt('maj6', r, 'true major', 'the chord itself as a major 6'),
      opt('maj6', r + 7, 'major 6 on the 5', 'the major 6 built on its fifth, for a major 9 sound'),
    ];
    case 'min7': return [
      opt('maj6', r + 3, 'same four notes', 'a minor 7 chord has the same notes as the major 6 a minor third above it'),
      opt('min6', r, 'true minor', 'the chord as a minor 6, when it is home'),
    ];
    case 'min6': return [opt('min6', r, 'true minor', 'the chord itself as a minor 6')];
    case 'hdim': return [opt('min6', r + 3, 'same four notes', 'a half-diminished chord has the same notes as the minor 6 a minor third above it')];
    case 'dim': return [opt('dim', r, 'diminished scale', 'the diminished chord with a half step below each of its notes')];
    case 'dom7b5': return [
      opt('dom7b5', r, 'dominant 7♭5', 'the chord itself'),
      opt('min6', r + 1, "tritone's minor", 'the minor 6 a half step above the root'),
      opt('min6', r + 7, 'minor 6 on the 5', 'the minor 6 built on its fifth'),
    ];
    default: {
      const on5 = opt('min6', r + 7, 'minor 6 on the 5', 'the minor 6 built on its fifth: a rootless dominant 9');
      const tm = opt('min6', r + 1, "tritone's minor", 'the minor 6 a half step above the root: the minor 6 on the 5 of the tritone substitute');
      const rest = [
        opt('dom7', r, 'true dominant', 'the chord itself'),
        opt('dom7b5', r, 'dominant 7♭5', 'the chord with a lowered fifth'),
        opt('dom7', r + 6, 'tritone substitute', 'the dominant a tritone away, sharing the same third and seventh'),
      ];
      return resolves ? [tm, on5, ...rest] : [on5, tm, ...rest];
    }
  }
}

// ---- charts ----
// A chart is text: bars between "|" signs, chords in a bar separated by spaces, "%" for
// "same as the bar before", and an optional section letter before a line's first bar.
//   A | Em7b5 | A7 | Cm7 | F7 |
export function parseChart(text) {
  const bars = [];
  for (const raw of String(text || '').split('\n')) {
    const line = raw.trim();
    if (!line || !line.includes('|')) continue;
    const first = line.indexOf('|');
    const section = line.slice(0, first).trim() || null;
    const cells = line.slice(first + 1).split('|').map((c) => c.trim());
    if (cells[cells.length - 1] === '') cells.pop();
    cells.forEach((cell, i) => {
      const prev = bars[bars.length - 1];
      let symbols = cell.split(/\s+/).filter(Boolean);
      if (!symbols.length || symbols[0] === '%') symbols = prev ? prev.chords.map((c) => c.symbol) : [];
      const chords = symbols.map((s) => ({ symbol: s, ...(parseChord(s) || { root: null, family: null, text: s }) })).filter((c) => c.root != null);
      bars.push({ n: bars.length + 1, section: i === 0 ? section : null, chords });
    });
  }
  return bars;
}

// Shift a chord symbol by a number of semitones, spelling with flats or sharps.
export function transposeSymbol(symbol, steps, flats = true) {
  const names = flats ? ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note = (letter, accidental) => {
    const acc = accidental === 'b' || accidental === '♭' ? -1 : accidental === '#' || accidental === '♯' ? 1 : 0;
    return names[mod(LETTER_PC[letter] + acc + steps, 12)];
  };
  const m = /^([A-G])([b#♭♯]?)(.*)$/.exec(symbol);
  if (!m) return symbol;
  const rest = m[3].replace(/\/([A-G])([b#♭♯]?)$/, (_, l, a) => `/${note(l, a)}`);
  return note(m[1], m[2]) + rest;
}
// Transpose every chord in a chart, leaving section letters and bar lines alone.
export function transposeChart(text, steps, flats = true) {
  if (!steps) return String(text);
  return String(text).split('\n').map((line) => {
    const first = line.indexOf('|');
    if (first < 0) return line;
    const body = line.slice(first).replace(/[^\s|%]+/g, (sym) => (/^[A-G]/.test(sym) ? transposeSymbol(sym, steps, flats) : sym));
    return line.slice(0, first) + body;
  }).join('\n');
}

const FLAT_KEYS = new Set([5, 10, 3, 8, 1, 6]);
export const prefersFlats = (pc) => FLAT_KEYS.has(mod(pc, 12)) || mod(pc, 12) === 0;
export const noteName = (pc, flats = true) => (flats ? FLAT_NAMES : SHARP_NAMES)[mod(pc, 12)];

// ---- reading the chart: one entry per chord, with its scale choices and the movement it is in ----
const isDom = (c) => c && (c.family === 'dom' || c.family === 'dom7b5');
const up = (a, b) => mod(b.root - a.root, 12);

// Movements named in Foundations IV that can be spotted from the chords alone.
function findMovements(seq) {
  const tags = seq.map(() => null);
  const mark = (from, to, name) => { for (let i = from; i <= to; i++) if (!tags[i]) tags[i] = { name, start: i === from }; };
  for (let i = 0; i < seq.length - 1; i++) {
    const a = seq[i]; const b = seq[i + 1]; const c = seq[i + 2];
    if (a.family === 'hdim' && isDom(b) && up(a, b) === 5) mark(i, i + 1, 'Minor iiø–V7');
    else if (a.family === 'min7' && isDom(b) && up(a, b) === 5) mark(i, i + 1, 'Major ii–V7');
    else if (a.family === 'dim' && b.family === 'min7' && up(a, b) === 11) mark(i, i + 1, 'Flat-3 diminished');
    else if (a.family === 'maj' && b.family === 'min6' && up(a, b) === 0) mark(i, i + 1, 'Minor iv');
    else if (isDom(a) && b.family === 'maj' && up(a, b) === 2) mark(i, i + 1, 'Minor iv');
    else if (a.family === 'maj' && isDom(b) && up(a, b) === 5 && c && c.family === 'maj' && up(b, c) === 2) mark(i, i + 2, 'Minor iv');
  }
  return tags;
}

// options(i) lets the caller say which option is chosen for chord i (default 0).
export function readChart(bars, chosen = () => 0) {
  const seq = [];
  bars.forEach((bar, b) => bar.chords.forEach((chord, k) => seq.push({ ...chord, bar: b, slot: k, of: bar.chords.length })));
  const moves = findMovements(seq);
  return seq.map((chord, i) => {
    const next = seq[(i + 1) % seq.length];
    // down a fifth to its tonic, or to the minor 7 chord that stands in for that tonic (V to iii)
    const resolves = isDom(chord) && next && (up(chord, next) === 5 || (up(chord, next) === 9 && next.family === 'min7'));
    const options = scaleOptions(chord, resolves);
    const pick = Math.min(options.length - 1, Math.max(0, chosen(i) || 0));
    return { ...chord, index: i, resolves, options, pick, use: options[pick], movement: moves[i] };
  });
}
