// curriculum.js — the ladder of units, the practice items inside each, and the
// builder that turns "what is due, what is new" into today's session.
//
// An item id is a compact string. The kinds:
//   oo|scale|deg            is this degree on or off?
//   st|scale|deg|u/d        half or whole step from this degree, up or down
//   nm|scale|deg            name (or find) a degree on one string
//   wk|scale|string         walk one octave of the path on a string
//   sh|scale|shape|set|t/b|deg   summon a shape beneath (t) or above (b) a degree
//   eo|scale|deg            ear: is this note on or off?
//   ed|scale|deg            ear: which degree is this?
//   ef|scale|deg            ear: find the note you hear
//   ei|scale|deg            ear: imagine the degree, then check
//   el|scale|floor          ear: which floor is this?
//   mq|scale|floor|how      which floor comes next for this kind of step? (how: out, in, par)
//   mv|scale|move|floor|u/d|deg   play the next chord: move is par, con or obl (see motion.js)
//   em|scale|motion         ear: parallel, contrary or oblique? (motion: par, con, obl)

import { SCALES, KEY_ORDER } from './theory.js';
import { SHAPES, setKey } from './floors.js';
import { movePair } from './motion.js';
import { state, isNew, isDue, box, everRight, rec, unitFlag } from './store.js';

const DEGS = [0, 1, 2, 3, 4, 5, 6, 7];
const ON_FIRST = [0, 4, 2, 6, 7, 1, 3, 5];

const oo = (s) => DEGS.map((d) => `oo|${s}|${d}`);
const st = (s) => [...DEGS.map((d) => `st|${s}|${d}|u`), ...DEGS.map((d) => `st|${s}|${d}|d`)];
const nm = (s) => [4, 2, 6, 1, 7, 3, 5].map((d) => `nm|${s}|${d}`);
const wk = (s, strings) => strings.map((x) => `wk|${s}|${x}`);
const ear = (kind, s, degs = ON_FIRST) => degs.map((d) => `${kind}|${s}|${d}`);
const sh = (s, shape, set, degs = ON_FIRST) => [
  ...degs.map((d) => `sh|${s}|${shape}|${setKey(set)}|t|${d}`),
  ...degs.map((d) => `sh|${s}|${shape}|${setKey(set)}|b|${d}`),
];
const primary = (s, shape, degs) => sh(s, shape, SHAPES[shape].primary, degs);
const others = (s, shape, degs) => SHAPES[shape].sets
  .filter((set) => setKey(set) !== setKey(SHAPES[shape].primary))
  .flatMap((set) => sh(s, shape, set, degs));
const ON = [0, 4, 2, 6];
// Moves between two chords. Only those with a playable position in C are kept.
const mv = (s, move, floors, dirs, degs = ON_FIRST) => floors
  .flatMap((f) => dirs.flatMap((dir) => degs.map((d) => `mv|${s}|${move}|${f}|${dir}|${d}`)))
  .filter((id) => movePair('C', parse(id)));
const mq = (floors, hows = ['out', 'par', 'in']) => floors.flatMap((f) => hows.map((how) => `mq|maj6|${f}|${how}`));

const floorUnit = (id, title, blurb, shapes, floorId, group) => ({
  id, title, blurb, group,
  core: shapes.flatMap((x) => primary('maj6', x)),
  extra: [`el|maj6|${floorId}`, ...shapes.flatMap((x) => others('maj6', x))],
});

const scaleUnits = (s, label) => [
  {
    id: `${s}.path`, title: `${label}: the path`, blurb: 'A new on chord, the same off chord', group: 'Three more scales',
    core: [...st(s), ...wk(s, [2]), ...nm(s)],
    extra: [...oo(s), ...ear('eo', s), ...ear('ed', s), ...wk(s, [4, 3]), ...ear('ef', s)],
  },
  {
    id: `${s}.floors`, title: `${label}: the floors`, blurb: 'Thirds to drop 2 on the new on chord', group: 'Three more scales',
    core: ['thirds', 'triads', 'shell.low', 'shell.high', 'drop2'].flatMap((x) => primary(s, x, ON)),
    extra: ['oct.triad', 'oct.low', 'oct.high'].flatMap((x) => primary(s, x, ON)),
  },
];

export const UNITS = [
  {
    id: 'scale', title: 'Eight notes, two chords', blurb: 'The major 6 diminished scale, on and off', group: 'Foundations',
    core: [...oo('maj6'), ...nm('maj6')],
    extra: [...ear('eo', 'maj6'), ...ear('ei', 'maj6', [0, 4, 2])],
  },
  {
    id: 'path', title: 'The path', blurb: 'Half steps and whole steps along a string', group: 'Foundations',
    core: [...st('maj6'), ...wk('maj6', [2, 4, 3])],
    extra: [...ear('ed', 'maj6'), ...ear('ef', 'maj6'), ...wk('maj6', [5, 1, 6]), ...ear('ei', 'maj6', [6, 7, 1, 3, 5])],
  },
  floorUnit('thirds', 'Thirds', 'Two notes, the smallest harmony', ['thirds'], 'thirds', 'The small floors'),
  floorUnit('triads', 'Triads', 'Three notes, leapfrogging up the scale', ['triads'], 'triads', 'The small floors'),
  floorUnit('shells', 'Shells', 'Three notes with a gap: low and high', ['shell.low', 'shell.high'], 'shells', 'The small floors'),
  {
    id: 'motion.steps', title: 'Parallel and contrary', blurb: 'Two voices, stepping together or apart', group: 'Moving between floors',
    core: [
      ...mq(['thirds', 'triads', 'shell.low']),
      ...mv('maj6', 'con', ['thirds', 'triads'], ['u']),
      ...mv('maj6', 'con', ['shell.low', 'triads'], ['d']),
      ...mv('maj6', 'par', ['thirds', 'triads', 'shell.low'], ['u'], ON),
    ],
    extra: [
      'em|maj6|par', 'em|maj6|con',
      ...mv('maj6', 'con', ['unison'], ['u']), ...mv('maj6', 'con', ['thirds'], ['d']),
      ...mv('maj6', 'par', ['thirds', 'triads', 'shell.low'], ['d']),
    ],
  },
  {
    id: 'motion.oblique', title: 'Holding one voice', blurb: 'Oblique motion: the melody stays, the rest moves', group: 'Moving between floors',
    core: [...mv('maj6', 'obl', ['thirds', 'unison'], ['d', 'u'])],
    extra: ['em|maj6|obl', ...mv('maj6', 'obl', ['shell.low'], ['d', 'u'])],
  },
  floorUnit('octaves', 'Octaves', 'Four notes, the top doubling the bottom', ['oct.triad', 'oct.low', 'oct.high'], 'octaves', 'The four-note floors'),
  floorUnit('drop2', 'Drop 2', 'The full four-note chord', ['drop2'], 'drop2', 'The four-note floors'),
  {
    id: 'motion.wide', title: 'Riding the elevator', blurb: 'Contrary motion from shells out to drop 2', group: 'The four-note floors',
    core: [...mv('maj6', 'con', ['shell.low', 'oct.low'], ['u']), ...mv('maj6', 'con', ['drop2', 'oct.low'], ['d'])],
    extra: [...mq(['oct.low', 'drop2']), ...mv('maj6', 'par', ['oct.low', 'drop2'], ['u'])],
  },
  ...scaleUnits('min6', 'Minor 6'),
  ...scaleUnits('dom7', 'Dominant 7'),
  ...scaleUnits('dom7b5', 'Dominant 7♭5'),
  {
    id: 'wide', title: 'The wide floors', blurb: 'Drop 3, drop 2 and 4, double octaves', group: 'Wider voicings',
    core: ['drop3', 'drop24', 'dbl'].flatMap((x) => primary('maj6', x)),
    extra: [
      'el|maj6|drop3', 'el|maj6|drop24', ...primary('maj6', 'dbl.alt'), ...others('maj6', 'drop3'), ...others('maj6', 'drop24'),
      ...mv('maj6', 'con', ['drop2', 'drop3'], ['u']), ...mv('maj6', 'con', ['drop24', 'drop3'], ['d']),
    ],
  },
];

// What comes after the units above. Listed in the app so the road ahead is visible.
export const PLANNED = [
  { title: 'Borrowing', blurb: 'Swapping one voice for its neighbor on the path' },
  { title: 'Leaps, and floors within floors', blurb: 'Patterns that skip floors, and small floors inside big ones' },
  { title: 'Pivoting', blurb: 'Through the mirror: trading a floor for its reflection' },
  { title: 'Substitution', blurb: 'Minor 6 on the 5, the tritone’s minor, and friends' },
  { title: 'Transformation', blurb: 'Families, tall siblings, and ii–V–I by feel' },
  { title: 'The chromatic scale', blurb: 'Filling the whole steps, leaping the half steps' },
  { title: 'Tunes', blurb: 'Putting it to work over real changes' },
];

export const unitById = (id) => UNITS.find((u) => u.id === id);

export function parse(id) {
  const p = id.split('|');
  const kind = p[0];
  const base = { id, kind, scale: p[1] };
  if (kind === 'st') return { ...base, deg: +p[2], dir: p[3] === 'u' ? 1 : -1 };
  if (kind === 'wk') return { ...base, string: +p[2] };
  if (kind === 'el') return { ...base, floor: p[2] };
  if (kind === 'mq') return { ...base, floor: p[2], how: p[3] };
  if (kind === 'mv') return { ...base, move: p[2], floor: p[3], dir: p[4] === 'u' ? 1 : -1, deg: +p[5] };
  if (kind === 'em') return { ...base, motion: p[2] };
  if (kind === 'sh') return { ...base, shape: p[2], set: p[3].split('').map(Number), anchor: p[4] === 't' ? 'top' : 'bottom', deg: +p[5] };
  return { ...base, deg: +p[2] };
}

export const SECTION = { oo: 'path', st: 'path', nm: 'path', wk: 'path', sh: 'floors', mq: 'motion', mv: 'motion', eo: 'ear', ed: 'ear', ef: 'ear', ei: 'ear', el: 'ear', em: 'ear' };
export const SECTION_NAME = { path: 'The path', floors: 'Floors', motion: 'Motion', ear: 'Ear' };
const kindOf = (id) => id.slice(0, 2);
const AWAY_ONLY = new Set(['oo', 'mq']);
const supports = (id, mode) => mode === 'away' || !AWAY_ONLY.has(kindOf(id));

// ---- unit progress ----
export function unitProgress(unit) {
  const done = unit.core.filter(everRight).length;
  return { done, total: unit.core.length, ratio: unit.core.length ? done / unit.core.length : 1 };
}
export const unitComplete = (unit) => unitProgress(unit).ratio >= 0.8;

// A unit is active (feeding sessions) once the one before it is mostly done,
// or when you switch it on yourself from its lesson.
export function isActive(unit) {
  const i = UNITS.indexOf(unit);
  if (i === 0 || unitFlag(unit.id, 'on')) return true;
  // once you have started a unit it stays on, even if new units are later added before it
  if (unit.core.some((id) => !isNew(id))) return true;
  return unitComplete(UNITS[i - 1]) && isActive(UNITS[i - 1]);
}
export const activeUnits = () => UNITS.filter(isActive);
export function currentUnit() {
  const active = activeUnits();
  return active.find((u) => !unitComplete(u)) || active[active.length - 1];
}
// The newest active unit whose lesson has not been opened yet.
export function unreadLesson() {
  return activeUnits().find((u) => !unitFlag(u.id, 'read')) || null;
}

// ---- which key an item is practiced in ----
// New material stays in C; keys widen as the item settles in.
export function keyFor(id) {
  const b = box(id);
  const pool = b < 2 ? 1 : b === 2 ? 3 : b === 3 ? 5 : 8;
  return KEY_ORDER[Math.floor(Math.random() * pool)];
}

// ---- building a session ----
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// Seconds one item takes, roughly, for sizing a session to the minutes asked for.
const PACE = { away: 17, guitar: 34 };

export function sessionSize(mode, minutes) {
  return Math.max(6, Math.round((minutes * 60) / PACE[mode]));
}

// Returns an ordered list of { id, study? } for one session.
// `only` restricts the session to one unit (used by "Practice this" on a lesson).
export function buildSession(mode, minutes, only = null) {
  const size = sessionSize(mode, minutes);
  const units = only ? [only] : activeUnits();
  const pool = units.flatMap((u) => [...u.core, ...u.extra]).filter((id) => supports(id, mode));
  const seen = [...new Set(pool.filter((id) => !isNew(id)))];
  const due = seen.filter(isDue).sort((a, b) => rec(a).d - rec(b).d || rec(a).b - rec(b).b);

  // New items come from the furthest-along units first: core before extras.
  const ordered = units.slice().reverse();
  const fresh = [...new Set([
    ...ordered.flatMap((u) => u.core),
    ...ordered.flatMap((u) => u.extra),
  ])].filter((id) => isNew(id) && supports(id, mode));

  const earShare = Math.round(size * 0.25);
  const newCap = Math.max(mode === 'away' ? 8 : 5, size - due.length);
  const picked = [];
  const take = (list, n, filter = () => true) => {
    for (const id of list) {
      if (n <= 0) break;
      if (picked.includes(id) || !filter(id)) continue;
      picked.push(id); n--;
    }
  };
  const isEar = (id) => SECTION[kindOf(id)] === 'ear';
  // 1. reviews that are due, keeping room for new material and for the ear
  take(due, size - Math.min(newCap, 5) - 2, (id) => !isEar(id));
  take(due, earShare, isEar);
  // 2. new material
  const room = () => size - picked.length;
  take(fresh, Math.min(newCap, Math.max(0, room() - 1)), (id) => !isEar(id));
  take(fresh, Math.min(earShare, room()), isEar);
  // 3. top up: more due, more new, then the shakiest things already seen
  take(due, room());
  take(fresh, room());
  take(seen.slice().sort((a, b) => rec(a).b - rec(b).b || rec(a).t - rec(b).t), room());

  const bySection = { path: [], floors: [], motion: [], ear: [] };
  for (const id of picked) bySection[SECTION[kindOf(id)]].push(id);
  const out = [];
  out.push(...shuffle(bySection.path).map((id) => ({ id })));
  // New shapes are shown before they are asked for.
  const newShapes = bySection.floors.filter(isNew);
  out.push(...newShapes.map((id) => ({ id, study: true })));
  out.push(...shuffle(bySection.floors).map((id) => ({ id })));
  out.push(...shuffle(bySection.motion).map((id) => ({ id })));
  out.push(...shuffle(bySection.ear).map((id) => ({ id })));
  return out;
}

export function summarize(session) {
  const counts = { path: { n: 0, fresh: 0 }, floors: { n: 0, fresh: 0 }, motion: { n: 0, fresh: 0 }, ear: { n: 0, fresh: 0 } };
  for (const it of session) {
    if (it.study) continue;
    const c = counts[SECTION[kindOf(it.id)]];
    c.n++;
    if (isNew(it.id)) c.fresh++;
  }
  return counts;
}

// ---- progress by floor, for the elevator on the Progress page ----
export function catalogue() {
  return [...new Set(UNITS.flatMap((u) => [...u.core, ...u.extra]))];
}
export function floorOfItem(id) {
  const k = kindOf(id);
  if (k === 'sh') return SHAPES[id.split('|')[2]].floor;
  if (SECTION[k] === 'ear') return 'ear';
  if (SECTION[k] === 'motion') return 'motion';
  return 'unison';
}
export const scaleName = (s) => SCALES[s].name;
export { state };
