// audio.js — the mixing desk: four parts (pads, strings, bass, drums), three shared
// effects (chorus, delay, reverb), and a master bus that keeps everything from clipping.
//
// Nothing sounds until the first touch: browsers require a gesture to start audio.
// The desk is built on whatever context it is given, so it can also be rendered offline
// to measure levels (see probe() in app.js).

export const PARTS = ['pads', 'strum', 'bass', 'drums'];

function noiseBuffer(ctx, seconds = 2) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

// A room made of fading noise: darker as it dies away, a little different in each ear.
function roomBuffer(ctx, seconds) {
  const sr = ctx.sampleRate;
  const n = Math.floor(sr * seconds);
  const buf = ctx.createBuffer(2, n, sr);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    let low = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const white = Math.random() * 2 - 1;
      const dark = 0.12 + 0.6 * (1 - t);               // the lowpass opens less and less
      low += dark * (white - low);
      const early = i < sr * 0.012 ? i / (sr * 0.012) : 1;
      data[i] = low * early * Math.pow(1 - t, 2.6);
    }
  }
  return buf;
}

export function createDesk(ctx) {
  const now = () => ctx.currentTime;

  // ---- master ----
  // Everything meets here and passes through a soft ceiling: untouched until it gets
  // loud, then rounded off instead of clipping. (A compressor would do this more politely,
  // but the browser's one looks ahead, and that delay would be felt under the fingers.)
  const sum = ctx.createGain(); sum.gain.value = 0.5;
  const ceiling = ctx.createWaveShaper();
  const curve = new Float32Array(2049);
  for (let i = 0; i < curve.length; i++) {
    const x = ((i / (curve.length - 1)) * 2 - 1) * 2;          // the curve covers twice full scale
    const a = Math.abs(x);
    curve[i] = Math.sign(x) * (a <= 0.7 ? a : 0.7 + 0.3 * Math.tanh((a - 0.7) / 0.3));
  }
  ceiling.curve = curve;
  const out = ctx.createGain(); out.gain.value = 0.9;
  sum.connect(ceiling); ceiling.connect(out); out.connect(ctx.destination);

  // ---- chorus: two short delays, each wobbling at its own speed, one in each ear ----
  const chorusIn = ctx.createGain();
  const chorusOut = ctx.createGain(); chorusOut.gain.value = 0.8;
  const lfos = [];
  [[0.017, 0.62, -0.7], [0.024, 0.81, 0.7]].forEach(([base, rate, pan]) => {
    const d = ctx.createDelay(0.1); d.delayTime.value = base;
    const lfo = ctx.createOscillator(); lfo.frequency.value = rate;
    const depth = ctx.createGain(); depth.gain.value = 0.0035;
    lfo.connect(depth); depth.connect(d.delayTime); lfo.start();
    lfos.push({ lfo, depth, rate });
    chorusIn.connect(d);
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; d.connect(p); p.connect(chorusOut); } else d.connect(chorusOut);
  });
  chorusOut.connect(sum);

  // ---- delay: echoes that grow darker ----
  const delayIn = ctx.createGain();
  const delay = ctx.createDelay(2); delay.delayTime.value = 0.36;
  const delayTone = ctx.createBiquadFilter(); delayTone.type = 'lowpass'; delayTone.frequency.value = 2600;
  const feedback = ctx.createGain(); feedback.gain.value = 0.34;
  const delayOut = ctx.createGain(); delayOut.gain.value = 0.7;
  delayIn.connect(delay); delay.connect(delayTone); delayTone.connect(feedback); feedback.connect(delay);
  delayTone.connect(delayOut); delayOut.connect(sum);

  // ---- reverb ----
  const reverbIn = ctx.createGain();
  const reverb = ctx.createConvolver();
  const reverbOut = ctx.createGain(); reverbOut.gain.value = 0.9;
  let roomSize = 0;
  const setRoom = (size) => {
    const s = Math.max(0, Math.min(1, size));
    if (Math.abs(s - roomSize) < 0.02 && reverb.buffer) return;
    roomSize = s;
    reverb.buffer = roomBuffer(ctx, 0.9 + s * 3.6);
  };
  setRoom(0.45);
  reverbIn.connect(reverb); reverb.connect(reverbOut); reverbOut.connect(sum);
  delayOut.connect(reverbIn);   // the echoes sit in the same room

  // ---- parts ----
  const parts = {};
  for (const name of PARTS) {
    const input = ctx.createGain();                       // voices connect here
    const trem = ctx.createGain();                        // tremolo, when a patch asks for it
    const level = ctx.createGain(); level.gain.value = 0.8;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5;
    const depth = ctx.createGain(); depth.gain.value = 0;
    lfo.connect(depth); depth.connect(trem.gain); lfo.start();
    input.connect(trem); trem.connect(level); level.connect(sum);
    const sends = {};
    for (const [fx, node] of [['chorus', chorusIn], ['delay', delayIn], ['reverb', reverbIn]]) {
      const g = ctx.createGain(); g.gain.value = 0;
      level.connect(g); g.connect(node);
      sends[fx] = g;
    }
    parts[name] = { input, level, sends, lfo, depth, trem };
  }

  const glide = (param, value, t = 0.03) => param.setTargetAtTime(value, now(), t);

  return {
    ctx, parts, noise: noiseBuffer(ctx),
    // level 0-1 and effect sends 0-1 for one part
    setPart(name, { level, chorus, delay: dly, reverb: rev, trem, tremRate } = {}) {
      const p = parts[name];
      if (!p) return;
      if (level != null) glide(p.level.gain, level * level * 1.4);
      if (chorus != null) glide(p.sends.chorus.gain, chorus * 0.9);
      if (dly != null) glide(p.sends.delay.gain, dly * 0.7);
      if (rev != null) glide(p.sends.reverb.gain, rev * 0.8);
      if (trem != null) { glide(p.depth.gain, trem * 0.45); glide(p.trem.gain, 1 - trem * 0.45); }
      if (tremRate != null) glide(p.lfo.frequency, tremRate);
    },
    // the shared effects: delay time in seconds, feedback 0-1, room size 0-1
    setFx({ delayTime, feedback: fb, room, chorusRate } = {}) {
      if (delayTime != null) glide(delay.delayTime, Math.max(0.03, Math.min(1.8, delayTime)), 0.08);
      if (fb != null) glide(feedback.gain, Math.max(0, Math.min(0.85, fb)));
      if (room != null) setRoom(room);
      if (chorusRate != null) lfos.forEach((l, i) => glide(l.lfo.frequency, chorusRate * (i ? 1.3 : 1)));
    },
    setMaster(v) { glide(out.gain, v * v * 1.1); },
  };
}

// ---- the live desk on the page ----
let desk = null;
let silent = null;

// A second of silence as a WAV, played on a loop through an <audio> element. On iPhones
// too old to have navigator.audioSession, this is what keeps Web Audio sounding when the
// ring switch is set to silent.
function silentLoop() {
  const sr = 8000; const n = sr;
  const bytes = new Uint8Array(44 + n);
  const view = new DataView(bytes.buffer);
  const put = (at, text) => { for (let i = 0; i < text.length; i++) bytes[at + i] = text.charCodeAt(i); };
  put(0, 'RIFF'); view.setUint32(4, 36 + n, true); put(8, 'WAVEfmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sr, true); view.setUint32(28, sr, true);
  view.setUint16(32, 1, true); view.setUint16(34, 8, true); put(36, 'data'); view.setUint32(40, n, true);
  bytes.fill(128, 44);
  const el = new Audio(URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' })));
  el.loop = true; el.preload = 'auto'; el.setAttribute('playsinline', '');
  return el;
}

// Start (or wake) the audio. Call from a touch or key handler. Returns the desk, or null
// when this browser has no Web Audio.
export function unlock() {
  if (!desk) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    let ctx;
    try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { ctx = new AC(); }
    // On iPhone this keeps sound on even when the ring switch is set to silent.
    let session = false;
    try { if (navigator.audioSession) { navigator.audioSession.type = 'playback'; session = true; } } catch (e) { /* older Safari */ }
    const apple = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!session && apple) { try { silent = silentLoop(); } catch (e) { silent = null; } }
    desk = createDesk(ctx);
    ctx.addEventListener('statechange', () => { for (const fn of listeners) fn(ctx.state); });
  }
  const { ctx } = desk;
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  if (silent && silent.paused) silent.play().catch(() => {});
  return desk;
}
const listeners = new Set();
export const onAudioState = (fn) => listeners.add(fn);
export const getDesk = () => desk;
export const audioTime = () => (desk ? desk.ctx.currentTime : 0);
// How late a note asked for "now" will actually sound, in seconds, as far as the browser says.
export function latency() {
  if (!desk) return 0;
  const { ctx } = desk;
  return (ctx.baseLatency || 0) + (ctx.outputLatency || 0);
}
