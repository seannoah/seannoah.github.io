// drums.js — drum sounds made from scratch: sine waves that drop in pitch, bursts of
// filtered noise, and clusters of square waves for metal. A kit (see rhythms.js) gives
// each of the six lanes a recipe; this file cooks them.

import { KITS } from './rhythms.js';
import { VELOCITY } from './seq.js';

// Square waves at these ratios do not line up into a pitch, which is what metal sounds like.
const METAL = [1, 1.342, 1.2312, 1.6532, 1.9523, 2.1523];
const PURE = [1, 2.76, 5.4, 8.93];

export class Drums {
  constructor(desk) {
    this.desk = desk;
    this.ctx = desk.ctx;
    this.out = desk.parts.drums.input;
    this.kit = KITS.sticks;
  }

  setKit(id) { this.kit = KITS[id] || KITS.sticks; }

  // Play one lane's sound. `when` is a context time; `level` is 1 (soft), 2 or 3 (accent).
  trigger(lane, when = 0, level = 2) {
    const recipe = this.kit.lanes[lane];
    if (!recipe || !level) return;
    const t = Math.max(this.ctx.currentTime, when || 0);
    const vel = (VELOCITY[level] || 0.7) * recipe.gain;
    this[recipe.type](recipe, t, vel);
  }

  env(t, peak, attack, decay) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + Math.max(0.0005, attack));
    g.gain.setTargetAtTime(0, t + Math.max(0.0005, attack), Math.max(0.004, decay / 3.2));
    g.connect(this.out);
    return g;
  }

  noiseSrc(t, length) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.desk.noise;
    src.loop = true;
    src.start(t, Math.random() * 1.5);
    src.stop(t + length);
    return src;
  }

  kick(r, t, vel) {
    const o = this.ctx.createOscillator();
    o.frequency.setValueAtTime(r.f0, t);
    o.frequency.exponentialRampToValueAtTime(r.f1, t + r.drop);
    const g = this.env(t, vel, 0.002, r.decay);
    o.connect(g); o.start(t); o.stop(t + r.decay * 2 + 0.1);
    if (r.click) {
      const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2800;
      const cg = this.env(t, vel * r.click, 0.0005, 0.012);
      const n = this.noiseSrc(t, 0.06); n.connect(lp); lp.connect(cg);
    }
  }

  tom(r, t, vel) {
    this.kick(r, t, vel);
    if (r.slap) {
      const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.8;
      const sg = this.env(t, vel * r.slap, 0.001, 0.03);
      const n = this.noiseSrc(t, 0.12); n.connect(bp); bp.connect(sg);
    }
  }

  noise(r, t, vel) {
    const f = this.ctx.createBiquadFilter(); f.type = r.filter; f.frequency.value = r.f; f.Q.value = r.q;
    const g = this.env(t, vel, r.attack, r.decay);
    const n = this.noiseSrc(t, r.attack + r.decay * 2.2 + 0.05); n.connect(f); f.connect(g);
    if (r.body) {
      const o = this.ctx.createOscillator(); o.type = 'triangle';
      o.frequency.setValueAtTime(r.body * 1.25, t);
      o.frequency.exponentialRampToValueAtTime(r.body, t + 0.03);
      const bg = this.env(t, vel * 0.7, 0.001, r.bodyDecay || 0.06);
      o.connect(bg); o.start(t); o.stop(t + 0.4);
    }
  }

  // a brush drawn across the head: noise that swells, with its color sliding
  sweep(r, t, vel) {
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = r.q;
    f.frequency.setValueAtTime(r.f0, t);
    f.frequency.linearRampToValueAtTime(r.f1, t + r.attack + r.decay);
    const g = this.env(t, vel, r.attack, r.decay);
    const n = this.noiseSrc(t, r.attack + r.decay * 2.2 + 0.05); n.connect(f); f.connect(g);
  }

  metal(r, t, vel) {
    const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = r.hp; hp.Q.value = 0.6;
    const g = this.env(t, vel, 0.001, r.decay);
    if (r.ping) {
      // the stick: brighter and louder for an instant
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(vel * (1 + r.ping * 2), t);
      g.gain.setTargetAtTime(vel, t, 0.012);
      g.gain.setTargetAtTime(0, t + 0.04, Math.max(0.004, r.decay / 3.2));
    }
    const ratios = r.pure ? PURE : METAL;
    const mix = this.ctx.createGain(); mix.gain.value = r.pure ? 0.5 : 0.3;
    for (const [i, ratio] of ratios.entries()) {
      const o = this.ctx.createOscillator();
      o.type = r.pure ? 'sine' : 'square';
      o.frequency.value = r.base * ratio;
      if (r.pure) { const og = this.ctx.createGain(); og.gain.value = 1 / (1 + i * 1.4); o.connect(og); og.connect(mix); } else o.connect(mix);
      o.start(t); o.stop(t + r.decay * 2.4 + 0.1);
    }
    if (r.pure) mix.connect(g); else { mix.connect(hp); hp.connect(g); }
  }

  click(r, t, vel) {
    const o = this.ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = r.f;
    const g = this.env(t, vel, 0.0005, r.decay);
    o.connect(g); o.start(t); o.stop(t + r.decay * 3 + 0.05);
    if (r.noise) {
      const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = r.f * 2.2; bp.Q.value = 1.2;
      const ng = this.env(t, vel * r.noise, 0.0005, r.decay * 0.7);
      const n = this.noiseSrc(t, 0.1); n.connect(bp); bp.connect(ng);
    }
  }

  // the count-in and metronome click
  tick(when, accent = false) {
    this.click({ f: accent ? 1760 : 1320, decay: 0.03, noise: 0 }, Math.max(this.ctx.currentTime, when || 0), accent ? 0.5 : 0.3);
  }
}
