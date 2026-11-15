# Woodshed

A personal practice app for the Labyrinth of Limitations guitar method (Thomas Echols, building on Barry Harris). Lives at `/woodshed/` on this GitHub Pages site. It is unlinked and marked `noindex`.

Plain HTML, CSS and JavaScript modules. There is no build step: what is in this folder is what runs.

## Layout

| File | What it holds |
|---|---|
| `js/theory.js` | The four scales of chords, note names, step sizes |
| `js/floors.js` | The nine Elevator floors as rules, and where each shape sits on the neck |
| `js/curriculum.js` | The ladder of units, the practice items in each, and the session builder |
| `js/drills.js` | One exercise per item kind, in "away" and "guitar in hand" forms |
| `js/lessons.js` | The short reading for each unit |
| `js/widgets.js`, `js/neck.js` | Interactive figures and the fretboard drawing |
| `js/audio.js` | Plucked-string sound and metronome |
| `js/store.js` | Progress, spaced repetition, and merging two devices' copies |
| `js/sync.js` | Sync through a file in a private GitHub repository |
| `js/app.js` | The four pages and the session runner |
| `sw.js` | Offline support (network first, saved copy as fallback) |

## Working on it

Run the tests (Node 20 or later, nothing to install):

```bash
node --test woodshed/tests/*.test.mjs
```

The engine tests check generated shapes against fret numbers printed in the course charts, so run them after any change to `theory.js` or `floors.js`.

Preview locally by serving the repository root and opening `/woodshed/`:

```bash
python3 -m http.server 8766
```

In the browser console, `woodshed.run(['sh|maj6|shell.low|432|t|4'], 'guitar')` opens specific exercises. Item id formats are described at the top of `js/curriculum.js`.

## Releasing

1. Bump `VERSION` in `js/app.js` and in `sw.js` (and add any new file to the list in `sw.js`).
2. Run the tests.
3. Commit with the version first, for example `Woodshed v0.2: ...`, and push. GitHub Pages publishes within a minute or two.

## Content and copyright

Explanations in `lessons.js` are original to this app and point to pages of the course materials rather than reproducing them. The course PDFs are not part of this repository and should stay out of it.

All nine floors are checked against the course charts (see the note at the top of `js/floors.js`). The double octave has two versions, `dbl` and `dbl.alt`.
