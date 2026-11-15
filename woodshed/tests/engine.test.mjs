// Run with: node --test woodshed/tests/
// These check the engine against fret numbers printed in the course charts.
import test from 'node:test';
import assert from 'node:assert/strict';
import { scaleNotes, chordName, stepSize, walkPath, SCALES } from '../js/theory.js';
import { voicings, voicingFor, SHAPES } from '../js/floors.js';

const frets = (v) => v.notes.map((n) => n.fret);
const names = (key, scale) => scaleNotes(key, scale).map((n) => n.name).join(' ');

test('scale spelling', () => {
  assert.equal(names('C', 'maj6'), 'C D E F G G♯ A B');
  assert.equal(names('C', 'min6'), 'C D E♭ F G G♯ A B');
  assert.equal(names('G', 'dom7'), 'G A B C D D♯ F F♯');
  assert.equal(names('G', 'dom7b5'), 'G A B C D♭ D♯ F F♯');
  assert.equal(names('F', 'maj6'), 'F G A B♭ C C♯ D E');
  assert.equal(names('D♭', 'maj6'), 'D♭ E♭ F G♭ A♭ A B♭ C');
  assert.equal(chordName('C', 'maj6', true), 'C6');
  assert.equal(chordName('C', 'maj6', false), 'B°7');
  assert.equal(chordName('G', 'maj6', false), 'F♯°7');
});

test('the off chord is always 7, 2, 4, sharp 5', () => {
  for (const id of Object.keys(SCALES)) {
    const off = [1, 3, 5, 7].map((i) => SCALES[id].semis[i]);
    assert.deepEqual(off, [2, 5, 8, 11]);
  }
});

test('paths: half and whole steps (Foundations I fig. 10)', () => {
  const path = (id) => [0, 1, 2, 3, 4, 5, 6, 7].map((d) => (stepSize(id, d, 1) === 1 ? 'H' : 'W')).join('');
  assert.equal(path('maj6'), 'WWHWHHWH');
  assert.equal(path('min6'), 'WHWWHHWH');
  assert.equal(path('dom7'), 'WWHWHWHH');
  assert.equal(path('dom7b5'), 'WWHHWWHH');
  // going down from a degree is the step up from the one below
  assert.equal(stepSize('maj6', 0, -1), 1);
  assert.equal(stepSize('maj6', 3, -1), 1);
});

test('walk path: C major 6 on string 2 runs root to root, frets 1 to 13', () => {
  const p = walkPath('C', 'maj6', 2, 1);
  assert.deepEqual(p.map((n) => n.fret), [1, 3, 5, 6, 8, 9, 10, 12, 13]);
  assert.deepEqual(p.map((n) => n.deg), [0, 1, 2, 3, 4, 5, 6, 7, 0]);
});

test('drop 2, C major 6 on strings 5-2 (Foundations I ex. 6)', () => {
  const v = voicings('C', 'maj6', 'drop2', [5, 4, 3, 2]);
  assert.deepEqual(frets(v[0]), [0, 2, 0, 1]); // C6, sixth in the bass, root on string 2
  assert.equal(v[0].topDeg, 0);
  assert.deepEqual(frets(v[2]), [3, 5, 2, 5]);
  // "fr." labels printed above the chord boxes from the fourth chord on
  assert.deepEqual(v.slice(3, 9).map((x) => x.minFret), [4, 5, 7, 9, 10, 12]);
  assert.deepEqual(v.slice(0, 9).map((x) => x.on), [true, false, true, false, true, false, true, false, true]);
});

test('thirds, G major 6 on string 6 (Thirds short lesson)', () => {
  const v = voicings('G', 'maj6', 'thirds', [6, 5]).filter((x) => x.notes[0].fret >= 3);
  assert.deepEqual(v.slice(0, 9).map((x) => x.minFret), [2, 3, 5, 6, 7, 9, 10, 12, 14]);
});

test('low shells, G major 6 on string 5 (Shell Chords short lesson)', () => {
  const v = voicings('G', 'maj6', 'shell.low', [5, 4, 3]).filter((x) => x.notes[0].fret >= 2);
  assert.deepEqual(frets(v[0]), [2, 0, 0]);
  assert.deepEqual(v.slice(3, 9).map((x) => x.minFret), [4, 5, 7, 9, 10, 12]);
});

test('high shell and low shell are the two halves of a closed chord', () => {
  // G6 as E-G-B-D from string 4: high shell keeps E, B, D; low shell keeps E, G, D.
  const hi = voicings('G', 'maj6', 'shell.high', [4, 3, 2]).find((x) => x.notes[0].fret === 2);
  const lo = voicings('G', 'maj6', 'shell.low', [4, 3, 2]).find((x) => x.notes[0].fret === 2);
  assert.deepEqual(frets(hi), [2, 4, 3]);
  assert.deepEqual(frets(lo), [2, 0, 3]);
});

test('octave chords: three variants, top doubles the bottom', () => {
  for (const id of ['oct.triad', 'oct.low', 'oct.high']) {
    for (const v of voicings('G', 'maj6', id, [5, 4, 3, 2])) {
      assert.equal(v.notes[3].midi - v.notes[0].midi, 12);
      assert.equal(v.topDeg, v.bottomDeg);
    }
  }
});

test('the wide floors match the example diagrams (Foundations I fig. 11)', () => {
  // All harmonise the G on string 2, fret 8, in C major 6.
  const at = (shape, set) => frets(voicingFor('C', 'maj6', shape, set, 'top', 4));
  assert.deepEqual(at('thirds', [3, 2]), [9, 8]);
  assert.deepEqual(at('drop2', [5, 4, 3, 2]), [7, 7, 5, 8]);
  assert.deepEqual(at('drop3', [6, 4, 3, 2]), [8, 7, 9, 8]);
  assert.deepEqual(at('drop24', [6, 5, 3, 2]), [5, 7, 5, 8]);
});

test('alternate double octave and the 5-string sets (fig. 11 and Reference Library p. 4)', () => {
  const c = voicings('C', 'maj6', 'dbl.alt', [6, 4, 3, 1]).find((v) => v.notes[0].fret === 3);
  assert.deepEqual(frets(c), [3, 2, 2, 3]);
  const g = voicings('G', 'maj6', 'dbl.alt', [6, 4, 3, 1]).find((v) => v.notes[0].fret === 3);
  assert.deepEqual(frets(g), [3, 2, 4, 3]);
  assert.equal(g.notes[3].midi - g.notes[0].midi, 24);
  const d3 = voicings('G', 'maj6', 'drop3', [5, 3, 2, 1]).find((v) => v.notes[0].fret === 5);
  assert.deepEqual(frets(d3), [5, 4, 5, 3]);
  const d24 = voicings('G', 'maj6', 'drop24', [5, 4, 2, 1]).find((v) => v.notes[0].fret === 2);
  assert.deepEqual(frets(d24), [2, 2, 3, 3]);
});

// The Elevator Sequence (Episode 16), p. 5: each floor harmonises a top line that climbs
// from C through one octave of C minor 6 diminished. Frets read off the chord diagrams.
const chart = (shape, set, bottomFret) => frets(voicings('C', 'min6', shape, set).find((v) => v.notes[0].fret === bottomFret));

test('drop 3 matches the full chart (The Elevator Sequence p. 5)', () => {
  const low = { 3: [3, 1, 2, 1], 4: [4, 3, 4, 3], 5: [5, 5, 5, 4], 7: [7, 6, 7, 6], 8: [8, 7, 8, 8], 10: [10, 9, 10, 9] };
  for (const [fret, want] of Object.entries(low)) assert.deepEqual(chart('drop3', [6, 4, 3, 2], +fret), want);
  const high = { 6: [6, 5, 8, 5], 8: [8, 7, 9, 7], 10: [10, 8, 10, 8] };
  for (const [fret, want] of Object.entries(high)) assert.deepEqual(chart('drop3', [5, 3, 2, 1], +fret), want);
  // the top line really is C D E♭ F G A♭ on the first six
  assert.deepEqual(voicings('C', 'min6', 'drop3', [6, 4, 3, 2]).filter((v) => [3, 4, 5, 7, 8, 10].includes(v.notes[0].fret)).map((v) => v.topDeg), [0, 1, 2, 3, 4, 5]);
});

test('drop 2 and 4 matches the full chart (The Elevator Sequence p. 5)', () => {
  // The second chord is printed with "fr. 7", but the notes written beside it (F B A♭ D)
  // sit at the first fret; the shape is the same either way.
  const low = { 1: [1, 2, 1, 3], 3: [3, 3, 2, 4], 4: [4, 5, 4, 6], 5: [5, 6, 5, 8], 7: [7, 8, 7, 9], 8: [8, 10, 8, 10] };
  for (const [fret, want] of Object.entries(low)) assert.deepEqual(chart('drop24', [6, 5, 3, 2], +fret), want);
  const high = { 5: [5, 6, 6, 7], 6: [6, 7, 8, 8] };
  for (const [fret, want] of Object.entries(high)) assert.deepEqual(chart('drop24', [5, 4, 2, 1], +fret), want);
});

test('double octave matches the full chart, and the alternate matches its ossia (The Elevator Sequence p. 5)', () => {
  const main = { 1: [1, 1, 0, 1], 3: [3, 2, 1, 3], 4: [4, 4, 3, 4], 5: [5, 5, 4, 5], 7: [7, 7, 6, 7], 8: [8, 8, 8, 8] };
  for (const [fret, want] of Object.entries(main)) assert.deepEqual(chart('dbl', [6, 3, 2, 1], +fret), want);
  assert.deepEqual(chart('dbl.alt', [6, 4, 3, 1], 1), [1, 0, 1, 1]);
  assert.deepEqual(chart('dbl.alt', [6, 4, 3, 1], 3), [3, 1, 2, 3]);
  for (const id of ['dbl', 'dbl.alt']) {
    for (const v of voicings('C', 'min6', id, SHAPES[id].primary)) assert.equal(v.notes[3].midi - v.notes[0].midi, 24);
  }
});

test('the mirror: the wide floors span the small floors plus an octave (The Elevator Sequence p. 12)', () => {
  const span = (id) => SHAPES[id].steps[SHAPES[id].steps.length - 1];
  assert.equal(span('drop2'), span('thirds') + 8);
  assert.equal(span('drop3'), span('triads') + 8);
  assert.equal(span('drop24'), span('shell.low') + 8);
  assert.equal(span('dbl'), span('oct.triad') + 8);
});

test('every shape has a voicing for every degree on its primary set, in every scale', () => {
  for (const scale of Object.keys(SCALES)) {
    for (const shape of Object.values(SHAPES)) {
      for (let deg = 0; deg < 8; deg++) {
        for (const anchor of ['top', 'bottom']) {
          const v = voicingFor('C', scale, shape.id, shape.primary, anchor, deg);
          assert.ok(v, `${scale} ${shape.id} ${anchor} ${deg}`);
          assert.ok(v.notes.every((n) => (n.deg % 2 === 0) === v.on), 'stays inside one chord');
        }
      }
    }
  }
});

// ---- moving between floors ----
import { movePair, describeMove, moveWords, floorAfter } from '../js/motion.js';
import { scaleNotes as sn } from '../js/theory.js';

const spell = (key, scale, chord) => chord.notes.map((n) => sn(key, scale)[n.deg].name).join(' ');
const mv = (move, floor, dir, deg, scale = 'min6') => movePair('C', { scale, move, floor, dir, deg });

test('contrary motion: unison, third, triad under C D E♭ (The Elevator Sequence p. 2, bar 2)', () => {
  const a = mv('con', 'unison', 1, 0);
  assert.equal(spell('C', 'min6', a.from), 'C');
  assert.equal(spell('C', 'min6', a.to), 'B D');
  assert.deepEqual([a.top, a.bass, a.motion], [1, -1, 'contrary']);
  const b = mv('con', 'thirds', 1, 1);
  assert.equal(spell('C', 'min6', b.from), 'B D');
  assert.equal(spell('C', 'min6', b.to), 'A C E♭');
  assert.deepEqual([b.top, b.bass, b.motion], [1, -1, 'contrary']);
  // and back in again: melody down, bass up
  const c = mv('con', 'triads', -1, 2);
  assert.equal(spell('C', 'min6', c.to), 'B D');
  assert.deepEqual([c.top, c.bass, c.motion], [-1, 1, 'contrary']);
});

test('parallel motion: triads under C D E♭ (The Elevator Sequence p. 2, bar 5)', () => {
  const a = mv('par', 'triads', 1, 0);
  assert.equal(spell('C', 'min6', a.from), 'G A C');
  assert.equal(spell('C', 'min6', a.to), 'G♯ B D');
  assert.deepEqual([a.top, a.bass, a.motion], [1, 1, 'parallel']);
  assert.equal(moveWords(a), 'The melody stepped up, the bass stepped up: parallel motion.');
});

test('"parallel then contrary": triad to third makes the bass leap up (p. 2, bar 6)', () => {
  const tri = mv('par', 'triads', 1, 0).from;                // G A C
  const third = mv('con', 'unison', 1, 0).to;                // B D
  const d = describeMove('C', 'min6', tri, third);
  assert.deepEqual([d.top, d.bass, d.motion], [1, 3, 'parallel']);  // G up to B is three steps of this eight-note scale
});

test('oblique motion: G held while thirds step down beneath it (The Elevator Sequence p. 7)', () => {
  const a = mv('obl', 'thirds', -1, 4);
  assert.equal(spell('C', 'min6', a.from), 'C E♭ G');        // lines up as a triad, all on
  assert.equal(a.from.mixed, false);
  assert.equal(spell('C', 'min6', a.to), 'B D G');           // an off third under an on note
  assert.equal(a.to.mixed, true);
  assert.deepEqual([a.top, a.bass, a.motion], [0, -1, 'oblique']);
  const back = mv('obl', 'thirds', 1, 4);
  assert.equal(spell('C', 'min6', back.to), 'C E♭ G');
  // a single note moving under a held note, and a shell under a held note making an octave chord
  assert.equal(spell('C', 'min6', mv('obl', 'unison', -1, 4).from), 'E♭ G');
  const sh = mv('obl', 'shell.low', -1, 4).from;
  assert.equal(sh.notes[3].midi - sh.notes[0].midi, 12);
});

test('each floor up, under the same melody note, drops the bass one chord-note', () => {
  assert.equal(floorAfter('triads', 'out'), 'shell.low');
  assert.equal(floorAfter('triads', 'in'), 'thirds');
  assert.equal(floorAfter('triads', 'par'), 'triads');
  assert.equal(floorAfter('unison', 'in'), null);
  // shells accept either shell: both have the same outer voices
  const toShell = mv('con', 'triads', 1, 4, 'maj6');
  assert.equal(toShell.accept.length, 2);
  assert.equal(mv('con', 'shell.low', 1, 4, 'maj6').accept.length >= 1, true);
});
