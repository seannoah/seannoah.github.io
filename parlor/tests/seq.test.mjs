// Tests for the loop's arithmetic: steps, swing, patterns, chains and chart timelines.

import test from 'node:test';
import assert from 'node:assert/strict';

import { SIGS, stepsPerBar, stepOffset, stepTime, stepLength, gateTime, nearestStepAt, emptyPattern, patternSteps, parseDrums, parseBass, fit, resizePattern, putChord, removeChordAt, chordAt, chordGate, chainSteps, locate, buildTimeline, timelineAt, timelineAtStep, tapTempo, clampTempo, LANES, PATTERN_IDS } from '../js/seq.js';
import { RHYTHMS, KITS, KIT_IDS, patternOf, patternsOf, compSteps, rhythmById, rhythmForBeats } from '../js/rhythms.js';
import { ROLE_IDS } from '../js/bass.js';
import { parseChart, readChart } from '../js/harmony.js';
import { TUNES, tuneById, parseKey } from '../js/tunes.js';

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} is not ${b}`);
const four = SIGS['4/4']; const three = SIGS['3/4']; const six = SIGS['6/8'];

test('bars are made of steps', () => {
  assert.equal(stepsPerBar(four), 16);
  assert.equal(stepsPerBar(three), 12);
  assert.equal(stepsPerBar(six), 12);
});

test('straight time: every step is the same length', () => {
  for (let g = 0; g < 40; g++) near(stepLength(g, 120, four, 0.5), 0.125);
  near(stepTime(16, 120, four, 0.5), 2);          // one bar of four at 120 lasts two seconds
  near(stepTime(12, 90, three, 0.5), 2);          // one bar of three at 90
  near(stepTime(12, 60, six, 0.5), 2);            // one bar of six-eight: two beats
  near(stepLength(5, 60, six), 1 / 6);
});

test('swing moves the second eighth later and leaves the beat alone', () => {
  assert.deepEqual([0, 1, 2, 3].map((i) => stepOffset(i, four, 0.5)), [0, 0.25, 0.5, 0.75]);
  near(stepOffset(2, four, 2 / 3), 2 / 3);        // a triplet feel
  near(stepOffset(1, four, 2 / 3), 1 / 3);
  near(stepOffset(3, four, 2 / 3), 5 / 6);
  near(stepOffset(2, four, 0.9), 0.75);           // never later than a dotted eighth
  near(stepOffset(2, four, 0.2), 0.5);            // never earlier than even
  near(stepOffset(3, six, 0.7), 0.5);             // six-eight does not swing
  for (const swing of [0.5, 0.58, 0.66, 0.75]) {
    for (let beat = 0; beat < 9; beat++) near(stepTime(beat * 4, 100, four, swing), beat * 0.6);
    near(stepTime(32, 100, four, swing), 4.8);     // two bars last the same whatever the swing
    for (let g = 0; g < 48; g++) assert.ok(stepLength(g, 100, four, swing) > 0, 'time only moves forward');
  }
  // the long and short eighths of a bar add up to the bar
  let sum = 0;
  for (let g = 0; g < 16; g++) sum += stepLength(g, 132, four, 0.66);
  near(sum, 4 * 60 / 132);
});

test('how long a held chord lasts', () => {
  near(gateTime(0, 16, 120, four, 0.66), 2);
  near(gateTime(2, 2, 120, four, 2 / 3), 0.5 / 3);   // the short eighth
  near(gateTime(0, 2, 120, four, 2 / 3), 1 / 3);     // the long eighth
});

test('what is played snaps to the nearest step', () => {
  for (const sig of [four, three, six]) for (const swing of [0.5, 0.62, 0.7]) {
    for (let g = 0; g < 50; g++) {
      const t = stepTime(g, 96, sig, swing);
      assert.equal(nearestStepAt(t, 96, sig, swing), g);
      assert.equal(nearestStepAt(t + 0.01, 96, sig, swing), g);
      assert.equal(nearestStepAt(Math.max(0, t - 0.01), 96, sig, swing), g);
    }
  }
  assert.equal(nearestStepAt(0.12, 120, four, 0.5), 1);
  assert.equal(nearestStepAt(0.49, 120, four, 0.5), 4);   // just before beat two
  assert.equal(nearestStepAt(-1, 120, four, 0.5), 0);
});

test('writing lanes as text', () => {
  assert.deepEqual(parseDrums('X...|x.o.'), [3, 0, 0, 0, 2, 0, 1, 0]);
  assert.deepEqual(parseBass('R...|5..a'), ['R', null, null, null, '5', null, null, 'a']);
  assert.deepEqual(fit([1, 2], 5, 0), [1, 2, 1, 2, 1]);
  assert.deepEqual(fit([], 3, null), [null, null, null]);
});

test('every rhythm fits its bars and uses sounds that exist', () => {
  assert.ok(RHYTHMS.length >= 5);
  assert.ok(KIT_IDS.length >= 2);
  for (const r of RHYTHMS) {
    const sig = SIGS[r.sig];
    assert.ok(sig, r.id);
    assert.ok(KITS[r.kit], `${r.id} kit`);
    assert.ok(r.bpm >= 40 && r.bpm <= 240);
    for (const which of ['A', 'B']) {
      const src = r[which];
      const total = 2 * stepsPerBar(sig);
      for (const lane of LANES) {
        if (!src[lane]) continue;
        const len = parseDrums(src[lane]).length;
        assert.equal(len, total, `${r.id} ${which} ${lane} is ${len} steps`);
        assert.ok(/^[.oxX|\s]+$/.test(src[lane]), `${r.id} ${which} ${lane}`);
      }
      const bass = parseBass(src.bass);
      assert.equal(bass.length, total, `${r.id} ${which} bass`);
      assert.ok(bass.every((x) => x === null || ROLE_IDS.includes(x)), `${r.id} ${which} bass jobs`);
      assert.ok(bass[0], `${r.id} ${which}: the bass plays on one`);
      assert.ok(compSteps(r, which).every((s) => s >= 0 && s < total));
      const p = patternOf(r, which);
      assert.equal(patternSteps(p, sig), total);
      assert.ok(LANES.some((lane) => p.drums[lane].some((v) => v > 0)));
    }
    assert.deepEqual(Object.keys(patternsOf(r)), PATTERN_IDS);
  }
  for (const kit of Object.values(KITS)) {
    for (const lane of LANES) {
      assert.ok(kit.lanes[lane].label, `${kit.id} ${lane}`);
      assert.ok(['kick', 'noise', 'sweep', 'metal', 'click', 'tom'].includes(kit.lanes[lane].type));
      assert.ok(kit.lanes[lane].gain > 0 && kit.lanes[lane].gain <= 1);
    }
  }
  assert.equal(rhythmById('nope').id, 'swing');
  assert.equal(rhythmForBeats(3), 'waltz');
  assert.equal(rhythmForBeats(6), 'six');
  assert.equal(rhythmForBeats(4), null);
});

test('patterns grow by repeating and shrink by cutting', () => {
  let p = emptyPattern(four, 1);
  p.drums.kick[0] = 3;
  p.bass[4] = '5';
  p = putChord(p, { s: 8, len: 4, n: 4 });
  const two = resizePattern(p, four, 2);
  assert.equal(patternSteps(two, four), 32);
  assert.equal(two.drums.kick[16], 3);
  assert.equal(two.bass[20], '5');
  assert.deepEqual(two.chords.map((e) => e.s), [8, 24]);
  const one = resizePattern(two, four, 1);
  assert.deepEqual(one.chords.map((e) => e.s), [8]);
  assert.equal(one.drums.kick.length, 16);
});

test('chord events', () => {
  let p = emptyPattern(four, 1);
  p = putChord(p, { s: 8, len: null, n: 4 });
  p = putChord(p, { s: 0, len: 2, n: 0 });
  p = putChord(p, { s: 8, len: null, n: 6 });               // replaces the one already on step 8
  assert.deepEqual(p.chords.map((e) => [e.s, e.n]), [[0, 0], [8, 6]]);
  assert.equal(chordAt(p, 8).n, 6);
  assert.equal(chordAt(p, 3), null);
  assert.equal(chordGate(p, p.chords[0], 16), 2);            // its own length
  assert.equal(chordGate(p, p.chords[1], 16), 8);            // rings round to the first event again
  assert.equal(chordGate(p, p.chords[1], 16, 4), 4);         // unless a longest length is given
  p = putChord(p, { s: 1, len: null, n: 2 });
  assert.equal(chordGate(p, p.chords[0], 16), 1);            // cut short by the next event
  assert.equal(removeChordAt(p, 1).chords.length, 2);
});

test('chains play their patterns in turn, round and round', () => {
  const patterns = { A: emptyPattern(four, 2), B: emptyPattern(four, 1), C: emptyPattern(four, 1), D: emptyPattern(four, 1) };
  const chain = ['A', 'A', 'B', 'A'];
  assert.equal(chainSteps(chain, patterns, four), 112);
  assert.deepEqual(locate(0, chain, patterns, four), { slot: 0, id: 'A', step: 0, lap: 0, bar: 0 });
  assert.deepEqual(locate(33, chain, patterns, four), { slot: 1, id: 'A', step: 1, lap: 0, bar: 2 });
  assert.deepEqual(locate(64, chain, patterns, four), { slot: 2, id: 'B', step: 0, lap: 0, bar: 4 });
  assert.deepEqual(locate(80, chain, patterns, four), { slot: 3, id: 'A', step: 0, lap: 0, bar: 5 });
  assert.deepEqual(locate(112 + 79, chain, patterns, four), { slot: 2, id: 'B', step: 15, lap: 1, bar: 11 });
});

test('a chart is laid out in steps', () => {
  const tune = tuneById('embraceable');
  const key = parseKey(tune.key);
  const tl = buildTimeline(readChart(parseChart(tune.chart), () => 0, key.root, key.minor), four);
  assert.equal(tl.bars, 32);
  const bar6 = tl.entries.filter((e) => e.bar === 5);       // | Eb7 C7 |
  assert.deepEqual(bar6.map((e) => [e.symbol, e.from, e.to]), [['E♭7', 0, 8], ['C7', 8, 16]]);
  const bar28 = tl.entries.filter((e) => e.bar === 27);     // | Bm7b5 Bm7b5 Bbm7 Eb7 |
  assert.deepEqual(bar28.map((e) => [e.from, e.to]), [[0, 8], [8, 12], [12, 16]]);
  assert.equal(timelineAt(tl, 5, 7).symbol, 'E♭7');
  assert.equal(timelineAt(tl, 5, 8).symbol, 'C7');
  assert.equal(timelineAt(tl, 32, 0).symbol, 'F');          // round to the top
  assert.equal(timelineAtStep(tl, 5 * 16 + 9).symbol, 'C7');
  // Gm7 is played with B♭ major 6, and the bass keeps G
  const gm7 = timelineAt(tl, 2, 0);
  assert.deepEqual([gm7.h.root, gm7.h.scale, gm7.h.bass, gm7.h.family], [10, 'maj6', 7, 'min7']);
  assert.equal(timelineAt(null, 0, 0), null);
});

test('a chart in three lands its chords on beats', () => {
  const tune = tuneById('someday');
  const key = parseKey(tune.key);
  const tl = buildTimeline(readChart(parseChart(tune.chart), () => 0, key.root, key.minor), three);
  assert.equal(tl.per, 12);
  const split = tl.entries.filter((e) => e.bar === 29);     // | Cm7 F7 |
  assert.deepEqual(split.map((e) => [e.from, e.to]), [[0, 8], [8, 12]]);
});

test('every tune makes a timeline in its own time', () => {
  for (const tune of TUNES) {
    const sig = tune.beats === 3 ? three : tune.beats === 6 ? six : four;
    const key = parseKey(tune.key);
    const tl = buildTimeline(readChart(parseChart(tune.chart), () => 0, key.root, key.minor), sig);
    assert.ok(tl.bars >= 4, tune.id);
    for (const e of tl.entries) assert.ok(e.from >= 0 && e.to > e.from && e.to <= tl.per, `${tune.id} bar ${e.bar + 1}`);
    for (let bar = 0; bar < tl.bars; bar++) assert.ok(timelineAt(tl, bar, 0), `${tune.id} bar ${bar + 1}`);
  }
});

test('tempo', () => {
  assert.equal(clampTempo(10), 40);
  assert.equal(clampTempo(999), 240);
  assert.equal(tapTempo([0, 0.5, 1, 1.5]), 120);
  assert.equal(tapTempo([0]), null);
  assert.equal(tapTempo([0, 5]), null);                     // too slow to be a tap
});
