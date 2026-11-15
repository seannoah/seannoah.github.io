// app.js — the four pages (Today, Learn, Explore, Progress) and the session runner.

import { h, icon } from './dom.js';
import * as audio from './audio.js';
import { state, save, setSetting, markUnit, grade, streak, dayTotal, dayKey, isNew, isLearned, resetAll } from './store.js';
import {
  UNITS, PLANNED, unitById, unitProgress, unitComplete, isActive, currentUnit, unreadLesson,
  buildSession, summarize, keyFor, SECTION_NAME, catalogue, floorOfItem,
} from './curriculum.js';
import { mountDrill } from './drills.js';
import { lessonFor } from './lessons.js';
import { shapeBrowser, scaleStrip } from './widgets.js';
import { KEYS, SCALES, SCALE_ORDER } from './theory.js';
import { FLOORS, SHAPES, setLabel } from './floors.js';
import * as sync from './sync.js';

const VERSION = '0.1.0';
const view = document.getElementById('view');
const sessionRoot = document.getElementById('session');
const TABS = [['today', 'Today'], ['learn', 'Learn'], ['explore', 'Explore'], ['progress', 'Progress']];

// ---------- small shared pieces ----------
const progressBar = (ratio, cls = '') => h('div', { class: 'meter ' + cls }, h('i', { style: `width:${Math.round(Math.min(1, ratio) * 100)}%` }));

function segmented(options, value, onPick, cls = '') {
  return h('div', { class: 'seg ' + cls, role: 'group' }, options.map(([val, label, ic]) =>
    h('button', { class: val === value ? 'sel' : '', 'aria-pressed': val === value ? 'true' : 'false', onclick: () => onPick(val) }, ic ? icon(ic, 18) : null, label)));
}

function pickRow(label, options, value, onPick) {
  const row = h('div', { class: 'pick-row' }, options.map(([val, text]) =>
    h('button', { class: 'pick-btn' + (val === value ? ' sel' : ''), onclick: () => onPick(val) }, text)));
  // keep the chosen option in view when the row is wider than the screen
  requestAnimationFrame(() => {
    const sel = row.querySelector('.sel');
    if (sel) row.scrollLeft = sel.offsetLeft - row.clientWidth / 2 + sel.clientWidth / 2;
  });
  return h('div', { class: 'pick' }, h('div', { class: 'pick-label' }, label), row);
}

// ---------- Today ----------
const PART_BLURB = {
  path: 'Steps, names, and walking a string',
  floors: 'Summoning shapes around a note',
  ear: 'Hearing on and off, degrees and floors',
};
const PART_ICON = { path: 'next', floors: 'progress', ear: 'ear' };

function installHint() {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let dismissed = false;
  try { dismissed = !!localStorage.getItem('woodshed.hint'); } catch (e) { /* ignore */ }
  if (!ios || navigator.standalone || dismissed) return null;
  const box = h('div', { class: 'note-card' },
    h('p', null, h('strong', null, 'Put Woodshed on your home screen. '), 'In Safari, tap the Share button, then "Add to Home Screen". It opens full screen and works offline.'),
    h('button', { class: 'link', onclick: () => { try { localStorage.setItem('woodshed.hint', '1'); } catch (e) { /* ignore */ } box.remove(); } }, 'Dismiss'));
  return box;
}

function pageToday() {
  const mode = state.settings.mode;
  const session = buildSession(mode, state.settings.minutes);
  const counts = summarize(session);
  const n = session.filter((x) => !x.study).length;
  const minutes = Math.max(1, Math.round((n * (mode === 'away' ? 17 : 34)) / 60));
  const unit = currentUnit();
  const prog = unitProgress(unit);
  const lesson = unreadLesson();
  const done = dayTotal(dayKey());
  const days = streak();

  const parts = Object.entries(counts).filter(([, c]) => c.n > 0).map(([key, c]) =>
    h('li', null,
      h('span', { class: 'part-icon' }, icon(PART_ICON[key], 20)),
      h('span', { class: 'part-text' }, h('strong', null, SECTION_NAME[key]), h('span', null, PART_BLURB[key])),
      h('span', { class: 'part-count' }, c.n, c.fresh ? h('em', null, `${c.fresh} new`) : null)));

  return [
    h('div', { class: 'page-head' },
      h('p', { class: 'eyebrow' }, new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })),
      h('h1', null, 'Today')),
    segmented([['guitar', 'Guitar in hand', 'guitar'], ['away', 'Away', 'phone']], mode, (m) => { setSetting('mode', m); route(); }, 'mode'),
    installHint(),
    lesson ? h('a', { class: 'card lesson-card', href: `#/learn/${lesson.id}` },
      h('span', { class: 'eyebrow' }, 'New lesson · 2 minute read'),
      h('strong', null, lesson.title),
      h('span', { class: 'muted' }, lesson.blurb),
      h('span', { class: 'go' }, icon('next', 20))) : null,
    h('section', { class: 'card session-card' },
      h('div', { class: 'session-meta' }, h('strong', null, `${n} exercises`), ` · about ${minutes} min`),
      n ? h('ul', { class: 'parts' }, parts) : h('p', { class: 'muted' }, 'Nothing is due. Open a lesson under Learn to add something new.'),
      n ? h('button', { class: 'primary wide', onclick: () => runSession(session, mode) }, done.n ? 'Practice again' : 'Start') : null,
      h('div', { class: 'length' }, h('span', { class: 'muted' }, 'Minutes'),
        segmented([[5, '5'], [10, '10'], [15, '15'], [20, '20']], state.settings.minutes, (v) => { setSetting('minutes', v); route(); }, 'small'))),
    h('section', { class: 'where' },
      h('div', { class: 'eyebrow' }, 'You are working on'),
      h('a', { class: 'where-unit', href: `#/learn/${unit.id}` }, unit.title, icon('next', 18)),
      progressBar(prog.ratio),
      h('div', { class: 'muted small' }, `${prog.done} of ${prog.total} met and answered right at least once`)),
    h('section', { class: 'tiles' },
      h('div', { class: 'tile' }, h('b', null, days), h('span', null, days === 1 ? 'day in a row' : 'days in a row')),
      h('div', { class: 'tile' }, h('b', null, done.n), h('span', null, 'exercises today')),
      h('div', { class: 'tile' }, h('b', null, Object.keys(state.items).filter(isLearned).length), h('span', null, 'items learned'))),
  ];
}

// ---------- the session runner ----------
function metronomeControl() {
  const label = h('span', null, String(state.settings.bpm));
  const wrap = h('div', { class: 'metro' });
  const toggle = h('button', { class: 'round', 'aria-label': 'Metronome', onclick: () => {
    if (audio.metronomeRunning()) { audio.stopMetronome(); wrap.classList.remove('on'); }
    else { audio.startMetronome(state.settings.bpm); wrap.classList.add('on'); }
  } }, icon('metro', 20));
  const nudge = (d) => {
    const bpm = Math.max(40, Math.min(200, state.settings.bpm + d));
    setSetting('bpm', bpm); label.textContent = String(bpm); audio.setTempo(bpm);
  };
  wrap.append(h('button', { class: 'tiny', 'aria-label': 'Slower', onclick: () => nudge(-4) }, '−'), label,
    h('button', { class: 'tiny', 'aria-label': 'Faster', onclick: () => nudge(4) }, '+'), toggle);
  return wrap;
}

function runSession(list, mode, unitBefore = currentUnit()) {
  audio.unlock();
  const queue = list.slice();
  const tally = { right: 0, wrong: 0, shaky: 0, fresh: 0 };
  const repeated = new Set();
  let i = 0;
  let timer = 0;
  let wake = null;
  if (mode === 'guitar' && navigator.wakeLock) navigator.wakeLock.request('screen').then((w) => { wake = w; }).catch(() => {});

  const fill = h('i');
  const count = h('span', { class: 'count' });
  const body = h('div', { class: 'session-body' });
  const foot = h('div', { class: 'session-foot' });
  const close = () => {
    clearTimeout(timer);
    audio.stopAll(); audio.stopMetronome();
    if (wake) wake.release().catch(() => {});
    document.removeEventListener('keydown', onKey);
    sessionRoot.hidden = true;
    document.body.classList.remove('in-session');
    save(); // lets sync know there is something new
    route();
  };
  const onKey = (ev) => {
    if (ev.key === 'Escape') close();
    if (ev.key === 'Enter') { const b = foot.querySelector('.primary'); if (b) { ev.preventDefault(); b.click(); } }
  };
  document.addEventListener('keydown', onKey);

  sessionRoot.replaceChildren(
    h('div', { class: 'session-top' },
      h('button', { class: 'round', 'aria-label': 'End session', onclick: close }, icon('close', 20)),
      h('div', { class: 'meter slim' }, fill), count,
      mode === 'guitar' ? metronomeControl() : null),
    body, foot);
  sessionRoot.hidden = false;
  document.body.classList.add('in-session');

  const next = () => { clearTimeout(timer); i++; show(); };
  const nextButton = () => h('button', { class: 'primary wide', onclick: next }, i + 1 >= queue.length ? 'Finish' : 'Next');

  function show() {
    if (i >= queue.length) return summary();
    const entry = queue[i];
    fill.style.width = `${(i / queue.length) * 100}%`;
    count.textContent = `${i + 1} of ${queue.length}`;
    foot.replaceChildren();
    const started = Date.now();
    let finished = false;
    const ctx = {
      mode,
      key: keyFor(entry.id),
      bpm: () => state.settings.bpm,
      foot: (node) => foot.replaceChildren(...(node ? [node] : [])),
      finish(result, advance) {
        if (finished) return;
        finished = true;
        if (!entry.study) {
          if (isNew(entry.id)) tally.fresh++;
          grade(entry.id, result, (Date.now() - started) / 1000);
          tally[result]++;
          if (result === 'wrong' && !repeated.has(entry.id)) { repeated.add(entry.id); queue.push({ id: entry.id }); }
        }
        if (advance === 'now') return next();
        foot.replaceChildren(nextButton());
        if (advance === 'auto') timer = setTimeout(next, 1500);
      },
    };
    body.replaceChildren(mountDrill(entry, ctx));
    body.scrollTop = 0;
  }

  function summary() {
    audio.stopAll(); audio.stopMetronome();
    fill.style.width = '100%';
    count.textContent = '';
    const total = tally.right + tally.wrong + tally.shaky;
    const nowUnit = currentUnit();
    const moved = nowUnit.id !== unitBefore.id;
    body.replaceChildren(h('div', { class: 'drill summary' },
      h('div', { class: 'kicker' }, 'Session done'),
      h('h2', { class: 'prompt' }, total ? `${tally.right} of ${total} right` : 'Nothing to grade this time'),
      h('div', { class: 'tiles' },
        h('div', { class: 'tile' }, h('b', null, tally.fresh), h('span', null, 'new today')),
        h('div', { class: 'tile' }, h('b', null, tally.wrong + tally.shaky), h('span', null, 'to revisit')),
        h('div', { class: 'tile' }, h('b', null, streak()), h('span', null, 'day streak'))),
      moved ? h('a', { class: 'card lesson-card', href: `#/learn/${nowUnit.id}`, onclick: close },
        h('span', { class: 'eyebrow' }, 'Unlocked'), h('strong', null, nowUnit.title), h('span', { class: 'muted' }, nowUnit.blurb), h('span', { class: 'go' }, icon('next', 20))) : null,
      h('p', { class: 'hint' }, tally.wrong ? 'Anything you missed comes back tomorrow, and again until it sticks.' : 'What you got right will come back less and less often.')));
    foot.replaceChildren(h('button', { class: 'primary wide', onclick: close }, 'Done'));
  }

  show();
}

// ---------- Learn ----------
function unitStatus(unit) {
  if (unitComplete(unit) && isActive(unit)) return 'done';
  return isActive(unit) ? 'active' : 'locked';
}

function pageLearn() {
  const groups = [];
  for (const u of UNITS) {
    let g = groups.find((x) => x.name === u.group);
    if (!g) groups.push((g = { name: u.group, units: [] }));
    g.units.push(u);
  }
  return [
    h('div', { class: 'page-head' }, h('p', { class: 'eyebrow' }, 'The ladder'), h('h1', null, 'Learn')),
    h('p', { class: 'lede' }, 'One short lesson per step. Each step joins your daily sessions when the one before it has mostly sunk in, or sooner if you start it yourself.'),
    groups.map((g) => h('section', { class: 'ladder' },
      h('h2', { class: 'group' }, g.name),
      g.units.map((u) => {
        const status = unitStatus(u);
        const prog = unitProgress(u);
        return h('a', { class: `rung ${status}`, href: `#/learn/${u.id}` },
          h('span', { class: 'dot' }, status === 'done' ? icon('check', 14) : null),
          h('span', { class: 'rung-text' }, h('strong', null, u.title), h('span', { class: 'muted' }, u.blurb)),
          status === 'locked' ? null : h('span', { class: 'rung-count' }, `${prog.done}/${prog.total}`));
      }))),
    h('section', { class: 'ladder' },
      h('h2', { class: 'group' }, 'Further up'),
      PLANNED.map((x) => h('div', { class: 'rung planned' }, h('span', { class: 'dot' }),
        h('span', { class: 'rung-text' }, h('strong', null, x.title), h('span', { class: 'muted' }, x.blurb)))),
      h('p', { class: 'muted small' }, 'These are not built yet.')),
  ];
}

function pageLesson(id) {
  const unit = unitById(id);
  if (!unit) return pageLearn();
  markUnit(id, 'read');
  const active = isActive(unit);
  const start = () => {
    const before = currentUnit();
    markUnit(id, 'on');
    const session = buildSession(state.settings.mode, Math.min(10, state.settings.minutes), unit);
    if (session.length) runSession(session, state.settings.mode, before);
  };
  return [
    h('a', { class: 'back', href: '#/learn' }, icon('back', 18), 'Learn'),
    h('div', { class: 'page-head' }, h('p', { class: 'eyebrow' }, unit.group), h('h1', null, unit.title)),
    h('article', { class: 'lesson' }, lessonFor(id)),
    h('div', { class: 'lesson-foot' },
      active ? null : h('p', { class: 'muted small' }, 'This step is ahead of where your daily sessions are. Practicing it now switches it on.'),
      h('button', { class: 'primary wide', onclick: start }, `Practice this ${state.settings.mode === 'guitar' ? 'with the guitar' : 'now'}`)),
  ];
}

// ---------- Explore ----------
const explore = { key: 'C', scale: 'maj6', shape: 'drop2', set: null, names: false, string: 2 };

function pageExplore() {
  const shape = SHAPES[explore.shape];
  const set = explore.set && shape.sets.some((s) => s.join() === explore.set.join()) ? explore.set : shape.primary;
  const refresh = (patch) => { Object.assign(explore, patch); route(); };
  const browser = shapeBrowser({ key: explore.key, scale: explore.scale, shape: explore.shape, set, names: explore.names });
  return [
    h('div', { class: 'page-head' }, h('p', { class: 'eyebrow' }, 'Any key, any floor'), h('h1', null, 'Explore')),
    pickRow('Key', KEYS.map((k) => [k.id, k.id]), explore.key, (v) => refresh({ key: v })),
    pickRow('Scale', SCALE_ORDER.map((s) => [s, SCALES[s].short]), explore.scale, (v) => refresh({ scale: v })),
    pickRow('Floor', FLOORS.filter((f) => f.id !== 'unison').flatMap((f) => f.shapes.map((id) => [id, SHAPES[id].name])), explore.shape, (v) => refresh({ shape: v, set: null })),
    pickRow('Strings', shape.sets.map((s) => [s.join(), s.join('-')]), set.join(), (v) => refresh({ set: v.split(',').map(Number) })),
    browser.el,
    h('div', { class: 'pills' },
      h('button', { class: 'pill', onclick: () => browser.playAll() }, icon('play', 16), 'Play up the neck'),
      h('button', { class: 'pill', onclick: () => refresh({ names: !explore.names }) }, explore.names ? 'Show degrees' : 'Show note names')),
    shape.derived ? h('p', { class: 'note' }, 'This floor is worked out from its definition and two example diagrams, not from a full chart. Treat it as provisional.') : null,
    h('h2', { class: 'group' }, 'The scale on one string'),
    pickRow('String', [6, 5, 4, 3, 2, 1].map((s) => [s, String(s)]), explore.string, (v) => refresh({ string: v })),
    scaleStrip(explore.key, explore.scale, explore.string, { from: 0, names: explore.names }),
  ];
}

// ---------- Progress ----------
function elevator() {
  const all = catalogue();
  const rows = FLOORS.slice().reverse().map((f) => {
    const ids = all.filter((id) => floorOfItem(id) === f.id);
    const got = ids.filter(isLearned).length;
    return h('div', { class: 'floor' + (got ? ' lit' : '') },
      h('span', { class: 'floor-n' }, f.level), h('span', { class: 'floor-name' }, f.name),
      progressBar(ids.length ? got / ids.length : 0), h('span', { class: 'floor-count' }, `${got}/${ids.length}`));
  });
  const ear = all.filter((id) => floorOfItem(id) === 'ear');
  const earGot = ear.filter(isLearned).length;
  return h('section', { class: 'card' },
    h('h2', { class: 'card-title' }, 'The elevator'),
    h('p', { class: 'muted small' }, 'An item counts as learned once you have got it right on two different days.'),
    h('div', { class: 'elevator' }, rows),
    h('div', { class: 'floor ear' + (earGot ? ' lit' : '') }, h('span', { class: 'floor-n' }, icon('ear', 16)), h('span', { class: 'floor-name' }, 'Ear'),
      progressBar(ear.length ? earGot / ear.length : 0), h('span', { class: 'floor-count' }, `${earGot}/${ear.length}`)));
}

function calendar() {
  const cells = [];
  const now = Date.now();
  for (let d = 34; d >= 0; d--) {
    const ms = now - d * 86400000;
    const t = dayTotal(dayKey(ms));
    const level = t.n === 0 ? 0 : t.n < 10 ? 1 : t.n < 25 ? 2 : 3;
    cells.push(h('i', { class: `day l${level}`, title: `${new Date(ms).toLocaleDateString()}: ${t.n} exercises` }));
  }
  return h('section', { class: 'card' }, h('h2', { class: 'card-title' }, 'The last five weeks'), h('div', { class: 'calendar' }, cells));
}

let syncRedraw = null;

function syncCard() {
  const cfg = sync.config();
  const card = h('section', { class: 'card' });
  const draw = () => {
    const st = sync.status;
    syncRedraw = sync.isSetUp() ? draw : null;
    if (sync.isSetUp()) {
      const line = st.phase === 'syncing' ? 'Syncing…'
        : st.phase === 'error' ? st.message
        : st.at ? `In sync with ${cfg.repo}. Last checked ${new Date(st.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`
        : `Connected to ${cfg.repo}.`;
      card.replaceChildren(
        h('h2', { class: 'card-title' }, 'Sync'),
        h('p', { class: st.phase === 'error' ? 'warn' : 'muted' }, line),
        h('div', { class: 'pills' },
          h('button', { class: 'pill', onclick: () => sync.syncNow().then(() => route()) }, icon('repeat', 16), 'Sync now'),
          h('button', { class: 'pill', onclick: () => { if (confirm('Stop syncing on this device? Your progress stays here and in the repository.')) { sync.setConfig({ token: '', repo: cfg.repo }); route(); } } }, 'Disconnect this device')));
      return;
    }
    const repo = h('input', { type: 'text', value: cfg.repo, placeholder: 'yourname/woodshed-data', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false' });
    const token = h('input', { type: 'password', placeholder: 'github_pat_…', autocomplete: 'off' });
    const msg = h('p', { class: 'warn' });
    card.replaceChildren(
      h('h2', { class: 'card-title' }, 'Sync between devices'),
      h('p', { class: 'muted' }, 'Progress is saved on this device. To have it follow you, connect a private GitHub repository. You paste an access token once per device; it stays on the device.'),
      h('label', null, 'Repository', repo),
      h('label', null, 'Access token', token),
      msg,
      h('button', { class: 'primary', onclick: async () => {
        if (!repo.value.trim() || !token.value.trim()) { msg.textContent = 'Enter both the repository and the token.'; return; }
        sync.setConfig({ repo: repo.value, token: token.value });
        msg.textContent = 'Checking…';
        const ok = await sync.syncNow();
        if (!ok) { msg.textContent = sync.status.message; sync.setConfig({ repo: repo.value, token: '' }); return; }
        route();
      } }, 'Connect'));
  };
  draw();
  return card;
}

function pageProgress() {
  const week = [0, 1, 2, 3, 4, 5, 6].reduce((sum, d) => sum + dayTotal(dayKey(Date.now() - d * 86400000)).s, 0);
  return [
    h('div', { class: 'page-head' }, h('p', { class: 'eyebrow' }, 'Where you stand'), h('h1', null, 'Progress')),
    h('section', { class: 'tiles' },
      h('div', { class: 'tile' }, h('b', null, streak()), h('span', null, 'day streak')),
      h('div', { class: 'tile' }, h('b', null, Object.keys(state.items).filter(isLearned).length), h('span', null, 'items learned')),
      h('div', { class: 'tile' }, h('b', null, Math.round(week / 60)), h('span', null, 'minutes this week'))),
    elevator(),
    calendar(),
    syncCard(),
    h('section', { class: 'card' },
      h('h2', { class: 'card-title' }, 'Settings'),
      h('div', { class: 'setting' }, h('span', null, 'Sound'),
        segmented([[true, 'On'], [false, 'Off']], state.settings.sound, (v) => { setSetting('sound', v); audio.setEnabled(v); route(); }, 'small')),
      h('div', { class: 'setting' }, h('span', null, 'Start over'),
        h('button', { class: 'pill danger', onclick: () => { if (confirm('Erase all progress? If sync is on, it is erased on your other devices too the next time they sync.')) { resetAll(); route(); } } }, 'Erase progress'))),
    h('p', { class: 'colophon' }, `Woodshed ${VERSION}. A personal practice aid for the Labyrinth of Limitations method by Thomas Echols, which builds on the teaching of Barry Harris. Unofficial; the explanations here are this app's own.`),
  ];
}

// ---------- routing ----------
function route() {
  if (!sessionRoot.hidden) return;
  const [, name = 'today', arg] = location.hash.split('/');
  const page = name === 'learn' ? (arg ? pageLesson(decodeURIComponent(arg)) : pageLearn())
    : name === 'explore' ? pageExplore()
    : name === 'progress' ? pageProgress()
    : pageToday();
  view.replaceChildren(...page.flat().filter(Boolean));
  for (const a of document.querySelectorAll('#tabs a')) a.classList.toggle('sel', a.dataset.tab === (TABS.some(([t]) => t === name) ? name : 'today'));
}

let lastHash = '';
window.addEventListener('hashchange', () => {
  const changed = location.hash.split('/')[1] !== lastHash.split('/')[1] || location.hash.split('/')[2] !== lastHash.split('/')[2];
  lastHash = location.hash;
  route();
  if (changed) window.scrollTo(0, 0);
});

document.getElementById('tabs').append(...TABS.map(([id, label]) => {
  const a = h('a', { href: `#/${id}` }, icon(id, 22), h('span', null, label));
  a.dataset.tab = id;
  return a;
}));

// A hook for trying specific exercises from the browser console while developing, e.g.
//   woodshed.run(['sh|maj6|shell.low|432|t|4'], 'guitar')
window.woodshed = { run: (ids, mode = 'away') => runSession(ids.map((id) => (typeof id === 'string' ? { id } : id)), mode) };

audio.setEnabled(state.settings.sound !== false);
document.addEventListener('pointerdown', () => audio.unlock(), { once: true });
sync.onStatus((st) => {
  if (st.phase === 'ok' && st.pulled && sessionRoot.hidden) route(); // another device's progress arrived
  else if (syncRedraw) syncRedraw();
});
sync.startAutoSync();
lastHash = location.hash;
route();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
