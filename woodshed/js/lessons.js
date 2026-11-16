// lessons.js — a short reading for each unit, in plain language, with something to
// touch and hear. These are this app's own explanations of the method; "Read" points
// to where Thomas Echols teaches it in his course materials.

import { h } from './dom.js';
import { scaleStrip, pathChips, pathCompare, shapeBrowser, elevatorRide, borrowDemo, transformLab, chainPlayer } from './widgets.js';
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

Object.assign(LESSONS, {
  'borrow.voice': () => [
    p('On the path, every on note has an off note right next to it, a step above and a step below. ', b('Borrowing'), ' is letting one voice of a chord step to that neighbor while the other voices stay where they are.'),
    p('For a moment the chord holds one note that does not belong to it. It leans. Then the voice steps back and the chord is whole again. That small lean and release is one of the most recognizable sounds in this style.'),
    head('It is pathfinding inside a chord'),
    p('Nothing new has to be memorized. To borrow below the third you only need to know what you already drilled on a single string: the note below the third is a whole step away. The difference is that you now do it in one voice while holding a shape.'),
    p('Try it. Choose a voice, borrow above or below, and give it back.'),
    borrowDemo({ shape: 'triads', set: [4, 3, 2], deg: 4 }),
    head('How to practice it'),
    list(
      'Say which note you are moving before you move it: "third".',
      'See the distance first. Half step or whole step?',
      'Let the other notes keep ringing. The sustain is part of the sound.',
      'Give it back, and hear the chord settle.',
    ),
    p('Some borrowed chords have everyday names. C6 with the root borrowed below is a C major 7. Try not to think of those names. "Root, borrow below" is faster, and it works on every chord in every key.'),
    read('Foundations I, pages 34 to 36, and 5 Chord Melody Games, scenario 5.'),
  ],

  'borrow.melody': () => [
    p('Sooner or later a melody lands on an off note and stays there. You have two ways to play it.'),
    list(
      ['Move everything to the ', off('off chord'), '. The melody and the harmony lean together, then resolve together.'],
      ['Keep the ', on('on chord'), ' underneath and treat the melody note as ', b('borrowed'), '. Only the top leans. This is usually the better choice on a strong beat, or when a new harmony has just arrived.'],
    ),
    head('How to find the chord'),
    p('Look at the on note right next to the melody, above it or below it. Summon the shape that belongs under that on note. Then let the melody take its place on top.'),
    p('So for each off note and each floor there are just two answers: borrowed from the note above, or from the note below. The same shapes work in every key.'),
    borrowDemo({ shape: 'shell.low', set: [4, 3, 2], deg: 2 }),
    p('Above, borrow below the top voice: the third becomes the second, with the same two notes of the on chord still beneath it. That is the shape for a melody sitting on the second.'),
    head('Two distances worth knowing cold'),
    list(
      'A voice on the root borrows below by a half step, to the major seven.',
      'A voice on the sixth borrows above by a whole step, to the same major seven.',
    ),
    p('In the Songs tab, when a tune has a melody you can choose what happens under its off notes: move to the off chord, or borrow over the on chord.'),
    read('5 Chord Melody Games, scenario 4, and Chord Melodies in Any Key, step 3.'),
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
  p('An off note in the melody is not a wrong note. It can be treated as a borrowed one, which the Borrowing lessons cover.'),
  read('Foundations I, pages 42 to 47, and 5 Chord Melody Games.'),
];

const f = (text) => h('span', { class: 'formula' }, text);

Object.assign(LESSONS, {
  'tr.family': () => [
    p(b('Transformation'), ' is turning one chord into another by the shortest route, so that a chord change becomes a small move of the hand and not a new chord to look up. It works on the two 6th chords, major 6 and minor 6, and it is practiced on one floor first: drop 2.'),
    head('Four chords under one hand'),
    p('Take a diminished 7 chord in drop 2. Raise any one of its notes by a fret and you have a minor 6 chord. The note you raised is that chord’s fifth. There are four notes you could raise, so one diminished shape gives four minor 6 chords, a minor third apart, all within a fret of each other.'),
    p('Barry Harris called these four ', b('brothers and sisters'), '. F minor 6, D minor 6, B minor 6 and A♭ minor 6 are one family. They live in the same place on the neck.'),
    head('Know each one by its bass'),
    p('In that one place, what tells the four apart is which note of the chord is on the bottom: the ', b('root'), ', the ', b('third'), ', the ', b('fifth'), ' or the ', b('sixth'), '. So you do not ask "what chord is next?" You ask "what is in the bass now, and what should it become?"'),
    p('Put the four in a circle, in that order. Moving ', b('forward'), ' takes you to the next one round, ', b('backward'), ' to the one before, and ', b('across'), ' to the one opposite.'),
    transformLab({ root: 5, scale: 'min6', role: 0 }),
    p('Step forward four times and you are back where you began, having played all four members of the family. Notice how little the hand moves.'),
    head('Tall siblings'),
    p('Watch the bass note on string 5 as you go round. For three of the four minor 6 chords it sits on the same fret. Only when the bass is the ', b('fifth'), ' is it one fret higher. That one is the tall sibling, ringed in gold on the circle. It is tall because the fifth is the note that was raised out of the diminished chord.'),
    p('A major 6 chord is a minor 6 with its third raised, so a major 6 family has two tall siblings: the ', b('third'), ' and the ', b('fifth'), '.'),
    transformLab({ root: 5, scale: 'maj6', role: 0 }),
    head('How to practice it'),
    list(
      'Bass first. On string 5 alone, play the four bass notes of a family and say "root, third, fifth, sixth". Move up a fret for a tall one, and back.',
      'Then summon. Play the bass note, say what it is, and add the shape above it.',
      'Go round forward, then backward, then across.',
    ),
    say('"Fifth." Move backward. "Third." The bass comes down a fret, and the shape above it changes.'),
    read('Foundations I, pages 48 to 50, and Foundations IV, pages 15 to 20.'),
  ],

  'tr.major': () => [
    p('Going round the circle keeps you inside one family. To reach every other 6th chord you need two more moves, and that is all.'),
    list(
      [b('Round the circle'), ': forward, backward or across. This changes what is in the bass.'],
      [b('Up or down a family'), ': the same shape, one fret higher or lower. There are only three families, so another one is never more than a fret away.'],
      [b('Major or minor'), ': the third is raised or lowered.'],
    ),
    p('Written in brackets, these make a ', b('formula'), ', such as ', f('[Backward, Up, Major]'), '. Any two 6th chords are joined by exactly one formula, and the formula is the same in every key. Learn a handful and you can play most chord changes without thinking of a single chord name.'),
    transformLab({ root: 3, scale: 'maj6', role: 0, full: true }),
    head('The ii–V–I'),
    p('From Reading a chart you know how these three chords are played. In B♭: the ii chord, Cm7, is ', b('E♭6'), '. The V chord, F7, is the minor 6 on the 5, ', b('Cm6'), ', or the tritone’s minor, ', b('G♭m6'), '. The I chord is ', b('B♭6'), '. That gives two paths.'),
    list(
      [b('Inside'), ': ', f('[Forward, Minor]'), ' then ', f('[Forward, Up, Major]'), '. The first move is one voice: the fifth of the major 6 drops a fret. Every note stays in the key.'],
      [b('Outside'), ': ', f('[Backward, Minor]'), ' then ', f('[Backward, Up, Major]'), '. Three voices move a fret each, and the V chord borrows notes from outside the key.'],
    ),
    p('Forward for the inside path, backward for the outside one. To use both minors over the V chord, the move between them is simply ', f('[Across]'), '.'),
    chainPlayer({ chains: ['major-on5', 'major-tm', 'major-both', 'major-soft'], tonic: 10, role: 0 }),
    p('Try each path from all four starting bass notes. The frets change. The formula does not.'),
    head('A softer landing'),
    p('The I chord can also be played as the major 6 on its 5: F6 over B♭. From the tritone’s minor that is the easiest resolution there is, ', f('[Down, Major]'), ': slide the shape down a fret and raise its third. It is the last path in the figure above.'),
    head('How to practice it'),
    list(
      'One floor, one set of strings, four starting points.',
      'Say the formula. Say what will be in the bass. Then move.',
      'When a move feels slow, do the parts one at a time: round the circle, then up or down, then major or minor.',
    ),
    read('Foundations IV, pages 13 to 32, and Foundations I, pages 49 to 50.'),
  ],

  'tr.minor': () => [
    p('Nothing new is needed here. The same three kinds of move, put together differently, cover the minor ii–V–i and several other progressions that turn up in nearly every tune.'),
    head('Minor ii–V–i'),
    p('In G minor: the ii chord, Am7♭5, is ', b('Cm6'), '. The V chord, D7, is played as its tritone’s minor, ', b('E♭m6'), '. The i chord is ', b('Gm6'), '.'),
    list(
      ['ii to V: ', f('[Backward]'), '. Both chords are minor 6 and both are in the same family, so this is the easiest transformation of all.'],
      ['V to i: ', f('[Backward, Up]'), '. Backward again, and up a fret.'],
    ),
    chainPlayer({ chains: ['minor'], tonic: 7, role: 3 }),
    head('The minor iv'),
    p('A major IV chord that turns minor before going home is one of the prettiest sounds in a ballad. In B♭: ', b('E♭6'), ', then ', b('E♭m6'), ', then ', b('B♭6'), '.'),
    list(
      ['IV to minor iv: ', f('[Minor]'), '. One voice, the third, drops a fret.'],
      ['Minor iv to I: ', f('[Across, Up, Major]'), '. All three parts at once, so it takes the longest to learn. It comes back in turnarounds, which makes it worth the time.'],
    ),
    p('When a chart shows A♭7 going to B♭, the "back-door" dominant, play the same E♭m6 and the same move home.'),
    chainPlayer({ chains: ['minor-iv', 'to-ii'], tonic: 10, role: 0 }),
    head('The same move in different places'),
    p('From the I chord to the ii chord is ', f('[Across, Down]'), ', the second path in the figure above. And ', f('[Forward, Minor]'), ', which took the ii chord to its V, is also how Stella by Starlight gets from B♭ to Em7♭5 in bars 9 and 10. One practiced move, two uses.'),
    p('In the Songs tab, tap any chord in a chart. When it and its neighbor are both played as 6th chords, the formula between them is shown. Once you have started this stage, "Practice this tune" also drills the tune’s own moves.'),
    read('Foundations IV, pages 50 to 52, 67, 73 to 76 and 86, and Foundations I, pages 51 to 53.'),
  ],
});

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
