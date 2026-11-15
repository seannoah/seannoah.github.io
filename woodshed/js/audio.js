// audio.js — a plucked-string voice (Karplus-Strong) and a metronome, on Web Audio.
// Nothing sounds until the first touch: browsers require a gesture to start audio.

let ctx = null;
let out = null;
let enabled = true;
const buffers = new Map();
const live = new Set();

export function setEnabled(on) { enabled = on; if (!on) stopAll(); }

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    // On iPhone this keeps sound on even when the ring switch is set to silent.
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* older Safari */ }
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass'; tone.frequency.value = 3600; tone.Q.value = 0.4;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2;
    out = ctx.createGain(); out.gain.value = 0.9;
    out.connect(tone); tone.connect(comp); comp.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// One plucked note rendered into a buffer and cached.
function pluckBuffer(midi) {
  if (buffers.has(midi)) return buffers.get(midi);
  const sr = ctx.sampleRate;
  const seconds = 2.6;
  const n = Math.floor(sr * seconds);
  const buf = ctx.createBuffer(1, n, sr);
  const data = buf.getChannelData(0);
  const period = sr / freq(midi);
  const len = Math.max(2, Math.round(period));
  const line = new Float32Array(len);
  // Soft pick: noise through a one-pole lowpass, darker for higher notes so they don't sound thin.
  let prev = 0;
  const soft = midi > 64 ? 0.55 : 0.42;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    prev = prev + soft * (white - prev);
    line[i] = prev;
  }
  // Remove DC so the string doesn't thump.
  let mean = 0; for (let i = 0; i < len; i++) mean += line[i]; mean /= len;
  for (let i = 0; i < len; i++) line[i] -= mean;
  const decay = 0.9965 - Math.max(0, midi - 52) * 0.00012; // higher strings die sooner
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const next = (idx + 1) % len;
    const v = line[idx];
    data[i] = v;
    line[idx] = decay * 0.5 * (v + line[next]);
    idx = next;
  }
  // Short fade-in and fade-out to avoid clicks.
  for (let i = 0; i < 64; i++) data[i] *= i / 64;
  const tail = Math.floor(sr * 0.25);
  for (let i = 0; i < tail; i++) data[n - 1 - i] *= i / tail;
  // The delay line is a whole number of samples and the averaging filter shortens the
  // loop by half a sample, so the string as rendered is up to 15 cents off pitch.
  // `rate` is the playback speed that brings it in tune (this matters for ear training).
  const entry = { buf, rate: freq(midi) / (sr / (len - 0.5)) };
  buffers.set(midi, entry);
  return entry;
}

// Play one note. `when` is seconds from now. Guitar sounds an octave below written pitch;
// MIDI numbers here are sounding pitch (open low E = 40).
export function note(midi, when = 0, gain = 0.8, dur = 2.4) {
  if (!enabled || !unlock()) return;
  const t = ctx.currentTime + Math.max(0, when);
  const src = ctx.createBufferSource();
  const pluck = pluckBuffer(midi);
  src.buffer = pluck.buf;
  src.playbackRate.value = pluck.rate;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.setValueAtTime(gain, t + Math.max(0.05, dur - 0.15));
  g.gain.linearRampToValueAtTime(0, t + dur);
  src.connect(g); g.connect(out);
  src.start(t); src.stop(t + dur + 0.05);
  live.add(src);
  src.onended = () => live.delete(src);
}

// A chord, lightly strummed from low to high.
export function chord(midis, when = 0, strum = 0.028, gain = 0.6) {
  [...midis].sort((a, b) => a - b).forEach((m, i) => note(m, when + i * strum, gain));
}

// Notes one after another. Returns the total length in seconds.
export function line(midis, gap = 0.42, when = 0, gain = 0.8) {
  midis.forEach((m, i) => note(m, when + i * gap, gain, Math.max(1.2, gap * 2.2)));
  return when + midis.length * gap;
}

export function stopAll() {
  for (const s of live) { try { s.stop(); } catch (e) { /* already stopped */ } }
  live.clear();
}

// ---- Metronome ----
let metro = null;

function click(t, accent) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.value = accent ? 1320 : 990;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.3, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + 0.08);
}

export function metronomeRunning() { return !!metro; }

export function startMetronome(bpm, onBeat) {
  stopMetronome();
  if (!unlock()) return;
  const state = { bpm, next: ctx.currentTime + 0.08, beat: 0, timer: 0 };
  const tick = () => {
    while (state.next < ctx.currentTime + 0.12) {
      click(state.next, state.beat % 4 === 0);
      if (onBeat) {
        const b = state.beat;
        setTimeout(() => onBeat(b), Math.max(0, (state.next - ctx.currentTime) * 1000));
      }
      state.next += 60 / state.bpm;
      state.beat++;
    }
  };
  state.timer = setInterval(tick, 25);
  tick();
  metro = state;
}

export function setTempo(bpm) { if (metro) metro.bpm = bpm; }

export function stopMetronome() {
  if (metro) { clearInterval(metro.timer); metro = null; }
}
