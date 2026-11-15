// lessons.js — a short reading for each unit, in plain language, with something to
// touch and hear. These are this app's own explanations of the method; "Read" points
// to where Thomas Echols teaches it in his course materials.

import { h } from './dom.js';
import { scaleStrip, pathChips, pathCompare, shapeBrowser } from './widgets.js';
import { SCALES } from './theory.js';
import { SHAPES, setLabel } from './floors.js';

const p = (...kids) => h('p', null, ...kids);
const b = (text) => h('strong', null, text);
const em = (text) => h('em', null, text);
const head = (text) => h('h3', null, text);
const read = (text) => h('p', { class: 'read' }, h('span', null, 'Read'), text);
const say = (text) => h('p', { class: 'aloud' }, h('span', null, 'Say aloud'), text);
const list = (...items) => h('ul', null, items.map((x) => h('li', null, x)));
const browser = (cfg) => shapeBrowser({ key: 'C', scale: 'maj6', ...cfg }).el;
const on = (t) => h('span', { class: 'ink-on' }, t);
const off = (t) => h('span', { class: 'ink-off' }, t);

const LESSONS = {
  scale: () => [
    p('Almost everything in this method grows from one eight-note scale. It is two four-note chords woven together, taking turns.'),
    list(
      [on('On'), ' notes belong to the home chord. In C that is C6: C, E, G, A. They sound settled.'],
      [off('Off'), ' notes belong to a diminished chord, B°7: B, D, F, G♯. They sound restless and want to fall back to an on note.'],
    ),
    p('Going up the scale you alternate: on, off, on, off. Here it is on string 2. Tap any note to hear it, then try the buttons.'),
    scaleStrip('C', 'maj6', 2),
    head('Names, not numbers'),
    p('Each note is named for its job, measured from the root. The on notes are the ', on('root, third, fifth and sixth'), '. The off notes are the ', off('second, fourth, sharp five and major seven'), '.'),
    p('The off chord is the same four jobs in all four scales you will meet, so it is worth knowing cold: ', b('major seven, second, fourth, sharp five'), '.'),
    say('"Root, on. Second, off. Third, on. Fourth, off. Fifth, on. Sharp five, off. Sixth, on. Major seven, off."'),
    p('The naming is the point. When you later hold a note under your finger and know it is "the fifth, on", you also know which chord belongs beneath it.'),
    read('Foundations I, pages 7 to 11.'),
  ],

  path: () => [
    p(b('Pathfinding'), ' is one of the two core skills: before you move, you see how far the next note is. On one string that is only ever a half step (one fret) or a whole step (two frets).'),
    p('This is the path for major 6 diminished. Notice the two half steps either side of the sharp five.'),
    h('figure', { class: 'fig' }, pathChips('maj6'), h('figcaption', null, 'W is a whole step, H is a half step.')),
    scaleStrip('C', 'maj6', 2),
    p('The same path works on every string and in every key, because it is only distances. That is why the drills move you around: string 2 first, then 4 and 3, then the rest.'),
    head('How to practice it'),
    list(
      'Do not move until you can see the next note.',
      'Say the degree as you land on it.',
      'Go down as well as up. Coming down, the step from the root to the major seven is a half step.',
    ),
    p('Away from the guitar you can walk the path on screen. With the guitar, walk a string up and back and say the names.'),
    read('Foundations I, pages 29 to 30, and exercises 3 and 4 on pages 8 and 11.'),
  ],

  thirds: () => [
    p(b('Summoning'), ' is the second core skill: you hold one note and call up a shape around it from memory. The shapes are the floors of the Elevator. The smallest floor above a single note is a ', b('third'), '.'),
    p('To build one, take a note of the scale, skip the next, and take the one after. Because on and off alternate, skipping one always lands you in the same chord. A third is two on notes, or two off notes, never a mix.'),
    browser({ shape: 'thirds', set: [4, 3], start: 2 }),
    p('Step through with the arrows. On strings 4 and 3 there are only a few hand shapes, and the off ones are all identical, three frets apart.'),
    head('Beneath and above'),
    p('The drills ask for a third two ways: ', em('beneath'), ' a note (you hold the top and add the lower one) and ', em('above'), ' a note (you hold the bottom and add the upper one). Both matter. A melody note usually sits on top, so "beneath" is the one chord melody leans on.'),
    say('Name the note you are holding first. "Fifth, on." Then add the other.'),
    read('Thirds (short lesson), and Foundations I, pages 31 and 39.'),
  ],

  triads: () => [
    p('A ', b('triad'), ' here is three notes found the same way as a third: take one, skip one, take one, skip one, take one. All three come from the same chord.'),
    p('Some of them look like triads you may already know. Others do not, because C6 has four notes and you are taking three neighbors out of it. Do not worry about naming them as chords. Think "triad from the third" or "triad beneath the sixth".'),
    browser({ shape: 'triads', set: [4, 3, 2], start: 2 }),
    p('Hold the bottom note on string 4 and say its name as you step through. That bottom voice is walking the path while the shape above it changes.'),
    head('Thirds inside triads'),
    p('Every triad contains two thirds. Moving between the thirds floor and the triads floor is the first taste of two voices going their own way, which is what the Elevator is for.'),
    read('Triads (short lesson), and Foundations I, page 39.'),
  ],

  shells: () => [
    p('A ', b('shell'), ' is three notes with a gap. Picture four notes of a chord stacked close together, then leave out one of the two middle ones.'),
    list(
      [b('Low shell'), ': keep the lower middle note. The gap is at the top.'],
      [b('High shell'), ': keep the upper middle note. The gap is at the bottom.'],
    ),
    browser({ shape: 'shell.low', set: [4, 3, 2], start: 2 }),
    browser({ shape: 'shell.high', set: [4, 3, 2], start: 2 }),
    p('Shells are wider than triads, so the top and bottom voices are further apart and easier to hear as two lines. This word is used in a broader sense here than the usual jazz "shell voicing".'),
    p('It is tempting to think of a shell as a piece of a bigger chord you already know. Learn each one as its own thing instead. You will reach it faster.'),
    read('Shell Chords (short lesson).'),
  ],

  octaves: () => [
    p('An ', b('octave chord'), ' has four notes, and the top one is the same note as the bottom one, an octave higher. In between sit two more notes of the chord.'),
    p('There are three kinds, named for the shape made by the lowest three notes:'),
    list('a triad with the octave on top', 'a low shell with the octave on top', 'a high shell with the octave on top'),
    browser({ shape: 'oct.triad', set: [5, 4, 3, 2], start: 2 }),
    browser({ shape: 'oct.low', set: [5, 4, 3, 2], start: 2 }),
    browser({ shape: 'oct.high', set: [5, 4, 3, 2], start: 2 }),
    p('Because they contain thirds, triads and shells, octave chords are where the earlier floors start to feel like one connected thing.'),
    read('Octave Chords (short lesson).'),
  ],

  drop2: () => [
    p(b('Drop 2'), ' is the full four-note chord, all four different notes, on four neighboring strings. The name describes how it is made: stack the chord close together, then drop the second note from the top down an octave.'),
    browser({ shape: 'drop2', set: [5, 4, 3, 2], start: 0 }),
    p('This is the classic way to play the whole scale in chords: four shapes of C6 alternating with one diminished shape that repeats every three frets.'),
    p('A drop 2 holds the smaller floors inside it. Its top three notes are a low shell. Its bottom three are a high shell. Its middle two are a third.'),
    say('As you step up, name the top note, then go again naming the bottom note.'),
    read('Drop 2 Chords (short lesson), and Foundations I, page 11.'),
  ],

  wide: () => [
    p('Three wider floors spread the same four notes across more of the neck by skipping strings.'),
    list(
      [b('Drop 3'), ': the third note from the top is dropped an octave. One string is skipped above the bass.'],
      [b('Drop 2 and 4'), ': the second and fourth notes from the top are dropped. The gap falls in the middle.'],
      [b('Double octave'), ': the top note is doubled two octaves below, with two chord notes between.'],
    ),
    browser({ shape: 'drop3', set: [6, 4, 3, 2], start: 2 }),
    browser({ shape: 'drop24', set: [6, 5, 3, 2], start: 2 }),
    browser({ shape: 'dbl', set: [6, 4, 3, 1], start: 2 }),
    h('p', { class: 'note' }, 'Drop 3 and double octaves have no full chart in the materials this app was built from. Their shapes are worked out from the definitions and agree with the example diagrams in Foundations I (page 31) and the Reference Library (page 4). Treat them as provisional until checked against a full chart.'),
    read('Reference Library: Drop 2 and 4.'),
  ],
};

const SCALE_INTRO = {
  min6: {
    what: 'Lower the third of the major 6 chord by a half step and you have a minor 6 chord. In C: C, E♭, G, A.',
    path: 'Only one note has moved, so only two steps of the path change: second to third is now a half step, and third to fourth is now a whole step.',
    use: 'Minor 6 is home in a minor key. It also stands in for a dominant chord: D minor 6 over G7 is called the minor 6 on the 5. That comes later, under Substitution.',
    read: 'Foundations I, pages 12 to 17.',
  },
  dom7: {
    what: 'Raise the sixth of the major 6 chord by a half step and you have a dominant 7 chord. In C: C, E, G, B♭.',
    path: 'The top of the path changes: sharp five to flat seven is a whole step, then flat seven to major seven is a half step. Flat seven is on. Major seven is still off.',
    use: 'This is the scale for a dominant chord, the chord that wants to resolve. Its off chord is still the same four jobs.',
    read: 'Foundations I, pages 12 to 14.',
  },
  dom7b5: {
    what: 'Take the dominant 7 chord and lower its fifth by a half step. In C: C, E, G♭, B♭.',
    path: 'Now the middle changes too: fourth to flat five is a half step, and flat five to sharp five is a whole step.',
    use: 'A tense, colorful dominant sound. The chord is symmetrical, so it has only two shapes on any string set instead of four.',
    read: 'Foundations I, pages 19 to 22.',
  },
};

function scalePathLesson(s) {
  const info = SCALE_INTRO[s];
  return [
    p(info.what),
    p('The off chord does not change: major seven, second, fourth, sharp five. You already know half of this scale.'),
    scaleStrip('C', s, 2),
    head('What changes on the path'),
    p(info.path),
    pathCompare(),
    p(info.use),
    read(info.read),
  ];
}

function scaleFloorsLesson(s) {
  const name = SCALES[s].short;
  return [
    p(`The floors are built exactly as before. Only the on chord's shapes are new, because the off chord is the same diminished chord you have already learned.`),
    p(`So this unit drills the on shapes of ${name}: thirds, triads, both shells and drop 2.`),
    browser({ scale: s, shape: 'triads', set: [4, 3, 2], start: 2 }),
    browser({ scale: s, shape: 'drop2', set: [5, 4, 3, 2], start: 2 }),
    p('Compare each shape with its major 6 twin. Usually one finger moves by one fret. Seeing that small move is the beginning of transformation, turning one chord into another by the shortest route.'),
    read('Foundations I, pages 12 to 22.'),
  ];
}

export function lessonFor(unitId) {
  if (LESSONS[unitId]) return LESSONS[unitId]();
  const [s, part] = unitId.split('.');
  if (SCALE_INTRO[s]) return part === 'path' ? scalePathLesson(s) : scaleFloorsLesson(s);
  return [p('This lesson is on its way.')];
}

export const shapeBlurb = (shapeId) => `${SHAPES[shapeId].name} on ${setLabel(SHAPES[shapeId].primary)}`;
