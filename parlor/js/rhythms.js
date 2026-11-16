// rhythms.js — the built-in rhythms and drum kits, as data.
//
// A rhythm is two patterns (A, and B with a little more going on), each two bars long.
// Drums are written one character per step: "." rest, "o" soft, "x" normal, "X" accented.
// The bass is written as jobs: R root, 5 fifth, 3 third, 7 seventh, 8 octave, a approach,
// N next chord's root, W walk. `comp` lists the steps where a chord may be struck.
//
// A kit gives each of the six drum lanes a sound, described as a recipe that drums.js
// knows how to cook: kick, noise, sweep, metal, click or tom.

import { SIGS, emptyPattern, parseDrums, parseBass, fit, patternSteps, LANES, PATTERN_IDS } from './seq.js';

export const KITS = {
  brushes: {
    id: 'brushes', name: 'Brushes',
    lanes: {
      kick: { label: 'Kick', type: 'kick', f0: 92, f1: 47, drop: 0.05, decay: 0.24, click: 0.06, gain: 0.62 },
      snare: { label: 'Tap', type: 'noise', filter: 'bandpass', f: 2400, q: 0.7, attack: 0.003, decay: 0.085, gain: 0.5, body: 185 },
      hat: { label: 'Hat', type: 'noise', filter: 'highpass', f: 6800, q: 0.8, attack: 0.002, decay: 0.04, gain: 0.3 },
      ride: { label: 'Ride', type: 'metal', base: 372, hp: 5200, decay: 0.85, ping: 0.35, gain: 0.2 },
      rim: { label: 'Sweep', type: 'sweep', f0: 1500, f1: 3600, q: 0.8, attack: 0.1, decay: 0.3, gain: 0.44 },
      perc: { label: 'Swish', type: 'sweep', f0: 3200, f1: 2000, q: 0.9, attack: 0.03, decay: 0.14, gain: 0.38 },
    },
  },
  sticks: {
    id: 'sticks', name: 'Sticks',
    lanes: {
      kick: { label: 'Kick', type: 'kick', f0: 120, f1: 52, drop: 0.035, decay: 0.2, click: 0.25, gain: 0.75 },
      snare: { label: 'Snare', type: 'noise', filter: 'bandpass', f: 3300, q: 0.6, attack: 0.001, decay: 0.13, gain: 0.55, body: 205 },
      hat: { label: 'Hat', type: 'noise', filter: 'highpass', f: 7600, q: 0.9, attack: 0.001, decay: 0.035, gain: 0.34 },
      ride: { label: 'Ride', type: 'metal', base: 410, hp: 6000, decay: 1.1, ping: 0.55, gain: 0.2 },
      rim: { label: 'Rim', type: 'click', f: 820, decay: 0.035, noise: 0.5, gain: 0.5 },
      perc: { label: 'Crash', type: 'metal', base: 330, hp: 4200, decay: 1.6, ping: 0.1, gain: 0.2 },
    },
  },
  box: {
    id: 'box', name: 'Rhythm box',
    lanes: {
      kick: { label: 'Kick', type: 'kick', f0: 150, f1: 50, drop: 0.06, decay: 0.42, click: 0.02, gain: 0.8 },
      snare: { label: 'Snare', type: 'noise', filter: 'highpass', f: 1800, q: 0.5, attack: 0.001, decay: 0.16, gain: 0.42, body: 180, bodyDecay: 0.1 },
      hat: { label: 'Hat', type: 'metal', base: 540, hp: 7800, decay: 0.05, ping: 0, gain: 0.7 },
      ride: { label: 'Open hat', type: 'metal', base: 540, hp: 7000, decay: 0.42, ping: 0, gain: 0.5 },
      rim: { label: 'Rim', type: 'click', f: 1650, decay: 0.022, noise: 0.15, gain: 0.5 },
      perc: { label: 'Maracas', type: 'noise', filter: 'highpass', f: 9000, q: 0.7, attack: 0.012, decay: 0.03, gain: 0.26 },
    },
  },
  hand: {
    id: 'hand', name: 'Hand drums',
    lanes: {
      kick: { label: 'Surdo', type: 'tom', f0: 105, f1: 72, drop: 0.08, decay: 0.34, gain: 0.7 },
      snare: { label: 'Conga', type: 'tom', f0: 300, f1: 232, drop: 0.03, decay: 0.16, gain: 0.5, slap: 0.3 },
      hat: { label: 'Shaker', type: 'noise', filter: 'bandpass', f: 7200, q: 1.2, attack: 0.014, decay: 0.045, gain: 0.5 },
      ride: { label: 'Triangle', type: 'metal', base: 1480, hp: 4200, decay: 0.7, ping: 0.7, gain: 0.16, pure: true },
      rim: { label: 'Clave', type: 'click', f: 2380, decay: 0.05, noise: 0.03, gain: 0.5 },
      perc: { label: 'Low conga', type: 'tom', f0: 215, f1: 170, drop: 0.04, decay: 0.2, gain: 0.5 },
    },
  },
};
export const KIT_IDS = Object.keys(KITS);

const bar2 = (a, b) => `${a}|${b || a}`;

export const RHYTHMS = [
  {
    id: 'swing', name: 'Swing', sig: '4/4', bpm: 126, swing: 0.66, kit: 'sticks',
    about: 'Ride cymbal, hat on two and four, a walking bass.',
    A: {
      ride: bar2('X...|x.x.|X...|x.x.'),
      hat: bar2('....|x...|....|x...'),
      kick: bar2('o...|o...|o...|o...'),
      snare: bar2('....|....|....|..o.', '....|..o.|....|....'),
      bass: bar2('W...|W...|W...|W...'),
      comp: [0, 6, 22, 30],
    },
    B: {
      ride: bar2('X...|x.x.|X...|x.x.'),
      hat: bar2('....|x...|....|x...'),
      kick: bar2('o...|o...|o...|o...', 'o...|o...|o...|..x.'),
      snare: bar2('....|..o.|....|..o.', '..o.|....|..o.|x.o.'),
      bass: bar2('W...|W...|W...|W...'),
      comp: [6, 14, 16, 22],
    },
  },
  {
    id: 'ballad', name: 'Brushes ballad', sig: '4/4', bpm: 63, swing: 0.62, kit: 'brushes',
    about: 'Brushes stirring, a soft tap on two and four, a bass in two.',
    A: {
      rim: bar2('x...|x...|x...|x...'),
      snare: bar2('....|o...|....|o...', '....|o...|....|o.o.'),
      hat: bar2('....|x...|....|x...'),
      kick: bar2('o...|....|o...|....'),
      bass: bar2('R...|....|5...|....', 'R...|....|5...|..a.'),
      comp: [0, 16],
    },
    B: {
      rim: bar2('x...|x...|x...|x...'),
      snare: bar2('....|o...|....|o.o.', '....|o...|..o.|o.o.'),
      hat: bar2('....|x...|....|x...'),
      ride: bar2('....|....|o...|..o.'),
      kick: bar2('o...|....|o...|....', 'o...|....|o...|..o.'),
      bass: bar2('R...|..5.|8...|..5.', 'R...|....|3...|a...'),
      comp: [0, 10, 16, 26],
    },
  },
  {
    id: 'bossa', name: 'Bossa nova', sig: '4/4', bpm: 128, swing: 0.5, kit: 'hand',
    about: 'Even eighths, a two-bar clave, a bass that leans into the next bar.',
    A: {
      kick: bar2('x...|..x.|x...|..x.'),
      hat: bar2('x.o.|x.o.|x.o.|x.o.'),
      rim: bar2('x...|..x.|....|x...', '....|x...|..x.|....'),
      bass: bar2('R...|..5.|5...|..N.'),
      comp: [0, 6, 12, 18, 24, 30],
    },
    B: {
      kick: bar2('x...|..x.|x...|..x.'),
      hat: bar2('x.o.|x.o.|x.o.|x.o.'),
      rim: bar2('x...|..x.|....|x...', '....|x...|..x.|....'),
      perc: bar2('....|....|..o.|o...', '..o.|....|..o.|o.o.'),
      bass: bar2('R...|..5.|5...|..N.', 'R...|..5.|8...|5.N.'),
      comp: [0, 6, 12, 18, 24, 30],
    },
  },
  {
    id: 'waltz', name: 'Jazz waltz', sig: '3/4', bpm: 132, swing: 0.64, kit: 'brushes',
    about: 'Three in a bar, lightly swung, the hat on two.',
    A: {
      ride: bar2('X...|x.x.|x...'),
      hat: bar2('....|x...|....'),
      kick: bar2('o...|....|....'),
      rim: bar2('x...|....|....'),
      bass: bar2('R...|....|5...', 'R...|....|a...'),
      comp: [0, 12, 18],
    },
    B: {
      ride: bar2('X...|x.x.|x...', 'X...|x.x.|x.x.'),
      hat: bar2('....|x...|x...'),
      kick: bar2('o...|....|....', 'o...|....|..o.'),
      snare: bar2('....|....|..o.', '....|..o.|..o.'),
      rim: bar2('x...|....|....'),
      bass: bar2('R...|5...|3...', 'R...|5...|a...'),
      comp: [0, 6, 12, 18],
    },
  },
  {
    id: 'six', name: 'Six-eight', sig: '6/8', bpm: 58, swing: 0.5, kit: 'hand',
    about: 'Two slow beats of three, with the long bell pattern over the top.',
    A: {
      hat: bar2('X.o.o.|x.o.o.'),
      kick: bar2('x.....|......', 'x.....|....o.'),
      snare: bar2('......|x.....'),
      rim: bar2('x...x.|..x.x.', '..x...|x...x.'),
      bass: bar2('R.....|5.....', 'R.....|5...a.'),
      comp: [0, 12],
    },
    B: {
      hat: bar2('X.o.o.|x.o.o.'),
      kick: bar2('x.....|....o.'),
      snare: bar2('......|x.....', '......|x...o.'),
      rim: bar2('x...x.|..x.x.', '..x...|x...x.'),
      perc: bar2('....o.|....o.'),
      bass: bar2('R...5.|8...5.', 'R...3.|5...a.'),
      comp: [0, 6, 12, 18],
    },
  },
  {
    id: 'even', name: 'Even-eighths ballad', sig: '4/4', bpm: 72, swing: 0.5, kit: 'box',
    about: 'Straight and spacious: a rim click on two and four.',
    A: {
      kick: bar2('x...|..o.|x...|....', 'x...|..o.|x...|..o.'),
      rim: bar2('....|x...|....|x...'),
      hat: bar2('x.o.|x.o.|x.o.|x.o.'),
      bass: bar2('R...|....|R...|..5.', 'R...|....|5...|..a.'),
      comp: [0, 16],
    },
    B: {
      kick: bar2('x...|..o.|x...|..o.', 'x...|..o.|x.o.|....'),
      rim: bar2('....|x...|....|x...', '....|x...|....|x.x.'),
      hat: bar2('x.o.|x.o.|x.o.|x.o.'),
      perc: bar2('..o.|..o.|..o.|..o.'),
      bass: bar2('R...|..5.|8...|..5.', 'R...|..3.|5...|a...'),
      comp: [0, 6, 16, 22],
    },
  },
];
export const rhythmById = (id) => RHYTHMS.find((r) => r.id === id) || RHYTHMS[0];
// The rhythm to fall back on when a tune needs a different number of beats.
export const rhythmForBeats = (beats) => (beats === 3 ? 'waltz' : beats === 6 ? 'six' : null);

// One pattern of a rhythm, laid out in steps.
export function patternOf(rhythm, which = 'A') {
  const sig = SIGS[rhythm.sig];
  const src = rhythm[which] || rhythm.A;
  const p = emptyPattern(sig, 2);
  const n = patternSteps(p, sig);
  for (const lane of LANES) p.drums[lane] = fit(parseDrums(src[lane]), n, 0);
  p.bass = fit(parseBass(src.bass), n, null);
  return p;
}

// The four patterns a rhythm starts with: A, B, and copies of each to change.
export function patternsOf(rhythm) {
  const out = {};
  PATTERN_IDS.forEach((id, i) => { out[id] = patternOf(rhythm, i % 2 ? 'B' : 'A'); });
  return out;
}

// The steps of a pattern where the rhythm would strike a chord.
export const compSteps = (rhythm, which = 'A') => (rhythm[which] || rhythm.A).comp || [0];
