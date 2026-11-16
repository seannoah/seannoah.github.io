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

// ---- reading a chart ----
import { parseChord, scaleOptions, parseChart, readChart, transposeChart } from '../js/harmony.js';
const use = (sym, resolves = true, pick = 0) => { const o = scaleOptions(parseChord(sym), resolves)[pick]; return `${o.label} (${o.how})`; };

test('chord symbols sort into families', () => {
  const fam = (s) => parseChord(s).family;
  assert.deepEqual(['Cmaj7', 'C6', 'C', 'C6/9', 'Bb/F', 'CΔ'].map(fam), ['maj', 'maj', 'maj', 'maj', 'maj', 'maj']);
  assert.deepEqual(['Dm7', 'D-7', 'Dm9', 'Dmin7'].map(fam), ['min7', 'min7', 'min7', 'min7']);
  assert.deepEqual(['Cm', 'Cm6', 'Cm(maj7)', 'CmMaj7'].map(fam), ['min6', 'min6', 'min6', 'min6']);
  assert.deepEqual(['Em7b5', 'Eø', 'Em7(b5)'].map(fam), ['hdim', 'hdim', 'hdim']);
  assert.deepEqual(['G7', 'G9', 'G13', 'G7b9', 'G7#5', 'G7sus', 'G7alt'].map(fam), ['dom', 'dom', 'dom', 'dom', 'dom', 'dom', 'dom']);
  assert.deepEqual(['Dbdim7', 'Db°7', 'Dbdim', 'G7b5'].map(fam), ['dim', 'dim', 'dim', 'dom7b5']);
  assert.equal(parseChord('F#m7b5').root, 6);
  assert.equal(parseChord('Bb/F').root, 10);
  assert.equal(parseChord('hello'), null);
});

test('chart chords map to the scales of chords the course assigns', () => {
  // Foundations I pp. 42-46 (Take the A Train): F6 = Dm7; A minor 6 on the 5 for D7; Ab minor 6 as tritone's minor for G7
  assert.equal(use('Dm7'), 'F major 6 (same four notes)');
  assert.equal(use('D7', false), 'A minor 6 (minor 6 on the 5)');
  assert.equal(use('G7'), "A♭ minor 6 (tritone's minor)");
  // Foundations I pp. 51-53 (Blue Bossa): F minor 6 = Dm7b5
  assert.equal(use('Dm7b5'), 'F minor 6 (same four notes)');
  // 5 Chord Melody Games p. 14 (Body and Soul): the table of "Chart says" against "Scale of Chords"
  assert.equal(use('Dbmaj7'), 'D♭ major 6 (true major)');
  assert.equal(use('Gb7', false), 'D♭ minor 6 (minor 6 on the 5)');
  assert.equal(use('Fm7'), 'A♭ major 6 (same four notes)');
  assert.equal(use('Edim7'), 'E diminished (diminished scale)');
  assert.equal(use('Ebm7'), 'G♭ major 6 (same four notes)');
  assert.equal(use('Cm7b5'), 'E♭ minor 6 (same four notes)');
  assert.equal(use('F7'), "G♭ minor 6 (tritone's minor)");
  assert.equal(use('D#m7'), 'F♯ major 6 (same four notes)');
  assert.equal(names('G♭', 'maj6'), 'G♭ A♭ B♭ C♭ D♭ D E♭ F');
  // Stella 4.2 p. 6: B minor 6 as tritone's minor for Bb7; Eb minor 6 as minor 6 on the 5 for Ab7
  assert.equal(use('Bb7'), "B minor 6 (tritone's minor)");
  assert.equal(use('Ab7', false), 'E♭ minor 6 (minor 6 on the 5)');
  // the other choices are still offered
  assert.deepEqual(scaleOptions(parseChord('G7')).map((o) => o.how), ["tritone's minor", 'minor 6 on the 5', 'true dominant', 'dominant 7♭5', 'tritone substitute']);
  assert.equal(use('Cmaj7', true, 1), 'G major 6 (major 6 on the 5)');
  assert.equal(use('G7', true, 4), 'D♭ dominant 7 (tritone substitute)');
});

test('a chart is parsed into bars, read with movements, and transposed', () => {
  const chart = 'A | Cm7 | F7 | Fm7 | Bb7 |\n  | Ebmaj7 | Ab7 | Bbmaj7 | % |\n  | Em7b5 A7 | Dm7 Dbdim7 | Cm7 F7 | Bb6 |';
  const bars = parseChart(chart);
  assert.equal(bars.length, 12);
  assert.equal(bars[0].section, 'A');
  assert.deepEqual(bars[7].chords.map((c) => c.text), ['B♭maj7']);
  assert.deepEqual(bars[8].chords.map((c) => c.text), ['Em7♭5', 'A7']);
  const read = readChart(bars);
  assert.equal(read[0].use.label, 'E♭ major 6');
  assert.equal(read[0].movement.name, 'Major ii–V7');
  assert.equal(read[1].use.how, "tritone's minor");         // F7 is the V of a ii-V, even though Fm7 follows (Stella, bar 4)
  assert.equal(read[3].resolves, true);                     // Bb7 resolves to Eb
  assert.equal(read[3].use.how, "tritone's minor");
  assert.equal(read[5].movement.name, 'Minor iv');          // Eb, Ab7, Bb: the back-door dominant
  assert.equal(read[5].use.label, 'E♭ minor 6');
  assert.equal(read[8].movement.name, 'Minor iiø–V7');
  assert.equal(read[11].movement.name, 'Flat-3 diminished');
  assert.equal(read[11].use.label, 'D♭ diminished');
  // choosing another option for one chord
  assert.equal(readChart(bars, (i) => (i === 3 ? 1 : 0))[3].use.how, 'minor 6 on the 5');
  // up a whole step, section letter untouched
  const up = transposeChart(chart, 2, false).split('\n');
  assert.equal(up[0], 'A | Dm7 | G7 | Gm7 | C7 |');
  assert.equal(up[2].trim(), '| F#m7b5 B7 | Em7 D#dim7 | Dm7 G7 | C6 |');
  assert.equal(transposeChart('| Bb/F | Cm7/F F7 |', 2, true), '| C/G | Dm7/G G7 |');
});

test('the diminished scale of chords keeps the usual off chord', () => {
  assert.equal(names('C', 'dim'), 'C D E♭ F G♭ A♭ A B');
  assert.ok(voicingFor('C', 'dim', 'drop2', [5, 4, 3, 2], 'top', 4));
});

// ---- borrowing ----
import { borrowPair, underBorrowed, borrowIn, voiceName } from '../js/borrow.js';
const bnames = (key, scale, notes) => notes.map((n) => sn(key, scale)[n.deg].name).join(' ');

test('borrowing below the top voice of C6 (Foundations I p. 26 and fig. 12)', () => {
  // A root-position C6 with the third on string 2: the path below the third is a whole
  // step, so the third is replaced by the second (D), an off note.
  const root = voicings('C', 'maj6', 'drop2', [5, 4, 3, 2]).find((v) => v.bottomDeg === 0);
  assert.equal(bnames('C', 'maj6', root.notes), 'C G A E');
  const b = borrowIn('C', 'maj6', root, 0, -1);
  assert.equal(bnames('C', 'maj6', b.notes), 'C G A D');
  assert.equal(b.size, 2);
  assert.equal(b.moved.fret, b.old.fret - 2);
});

test('borrowing never crosses another voice and stays playable', () => {
  for (const shape of ['thirds', 'triads', 'shell.low', 'shell.high', 'drop2']) {
    for (let deg = 0; deg < 8; deg++) {
      for (const dir of [1, -1]) {
        for (let voice = 0; voice < SHAPES[shape].steps.length; voice++) {
          const b = borrowPair('C', { scale: 'maj6', shape, set: SHAPES[shape].primary, voice, dir, deg });
          if (!b) continue;
          const midis = b.notes.map((n) => n.midi);
          assert.deepEqual(midis, [...midis].sort((x, y) => x - y), `${shape} ${deg} ${voice} ${dir}`);
          assert.equal(new Set(midis).size, midis.length);
          assert.ok(b.size === 1 || b.size === 2);
        }
      }
    }
  }
  assert.equal(voiceName(3, 1), 'middle');
});

test('an on chord beneath an off melody note ("5 Chord Melody Games", scenario 4)', () => {
  // Stella bar 3: the melody F is the second of E♭ major 6. A shell of E♭6 goes beneath it.
  const fromAbove = underBorrowed('E♭', { scale: 'maj6', shape: 'shell.low', set: [4, 3, 2], from: 1, deg: 1 });
  assert.equal(bnames('E♭', 'maj6', fromAbove.notes), 'B♭ C F');     // the shell under G (B♭ C G) with the top lowered to F
  const fromBelow = underBorrowed('E♭', { scale: 'maj6', shape: 'shell.low', set: [4, 3, 2], from: -1, deg: 1 });
  assert.equal(bnames('E♭', 'maj6', fromBelow.notes), 'G B♭ F');     // the shell under E♭ (G B♭ E♭) with the top raised to F
  for (const b of [fromAbove, fromBelow]) assert.equal(b.notes.slice(0, -1).every((n) => n.deg % 2 === 0), true, 'the lower voices are all on');
  // "whenever a voice is holding the root, borrow beneath it by moving down a half step"
  const root = underBorrowed('C', { scale: 'min6', shape: 'triads', set: [4, 3, 2], from: 1, deg: 7 });
  assert.equal(root.size, 1);
  assert.equal(bnames('C', 'min6', [root.old]), 'C');
});

test('borrowing archetypes: the chord diagrams in Standards 4.4', () => {
  const under = (key, scale, set, from, deg, midi) => underBorrowed(key, { scale, shape: 'drop2', set, from, deg }, midi).notes.map((n) => n.fret);
  // 1. a borrowed major 2nd: E♭6 x-6-8-5-8-x with the third on top lowered to the second (bar 3)
  assert.deepEqual(under('E♭', 'maj6', [5, 4, 3, 2], 1, 1, 59 + 6), [6, 8, 5, 6]);
  // 2. a borrowed major 7th: A♭6 x-6-6-5-6-x with the sixth on top raised (bar 5)
  assert.deepEqual(under('A♭', 'maj6', [5, 4, 3, 2], -1, 7, 59 + 8), [6, 6, 5, 8]);
  //    and E♭ minor 6 x-x-10-11-11-11 with the root on top lowered a half step (bars 21-22)
  assert.deepEqual(under('E♭', 'min6', [4, 3, 2, 1], 1, 7, 64 + 10), [10, 11, 11, 10]);
  // 3. a borrowed fourth: B♭6 x-1-3-0-3-x with the third on top raised (bar 9)
  assert.deepEqual(under('B♭', 'maj6', [5, 4, 3, 2], -1, 3, 59 + 4), [1, 3, 0, 4]);
});

// ---- transformation ----
import { chord, chordLabel, formulaBetween, applyFormula, formulaText, roleAfter, roleOf, tallRoles, sixthVoicing, transformPair, transformChain, follow, movesText, MOVES, MOVE_IDS, moveIn, namedMove, CHAINS, chainIn, ROLES } from '../js/transform.js';

const PCS = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
const six = (name) => { const m = /^([A-G]b?)(m?)6$/.exec(name); return chord(PCS[m[1]], m[2] ? 'min6' : 'maj6'); };
const formula = (a, b) => formulaText(formulaBetween(six(a), six(b)));
const ROOT = 0, THIRD = 1, FIFTH = 2, SIXTH = 3;

test('transformation formulas (Foundations IV, pp. 13-32, 50-51, 67, 75, 86)', () => {
  // the ii chord of B♭ is Cm7 = E♭6; F7 is played as Cm6 (minor 6 on the 5) or G♭m6 (tritone's minor)
  assert.equal(formula('Eb6', 'Cm6'), '[Forward, Minor]');
  assert.equal(formula('Eb6', 'Gbm6'), '[Backward, Minor]');
  assert.equal(formula('Cm6', 'Gbm6'), '[Across]');
  // resolving to the major 6 on the 5 of the tonic (F6 for B♭)
  assert.equal(formula('Cm6', 'F6'), '[Across, Down, Major]');
  assert.equal(formula('Gbm6', 'F6'), '[Down, Major]');
  // resolving to the true major
  assert.equal(formula('Cm6', 'Bb6'), '[Forward, Up, Major]');
  assert.equal(formula('Gbm6', 'Bb6'), '[Backward, Up, Major]');
  // minor ii–V–i in G minor: Am7♭5 = Cm6, D7 as E♭m6, then Gm6
  assert.equal(formula('Cm6', 'Ebm6'), '[Backward]');
  assert.equal(formula('Ebm6', 'Gm6'), '[Backward, Up]');
  // the minor iv in B♭: E♭6, E♭m6, then B♭6 or F6
  assert.equal(formula('Eb6', 'Ebm6'), '[Minor]');
  assert.equal(formula('Ebm6', 'Bb6'), '[Across, Up, Major]');
  assert.equal(formula('Ebm6', 'F6'), '[Backward, Down, Major]');
  // I to ii through the flat-3 diminished, and the movement to iii
  assert.equal(formula('Bb6', 'Eb6'), '[Across, Down]');
  assert.equal(formula('Bb6', 'Gm6'), '[Forward, Minor]');
  assert.equal(formula('C6', 'C6'), '[Stay]');
});

test('any two 6th chords are related by exactly one formula', () => {
  const all = [];
  for (let r = 0; r < 12; r++) for (const s of ['maj6', 'min6']) all.push(chord(r, s));
  for (const a of all) {
    const seen = new Set();
    for (const b of all) {
      const f = formulaBetween(a, b);
      assert.deepEqual(applyFormula(a, f), b);
      seen.add(formulaText(f));
    }
    assert.equal(seen.size, 24);
  }
});

test('the family circle: what is in the bass (Foundations I, pp. 48-49)', () => {
  assert.equal(roleAfter(FIFTH, 'backward'), THIRD);   // "5th in the bass to the 3rd in the bass: backwards"
  assert.equal(roleAfter(THIRD, 'across'), SIXTH);     // "3rd in the bass to the 6th in the bass: across"
  assert.equal(roleAfter(SIXTH, 'forward'), ROOT);     // minor 6 on the 5 to the true major (Foundations IV p. 30)
  assert.equal(roleAfter(SIXTH, 'backward'), FIFTH);   // iiø to the tritone's minor (p. 50)
  assert.deepEqual(tallRoles('min6'), ['fifth']);
  assert.deepEqual(tallRoles('maj6'), ['third', 'fifth']);
  // the family of D minor 6 on strings 5-4-3-2: the bass is on fret 2, except the fifth, on fret 3
  const fam = [['Dm6', SIXTH], ['Bm6', ROOT], ['Abm6', THIRD], ['Fm6', FIFTH]].map(([n, role]) => sixthVoicing(six(n), role, [5, 4, 3, 2], 2).notes[0].fret);
  assert.deepEqual(fam, [2, 2, 2, 3]);
  // and the two tall siblings of a major 6 family
  const maj = [['F6', ROOT], ['D6', THIRD], ['B6', FIFTH], ['Ab6', SIXTH]].map(([n, role]) => sixthVoicing(six(n), role, [5, 4, 3, 2], 8).notes[0].fret);
  assert.deepEqual(maj, [8, 9, 9, 8]);
});

test('transformations on the neck', () => {
  // "A♭ minor 6 with the 5th in the bass to C major 6 with the 3rd in the bass: up, backward, major" (fr. 4, fr. 5)
  const p = transformPair(six('Abm6'), FIFTH, formulaBetween(six('Abm6'), six('C6')));
  assert.deepEqual(frets(p.from), [6, 6, 4, 6]);
  assert.deepEqual(frets(p.to), [7, 7, 5, 8]);
  assert.equal(ROLES[p.toRole].name, 'third');
  // ii to the minor 6 on the 5 is one voice: the fifth of the major 6 drops a half step
  for (let role = 0; role < 4; role++) {
    const q = transformPair(six('Eb6'), role, formulaBetween(six('Eb6'), six('Cm6')));
    assert.equal(q.moves.filter((m) => m !== 0).length, 1);
    assert.equal(q.moves.reduce((a, b) => a + b, 0), -1);
  }
  // E♭ minor 6 to G minor 6: "one voice stays still, two move up a semitone, one moves up two"
  const r = transformPair(six('Ebm6'), FIFTH, formulaBetween(six('Ebm6'), six('Gm6')));
  assert.deepEqual(r.moves.slice().sort(), [0, 1, 1, 2]);
  assert.equal(movesText([1, 0, -2, 0]), '+1, 0, −2, 0');
});

test('every named move is playable from every bass note, in every key', () => {
  for (const set of [[5, 4, 3, 2], [4, 3, 2, 1], [6, 5, 4, 3]]) {
    for (let tonic = 0; tonic < 12; tonic++) {
      for (const id of MOVE_IDS) {
        const m = moveIn(id, tonic);
        for (let role = 0; role < 4; role++) {
          const p = transformPair(m.fromChord, role, m.formula, set);
          assert.ok(p, `${id} ${tonic} ${role}`);
          assert.equal(roleOf(p.from), role);
          assert.equal(roleOf(p.to), roleAfter(role, m.formula.dir));
          assert.ok(Math.abs(p.moves[0]) <= 3 && p.moves.every((x) => Math.abs(x) <= 3));
          assert.deepEqual(follow(p.from, m.toChord, p.toRole, set), p.to);
        }
      }
    }
  }
  assert.equal(chordLabel(moveIn('ii-tm', PCS.Bb).toChord), 'G♭m6');
});

test('chains of moves stay in one place on the neck', () => {
  for (const c of CHAINS) {
    for (const tonic of [0, 5, 10, 3, 7]) {
      for (let role = 0; role < 4; role++) {
        const steps = chainIn(c.id, tonic, role);
        assert.ok(steps, `${c.id} ${tonic} ${role}`);
        assert.equal(steps.length, c.steps.length + 1);
        const all = steps.flatMap((s) => s.voicing.notes.map((n) => n.fret));
        assert.ok(Math.max(...all) - Math.min(...all) <= 7, `${c.id} ${tonic} ${role} spans ${Math.min(...all)}-${Math.max(...all)}`);
      }
    }
  }
  // a pair of chords from a tune is matched to the move it is an instance of
  assert.deepEqual(namedMove(six('Eb6'), six('Gbm6')), { id: 'ii-tm', tonic: PCS.Bb });
  assert.deepEqual(namedMove(six('Ab6'), six('Fm6')), { id: 'ii-on5', tonic: PCS.Eb });
  assert.equal(namedMove(six('C6'), six('Db6')), null);
});

// ---- the elevator of intervals, floors within floors, leaps and the mirror ----
import { FLOORS, INTERVALS, partsInside, insideOf, partWhere, setLabel, stopName } from '../js/floors.js';
import { leapPair, bassMove, voiceWords } from '../js/motion.js';
import { reflect, reflectFloor, pivotPair, mirrorLine, pivotNotes } from '../js/mirror.js';

test('the elevator of intervals: each floor by its outside notes (The Elevator Sequence p. 7)', () => {
  // unison, third, fifth, sixth, octave: two scale steps wider each time
  assert.deepEqual(INTERVALS.map((id) => SHAPES[id].steps[SHAPES[id].steps.length - 1]), [0, 2, 4, 6, 8]);
  // a floor's frame has the same outside distance as the floor
  for (const f of FLOORS.filter((x) => x.frame)) {
    for (const id of f.shapes) assert.equal(SHAPES[id].steps[SHAPES[id].steps.length - 1], SHAPES[f.frame].steps[1], id);
  }
  // in C minor 6 the "fifths" are mostly tritones and one is a fourth (p. 10): C-G, D-A♭, E♭-A, F-B, G-C, A♭-D, A-E♭, B-F
  const fifths = voicings('C', 'min6', 'fifth', [4, 3]).filter((v) => v.lowFret >= 10 && v.lowFret <= 21).concat(voicings('C', 'min6', 'fifth', [4, 3]).filter((v) => v.lowFret < 10));
  const size = Object.fromEntries(fifths.map((v) => [v.bottomDeg, v.notes[1].midi - v.notes[0].midi]));
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7].map((d) => size[d]), [7, 6, 6, 6, 5, 6, 6, 6]);
  // sixths and bare octaves sit on two strings with one between
  assert.deepEqual(frets(voicingFor('C', 'maj6', 'sixth', [4, 2], 'bottom', 0)), [10, 10]);   // C and A
  assert.deepEqual(frets(voicingFor('C', 'maj6', 'oct2', [4, 2], 'bottom', 0)), [10, 13]);
  assert.equal(setLabel([4, 2]), 'strings 4 and 2');
  assert.equal(stopName('fifth'), 'Fifth');
  assert.equal(stopName('shell.low'), 'Shells');
});

test('floors within floors (The Elevator Sequence pp. 8-9, Octave Chords short lesson)', () => {
  const where = (shape, part) => partsInside(shape, part).map((idx) => partWhere(SHAPES[shape].steps.length, idx));
  // "the third that lives in the center of a drop 2"
  assert.deepEqual(where('drop2', 'thirds'), ['the middle two notes']);
  assert.deepEqual(where('drop2', 'shell.low'), ['the top three notes']);
  assert.deepEqual(where('drop2', 'shell.high'), ['the bottom three notes']);
  // "a shell chord without the tenor voice has a third on top ... with no alto voice, a fifth on top"
  assert.deepEqual(where('shell.high', 'thirds'), ['the top two notes']);
  assert.deepEqual(where('shell.low', 'fifth'), ['the top two notes']);
  assert.deepEqual(where('shell.low', 'sixth'), ['the two outside notes']);
  // "take a drop 2 and 4 voicing and see the 6th in the middle"
  assert.deepEqual(where('drop24', 'sixth'), ['the middle two notes']);
  // octave chords hold triads and both shells
  assert.deepEqual(where('oct.low', 'shell.low'), ['the bottom three notes']);
  assert.deepEqual(where('oct.low', 'shell.high'), ['the top three notes']);
  assert.deepEqual(where('oct.triad', 'triads'), ['the bottom three notes']);
  assert.deepEqual(where('oct.high', 'triads'), ['the top three notes']);
  assert.equal(where('triads', 'thirds').length, 2);
  // a drop 2 also holds two sixths, each skipping a note; positions are not called "second" or "third"
  assert.deepEqual(where('drop2', 'sixth'), ['the bottom note and the next but one', 'the top note and the next but one']);
  assert.equal(partWhere(4, [1, 2], true), 'middle two');
  // nothing is found inside itself, and every find really has the part's spacing
  for (const shape of Object.values(SHAPES)) {
    for (const { part, idx } of insideOf(shape.id)) {
      assert.deepEqual(idx.map((i) => shape.steps[i] - shape.steps[idx[0]]), SHAPES[part].steps, `${shape.id} ${part}`);
      assert.ok(idx.length < shape.steps.length);
    }
  }
});

test('leaps: bass move = melody move - 2 x floors (The Elevator Sequence p. 2)', () => {
  assert.equal(bassMove(1, 1), -1);    // contrary, as before
  assert.equal(bassMove(1, 0), 1);     // parallel, as before
  assert.equal(bassMove(1, -1), 3);    // "the bass leaps up"
  assert.equal(bassMove(2, 1), 0);     // the melody leaps to the next chord note, the bass holds
  assert.equal(bassMove(2, 2), -2);    // both leap, apart
  assert.equal(voiceWords(3), 'leaps up three steps');
  assert.equal(voiceWords(-2), 'leaps down to the next note of the chord');
  assert.equal(voiceWords(0), 'holds');

  const lp = (floor, t, df, deg, scale = 'min6') => leapPair('C', { scale, floor, t, df, deg });
  // p. 2, last example: a triad under C, then a third under D. The bass leaps from G up to B.
  const a = lp('triads', 1, -1, 0);
  assert.equal(spell('C', 'min6', a.from), 'G A C');
  assert.equal(spell('C', 'min6', a.to), 'B D');
  assert.deepEqual([a.top, a.bass, a.motion], [1, 3, 'parallel']);
  assert.equal(moveWords(a), 'The melody stepped up, the bass leapt up: parallel motion.');
  // the melody leaps to the next chord note over a held bass: third to triad. The two
  // lower notes stay under the fingers and the melody crosses to the next string.
  const b = lp('thirds', 2, 1, 2);
  assert.equal(spell('C', 'min6', b.from), 'C E♭');
  assert.equal(spell('C', 'min6', b.to), 'C E♭ G');
  assert.deepEqual([b.top, b.bass, b.motion], [2, 0, 'oblique']);
  assert.deepEqual(b.from.notes.map((n) => [n.string, n.fret]), [[3, 5], [2, 4]]);
  assert.deepEqual(b.to.notes.map((n) => [n.string, n.fret]), [[3, 5], [2, 4], [1, 3]]);
  assert.deepEqual([b.given[0].string, b.given[0].fret], [3, 5], 'the held bass is the given note');
  // both voices leap apart inside one chord: third to shell, and either shell will do
  const c = lp('thirds', 2, 2, 2);
  assert.equal(spell('C', 'min6', c.to), 'A C G');
  assert.deepEqual([c.top, c.bass, c.motion], [2, -2, 'contrary']);
  assert.equal(c.accept.length, 2);
  // the sum holds for every leap in the curriculum, and a leap of two stays in the same chord
  for (const floor of ['thirds', 'triads', 'shell.low']) for (const [t, df] of [[1, -1], [-1, 1], [2, 1], [-2, -1], [2, 2], [-2, -2], [2, 0], [-2, 0]]) for (let deg = 0; deg < 8; deg++) {
    const m = lp(floor, t, df, deg, 'maj6');
    if (!m) continue;
    assert.equal(m.top, t);
    assert.equal(m.bass, bassMove(t, df), `${floor} ${t} ${df} ${deg}`);
    if (Math.abs(t) === 2) assert.equal(m.from.on, m.to.on);
    // a bass that holds does not change string or fret
    if (m.bass === 0) assert.deepEqual([m.to.notes[0].string, m.to.notes[0].fret], [m.from.notes[0].string, m.from.notes[0].fret], `${floor} ${t} ${df} ${deg}`);
    assert.ok(m.accept.some((notes) => notes.every((n, k) => n.string === m.to.notes[k].string && n.fret === m.to.notes[k].fret)));
  }
});

test('the mirror: each wide floor reflects a small one (The Elevator Sequence p. 12)', () => {
  assert.equal(reflect('unison'), 'oct.low');
  assert.equal(reflect('thirds'), 'drop2');
  assert.equal(reflect('triads'), 'drop3');
  assert.equal(reflect('shell.low'), 'drop24');
  assert.equal(reflect('oct.low'), 'dbl');
  assert.equal(reflect('drop2'), null);
  assert.equal(reflect('drop3', false), 'triads');
  assert.equal(reflectFloor('shells'), 'drop24');
  assert.equal(reflectFloor('octaves', false), 'unison');
  assert.equal(reflectFloor('dbl'), null);
  // the spans say the same thing in words
  const span = (id) => FLOORS.find((f) => f.id === id).span;
  for (const id of ['thirds', 'triads', 'shells']) assert.equal(span(reflectFloor(id)), `${span(id)} plus an octave`);
});

test('pivoting: the reflection of the floor that was due (The Elevator Sequence pp. 12-13)', () => {
  // p. 12, first example, third chord to fourth: a shell under C (fr. 8), then a drop 3 where a triad was due (fr. 7)
  const p = pivotPair('C', { scale: 'min6', floor: 'shell.low', how: 'in', deg: 0 });
  assert.equal(spell('C', 'min6', p.from), 'E♭ G C');
  assert.equal(spell('C', 'min6', p.to), 'F D G♯ B');
  assert.equal(p.to.shape, 'drop3');
  assert.deepEqual(p.to.set, [5, 3, 2, 1]);
  assert.deepEqual(frets(p.to), [8, 7, 9, 7]);
  assert.equal(p.from.minFret, 8);
  assert.deepEqual([p.expected, p.mirror, p.top, p.bass], ['triads', 'drop3', -1, -7]);
  // the chord that was due sits under the same melody note, its bass an octave higher
  assert.equal(spell('C', 'min6', p.straight), 'F G♯ B');
  assert.equal(p.straight.notes[0].midi - p.to.notes[0].midi, 12);
  assert.equal(p.given[0].midi, p.to.notes[3].midi);

  // p. 13: thirds moving apart. A triad is due under D; the drop 3 keeps the bass and lifts the melody a ninth.
  const q = pivotPair('C', { scale: 'min6', floor: 'thirds', how: 'out', deg: 0 });
  assert.equal(spell('C', 'min6', q.from), 'A C');
  assert.equal(spell('C', 'min6', q.to), 'G♯ F B D');
  assert.deepEqual([q.expected, q.mirror, q.top, q.bass], ['triads', 'drop3', 9, -1]);
  assert.equal(q.given[0].midi, q.to.notes[0].midi);

  // every pivot in the catalogue floors: one voice steps as planned, the other lands an octave away
  for (const scale of ['maj6', 'min6']) for (const how of ['in', 'out']) for (const floor of ['thirds', 'triads', 'shell.low', 'oct.low']) for (let deg = 0; deg < 8; deg++) {
    const m = pivotPair('C', { scale, floor, how, deg });
    if (!m) continue;
    assert.deepEqual([m.top, m.bass], how === 'in' ? [-1, -7] : [9, -1], `${scale} ${floor} ${how} ${deg}`);
    assert.equal(SHAPES[m.to.shape].floor, SHAPES[m.mirror].floor);
    assert.ok(m.accept.some((notes) => notes === m.to.notes || notes.every((n, k) => n.fret === m.to.notes[k].fret && n.string === m.to.notes[k].string)));
    assert.ok(Math.abs(m.from.minFret - m.to.minFret) <= 5, `${scale} ${floor} ${how} ${deg} stays near`);
  }
});

test('a pivoted line (The Elevator Sequence pp. 11-12)', () => {
  const name = (n) => sn('C', 'min6')[n.deg].name;
  const basses = (line) => line.map((x) => name(x.voicing.notes[0])).join(' ');
  const tops = (line) => line.map((x) => name(x.voicing.notes[x.voicing.notes.length - 1])).join(' ');
  const floors = (line) => line.map((x) => SHAPES[x.voicing.shape].floor).join(' ');
  // first example on p. 12: drop 2 at fr. 10, the melody walking down from E♭, the pivot at the fourth chord
  const one = mirrorLine('C', 'min6', { start: 'drop2', top: 75, count: 9, pivotAt: 3 });
  assert.equal(tops(one), 'E♭ D C B A G♯ G F E♭');
  // the bass does what the scale did on p. 11: C D E♭, then from F onward an octave lower
  assert.equal(basses(one), 'C D E♭ F G G♯ A B C');
  assert.deepEqual(one.map((x) => x.voicing.notes[0].midi), [60, 62, 63, 53, 55, 56, 57, 59, 60]);
  assert.equal(floors(one), 'drop2 octaves shells drop3 drop2 octaves shells triads thirds');
  assert.deepEqual(one.slice(0, 8).map((x) => x.voicing.minFret), [10, 10, 8, 7, 8, 9, 7, 6]);   // the "fr." labels on the page
  assert.equal(one[3].expected, 'triads');
  // second example: start a floor higher, and the shell that was due becomes a drop 2 and 4
  const two = mirrorLine('C', 'min6', { start: 'drop3', top: 75, count: 9, pivotAt: 3 });
  assert.equal(floors(two), 'drop3 drop2 octaves drop24 drop3 drop2 octaves shells triads');
  assert.deepEqual(two.slice(0, 6).map((x) => x.voicing.minFret), [11, 9, 8, 5, 5, 7]);
  assert.equal(two[3].expected, 'shell.low');
  // without the pivot the two voices meet on one note and the line is over
  const straight = mirrorLine('C', 'min6', { start: 'drop2', top: 75, count: 9 });
  assert.equal(floors(straight), 'drop2 octaves shells triads thirds unison');
  // Barry Harris's pivot in single notes (p. 11): F A C E♭, with everything after the F an octave down
  const { up, pivoted } = pivotNotes('F', 'dom7', 53);
  assert.deepEqual(up, [53, 57, 60, 63]);
  assert.deepEqual(pivoted, [53, 45, 48, 51]);
});
