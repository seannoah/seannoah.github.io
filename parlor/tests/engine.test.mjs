// Tests for the music engine: scales of chords, floors, the moves, the bass, and chart reading.
// Run from the repository root:  node --test parlor/tests/*.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { SCALES, SCALE_ORDER, KEYS, harmony, harmonyNotes, harmonyTitle, chordLabel, chordPcs, midiAt, rootMidi, stepOfMidi, nearestStep, semisAt, stepSize, isOn, mod, REGISTER, midiName } from '../js/theory.js';
import { SHAPES, FLOORS, voicing, shapeSteps, shapeOn, spanOf, floorIndexOf, partsInside, shapeOfSteps } from '../js/floors.js';
import { nextChord, describeMotion, bassMove, borrow, underBorrowed, familyMove, formulaBetween, applyFormula, formulaText, familyOf, stations, stationOf, V_POSTS, voiceName, motionWords } from '../js/moves.js';
import { bassNote, bassTones, bassRootMidi, approach, nearestPc, ROLE_IDS, BASS_FLOOR } from '../js/bass.js';
import { parseChord, parseChart, readChart, scaleOptions, transposeChart } from '../js/harmony.js';
import { TUNES, parseKey } from '../js/tunes.js';

const pcs = (notes) => notes.map((n) => mod(n.midi, 12)).sort((a, b) => a - b);
const set = (list) => [...new Set(list.map((x) => mod(x, 12)))].sort((a, b) => a - b);
const C = harmony(0, 'maj6');

test('each scale is an on chord woven with the same off chord', () => {
  for (const id of SCALE_ORDER) {
    assert.equal(SCALES[id].semis.length, 8);
    // the off chord is always the major seven, second, fourth and sharp five
    assert.deepEqual(SCALES[id].semis.filter((_, i) => i % 2 === 1), [2, 5, 8, 11], id);
  }
  assert.deepEqual(chordPcs(C, true), [0, 4, 7, 9]);     // C E G A
  assert.deepEqual(chordPcs(C, false), [2, 5, 8, 11]);   // D F G♯ B
  assert.deepEqual(chordPcs(harmony(0, 'min6'), true), [0, 3, 7, 9]);
  assert.deepEqual(chordPcs(harmony(0, 'dom7'), true), [0, 4, 7, 10]);
  assert.deepEqual(chordPcs(harmony(0, 'dom7b5'), true), [0, 4, 6, 10]);
});

test('steps of the path are only ever a half step or a whole step', () => {
  for (const id of [...SCALE_ORDER, 'dim']) {
    for (let n = -9; n < 17; n++) assert.ok([1, 2].includes(stepSize(id, n, 1)), `${id} ${n}`);
    assert.equal(semisAt(id, 8), 12);
    assert.equal(semisAt(id, -8), -12);
  }
});

test('names and titles', () => {
  assert.deepEqual(harmonyNotes(C).map((n) => n.name), ['C', 'D', 'E', 'F', 'G', 'G♯', 'A', 'B']);
  assert.deepEqual(harmonyNotes(harmony(10, 'min6')).map((n) => n.name), ['B♭', 'C', 'D♭', 'E♭', 'F', 'F♯', 'G', 'A']);
  assert.equal(harmonyTitle(C), 'C major 6 diminished');
  assert.equal(harmonyTitle(harmony(6, 'dom7')), 'G♭ dominant 7 diminished');
  assert.equal(chordLabel(C), 'C6');
  assert.equal(chordLabel(C, false), 'B°7');
  assert.equal(chordLabel(harmony(5, 'min6')), 'Fm6');
  assert.equal(midiName(60), 'C4');
});

test('every key sits in the same octave-wide window', () => {
  for (const k of KEYS) {
    const m = rootMidi(k.pc);
    assert.ok(m >= REGISTER && m < REGISTER + 12, k.id);
    assert.equal(mod(m, 12), k.pc);
  }
  assert.equal(midiAt(C, 0), 60);
  assert.equal(midiAt(C, 8), 72);
  assert.equal(midiAt(C, -1), 59);
});

test('pitches and steps convert both ways', () => {
  for (const id of SCALE_ORDER) for (const k of KEYS.slice(0, 12)) {
    const h = harmony(k.pc, id);
    for (let n = -16; n <= 24; n++) assert.equal(stepOfMidi(h, midiAt(h, n)), n);
  }
  assert.equal(stepOfMidi(C, 61), null);           // C♯ is not in C major 6 diminished
  assert.equal(nearestStep(C, 61), 0);             // ties go down
  assert.equal(nearestStep(C, 62, 'on'), 0);       // D is off: the on note below wins the tie
  assert.equal(nearestStep(C, 63, 'on'), 2);
  assert.equal(nearestStep(C, 63, 'off'), 1);
  assert.equal(nearestStep(C, 64, 'off'), 3);          // F is nearer to E than D is
});

test('a drop 2 beneath the sixth of C6 is G C E A', () => {
  assert.deepEqual(voicing(C, 'drop2', 6).map((n) => n.midi), [55, 60, 64, 69]);
  assert.deepEqual(shapeSteps('drop2', 6), [-4, 0, 2, 6]);
  assert.deepEqual(voicing(C, 'triads', 4).map((n) => n.midi), [60, 64, 67]);
  assert.deepEqual(voicing(C, 'shell.low', 8).map((n) => n.midi), [64, 67, 72]);
});

test('every floor stays inside one chord, in every key and scale', () => {
  for (const id of SCALE_ORDER) for (const k of KEYS.slice(0, 12)) {
    const h = harmony(k.pc, id);
    for (const shape of Object.keys(SHAPES)) for (let top = 0; top < 16; top++) {
      const notes = voicing(h, shape, top);
      assert.ok(notes.every((n) => n.on === isOn(top)), `${shape} beneath ${top}`);
      assert.ok(notes.every((n, i) => i === 0 || n.midi > notes[i - 1].midi), 'low to high');
      assert.equal(notes[notes.length - 1].n, top);
      const want = chordPcs(h, isOn(top));
      assert.ok(notes.every((n) => want.includes(mod(n.midi, 12))));
    }
  }
});

test('each floor up puts the bass one chord note lower', () => {
  FLOORS.forEach((floor, i) => {
    assert.equal(floor.level, i + 1);
    for (const shape of floor.shapes) {
      assert.equal(spanOf(shape), 2 * i, shape);
      assert.equal(floorIndexOf(shape), i);
    }
  });
  assert.equal(shapeOn(3), 'shell.low');
  assert.equal(shapeOn(3, { shells: 1 }), 'shell.high');
  assert.equal(shapeOn(99), 'dbl');
});

test('walking the pads on the drop 2 floor is the scale in chords', () => {
  // C6 and B°7 in turn, each time the next inversion up
  for (let top = 0; top < 8; top++) {
    const got = pcs(voicing(C, 'drop2', top));
    assert.deepEqual(got, top % 2 === 0 ? [0, 4, 7, 9] : [2, 5, 8, 11]);
  }
});

test('floors within floors', () => {
  assert.deepEqual(partsInside('drop2', 'thirds'), [[1, 2]]);        // the middle two notes
  assert.deepEqual(partsInside('drop2', 'shell.low'), [[1, 2, 3]]);  // the top three
  assert.deepEqual(partsInside('drop2', 'shell.high'), [[0, 1, 2]]); // the bottom three
  assert.equal(partsInside('triads', 'thirds').length, 2);
  assert.equal(shapeOfSteps([-4, 0, 2, 6]), 'drop2');
  assert.equal(shapeOfSteps([0, 1]), null);
});

test('the shapes match the ones Woodshed checks against the course charts', async (t) => {
  const path = fileURLToPath(new URL('../../woodshed/js/floors.js', import.meta.url));
  if (!existsSync(path)) { t.skip('Woodshed is not in this checkout'); return; }
  const wood = await import(pathToFileURL(path).href);
  for (const [id, shape] of Object.entries(SHAPES)) assert.deepEqual(shape.steps, wood.SHAPES[id].steps, id);
  assert.deepEqual(FLOORS.map((f) => f.id), wood.FLOORS.map((f) => f.id));
});

// ---- motion ----
const chord = (floor, top) => ({ steps: shapeSteps(shapeOn(floor), top), floor });

test('parallel: the floor stays and the bass follows the melody', () => {
  const next = nextChord('parallel', chord(2, 4), 5, 2);
  assert.equal(next.floor, 2);
  assert.deepEqual(describeMotion(chord(2, 4).steps, next.steps), { top: 1, bass: 1, motion: 'parallel' });
});

test('contrary: melody up a step and up a floor, the bass steps down', () => {
  const from = chord(1, 2);                                // a third beneath the third
  const up = nextChord('contrary', from, 3, 1);
  assert.equal(up.shape, 'triads');
  assert.deepEqual(describeMotion(from.steps, up.steps), { top: 1, bass: -1, motion: 'contrary' });
  const down = nextChord('contrary', { steps: up.steps, floor: up.floor }, 2, up.floor);
  assert.equal(down.shape, 'thirds');
  assert.deepEqual(describeMotion(up.steps, down.steps), { top: -1, bass: 1, motion: 'contrary' });
  // a leap of two takes two floors, and the voices leap apart
  const leap = nextChord('contrary', from, 4, 1);
  assert.deepEqual(describeMotion(from.steps, leap.steps), { top: 2, bass: -2, motion: 'contrary' });
  // at the top floor there is nowhere wider to go
  assert.equal(nextChord('contrary', chord(8, 4), 5, 8).floor, 8);
  assert.equal(nextChord('contrary', chord(0, 4), 3, 0).floor, 0);
});

test('one sum covers every move', () => {
  assert.equal(bassMove(1, 1), -1);
  assert.equal(bassMove(1, 0), 1);
  assert.equal(bassMove(1, -1), 3);
  assert.equal(bassMove(2, 1), 0);
  assert.equal(bassMove(2, 2), -2);
  for (let f = 0; f < 8; f++) for (const d of [-2, -1, 1, 2]) {
    const from = chord(f, 8);
    const to = chord(f + 1, 8 + d);
    assert.equal(describeMotion(from.steps, to.steps).bass, bassMove(d, 1));
  }
});

test('oblique: the bass holds', () => {
  const triad = chord(2, 4);
  // the melody leaps to the next note of the chord: a triad opens into a shell
  const leap = nextChord('oblique', triad, 6, 2);
  assert.equal(leap.shape, 'shell.low');
  assert.deepEqual(describeMotion(triad.steps, leap.steps), { top: 2, bass: 0, motion: 'oblique' });
  // the melody steps: the lower voices stay behind, and on and off mix
  const step = nextChord('oblique', triad, 5, 2);
  assert.deepEqual(step.steps, [0, 2, 5]);
  assert.equal(step.shape, null);
  assert.equal(step.floor, 2);
  // a melody that drops below the held voices takes over from them
  assert.deepEqual(nextChord('oblique', triad, 1, 2).steps, [0, 1]);
  assert.equal(motionWords(describeMotion(triad.steps, leap.steps)), 'Melody leaps up to the next note of the chord, bass holds: oblique.');
});

// ---- borrowing ----
test('one voice steps to its neighbor and the others stay', () => {
  const c6 = shapeSteps('drop2', 6);                        // G C E A
  assert.deepEqual(borrow(c6, 2, -1), [-4, -1, 2, 6]);      // the root borrows below: G B E A
  assert.deepEqual(borrow(c6, 0, 1), [-4, 0, 2, 7]);        // the sixth borrows above
  assert.equal(borrow([0, 1], 0, -1), null);                // it would land on the voice below
  assert.equal(borrow([0, 2], 5, 1), null);                 // there is no such voice
  assert.equal(voiceName(4, 1), 'upper middle');
  assert.equal(voiceName(3, 1), 'middle');
  assert.equal(voiceName(2, 1), 'bottom');
});

test('an on chord kept beneath an off melody note', () => {
  // melody on the second: the low shell that belongs under the third, with its top lowered
  assert.deepEqual(underBorrowed('shell.low', 1, 1), [-4, -2, 1]);
  assert.deepEqual(underBorrowed('shell.low', 1, -1), [-6, -4, 1]);
  assert.deepEqual(underBorrowed('unison', 3, 1), [3]);
  const notes = underBorrowed('drop2', 7, 1);
  assert.ok(notes.slice(0, -1).every((n) => isOn(n)));
  assert.equal(notes[notes.length - 1], 7);
});

// ---- family ----
test('brothers and sisters: four chords a minor third apart', () => {
  assert.deepEqual(familyOf(harmony(5, 'min6')).map((h) => chordLabel(h)), ['Fm6', 'Dm6', 'Bm6', 'A♭m6']);
  let h = harmony(5, 'min6');
  for (let i = 0; i < 4; i++) h = familyMove(h, 'forward');
  assert.equal(h.root, 5);
  assert.equal(chordLabel(familyMove(harmony(0, 'maj6'), 'across')), 'G♭6');
  assert.equal(chordLabel(familyMove(harmony(0, 'maj6'), 'minor')), 'Cm6');
  assert.equal(familyMove(harmony(0, 'dom7'), 'minor'), null);
});

test('the formulas of the ii–V–I and the minor iv', () => {
  const f = (a, b) => formulaText(formulaBetween(a, b));
  const Eb6 = harmony(3, 'maj6'); const Cm6 = harmony(0, 'min6'); const Gbm6 = harmony(6, 'min6');
  const Bb6 = harmony(10, 'maj6'); const Ebm6 = harmony(3, 'min6'); const F6 = harmony(5, 'maj6');
  assert.equal(f(Eb6, Cm6), '[Forward, Minor]');             // inside: ii to the minor 6 on the 5
  assert.equal(f(Cm6, Bb6), '[Forward, Up, Major]');
  assert.equal(f(Eb6, Gbm6), '[Backward, Minor]');           // outside: ii to the tritone's minor
  assert.equal(f(Gbm6, Bb6), '[Backward, Up, Major]');
  assert.equal(f(Cm6, Gbm6), '[Across]');
  assert.equal(f(Eb6, Ebm6), '[Minor]');
  assert.equal(f(Ebm6, Bb6), '[Across, Up, Major]');
  assert.equal(f(Bb6, Eb6), '[Across, Down]');
  assert.equal(f(Gbm6, F6), '[Down, Major]');                // the soft landing
  assert.equal(f(Bb6, Bb6), '[Stay]');
  // any two 6th chords are joined by exactly one formula
  for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) for (const qa of ['maj6', 'min6']) for (const qb of ['maj6', 'min6']) {
    const from = harmony(a, qa); const to = harmony(b, qb);
    const back = applyFormula(from, formulaBetween(from, to));
    assert.deepEqual([back.root, back.scale], [to.root, to.scale]);
  }
});

// ---- stations ----
test('the stations round C', () => {
  const st = stations(C);
  const by = Object.fromEntries(st.map((s) => [s.id, s]));
  assert.deepEqual(st.map((s) => s.label), ['C6', 'F6', 'Fm6', 'Dm6', 'A♭m6', 'G7', 'D♭7', 'G7♭5']);
  assert.equal(by.ii.h.bass, 2);       // D under F6: it is Dm7
  assert.equal(by.on5.h.bass, 7);      // G under Dm6
  assert.equal(by.tm.h.bass, 7);
  assert.equal(by.tt.h.bass, 1);
  assert.equal(stationOf(C, harmony(8, 'min6')).id, 'tm');
  assert.equal(stationOf(C, harmony(9, 'min6')), null);
  assert.deepEqual(stations(harmony(0, 'min6')).map((s) => s.label), ['Cm6', 'Fm6', 'E♭6', 'Dm6', 'A♭m6', 'G7', 'D♭7', 'G7♭5']);
});

test('every way of playing the V chord is the off chord with one note moved a half step', () => {
  for (let tonic = 0; tonic < 12; tonic++) {
    const home = harmony(tonic, 'maj6');
    const off = chordPcs(home, false);
    for (const s of stations(home).filter((x) => V_POSTS.includes(x.id) || x.id === 'iv')) {
      const chord = chordPcs(s.h, true);
      const kept = chord.filter((pc) => off.includes(pc));
      const moved = chord.filter((pc) => !off.includes(pc));
      assert.equal(kept.length, s.id === 'b5' ? 2 : 3, `${s.id} in ${tonic}`);
      const left = off.filter((pc) => !chord.includes(pc));
      for (const pc of moved) assert.ok(left.some((o) => [1, 11].includes(mod(pc - o, 12))), `${s.id}: ${pc} is a half step from an off note`);
      // raise a note for a minor 6, lower one for a dominant
      const dir = mod(moved[0] - left.find((o) => [1, 11].includes(mod(moved[0] - o, 12))), 12) === 1 ? 'up' : 'down';
      assert.equal(dir, s.h.scale === 'min6' ? 'up' : 'down', s.id);
    }
    // all five keep the third and seventh of the V chord
    const guide = [mod(tonic + 11, 12), mod(tonic + 5, 12)];
    for (const s of stations(home).filter((x) => V_POSTS.includes(x.id))) assert.ok(guide.every((pc) => chordPcs(s.h, true).includes(pc)), s.id);
  }
});

// ---- bass ----
test('the bass keeps the root a bass player would keep', () => {
  const by = Object.fromEntries(stations(C).map((s) => [s.id, s.h]));
  assert.equal(bassRootMidi(C), 36);
  assert.equal(mod(bassRootMidi(by.on5), 12), 7);
  assert.deepEqual(bassTones(by.on5), { third: 4, fifth: 7, seventh: 10 });   // D minor 6 over G is G9
  assert.deepEqual(bassTones(by.tm), { third: 4, fifth: 8, seventh: 10 });    // A♭ minor 6 over G: a sharp five
  assert.deepEqual(bassTones(by.ii), { third: 3, fifth: 7, seventh: 10 });    // F6 over D is Dm7
  assert.deepEqual(bassTones(C), { third: 4, fifth: 7, seventh: 9 });
  assert.deepEqual(bassTones(harmony(0, 'maj6', { family: 'hdim' })), { third: 3, fifth: 6, seventh: 10 });
  for (let pc = 0; pc < 12; pc++) {
    const m = bassRootMidi(harmony(pc, 'maj6'));
    assert.ok(m >= BASS_FLOOR && m < BASS_FLOOR + 12);
  }
});

test('bass jobs', () => {
  const G = harmony(7, 'dom7');
  assert.equal(bassNote('R', C), 36);
  assert.equal(bassNote('5', C), 43);
  assert.equal(bassNote('3', C), 40);
  assert.equal(bassNote('8', C), 48);
  assert.equal(bassNote('N', C, { next: G }), 43);
  assert.equal(bassNote(null, C), null);
  assert.equal(approach(43, 40), 42);
  assert.equal(approach(36, 43), 37);
  assert.equal(nearestPc(7, 36), 31);
  assert.equal(nearestPc(7, 38), 43);
  // a walking bar: root first, an approach last
  assert.equal(bassNote('W', C, { count: 0, next: C, bar: 0 }), 36);
  assert.equal(bassNote('W', C, { count: 1, next: C, bar: 0, prev: 36 }), 40);
  assert.equal(bassNote('W', C, { count: 2, next: C, bar: 0, prev: 40 }), 43);
  const last = bassNote('W', C, { count: 3, next: G, bar: 0, prev: 43 });
  assert.ok([1, 11].includes(mod(last - 7, 12)), 'a half step from G');
  for (const role of ROLE_IDS) assert.equal(typeof bassNote(role, C, { next: G, prev: 36, count: 2 }), 'number');
});

// ---- reading a chart ----
test('chart chords become scales of chords', () => {
  assert.equal(scaleOptions(parseChord('Dm7'))[0].label, 'F major 6');
  assert.equal(scaleOptions(parseChord('Dm7b5'))[0].label, 'F minor 6');
  assert.equal(scaleOptions(parseChord('G7'), true)[0].how, "tritone's minor");
  assert.equal(scaleOptions(parseChord('G7'), true)[0].label, 'A♭ minor 6');
  assert.equal(scaleOptions(parseChord('G7'), false)[0].label, 'D minor 6');
  assert.equal(scaleOptions(parseChord('Cmaj7'))[0].label, 'C major 6');
  const read = readChart(parseChart('| Dm7 | G7 | C6 | % |'), () => 0, 0, false);
  assert.deepEqual(read.map((c) => c.use.label), ['F major 6', 'A♭ minor 6', 'C major 6', 'C major 6']);
  assert.equal(read[0].movement.name, 'Major ii–V7');
  assert.equal(transposeChart('| Dm7 | G7 |', 2), '| Em7 | A7 |');
});

test('every built-in tune reads from start to finish', () => {
  const bars = { embraceable: 32, stella: 32, 'another-you': 32, someday: 32, 'blues-bb': 12, 'blue-monk': 12, footprints: 12, 'my-romance': 8, 'a-train': 8, 'blue-bossa': 8 };
  for (const tune of TUNES) {
    const parsed = parseChart(tune.chart);
    if (bars[tune.id]) assert.equal(parsed.length, bars[tune.id], tune.id);
    assert.ok(parsed.every((b) => b.chords.length > 0), `${tune.id}: no empty bars`);
    const key = parseKey(tune.key);
    const read = readChart(parsed, () => 0, key.root, key.minor);
    for (const c of read) {
      assert.ok(SCALES[c.use.scale], `${tune.id}: ${c.text}`);
      assert.ok(c.options.length >= 1);
    }
  }
  assert.deepEqual(parseKey('Bb'), { root: 10, minor: false });
  assert.deepEqual(parseKey('Cm'), { root: 0, minor: true });
  assert.deepEqual(parseKey('F♯m'), { root: 6, minor: true });
});
