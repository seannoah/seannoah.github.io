// band.js — the loop: a clock that looks a little way ahead and schedules drums, bass
// and chords on the audio clock, follows a tune's changes, and records what is played.
// The arithmetic lives in seq.js; this file is the part that touches time and sound.

import { SIGS, stepsPerBar, stepLength, gateTime, locate, chordAt, chordGate, patternSteps, buildTimeline, timelineAtStep, putChord, chainSteps, resizePattern, LANES, PATTERN_IDS, clampTempo } from './seq.js';
import { bassNote, bassRootPc } from './bass.js';
import { shapeOn, shapeSteps } from './floors.js';
import { nearestStep, midiAt, mod, sameHarmony } from './theory.js';
import { parseChart, readChart, transposeChart, prefersFlats } from './harmony.js';
import { tuneById, parseKey } from './tunes.js';
import { rhythmById, patternsOf, rhythmForBeats, compSteps } from './rhythms.js';
import { latency } from './audio.js';

const AHEAD = 0.14;     // seconds of music scheduled in advance
const TICK = 25;        // milliseconds between looks at the clock

export function createBand(state, inst, events, persist) {
  let playing = false;
  let recording = false;
  let g = 0;              // the next step to schedule
  let tNext = 0;          // when it falls, on the audio clock
  let timer = 0;
  let frame = 0;
  let queue = [];         // things the screen should show when their moment comes
  let recent = [];        // [step, time] of the steps scheduled lately, for recording
  let tl = null;          // the tune's changes laid out in steps, or null
  let lastEntry = null;
  let cursor = 0;         // which chord of the chart is under the hand when stopped
  let bassMemo = { key: '', count: 0, prev: null };
  let autoTop = 64;
  let ahead = null;       // the harmony the loop's own chords have moved to, a little before it is heard
  const skip = new Map(); // a chord just recorded should not sound twice on its first lap
  const open = new Map(); // chords being held while recording, waiting for their length

  const sig = () => SIGS[state.song.sig];
  const song = () => state.song;

  // ---------- the tune ----------
  function tuneNow() {
    const t = state.tune;
    if (!t.id) return null;
    if (t.id === 'custom') return { id: 'custom', title: 'My changes', chart: t.custom, key: null, beats: t.customBeats || 4 };
    return tuneById(t.id);
  }

  function rebuild() {
    const tune = tuneNow();
    if (!tune) { tl = null; lastEntry = null; events.emit('timeline', null); return; }
    const key = tune.key ? parseKey(tune.key) : null;
    const shift = state.tune.transpose || 0;
    const home = key ? mod(key.root + shift, 12) : null;
    const text = transposeChart(tune.chart, shift, home == null ? true : prefersFlats(home));
    const picks = state.tune.picks[tune.id] || {};
    const read = readChart(parseChart(text), (i) => picks[i] || 0, home, key ? key.minor : false);
    tl = buildTimeline(read, sig());
    tl.home = home; tl.minor = key ? key.minor : false; tl.tune = tune;
    cursor = Math.min(cursor, Math.max(0, tl.entries.length - 1));
    events.emit('timeline', tl);
  }

  // Choose a tune (or null for none). Its time decides the rhythm when the two disagree.
  function setTune(id) {
    state.tune.id = id;
    state.tune.transpose = 0;
    cursor = 0;
    const tune = tuneNow();
    if (tune) {
      const wanted = tune.beats === 3 ? '3/4' : tune.beats === 6 ? '6/8' : '4/4';
      if (wanted !== state.song.sig) setRhythm(rhythmForBeats(tune.beats) || 'ballad');
      else if (tune.rhythm && tune.rhythm !== state.song.rhythm && !hasChords()) setRhythm(tune.rhythm);
      if (tune.key) { const key = parseKey(tune.key); state.home = { root: key.root, scale: key.minor ? 'min6' : 'maj6' }; }
    }
    rebuild();
    if (tl && tl.entries.length && !playing) inst.setHarmony(tl.entries[0].h, 'chart');
    if (playing) restart();
    persist();
    events.emit('tune', tune);
  }

  function setTranspose(steps) {
    state.tune.transpose = Math.max(-6, Math.min(6, steps));
    rebuild();
    if (tl && tl.home != null) state.home = { root: tl.home, scale: tl.minor ? 'min6' : 'maj6' };
    if (tl && !playing) gotoEntry(cursor);
    persist();
  }

  // Choose which of its readings a chart chord uses (which substitution, for a dominant).
  function setPick(index, pick) {
    const tune = tuneNow();
    if (!tune) return;
    const picks = { ...(state.tune.picks[tune.id] || {}) };
    if (pick) picks[index] = pick; else delete picks[index];
    state.tune.picks[tune.id] = picks;
    rebuild();
    const entry = tl.entries[index];
    if (entry && (!playing || lastEntry == null || lastEntry.index === index)) { inst.setHarmony(entry.h, 'chart'); if (playing) lastEntry = entry; }
    persist();
  }

  function gotoEntry(i) {
    if (!tl || !tl.entries.length) return null;
    cursor = mod(i, tl.entries.length);
    const entry = tl.entries[cursor];
    inst.setHarmony(entry.h, 'chart');
    events.emit('entry', entry);
    return entry;
  }

  // ---------- rhythm and patterns ----------
  const hasChords = () => PATTERN_IDS.some((id) => song().patterns[id].chords.length > 0);

  function setRhythm(id) {
    const r = rhythmById(id);
    const s = song();
    const sameSig = r.sig === s.sig;
    const fresh = patternsOf(r);
    if (sameSig) {
      // keep the chords that were recorded: only the drums and bass are replaced
      for (const pid of PATTERN_IDS) fresh[pid].chords = resizePattern(s.patterns[pid], sig(), fresh[pid].bars).chords;
    }
    s.rhythm = r.id; s.sig = r.sig; s.bpm = r.bpm; s.swing = r.swing; s.patterns = fresh;
    if (!sameSig) s.chain = ['A'];
    state.drums.kit = r.kit;
    inst.applySound();
    if (!sameSig) { rebuild(); if (playing) restart(); }
    persist();
    events.emit('song', s);
  }

  function setTempo(bpm) { song().bpm = clampTempo(bpm); persist(); events.emit('tempo', song().bpm); }
  function setSwing(x) { song().swing = Math.max(0.5, Math.min(0.75, x)); persist(); }

  // Put a chord on every step where the rhythm would strike one. These are "auto" chords:
  // each takes the on chord nearest the one before it, on the floor in use when it sounds.
  function fillComp(id = song().edit) {
    const r = rhythmById(song().rhythm);
    const which = PATTERN_IDS.indexOf(id) % 2 ? 'B' : 'A';
    let p = song().patterns[id];
    const n = patternSteps(p, sig());
    for (const s of compSteps(r, which)) if (s < n) p = putChord(p, { s, len: null, n: 'auto', steps: null, floor: null });
    song().patterns[id] = p;
    persist();
    events.emit('song', song());
  }

  // ---------- the clock ----------
  function start({ record = false } = {}) {
    const rig = inst.audio();
    if (!rig) return;
    stop(true);
    recording = record;
    playing = true;
    g = 0; queue = []; recent = []; lastEntry = null; ahead = null; skip.clear(); open.clear();
    bassMemo = { key: '', count: 0, prev: null };
    const now = rig.desk.ctx.currentTime;
    const beat = 60 / song().bpm;
    let lead = 0.09;
    if (record) {
      // count one bar in before recording
      for (let b = 0; b < sig().beats; b++) rig.drums.tick(now + 0.09 + b * beat, b === 0);
      lead += sig().beats * beat;
    }
    tNext = now + lead;
    timer = setInterval(tick, TICK);
    tick();
    frame = requestAnimationFrame(pump);
    events.emit('transport', { playing, recording });
  }

  function stop(quiet = false) {
    if (!playing && !quiet) return;
    clearInterval(timer);
    cancelAnimationFrame(frame);
    const was = playing;
    playing = false; recording = false; queue = [];
    if (was && inst.rig) { inst.rig.bass.allOff(); inst.rig.pads.allOff(); }
    open.clear();
    if (lastEntry) cursor = lastEntry.index;
    if (!quiet || was) events.emit('transport', { playing, recording });
  }

  function restart() { const rec = recording; start({ record: rec }); }
  const toggle = () => (playing ? stop() : start());
  function setRecord(on) {
    if (on && !playing) { start({ record: true }); return; }
    recording = !!on;
    if (!on) open.clear();
    events.emit('transport', { playing, recording });
  }

  function tick() {
    const rig = inst.rig;
    if (!rig || !playing) return;
    const now = rig.desk.ctx.currentTime;
    const s = song();
    flush();
    // after a long sleep (a hidden tab), jump to the present instead of playing the backlog
    while (tNext < now - 0.2) { tNext += stepLength(g, s.bpm, sig(), s.swing); g += 1; }
    while (tNext < now + AHEAD) {
      schedule(g, tNext, rig);
      recent.push([g, tNext]);
      if (recent.length > 96) recent.shift();
      tNext += stepLength(g, s.bpm, sig(), s.swing);
      g += 1;
    }
  }

  function schedule(step, t, rig) {
    const s = song();
    const sg = sig();
    const loc = locate(step, s.chain, s.patterns, sg);
    const p = s.patterns[loc.id];
    const entry = tl ? timelineAtStep(tl, step) : null;
    const ev = chordAt(p, loc.step);
    // Who decides the harmony: a chart if one is loaded; otherwise a recorded chord, which
    // remembers the scale it was played in and takes the pads and the bass there with it;
    // otherwise wherever the player has put the pads.
    const own = !entry && ev && !ev.rest && ev.h && !s.mute.chords ? ev.h : null;
    if (own) {
      if (!sameHarmony(own, ahead || state.h)) queue.push({ t: t - 0.045, type: 'harm', h: own });
      ahead = own;
    }
    const h = entry ? entry.h : (ahead || state.h);
    if (entry && entry !== lastEntry) { queue.push({ t: t - 0.045, type: 'entry', entry }); lastEntry = entry; }
    queue.push({ t, type: 'step', step, loc });

    if (!s.mute.drums) for (const lane of LANES) { const v = p.drums[lane][loc.step]; if (v) rig.drums.trigger(lane, t, v); }
    if (s.click && step % sg.spb === 0) rig.drums.tick(t, step % stepsPerBar(sg) === 0);

    const role = p.bass[loc.step];
    if (role && !s.mute.bass) playBass(role, step, t, h, loc, rig);

    if (ev && !ev.rest && !s.mute.chords) {
      const key = `${loc.id}:${loc.step}`;
      if (skip.get(key) === step) skip.delete(key);
      else playChord(ev, p, step, t, entry ? h : (ev.h || h));
    }
  }

  function playBass(role, step, t, h, loc, rig) {
    const s = song();
    const sg = sig();
    const per = stepsPerBar(sg);
    // look ahead to the next bass note: how long this one lasts, and what it leads to
    const span = chainSteps(s.chain, s.patterns, sg);
    let gap = span;
    for (let k = 1; k <= span; k++) {
      const at = locate(step + k, s.chain, s.patterns, sg);
      if (s.patterns[at.id].bass[at.step]) { gap = k; break; }
    }
    const nextEntry = tl ? timelineAtStep(tl, step + gap) : null;
    let next = nextEntry ? nextEntry.h : h;
    if (!tl && !s.mute.chords) {
      // with no chart, a recorded chord between here and there may move the harmony
      for (let k = 1; k <= gap; k++) {
        const at = locate(step + k, s.chain, s.patterns, sg);
        const ev = chordAt(s.patterns[at.id], at.step);
        if (ev && !ev.rest && ev.h) next = ev.h;
      }
    }
    const key = `${bassRootPc(h)}:${Math.floor(step / per)}`;
    const count = key === bassMemo.key ? bassMemo.count + 1 : 0;
    const last = Math.floor((step + gap) / per) !== Math.floor(step / per);
    const midi = bassNote(role, h, { next, prev: bassMemo.prev, count, last, bar: loc.bar });
    bassMemo = { key, count, prev: midi };
    if (midi == null) return;
    const dur = Math.min(2.4, gateTime(step, gap, s.bpm, sg, s.swing) * 0.92);
    rig.bass.noteOn(midi, { when: t, vel: step % per === 0 ? 0.9 : 0.78, dur });
  }

  // An "auto" chord: the floor in use, beneath the on note nearest the last one.
  function autoSteps(h, floor) {
    let top = nearestStep(h, autoTop, 'on');
    while (midiAt(h, top) > 71) top -= 2;
    while (midiAt(h, top) < 58) top += 2;
    autoTop = midiAt(h, top);
    return shapeSteps(shapeOn(floor == null ? state.floor : floor, state.variants), top);
  }

  function playChord(ev, p, step, t, h) {
    const s = song();
    const sg = sig();
    const steps = ev.n === 'auto' || !ev.steps ? autoSteps(h, ev.floor) : ev.steps;
    const gate = chordGate(p, ev, patternSteps(p, sg), stepsPerBar(sg) * 2);
    const dur = gateTime(step, gate, s.bpm, sg, s.swing) * 0.94;
    inst.sound(steps, h, { when: t, vel: 0.68, dur });
    queue.push({ t, type: 'comp', steps, h });
  }

  // Show things at the moment they sound, not at the moment they were scheduled. The
  // screen's own clock (animation frames) does this smoothly; the timer does it too, so
  // the pads still follow a chart when frames are slow.
  function flush() {
    const rig = inst.rig;
    if (!rig) return;
    const now = rig.desk.ctx.currentTime - Math.min(0.08, latency() * 0.5);
    while (queue.length && queue[0].t <= now) {
      const q = queue.shift();
      if (q.type === 'entry') { inst.setHarmony(q.entry.h, 'chart'); events.emit('entry', q.entry); }
      else if (q.type === 'harm') inst.setHarmony(q.h, 'loop');
      else if (q.type === 'step') events.emit('step', q);
      else events.emit('comp', q);
    }
  }
  function pump() {
    if (!playing) return;
    flush();
    frame = requestAnimationFrame(pump);
  }

  // ---------- recording ----------
  // The step nearest to this moment, among the ones scheduled lately and the one coming.
  function stepNow() {
    const rig = inst.rig;
    if (!rig) return 0;
    const t = rig.desk.ctx.currentTime - Math.min(0.12, latency());
    let best = g; let far = Math.abs(tNext - t);
    for (const [st, at] of recent) { const d = Math.abs(at - t); if (d < far) { far = d; best = st; } }
    return best;
  }

  function closeOpen(chord, at) {
    const o = open.get(chord);
    if (!o) return;
    open.delete(chord);
    const p = song().patterns[o.id];
    const ev = chordAt(p, o.s);
    if (ev && ev.stamp === o.stamp) ev.len = Math.max(1, at - o.g);
  }

  events.on('played', (chord) => {
    if (!playing || !recording) return;
    const at = stepNow();
    closeOpen(chord, at);
    const s = song();
    const loc = locate(at, s.chain, s.patterns, sig());
    const stamp = Date.now() + Math.random();
    const ev = { s: loc.step, len: null, n: chord.n, steps: [...chord.steps], floor: chord.floor, h: { root: chord.h.root, scale: chord.h.scale, ...(chord.h.bass != null ? { bass: chord.h.bass } : {}) }, stamp };
    s.patterns[loc.id] = putChord(s.patterns[loc.id], ev);
    if (at >= g) skip.set(`${loc.id}:${loc.step}`, at);
    open.set(chord, { id: loc.id, s: loc.step, g: at, stamp });
    persist();
    events.emit('song', s);
  });
  // when the player moves the pads somewhere themselves, the loop stops insisting
  events.on('harmony', ({ why }) => { if (why !== 'loop' && why !== 'chart') ahead = null; });
  events.on('lifted', (chord) => {
    if (!open.has(chord)) return;
    closeOpen(chord, stepNow());
    persist();
    events.emit('song', song());
  });

  rebuild();

  return {
    start, stop, toggle, setRecord, setRhythm, setTempo, setSwing, fillComp, setTune, setTranspose, setPick, gotoEntry, rebuild,
    nextEntry: (d) => gotoEntry(cursor + d),
    get playing() { return playing; },
    get recording() { return recording; },
    get timeline() { return tl; },
    get cursor() { return playing && lastEntry ? lastEntry.index : cursor; },
    get tune() { return tuneNow(); },
    sig,
  };
}
