// lessons.js — a short reading for each unit, in plain language, with something to
// touch and hear. These are this app's own explanations of the method; "Read" points
// to where Thomas Echols teaches it in his course materials.

import { h } from './dom.js';
import { scaleStrip, pathChips, pathCompare, shapeBrowser, elevatorRide } from './widgets.js';
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
    read('Thirds (short lesson), The Elevator Sequence, page 1, and Foundations I, pages 31 and 39.'),
  ],

  triads: () => [
    p('A ', b('triad'), ' here is three notes found the same way as a third: take one, skip one, take one, skip one, take one. All three come from the same chord.'),
    p('Some of them look like triads you may already know. Others do not, because C6 has four notes and you are taking three neighbors out of it. Do not worry about naming them as chords. Think "triad from the third" or "triad beneath the sixth".'),
    browser({ shape: 'triads', set: [4, 3, 2], start: 2 }),
    p('Hold the bottom note on string 4 and say its name as you step through. That bottom voice is walking the path while the shape above it changes.'),
    head('Thirds inside triads'),
    p('Every triad contains two thirds. Moving between the thirds floor and the triads floor is the first taste of two voices going their own way, which is what the Elevator is for.'),
    read('Triads (short lesson), The Elevator Sequence, pages 1 to 2, and Foundations I, page 39.'),
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
    read('Shell Chords (short lesson), and The Elevator Sequence, page 3.'),
  ],

  octaves: () => [
    p('An ', b('octave chord'), ' has four notes, and the top one is the same note as the bottom one, an octave higher. In between sit two more notes of the chord.'),
    p('There are three kinds, named for the shape made by the lowest three notes:'),
    list('a triad with the octave on top', 'a low shell with the octave on top', 'a high shell with the octave on top'),
    browser({ shape: 'oct.triad', set: [5, 4, 3, 2], start: 2 }),
    browser({ shape: 'oct.low', set: [5, 4, 3, 2], start: 2 }),
    browser({ shape: 'oct.high', set: [5, 4, 3, 2], start: 2 }),
    p('Because they contain thirds, triads and shells, octave chords are where the earlier floors start to feel like one connected thing.'),
    h('p', { class: 'note' }, 'A naming wrinkle: the Octave Chords lesson names these by their lowest three notes, as this app does. The Elevator Sequence names the same three chords by their top three notes, so its "triad on top" is the "high shell" version here.'),
    read('Octave Chords (short lesson), and The Elevator Sequence, pages 3 to 4.'),
  ],

  drop2: () => [
    p(b('Drop 2'), ' is the full four-note chord, all four different notes, on four neighboring strings. The name describes how it is made: stack the chord close together, then drop the second note from the top down an octave.'),
    browser({ shape: 'drop2', set: [5, 4, 3, 2], start: 0 }),
    p('This is the classic way to play the whole scale in chords: four shapes of C6 alternating with one diminished shape that repeats every three frets.'),
    p('A drop 2 holds the smaller floors inside it. Its top three notes are a low shell. Its bottom three are a high shell. Its middle two are a third.'),
    say('As you step up, name the top note, then go again naming the bottom note.'),
    read('Drop 2 Chords (short lesson), The Elevator Sequence, page 4, and Foundations I, page 11.'),
  ],

  wide: () => [
    p('Three wider floors spread the same four notes across more of the neck by skipping strings.'),
    list(
      [b('Drop 3'), ': the third note from the top is dropped an octave. One string is skipped above the bass.'],
      [b('Drop 2 and 4'), ': the second and fourth notes from the top are dropped. The gap falls in the middle.'],
      [b('Double octave'), ': the top note is doubled two octaves below in the bass, with two chord notes between.'],
    ),
    browser({ shape: 'drop3', set: [6, 4, 3, 2], start: 2 }),
    browser({ shape: 'drop24', set: [6, 5, 3, 2], start: 2 }),
    head('Two double octaves'),
    p('The double octave comes in more than one version. Both of these are three notes of a drop 2 on the top four strings, with the bass note added on string 6. The first is the one to start with: a low shell on strings 3, 2 and 1 over the bass.'),
    browser({ shape: 'dbl', set: [6, 3, 2, 1], start: 2 }),
    p('The alternate leaves out string 2 instead of string 4.'),
    browser({ shape: 'dbl.alt', set: [6, 4, 3, 1], start: 2 }),
    head('The mirror'),
    p('Look at the distance between the top and bottom notes. Drop 2 spans a third plus an octave, drop 3 a fifth plus an octave, drop 2 and 4 a sixth plus an octave, and the double octave two octaves. Those are the spans of thirds, triads, shells and octaves again, one octave wider. That echo becomes useful later for pivoting.'),
    read('The Elevator Sequence, pages 5 and 12, and Reference Library: Drop 2 and 4.'),
  ],
};

Object.assign(LESSONS, {
  'motion.steps': () => [
    p('So far each chord has stood alone. Now put two in a row and listen to the outside edges: the top note, which is your melody, and the bottom note, which is your bass. Between any two chords those two voices can do three things.'),
    list(
      [b('Parallel'), ': both move the same way.'],
      [b('Contrary'), ': they move in opposite directions.'],
      [b('Oblique'), ': one holds while the other moves. That is the next step on the ladder.'],
    ),
    p('When the two voices do different things, one guitar starts to sound like two players. That is what the Elevator is for.'),
    head('One rule does all of it'),
    p('Under the same melody note, each floor up puts the bass one chord note lower. A third reaches down a little, a triad further, a shell further still.'),
    list(
      ['Stay on the ', b('same floor'), ' and the bass follows the melody. Parallel.'],
      ['Melody up a step and ', b('up a floor'), ': the bass steps down. Contrary.'],
      ['Melody down a step and ', b('down a floor'), ': the bass steps up. Contrary.'],
    ),
    p('Try it. The melody stays on string 2. Faded notes show where you just were.'),
    elevatorRide({ floor: 'thirds', deg: 2, max: 'shell.low' }),
    p('Ride from a third out to a shell and back while the melody climbs and falls. The top line and the bottom line are each a small tune of their own.'),
    head('How to practice it'),
    list(
      'Say the degree of the melody note first, as always.',
      'Before you move, decide what you want the bass to do. Then choose the floor that does it.',
      'Any shell will do when a shell is called for. Low and high shells have the same outside notes.',
    ),
    h('p', { class: 'note' }, 'A naming point: when both voices go the same way but by different amounts, some books call it "direct" motion. Here it is all called parallel, as in the course.'),
    read('The Elevator Sequence, pages 1 to 2 and 6, and Foundations I, pages 37 to 41.'),
  ],

  'motion.oblique': () => [
    p(b('Oblique motion'), ' is one voice staying put while another moves. On the guitar the most useful version is a held melody note with something walking beneath it.'),
    p('Think of it as two floors added together: a single note that stays, plus a smaller floor that moves. A note with one note moving under it. A note with a third moving under it. A note with a shell moving under it.'),
    head('In line, then out of line'),
    p('When the moving part sits two scale steps under the held note, everything belongs to one chord and you are simply on a bigger floor. A third under a held note is a triad. A shell under a held note is an octave chord.'),
    p('Step the lower part down the scale by one and it crosses to the other chord while the top stays behind. For a moment an ', off('off'), ' third sits under an ', on('on'), ' note, or the reverse. It sounds unsettled, and stepping back resolves it.'),
    browser({ shape: 'triads', set: [4, 3, 2], start: 5 }),
    p('In the drills you hold the top note of a shape like this one, and move only the lower part down a step and back.'),
    say('"Fifth, on" for the note you hold. Then name the bottom note each time it moves.'),
    p('This mixing of on and off notes is also the doorway to borrowing, which comes later.'),
    read('The Elevator Sequence, page 7.'),
  ],

  'motion.wide': () => [
    p('The rule you learned on the small floors carries all the way up. From a shell, a melody step up and a floor up gives an octave chord. Do it again and you reach drop 2. Each time the bass steps down while the melody steps up.'),
    elevatorRide({ floor: 'shell.low', deg: 4, max: 'drop2' }),
    head('The elevator of intervals'),
    p('It helps to know each floor by the distance between its outside notes: a third, a fifth (the triad), a sixth (the shell), an octave. After that the pattern repeats an octave wider: drop 2 is a third plus an octave, and so on.'),
    p('Knowing the outside distance lets you see a small floor inside a big one. The top three notes of a drop 2 are a low shell. Its middle two notes are a third.'),
    p('Drop 2 is easy to treat as a destination. Try to hear it as one more stop on the way, between the octave chord and whatever comes next.'),
    read('The Elevator Sequence, pages 4 and 7.'),
  ],
});

LESSONS.chart = () => [
  p('A chord chart names one chord per bar or half bar. In this method you do not play those chords as written. For each one you pick a ', b('scale of chords'), ' that covers it, and then everything you have practiced inside that scale is available: its floors, its path, its moves.'),
  p('Often the scale is built on a different note from the chord. That is ', b('substitution'), ', and a handful of rules covers almost every chart.'),
  head('Chords that are something else in disguise'),
  list(
    [b('Minor 7'), ': play the major 6 a minor third up. Dm7 has the notes D, F, A, C. So does F6. Dm7 is played with F major 6 diminished.'],
    [b('Half-diminished'), ': play the minor 6 a minor third up. Dm7♭5 has the same notes as Fm6.'],
    [b('Major'), ': the major 6 on the same root. For more color, the major 6 on its fifth: G6 over C.'],
    [b('Minor'), ' as a home chord: the minor 6 on the same root.'],
  ),
  head('Dominant chords: a choice'),
  p('A dominant chord is tension that wants to resolve, and there is more than one way to play that tension. For G7:'),
  list(
    [b('Minor 6 on the 5'), ': D minor 6. The fifth of G is D.'],
    [b('Tritone’s minor'), ': A♭ minor 6, a half step above the root. The darkest and most colorful, and a favorite when the chord resolves.'],
    [b('True dominant'), ': G dominant 7 diminished, the chord itself.'],
    [b('Dominant 7♭5'), ' and the ', b('tritone substitute'), ' (D♭7) are the other two.'],
  ),
  p('In the Songs tab each dominant starts on a sensible choice: the tritone’s minor when it resolves down a fifth, the minor 6 on the 5 when it does not. Tap a chord there to hear and try the others.'),
  head('Melody notes become degrees'),
  p('Once a bar has its scale, every melody note in it is simply a degree of that scale: "fifth, on" or "second, off". You already know shapes that have the fifth on top. That is how a melody gets harmonized without stopping to think about chord names.'),
  p('An off note in the melody is not a wrong note. It is a borrowed one, and it gets its own stage later.'),
  read('Foundations I, pages 42 to 47, and 5 Chord Melody Games.'),
];

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
