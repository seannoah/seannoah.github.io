// drills.js — one small exercise per practice item. Each has an "away" form that is
// answered on screen and checked by the app, and most have a "guitar in hand" form
// that asks you to play, then reveals the answer for you to rate yourself.

import { h, cap, icon } from './dom.js';
import { neck, windowFor } from './neck.js';
import * as audio from './audio.js';
import { SCALES, OPEN, keyOf, scaleNotes, chordName, scaleTitle, stepSize, walkPath, walkStart, stringPath, mod } from './theory.js';
import { SHAPES, FLOORS, ELEVATOR, voicingFor, voicings, anchorNote, setLabel, floorOf } from './floors.js';
import { movePair, moveWords, floorAfter, shapeName } from './motion.js';
import { parse, unitById, isActive } from './curriculum.js';
import { isNew } from './store.js';
import { pill } from './widgets.js';

const kc = (deg) => (deg % 2 === 0 ? 'on' : 'off');
const say = (scale, deg) => SCALES[scale].say[deg];
const lab = (scale, deg) => SCALES[scale].labels[deg];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const mark = (n, scale, kind) => ({ string: n.string, fret: n.fret, kind: kind || kc(n.deg), label: lab(scale, n.deg) });
const frets = (n) => `${n} fret${n === 1 ? '' : 's'}`;

function frame({ kicker, prompt, hint, body, fb }) {
  return h('div', { class: 'drill' },
    h('div', { class: 'kicker' }, kicker),
    h('h2', { class: 'prompt' }, prompt),
    hint ? h('p', { class: 'hint' }, hint) : null,
    h('div', { class: 'drill-body' }, body),
    fb || null);
}

function feedback() {
  const el = h('div', { class: 'fb', role: 'status' });
  return { el, show(ok, text) { el.className = 'fb show ' + (ok === true ? 'ok' : ok === false ? 'no' : 'info'); el.textContent = text; } };
}

// A set of answer buttons. resolve() colors the right one and locks the set.
function choices(options, onPick, cls = '') {
  const wrap = h('div', { class: 'choices ' + cls });
  let locked = false;
  const buttons = options.map((o) => {
    const b = h('button', { class: 'choice ' + (o.cls || ''), onclick: () => { if (!locked) onPick(o.value); } },
      h('span', { class: 'choice-main' }, o.label), o.sub ? h('span', { class: 'choice-sub' }, o.sub) : null);
    b.dataset.value = String(o.value);
    wrap.append(b);
    return b;
  });
  return {
    el: wrap,
    resolve(correct, picked) {
      locked = true;
      for (const b of buttons) {
        if (b.dataset.value === String(correct)) b.classList.add('correct');
        else if (b.dataset.value === String(picked)) b.classList.add('wrong');
        else b.classList.add('faded');
      }
    },
  };
}

function rateBar(ctx, labels = ['Missed', 'Shaky', 'Got it']) {
  return h('div', { class: 'rate' },
    h('button', { class: 'rate-btn no', onclick: () => ctx.finish('wrong', 'now') }, labels[0]),
    h('button', { class: 'rate-btn mid', onclick: () => ctx.finish('shaky', 'now') }, labels[1]),
    h('button', { class: 'rate-btn ok', onclick: () => ctx.finish('right', 'now') }, labels[2]));
}

// Guitar-in-hand pattern: play it, then reveal and rate.
function revealThenRate(ctx, onReveal, fb) {
  ctx.foot(h('button', { class: 'primary wide', onclick: () => {
    const text = onReveal();
    if (text) fb.show(null, text);
    ctx.foot(rateBar(ctx));
  } }, 'Reveal'));
}

// ---- sound helpers ----
function chordMidis(keyId, scale, on) {
  const all = voicings(keyId, scale, 'drop2', [5, 4, 3, 2]).filter((v) => v.on === on);
  const v = all.find((x) => x.minFret >= 2 && x.maxFret <= 10) || all[0];
  return v.notes.map((n) => n.midi);
}
// Set the key by ear: a slow strum of the on chord. Returns how long to wait before the next sound.
function cue(keyId, scale) {
  audio.stopAll();
  audio.chord(chordMidis(keyId, scale, true), 0, 0.11, 0.5);
  return 1.45;
}
function earMidi(keyId, scale, deg) {
  const pc = keyOf(keyId).pc;
  return 60 + pc - (pc > 5 ? 12 : 0) + SCALES[scale].semis[deg];
}

// A string on which the root sits low enough for a whole octave to fit.
function oneString(keyId) {
  const pc = keyOf(keyId).pc;
  const fits = [6, 5, 4, 3, 2, 1].map((s) => ({ string: s, root: mod(pc - OPEN[s], 12) })).filter((o) => o.root >= 1 && o.root <= 5);
  return rand(fits.length ? fits : [{ string: 2, root: mod(pc - OPEN[2], 12) || 12 }]);
}

// A degree on one string, shown against the nearer root (below it, or above it).
function spotByRoot(keyId, scale, deg) {
  const { string, root } = oneString(keyId);
  const semis = SCALES[scale].semis[deg];
  const upper = semis > 5;
  const rootFret = upper ? root + 12 : root;
  const fret = root + semis;
  return {
    string, fret, rootFret, semis, upper,
    midi: OPEN[string] + fret, rootMidi: OPEN[string] + rootFret,
    where: upper ? `${frets(12 - semis)} below the root` : `${frets(semis)} above the root`,
    win: windowFor([rootFret, fret], 6),
  };
}

// ---- on or off ----
function onOff(it, ctx) {
  const n = scaleNotes(ctx.key, it.scale)[it.deg];
  const onName = chordName(ctx.key, it.scale, true);
  const offName = chordName(ctx.key, it.scale, false);
  const fb = feedback();
  const ch = choices([{ value: 'on', label: 'On', cls: 'on' }, { value: 'off', label: 'Off', cls: 'off' }], (val) => {
    const ok = (val === 'on') === n.on;
    ch.resolve(n.on ? 'on' : 'off', val);
    fb.show(ok, n.on ? `On. The ${n.say} is a note of ${onName}.` : `Off. The ${n.say} belongs to ${offName}, the chord that pulls back to ${onName}.`);
    audio.stopAll();
    audio.line(chordMidis(ctx.key, it.scale, n.on), 0.13);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'two');
  return frame({ kicker: `On or off · ${scaleTitle(ctx.key, it.scale)}`, prompt: `The ${n.say}: on or off?`, body: ch.el, fb: fb.el });
}

// ---- half step or whole step ----
function stepSpot(it, keyId) {
  const string = rand([2, 3, 4, 5]);
  const size = stepSize(it.scale, it.deg, it.dir);
  const from = stringPath(keyId, it.scale, string, 3, 14).find((p) => p.deg === it.deg);
  const to = { string, fret: from.fret + it.dir * size, deg: mod(it.deg + it.dir, 8), midi: from.midi + it.dir * size };
  const lo = Math.max(1, Math.min(from.fret, to.fret) - 2);
  return { string, size, from, to, lo, hi: lo + 6, dirWord: it.dir > 0 ? 'up' : 'down' };
}
const stepText = (it, s) => `${cap(say(it.scale, s.from.deg))} ${s.dirWord} to ${say(it.scale, s.to.deg)}: a ${s.size === 1 ? 'half step, one fret' : 'whole step, two frets'}.`;

function step(it, ctx) {
  const s = stepSpot(it, ctx.key);
  const board = neck({ lo: s.lo, hi: s.hi, focus: [s.string], marks: [mark(s.from, it.scale)] });
  const fb = feedback();
  const ch = choices([{ value: 1, label: 'Half step', sub: 'one fret' }, { value: 2, label: 'Whole step', sub: 'two frets' }], (val) => {
    const ok = val === s.size;
    ch.resolve(s.size, val);
    board.draw([mark(s.from, it.scale), mark(s.to, it.scale)]);
    audio.stopAll();
    audio.line([s.from.midi, s.to.midi], 0.45);
    fb.show(ok, stepText(it, s));
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'two');
  return frame({
    kicker: `The path · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: `From the ${say(it.scale, s.from.deg)} ${s.dirWord} to the ${say(it.scale, s.to.deg)}: half step or whole step?`,
    body: [board.el, ch.el], fb: fb.el,
  });
}

function stepGuitar(it, ctx) {
  const s = stepSpot(it, ctx.key);
  const board = neck({ lo: s.lo, hi: s.hi, focus: [s.string], marks: [] });
  const fb = feedback();
  revealThenRate(ctx, () => {
    board.draw([mark(s.from, it.scale), mark(s.to, it.scale)]);
    audio.stopAll();
    audio.line([s.from.midi, s.to.midi], 0.5);
    return stepText(it, s);
  }, fb);
  return frame({
    kicker: `The path · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: `On string ${s.string}, play the ${say(it.scale, s.from.deg)}, then step ${s.dirWord} to the ${say(it.scale, s.to.deg)}.`,
    hint: 'Say both names aloud. See the distance before you move.',
    body: board.el, fb: fb.el,
  });
}

// ---- name a degree / find a degree ----
function nameIt(it, ctx) {
  const p = spotByRoot(ctx.key, it.scale, it.deg);
  const base = [{ string: p.string, fret: p.rootFret, kind: 'on', label: 'R' }];
  const board = neck({ lo: p.win.lo, hi: p.win.hi, focus: [p.string], marks: [...base, { string: p.string, fret: p.fret, kind: 'q', label: '?' }] });
  const fb = feedback();
  const options = [1, 2, 3, 4, 5, 6, 7].map((d) => ({ value: d, label: lab(it.scale, d), sub: say(it.scale, d) }));
  const ch = choices(options, (val) => {
    const ok = val === it.deg;
    ch.resolve(it.deg, val);
    board.draw([...base, { string: p.string, fret: p.fret, kind: kc(it.deg), label: lab(it.scale, it.deg) }]);
    audio.stopAll();
    audio.line([p.rootMidi, p.midi], 0.5);
    fb.show(ok, `The ${say(it.scale, it.deg)}: ${p.where}.`);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'grid');
  return frame({ kicker: `Name it · ${scaleTitle(ctx.key, it.scale)}`, prompt: 'Which degree is the marked note?', body: [board.el, ch.el], fb: fb.el });
}

function findGuitar(it, ctx) {
  const p = spotByRoot(ctx.key, it.scale, it.deg);
  const board = neck({ lo: p.win.lo, hi: p.win.hi, focus: [p.string], marks: [] });
  const fb = feedback();
  revealThenRate(ctx, () => {
    board.draw([{ string: p.string, fret: p.rootFret, kind: 'on', label: 'R' }, { string: p.string, fret: p.fret, kind: kc(it.deg), label: lab(it.scale, it.deg) }]);
    audio.stopAll();
    audio.line([p.rootMidi, p.midi], 0.5);
    return `The ${say(it.scale, it.deg)} is ${p.where}.`;
  }, fb);
  return frame({
    kicker: `Find it · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: `Play the ${say(it.scale, it.deg)} on string ${p.string}.`,
    hint: `Find the root first, then measure from it. Say "${say(it.scale, it.deg)}, ${kc(it.deg)}".`,
    body: board.el, fb: fb.el,
  });
}

// ---- walk the path ----
const pathLetters = (scale) => [0, 1, 2, 3, 4, 5, 6, 7].map((d) => (stepSize(scale, d, 1) === 1 ? 'H' : 'W')).join(' ');

function walk(it, ctx) {
  const path = walkPath(ctx.key, it.scale, it.string, walkStart(ctx.key, it.scale, it.string));
  const lo = path[0].fret === 0 ? 0 : Math.max(1, path[0].fret - 1);
  let i = 0;
  let errors = 0;
  let misses = 0;
  let flash = null;
  const fb = feedback();
  const marks = () => [...path.slice(0, i + 1).map((n) => mark(n, it.scale)), ...(flash ? [flash] : [])];
  const board = neck({
    lo, hi: path[8].fret + 1, focus: [it.string], marks: marks(),
    onTap: (string, fret) => {
      if (i >= 8) return;
      const next = path[i + 1];
      if (fret === next.fret) {
        const size = next.fret - path[i].fret;
        i++; misses = 0; flash = null;
        audio.note(next.midi);
        board.draw(marks());
        board.reveal(next.fret);
        fb.show(true, `${cap(say(it.scale, next.deg))}, ${kc(next.deg)}. A ${size === 1 ? 'half' : 'whole'} step.`);
        if (i === 8) {
          const ok = errors <= 1;
          fb.show(ok, `${cap(say(it.scale, path[0].deg))} to ${say(it.scale, path[8].deg)}: ${pathLetters(it.scale).split(' ').map((_, k) => (path[k + 1].fret - path[k].fret === 1 ? 'H' : 'W')).join(' ')}.`);
          ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
        }
        return;
      }
      if (fret <= path[i].fret) return; // tapping at or behind where you are is not a guess
      errors++; misses++;
      flash = { string: it.string, fret, kind: 'wrong', label: '' };
      if (misses >= 2) { flash = { string: it.string, fret: next.fret, kind: 'ghost', label: lab(it.scale, next.deg) }; }
      board.draw(marks());
      fb.show(false, misses >= 2 ? `The ${say(it.scale, next.deg)} is here. Tap it to carry on.` : 'Not that one. Half step or whole step?');
    },
  });
  requestAnimationFrame(() => board.reveal(path[0].fret + 2));
  return frame({
    kicker: `Walk the path · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: `Walk up string ${it.string}, one note at a time.`,
    hint: `Start from the ${say(it.scale, path[0].deg)}. Tap each next note and say its name aloud.`,
    body: board.el, fb: fb.el,
  });
}

function walkGuitar(it, ctx) {
  const path = walkPath(ctx.key, it.scale, it.string, walkStart(ctx.key, it.scale, it.string));
  const lo = path[0].fret === 0 ? 0 : Math.max(1, path[0].fret - 1);
  const first = [mark(path[0], it.scale)];
  const board = neck({ lo, hi: path[8].fret + 1, focus: [it.string], marks: first });
  let shown = false;
  const toggle = pill('Show the path', () => {
    shown = !shown;
    board.draw(shown ? path.map((n) => mark(n, it.scale)) : first);
    toggle.lastChild.textContent = shown ? 'Hide the path' : 'Show the path';
  });
  const play = pill('Hear it', () => { audio.stopAll(); audio.line([...path, ...path.slice(0, 8).reverse()].map((n) => n.midi), 60 / ctx.bpm()); }, 'play');
  ctx.foot(rateBar(ctx));
  return frame({
    kicker: `Walk the path · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: `Walk string ${it.string} up and back, ${say(it.scale, path[0].deg)} to ${say(it.scale, path[8].deg)}.`,
    hint: 'Say each degree as you play it. Do not move until you can see the next note.',
    body: [board.el, h('div', { class: 'pills' }, toggle, play)],
  });
}

// ---- summon a shape ----
const whereWord = (anchor) => (anchor === 'top' ? 'beneath' : 'above');

function shapeInfo(it, ctx) {
  const v = voicingFor(ctx.key, it.scale, it.shape, it.set, it.anchor, it.deg);
  const a = anchorNote(v, it.anchor);
  const all = v.notes.map((n) => n.fret);
  const fretted = all.filter((f) => f > 0);
  const low = fretted.length ? Math.min(...fretted) : 1;
  const high = fretted.length ? Math.max(...fretted) : 1;
  // a wider window than the shape needs, so the edges give nothing away
  const lo = all.includes(0) || low <= 2 ? 0 : low - 2;
  const hi = Math.max(high + 2, (lo || 1) + 6);
  const spoken = v.notes.map((n) => say(it.scale, n.deg)).join(', ');
  return { v, a, lo, hi, spoken, shape: SHAPES[it.shape] };
}

function study(it, ctx) {
  const { v, lo, hi, spoken, shape } = shapeInfo(it, ctx);
  const play = () => { audio.stopAll(); audio.chord(v.notes.map((n) => n.midi), 0, 0.06); };
  const board = neck({
    lo, hi, focus: it.set, marks: v.notes.map((n) => mark(n, it.scale)),
    onTap: (s, f) => { const n = v.notes.find((x) => x.string === s && x.fret === f); if (n) audio.note(n.midi); },
  });
  setTimeout(play, 300);
  ctx.foot(h('button', { class: 'primary wide', onclick: () => ctx.finish('study', 'now') }, 'Got it'));
  return frame({
    kicker: `New shape · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: `${cap(shape.a)} ${whereWord(it.anchor)} the ${say(it.scale, it.deg)}`,
    hint: `${chordName(ctx.key, it.scale, v.on)}, the ${v.on ? 'on' : 'off'} chord, on ${setLabel(it.set)}. Low to high: ${spoken}. You will be asked for it shortly.`,
    body: [board.el, h('div', { class: 'pills' }, pill('Play', play, 'play'))],
  });
}

function shapeTap(it, ctx) {
  const { v, a, lo, hi, spoken, shape } = shapeInfo(it, ctx);
  const others = v.notes.filter((n) => n !== a);
  const picks = {};
  const fb = feedback();
  const anchorMark = { ...mark(a, it.scale), kind: `${kc(a.deg)} anchor` };
  const draw = () => board.draw([anchorMark, ...Object.entries(picks).map(([s, f]) => ({ string: +s, fret: f, kind: 'pick', label: '' }))]);
  const board = neck({
    lo, hi, focus: it.set, marks: [anchorMark],
    onTap: (string, fret) => {
      if (done) return;
      if (string === a.string) return;
      if (!it.set.includes(string)) { fb.show(null, `This shape lives on ${setLabel(it.set)}.`); return; }
      if (picks[string] === fret) delete picks[string]; else picks[string] = fret;
      audio.note(OPEN[string] + fret, 0, 0.5, 1.2);
      draw();
    },
  });
  let done = false;
  const check = () => {
    const missing = others.filter((n) => picks[n.string] == null);
    if (missing.length) { fb.show(null, `Place a note on string${missing.length > 1 ? 's' : ''} ${missing.map((n) => n.string).join(' and ')} first.`); return; }
    done = true;
    const marks = [anchorMark];
    let ok = true;
    for (const n of others) {
      if (picks[n.string] === n.fret) marks.push(mark(n, it.scale));
      else { ok = false; marks.push({ string: n.string, fret: picks[n.string], kind: 'wrong', label: '' }); marks.push({ ...mark(n, it.scale), kind: 'ghost' }); }
    }
    board.draw(marks);
    audio.stopAll();
    audio.chord(v.notes.map((n) => n.midi), 0, 0.05);
    fb.show(ok, `${chordName(ctx.key, it.scale, v.on)}, ${v.on ? 'on' : 'off'}. Low to high: ${spoken}.`);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  };
  ctx.foot(h('button', { class: 'primary wide', onclick: check }, 'Check'));
  return frame({
    kicker: `Summon · ${scaleTitle(ctx.key, it.scale)} · ${setLabel(it.set)}`,
    prompt: `Summon ${shape.a} ${whereWord(it.anchor)} the ${say(it.scale, it.deg)}.`,
    hint: `Tap the other ${others.length === 1 ? 'note' : `${others.length} notes`}. First decide: is the ${say(it.scale, it.deg)} on or off?`,
    body: board.el, fb: fb.el,
  });
}

function shapeGuitar(it, ctx) {
  const { v, a, lo, hi, spoken, shape } = shapeInfo(it, ctx);
  const anchorMark = { ...mark(a, it.scale), kind: `${kc(a.deg)} anchor` };
  const board = neck({ lo, hi, focus: it.set, marks: [anchorMark] });
  const fb = feedback();
  revealThenRate(ctx, () => {
    board.draw(v.notes.map((n) => (n === a ? anchorMark : mark(n, it.scale))));
    audio.stopAll();
    audio.chord(v.notes.map((n) => n.midi), 0, 0.05);
    return `${chordName(ctx.key, it.scale, v.on)}, ${v.on ? 'on' : 'off'}. Low to high: ${spoken}.`;
  }, fb);
  return frame({
    kicker: `Summon · ${scaleTitle(ctx.key, it.scale)} · ${setLabel(it.set)}`,
    prompt: `Hold the ${say(it.scale, it.deg)} on string ${a.string}. Summon ${shape.a} ${whereWord(it.anchor)} it.`,
    hint: `Play the single note first and say "${say(it.scale, it.deg)}". Then add the rest.`,
    body: board.el, fb: fb.el,
  });
}

// ---- ear ----
const again = (play) => h('div', { class: 'pills center' }, pill('Hear it again', play, 'ear'));

function earOnOff(it, ctx) {
  const n = scaleNotes(ctx.key, it.scale)[it.deg];
  const midi = earMidi(ctx.key, it.scale, it.deg);
  const play = () => { const t = cue(ctx.key, it.scale); audio.note(midi, t, 0.9); };
  play();
  const fb = feedback();
  const ch = choices([{ value: 'on', label: 'On', sub: 'at rest', cls: 'on' }, { value: 'off', label: 'Off', sub: 'wants to move', cls: 'off' }], (val) => {
    const ok = (val === 'on') === n.on;
    ch.resolve(n.on ? 'on' : 'off', val);
    fb.show(ok, `${n.on ? 'On' : 'Off'}: that was the ${n.say}.`);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'two');
  return frame({
    kicker: `Ear · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: 'On or off?',
    hint: `You hear ${chordName(ctx.key, it.scale, true)}, then one note. Does the note rest inside the chord, or lean against it?`,
    body: [again(play), ch.el], fb: fb.el,
  });
}

function earDegree(it, ctx) {
  const order = [0, 4, 2, 6, 7, 1, 3, 5];
  let degs = order.filter((d) => d === it.deg || !isNew(`ed|${it.scale}|${d}`));
  for (const d of order) { if (degs.length >= 3) break; if (!degs.includes(d)) degs.push(d); }
  degs = degs.sort((a, b) => a - b);
  const midi = earMidi(ctx.key, it.scale, it.deg);
  const play = () => { const t = cue(ctx.key, it.scale); audio.note(midi, t, 0.9); };
  play();
  const fb = feedback();
  const ch = choices(degs.map((d) => ({ value: d, label: lab(it.scale, d), sub: say(it.scale, d) })), (val) => {
    const ok = val === it.deg;
    ch.resolve(it.deg, val);
    if (!ok) { audio.stopAll(); const t = cue(ctx.key, it.scale); audio.note(midi, t, 0.9); }
    fb.show(ok, `The ${say(it.scale, it.deg)}, ${kc(it.deg)}.`);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'grid');
  return frame({
    kicker: `Ear · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: 'Which degree is the note?',
    hint: `You hear ${chordName(ctx.key, it.scale, true)}, then one note.`,
    body: [again(play), ch.el], fb: fb.el,
  });
}

// The note to find, placed on one string with a labelled landmark nearby.
function earSpot(it, ctx) {
  if (it.deg !== 0) {
    const p = spotByRoot(ctx.key, it.scale, it.deg);
    return { ...p, landmark: { string: p.string, fret: p.rootFret, kind: 'on', label: 'R' } };
  }
  const { string, root } = oneString(ctx.key);
  const fifthFret = root + SCALES[it.scale].semis[4];
  const fret = root + 12;
  return {
    string, fret, midi: OPEN[string] + fret, where: 'an octave above the low root',
    win: windowFor([fifthFret, fret], 6),
    landmark: { string, fret: fifthFret, kind: 'on', label: lab(it.scale, 4) },
  };
}

function earFind(it, ctx) {
  const p = earSpot(it, ctx);
  const play = () => { const t = cue(ctx.key, it.scale); audio.note(p.midi, t, 0.9); };
  play();
  const fb = feedback();
  let done = false;
  const board = neck({
    lo: p.win.lo, hi: p.win.hi, focus: [p.string], marks: [p.landmark],
    onTap: (string, fret) => {
      if (done || fret === p.landmark.fret) return;
      done = true;
      const ok = fret === p.fret;
      const answer = { string: p.string, fret: p.fret, kind: kc(it.deg), label: lab(it.scale, it.deg) };
      board.draw(ok ? [p.landmark, answer] : [p.landmark, { string: p.string, fret, kind: 'wrong', label: '' }, answer]);
      audio.stopAll();
      audio.note(p.midi);
      fb.show(ok, `The ${say(it.scale, it.deg)}, ${kc(it.deg)}.`);
      ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
    },
  });
  return frame({
    kicker: `Ear to hand · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: `Find the note you hear on string ${p.string}.`,
    hint: 'Name its degree in your head first, then tap where it lives.',
    body: [again(play), board.el], fb: fb.el,
  });
}

function earFindGuitar(it, ctx) {
  const p = earSpot(it, ctx);
  const play = () => { const t = cue(ctx.key, it.scale); audio.note(p.midi, t, 0.9); };
  play();
  const board = neck({ lo: p.win.lo, hi: p.win.hi, focus: [p.string], marks: [] });
  const fb = feedback();
  revealThenRate(ctx, () => {
    board.draw([p.landmark, { string: p.string, fret: p.fret, kind: kc(it.deg), label: lab(it.scale, it.deg) }]);
    audio.stopAll();
    audio.note(p.midi);
    return `The ${say(it.scale, it.deg)}, ${kc(it.deg)}. Here it is on string ${p.string}.`;
  }, fb);
  return frame({
    kicker: `Ear to hand · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: 'Play back the note you hear.',
    hint: 'Name its degree before you reach for it.',
    body: [again(play), board.el], fb: fb.el,
  });
}

function earImagine(it, ctx) {
  const n = scaleNotes(ctx.key, it.scale)[it.deg];
  const midi = earMidi(ctx.key, it.scale, it.deg);
  const onName = chordName(ctx.key, it.scale, true);
  cue(ctx.key, it.scale);
  const fb = feedback();
  ctx.foot(h('button', { class: 'primary wide', onclick: () => {
    audio.stopAll();
    audio.note(midi, 0, 0.9);
    fb.show(null, `That is the ${n.say}, ${kc(it.deg)}.`);
    ctx.foot(rateBar(ctx, ['Missed', 'Close', 'Had it']));
  } }, 'Check'));
  return frame({
    kicker: `Hear ahead · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: `Hear the ${n.say} over ${onName}.`,
    hint: 'Sing it or imagine it before you check. This is the skill of hearing a note before you play it.',
    body: h('div', { class: 'pills center' }, pill(`Play ${onName}`, () => cue(ctx.key, it.scale), 'play')),
    fb: fb.el,
  });
}

const FLOOR_UNIT = { thirds: 'thirds', triads: 'triads', shells: 'shells', octaves: 'octaves', drop2: 'drop2', drop3: 'wide', drop24: 'wide', dbl: 'wide' };
const knownFloors = (must) => FLOORS.filter((f) => f.id === 'unison' || f.id === must || isActive(unitById(FLOOR_UNIT[f.id])));

function earFloor(it, ctx) {
  const options = knownFloors(it.floor);
  const target = Math.random() < 0.6 ? it.floor : rand(options).id;
  const shapeId = rand(FLOORS.find((f) => f.id === target).shapes);
  const set = SHAPES[shapeId].primary;
  const all = voicings(ctx.key, it.scale, shapeId, set);
  const v = rand(all.filter((x) => x.minFret >= 1 && x.maxFret <= 12)) || all[0];
  const midis = v.notes.map((n) => n.midi);
  const play = () => { audio.stopAll(); audio.chord(midis, 0, 0.02, 0.6); if (midis.length > 1) audio.line(midis, 0.28, 1.5, 0.6); };
  play();
  const fb = feedback();
  const slot = h('div');
  const ch = choices(options.map((f) => ({ value: f.id, label: f.name })), (val) => {
    const ok = val === target;
    ch.resolve(target, val);
    const win = windowFor(v.notes.map((n) => n.fret), 6);
    slot.replaceChildren(neck({ lo: win.lo, hi: win.hi, focus: set, marks: v.notes.map((n) => mark(n, it.scale)) }).el);
    fb.show(ok, `${FLOORS.find((f) => f.id === target).name}: ${SHAPES[shapeId].name.toLowerCase()} on ${chordName(ctx.key, it.scale, v.on)}.`);
    // A wrong guess still counts against the floor being asked about.
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, options.length > 2 ? 'grid' : 'two');
  return frame({
    kicker: `Ear · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: 'Which floor is this?',
    hint: 'Listen for how many notes there are, and how far apart the outer two sit.',
    body: [again(play), ch.el, slot], fb: fb.el,
  });
}

// ---- moving between floors ----
const same = (a, b) => a.string === b.string && a.fret === b.fret;
const MOVE_KICKER = { par: 'Parallel motion', con: 'Contrary motion', obl: 'Oblique motion' };
const movingThing = { unison: 'note', thirds: 'third', 'shell.low': 'shell' };

// The two chords of a move, falling back to C if this key has no room for it.
function moveInfo(it, ctx) {
  const key = movePair(ctx.key, it) ? ctx.key : 'C';
  const m = movePair(key, it);
  const frets = [...m.from.notes, ...m.to.notes].map((n) => n.fret);
  const fretted = frets.filter((f) => f > 0);
  const low = fretted.length ? Math.min(...fretted) : 1;
  const lo = frets.includes(0) || low <= 2 ? 0 : low - 1;
  const hi = Math.max(Math.max(...frets, 1) + 1, (lo || 1) + 6);
  const fromTop = m.from.notes[m.from.notes.length - 1];
  const toTop = m.to.notes[m.to.notes.length - 1];
  const strings = [...new Set([...m.from.notes, ...m.to.notes].map((n) => n.string))];
  return { ...m, key, lo, hi, fromTop, toTop, strings };
}
const chordWord = (c) => (c.shape ? shapeName(c.shape) : c.mixed ? 'mixed chord' : 'chord');
const article = (word) => (/^[aeiou]/.test(word) ? 'an' : 'a');

function movePrompt(it, m, guitar) {
  const from = say(it.scale, m.fromTop.deg);
  const to = say(it.scale, m.toTop.deg);
  if (it.move === 'obl') {
    const thing = movingThing[it.floor];
    return {
      prompt: `Hold the ${to} on top. Step the ${thing} beneath it ${it.dir < 0 ? 'down' : 'back up'} the scale.`,
      hint: guitar ? 'Keep the top note ringing. Only the lower part moves, one scale step.' : 'The top note stays. Tap where the lower part lands, one scale step away.',
    };
  }
  const dirWord = it.dir > 0 ? 'up' : 'down';
  const lead = guitar ? `From this ${chordWord(m.from)}: the melody steps ${dirWord}` : `The melody steps ${dirWord}`;
  return it.move === 'par'
    ? { prompt: `${lead} from the ${from} to the ${to}. Take the bass with it.`, hint: 'Parallel motion: stay on the same floor.' }
    : { prompt: `${lead} from the ${from} to the ${to}. Send the bass the other way.`, hint: `Contrary motion: which floor puts the bass one step ${it.dir > 0 ? 'lower' : 'higher'}?` };
}

function moveAnswerText(it, m) {
  if (it.move === 'obl') {
    const where = m.to.mixed ? `Now ${article(m.to.under.on ? 'on' : 'off')} ${m.to.under.on ? 'on' : 'off'} ${movingThing[it.floor]} sits under ${article(m.to.on ? 'on' : 'off')} ${m.to.on ? 'on' : 'off'} note.` : 'Everything lines up in one chord again.';
    return `${moveWords(m)} ${where}`;
  }
  return `${cap(chordWord(m.from))} to ${chordWord(m.to)}. ${moveWords(m)}`;
}

const fromMarks = (it, m, skip = []) => m.from.notes
  .filter((n) => !skip.some((g) => same(g, n)))
  .map((n) => ({ ...mark(n, it.scale), kind: 'from' }));

function playMove(m) {
  audio.stopAll();
  audio.chord(m.from.notes.map((n) => n.midi), 0, 0.03, 0.55);
  audio.chord(m.to.notes.map((n) => n.midi), 1.15, 0.03, 0.55);
}

function moveTap(it, ctx) {
  const m = moveInfo(it, ctx);
  const text = movePrompt(it, m, false);
  const given = m.given.map((n) => ({ ...mark(n, it.scale), kind: `${kc(n.deg)} anchor` }));
  const picks = {};
  let done = false;
  const fb = feedback();
  const draw = () => board.draw([
    ...fromMarks(it, m, m.given),
    ...given,
    ...Object.entries(picks).map(([s, f]) => ({ string: +s, fret: f, kind: 'pick', label: '' })),
  ]);
  const board = neck({
    lo: m.lo, hi: m.hi, focus: m.strings, marks: [],
    onTap: (string, fret) => {
      if (done || m.given.some((g) => g.string === string)) return;
      if (picks[string] === fret) delete picks[string]; else picks[string] = fret;
      audio.note(OPEN[string] + fret, 0, 0.5, 1.2);
      draw();
    },
  });
  draw();
  setTimeout(() => { audio.stopAll(); audio.chord(m.from.notes.map((n) => n.midi), 0, 0.03, 0.55); }, 250);
  const check = () => {
    if (!Object.keys(picks).length) { fb.show(null, 'Tap the notes of the next chord, then check.'); return; }
    done = true;
    const mine = Object.entries(picks).map(([s, f]) => `${s}:${f}`).sort().join(' ');
    const key = (notes) => notes.filter((n) => !m.given.some((g) => same(g, n))).map((n) => `${n.string}:${n.fret}`).sort().join(' ');
    const hit = m.accept.find((notes) => key(notes) === mine);
    const shown = hit || m.to.notes;
    const marks = [...fromMarks(it, m, [...m.given, ...shown]), ...given];
    for (const n of shown) if (!m.given.some((g) => same(g, n))) marks.push(hit ? mark(n, it.scale) : { ...mark(n, it.scale), kind: 'ghost' });
    if (!hit) for (const [s, f] of Object.entries(picks)) if (!shown.some((n) => n.string === +s && n.fret === f)) marks.push({ string: +s, fret: f, kind: 'wrong', label: '' });
    board.draw(marks);
    playMove(m);
    fb.show(!!hit, moveAnswerText(it, m));
    ctx.finish(hit ? 'right' : 'wrong', hit ? 'auto' : 'tap');
  };
  ctx.foot(h('button', { class: 'primary wide', onclick: check }, 'Check'));
  return frame({
    kicker: `${MOVE_KICKER[it.move]} · ${scaleTitle(m.key, it.scale)}`,
    prompt: text.prompt, hint: `${text.hint} The faded notes are where you are now.`,
    body: [board.el, h('div', { class: 'pills center' }, pill('Hear the first chord', () => { audio.stopAll(); audio.chord(m.from.notes.map((n) => n.midi), 0, 0.03, 0.55); }, 'play'))],
    fb: fb.el,
  });
}

function moveGuitar(it, ctx) {
  const m = moveInfo(it, ctx);
  const text = movePrompt(it, m, true);
  const board = neck({ lo: m.lo, hi: m.hi, focus: m.strings, marks: m.from.notes.map((n) => mark(n, it.scale)) });
  const fb = feedback();
  revealThenRate(ctx, () => {
    board.draw([...fromMarks(it, m, m.to.notes), ...m.to.notes.map((n) => mark(n, it.scale))]);
    playMove(m);
    return moveAnswerText(it, m);
  }, fb);
  return frame({
    kicker: `${MOVE_KICKER[it.move]} · ${scaleTitle(m.key, it.scale)}`,
    prompt: text.prompt, hint: `${text.hint} Play the chord shown first, and say the degree of the top note.`,
    body: board.el, fb: fb.el,
  });
}

// Which floor comes next for this kind of step?
const HOW = {
  out: 'The melody steps up and you want the bass to step down.',
  in: 'The melody steps down and you want the bass to step up.',
  par: 'The melody steps up and you want the bass to step up with it.',
};
function motionQuiz(it, ctx) {
  const i = ELEVATOR.indexOf(it.floor);
  const options = [ELEVATOR[i - 1], ELEVATOR[i], ELEVATOR[i + 1]].filter(Boolean);
  const answer = floorAfter(it.floor, it.how);
  const name = (id) => floorOf(id).name;
  const fb = feedback();
  const ch = choices(options.map((id) => ({ value: id, label: name(id), sub: id === it.floor ? 'same floor' : ELEVATOR.indexOf(id) > i ? 'one floor up' : 'one floor down' })), (val) => {
    const ok = val === answer;
    ch.resolve(answer, val);
    fb.show(ok, it.how === 'par' ? 'Same floor: both voices move together. Parallel motion.'
      : it.how === 'out' ? `Up a floor, to ${name(answer).toLowerCase()}: a bigger floor reaches lower, so the bass steps down. Contrary motion.`
      : `Down a floor, to ${name(answer).toLowerCase()}: a smaller floor reaches less far, so the bass steps up. Contrary motion.`);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, options.length === 2 ? 'two' : 'three');
  return frame({
    kicker: 'Which floor next?',
    prompt: `You are on ${name(it.floor).toLowerCase()}. ${HOW[it.how]}`,
    hint: 'Which floor do you go to?',
    body: ch.el, fb: fb.el,
  });
}

// Ear: what did the outer voices do between two chords?
const MOTION_NAME = { par: 'Parallel', con: 'Contrary', obl: 'Oblique' };
const MOTION_SUB = { par: 'same direction', con: 'opposite directions', obl: 'one voice holds' };
function earMotion(it, ctx) {
  const obliqueOn = it.motion === 'obl' || isActive(unitById('motion.oblique'));
  const types = obliqueOn ? ['par', 'con', 'obl'] : ['par', 'con'];
  const target = Math.random() < 0.6 ? it.motion : rand(types);
  const big = isActive(unitById('motion.wide'));
  let m = null;
  for (let tries = 0; tries < 30 && !m; tries++) {
    const floors = target === 'obl' ? ['unison', 'thirds'] : big ? ['thirds', 'triads', 'shell.low', 'oct.low', 'drop2'] : ['thirds', 'triads', 'shell.low'];
    const pick = { scale: it.scale, move: target, floor: rand(floors), dir: rand([1, -1]), deg: rand([0, 1, 2, 3, 4, 5, 6, 7]) };
    const pair = movePair(ctx.key, pick);
    if (pair) m = { ...moveInfo(pick, ctx), pick };
  }
  if (!m) { const pick = { scale: it.scale, move: target, floor: 'thirds', dir: 1, deg: 0 }; m = { ...moveInfo(pick, { key: 'C' }), pick }; }
  const outer = (c) => [c.notes[0].midi, c.notes[c.notes.length - 1].midi];
  const play = () => playMove(m);
  const playOuter = () => { audio.stopAll(); audio.chord(outer(m.from), 0, 0.02, 0.6); audio.chord(outer(m.to), 1.15, 0.02, 0.6); };
  play();
  const fb = feedback();
  const slot = h('div');
  const ch = choices(types.map((t) => ({ value: t, label: MOTION_NAME[t], sub: MOTION_SUB[t] })), (val) => {
    const ok = val === target;
    ch.resolve(target, val);
    slot.replaceChildren(neck({ lo: m.lo, hi: m.hi, focus: m.strings, marks: [...fromMarks(m.pick, m, m.to.notes), ...m.to.notes.map((n) => mark(n, it.scale))] }).el);
    fb.show(ok, moveWords(m));
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, types.length === 2 ? 'two' : 'three');
  return frame({
    kicker: `Ear · ${scaleTitle(m.key, it.scale)}`,
    prompt: 'What did the outer voices do?',
    hint: 'Two chords. Follow the top note and the bottom note: do they move the same way, opposite ways, or does one stay put?',
    body: [h('div', { class: 'pills center' }, pill('Hear it again', play, 'ear'), pill('Outer voices only', playOuter)), ch.el, slot],
    fb: fb.el,
  });
}

export function mountDrill(entry, ctx) {
  audio.stopAll();
  const it = parse(entry.id);
  if (entry.study) return study(it, ctx);
  const g = ctx.mode === 'guitar';
  switch (it.kind) {
    case 'oo': return onOff(it, ctx);
    case 'st': return g ? stepGuitar(it, ctx) : step(it, ctx);
    case 'nm': return g ? findGuitar(it, ctx) : nameIt(it, ctx);
    case 'wk': return g ? walkGuitar(it, ctx) : walk(it, ctx);
    case 'sh': return g ? shapeGuitar(it, ctx) : shapeTap(it, ctx);
    case 'eo': return earOnOff(it, ctx);
    case 'ed': return earDegree(it, ctx);
    case 'ef': return g ? earFindGuitar(it, ctx) : earFind(it, ctx);
    case 'ei': return earImagine(it, ctx);
    case 'el': return earFloor(it, ctx);
    case 'mq': return motionQuiz(it, ctx);
    case 'mv': return g ? moveGuitar(it, ctx) : moveTap(it, ctx);
    case 'em': return earMotion(it, ctx);
    default: return h('div', null, 'Unknown exercise');
  }
}
