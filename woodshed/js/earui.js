// earui.js — the Ear tab: the shelf of games, a page per game, and the player that runs
// a round. The games themselves (what to play, what is right) are in ear.js.
//
// Rounds keep their own scores (see the `ear` part of store.js). They never grade the
// ladder's practice items, so nothing here changes what a daily session asks for. Each
// answer does count as practice for the day.

import { h, icon, cap, segmented } from './dom.js';
import { neck } from './neck.js';
import * as audio from './audio.js';
import { state, save, setSetting, earRecord, recordRound, recordAnswer, logPractice } from './store.js';
import { SCALES } from './theory.js';
import { GAMES, SHELVES, gameById, makeRound, makeQuick, passMark, passed, suggested, weakest, statLabel } from './ear.js';
import { frame, feedback, choices } from './drills.js';
import { pill } from './widgets.js';

let hooks = { route: () => {} };
export const attachEar = (x) => { hooks = x; };
const sessionRoot = document.getElementById('session');
const kc = (deg) => (deg % 2 === 0 ? 'on' : 'off');

function play(events) {
  audio.stopAll();
  for (const ev of events) {
    if (ev.solo) audio.note(ev.midis[0], ev.at, ev.gain, ev.dur);
    else audio.chord(ev.midis, ev.at, ev.strum, ev.gain);
  }
}
const lengthOf = (events) => Math.max(...events.map((ev) => ev.at)) + 0.9;
const records = () => Object.fromEntries(GAMES.map((g) => [g.id, earRecord(g.id)]));

// ---------- the Ear page ----------
export function pageEar() {
  const recs = records();
  const weak = weakest(state.ear.stats);
  const row = (g) => {
    const rec = recs[g.id];
    const next = suggested(g, rec);
    const done = g.levels.filter((_, k) => passed(g, rec, k)).length;
    const where = g.free ? `${g.levels.length} textures` : done === g.levels.length ? 'Every level passed' : `Level ${next + 1} of ${g.levels.length}`;
    return h('div', { class: 'rung ear-row' },
      h('a', { class: 'rung-text', href: `#/ear/${g.id}` },
        h('strong', null, g.title), h('span', { class: 'muted' }, g.blurb), h('span', { class: 'ear-level' }, where)),
      h('button', { class: 'round', 'aria-label': `Play ${g.title}`, onclick: () => startRound(g.id, next) }, icon('play', 18)));
  };
  return [
    h('div', { class: 'page-head' }, h('p', { class: 'eyebrow' }, 'Listen, echo, make'), h('h1', null, 'Ear')),
    segmented([['guitar', 'Guitar in hand', 'guitar'], ['away', 'Away', 'phone']], state.settings.mode, (m) => { setSetting('mode', m); hooks.route(); }, 'mode'),
    h('section', { class: 'card session-card' },
      h('div', { class: 'session-meta' }, h('strong', null, 'Quick round'), ' · about 2 minutes'),
      h('p', { class: 'muted' }, 'Ten questions mixed from the listening games, each at the level you have reached.'),
      h('button', { class: 'primary wide', onclick: startQuick }, 'Start')),
    SHELVES.map((s) => h('section', { class: 'ladder' },
      h('h2', { class: 'group' }, s.title, h('span', { class: 'group-note' }, s.blurb)),
      GAMES.filter((g) => g.shelf === s.id).map(row))),
    weak.length ? h('section', { class: 'card' },
      h('h2', { class: 'card-title' }, 'Worth another listen'),
      h('ul', { class: 'weak' }, weak.map((w) => h('li', null,
        h('a', { href: `#/ear/${w.game.id}` }, cap(w.label)),
        h('span', { class: 'muted' }, ` · missed ${w.missed} of the last ${w.asked} in ${w.game.title}`)))),
      h('p', { class: 'muted small' }, 'Rounds lean toward what you miss, so these come up more often for a while.')) : null,
    h('p', { class: 'muted small' }, 'Nothing here changes what your daily session asks for. Every answer counts toward your streak.'),
  ];
}

export function pageEarGame(id) {
  const g = gameById(id);
  if (!g) return pageEar();
  const rec = earRecord(id);
  const next = suggested(g, rec);
  const shelf = SHELVES.find((s) => s.id === g.shelf);
  return [
    h('a', { class: 'back', href: '#/ear' }, icon('back', 18), 'Ear'),
    h('div', { class: 'page-head' }, h('p', { class: 'eyebrow' }, `${shelf.title} · ${shelf.blurb}`), h('h1', null, g.title)),
    h('p', { class: 'lede' }, g.tip),
    h('p', { class: 'muted small' }, g.free
      ? `A round is ${g.count} turns. Nothing is scored.`
      : `A round is ${g.count} questions, and ${passMark(g)} right passes a level. Every level is open, so start wherever you like.`),
    h('section', { class: 'levels' }, g.levels.map((lv, k) => {
      const ok = passed(g, rec, k);
      const best = rec.best[k];
      return h('button', { class: 'level' + (ok ? ' passed' : '') + (k === next && !g.free ? ' next' : ''), onclick: () => startRound(id, k) },
        h('span', { class: 'level-n' }, ok ? icon('check', 14) : String(k + 1)),
        h('span', { class: 'level-text' },
          h('strong', null, lv.name),
          g.free ? null : h('span', { class: 'muted' }, best != null ? `Best ${best} of ${g.count}` : k === next ? 'Start here' : 'Not played yet')),
        icon('play', 18));
    })),
  ];
}

const startRound = (id, level) => run(makeRound(id, level, { stats: state.ear.stats }), () => startRound(id, level));
const startQuick = () => run(makeQuick(records(), { stats: state.ear.stats }), startQuick);

// ---------- the kinds of question ----------
// Each takes the question and a small toolkit, and returns the page for it.
//   kit.finish(ok)        the question is answered (once); shows Next, moves on by itself if right
//   kit.foot(node)        put something in the bar at the bottom
//   kit.later(fn, ms)     a timer that is cancelled when the question goes away
//   kit.next()            move on now
const hearAgain = (q, more = []) => h('div', { class: 'pills center' },
  pill('Hear it again', () => play(q.sound), 'ear'), ...(q.again || []).map((a) => pill(a.label, () => play(a.sound))), ...more);

function choiceForm(q, kit) {
  play(q.sound);
  const fb = feedback();
  const slot = h('div');
  const bar = q.seconds ? h('div', { class: 'clock' }, h('i')) : null;
  let answered = false;
  const settle = (val) => {
    if (answered) return;
    answered = true;
    const ok = val === q.answer;
    ch.resolve(q.answer, val);
    if (bar) bar.classList.add('stopped');
    const n = q.reveal.neck;
    slot.replaceChildren(neck({ lo: n.lo, hi: n.hi, focus: n.focus, marks: n.marks }).el);
    fb.show(ok, val == null ? `Out of time. ${q.reveal.text}` : q.reveal.text);
    if (!ok) play(q.sound);     // hear it once more, now knowing what it is
    kit.finish(ok);
  };
  const ch = choices(q.choices, settle, q.layout);
  if (bar) {
    // the clock starts once the sound has been heard
    const lead = lengthOf(q.sound) * 1000;
    kit.later(() => { const i = bar.firstChild; i.style.transitionDuration = `${q.seconds}s`; i.style.width = '0%'; }, lead);
    kit.later(() => settle(null), lead + q.seconds * 1000);
  }
  return frame({ kicker: q.kicker, prompt: q.prompt, hint: q.hint, body: [hearAgain(q), bar, ch.el, slot], fb: fb.el });
}

// Echo: tap the phrase back, one note at a time.
function tapForm(q, kit) {
  if (kit.mode === 'guitar') return echoGuitar(q, kit);
  play(q.sound);
  const fb = feedback();
  let at = q.shown;       // which note of the phrase is wanted next
  let clean = true;
  let extra = [];
  const placed = () => q.notes.slice(0, at).map((n, k) => ({ string: n.string, fret: n.fret, kind: kc(n.deg) + (k === at - 1 ? ' anchor' : ''), label: SAY_LABEL(q, n) }));
  const draw = () => board.draw([...(q.landmark && at === 0 ? [q.landmark] : q.landmark ? [{ ...q.landmark, kind: 'from' }] : []), ...placed(), ...extra]);
  const board = neck({
    lo: q.lo, hi: q.hi, focus: [q.string], marks: [],
    onTap: (string, fret) => {
      if (at >= q.notes.length || string !== q.string) return;
      const want = q.notes[at];
      if (at > 0 && fret === q.notes[at - 1].fret && fret !== want.fret) return;   // a second touch on the note just placed
      if (fret === want.fret) {
        at += 1; extra = [];
        audio.note(want.midi, 0, 0.8, 1.6);
        draw();
        if (at === q.notes.length) {
          fb.show(clean, clean ? q.reveal.text : `${q.reveal.text} Listen to it once more.`);
          kit.later(() => play(q.phrase), 500);
          kit.finish(clean);
        } else if (clean) fb.show(true, `${at} of ${q.notes.length}.`);
        return;
      }
      // a miss: the note wanted is shown, and has to be tapped to carry on
      clean = false;
      extra = [{ string, fret, kind: 'wrong', label: '' }, { string: want.string, fret: want.fret, kind: 'ghost', label: SAY_LABEL(q, want) }];
      audio.note(want.midi, 0, 0.8, 1.6);
      draw();
      fb.show(false, 'Not that one. The note is shown now: tap it to carry on.');
    },
  });
  draw();
  return frame({
    kicker: q.kicker, prompt: q.prompt, hint: q.hint,
    body: [hearAgain(q, [pill('Phrase only', () => play(q.phrase))]), board.el], fb: fb.el,
  });
}
const SAY_LABEL = (q, n) => SCALES[q.scale].labels[n.deg];

function echoGuitar(q, kit) {
  play(q.sound);
  const fb = feedback();
  const first = q.shown ? [{ string: q.notes[0].string, fret: q.notes[0].fret, kind: `${kc(q.notes[0].deg)} anchor`, label: SAY_LABEL(q, q.notes[0]) }] : [q.landmark];
  const board = neck({ lo: q.lo, hi: q.hi, focus: [q.string], marks: first });
  kit.foot(h('button', { class: 'primary wide', onclick: () => {
    board.draw([...(q.landmark ? [{ ...q.landmark, kind: 'from' }] : []), ...q.notes.map((n) => ({ string: n.string, fret: n.fret, kind: kc(n.deg), label: SAY_LABEL(q, n) }))]);
    play(q.phrase);
    fb.show(null, q.reveal.text);
    kit.rate([['Missed', false], ['Got it', true]]);
  } }, 'Check'));
  return frame({
    kicker: q.kicker, prompt: q.prompt, hint: q.guitarHint,
    body: [hearAgain(q, [pill('Phrase only', () => play(q.phrase))]), board.el], fb: fb.el,
  });
}

// Sing it first: you mark yourself.
function selfForm(q, kit) {
  play(q.sound);
  const fb = feedback();
  kit.foot(h('button', { class: 'primary wide', onclick: () => {
    play(q.check);
    fb.show(null, q.reveal.text);
    kit.rate([['Missed', false], ['Close', false], ['Had it', true]]);
  } }, 'Check'));
  return frame({
    kicker: q.kicker, prompt: q.prompt, hint: q.hint,
    body: h('div', { class: 'pills center' }, pill('Hear the chord', () => play(q.sound), 'play')), fb: fb.el,
  });
}

// Resolve it: every choice is a good one. The first one you make is the one remembered.
function freeForm(q, kit) {
  play(q.sound);
  const fb = feedback();
  const slot = h('div');
  const show = (n) => slot.replaceChildren(neck({ lo: n.lo, hi: n.hi, focus: n.focus, marks: n.marks }).el);
  show(q.neck);
  const buttons = q.options.map((o) => {
    const b = h('button', { class: 'choice', onclick: () => {
      for (const x of buttons) x.classList.toggle('picked', x === b);
      play(o.sound);
      show(o.neck);
      fb.show(null, o.text);
      kit.landed(o);
      kit.finish(true, false);
    } }, h('span', { class: 'choice-main' }, o.label), o.sub ? h('span', { class: 'choice-sub' }, o.sub) : null);
    return b;
  });
  const again = () => { for (const x of buttons) x.classList.remove('picked'); show(q.neck); play(q.sound); };
  return frame({
    kicker: q.kicker, prompt: q.prompt, hint: q.hint,
    body: [h('div', { class: 'pills center' }, pill('Hear it again', again, 'ear')), slot, h('div', { class: 'choices pairs free' }, buttons)],
    fb: fb.el,
  });
}

const FORMS = { choice: choiceForm, tap: tapForm, self: selfForm, free: freeForm };

// ---------- the round player ----------
function run(round, replay) {
  audio.unlock();
  const mode = state.settings.mode;
  const qs = round.questions;
  const game = round.game;
  let i = 0;
  let right = 0;
  let timers = [];
  const missed = [];
  const landings = [];
  const clear = () => { timers.forEach(clearTimeout); timers = []; };

  const fill = h('i');
  const count = h('span', { class: 'count' });
  const body = h('div', { class: 'session-body' });
  const foot = h('div', { class: 'session-foot' });
  const close = () => {
    clear();
    audio.stopAll();
    document.removeEventListener('keydown', onKey);
    sessionRoot.hidden = true;
    document.body.classList.remove('in-session');
    save();   // lets sync know there is something new
    hooks.route();
  };
  const onKey = (ev) => {
    if (ev.key === 'Escape') close();
    if (ev.key === 'Enter') { const b = foot.querySelector('.primary'); if (b) { ev.preventDefault(); b.click(); } }
  };
  document.addEventListener('keydown', onKey);
  sessionRoot.replaceChildren(
    h('div', { class: 'session-top' },
      h('button', { class: 'round', 'aria-label': 'End round', onclick: close }, icon('close', 20)),
      h('div', { class: 'meter slim' }, fill), count),
    h('div', { class: 'session-tag' }, game ? `${game.title} · ${game.free ? game.levels[round.level].name.toLowerCase() : `level ${round.level + 1}`}` : round.title),
    body, foot);
  sessionRoot.hidden = false;
  document.body.classList.add('in-session');

  const next = () => { clear(); i += 1; show(); };
  const nextButton = () => h('button', { class: 'primary wide', onclick: next }, i + 1 >= qs.length ? 'Finish' : 'Next');

  function show() {
    clear();
    if (i >= qs.length) return summary();
    const q = qs[i];
    const started = Date.now();
    let done = false;
    fill.style.width = `${(i / qs.length) * 100}%`;
    count.textContent = `${i + 1} of ${qs.length}`;
    foot.replaceChildren();
    const kit = {
      mode,
      later: (fn, ms) => { timers.push(setTimeout(fn, ms)); },
      foot: (node) => foot.replaceChildren(...(node ? [node] : [])),
      next,
      landed: (o) => { if (!done) landings.push(o); },
      finish(ok, auto = true) {
        if (done) return;
        done = true;
        recordAnswer(q.stat, ok);
        logPractice(ok, (Date.now() - started) / 1000);
        if (ok) right += 1; else missed.push(q);
        foot.replaceChildren(nextButton());
        if (auto && ok) timers.push(setTimeout(next, 1500));
      },
      // you say how it went, and the round moves on
      rate(options) {
        foot.replaceChildren(h('div', { class: `rate n${options.length}` }, options.map(([label, ok], k) =>
          h('button', { class: `rate-btn ${ok ? 'ok' : k === 0 ? 'no' : 'mid'}`, onclick: () => { kit.finish(ok, false); next(); } }, label))));
      },
    };
    body.replaceChildren(FORMS[q.form](q, kit));
    body.scrollTop = 0;
  }

  function summary() {
    clear();
    audio.stopAll();
    fill.style.width = '100%';
    count.textContent = '';
    const n = qs.length;
    const end = (main, mainLabel) => foot.replaceChildren(h('div', { class: 'foot-row' },
      h('button', { class: 'pill', onclick: close }, 'Done'),
      h('button', { class: 'primary', onclick: () => { close(); main(); } }, mainLabel)));
    const tally = (list) => { const m = new Map(); for (const x of list) m.set(x, (m.get(x) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
    const times = (k) => (k === 1 ? 'once' : k === 2 ? 'twice' : `${k} times`);

    if (game && game.free) {
      const notes = tally(landings.map((o) => SCALES.maj6.say[o.landed]));
      const ways = tally(landings.map((o) => o.label.toLowerCase()));
      body.replaceChildren(h('div', { class: 'drill summary' },
        h('div', { class: 'kicker' }, 'Round done'),
        h('h2', { class: 'prompt' }, `${landings.length} ${landings.length === 1 ? 'landing' : 'landings'}`),
        landings.length ? h('p', { class: 'hint' }, `Your first choices landed on the ${notes.map(([name, k]) => `${name} ${times(k)}`).join(', the ')}.`) : null,
        landings.length ? h('p', { class: 'hint' }, `You chose ${ways.map(([name, k]) => `${name} ${times(k)}`).join(', ')}. Next time, try the one you chose least.`) : null));
      return end(replay, 'Again');
    }

    const mark = game ? passMark(game) : 0;
    const better = game ? recordRound(game.id, round.level, right) : false;
    const pass = game && right >= mark;
    const more = game && round.level + 1 < game.levels.length;
    const best = game ? earRecord(game.id).best[round.level] : 0;
    const missedNames = [...new Set(missed.filter((q) => q.stat).map((q) => statLabel(q.stat)))];
    const line = !game ? 'A quick round does not change your levels. It does feed what later rounds lean on.'
      : pass && more ? `Level ${round.level + 1} passed. Next is level ${round.level + 2}: ${game.levels[round.level + 1].name.toLowerCase()}.`
      : pass ? `Level ${round.level + 1} passed. That is the top level of this game.`
      : `${mark} right passes this level.`;
    body.replaceChildren(h('div', { class: 'drill summary' },
      h('div', { class: 'kicker' }, 'Round done'),
      h('h2', { class: 'prompt' }, `${right} of ${n} right`),
      h('p', { class: 'hint' }, line),
      game ? h('div', { class: 'tiles' },
        h('div', { class: 'tile' }, h('b', null, right), h('span', null, 'this round')),
        h('div', { class: 'tile' }, h('b', null, best), h('span', null, better ? 'a new best' : 'your best')),
        h('div', { class: 'tile' }, h('b', null, mark), h('span', null, 'to pass'))) : null,
      missedNames.length ? h('p', { class: 'hint' }, `Missed: ${missedNames.join(', ')}.`) : h('p', { class: 'hint' }, 'Nothing missed.')));
    if (!game) return end(replay, 'Another round');
    if (pass && more) return end(() => startRound(game.id, round.level + 1), 'Next level');
    return end(replay, 'Play again');
  }

  show();
}
