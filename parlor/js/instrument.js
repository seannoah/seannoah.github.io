// instrument.js — the playing part: what a pad, a borrow button or a string does.
// It turns the state (key, scale, floor, motion) into chords with the engine's rules,
// and sounds them. The screens and the loop both play through here.

import { unlock } from './audio.js';
import { Synth, resolvePatch } from './synth.js';
import { Drums } from './drums.js';
import { midiAt, isOn, mod, chordPcs, harmonyNotes, sameHarmony, nearestStep, pcName, SCALES } from './theory.js';
import { FLOORS, SHAPES, shapeOn, shapeSteps, realize } from './floors.js';
import { nextChord, describeMotion, motionWords, borrow, underBorrowed, voiceName } from './moves.js';

const STRUM_GAP = 0.011;        // seconds between the notes of a pad chord, low to high
const PLATE_LOW = 45;           // the strings run from A2 ...
const PLATE_HIGH = 86;          // ... to D6

export function createInstrument(state, events, persist) {
  let rig = null;                 // { desk, pads, strum, bass, drums } once audio has started
  const held = new Map();         // pointer or key -> a sounding chord
  let latched = null;             // the chord left ringing when Hold is on
  let last = null;                // the last chord played: { steps, floor, shape, h, midis }
  let lean = 0;                   // +1 or -1 while a borrow button is down

  // ---- audio ----
  function audio() {
    if (rig) { unlock(); return rig; }
    const desk = unlock();
    if (!desk) return null;
    rig = { desk, pads: new Synth(desk, 'pads'), strum: new Synth(desk, 'strum', 30), bass: new Synth(desk, 'bass', 8), drums: new Drums(desk) };
    applySound();
    events.emit('audio', rig);
    return rig;
  }

  function applySound() {
    if (!rig) return;
    for (const name of ['pads', 'strum', 'bass']) {
      const part = state.parts[name];
      rig[name].setPatch(resolvePatch(part.preset, part.changes));
      rig.desk.setPart(name, { level: part.level });
    }
    rig.drums.setKit(state.drums.kit);
    rig.desk.setPart('drums', { level: state.drums.level, reverb: 0.12 });
    rig.desk.setFx(state.fx);
    rig.desk.setMaster(state.master);
  }

  // ---- harmony ----
  function setHarmony(h, why = 'pick') {
    if (!h) return;
    state.h = { root: h.root, scale: h.scale, ...(h.bass != null ? { bass: h.bass } : {}), ...(h.family ? { family: h.family } : {}), ...(h.sharp ? { sharp: true } : {}) };
    persist();
    events.emit('harmony', { h: state.h, why });
  }

  // The chord before this one, seen from the harmony sounding now. After a change of
  // harmony its notes are read as the nearest notes of the new scale.
  function before() {
    if (!last) return null;
    if (sameHarmony(last.h, state.h)) return last;
    const steps = [...new Set(last.midis.map((m) => nearestStep(state.h, m)))].sort((a, b) => a - b);
    return { steps, floor: last.floor };
  }

  // The chord a melody note gets, by the floor and the kind of motion chosen.
  function chordFor(n) {
    const prev = before();
    const next = nextChord(state.motion, prev, n, state.floor, state.variants);
    let { steps } = next;
    let kept = false;
    if (state.keepOn && !isOn(n) && next.shape && SHAPES[next.shape].steps.length > 1) { steps = underBorrowed(next.shape, n, 1); kept = true; }
    let leaned = null;
    if (lean) {
      const moved = borrow(steps, Math.min(state.borrowVoice, steps.length - 1), lean);
      if (moved) { leaned = { base: steps, dir: lean }; steps = moved; }
    }
    const motion = prev ? describeMotion(prev.steps, next.steps) : null;
    return { steps, floor: next.floor, shape: next.shape, kept, leaned, motion };
  }

  function sound(steps, h, { when = 0, vel = 0.82, dur = null } = {}) {
    if (!rig) return [];
    const notes = realize(h, steps);
    return notes.map((note, i) => rig.pads.noteOn(note.midi, {
      when: (when || rig.desk.ctx.currentTime) + i * STRUM_GAP,
      vel: vel * (i === notes.length - 1 ? 1 : 0.78),      // the melody sings out
      dur,
    }));
  }

  function release(chord, when = 0) {
    if (!rig || !chord) return;
    for (const id of chord.ids) rig.pads.noteOff(id, when);
  }

  // ---- pads ----
  function padDown(key, pad, opts = {}) {
    audio();
    if (held.has(key)) padUp(key, true);
    const n = pad + 8 * state.octave;
    const c = chordFor(n);
    if (c.floor !== state.floor) { state.floor = c.floor; events.emit('floor', state.floor); }
    if (latched) { release(latched); latched = null; }
    const h = { ...state.h };
    const chord = { ...c, n, pad, h, ids: sound(c.steps, h, opts), midis: realize(h, c.steps).map((x) => x.midi) };
    held.set(key, chord);
    last = { steps: c.leaned ? c.leaned.base : c.steps, floor: c.floor, shape: c.shape, h, midis: chord.midis, n };
    persist();
    events.emit('chord', describe(chord));
    events.emit('played', chord);
    return chord;
  }

  function padUp(key, quiet = false) {
    const chord = held.get(key);
    if (!chord) return;
    held.delete(key);
    if (state.hold && !quiet) latched = chord; else release(chord);
    events.emit('lifted', chord);
  }

  function setHold(on) {
    state.hold = !!on;
    if (!on && latched) { release(latched); latched = null; }
    persist();
  }

  // ---- borrowing ----
  // While a borrow button is down, one voice of every sounding chord leans to its
  // neighbor. Only that voice is struck again: the others keep ringing.
  function revoice(chord, steps) {
    const notes = realize(chord.h, steps);
    steps.forEach((n, i) => {
      if (n === chord.steps[i]) return;
      if (rig) {
        rig.pads.noteOff(chord.ids[i]);
        chord.ids[i] = rig.pads.noteOn(notes[i].midi, { vel: 0.74 });
      }
    });
    chord.steps = steps;
    chord.midis = notes.map((x) => x.midi);
  }

  function borrowDown(dir) {
    audio();
    lean = dir;
    let done = false;
    for (const chord of [...held.values(), ...(latched ? [latched] : [])]) {
      if (chord.leaned) continue;
      const moved = borrow(chord.steps, Math.min(state.borrowVoice, chord.steps.length - 1), dir);
      if (!moved) continue;
      chord.leaned = { base: chord.steps, dir };
      revoice(chord, moved);
      events.emit('chord', describe(chord));
      events.emit('played', chord);
      done = true;
    }
    return done;
  }

  function borrowUp() {
    lean = 0;
    for (const chord of [...held.values(), ...(latched ? [latched] : [])]) {
      if (!chord.leaned) continue;
      const { base } = chord.leaned;
      chord.leaned = null;
      revoice(chord, base);
      events.emit('chord', describe(chord));
      events.emit('played', chord);
    }
  }

  // ---- what just sounded, in words ----
  function describe(chord) {
    const names = harmonyNotes(chord.h);
    const top = names[mod(chord.n, 8)];
    const floorName = chord.shape ? SHAPES[chord.shape].name : 'Held beneath';
    const parts = [];
    if (chord.kept) parts.push('on chord kept beneath');
    if (chord.leaned) {
      const i = chord.steps.findIndex((s, k) => s !== chord.leaned.base[k]);
      const voice = voiceName(chord.steps.length, chord.steps.length - 1 - i);
      parts.push(`${voice} voice borrows the ${names[mod(chord.steps[i], 8)].say}`);
    }
    return {
      ...chord,
      top, floorName,
      title: `${top.say.charAt(0).toUpperCase()}${top.say.slice(1)}, ${top.on ? 'on' : 'off'}`,
      spelled: chord.steps.map((s) => names[mod(s, 8)].name).join(' '),
      detail: parts.join(' · '),
      moved: chord.motion ? motionWords(chord.motion) : '',
    };
  }

  // ---- strings ----
  // The plate is tuned to the chord of the last pad (its on chord or its off chord), across
  // three octaves; or to the whole scale, for single-note lines.
  function strings() {
    const h = state.h;
    const names = harmonyNotes(h);
    if (state.plate === 'scale') {
      const out = [];
      for (let n = -3 + 8 * state.octave; n <= 13 + 8 * state.octave; n++) {
        const note = names[mod(n, 8)];
        out.push({ midi: midiAt(h, n), on: note.on, label: note.label, name: note.name, root: mod(n, 8) === 0 });
      }
      return out;
    }
    const on = last && sameHarmony(last.h, h) ? isOn(last.n) : true;
    const pcs = chordPcs(h, on);
    const out = [];
    for (let midi = PLATE_LOW; midi <= PLATE_HIGH; midi++) {
      const pc = mod(midi, 12);
      if (!pcs.includes(pc)) continue;
      const note = names.find((x) => x.pc === pc);
      out.push({ midi, on, label: note ? note.label : '', name: note ? note.name : pcName(pc), root: pc === h.root });
    }
    return out;
  }

  function pluck(midi, vel = 0.7, when = 0) {
    const r = audio();
    if (!r) return;
    const p = r.strum.patch;
    r.strum.noteOn(midi, { when, vel, dur: Math.min(3.2, 0.3 + p.decay * 0.9) });
  }

  // one stroke across all the strings: dir +1 low to high, -1 high to low
  function strumAll(dir = 1, vel = 0.62) {
    const r = audio();
    if (!r) return;
    const list = strings();
    const order = dir > 0 ? list : [...list].reverse();
    const t = r.desk.ctx.currentTime;
    order.forEach((s, i) => pluck(s.midi, vel * (0.85 + 0.15 * (i / order.length)), t + i * 0.022));
    events.emit('strum', { dir });
  }

  function silence() {
    held.clear();
    latched = null;
    if (!rig) return;
    rig.pads.allOff(); rig.strum.allOff(); rig.bass.allOff();
  }

  // a short phrase to hear a part by, for the Sound screen
  function audition(part) {
    const r = audio();
    if (!r) return;
    const t = r.desk.ctx.currentTime + 0.02;
    if (part === 'bass') {
      [36, 43, 40, 36].forEach((m, i) => r.bass.noteOn(m, { when: t + i * 0.32, vel: 0.85, dur: 0.28 }));
    } else if (part === 'strum') {
      [48, 52, 55, 57, 60, 64, 67, 69, 72].forEach((m, i) => r.strum.noteOn(m, { when: t + i * 0.05, vel: 0.7, dur: 1.6 }));
    } else if (part === 'pads') {
      [55, 60, 64, 69].forEach((m, i) => r.pads.noteOn(m, { when: t + i * STRUM_GAP, vel: 0.8, dur: 1.1 }));
      [57, 62, 65, 71].forEach((m, i) => r.pads.noteOn(m, { when: t + 1.2 + i * STRUM_GAP, vel: 0.8, dur: 0.5 }));
      [55, 60, 64, 72].forEach((m, i) => r.pads.noteOn(m, { when: t + 1.8 + i * STRUM_GAP, vel: 0.8, dur: 1.4 }));
    }
  }

  return {
    audio, applySound, setHarmony, padDown, padUp, setHold, borrowDown, borrowUp, strings, pluck, strumAll, silence, audition,
    sound, describe,
    get rig() { return rig; },
    get last() { return last; },
    get heldCount() { return held.size + (latched ? 1 : 0); },
    floorName: () => { const f = FLOORS[state.floor]; return { floor: f, shape: SHAPES[shapeOn(state.floor, state.variants)] }; },
    scaleName: () => SCALES[state.h.scale].name,
    shapeSteps,
  };
}
