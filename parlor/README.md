# Parlor

A playable instrument for the Labyrinth of Limitations guitar method (Thomas Echols, building on Barry Harris). You practise in the Woodshed; this is where you play. Lives at `/parlor/` on this GitHub Pages site. It is unlinked and marked `noindex`.

Plain HTML, CSS and JavaScript modules. There is no build step: what is in this folder is what runs. Nothing is loaded from anywhere else, and it works offline once opened.

Parlor is separate from Woodshed. It started from copies of Woodshed's engine files, but it imports nothing from `woodshed/` when it runs.

## What it does

- **Play**: eight pads are the eight notes of a scale of chords (on chord on the top row, off chord below). Each pad plays its note as the melody with a floor of the Elevator beneath it. Controls for the floor, the kind of motion (parallel, contrary, oblique), borrowing, the stations round a home key (substitution), and the family of a 6th chord (transformation). A plate of strings tuned to the current chord.
- **Loop**: drums, bass and chords in steps, with tempo, swing, four patterns and a chain. Record the pads or tap steps in.
- **Sound**: a synth voice each for pads, strings and bass, four drum kits, a mixer, and shared chorus, delay and reverb.
- **Tune**: load a tune's changes and the pads retune chord by chord, the way the method reads a chart.

## Layout

| File | What it holds |
|---|---|
| `js/theory.js` | The scales of chords as pitches: notes, names, steps, where the pads sit |
| `js/floors.js` | The nine Elevator floors as shapes in scale steps, and voicing one beneath a melody note |
| `js/moves.js` | Motion between two chords, borrowing, the family of a 6th chord and its formulas, the stations round a key |
| `js/bass.js` | A bass line written as jobs (root, fifth, walk, approach) and turned into notes |
| `js/harmony.js` | Reading a chord chart: chord symbol to scale of chords (copied from Woodshed) |
| `js/tunes.js` | The built-in changes. Chords only |
| `js/seq.js` | The loop's arithmetic: steps, swing, patterns, chains, a chart laid out in steps |
| `js/rhythms.js` | The built-in rhythms and drum kits, as data |
| `js/audio.js` | The mixing desk: four parts, chorus, delay, reverb, a soft ceiling. Waking audio on first touch |
| `js/synth.js` | The synth voice, its controls and the presets |
| `js/drums.js` | Drum sounds made from sine waves and noise |
| `js/instrument.js` | What a pad, a borrow button or a string does |
| `js/band.js` | The clock: schedules the loop, follows a chart, records |
| `js/play.js`, `js/loop.js`, `js/sound.js`, `js/tune.js` | The four screens |
| `js/store.js` | What is remembered between visits (in this browser only) |
| `js/dom.js`, `js/app.js` | Page helpers; the top bar, tabs, keyboard and guide |
| `sw.js` | Offline support (network first, saved copy as fallback) |

Everything above `audio.js` in that table is pure data and functions with no page code, and is covered by the tests.

## Working on it

Run the tests (Node 20 or later, nothing to install):

```bash
node --test parlor/tests/*.test.mjs
```

Preview locally by serving the repository root and opening `/parlor/`:

```bash
python3 -m http.server 8767
```

In the browser console, `parlor.probe()` renders every voice and every drum offline and reports how loud each comes out. It is a way to check a change to the sound for silence or clipping without relying on ears. `parlor.state`, `parlor.inst` and `parlor.band` are there too.

## Releasing

1. Bump `VERSION` in `js/app.js` and in `sw.js` (and add any new file to the list in `sw.js`: a test checks that the list is complete).
2. Run the tests.
3. Commit with the version first, for example `Parlor v0.2: ...`, and push. GitHub Pages publishes within a minute or two.

## Content and copyright

The explanations in the app are its own and do not reproduce the course materials, which are not part of this repository and should stay out of it. Tunes are chord changes only: no melodies and no lyrics.

The instrument is an original design. Its string plate is in the spirit of an electronic chord harp, but it copies no other instrument's name, look or sounds: every sound is synthesized in `synth.js` and `drums.js`.
