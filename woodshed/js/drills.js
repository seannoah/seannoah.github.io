// drills.js — one small exercise per practice item. Each has an "away" form that is
// answered on screen and checked by the app, and most have a "guitar in hand" form
// that asks you to play, then reveals the answer for you to rate yourself.

import { h, cap, icon } from './dom.js';
import { neck, windowFor } from './neck.js';
import * as audio from './audio.js';
import { SCALES, OPEN, keyOf, scaleNotes, chordName, scaleTitle, stepSize, walkPath, walkStart, stringPath, mod } from './theory.js';
import { SHAPES, FLOORS, ELEVATOR, voicingFor, voicingAt, voicings, anchorNote, setLabel, floorOf, partsInside, partWhere } from './floors.js';
import { parseChord, scaleOptions, scaleKey } from './harmony.js';
import { borrowPair, underBorrowed, borrowIn, borrowWords, voiceName } from './borrow.js';
import { movePair, moveWords, floorAfter, shapeName, leapPair, bassMove, voiceWords } from './motion.js';
import { pivotPair, reflectFloor } from './mirror.js';
import { POSTS, hubPair, jobById, chordOf, nameOf, postPhrase, postStory } from './subs.js';
import { ROLES, chord as sixth, chordLabel, formulaText, formulaWords, tallRoles, sixthVoicing, transformPair, movesText, moveIn, chainIn } from './transform.js';
import { parse, unitById, isActive } from './curriculum.js';
import { isNew } from './store.js';
import { pill } from './widgets.js';

const kc = (deg) => (deg % 2 === 0 ? 'on' : 'off');
const say = (scale, deg) => SCALES[scale].say[deg];
const lab = (scale, deg) => SCALES[scale].labels[deg];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const mark = (n, scale, kind) => ({ string: n.string, fret: n.fret, kind: kind || kc(n.deg), label: lab(scale, n.deg) });
const frets = (n) => `${n} fret${n === 1 ? '' : 's'}`;

export function frame({ kicker, prompt, hint, body, fb }) {
  return h('div', { class: 'drill' },
    h('div', { class: 'kicker' }, kicker),
    h('h2', { class: 'prompt' }, prompt),
    hint ? h('p', { class: 'hint' }, hint) : null,
    h('div', { class: 'drill-body' }, body),
    fb || null);
}

export function feedback() {
  const el = h('div', { class: 'fb', role: 'status' });
  return { el, show(ok, text) { el.className = 'fb show ' + (ok === true ? 'ok' : ok === false ? 'no' : 'info'); el.textContent = text; } };
}

// A set of answer buttons. resolve() colors the right one and locks the set.
export function choices(options, onPick, cls = '') {
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
  // In a tune the melody note is a definite pitch (ctx.at); otherwise any comfortable position will do.
  const v = (ctx.at != null && voicingAt(ctx.key, it.scale, it.shape, it.set, it.anchor, ctx.at))
    || voicingFor(ctx.key, it.scale, it.shape, it.set, it.anchor, it.deg);
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
const kickerOf = (it) => (it.kind === 'lp' ? 'Leaps' : it.kind === 'pv' ? 'Through the mirror' : MOVE_KICKER[it.move]);
// The two chords of an item: a step between floors, a leap, or a pivot.
const pairOf = (key, it) => (it.kind === 'lp' ? leapPair(key, it) : it.kind === 'pv' ? pivotPair(key, it) : movePair(key, it));
const movingThing = { unison: 'note', thirds: 'third', 'shell.low': 'shell' };

// The two chords of a move, falling back to C if this key has no room for it.
function moveInfo(it, ctx) {
  const key = pairOf(ctx.key, it) ? ctx.key : 'C';
  const m = pairOf(key, it);
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
// One chord of a floor, in a word or two. An octave chord is not named for what is inside it here.
const oneOf = (shapeId) => (SHAPES[shapeId].floor === 'octaves' && !SHAPES[shapeId].frame ? 'octave chord' : shapeName(shapeId));
const chordWord = (c) => (c.shape ? oneOf(c.shape) : c.mixed ? 'mixed chord' : 'chord');
const article = (word) => (/^[aeiou]/.test(word) ? 'an' : 'a');

function movePrompt(it, m, guitar) {
  if (it.kind === 'lp') return leapPrompt(it, m, guitar);
  if (it.kind === 'pv') return pivotPrompt(it, m, guitar);
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
  if (it.kind === 'lp') return `${cap(chordWord(m.from))} to ${chordWord(m.to)}. ${moveWords(m)} ${sumText(it.t, it.df)}`;
  if (it.kind === 'pv') return pivotText(m);
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
    kicker: `${kickerOf(it)} · ${scaleTitle(m.key, it.scale)}`,
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
    kicker: `${kickerOf(it)} · ${scaleTitle(m.key, it.scale)}`,
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

// ---- borrowing ----
const frameFor = (notes) => {
  const all = notes.map((n) => n.fret);
  const fretted = all.filter((f) => f > 0);
  const low = fretted.length ? Math.min(...fretted) : 1;
  const lo = all.includes(0) || low <= 2 ? 0 : low - 2;
  return { lo, hi: Math.max(Math.max(...all, 1) + 2, (lo || 1) + 6) };
};
const borrowedMarks = (it, b) => [
  ...b.notes.map((n) => (n === b.moved ? { ...mark(n, it.scale), kind: `${kc(n.deg)} anchor` } : mark(n, it.scale))),
  { ...mark(b.old, it.scale), kind: 'from' },
];
function playBorrow(b, back = true) {
  audio.stopAll();
  audio.chord(b.notes.map((n) => n.midi), 0, 0.03, 0.55);
  if (back) audio.chord(b.base.notes.map((n) => n.midi), 1.2, 0.03, 0.55);
}

function borrowTap(it, ctx) {
  const key = borrowPair(ctx.key, it) ? ctx.key : 'C';
  const b = borrowPair(key, it);
  const base = b.base;
  const voice = voiceName(base.notes.length, it.voice);
  const where = it.dir > 0 ? 'above' : 'below';
  const win = frameFor([...base.notes, b.moved]);
  const fb = feedback();
  let done = false;
  const board = neck({
    lo: win.lo, hi: win.hi, focus: base.set, marks: base.notes.map((n) => mark(n, it.scale)),
    onTap: (string, fret) => {
      if (done || string !== b.old.string || fret === b.old.fret) return;
      done = true;
      const ok = fret === b.moved.fret;
      board.draw(ok ? borrowedMarks(it, b) : [...borrowedMarks(it, b).map((m) => (m.fret === b.moved.fret && m.string === b.moved.string ? { ...m, kind: 'ghost' } : m)), { string, fret, kind: 'wrong', label: '' }]);
      playBorrow(b);
      fb.show(ok, `${borrowWords(it.scale, b, say)} Then it steps back.`);
      ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
    },
  });
  setTimeout(() => { audio.stopAll(); audio.chord(base.notes.map((n) => n.midi), 0, 0.03, 0.55); }, 250);
  return frame({
    kicker: `Borrowing · ${scaleTitle(key, it.scale)}`,
    prompt: `Borrow ${where} the ${voice} voice.`,
    hint: `The ${say(it.scale, b.old.deg)} on string ${b.old.string} steps to its neighbor on the path while the other notes hold. Tap where it goes.`,
    body: board.el, fb: fb.el,
  });
}

function borrowGuitar(it, ctx) {
  const key = borrowPair(ctx.key, it) ? ctx.key : 'C';
  const b = borrowPair(key, it);
  const win = frameFor([...b.base.notes, b.moved]);
  const board = neck({ lo: win.lo, hi: win.hi, focus: b.base.set, marks: b.base.notes.map((n) => mark(n, it.scale)) });
  const fb = feedback();
  revealThenRate(ctx, () => { board.draw(borrowedMarks(it, b)); playBorrow(b); return borrowWords(it.scale, b, say); }, fb);
  return frame({
    kicker: `Borrowing · ${scaleTitle(key, it.scale)}`,
    prompt: `Play this ${shapeName(b.base.shape)}. Borrow ${it.dir > 0 ? 'above' : 'below'} the ${voiceName(b.base.notes.length, it.voice)} voice, then give it back.`,
    hint: 'Let the other notes ring. Say the name of the note you borrow.',
    body: board.el, fb: fb.el,
  });
}

// An on chord kept beneath an off melody note.
function underInfo(it, ctx) {
  const key = underBorrowed(ctx.key, it, ctx.at) ? ctx.key : underBorrowed(ctx.key, it) ? ctx.key : 'C';
  const b = underBorrowed(key, it, ctx.at) || underBorrowed(key, it);
  return { key, b, win: frameFor([...b.notes, b.old]), below: b.notes.filter((n) => n !== b.moved), shape: SHAPES[it.shape] };
}
const underText = (it, m) => `${chordName(m.key, it.scale, true)} beneath a borrowed note. ${borrowWords(it.scale, m.b, say)}`;

function underTap(it, ctx) {
  const m = underInfo(it, ctx);
  const { b } = m;
  const melody = { ...mark(b.moved, it.scale), kind: `${kc(b.moved.deg)} anchor` };
  const picks = {};
  let done = false;
  const fb = feedback();
  const draw = () => board.draw([melody, ...Object.entries(picks).map(([s, f]) => ({ string: +s, fret: f, kind: 'pick', label: '' }))]);
  const board = neck({
    lo: m.win.lo, hi: m.win.hi, focus: m.b.base.set, marks: [melody],
    onTap: (string, fret) => {
      if (done || string === b.moved.string) return;
      if (!b.base.set.includes(string)) { fb.show(null, `This shape lives on ${setLabel(b.base.set)}.`); return; }
      if (picks[string] === fret) delete picks[string]; else picks[string] = fret;
      audio.note(OPEN[string] + fret, 0, 0.5, 1.2);
      draw();
    },
  });
  const check = () => {
    const missing = m.below.filter((n) => picks[n.string] == null);
    if (missing.length) { fb.show(null, `Place a note on string${missing.length > 1 ? 's' : ''} ${missing.map((n) => n.string).join(' and ')} first.`); return; }
    done = true;
    const ok = m.below.every((n) => picks[n.string] === n.fret);
    const marks = [melody, { ...mark(b.old, it.scale), kind: 'from' }];
    for (const n of m.below) {
      if (picks[n.string] === n.fret) marks.push(mark(n, it.scale));
      else { marks.push({ string: n.string, fret: picks[n.string], kind: 'wrong', label: '' }); marks.push({ ...mark(n, it.scale), kind: 'ghost' }); }
    }
    board.draw(marks);
    playBorrow(b);
    fb.show(ok, underText(it, m));
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  };
  ctx.foot(h('button', { class: 'primary wide', onclick: check }, 'Check'));
  return frame({
    kicker: `Borrowed melody · ${scaleTitle(m.key, it.scale)} · ${setLabel(b.base.set)}`,
    prompt: `The melody is the ${say(it.scale, b.moved.deg)}, an off note. Keep the on chord beneath it.`,
    hint: `Summon ${m.shape.a} as if the melody were the ${say(it.scale, b.old.deg)}, the on note just ${it.from > 0 ? 'above' : 'below'} it. Tap the other ${m.below.length === 1 ? 'note' : 'notes'}.`,
    body: board.el, fb: fb.el,
  });
}

function underGuitar(it, ctx) {
  const m = underInfo(it, ctx);
  const { b } = m;
  const melody = { ...mark(b.moved, it.scale), kind: `${kc(b.moved.deg)} anchor` };
  const board = neck({ lo: m.win.lo, hi: m.win.hi, focus: b.base.set, marks: [melody] });
  const fb = feedback();
  revealThenRate(ctx, () => {
    board.draw([melody, ...m.below.map((n) => mark(n, it.scale)), { ...mark(b.old, it.scale), kind: 'from' }]);
    playBorrow(b);
    return underText(it, m);
  }, fb);
  return frame({
    kicker: `Borrowed melody · ${scaleTitle(m.key, it.scale)} · ${setLabel(b.base.set)}`,
    prompt: `Hold the ${say(it.scale, b.moved.deg)} on string ${b.moved.string}, an off note. Summon ${m.shape.a} of the on chord beneath it.`,
    hint: `Think of the ${say(it.scale, b.old.deg)}, the on note just ${it.from > 0 ? 'above' : 'below'}: its shape, with the melody in its place. Then let the melody step ${it.from > 0 ? 'up' : 'down'} to it.`,
    body: board.el, fb: fb.el,
  });
}

// Ear: is one note of this chord borrowed?
function earBorrow(it, ctx) {
  const key = ctx.key;
  const shape = rand(['triads', 'shell.low']);
  const set = SHAPES[shape].primary;
  const pool = voicings(key, it.scale, shape, set).filter((v) => v.on && v.minFret >= 1 && v.maxFret <= 12);
  const base = rand(pool);
  const tries = [[0, 1], [0, -1], [1, 1], [1, -1]].map(([voice, dir]) => borrowIn(key, it.scale, base, voice, dir)).filter(Boolean);
  const b = Math.random() < 0.55 && tries.length ? rand(tries) : null;
  const midis = (b || base).notes.map((n) => n.midi);
  const play = () => { audio.stopAll(); audio.chord(midis, 0, 0.03, 0.6); audio.line(midis, 0.3, 1.4, 0.55); };
  play();
  const fb = feedback();
  const slot = h('div');
  const ch = choices([{ value: 'pure', label: 'All on', sub: 'at rest' }, { value: 'borrowed', label: 'One borrowed', sub: 'a note leans' }], (val) => {
    const answer = b ? 'borrowed' : 'pure';
    const ok = val === answer;
    ch.resolve(answer, val);
    const win = frameFor([...base.notes, ...(b ? [b.moved] : [])]);
    slot.replaceChildren(neck({ lo: win.lo, hi: win.hi, focus: set, marks: b ? borrowedMarks(it, b) : base.notes.map((n) => mark(n, it.scale)) }).el);
    fb.show(ok, b ? borrowWords(it.scale, b, say) : `All on: a plain ${shapeName(shape)} of ${chordName(key, it.scale, true)}.`);
    if (b) audio.chord(base.notes.map((n) => n.midi), 0.2, 0.03, 0.5);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'two');
  return frame({
    kicker: `Ear · ${scaleTitle(key, it.scale)}`,
    prompt: 'All on, or is one note borrowed?',
    hint: `You hear a small chord of ${chordName(key, it.scale, true)}. Does every note rest, or does one lean toward its neighbor?`,
    body: [again(play), ch.el, slot], fb: fb.el,
  });
}

// ---- reading a chart: which scale of chords goes with this chord symbol? ----
const SC_SUFFIX = { min7: 'm7', hdim: 'm7♭5', maj: 'maj7', dom: '7' };
const SC_HOW = { same: () => 'same four notes', on5: (fam) => (fam === 'maj' ? 'major 6 on the 5' : 'minor 6 on the 5'), tm: () => "tritone's minor", tt: () => 'tritone substitute' };
const SC_ASK = {
  same: 'Which scale of chords do you play over it?',
  on5: (fam) => `Which scale is its ${fam === 'maj' ? 'major' : 'minor'} 6 on the 5?`,
  tm: "Which scale is its tritone's minor?",
  tt: 'Which dominant is its tritone substitute?',
};
function scaleChoice(it, ctx) {
  const chord = parseChord(ctx.symbol || `${ctx.key}${SC_SUFFIX[it.fam]}`);
  const options = scaleOptions(chord, true);
  const answer = options.find((o) => o.how === SC_HOW[it.how](it.fam)) || options[0];
  const label = (root) => `${scaleKey(root, chord.sharp)} ${SCALES[answer.scale].short}`;
  // wrong answers: the same kind of scale on other likely roots, never one of the chord's real choices
  const real = new Set(options.filter((o) => o.scale === answer.scale).map((o) => o.root));
  const others = [0, 5, 7, 10, 8, 2, 9, 3, 1].map((n) => mod(chord.root + n, 12)).filter((r) => !real.has(r));
  const picks = [answer.root, ...others.slice(0, 3)].sort(() => Math.random() - 0.5);
  const onNotes = scaleNotes(answer.key, answer.scale).filter((n) => n.on).map((n) => n.name).join(', ');
  const fb = feedback();
  const ask = typeof SC_ASK[it.how] === 'function' ? SC_ASK[it.how](it.fam) : SC_ASK[it.how];
  const ch = choices(picks.map((r) => ({ value: r, label: r === answer.root ? answer.label : label(r) })), (val) => {
    const ok = val === answer.root;
    ch.resolve(answer.root, val);
    fb.show(ok, `${answer.label}: ${cap(answer.why)}. Its on chord is ${answer.on} (${onNotes}).`);
    audio.stopAll();
    audio.line(chordMidis(answer.key, answer.scale, true), 0.13);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'two');
  return frame({ kicker: 'Reading a chart', prompt: ['The chart says ', h('span', { class: 'sym' }, chord.text), '.'], hint: ask, body: ch.el, fb: fb.el });
}

// The same question with the guitar: play the chord you would use, then check.
function scaleGuitar(it, ctx) {
  const chord = parseChord(ctx.symbol || `${ctx.key}${SC_SUFFIX[it.fam]}`);
  const options = scaleOptions(chord, true);
  const answer = options.find((o) => o.how === SC_HOW[it.how](it.fam)) || options[0];
  const all = voicings(answer.key, answer.scale, 'drop2', SET52).filter((v) => v.on && v.lowFret > 0 && v.maxFret <= 14);
  const v = all.find((x) => x.bottomDeg === 0) || all[0];
  const win = gripFrame(v.notes);
  const board = neck({ lo: win.lo, hi: win.hi, focus: SET52, marks: [] });
  const fb = feedback();
  const ask = typeof SC_ASK[it.how] === 'function' ? SC_ASK[it.how](it.fam) : SC_ASK[it.how];
  revealThenRate(ctx, () => {
    board.draw(roleMarks(v, answer.scale));
    audio.stopAll();
    strum(v);
    return `${answer.label}: ${cap(answer.why)}. Its on chord is ${answer.on}, shown here with the root in the bass.`;
  }, fb);
  return frame({
    kicker: 'Reading a chart',
    prompt: ['The chart says ', h('span', { class: 'sym' }, chord.text), '. Play the chord you would use.'],
    hint: `${ask} Say its name, then play it as a drop 2 on strings 5 to 2, any shape.`,
    body: board.el, fb: fb.el,
  });
}

// ---- transformation ----
const SET52 = [5, 4, 3, 2];
// A window of at most eight frets, so the whole move shows on a phone without scrolling.
const gripFrame = (notes) => {
  const all = notes.map((n) => n.fret);
  const min = Math.min(...all);
  const max = Math.max(...all);
  if (min === 0) return { lo: 0, hi: Math.max(max + 1, 6) };
  const lo = Math.max(1, min - 1);
  return { lo, hi: Math.max(max + 1, lo + 6) };
};
const sym = (text) => h('span', { class: 'sym' }, text);
const formulaTag = (f) => h('span', { class: 'formula' }, formulaText(f));
const roleMarks = (v, scale, kind = 'on') => v.notes.map((n, i) => ({ string: n.string, fret: n.fret, kind: kind === 'on' && i === 0 ? 'on anchor' : kind, label: lab(scale, n.deg) }));
const lowToHigh = (v, scale) => `Low to high: ${v.notes.map((n) => say(scale, n.deg)).join(', ')}.`;
const strum = (v, at = 0) => audio.chord(v.notes.map((n) => n.midi), at, 0.03, 0.55);
const playPair = (p) => { audio.stopAll(); strum(p.from); strum(p.to, 1.15); };
// The answer on the neck: the new chord, with the old one faded wherever a voice moved.
const pairMarks = (p) => [
  ...p.from.notes.filter((n, i) => p.moves[i] !== 0).map((n) => ({ string: n.string, fret: n.fret, kind: 'from', label: lab(p.fromChord.scale, n.deg) })),
  ...roleMarks(p.to, p.toChord.scale),
];

// What is in the bass of this chord?
function bassInfo(it, ctx) {
  const c = sixth(keyOf(ctx.key).pc, it.scale);
  const v = sixthVoicing(c, it.role, SET52, 5);
  return { c, v, win: gripFrame(v.notes) };
}

function bassQuiz(it, ctx) {
  const { c, v, win } = bassInfo(it, ctx);
  const board = neck({ lo: win.lo, hi: win.hi, focus: SET52, marks: v.notes.map((n, i) => ({ string: n.string, fret: n.fret, kind: i === 0 ? 'q' : 'on', label: i === 0 ? '?' : '' })) });
  const fb = feedback();
  setTimeout(() => { audio.stopAll(); strum(v); }, 250);
  const ch = choices(ROLES.map((r, i) => ({ value: i, label: cap(r.name) })), (val) => {
    const ok = val === it.role;
    ch.resolve(it.role, val);
    board.draw(roleMarks(v, it.scale));
    audio.stopAll();
    audio.line(v.notes.map((n) => n.midi), 0.3);
    fb.show(ok, `The ${ROLES[it.role].name} is in the bass. ${lowToHigh(v, it.scale)}`);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'grid');
  return frame({
    kicker: 'Brothers and sisters · drop 2 on strings 5 to 2',
    prompt: ['This is ', sym(chordLabel(c)), '. What is in the bass?'],
    hint: 'A drop 2 chord has four shapes, one for each note that can be on the bottom. Know each by its lowest note.',
    body: [board.el, ch.el], fb: fb.el,
  });
}

function bassGuitar(it, ctx) {
  const { c, v, win } = bassInfo(it, ctx);
  const board = neck({ lo: win.lo, hi: win.hi, focus: SET52, marks: [] });
  const fb = feedback();
  revealThenRate(ctx, () => { board.draw(roleMarks(v, it.scale)); audio.stopAll(); strum(v); return lowToHigh(v, it.scale); }, fb);
  return frame({
    kicker: 'Brothers and sisters · drop 2 on strings 5 to 2',
    prompt: ['Play ', sym(chordLabel(c)), ` with the ${ROLES[it.role].name} in the bass.`],
    hint: 'Find the bass note on string 5 first and say what it is. Then summon the shape above it.',
    body: board.el, fb: fb.el,
  });
}

// The family circle: forward, backward or across.
function circleInfo(it, ctx) {
  const c = sixth(keyOf(ctx.key).pc, it.scale);
  const p = transformPair(c, it.role, { dir: it.dir, family: null, quality: null });
  return { p, win: gripFrame([...p.from.notes, ...p.to.notes]) };
}
function circleText(it, p) {
  const from = ROLES[p.fromRole].name;
  const to = ROLES[p.toRole].name;
  const tall = tallRoles(it.scale);
  const bass = p.moves[0];
  const why = bass > 0 ? `The bass steps up a fret, because the ${to} is a tall one.`
    : bass < 0 ? `The bass steps down a fret, because the ${from} was a tall one.`
    : tall.includes(to) ? `The bass does not move: the ${from} and the ${to} are both tall.`
    : 'The bass does not move. Only what you call it changes.';
  return `${cap(it.dir)} from the ${from} is the ${to}: ${chordLabel(p.fromChord)} becomes ${chordLabel(p.toChord)}. ${why}`;
}

function circleQuiz(it, ctx) {
  const { p, win } = circleInfo(it, ctx);
  const board = neck({ lo: win.lo, hi: win.hi, focus: SET52, marks: roleMarks(p.from, it.scale) });
  const fb = feedback();
  setTimeout(() => { audio.stopAll(); strum(p.from); }, 250);
  const ch = choices(ROLES.map((r, i) => ({ value: i, label: cap(r.name) })), (val) => {
    const ok = val === p.toRole;
    ch.resolve(p.toRole, val);
    board.draw(pairMarks(p));
    playPair(p);
    fb.show(ok, circleText(it, p));
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'grid');
  return frame({
    kicker: `The circle · ${SCALES[it.scale].short} family`,
    prompt: [sym(chordLabel(p.fromChord)), ` has the ${ROLES[it.role].name} in the bass. Move ${it.dir}. What is in the bass now?`],
    hint: 'Round the circle the order is root, third, fifth, sixth. Forward is the next one, backward the one before, across the one opposite.',
    body: [board.el, ch.el], fb: fb.el,
  });
}

function circleGuitar(it, ctx) {
  const { p, win } = circleInfo(it, ctx);
  const board = neck({ lo: win.lo, hi: win.hi, focus: SET52, marks: roleMarks(p.from, it.scale) });
  const fb = feedback();
  revealThenRate(ctx, () => { board.draw(pairMarks(p)); playPair(p); return circleText(it, p); }, fb);
  return frame({
    kicker: `The circle · ${SCALES[it.scale].short} family`,
    prompt: ['Play ', sym(chordLabel(p.fromChord)), ` with the ${ROLES[it.role].name} in the bass. Then move ${it.dir === 'across' ? 'across the circle' : `${it.dir} round the circle`}.`],
    hint: 'Keep your hand where it is. Say what is in the bass of each chord: move the bass note first if it has to move, then summon the shape above it.',
    body: board.el, fb: fb.el,
  });
}

// Which formula makes this move?
const DIRS = ['forward', 'backward', 'across', null];
const FAMILIES = ['up', 'down', null];
function formulaDecoys(f) {
  const answer = formulaText(f);
  const near = [];
  const far = [];
  for (const dir of DIRS) for (const family of FAMILIES) {
    const text = formulaText({ dir, family, quality: f.quality });
    if (text === answer || text === '[Stay]') continue;
    ((dir === f.dir) !== (family === f.family) ? near : far).push(text);
  }
  const mix = (a) => a.sort(() => Math.random() - 0.5);
  return [...mix(near), ...mix(far)].slice(0, 3);
}

function formulaQuiz(it, ctx) {
  const m = moveIn(it.move, keyOf(ctx.key).pc);
  const answer = formulaText(m.formula);
  const options = [answer, ...formulaDecoys(m.formula)].sort(() => Math.random() - 0.5);
  const p = transformPair(m.fromChord, rand([0, 1, 2, 3]), m.formula);
  const fb = feedback();
  const slot = h('div');
  const ch = choices(options.map((text) => ({ value: text, label: text })), (val) => {
    const ok = val === answer;
    ch.resolve(answer, val);
    const win = gripFrame([...p.from.notes, ...p.to.notes]);
    slot.replaceChildren(neck({ lo: win.lo, hi: win.hi, focus: SET52, marks: pairMarks(p) }).el);
    playPair(p);
    fb.show(ok, `${answer}: ${formulaWords(m.formula)}. Here, ${chordLabel(m.fromChord)} to ${chordLabel(m.toChord)}.`);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'stack');
  return frame({
    kicker: `Formulas · ${cap(m.context.replace(/^(a|the) /, ''))}`,
    prompt: `From ${m.fromName} to ${m.toName}.`,
    hint: 'Which formula makes that move?',
    body: [ch.el, slot], fb: fb.el,
  });
}

// Play a transformation, starting with a given note in the bass.
function transformInfo(it, ctx) {
  const m = moveIn(it.move, keyOf(ctx.key).pc);
  const p = transformPair(m.fromChord, it.role, m.formula);
  return { m, p, win: gripFrame([...p.from.notes, ...p.to.notes]) };
}
const transformText = (p) => {
  const still = p.moves.every((x) => x === 0);
  return `${chordLabel(p.toChord)} with the ${ROLES[p.toRole].name} in the bass. ${still ? 'No voice moved.' : `In frets, low string to high, the voices moved ${movesText(p.moves)}.`}`;
};
// In a tune the move is named by its chart chords (ctx.note); otherwise by its usual setting.
const transformHint = (m, p, ctx) => `${ctx.note || `In ${m.context}, this takes ${m.fromName} to ${m.toName}.`} You start with the ${ROLES[p.fromRole].name} in the bass.`;
const transformKicker = (m, ctx) => (ctx.note ? 'Transformation' : `Transformation · ${cap(m.context.replace(/^(a|the) /, ''))}`);

function transformTap(it, ctx) {
  const { m, p, win } = transformInfo(it, ctx);
  const fromMarksNow = () => p.from.notes.map((n) => ({ string: n.string, fret: n.fret, kind: 'from', label: lab(p.fromChord.scale, n.deg) }));
  const picks = {};
  let done = false;
  const fb = feedback();
  const draw = () => board.draw([
    ...fromMarksNow().filter((x) => picks[x.string] !== x.fret),
    ...Object.entries(picks).map(([s, f]) => ({ string: +s, fret: f, kind: 'pick', label: '' })),
  ]);
  const board = neck({
    lo: win.lo, hi: win.hi, focus: SET52, marks: fromMarksNow(),
    onTap: (string, fret) => {
      if (done || !SET52.includes(string)) return;
      if (picks[string] === fret) delete picks[string]; else picks[string] = fret;
      audio.note(OPEN[string] + fret, 0, 0.5, 1.2);
      draw();
    },
  });
  setTimeout(() => { audio.stopAll(); strum(p.from); }, 250);
  const check = () => {
    const missing = SET52.filter((s2) => picks[s2] == null);
    if (missing.length) { fb.show(null, `Place a note on string${missing.length > 1 ? 's' : ''} ${missing.join(', ')} first. A voice that does not move still needs a tap.`); return; }
    done = true;
    const ok = p.to.notes.every((n) => picks[n.string] === n.fret);
    const marks = pairMarks(p).map((x) => (ok || x.kind === 'from' ? x : { ...x, kind: picks[x.string] === x.fret ? 'on' : 'ghost' }));
    if (!ok) for (const n of p.to.notes) if (picks[n.string] !== n.fret) marks.push({ string: n.string, fret: picks[n.string], kind: 'wrong', label: '' });
    board.draw(marks);
    playPair(p);
    fb.show(ok, transformText(p));
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  };
  ctx.foot(h('button', { class: 'primary wide', onclick: check }, 'Check'));
  return frame({
    kicker: transformKicker(m, ctx),
    prompt: ['From ', sym(chordLabel(p.fromChord)), ', move ', formulaTag(m.formula)],
    hint: `${transformHint(m, p, ctx)} Tap the four notes of the chord you land on. The faded notes are where you are now.`,
    body: [board.el, h('div', { class: 'pills center' }, pill('Hear the first chord', () => { audio.stopAll(); strum(p.from); }, 'play'))],
    fb: fb.el,
  });
}

function transformGuitar(it, ctx) {
  const { m, p, win } = transformInfo(it, ctx);
  const board = neck({ lo: win.lo, hi: win.hi, focus: SET52, marks: roleMarks(p.from, p.fromChord.scale) });
  const fb = feedback();
  revealThenRate(ctx, () => { board.draw(pairMarks(p)); playPair(p); return transformText(p); }, fb);
  return frame({
    kicker: transformKicker(m, ctx),
    prompt: ['Play ', sym(chordLabel(p.fromChord)), ', then move ', formulaTag(m.formula)],
    hint: `${transformHint(m, p, ctx)} Say what will be in the bass before you move.`,
    body: board.el, fb: fb.el,
  });
}

// Ear: which V chord was that?
function earResolution(it, ctx) {
  const tonic = keyOf(ctx.key).pc;
  const answer = rand(['major-on5', 'major-tm']);
  const steps = chainIn(answer, tonic, rand([0, 1, 2, 3]));
  const play = () => { audio.stopAll(); steps.forEach((st, k) => strum(st.voicing, k * 1.25)); };
  play();
  const fb = feedback();
  const slot = h('div');
  const ch = choices([
    { value: 'major-on5', label: 'Inside', sub: 'minor 6 on the 5' },
    { value: 'major-tm', label: 'Outside', sub: 'tritone’s minor' },
  ], (val) => {
    const ok = val === answer;
    ch.resolve(answer, val);
    const v = steps[1];
    const win = gripFrame(steps.flatMap((st) => st.voicing.notes));
    slot.replaceChildren(neck({ lo: win.lo, hi: win.hi, focus: SET52, marks: roleMarks(v.voicing, v.chord.scale) }).el);
    fb.show(ok, answer === 'major-on5'
      ? `Inside. The V chord was ${chordLabel(v.chord)}, the minor 6 on the 5: every note belongs to the key, and one voice moved to reach it.`
      : `Outside. The V chord was ${chordLabel(v.chord)}, the tritone’s minor: it has notes from outside the key, which is where the darker color comes from.`);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'two');
  return frame({
    kicker: `Ear · ii–V–I in ${ctx.key}`,
    prompt: 'Which V chord was that?',
    hint: `Three chords: ${steps.map((st) => st.says).join(', ')}. Listen to the middle one. Does it stay inside the key, or step outside it?`,
    body: [again(play), ch.el, slot], fb: fb.el,
  });
}

// ---- leaps ----
// The sum behind every move with the melody on top, spelled out for one case.
const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');
const floorsWords = (df) => (df === 0 ? 'the same floor' : `${Math.abs(df) === 1 ? 'one floor' : 'two floors'} ${df > 0 ? 'up' : 'down'}`);
function sumText(t, df) {
  const b = bassMove(t, df);
  if (df === 0) return `In scale steps: melody ${signed(t)} on the same floor, so the bass moves ${signed(b)} with it.`;
  return `In scale steps: melody ${signed(t)}, and ${floorsWords(df)} moves the bass ${signed(-2 * df)}. Together the bass ${b === 0 ? 'stays where it is' : `moves ${signed(b)}`}.`;
}

function leapPrompt(it, m, guitar) {
  const from = say(it.scale, m.fromTop.deg);
  const to = say(it.scale, m.toTop.deg);
  const way = it.t > 0 ? 'up' : 'down';
  const lead = guitar ? `From this ${chordWord(m.from)}: the melody` : 'The melody';
  const target = chordWord(m.to);
  const still = guitar ? '' : ' A voice that does not move still needs a tap.';
  const rest = guitar ? '' : ' The bass is marked. Tap every other note of the new chord, the melody included.';
  if (Math.abs(it.t) === 1) return {
    prompt: `${lead} steps ${way} from the ${from} to the ${to}. Go ${it.df > 0 ? 'up' : 'down'} a floor, to ${article(target)} ${target}.`,
    hint: `A ${it.df > 0 ? 'bigger' : 'smaller'} floor under a ${it.t > 0 ? 'higher' : 'lower'} note, so the bass has to leap. Say which way before you move.`,
  };
  if (m.bass === 0) return {
    prompt: `${lead} leaps ${way} from the ${from} to the ${to}, the next note of the chord. Keep the bass where it is.`,
    hint: `Which floor reaches from the same bass note to the new melody note?${rest}`,
  };
  if (it.df === 0) return {
    prompt: `${lead} leaps ${way} from the ${from} to the ${to}, the next note of the chord. Take the bass with it.`,
    hint: 'Same floor, next position: every voice leaps to its next note of the chord.',
  };
  return {
    prompt: `${lead} leaps ${way} from the ${from} to the ${to}. Send the bass the other way by the same leap.`,
    hint: `Both voices leap, so skip a floor: ${it.df > 0 ? 'up' : 'down'} two.${still}`,
  };
}

// What does the bass do?
const BASS_OPTIONS = [
  { value: 'stepdown', label: 'Steps down' }, { value: 'stepup', label: 'Steps up' },
  { value: 'leapdown', label: 'Leaps down' }, { value: 'leapup', label: 'Leaps up' },
  { value: 'hold', label: 'Holds' },
];
const bassAnswer = (b) => (b === 0 ? 'hold' : `${Math.abs(b) === 1 ? 'step' : 'leap'}${b > 0 ? 'up' : 'down'}`);

function leapQuiz(it, ctx) {
  const toShape = ELEVATOR[ELEVATOR.indexOf(it.floor) + it.df];
  const b = bassMove(it.t, it.df);
  const answer = bassAnswer(b);
  const from = oneOf(it.floor);
  const to = oneOf(toShape);
  // one example to see and hear once the answer is in
  const example = [0, 4, 2, 6].map((deg) => ({ scale: 'maj6', floor: it.floor, t: it.t, df: it.df, deg })).sort(() => Math.random() - 0.5)
    .map((pick) => (leapPair(ctx.key, pick) ? moveInfo({ ...pick, kind: 'lp' }, ctx) : null)).find(Boolean)
    || moveInfo({ kind: 'lp', scale: 'maj6', floor: it.floor, t: it.t, df: it.df, deg: [0, 4, 2, 6].find((deg) => leapPair('C', { scale: 'maj6', floor: it.floor, t: it.t, df: it.df, deg })) }, { key: 'C' });
  const fb = feedback();
  const slot = h('div');
  const ch = choices(BASS_OPTIONS, (val) => {
    const ok = val === answer;
    ch.resolve(answer, val);
    slot.replaceChildren(neck({ lo: example.lo, hi: example.hi, focus: example.strings, marks: [...fromMarks({ scale: 'maj6' }, example, example.to.notes), ...example.to.notes.map((n) => mark(n, 'maj6'))] }).el);
    playMove(example);
    fb.show(ok, `The bass ${voiceWords(b)}. ${sumText(it.t, it.df)}`);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'pairs');
  return frame({
    kicker: 'Leaps · what does the bass do?',
    prompt: `The melody ${voiceWords(it.t)}. ${it.df === 0 ? `You stay on ${floorOf(it.floor).name.toLowerCase()}.` : `You go from ${article(from)} ${from} ${it.df > 0 ? 'up' : 'down'} to ${article(to)} ${to}.`}`,
    hint: 'What does the bass do? Each floor up puts it one note of the chord lower, which is two steps of the scale.',
    body: [ch.el, slot], fb: fb.el,
  });
}

// Ear: did the bass step, hold or leap?
function earBass(it, ctx) {
  const target = rand(['step', 'hold', 'leap']);
  const leaps = {
    hold: [['thirds', 2, 1], ['triads', 2, 1], ['triads', -2, -1], ['shell.low', -2, -1]],
    leap: [['triads', 1, -1], ['shell.low', 1, -1], ['thirds', -1, 1], ['triads', -1, 1], ['thirds', 2, 2], ['shell.low', -2, -2], ['triads', 2, 0], ['triads', -2, 0]],
  };
  let m = null;
  for (let tries = 0; tries < 40 && !m; tries++) {
    const deg = rand([0, 1, 2, 3, 4, 5, 6, 7]);
    let pick;
    if (target === 'step') pick = { scale: it.scale, move: rand(['par', 'con']), floor: rand(['thirds', 'triads', 'shell.low']), dir: rand([1, -1]), deg };
    else { const [floor, t, df] = rand(leaps[target]); pick = { kind: 'lp', scale: it.scale, floor, t, df, deg }; }
    if (pairOf(ctx.key, pick)) m = { ...moveInfo(pick, ctx), pick };
  }
  if (!m) { const pick = { kind: 'lp', scale: it.scale, floor: 'triads', t: 1, df: -1, deg: 0 }; m = { ...moveInfo(pick, { key: 'C' }), pick }; }
  const answer = m.bass === 0 ? 'hold' : Math.abs(m.bass) === 1 ? 'step' : 'leap';
  const outer = (c) => [c.notes[0].midi, c.notes[c.notes.length - 1].midi];
  const play = () => playMove(m);
  const playBass = () => { audio.stopAll(); audio.note(m.from.notes[0].midi, 0, 0.8); audio.note(m.to.notes[0].midi, 1.0, 0.8); };
  const playOuter = () => { audio.stopAll(); audio.chord(outer(m.from), 0, 0.02, 0.6); audio.chord(outer(m.to), 1.15, 0.02, 0.6); };
  play();
  const fb = feedback();
  const slot = h('div');
  const ch = choices([{ value: 'step', label: 'Stepped', sub: 'to the next note' }, { value: 'hold', label: 'Held', sub: 'the same note' }, { value: 'leap', label: 'Leapt', sub: 'skipped a note' }], (val) => {
    const ok = val === answer;
    ch.resolve(answer, val);
    slot.replaceChildren(neck({ lo: m.lo, hi: m.hi, focus: m.strings, marks: [...fromMarks(m.pick, m, m.to.notes), ...m.to.notes.map((n) => mark(n, it.scale))] }).el);
    playBass();
    fb.show(ok, `${cap(chordWord(m.from))} to ${chordWord(m.to)}. ${moveWords(m)}`);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'three');
  return frame({
    kicker: `Ear · ${scaleTitle(m.key, it.scale)}`,
    prompt: 'What did the bass do?',
    hint: 'Two chords. Follow the bottom note only: does it move to its neighbor, stay, or jump?',
    body: [h('div', { class: 'pills center' }, pill('Hear it again', play, 'ear'), pill('Outer voices only', playOuter)), ch.el, slot],
    fb: fb.el,
  });
}

// ---- through the mirror ----
function pivotPrompt(it, m, guitar) {
  const due = oneOfFloor(m.expected);
  const tail = `${cap(article(due))} ${due} is due. Play its reflection instead.`;
  if (it.how === 'in') return {
    prompt: `${guitar ? `From this ${chordWord(m.from)}: the melody` : 'The melody'} steps down from the ${say(it.scale, m.fromTop.deg)} to the ${say(it.scale, m.toTop.deg)}. ${tail}`,
    hint: 'Through the mirror: the same outside distance, one octave wider. The bass lands an octave below where it was heading.',
  };
  return {
    prompt: `${guitar ? `From this ${chordWord(m.from)}: the bass` : 'The bass'} steps down from the ${say(it.scale, m.from.notes[0].deg)} to the ${say(it.scale, m.to.notes[0].deg)}. ${tail}`,
    hint: 'Through the mirror: the same outside distance, one octave wider. The melody lands an octave above where it was heading.',
  };
}
// A floor as one chord of it, whichever shape: "shell", not "low shell".
const ONE = { unison: 'single note', thirds: 'third', triads: 'triad', shells: 'shell', octaves: 'octave chord', drop2: 'drop 2', drop3: 'drop 3', drop24: 'drop 2 and 4', dbl: 'double octave' };
const oneOfFloor = (shapeId) => ONE[SHAPES[shapeId].floor];
function pivotText(m) {
  const due = oneOfFloor(m.expected);
  const got = oneOfFloor(m.mirror);
  const voices = m.how === 'in'
    ? 'The melody stepped down as planned. The bass, due to step up, dropped a seventh.'
    : 'The bass stepped down as planned. The melody, due to step up, leapt a ninth.';
  return `${cap(article(due))} ${due} was due, and this is its reflection, ${article(got)} ${got}: ${floorOf(m.expected).span} between the outside notes becomes ${floorOf(m.mirror).span}. ${voices}`;
}

// Which floor is the reflection?
function mirrorQuiz(it, ctx) {
  const answer = reflectFloor(it.floor, it.wider);
  const options = (it.wider ? ['octaves', 'drop2', 'drop3', 'drop24', 'dbl'] : ['thirds', 'triads', 'shells', 'octaves', 'unison']).map((id) => FLOORS.find((f) => f.id === id));
  const here = FLOORS.find((f) => f.id === it.floor);
  const there = FLOORS.find((f) => f.id === answer);
  const [small, wide] = it.wider ? [here, there] : [there, here];
  // the two floors under one melody note, to see and hear
  const i = ELEVATOR.findIndex((id) => SHAPES[id].floor === small.id);
  const demo = [0, 4, 2, 6].sort(() => Math.random() - 0.5).map((deg) => pivotPair(ctx.key, { scale: 'maj6', floor: ELEVATOR[i + 1], how: 'in', deg })).find((p) => p && p.straight)
    || [0, 4, 2, 6].map((deg) => pivotPair('C', { scale: 'maj6', floor: ELEVATOR[i + 1], how: 'in', deg })).find((p) => p && p.straight);
  const fb = feedback();
  const slot = h('div');
  const ch = choices(options.map((f) => ({ value: f.id, label: f.name })), (val) => {
    const ok = val === answer;
    ch.resolve(answer, val);
    if (demo) {
      const win = gripFrame([...demo.straight.notes, ...demo.to.notes]);
      const shared = (n) => demo.to.notes.some((x) => x.string === n.string && x.fret === n.fret);
      slot.replaceChildren(neck({ lo: win.lo, hi: win.hi, focus: demo.to.set, marks: [...demo.straight.notes.filter((n) => !shared(n)).map((n) => ({ ...mark(n, 'maj6'), kind: 'from' })), ...demo.to.notes.map((n) => mark(n, 'maj6'))] }).el);
      audio.stopAll();
      audio.chord(demo.straight.notes.map((n) => n.midi), 0, 0.03, 0.55);
      audio.chord(demo.to.notes.map((n) => n.midi), 1.15, 0.03, 0.55);
    }
    fb.show(ok, `${small.name}: ${small.span} between the outside notes. ${wide.name}: ${wide.span}. Under one melody note${demo ? ', as shown,' : ''} the bass of the wide one is an octave lower.`);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'pairs');
  return frame({
    kicker: 'The mirror',
    prompt: `Which floor is the reflection of ${here.name.toLowerCase()}?`,
    hint: `The same outside distance, one octave ${it.wider ? 'wider' : 'narrower'}.`,
    body: [ch.el, slot], fb: fb.el,
  });
}

// Ear: did the line carry straight on, or go through the mirror?
function earPivot(it, ctx) {
  let p = null;
  let key = ctx.key;
  for (let tries = 0; tries < 40 && !p; tries++) {
    const got = pivotPair(key, { scale: it.scale, floor: rand(['shell.low', 'triads', 'oct.low']), how: 'in', deg: rand([0, 1, 2, 3, 4, 5, 6, 7]) });
    if (got && got.straight) p = got;
    else if (tries === 20) key = 'C';
  }
  const answer = rand(['straight', 'mirror']);
  const second = answer === 'straight' ? p.straight : p.to;
  const play = () => {
    audio.stopAll();
    audio.chord(p.from.notes.map((n) => n.midi), 0, 0.03, 0.55);
    audio.chord(second.notes.map((n) => n.midi), 1.15, 0.03, 0.55);
  };
  play();
  const fb = feedback();
  const slot = h('div');
  const ch = choices([
    { value: 'straight', label: 'Straight on', sub: 'the voices keep closing' },
    { value: 'mirror', label: 'Through the mirror', sub: 'the bass drops away' },
  ], (val) => {
    const ok = val === answer;
    ch.resolve(answer, val);
    const win = gripFrame([...p.from.notes, ...second.notes]);
    const strings = [...new Set([...p.from.notes, ...second.notes].map((n) => n.string))];
    const moved = (n) => !second.notes.some((x) => x.string === n.string && x.fret === n.fret);
    slot.replaceChildren(neck({ lo: win.lo, hi: win.hi, focus: strings, marks: [...p.from.notes.filter(moved).map((n) => ({ ...mark(n, it.scale), kind: 'from' })), ...second.notes.map((n) => mark(n, it.scale))] }).el);
    fb.show(ok, answer === 'straight'
      ? `Straight on: ${chordWord(p.from)} to ${oneOfFloor(p.expected)}. The melody stepped down and the bass stepped up to meet it.`
      : `Through the mirror: ${chordWord(p.from)} to ${oneOfFloor(p.mirror)}, the reflection of the ${oneOfFloor(p.expected)} that was due. The bass dropped a seventh.`);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'two');
  return frame({
    kicker: `Ear · ${scaleTitle(key, it.scale)}`,
    prompt: 'Straight on, or through the mirror?',
    hint: 'Two chords. The melody steps down both times. Listen to the bass: does it step up toward the melody, or fall away beneath it?',
    body: [again(play), ch.el, slot], fb: fb.el,
  });
}

// ---- floors within floors ----
const PART_IS = {
  thirds: 'two notes that are neighbors in the chord',
  fifth: 'the outside of a triad',
  sixth: 'the outside of a shell',
  triads: 'three neighbors in the chord',
  'shell.low': 'three notes with the gap at the top',
  'shell.high': 'three notes with the gap at the bottom',
};
function insideInfo(it, ctx) {
  const shape = SHAPES[it.shape];
  const all = voicings(ctx.key, it.scale, it.shape, shape.primary);
  const pool = all.filter((v) => v.lowFret > 0 && v.maxFret <= 13);
  const v = rand(pool.length ? pool : all);
  const answers = partsInside(it.shape, it.part);
  const part = SHAPES[it.part];
  const text = (idx) => `${cap(partWhere(v.notes.length, idx))} make ${part.a}: ${idx.map((i) => say(it.scale, v.notes[i].deg)).join(', ')}.`;
  const sound = (idx) => {
    audio.stopAll();
    audio.chord(v.notes.map((n) => n.midi), 0, 0.03, 0.5);
    audio.chord(idx.map((i) => v.notes[i].midi), 1.15, 0.03, 0.6);
  };
  // the part stands out, the rest of the chord fades
  const shown = (idx) => v.notes.map((n, i) => (idx.includes(i) ? { ...mark(n, it.scale), kind: `${kc(n.deg)} anchor` } : { ...mark(n, it.scale), kind: 'from' }));
  return { v, shape, part, answers, text, sound, shown, win: gripFrame(v.notes), whole: oneOf(it.shape), name: part.name.toLowerCase() };
}

function insideTap(it, ctx) {
  const m = insideInfo(it, ctx);
  const { v, part } = m;
  const picked = new Set();
  let done = false;
  const fb = feedback();
  const draw = () => board.draw(v.notes.map((n, i) => (picked.has(i) ? { string: n.string, fret: n.fret, kind: 'pick', label: lab(it.scale, n.deg) } : mark(n, it.scale))));
  const board = neck({
    lo: m.win.lo, hi: m.win.hi, focus: v.set, marks: v.notes.map((n) => mark(n, it.scale)),
    onTap: (string, fret) => {
      if (done) return;
      const i = v.notes.findIndex((n) => n.string === string && n.fret === fret);
      if (i < 0) return;
      if (picked.has(i)) picked.delete(i); else picked.add(i);
      audio.note(v.notes[i].midi, 0, 0.5, 1.2);
      draw();
    },
  });
  setTimeout(() => { audio.stopAll(); audio.chord(v.notes.map((n) => n.midi), 0, 0.03, 0.55); }, 250);
  const check = () => {
    const want = part.steps.length;
    if (picked.size !== want) { fb.show(null, `${cap(part.a)} is ${want === 2 ? 'two' : 'three'} notes. Tap ${want === 2 ? 'two' : 'three'} notes of the chord.`); return; }
    done = true;
    const mine = [...picked].sort((a, b) => a - b);
    const hit = m.answers.find((idx) => idx.join() === mine.join());
    const idx = hit || m.answers[0];
    board.draw(m.shown(idx));
    m.sound(idx);
    const more = m.answers.length > 1 ? ` So do ${m.answers.filter((a) => a !== idx).map((a) => partWhere(v.notes.length, a)).join(', and ')}.` : '';
    fb.show(!!hit, `${m.text(idx)}${more}`);
    ctx.finish(hit ? 'right' : 'wrong', hit ? 'auto' : 'tap');
  };
  ctx.foot(h('button', { class: 'primary wide', onclick: check }, 'Check'));
  return frame({
    kicker: `Floors within floors · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: `Find ${part.a} inside this ${m.whole}.`,
    hint: `Tap the notes that make it. ${cap(part.a)} is ${PART_IS[it.part]}.`,
    body: board.el, fb: fb.el,
  });
}

function insideGuitar(it, ctx) {
  const m = insideInfo(it, ctx);
  const { v } = m;
  const board = neck({ lo: m.win.lo, hi: m.win.hi, focus: v.set, marks: v.notes.map((n) => mark(n, it.scale)) });
  const fb = feedback();
  revealThenRate(ctx, () => { board.draw(m.shown(m.answers[0])); m.sound(m.answers[0]); return m.text(m.answers[0]); }, fb);
  return frame({
    kicker: `Floors within floors · ${scaleTitle(ctx.key, it.scale)}`,
    prompt: `Play this ${m.whole}. Then play only the ${m.name} inside it.`,
    hint: `Keep the whole chord under your fingers and sound just those notes. ${cap(m.part.a)} is ${PART_IS[it.part]}.`,
    body: board.el, fb: fb.el,
  });
}

// ---- substitution: the diminished is the center ----
const OFF_LABEL = { 11: '7', 2: '2', 5: '4', 8: '♯5' };
const centerMarks = (hb, faded = []) => hb.center.notes.map((n, i) => ({ string: n.string, fret: n.fret, kind: faded.includes(i) ? 'from' : 'off', label: lab('maj6', n.deg) }));
const postMarks = (hb, kind = 'on') => hb.to.notes.map((n, i) => ({ string: n.string, fret: n.fret, kind: hb.moved.includes(i) && kind === 'on' ? 'on anchor' : kind, label: lab(hb.to.chord.scale, n.deg) }));
const hubFrame = (hb) => gripFrame([...hb.center.notes, ...hb.to.notes, ...(hb.home ? hb.home.notes : [])]);
// The off chord, the chord it turns into, then home.
function playHub(hb) {
  audio.stopAll();
  strum(hb.center);
  audio.chord(hb.to.notes.map((n) => n.midi), 1.1, 0.03, 0.55);
  if (hb.home) strum(hb.home, 2.3);
}
const hubText = (hb) => postStory(hb.post);

// Which note of the off chord moves?
function hubQuiz(it, ctx) {
  const tonic = keyOf(ctx.key).pc;
  const hb = hubPair(tonic, it.post, rand([0, 1, 2, 3]));
  const { post } = hb;
  const answer = POSTS[it.post].moves[0][0];
  const up = POSTS[it.post].moves[0][1] > 0;
  const fb = feedback();
  const slot = h('div');
  const ch = choices([11, 2, 5, 8].map((semis) => ({ value: semis, label: OFF_LABEL[semis], sub: say('maj6', { 11: 7, 2: 1, 5: 3, 8: 5 }[semis]) })), (val) => {
    const ok = val === answer;
    ch.resolve(answer, val);
    const win = hubFrame(hb);
    slot.replaceChildren(neck({ lo: win.lo, hi: win.hi, focus: SET52, marks: [...centerMarks(hb).filter((_, i) => hb.moved.includes(i)).map((m) => ({ ...m, kind: 'from' })), ...postMarks(hb)] }).el);
    playHub(hb);
    fb.show(ok, hubText(hb));
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'grid');
  return frame({
    kicker: `Substitution · going to ${ctx.key}`,
    prompt: ['The off chord is ', sym(post.center), `. Which note ${up ? 'rises' : 'falls'} a fret to make ${postPhrase(post)}?`],
    hint: 'A raised note gives a minor 6 chord. A lowered note gives a dominant 7.',
    body: [ch.el, slot], fb: fb.el,
  });
}

// Make the move on the neck.
function hubInfo(it, ctx) {
  const tonic = keyOf(ctx.key).pc;
  const hb = hubPair(tonic, it.post, it.pos);
  const count = hb.moved.length;
  return { hb, post: hb.post, count, win: hubFrame(hb), ask: ['Make ', postPhrase(hb.post), count > 1 ? `, ${hb.post.label}` : '', '.'] };
}

function hubTap(it, ctx) {
  const { hb, post, count, win, ask } = hubInfo(it, ctx);
  const picks = [];
  let done = false;
  const fb = feedback();
  const board = neck({
    lo: win.lo, hi: win.hi, focus: SET52, marks: centerMarks(hb),
    onTap: (string, fret) => {
      if (done) return;
      const i = hb.center.notes.findIndex((n) => n.string === string);
      if (i < 0 || hb.center.notes[i].fret === fret || picks.some((p) => p.string === string)) return;
      picks.push({ string, fret, i });
      audio.note(OPEN[string] + fret, 0, 0.5, 1.2);
      if (picks.length < count) {
        board.draw([...centerMarks(hb, picks.map((p) => p.i)), ...picks.map((p) => ({ string: p.string, fret: p.fret, kind: 'pick', label: '' }))]);
        return;
      }
      done = true;
      const ok = picks.every((p) => hb.moved.includes(p.i) && hb.to.notes[p.i].fret === p.fret);
      const marks = [...centerMarks(hb).filter((_, k) => hb.moved.includes(k)).map((m) => ({ ...m, kind: 'from' })), ...postMarks(hb).map((m, k) => (!ok && hb.moved.includes(k) ? { ...m, kind: 'ghost' } : m))];
      if (!ok) for (const p of picks) if (!(hb.moved.includes(p.i) && hb.to.notes[p.i].fret === p.fret)) marks.push({ string: p.string, fret: p.fret, kind: 'wrong', label: '' });
      board.draw(marks);
      playHub(hb);
      fb.show(ok, hubText(hb));
      ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
    },
  });
  setTimeout(() => { audio.stopAll(); strum(hb.center); }, 250);
  return frame({
    kicker: `Substitution · going to ${hb.key}`,
    prompt: ask,
    hint: [`${ctx.note ? `${ctx.note} ` : ''}This is `, sym(post.center), `, the off chord of ${hb.key}. ${count === 1 ? 'One note moves one fret. Tap where it goes.' : 'Two notes move one fret each. Tap where they go.'}`],
    body: [board.el, h('div', { class: 'pills center' }, pill('Hear the off chord', () => { audio.stopAll(); strum(hb.center); }, 'play'))],
    fb: fb.el,
  });
}

function hubGuitar(it, ctx) {
  const { hb, post, count, win, ask } = hubInfo(it, ctx);
  const board = neck({ lo: win.lo, hi: win.hi, focus: SET52, marks: centerMarks(hb) });
  const fb = feedback();
  revealThenRate(ctx, () => {
    board.draw([...centerMarks(hb).filter((_, k) => hb.moved.includes(k)).map((m) => ({ ...m, kind: 'from' })), ...postMarks(hb)]);
    playHub(hb);
    return hubText(hb);
  }, fb);
  return frame({
    kicker: `Substitution · going to ${hb.key}`,
    prompt: ['Play ', sym(post.center), '. ', ...ask],
    hint: `${ctx.note ? `${ctx.note} ` : ''}It is the off chord of ${hb.key}. Move ${count === 1 ? 'one finger' : 'two fingers'} one fret, say which note of the off chord you moved, then resolve to ${hb.key}6.`,
    body: board.el, fb: fb.el,
  });
}

// One chord, many jobs.
const JOB_WHY = {
  'maj6|m7': (x, y, n) => `${x} and ${y} are the same four notes: ${n}.`,
  'maj6|on5': (x, y) => `${x} is built on the fifth of ${y}. Over that chord it gives a major 9 sound.`,
  'min6|hdim': (x, y, n) => `${x} and ${y} are the same four notes: ${n}.`,
  'min6|on5': (x, y) => `${x} is built on the fifth of ${y}. Over that dominant it is a 9 chord without its root.`,
  'min6|tm': (x, y) => `${x} sits a half step above the root of ${y}. It is the minor 6 on the 5 of that chord’s tritone substitute.`,
  'min6|iv': (x, y, n, c) => `${x} is built on the fourth of ${scaleKey(c.root + 7)}. Going to ${y}, it is the minor iv on its way home.`,
  'dom7|tt': (x, y) => `${x} and ${y} are a tritone apart, and they share the same third and seventh.`,
  'dom7|bd': (x, y, n, c) => `${x} resolving up a whole step to ${y} stands for the minor iv. Play it as ${nameOf(chordOf(c.root + 7, 'min6'))}, its minor 6 on the 5.`,
};
function jobInfo(it, ctx) {
  const c = chordOf(keyOf(ctx.key).pc, it.scale);
  const job = jobById(it.scale, it.job);
  const label = (root) => `${scaleKey(root)}${job.symbol === 'maj7' ? '' : job.symbol}`;
  const answer = mod(c.root + job.to, 12);
  const all = voicings(scaleKey(c.root), c.scale, 'drop2', SET52).filter((v) => v.on && v.lowFret > 0 && v.maxFret <= 14);
  const v = all.find((x) => x.bottomDeg === 0) || all[0];
  const notes = scaleNotes(scaleKey(c.root), c.scale).filter((n) => n.on).map((n) => n.name).join(', ');
  // where it goes next, when the job is to lead somewhere
  const home = { on5: c.root + 10, tm: c.root + 4, iv: c.root + 7, bd: c.root + 2, tt: c.root + 11 }[it.scale === 'maj6' ? '' : it.job];
  const target = home == null ? null : voicings(scaleKey(home), 'maj6', 'drop2', SET52).filter((x) => x.on && x.lowFret > 0)
    .sort((a, b) => Math.abs(a.notes[0].fret - v.notes[0].fret) - Math.abs(b.notes[0].fret - v.notes[0].fret))[0];
  const sound = () => { audio.stopAll(); strum(v); if (target) strum(target, 1.2); };
  const why = `${JOB_WHY[`${it.scale}|${it.job}`](nameOf(c), label(answer), notes, c)}${target ? ` You hear it go on to ${scaleKey(home)}6.` : ''}`;
  return { c, job, label, answer, v, win: gripFrame(v.notes), sound, why, name: nameOf(c) };
}

function jobsQuiz(it, ctx) {
  const m = jobInfo(it, ctx);
  // wrong answers: the roots the other jobs would give, then other likely ones
  const others = [9, 5, 11, 7, 6, 2, 3, 10, 1, 8, 4].filter((x) => x !== m.job.to).map((x) => mod(m.c.root + x, 12));
  const options = [m.answer, ...others.slice(0, 3)].sort(() => Math.random() - 0.5);
  const fb = feedback();
  const slot = h('div');
  const ch = choices(options.map((root) => ({ value: root, label: m.label(root) })), (val) => {
    const ok = val === m.answer;
    ch.resolve(m.answer, val);
    slot.replaceChildren(neck({ lo: m.win.lo, hi: m.win.hi, focus: SET52, marks: roleMarks(m.v, it.scale) }).el);
    m.sound();
    fb.show(ok, m.why);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'two');
  return frame({
    kicker: 'One chord, many jobs',
    prompt: [sym(m.name), ` ${m.job.ask}`],
    hint: 'One shape, several uses. Which chord is it serving here?',
    body: [ch.el, slot], fb: fb.el,
  });
}

function jobsGuitar(it, ctx) {
  const m = jobInfo(it, ctx);
  const board = neck({ lo: m.win.lo, hi: m.win.hi, focus: SET52, marks: roleMarks(m.v, it.scale) });
  const fb = feedback();
  revealThenRate(ctx, () => { m.sound(); return `${m.label(m.answer)}. ${m.why}`; }, fb);
  return frame({
    kicker: 'One chord, many jobs',
    prompt: ['Play ', sym(m.name), `. It ${m.job.ask}`],
    hint: 'Say your answer aloud before you check. If the chord leads somewhere, play where it goes.',
    body: board.el, fb: fb.el,
  });
}

// Ear: three ways home from the same starting chord.
function earRoad(it, ctx) {
  const tonic = keyOf(ctx.key).pc;
  const answer = rand(['major-on5', 'minor-iv', 'major-tm']);
  const steps = chainIn(answer, tonic, rand([0, 1, 2, 3]));
  const play = () => { audio.stopAll(); steps.forEach((st, k) => strum(st.voicing, k * 1.25)); };
  play();
  const fb = feedback();
  const slot = h('div');
  const ch = choices([
    { value: 'major-on5', label: 'Minor 6 on the 5', sub: 'inside the key' },
    { value: 'minor-iv', label: 'Minor iv', sub: 'the first chord turns minor' },
    { value: 'major-tm', label: 'Tritone’s minor', sub: 'outside the key' },
  ], (val) => {
    const ok = val === answer;
    ch.resolve(answer, val);
    const mid = steps[1];
    const win = gripFrame(steps.flatMap((st) => st.voicing.notes));
    slot.replaceChildren(neck({ lo: win.lo, hi: win.hi, focus: SET52, marks: roleMarks(mid.voicing, mid.chord.scale) }).el);
    const names = steps.map((st) => chordLabel(st.chord)).join(', ');
    fb.show(ok, {
      'major-on5': `Minor 6 on the 5: ${names}. Every note of the middle chord belongs to the key.`,
      'minor-iv': `Minor iv: ${names}. The first chord keeps its root and its third drops a fret.`,
      'major-tm': `Tritone’s minor: ${names}. The middle chord has two notes from outside the key.`,
    }[answer]);
    ctx.finish(ok ? 'right' : 'wrong', ok ? 'auto' : 'tap');
  }, 'stack');
  return frame({
    kicker: `Ear · going home to ${ctx.key}`,
    prompt: 'Which road home was that?',
    hint: 'Three chords. The first and last are always the same. Listen to the one in the middle.',
    body: [again(play), ch.el, slot], fb: fb.el,
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
    case 'sc': return g ? scaleGuitar(it, ctx) : scaleChoice(it, ctx);
    case 'bw': return g ? borrowGuitar(it, ctx) : borrowTap(it, ctx);
    case 'bm': return g ? underGuitar(it, ctx) : underTap(it, ctx);
    case 'eb': return earBorrow(it, ctx);
    case 'tb': return g ? bassGuitar(it, ctx) : bassQuiz(it, ctx);
    case 'tw': return g ? circleGuitar(it, ctx) : circleQuiz(it, ctx);
    case 'tf': return formulaQuiz(it, ctx);
    case 'tx': return g ? transformGuitar(it, ctx) : transformTap(it, ctx);
    case 'et': return earResolution(it, ctx);
    case 'fw': return g ? insideGuitar(it, ctx) : insideTap(it, ctx);
    case 'lq': return leapQuiz(it, ctx);
    case 'lp': return g ? moveGuitar(it, ctx) : moveTap(it, ctx);
    case 'ej': return earBass(it, ctx);
    case 'pm': return mirrorQuiz(it, ctx);
    case 'pv': return g ? moveGuitar(it, ctx) : moveTap(it, ctx);
    case 'ep': return earPivot(it, ctx);
    case 'hq': return hubQuiz(it, ctx);
    case 'hp': return g ? hubGuitar(it, ctx) : hubTap(it, ctx);
    case 'su': return g ? jobsGuitar(it, ctx) : jobsQuiz(it, ctx);
    case 'eh': return earRoad(it, ctx);
    default: return h('div', null, 'Unknown exercise');
  }
}
