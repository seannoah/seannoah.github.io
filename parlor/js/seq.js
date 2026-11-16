// seq.js — the loop's arithmetic: steps, swing, patterns, chains, and a chart laid out
// in steps. No audio and no page code here, so all of it can be tested in Node.
//
// Time is counted in steps. A bar is `beats` beats of `spb` steps each. In 4/4 and 3/4 a
// step is a sixteenth note; in 6/8 the beat is a dotted quarter and a step is a sixteenth
// too (six to the beat). Tempo is beats per minute.

import { harmony, mod } from './theory.js';

export const SIGS = {
  '4/4': { id: '4/4', beats: 4, spb: 4, swings: true, say: 'four' },
  '3/4': { id: '3/4', beats: 3, spb: 4, swings: true, say: 'three' },
  '6/8': { id: '6/8', beats: 2, spb: 6, swings: false, say: 'six-eight' },
};
export const stepsPerBar = (sig) => sig.beats * sig.spb;

// ---- swing ----
// Swing moves the second eighth note of each beat later: 0.5 is even, 0.667 is a triplet
// feel. Sixteenths either side of it stretch to fit. Where a step falls, as a fraction of
// its beat:
export function stepOffset(i, sig, swing = 0.5) {
  if (!sig.swings || sig.spb !== 4) return i / sig.spb;
  const s = Math.max(0.5, Math.min(0.75, swing));
  return [0, s / 2, s, s + (1 - s) / 2][i];
}

// Seconds from the start of the loop to step g, at a steady tempo.
export function stepTime(g, bpm, sig, swing = 0.5) {
  const beat = Math.floor(g / sig.spb);
  return (beat + stepOffset(g - beat * sig.spb, sig, swing)) * (60 / bpm);
}
// Seconds from step g to the step after it.
export const stepLength = (g, bpm, sig, swing = 0.5) => stepTime(g + 1, bpm, sig, swing) - stepTime(g, bpm, sig, swing);
// Seconds that `len` steps starting at g last.
export const gateTime = (g, len, bpm, sig, swing = 0.5) => stepTime(g + len, bpm, sig, swing) - stepTime(g, bpm, sig, swing);

// The step nearest to a moment (seconds from the start of the loop): used to snap what
// is played to the grid when recording.
export function nearestStepAt(t, bpm, sig, swing = 0.5) {
  const beat = Math.max(0, Math.floor(t / (60 / bpm)));
  let best = beat * sig.spb;
  let far = Infinity;
  for (let g = beat * sig.spb; g <= (beat + 1) * sig.spb; g++) {
    const d = Math.abs(stepTime(g, bpm, sig, swing) - t);
    if (d < far) { far = d; best = g; }
  }
  return best;
}

// ---- patterns ----
export const LANES = ['kick', 'snare', 'hat', 'ride', 'rim', 'perc'];
export const PATTERN_IDS = ['A', 'B', 'C', 'D'];
export const VELOCITY = [0, 0.38, 0.72, 1];

export function emptyPattern(sig, bars = 1) {
  const n = bars * stepsPerBar(sig);
  const drums = {};
  for (const lane of LANES) drums[lane] = new Array(n).fill(0);
  return { bars, drums, bass: new Array(n).fill(null), chords: [] };
}
export const patternSteps = (p, sig) => p.bars * stepsPerBar(sig);

// "X...|x.o." -> [3,0,0,0,2,0,1,0]. Bar lines and spaces are only for the eye.
const HIT = { '.': 0, o: 1, x: 2, X: 3 };
export const parseDrums = (text) => [...String(text || '').replace(/[|\s]/g, '')].map((c) => HIT[c] || 0);
// "R...|5..a" -> ['R',null,null,null,'5',null,null,'a']
export const parseBass = (text) => [...String(text || '').replace(/[|\s]/g, '')].map((c) => (c === '.' ? null : c));

// A lane written for some number of bars, tiled or cut to fit `n` steps.
export function fit(list, n, empty) {
  if (!list || !list.length) return new Array(n).fill(empty);
  return Array.from({ length: n }, (_, i) => list[i % list.length]);
}

// Change how many bars a pattern lasts. Growing repeats what is there; shrinking cuts.
export function resizePattern(p, sig, bars) {
  const old = patternSteps(p, sig);
  const n = bars * stepsPerBar(sig);
  const drums = {};
  for (const lane of LANES) drums[lane] = fit(p.drums[lane], n, 0);
  let chords = p.chords.filter((e) => e.s < n).map((e) => ({ ...e }));
  if (n > old) {
    for (let at = old; at < n; at += old) chords = chords.concat(p.chords.filter((e) => e.s + at < n).map((e) => ({ ...e, s: e.s + at })));
  }
  return { bars, drums, bass: fit(p.bass, n, null), chords };
}

// ---- chord events ----
// { s: step, len: steps or null (until the next event), n: melody scale step or 'auto',
//   steps: the chord as scale steps (null for 'auto'), floor: floor index, rest: true for a
//   stop, h: the harmony it was played in (used when no chart is being followed) }
export function putChord(p, ev) {
  const chords = p.chords.filter((e) => e.s !== ev.s);
  chords.push(ev);
  chords.sort((a, b) => a.s - b.s);
  return { ...p, chords };
}
export const removeChordAt = (p, s) => ({ ...p, chords: p.chords.filter((e) => e.s !== s) });
export const chordAt = (p, s) => p.chords.find((e) => e.s === s) || null;

// How many steps a chord event sounds: its own length, cut short by the next event. A
// chord with no length of its own rings until the next event, or for `longest` steps.
export function chordGate(p, ev, total, longest = total) {
  const later = p.chords.filter((e) => e.s > ev.s).map((e) => e.s);
  const next = later.length ? Math.min(...later) : total + (p.chords.length ? p.chords[0].s : ev.s);
  const room = Math.max(1, next - ev.s);
  return Math.max(1, Math.min(ev.len || longest, room, longest));
}

// ---- chains ----
// A chain is a list of pattern ids played one after another, round and round.
export function chainSteps(chain, patterns, sig) {
  return chain.reduce((sum, id) => sum + patternSteps(patterns[id], sig), 0);
}
// Where global step g falls: which slot of the chain, which pattern, which step of it.
export function locate(g, chain, patterns, sig) {
  const total = chainSteps(chain, patterns, sig);
  let rest = mod(g, total);
  for (let slot = 0; slot < chain.length; slot++) {
    const n = patternSteps(patterns[chain[slot]], sig);
    if (rest < n) return { slot, id: chain[slot], step: rest, lap: Math.floor(g / total), bar: Math.floor(g / stepsPerBar(sig)) };
    rest -= n;
  }
  return { slot: 0, id: chain[0], step: 0, lap: 0, bar: 0 };
}

// ---- a chart laid out in steps ----
// `read` is what harmony.readChart returns: one entry per chord, each with the scale of
// chords chosen for it. The timeline gives each a span of steps inside its bar.
export function buildTimeline(read, sig) {
  const per = stepsPerBar(sig);
  const snap = (frac) => {
    const s = Math.round(frac * per);
    return sig.id === '3/4' ? Math.round(s / sig.spb) * sig.spb : s;
  };
  const entries = read.map((c) => {
    const from = Math.min(per - 1, snap(c.start));
    return {
      index: c.index, bar: c.bar, from, to: per, symbol: c.text, family: c.family, options: c.options, pick: c.pick,
      how: c.use.how, movement: c.movement ? c.movement.name : null,
      h: harmony(c.use.root, c.use.scale, { bass: c.root, family: c.family, sharp: !!c.sharp }),
    };
  });
  // each chord lasts until the next one in its bar
  entries.forEach((e, i) => {
    const next = entries[i + 1];
    if (next && next.bar === e.bar) e.to = Math.max(e.from + 1, next.from);
  });
  const bars = entries.length ? Math.max(...entries.map((e) => e.bar)) + 1 : 0;
  return { entries, bars, per };
}

// The chord sounding at a step of a bar (bars wrap round the form).
export function timelineAt(tl, bar, step = 0) {
  if (!tl || !tl.bars) return null;
  const b = mod(bar, tl.bars);
  const inBar = tl.entries.filter((e) => e.bar === b);
  if (!inBar.length) {
    // an empty bar carries on with the chord before it
    for (let k = 1; k <= tl.bars; k++) {
      const prev = tl.entries.filter((e) => e.bar === mod(b - k, tl.bars));
      if (prev.length) return prev[prev.length - 1];
    }
    return null;
  }
  let hit = inBar[0];
  for (const e of inBar) if (e.from <= step) hit = e;
  return hit;
}
// The chord at global step g, and the one at a later step.
export const timelineAtStep = (tl, g) => (tl && tl.bars ? timelineAt(tl, Math.floor(g / tl.per), mod(g, tl.per)) : null);

// ---- tempo ----
export const TEMPO_MIN = 40;
export const TEMPO_MAX = 240;
export const clampTempo = (bpm) => Math.max(TEMPO_MIN, Math.min(TEMPO_MAX, Math.round(bpm)));
// Tempo from a run of taps (times in seconds): the average of the last few gaps.
export function tapTempo(times) {
  const recent = times.slice(-5);
  if (recent.length < 2) return null;
  const gaps = recent.slice(1).map((t, i) => t - recent[i]).filter((g) => g > 0.2 && g < 2);
  if (!gaps.length) return null;
  return clampTempo(60 / (gaps.reduce((a, b) => a + b, 0) / gaps.length));
}
