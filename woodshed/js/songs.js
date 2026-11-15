// songs.js — the tunes, and what the app works out about each one: the scale of chords
// for every chart chord, where each melody note sits in it, and a shape to play under it.
//
// What may be published here: chord changes for any tune, and melodies only for
// compositions that are out of copyright in the US (published in 1930 or earlier, as of
// 2026). A melody the player types in for any other tune is kept in their own data.

import { OPEN, SCALES, degOfMidi, mod, isOn } from './theory.js';
import { SHAPES, voicings } from './floors.js';
import { parseChart, readChart, transposeChart, parseChord, prefersFlats } from './harmony.js';
import { state, save } from './store.js';
import { TUNES } from './tunes.js';

export { TUNES };

// ---- the library: built-in tunes plus the player's own ----
export function allSongs() {
  const mine = Object.entries(state.songs || {})
    .filter(([id, s]) => id.startsWith('my:') && !s.deleted)
    .map(([id, s]) => ({ id, own: true, ...s }));
  return [...TUNES, ...mine.sort((a, b) => a.title.localeCompare(b.title))];
}
export const songById = (id) => allSongs().find((s) => s.id === id) || null;

// Per-tune choices that are remembered: transposition, which scale was picked for a chord, the floor.
export const prefsOf = (id) => ({ shift: 0, picks: {}, floor: 'thirds', ...(((state.songs || {})[id] || {}).prefs || {}) });
export function setPrefs(id, patch) {
  state.songs = state.songs || {};
  const cur = state.songs[id] || {};
  state.songs[id] = { ...cur, prefs: { ...prefsOf(id), ...patch }, t: Date.now() };
  save();
}
export function saveOwnSong(id, data) {
  state.songs = state.songs || {};
  const key = id || `my:${Date.now().toString(36)}`;
  state.songs[key] = { ...(state.songs[key] || {}), ...data, deleted: false, t: Date.now() };
  save();
  return key;
}
export function deleteOwnSong(id) {
  if (!state.songs || !state.songs[id]) return;
  state.songs[id] = { deleted: true, t: Date.now() };
  save();
}

// ---- melody ----
// A melody is one string per bar, written as on a lead sheet: "D5:2 E5:1 F5:1" is three
// notes lasting 2, 1 and 1 beats; "r:1" is a rest; a note with no octave takes the one
// nearest the note before it; with no length, the notes of a bar share it equally.
// The notes are played at the pitch written (C5 is string 1, fret 8), which is where
// chord melody puts a tune: on the top two strings, with room for a chord beneath.
const NOTE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function parseMelody(lines, beatsPerBar = 4, shift = 0) {
  const out = [];
  let last = 72 + shift; // C5 written
  (lines || []).forEach((line, bar) => {
    const tokens = String(line || '').trim().split(/\s+/).filter(Boolean);
    const sized = tokens.filter((t) => t.includes(':')).length === tokens.length;
    let beat = 0;
    for (const tok of tokens) {
      const [name, len] = tok.split(':');
      const dur = sized ? parseFloat(len) : beatsPerBar / tokens.length;
      const m = /^([A-Ga-g])([b#♭♯]?)(-?\d)?$/.exec(name);
      if (m) {
        const pc = mod(NOTE_PC[m[1].toUpperCase()] + (/[b♭]/.test(m[2]) ? -1 : /[#♯]/.test(m[2]) ? 1 : 0), 12);
        let written;
        if (m[3] != null) written = 12 * (parseInt(m[3], 10) + 1) + pc + shift;
        else {
          const target = mod(pc + shift, 12);
          written = last - mod(last - target, 12);
          if (last - written > 6) written += 12; // nearest octave to the previous note
        }
        last = written;
        out.push({ bar, beat, dur, midi: written });
      }
      beat += dur;
    }
  });
  return out;
}

// ---- reading a tune ----
// Returns everything the song page needs, for the current transposition and scale choices.
export function readSong(song) {
  const prefs = prefsOf(song.id);
  const homePc = parseChord(song.key || 'C')?.root ?? 0;
  const flats = prefersFlats(homePc + prefs.shift);
  const chartText = transposeChart(song.chart, prefs.shift, flats);
  const bars = parseChart(chartText);
  const chords = readChart(bars, (i) => prefs.picks[i]);
  const beats = song.beats || 4;
  const melody = parseMelody(song.melody, beats, prefs.shift).map((n) => {
    const inBar = chords.filter((c) => c.bar === n.bar);
    const chord = inBar[Math.min(inBar.length - 1, Math.floor((n.beat / beats) * inBar.length))] || null;
    const deg = chord ? degOfMidi(chord.use.key, chord.use.scale, n.midi) : -1;
    return { ...n, chord, deg, on: deg >= 0 ? isOn(deg) : null, label: deg >= 0 ? SCALES[chord.use.scale].labels[deg] : '·', say: deg >= 0 ? SCALES[chord.use.scale].say[deg] : 'outside the scale' };
  });
  const keyChord = parseChord(transposeChart(`| ${song.key || 'C'} |`, prefs.shift, flats).replace(/[|\s]/g, ''));
  return { song, prefs, bars, chords, melody, beats, keyText: keyChord ? keyChord.text : song.key };
}

// ---- a shape under a melody note ----
const lowestFret = (v) => Math.min(...v.notes.map((n) => n.fret));
// The voicing of a shape whose top note is exactly this pitch, on whichever string set
// sits best: off the open strings when possible, and near `around` (a fret) if given.
export function shapeUnder(use, shapeId, midi, around = null) {
  const found = [];
  for (const set of SHAPES[shapeId].sets) {
    const v = voicings(use.key, use.scale, shapeId, set).find((x) => x.notes[x.notes.length - 1].midi === midi);
    if (v) found.push(v);
  }
  if (!found.length) return null;
  const score = (v) => (lowestFret(v) === 0 ? 6 : 0) + (v.maxFret > 12 ? v.maxFret - 12 : 0)
    + (around == null ? Math.abs(v.minFret - 5) * 0.3 : Math.abs(v.minFret - around) * 0.6)
    + (v.set[v.set.length - 1] > 2 ? 2 : 0);
  return found.sort((a, b) => score(a) - score(b))[0];
}

// A top note for a chord when the tune has no melody: an on-chord note in a comfortable register.
export function topNoteFor(use, degree = 4) {
  for (const fret of [5, 6, 7, 8, 4, 3, 9, 10, 2, 1, 11, 12]) {
    const midi = OPEN[2] + fret;
    if (degOfMidi(use.key, use.scale, midi) === degree) return midi;
  }
  return null;
}

// The steps of a play-through: each melody note (or each chord, if there is no melody)
// with a shape of the chosen floor beneath it.
export function playThrough(read, shapeId) {
  const steps = [];
  let around = null;
  if (read.melody.length) {
    for (const n of read.melody) {
      if (!n.chord) continue;
      const v = n.deg >= 0 ? shapeUnder(n.chord.use, shapeId, n.midi, around) : null;
      if (v) around = v.minFret || around;
      steps.push({ bar: n.bar, chord: n.chord, note: n, voicing: v });
    }
  } else {
    for (const chord of read.chords) {
      const midi = topNoteFor(chord.use, chord.use.scale === 'dim' ? 0 : 4);
      const v = midi != null ? shapeUnder(chord.use, shapeId, midi, around) : null;
      if (v) around = v.minFret || around;
      steps.push({ bar: chord.bar, chord, note: midi != null ? { midi, deg: degOfMidi(chord.use.key, chord.use.scale, midi) } : null, voicing: v });
    }
  }
  return steps;
}
