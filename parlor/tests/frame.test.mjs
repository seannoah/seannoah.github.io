// Tests for the two-hands instrument's rules: the distance between the hands decides the
// floor, the mirror, borrowed melodies, and chords carried across a change of harmony.

import test from 'node:test';
import assert from 'node:assert/strict';

import { harmony, isOn, mod } from '../js/theory.js';
import { FLOORS, SHAPES, shapeSteps } from '../js/floors.js';
import { stations, reflect } from '../js/moves.js';
import { parseChart, readChart } from '../js/harmony.js';
import { TUNES } from '../js/tunes.js';
import { KEYS_PER_HAND, BASS_DROP, MIRROR, anchorStep, midiOfRow, rowOfMidi, leftRows, rightRows, underPart, chordRows, frameName, frameMotion, spell, noteOfRow, soundingName } from '../js/frame.js';

const C = harmony(0, 'maj6');
const FLOOR = 60;   // row 0 is the on note nearest middle C

test('each hand has an octave of keys, the left a little lower', () => {
  assert.equal(KEYS_PER_HAND, 9);
  assert.deepEqual(rightRows(), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(leftRows(), [-4, -3, -2, -1, 0, 1, 2, 3, 4]);
  assert.deepEqual(leftRows(true), leftRows().map((r) => r - MIRROR));
  assert.equal(BASS_DROP % 2, 0, 'so that even keys are on notes in both hands');
});

test('the distance between the hands decides the floor', () => {
  const names = ['unison', 'thirds', 'triads', 'shells', 'octaves', 'drop2', 'drop3', 'drop24', 'dbl'];
  for (let bass = -8; bass <= 4; bass++) for (let span = 0; span <= 16; span += 2) {
    const melody = bass + span;
    const part = underPart(bass, melody);
    assert.equal(part.kind, span ? 'floor' : 'unison');
    assert.equal(FLOORS[part.floor].id, names[span / 2]);
    // the chord is exactly that floor's shape beneath the melody
    assert.deepEqual(chordRows(part, melody), span ? shapeSteps(part.shape, melody) : [melody]);
  }
  assert.equal(frameName(0, 4, underPart(0, 4)), 'Triad');
  assert.equal(frameName(-2, 4, underPart(-2, 4)), 'Low shell');
  assert.equal(frameName(0, 0, underPart(0, 0)), 'Unison');
});

test('the mirror turns each small floor into its wide reflection', () => {
  for (let span = 0; span <= 8; span += 2) {
    const small = underPart(0, span);
    const wide = underPart(0 - MIRROR, span);
    assert.equal(wide.floor, reflect(small.floor));
    assert.equal(wide.rows[0], small.rows[0] - 8, 'the same bass note an octave lower');
  }
});

test('what the left hand sounds belongs to the bass and stays below the melody', () => {
  for (let bass = -12; bass <= 4; bass++) for (let melody = bass; melody <= bass + 16; melody++) {
    const part = underPart(bass, melody);
    assert.equal(part.rows[0], bass);
    assert.ok(part.rows.every((r) => isOn(r) === isOn(bass)), `${bass} under ${melody}`);
    assert.ok(part.rows.every((r, i) => (i === 0 || r > part.rows[i - 1])), 'low to high');
    if (melody > bass) assert.ok(part.rows.every((r) => r < melody), 'below the melody');
    assert.ok(part.rows.length <= 3, 'never more than three notes beneath');
  }
});

test('hands on different chords: the melody is borrowed', () => {
  // melody on the second, an octave and a step above a root in the bass: the drop 2 that
  // belongs under the third, with its top taken by the melody
  const part = underPart(0, 9);
  assert.equal(part.kind, 'borrowed');
  assert.deepEqual(part.rows, [0, 4, 6]);
  assert.equal(frameName(0, 9, part), 'On chord beneath a borrowed melody');
  // the bass steps down to an off note under a held on melody: an off third beneath it
  const under = underPart(-1, 4);
  assert.deepEqual(under.rows, [-1, 1]);
  assert.equal(frameName(-1, 4, under), 'Off chord beneath the melody');
  // neighbors: nothing fits between
  assert.deepEqual(underPart(3, 4).rows, [3]);
});

test('where a floor has two shapes, the inner voice that moves least is chosen', () => {
  assert.equal(underPart(0, 6).shape, 'shell.low');            // nothing before: the first
  assert.equal(underPart(0, 6, [4]).shape, 'shell.high');      // an inner voice already on the fifth
  assert.equal(underPart(0, 6, [2]).shape, 'shell.low');
  assert.equal(underPart(0, 8, [4, 6]).shape, 'oct.high');
});

test('edges: one hand alone, crossed hands, hands too far apart', () => {
  assert.deepEqual(underPart(2, null), { rows: [2], inner: [], kind: 'bass', floor: null, shape: null });
  assert.equal(underPart(5, 2).kind, 'crossed');
  assert.deepEqual(chordRows(underPart(5, 2), 2), [2, 5]);
  assert.equal(underPart(-12, 8).kind, 'wide');
  assert.equal(frameName(null, 3, null), 'Melody alone');
  assert.equal(frameName(3, null, underPart(3, null)), 'Bass alone');
  assert.equal(frameName(null, null, null), '');
});

test('rows are anchored to pitch, not to the root', () => {
  assert.equal(anchorStep(C, FLOOR), 0);
  assert.equal(midiOfRow(C, FLOOR, 0), 60);
  assert.equal(anchorStep(harmony(5, 'maj6'), FLOOR), 4);          // in F6, row 0 is still C: its fifth
  assert.equal(noteOfRow(harmony(5, 'maj6'), FLOOR, 0).label, '5');
  assert.equal(noteOfRow(harmony(9, 'min6'), FLOOR, 0).label, '♭3');
  for (let pc = 0; pc < 12; pc++) for (const scale of ['maj6', 'min6', 'dom7', 'dom7b5', 'dim']) {
    const h = harmony(pc, scale);
    assert.ok(isOn(anchorStep(h, FLOOR)), 'row 0 is always an on note');
    assert.ok(Math.abs(midiOfRow(h, FLOOR, 0) - FLOOR) <= 2, 'and never far from the floor');
    for (let r = -8; r <= 8; r++) assert.equal(rowOfMidi(h, FLOOR, midiOfRow(h, FLOOR, r)), r);
  }
});

test('a chord left on the same rows is carried by the shortest route', () => {
  // Foundations I, Substitution Ex. 4, as rows: C6, Am6, C°7, F6, A♭m6, C6
  const tune = TUNES.find((t) => t.id === 'a-train-sub');
  const read = readChart(parseChart(tune.chart), () => 0, 0, false);
  const rows = [-8, -4, -2, 2];                                    // C G A E
  const heard = read.slice(0, 8).map((c) => rows.map((r) => midiOfRow(harmony(c.use.root, c.use.scale), FLOOR, r)));
  assert.deepEqual(heard, [
    [48, 55, 57, 64], [48, 55, 57, 64],       // C6
    [48, 54, 57, 64], [48, 54, 57, 64],       // Am6: G falls to F♯
    [48, 54, 57, 63],                         // C°7: E falls to E♭
    [48, 53, 57, 62],                         // F6: F♯ to F, E♭ to D
    [47, 53, 56, 63],                         // A♭m6
    [48, 55, 57, 64],                         // home
  ]);
  assert.deepEqual(spell(harmony(5, 'maj6'), FLOOR, rows), ['C', 'F', 'A', 'D']);
  // round a key's stations, no key ever moves further than a minor third
  for (let tonic = 0; tonic < 12; tonic++) {
    const list = stations(harmony(tonic, 'maj6')).map((s) => s.h);
    const floor = 53 + mod(tonic - 53, 12);
    for (const a of list) for (const b of list) for (let r = -8; r <= 8; r++) {
      assert.ok(Math.abs(midiOfRow(a, floor, r) - midiOfRow(b, floor, r)) <= 3, `row ${r} in key ${tonic}`);
    }
  }
});

test('what the hands did, in words', () => {
  const at = (bass, melody) => ({ bass, melody });
  assert.equal(frameMotion(at(0, 4), at(-1, 5)), 'Melody steps up, bass steps down: contrary.');
  assert.equal(frameMotion(at(0, 4), at(1, 5)), 'Melody steps up, bass steps up: parallel.');
  assert.equal(frameMotion(at(0, 4), at(0, 6)), 'Melody leaps up to the next note of the chord, bass holds: oblique.');
  assert.equal(frameMotion(at(0, 4), at(0, 4)), '');
  assert.equal(frameMotion(at(null, 4), at(0, 4)), '');
  assert.equal(frameMotion(null, at(0, 4)), '');
});

test('the Elevator opens as the hands step apart', () => {
  // The Elevator Sequence in C minor 6 diminished: the melody climbs C D E♭ F G while the
  // bass walks down C B A G♯ G, a floor wider on every note
  const h = harmony(0, 'min6');
  const ride = [[0, 0], [-1, 1], [-2, 2], [-3, 3], [-4, 4]].map(([bass, melody]) => {
    const part = underPart(bass, melody);
    return [frameName(bass, melody, part), spell(h, FLOOR, chordRows(part, melody)).join(' ')];
  });
  assert.deepEqual(ride, [
    ['Unison', 'C'],
    ['Third', 'B D'],
    ['Triad', 'A C E♭'],
    ['Low shell', 'G♯ B F'],
    ['Octave, low shell below', 'G A E♭ G'],
  ]);
  assert.ok(SHAPES['oct.low']);
});

test('what is ringing gets a name, even when the hands moved apart from a floor', () => {
  assert.equal(soundingName(null, null), '');
  assert.equal(soundingName(null, 4), 'Melody alone');
  assert.equal(soundingName([0], null), 'Bass alone');
  assert.equal(soundingName([0, 2], 4), 'Triad');
  assert.equal(soundingName([0, 2], 6), 'Low shell');                  // the melody leapt, the left hand stayed
  assert.equal(soundingName([0, 2], 8), 'Third beneath the melody');
  assert.equal(soundingName([0], 4), 'Two voices, a fifth apart');
  assert.equal(soundingName([0], 6), 'Two voices, a sixth apart');
  assert.equal(soundingName([0, 4, 6], 9), 'On chord beneath a borrowed melody');
  assert.equal(soundingName([-1, 1], 4), 'Off chord beneath the melody');
  assert.equal(soundingName([4], 4), 'Unison');
  assert.equal(soundingName([5], 2), 'Bass above the melody');
  assert.equal(soundingName([-4, 0, 2], 6), 'Drop 2');
  assert.equal(soundingName([-4, 0, 3], 6), 'A chord beneath the melody');
});
