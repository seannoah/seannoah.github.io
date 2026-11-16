// synth.js — one synthesizer voice design, played by three parts (pads, strings, bass).
//
// A patch chooses a sound source ("wave") and shapes it with the same few controls
// whatever the source: a lowpass filter (cutoff, resonance, and how far the envelope opens
// it), an envelope (attack, decay, sustain, release), and a "color" control whose meaning
// depends on the source. Sources:
//   string    a plucked string (Karplus-Strong), rendered into a buffer per note
//   tine      an electric piano: a sine wave bent by another (FM), with a bell-like ping
//   organ     drawbars: a stack of sine waves an octave apart and between
//   sine, triangle, sawtooth, square    plain oscillators, optionally doubled and detuned

import { freqOf } from './theory.js';

export const WAVES = [
  { id: 'string', name: 'String', color: 'Pick' },
  { id: 'tine', name: 'Tine', color: 'Bark' },
  { id: 'organ', name: 'Organ', color: 'Drawbars' },
  { id: 'sine', name: 'Sine', color: 'Sub' },
  { id: 'triangle', name: 'Triangle', color: 'Sub' },
  { id: 'sawtooth', name: 'Saw', color: 'Sub' },
  { id: 'square', name: 'Square', color: 'Sub' },
];
export const waveById = (id) => WAVES.find((w) => w.id === id) || WAVES[0];

// The controls of a patch: range, and how the slider is spaced.
export const CONTROLS = [
  { id: 'cutoff', name: 'Brightness', group: 'Filter', min: 200, max: 12000, curve: 'log', unit: 'Hz', hint: 'How much of the top of the sound the filter lets through.' },
  { id: 'reso', name: 'Resonance', group: 'Filter', min: 0, max: 14, hint: 'A peak at the edge of the filter: nasal, then whistling.' },
  { id: 'envAmt', name: 'Filter sweep', group: 'Filter', min: 0, max: 4, hint: 'How far each note opens the filter before it settles.' },
  { id: 'color', name: 'Color', group: 'Tone', min: 0, max: 1, hint: 'Depends on the wave: pick hardness, bark, drawbars, or a note an octave below.' },
  { id: 'detune', name: 'Width', group: 'Tone', min: 0, max: 30, unit: 'cents', hint: 'A second copy of the sound, slightly out of tune with the first.' },
  { id: 'attack', name: 'Attack', group: 'Envelope', min: 0.001, max: 1.5, curve: 'log', unit: 's', hint: 'How long a note takes to arrive.' },
  { id: 'decay', name: 'Decay', group: 'Envelope', min: 0.05, max: 5, curve: 'log', unit: 's', hint: 'How long it takes to fall to its held level.' },
  { id: 'sustain', name: 'Sustain', group: 'Envelope', min: 0, max: 1, hint: 'The level a held note settles at.' },
  { id: 'release', name: 'Release', group: 'Envelope', min: 0.02, max: 4, curve: 'log', unit: 's', hint: 'How long it rings after you let go.' },
  { id: 'trem', name: 'Tremolo', group: 'Effects', min: 0, max: 1, hint: 'A slow wobble in loudness.' },
  { id: 'chorus', name: 'Chorus', group: 'Effects', min: 0, max: 1, hint: 'Shimmer: copies of the sound drifting in and out of tune.' },
  { id: 'delay', name: 'Delay', group: 'Effects', min: 0, max: 1, hint: 'Echoes.' },
  { id: 'reverb', name: 'Reverb', group: 'Effects', min: 0, max: 1, hint: 'The room the sound is in.' },
];
export const controlById = (id) => CONTROLS.find((c) => c.id === id);
// A slider position 0-1 to a control value and back.
export function fromSlider(c, x) {
  const t = Math.max(0, Math.min(1, x));
  return c.curve === 'log' ? c.min * Math.pow(c.max / c.min, t) : c.min + (c.max - c.min) * t;
}
export function toSlider(c, v) {
  const x = c.curve === 'log' ? Math.log(v / c.min) / Math.log(c.max / c.min) : (v - c.min) / (c.max - c.min);
  return Math.max(0, Math.min(1, x));
}

const BASE = { wave: 'string', octave: 0, cutoff: 5000, reso: 0.5, envAmt: 0, color: 0.5, detune: 0, attack: 0.002, decay: 1.5, sustain: 0.5, release: 0.6, trem: 0, tremRate: 5, chorus: 0, delay: 0, reverb: 0.2, gain: 1 };
const patch = (name, kind, values) => ({ name, kind, ...BASE, ...values });

// The voices. `kind` says which parts offer them: 'keys' for pads and strings, 'bass'.
export const PRESETS = {
  nylon: patch('Nylon', 'keys', { wave: 'string', cutoff: 3800, color: 0.35, decay: 2.2, sustain: 0.7, release: 0.5, reverb: 0.22 }),
  archtop: patch('Archtop', 'keys', { wave: 'string', cutoff: 1900, reso: 1.2, color: 0.2, decay: 1.6, sustain: 0.6, release: 0.3, reverb: 0.16 }),
  steel: patch('Steel', 'keys', { wave: 'string', cutoff: 7500, color: 0.75, decay: 3.2, sustain: 0.8, release: 0.9, chorus: 0.15, reverb: 0.26 }),
  tines: patch('Tine piano', 'keys', { wave: 'tine', cutoff: 4200, color: 0.45, decay: 2.4, sustain: 0.18, release: 0.35, trem: 0.25, tremRate: 4.6, chorus: 0.2, reverb: 0.22 }),
  reeds: patch('Reed piano', 'keys', { wave: 'square', cutoff: 1500, reso: 1.5, envAmt: 1.6, color: 0.15, attack: 0.004, decay: 0.9, sustain: 0.25, release: 0.25, trem: 0.3, tremRate: 5.6, reverb: 0.18, gain: 1.5 }),
  drawbars: patch('Drawbar organ', 'keys', { wave: 'organ', cutoff: 5200, color: 0.4, attack: 0.008, decay: 0.2, sustain: 1, release: 0.08, chorus: 0.45, reverb: 0.2 }),
  chapel: patch('Chapel organ', 'keys', { wave: 'organ', cutoff: 3000, color: 0.9, attack: 0.05, decay: 0.3, sustain: 1, release: 0.5, chorus: 0.2, reverb: 0.55 }),
  velvet: patch('Velvet pad', 'keys', { wave: 'sawtooth', cutoff: 1300, reso: 0.8, envAmt: 0.6, color: 0.2, detune: 12, attack: 0.5, decay: 1.5, sustain: 0.8, release: 1.6, chorus: 0.5, reverb: 0.5 }),
  glass: patch('Glass pad', 'keys', { wave: 'triangle', cutoff: 4200, color: 0, detune: 7, attack: 0.25, decay: 2, sustain: 0.7, release: 2.2, chorus: 0.6, delay: 0.2, reverb: 0.6, gain: 0.7 }),
  strings: patch('String machine', 'keys', { wave: 'sawtooth', cutoff: 2600, reso: 0.3, color: 0, detune: 16, attack: 0.18, decay: 0.8, sustain: 0.9, release: 0.9, chorus: 0.8, reverb: 0.4 }),
  bell: patch('Bell', 'keys', { wave: 'tine', cutoff: 9000, color: 1, octave: 1, decay: 3.2, sustain: 0, release: 2.2, delay: 0.25, reverb: 0.5 }),
  vibes: patch('Vibes', 'keys', { wave: 'sine', cutoff: 6000, color: 0, attack: 0.002, decay: 2.6, sustain: 0, release: 1.4, trem: 0.5, tremRate: 5.2, reverb: 0.4 }),
  harp: patch('Harp', 'keys', { wave: 'string', cutoff: 5200, color: 0.5, decay: 3.6, sustain: 0.9, release: 2.6, chorus: 0.1, reverb: 0.4 }),
  upright: patch('Upright', 'bass', { wave: 'string', cutoff: 900, reso: 0.8, envAmt: 0.8, color: 0.15, decay: 1.4, sustain: 0.6, release: 0.18, reverb: 0.08, gain: 2.8 }),
  round: patch('Round bass', 'bass', { wave: 'triangle', cutoff: 700, reso: 0.5, envAmt: 1.2, color: 0.4, attack: 0.006, decay: 0.7, sustain: 0.55, release: 0.14, reverb: 0.05, gain: 1.5 }),
  organBass: patch('Organ pedal', 'bass', { wave: 'organ', cutoff: 800, color: 0.1, attack: 0.012, decay: 0.3, sustain: 0.9, release: 0.1, reverb: 0.08, gain: 2.2 }),
  synthBass: patch('Synth bass', 'bass', { wave: 'sawtooth', cutoff: 420, reso: 4, envAmt: 2.2, color: 0.5, attack: 0.003, decay: 0.35, sustain: 0.4, release: 0.12, reverb: 0.04, gain: 2.4 }),
};
export const presetIds = (kind) => Object.keys(PRESETS).filter((id) => PRESETS[id].kind === kind);
// A part's patch: a preset with the player's changes laid over it.
export const resolvePatch = (presetId, changes = {}) => ({ ...(PRESETS[presetId] || PRESETS.nylon), ...changes });

// The shortest a note may sound, in seconds, however quickly it is let go.
const MIN_GATE = 0.045;

// ---- sources ----
const SOURCE_GAIN = { string: 0.75, tine: 0.5, organ: 0.34, sine: 0.5, triangle: 0.55, sawtooth: 0.22, square: 0.2 };

// One plucked note: a burst of noise going round a short delay that averages it away.
function pluck(ctx, midi, color, decay) {
  const sr = ctx.sampleRate;
  const f = freqOf(midi);
  const seconds = Math.max(0.9, Math.min(4.2, decay * 1.5 * Math.pow(2, (60 - midi) / 30)));
  const n = Math.floor(sr * seconds);
  const buf = ctx.createBuffer(1, n, sr);
  const data = buf.getChannelData(0);
  const len = Math.max(2, Math.round(sr / f));
  const line = new Float32Array(len);
  // the pick: noise through a one-pole lowpass. A harder pick lets more through.
  const soft = 0.18 + color * 0.72;
  let prev = 0; let mean = 0;
  for (let i = 0; i < len; i++) { prev += soft * (Math.random() * 2 - 1 - prev); line[i] = prev; mean += prev; }
  mean /= len;
  let peak = 0;
  for (let i = 0; i < len; i++) { line[i] -= mean; peak = Math.max(peak, Math.abs(line[i])); }
  for (let i = 0; i < len; i++) line[i] /= peak || 1;
  // how much each trip round the string keeps: longer decay, and lower notes, keep more
  const keep = Math.pow(0.001, 1 / (Math.max(0.3, decay) * 1.6 * f)) * (1 - Math.max(0, midi - 60) * 0.00008);
  const loss = Math.min(0.9995, Math.max(0.9, keep));
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const next = idx + 1 === len ? 0 : idx + 1;
    const v = line[idx];
    data[i] = v;
    line[idx] = loss * 0.5 * (v + line[next]);
    idx = next;
  }
  const fadeIn = Math.min(48, n); for (let i = 0; i < fadeIn; i++) data[i] *= i / fadeIn;
  const tail = Math.floor(sr * 0.2); for (let i = 0; i < tail; i++) data[n - 1 - i] *= i / tail;
  // The delay is a whole number of samples and the averaging adds half a sample, so the
  // string as rendered is a few cents off. `rate` is the playback speed that tunes it.
  return { buf, rate: f / (sr / (len - 0.5)) };
}

// Drawbars: sine waves at 1, 2, 3, 4, 6, 8... times a note an octave below the key.
function organWave(ctx, color) {
  const amounts = color < 0.34 ? [0, 0.9, 1, 0.5, 0.15]
    : color < 0.67 ? [0, 0.8, 1, 0.6, 0.5, 0, 0.3, 0, 0.2]
      : [0, 0.9, 1, 0.8, 0.8, 0, 0.6, 0, 0.7, 0, 0.3, 0, 0.3, 0, 0, 0, 0.35];
  const real = new Float32Array(amounts.length);
  const imag = new Float32Array(amounts);
  return ctx.createPeriodicWave(real, imag);
}

export class Synth {
  constructor(desk, partName, max = 26) {
    this.desk = desk;
    this.ctx = desk.ctx;
    this.part = desk.parts[partName];
    this.partName = partName;
    this.max = max;
    this.patch = { ...BASE };
    this.voices = new Map();
    this.next = 1;
    this.plucks = new Map();
    this.waves = new Map();
  }

  setPatch(p) {
    const old = this.patch;
    this.patch = { ...BASE, ...p };
    if (old.color !== this.patch.color || old.decay !== this.patch.decay || old.wave !== this.patch.wave) this.plucks.clear();
    this.desk.setPart(this.partName, { chorus: this.patch.chorus, delay: this.patch.delay, reverb: this.patch.reverb, trem: this.patch.trem, tremRate: this.patch.tremRate });
  }

  pluckFor(midi) {
    const key = midi;
    let hit = this.plucks.get(key);
    if (!hit) {
      if (this.plucks.size > 72) this.plucks.delete(this.plucks.keys().next().value);
      hit = pluck(this.ctx, midi, this.patch.color, this.patch.decay);
      this.plucks.set(key, hit);
    }
    return hit;
  }

  // Start a note. `when` is a context time (0 or omitted for now); `dur` in seconds ends it
  // by itself. Returns an id to pass to noteOff.
  noteOn(midi, { when = 0, vel = 0.8, dur = null } = {}) {
    const { ctx, patch: p } = this;
    const t = Math.max(ctx.currentTime, when || 0);
    const pitch = midi + 12 * (p.octave || 0);
    const f = freqOf(pitch);
    if (f < 16 || f > 12000) return 0;
    if (this.voices.size >= this.max) this.steal();

    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = p.reso;
    // brighter for higher notes, so the top of the instrument does not go dull
    const base = Math.min(16000, p.cutoff * Math.pow(f / 261.6, 0.35));
    const open = Math.min(18000, base * Math.pow(2, p.envAmt * (0.4 + 0.6 * vel)));
    filter.frequency.setValueAtTime(open, t);
    if (p.envAmt > 0) filter.frequency.setTargetAtTime(base, t, Math.max(0.02, p.decay / 4));
    const stops = [];
    const mix = ctx.createGain();
    mix.gain.value = SOURCE_GAIN[p.wave] || 0.4;
    mix.connect(filter); filter.connect(amp); amp.connect(this.part.input);

    const osc = (type, freq, cents = 0, gain = 1, target = mix) => {
      const o = ctx.createOscillator();
      if (typeof type === 'string') o.type = type; else o.setPeriodicWave(type);
      o.frequency.value = freq;
      if (cents) o.detune.value = cents;
      if (gain === 1) o.connect(target); else { const g = ctx.createGain(); g.gain.value = gain; o.connect(g); g.connect(target); }
      o.start(t); stops.push(o);
      return o;
    };

    let plucked = false;
    if (p.wave === 'string') {
      plucked = true;
      const copies = p.detune > 0.5 ? [-p.detune / 2, p.detune / 2] : [0];
      for (const cents of copies) {
        const hit = this.pluckFor(pitch);
        const src = ctx.createBufferSource();
        src.buffer = hit.buf;
        src.playbackRate.value = hit.rate * Math.pow(2, cents / 1200);
        if (copies.length > 1) { const g = ctx.createGain(); g.gain.value = 0.62; src.connect(g); g.connect(mix); } else src.connect(mix);
        src.start(t); stops.push(src);
      }
    } else if (p.wave === 'tine') {
      // the body: a sine wave whose pitch is shaken by another at the same pitch
      const carrier = osc('sine', f);
      const shaker = ctx.createOscillator(); shaker.frequency.value = f;
      const index = ctx.createGain();
      const depth = f * (0.25 + p.color * 2.4) * (0.5 + 0.5 * vel);
      index.gain.setValueAtTime(depth, t);
      index.gain.setTargetAtTime(depth * 0.12, t, Math.max(0.04, p.decay / 5));
      shaker.connect(index); index.connect(carrier.frequency); shaker.start(t); stops.push(shaker);
      // the tine: a short high ping
      const ping = ctx.createGain();
      ping.gain.setValueAtTime(0.1 + p.color * 0.3, t);
      ping.gain.setTargetAtTime(0, t, 0.05 + 0.05 * p.color);
      ping.connect(mix);
      osc('sine', f * (p.color > 0.8 ? 5.4 : 4), 0, 1, ping);
      if (p.detune > 0.5) osc('sine', f, p.detune, 0.5);
    } else if (p.wave === 'organ') {
      const bucket = p.color < 0.34 ? 0 : p.color < 0.67 ? 1 : 2;
      if (!this.waves.has(bucket)) this.waves.set(bucket, organWave(ctx, p.color));
      osc(this.waves.get(bucket), f / 2);
      if (p.detune > 0.5) osc(this.waves.get(bucket), f / 2, p.detune, 0.6);
    } else {
      const type = p.wave;
      if (p.detune > 0.5) { osc(type, f, -p.detune / 2, 0.7); osc(type, f, p.detune / 2, 0.7); } else osc(type, f);
      if (p.color > 0.02) osc('sine', f / 2, 0, p.color * (type === 'sine' || type === 'triangle' ? 0.7 : 1.6));
    }

    // the envelope. Every stage is an approach to a target, so a note let go early
    // carries on smoothly from wherever it had got to.
    const peak = vel * (p.gain || 1) * 0.5;
    const hold = plucked ? peak * (0.35 + 0.65 * p.sustain) : peak * p.sustain;
    amp.gain.setValueAtTime(0, t);
    amp.gain.setTargetAtTime(peak, t, Math.max(0.0008, p.attack / 3));
    amp.gain.setTargetAtTime(hold, t + p.attack, Math.max(0.01, p.decay / 3));

    const id = this.next++;
    const voice = { id, amp, stops, start: t, done: false };
    this.voices.set(id, voice);
    stops[0].onended = () => { this.voices.delete(id); try { amp.disconnect(); } catch (e) { /* gone */ } };
    // a plucked buffer ends by itself; make sure everything else in the voice ends with it
    if (plucked && dur == null) this.stopAll(voice, t + stops[0].buffer.duration + 0.1);
    if (dur != null) this.noteOff(id, t + dur);
    return id;
  }

  // Let a note go. `when` is a context time (omit for now).
  noteOff(id, when = 0, fast = false) {
    const v = this.voices.get(id);
    if (!v || v.done) return;
    this.fade(v, Math.max(this.ctx.currentTime, when || 0), fast ? 0.03 : this.patch.release);
  }

  // Fade a voice out from time t. A note that has not started yet (the later notes of a
  // strummed chord, when the finger lifts at once) must still begin from silence and
  // sound for a moment: clearing its envelope before it starts would leave it at full
  // volume, far louder than a played note. `never` drops such a note without a sound.
  fade(v, t, r, never = false) {
    v.done = true;
    const g = v.amp.gain;
    if (never && t <= v.start) {
      g.cancelScheduledValues(0);
      g.setValueAtTime(0, 0);
      this.stopAll(v, 0);
      this.voices.delete(v.id);
      try { v.amp.disconnect(); } catch (e) { /* gone */ }
      return;
    }
    const at = Math.max(t, v.start + MIN_GATE);
    g.cancelScheduledValues(at);
    g.setTargetAtTime(0, at, Math.max(0.006, r / 3.5));
    this.stopAll(v, at + r * 1.6 + 0.08);
  }

  stopAll(v, at) {
    for (const s of v.stops) { try { s.stop(at); } catch (e) { /* already stopped */ } }
  }

  // Too many notes at once: the oldest goes quickly and quietly.
  steal() {
    const oldest = this.voices.values().next().value;
    if (!oldest) return;
    this.voices.delete(oldest.id);
    this.fade(oldest, this.ctx.currentTime, 0.03, true);
  }

  allOff() {
    for (const v of [...this.voices.values()]) this.fade(v, this.ctx.currentTime, 0.03, true);
  }
}
