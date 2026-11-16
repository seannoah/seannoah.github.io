// instrument.js — the playing part: what a pad, a voice key, the Elevator or a string does.
// It turns the state (key, scale, floor, motion) into chords with the engine's rules,
// and sounds them. The screens and the loop both play through here.
//
// A sounding chord is kept as scale steps under a melody note. Whatever changes while it
// rings (a voice leaning to its neighbor, a change of floor, a new harmony under a chord
// left ringing by Hold) is done by striking only the notes that are new and letting go
// only the ones that have gone, so everything else keeps ringing.

import { unlock } from './audio.js';
import { Synth, resolvePatch } from './synth.js';
import { Drums } from './drums.js';
import { midiAt, isOn, mod, chordPcs, harmonyNotes, sameHarmony, nearestStep, pcName, SCALES } from './theory.js';
import { FLOORS, SHAPES, shapeOn, shapeSteps, realize } from './floors.js';
import { nextChord, describeMotion, motionWords, leanAll, borrow, underBorrowed, voiceName, carry } from './moves.js';

const STRUM_GAP = 0.011;        // seconds between the notes of a pad chord, low to high
const PLATE_LOW = 45;           // the strings run from A2 ...
const PLATE_HIGH = 86;          // ... to D6
const VOICES_KEY = 'voices';    // the chord struck by a voice key when nothing was ringing

export function createInstrument(state, events, persist) {
  let rig = null;                 // { desk, pads, strum, bass, drums } once audio has started
  const held = new Map();         // pointer or key -> a sounding chord
  let latched = null;             // the chord left ringing when Hold is on
  let last = null;                // the last chord played: { steps, floor, shape, h, midis, n }
  const leans = {};               // voice (counted from the top) -> +1 or -1, while its key is down

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

  const now = () => (rig ? rig.desk.ctx.currentTime : 0);
  const sounding = () => [...held.values(), ...(latched ? [latched] : [])];
  const shapeNow = () => shapeOn(state.floor, state.variants);
  const pitches = (h, steps) => realize(h, steps).map((x) => x.midi);

  // ---- sounding and re-voicing ----
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

  // Change what a ringing chord is. Notes it already has keep ringing; only the new ones
  // are struck and only the ones no longer wanted are let go.
  function revoice(chord, steps, h = chord.h) {
    const want = pitches(h, steps);
    const old = chord.midis.map((midi, i) => ({ midi, id: chord.ids[i] }));
    const ids = want.map((midi) => {
      const k = old.findIndex((o) => o && o.midi === midi);
      if (k >= 0) { const { id } = old[k]; old[k] = null; return id; }
      return rig ? rig.pads.noteOn(midi, { vel: 0.74 }) : 0;
    });
    if (rig) for (const o of old) if (o) rig.pads.noteOff(o.id);
    chord.steps = steps; chord.h = h; chord.ids = ids; chord.midis = want;
  }

  const remember = (c) => { last = { steps: c.base, floor: c.floor, shape: c.shape, h: c.h, midis: pitches(c.h, c.base), n: c.n }; };
  const announce = (c) => { events.emit('chord', describe(c)); events.emit('played', c); };

  // ---- harmony ----
  function setHarmony(h, why = 'pick') {
    if (!h) return;
    state.h = { root: h.root, scale: h.scale, ...(h.bass != null ? { bass: h.bass } : {}), ...(h.family ? { family: h.family } : {}), ...(h.sharp ? { sharp: true } : {}) };
    persist();
    events.emit('harmony', { h: state.h, why });
    // A chord under a finger stays in the harmony it was played in until the finger lifts.
    // A chord left ringing by Hold goes with the harmony, by the shortest route.
    if (latched && !held.size && !sameHarmony(latched.h, state.h)) {
      const c = latched;
      const shape = c.shape || shapeOn(c.floor, state.variants);
      const moved = carry(pitches(c.h, c.base), shape, state.h, isOn(c.n));
      c.n = moved.top; c.pad = c.n - 8 * state.octave; c.base = moved.steps; c.shape = shape; c.kept = false; c.motion = null;
      revoice(c, leanAll(c.base, leans), { ...state.h });
      remember(c);
      announce(c);
    }
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
    let base = next.steps;
    let kept = false;
    if (state.keepOn && !isOn(n) && next.shape && base.length > 1) { base = underBorrowed(next.shape, n, 1); kept = true; }
    return { base, floor: next.floor, shape: next.shape, kept, motion: prev ? describeMotion(prev.steps, next.steps) : null };
  }

  // The chord that would sound if a voice key were pressed with nothing ringing: the last
  // melody note (or the fifth, at the very start), on the floor in use now.
  function ghost() {
    const h = { ...state.h };
    let n = 4 + 8 * state.octave;
    if (last) n = sameHarmony(last.h, h) ? last.n : nearestStep(h, last.midis[last.midis.length - 1], isOn(last.n) ? 'on' : 'off');
    const shape = shapeNow();
    return { base: shapeSteps(shape, n), n, pad: n - 8 * state.octave, h, floor: state.floor, shape, kept: false, motion: null };
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
    const steps = leanAll(c.base, leans);
    const chord = { ...c, n, pad, h, steps, ids: sound(steps, h, opts), midis: pitches(h, steps) };
    held.set(key, chord);
    remember(chord);
    persist();
    announce(chord);
    return chord;
  }

  function latch(chord) {
    if (latched && latched !== chord) release(latched);
    latched = chord;
  }

  function padUp(key, quiet = false) {
    const chord = held.get(key);
    if (!chord) return;
    held.delete(key);
    if (state.hold && !quiet) latch(chord); else release(chord);
    events.emit('lifted', chord);
  }

  function setHold(on) {
    state.hold = !!on;
    if (!on && latched) { release(latched); latched = null; }
    persist();
  }

  // ---- the Elevator, live ----
  // A change of floor reaches the chords that are ringing: the melody stays where it is
  // and the notes beneath it are added or taken away.
  function refloor() {
    const shape = shapeNow();
    const list = sounding();
    for (const c of list) {
      c.base = c.kept && SHAPES[shape].steps.length > 1 ? underBorrowed(shape, c.n, 1) : shapeSteps(shape, c.n);
      c.floor = state.floor; c.shape = shape; c.motion = null;
      revoice(c, leanAll(c.base, leans));
      remember(c);
      announce(c);
    }
    if (!list.length) events.emit('voices');
    return list.length > 0;
  }

  // ---- borrowing ----
  // While a voice key is down, that voice of every ringing chord leans to its neighbor,
  // and chords played meanwhile lean too. With nothing ringing, the last chord is struck
  // again, leaning.
  function relean() {
    let changed = false;
    for (const c of sounding()) {
      const steps = leanAll(c.base, leans);
      if (steps.every((s, i) => s === c.steps[i])) continue;
      revoice(c, steps);
      announce(c);
      changed = true;
    }
    return changed;
  }

  function lean(voice, dir) {
    audio();
    leans[voice] = dir;
    if (!sounding().length) {
      const g = ghost();
      const steps = leanAll(g.base, leans);
      const chord = { ...g, steps, ids: sound(steps, g.h), midis: pitches(g.h, steps) };
      held.set(VOICES_KEY, chord);
      remember(chord);
      announce(chord);
      return steps.some((s, i) => s !== g.base[i]);
    }
    return relean();
  }

  function unlean(voice) {
    if (!(voice in leans)) return;
    delete leans[voice];
    relean();
    // a chord the voice keys struck themselves settles, rings a moment, and goes
    if (!Object.keys(leans).length && held.has(VOICES_KEY)) {
      const chord = held.get(VOICES_KEY);
      held.delete(VOICES_KEY);
      if (state.hold) latch(chord); else release(chord, now() + 0.9);
      events.emit('lifted', chord);
    }
  }

  function unleanAll() { for (const voice of Object.keys(leans)) unlean(Number(voice)); }

  // The voices of the chord that is ringing (or would ring), low to high, for the voice
  // keys: where each one lives, where it is now, and whether it can go up or down.
  function voices() {
    const list = sounding();
    const c = list.length ? list[list.length - 1] : ghost();
    const names = harmonyNotes(c.h);
    const steps = c.steps || leanAll(c.base, leans);
    return c.base.map((home, i) => {
      const fromTop = c.base.length - 1 - i;
      return {
        fromTop,
        home: names[mod(home, 8)],
        now: names[mod(steps[i], 8)],
        lean: steps[i] - home,
        // the neighbors it can borrow, and whether each is free (not already sounding)
        up: names[mod(home + 1, 8)], down: names[mod(home - 1, 8)],
        canUp: !!borrow(c.base, fromTop, 1), canDown: !!borrow(c.base, fromTop, -1),
        ringing: list.length > 0,
      };
    });
  }

  // ---- what just sounded, in words ----
  function describe(chord) {
    const names = harmonyNotes(chord.h);
    const top = names[mod(chord.n, 8)];
    const floorName = chord.shape ? SHAPES[chord.shape].name : 'Held beneath';
    const parts = [];
    if (chord.kept) parts.push('on chord kept beneath');
    chord.steps.forEach((s, i) => {
      if (s === chord.base[i]) return;
      const voice = voiceName(chord.steps.length, chord.steps.length - 1 - i);
      parts.push(`${voice} borrows the ${names[mod(s, 8)].say}`);
    });
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
    for (const voice of Object.keys(leans)) delete leans[voice];
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
    audio, applySound, setHarmony, padDown, padUp, setHold, refloor, lean, unlean, unleanAll, voices, strings, pluck, strumAll, silence, audition,
    sound, describe,
    get rig() { return rig; },
    get last() { return last; },
    get heldCount() { return held.size + (latched ? 1 : 0); },
    get latched() { return latched; },
    floorName: () => { const f = FLOORS[state.floor]; return { floor: f, shape: SHAPES[shapeOn(state.floor, state.variants)] }; },
    scaleName: () => SCALES[state.h.scale].name,
    shapeSteps,
  };
}
