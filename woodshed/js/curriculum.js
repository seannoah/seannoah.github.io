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
//   sc|family|how           reading a chart: which scale of chords for this chord? (see harmony.js)
//   bw|scale|shape|set|voice|u/d|deg   borrow above or below one voice of a chord (voice 0 = top)
//   bm|scale|shape|set|a/b|deg         an on chord beneath an off melody note, borrowed from above or below
//   eb|scale|x              ear: is one note of this chord borrowed?
//   tb|scale|role           what is in the bass of this drop 2 6th chord? (role: r, 3, 5, 6)
//   tw|scale|role|f/b/a     the family circle: move forward, backward or across from this bass note
//   tf|move                 which formula makes this move? (see MOVES in transform.js)
//   tx|move|role            play the transformation, starting with this role in the bass
//   et|scale|v              ear: which V chord was that, inside or outside?
//   fw|scale|shape|part     find a small floor (or frame) inside a bigger one
//   lq|floor|t|df           the melody moves t steps and the chord changes df floors: what does the bass do?
//   lp|scale|floor|t|df|deg play that move (see leapPair in motion.js)
//   ej|scale|b              ear: did the bass step, hold or leap?
//   pm|floor|w/n            the mirror: which floor is this one's reflection, wider or narrower?
//   pv|scale|floor|in/out|deg   play a pivot: the reflection of the floor that was due (see mirror.js)
//   ep|scale|x              ear: straight on, or through the mirror?
//   hq|post                 which note of the off chord moves to make this chord? (see POSTS in subs.js)
//   hp|post|pos             make that move on the neck, from the off chord with note `pos` in the bass
//   su|scale|job            one chord, many jobs: which chart chord does this chord serve? (see JOBS in subs.js)
//   eh|scale|x              ear: which road home (minor 6 on the 5, tritone's minor, minor iv)?

import { SCALES, KEY_ORDER } from './theory.js';
import { SHAPES, setKey } from './floors.js';
import { movePair, leapPair } from './motion.js';
import { pivotPair } from './mirror.js';
import { borrowPair, underBorrowed } from './borrow.js';
import { ROLES, roleIndex } from './transform.js';
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
const bw = (s, shape, set, voices, degs = ON) => degs
  .flatMap((d) => voices.flatMap((v) => ['d', 'u'].map((dir) => `bw|${s}|${shape}|${setKey(set)}|${v}|${dir}|${d}`)))
  .filter((id) => borrowPair('C', parse(id)));
const bm = (s, shape, set, degs = [1, 7, 3, 5]) => degs
  .flatMap((d) => ['a', 'b'].map((from) => `bm|${s}|${shape}|${setKey(set)}|${from}|${d}`))
  .filter((id) => underBorrowed('C', parse(id)));
const ROLE_IDS = ROLES.map((r) => r.id);
const tb = (s) => ROLE_IDS.map((r) => `tb|${s}|${r}`);
const tw = (s) => ['f', 'b', 'a'].flatMap((d) => ROLE_IDS.map((r) => `tw|${s}|${r}|${d}`));
const tf = (moves) => moves.map((m) => `tf|${m}`);
const tx = (moves) => moves.flatMap((m) => ROLE_IDS.map((r) => `tx|${m}|${r}`));
const fw = (pairs) => pairs.map(([shape, part]) => `fw|maj6|${shape}|${part}`);
const lq = (rows) => rows.map(([floor, t, df]) => `lq|${floor}|${t}|${df}`);
const lp = (s, floors, t, df, degs = ON) => floors
  .flatMap((f) => degs.map((d) => `lp|${s}|${f}|${t}|${df}|${d}`))
  .filter((id) => leapPair('C', parse(id)));
const pm = (floors, way) => floors.map((f) => `pm|${f}|${way}`);
const pv = (s, floors, how, degs = ON) => floors
  .flatMap((f) => degs.map((d) => `pv|${s}|${f}|${how}|${d}`))
  .filter((id) => pivotPair('C', parse(id)));
const OFF = [7, 1, 3, 5];
const hq = (posts) => posts.map((x) => `hq|${x}`);
const hp = (posts) => posts.flatMap((x) => [0, 1, 2, 3].map((pos) => `hp|${x}|${pos}`));
const su = (scale, jobs) => jobs.map((j) => `su|${scale}|${j}`);
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
    id: 'borrow.voice', title: 'Borrowing a neighbor', blurb: 'One voice steps off the chord and back', group: 'Borrowing',
    core: [...bw('maj6', 'triads', [4, 3, 2], [0, 1]), ...bw('maj6', 'shell.low', [4, 3, 2], [0, 1])],
    extra: ['eb|maj6|x', ...bw('maj6', 'thirds', [4, 3], [0, 1]), ...bw('maj6', 'triads', [4, 3, 2], [2]), ...bw('maj6', 'triads', [4, 3, 2], [0, 1], [7, 1, 3, 5])],
  },
  {
    id: 'borrow.melody', title: 'A borrowed note in the melody', blurb: 'An on chord kept beneath an off note', group: 'Borrowing',
    core: [...bm('maj6', 'thirds', [3, 2]), ...bm('maj6', 'triads', [4, 3, 2]), ...bm('maj6', 'shell.low', [4, 3, 2])],
    extra: [...bm('maj6', 'shell.high', [4, 3, 2]), ...bm('maj6', 'drop2', [5, 4, 3, 2])],
  },
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
    id: 'chart', title: 'Reading a chart', blurb: 'Which scale of chords goes with each chord symbol', group: 'Tunes',
    core: ['sc|min7|same', 'sc|hdim|same', 'sc|dom|on5', 'sc|dom|tm', 'sc|maj|on5', 'sc|dom|tt'],
    extra: [],
  },
  {
    id: 'tr.family', title: 'Brothers and sisters', blurb: 'Four chords under one hand, named by the bass', group: 'Transformation',
    core: [...tb('min6'), ...tw('min6'), ...tb('maj6')],
    extra: [...tw('maj6')],
  },
  {
    id: 'tr.major', title: 'The major ii–V–I by formula', blurb: 'Round the circle, up or down, major or minor', group: 'Transformation',
    core: [...tf(['ii-on5', 'ii-tm', 'on5-I', 'tm-I']), ...tx(['ii-on5', 'ii-tm', 'on5-I', 'tm-I'])],
    extra: ['et|maj6|v', ...tf(['on5-tm', 'tm-I5', 'on5-I5']), ...tx(['on5-tm', 'tm-I5', 'on5-I5'])],
  },
  {
    id: 'tr.minor', title: 'Minor ii–V–i and the minor iv', blurb: 'The same few moves in new places', group: 'Transformation',
    core: [...tf(['iio-tm', 'tm-i', 'IV-iv', 'iv-I']), ...tx(['iio-tm', 'tm-i', 'IV-iv', 'iv-I'])],
    extra: [...tf(['I-ii', 'iv-I5', 'I-iii']), ...tx(['I-ii', 'iv-I5'])],
  },
  {
    id: 'sub.center', title: 'The diminished is the center', blurb: 'Every way to play a V chord is one note from the off chord', group: 'Substitution',
    core: [...hq(['on5', 'td', 'tm', 'tt']), ...hp(['on5', 'tm', 'td', 'tt'])],
    extra: [...hp(['b5'])],
  },
  {
    id: 'sub.family', title: 'Three roads home', blurb: 'The minor iv, and the family of chords that resolve', group: 'Substitution',
    core: [...hq(['iv', 'bd']), ...hp(['iv', 'bd'])],
    extra: ['eh|maj6|x'],
  },
  {
    id: 'sub.jobs', title: 'One chord, many jobs', blurb: 'Where each chord you know can be used', group: 'Substitution',
    core: [...su('maj6', ['m7', 'on5']), ...su('min6', ['hdim', 'on5', 'tm', 'iv']), ...su('dom7', ['tt', 'bd'])],
    extra: [],
  },
  {
    id: 'wide', title: 'The wide floors', blurb: 'Drop 3, drop 2 and 4, double octaves', group: 'Wider voicings',
    core: ['drop3', 'drop24', 'dbl'].flatMap((x) => primary('maj6', x)),
    extra: [
      'el|maj6|drop3', 'el|maj6|drop24', ...primary('maj6', 'dbl.alt'), ...others('maj6', 'drop3'), ...others('maj6', 'drop24'),
      ...mv('maj6', 'con', ['drop2', 'drop3'], ['u']), ...mv('maj6', 'con', ['drop24', 'drop3'], ['d']),
    ],
  },
  {
    id: 'lm.intervals', title: 'The elevator of intervals', blurb: 'Each floor by its outside notes, and small floors inside big ones', group: 'Leaps and the mirror',
    core: [
      ...primary('maj6', 'fifth', ON), ...primary('maj6', 'sixth', ON),
      ...fw([['drop2', 'thirds'], ['drop2', 'shell.low'], ['drop2', 'shell.high'], ['triads', 'fifth'], ['shell.low', 'fifth'], ['shell.high', 'thirds'], ['shell.low', 'sixth'], ['oct.low', 'shell.low'], ['oct.low', 'shell.high']]),
    ],
    extra: [
      ...primary('maj6', 'fifth', OFF), ...primary('maj6', 'sixth', OFF), ...primary('maj6', 'oct2', [0, 4]),
      ...fw([['drop2', 'fifth'], ['drop2', 'sixth'], ['oct.triad', 'triads'], ['oct.triad', 'shell.low'], ['oct.high', 'triads'], ['oct.high', 'shell.high'], ['drop3', 'shell.high'], ['drop3', 'sixth'], ['drop24', 'sixth'], ['drop24', 'fifth']]),
    ],
  },
  {
    id: 'lm.leaps', title: 'Leaps', blurb: 'When the melody or the bass skips a note', group: 'Leaps and the mirror',
    core: [
      ...lq([['triads', 1, -1], ['thirds', -1, 1], ['thirds', 2, 1], ['triads', -2, -1], ['triads', 2, 0], ['thirds', 2, 2], ['shell.low', -2, -2], ['triads', -2, 0]]),
      ...lp('maj6', ['thirds', 'triads'], 2, 1), ...lp('maj6', ['triads'], -2, -1),
      ...lp('maj6', ['triads'], 1, -1), ...lp('maj6', ['thirds'], -1, 1),
    ],
    extra: [
      'ej|maj6|b',
      ...lp('maj6', ['shell.low'], -2, -1), ...lp('maj6', ['shell.low'], 1, -1), ...lp('maj6', ['triads'], -1, 1),
      ...lp('maj6', ['thirds'], 2, 2), ...lp('maj6', ['shell.low'], -2, -2), ...lp('maj6', ['thirds', 'triads'], 2, 0, [0, 4]),
      ...lp('maj6', ['triads'], 1, -1, OFF), ...lp('maj6', ['thirds'], -1, 1, OFF),
    ],
  },
  {
    id: 'lm.mirror', title: 'Through the mirror', blurb: 'Pivoting: trade a floor for its reflection', group: 'Leaps and the mirror',
    core: [
      ...pm(['thirds', 'triads', 'shells', 'octaves'], 'w'), ...pm(['drop2', 'drop3', 'drop24', 'dbl'], 'n'),
      ...pv('maj6', ['shell.low', 'triads'], 'in'), ...pv('maj6', ['thirds'], 'out'),
    ],
    extra: [
      'ep|maj6|x', ...pm(['unison'], 'w'), ...pm(['octaves'], 'n'),
      ...pv('maj6', ['oct.low', 'thirds'], 'in'), ...pv('maj6', ['triads'], 'out'),
      ...pv('maj6', ['shell.low', 'triads'], 'in', OFF), ...pv('min6', ['shell.low'], 'in'),
    ],
  },
];

// What comes after the units above. Listed in the app so the road ahead is visible.
export const PLANNED = [
  { title: 'The chromatic scale', blurb: 'Filling the whole steps, leaping the half steps' },
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
  if (kind === 'sc') return { id, kind, fam: p[1], how: p[2] };
  if (kind === 'bw') return { ...base, shape: p[2], set: p[3].split('').map(Number), voice: +p[4], dir: p[5] === 'u' ? 1 : -1, deg: +p[6] };
  if (kind === 'bm') return { ...base, shape: p[2], set: p[3].split('').map(Number), from: p[4] === 'a' ? 1 : -1, deg: +p[5] };
  if (kind === 'tb') return { ...base, role: roleIndex(p[2]) };
  if (kind === 'tw') return { ...base, role: roleIndex(p[2]), dir: { f: 'forward', b: 'backward', a: 'across' }[p[3]] };
  if (kind === 'tf') return { id, kind, move: p[1] };
  if (kind === 'hq') return { id, kind, post: p[1] };
  if (kind === 'hp') return { id, kind, post: p[1], pos: +p[2] };
  if (kind === 'su') return { ...base, job: p[2] };
  if (kind === 'fw') return { ...base, shape: p[2], part: p[3] };
  if (kind === 'lq') return { id, kind, floor: p[1], t: +p[2], df: +p[3] };
  if (kind === 'lp') return { ...base, floor: p[2], t: +p[3], df: +p[4], deg: +p[5] };
  if (kind === 'pm') return { id, kind, floor: p[1], wider: p[2] === 'w' };
  if (kind === 'pv') return { ...base, floor: p[2], how: p[3], deg: +p[4] };
  if (kind === 'tx') return { id, kind, move: p[1], role: roleIndex(p[2]) };
  if (kind === 'sh') return { ...base, shape: p[2], set: p[3].split('').map(Number), anchor: p[4] === 't' ? 'top' : 'bottom', deg: +p[5] };
  return { ...base, deg: +p[2] };
}

export const SECTION = { oo: 'path', st: 'path', nm: 'path', wk: 'path', sh: 'floors', bw: 'borrow', bm: 'borrow', mq: 'motion', mv: 'motion', tb: 'transform', tw: 'transform', tf: 'transform', tx: 'transform', fw: 'leaps', lq: 'leaps', lp: 'leaps', pm: 'leaps', pv: 'leaps', hq: 'subs', hp: 'subs', su: 'subs', eh: 'ear', sc: 'tunes', et: 'ear', ej: 'ear', ep: 'ear', eb: 'ear', eo: 'ear', ed: 'ear', ef: 'ear', ei: 'ear', el: 'ear', em: 'ear' };
export const SECTION_NAME = { path: 'The path', floors: 'Floors', borrow: 'Borrowing', motion: 'Motion', leaps: 'Leaps and pivots', transform: 'Transformation', subs: 'Substitution', tunes: 'Tunes', ear: 'Ear' };
const kindOf = (id) => id.slice(0, 2);
const AWAY_ONLY = new Set(['oo', 'mq', 'tf', 'lq', 'pm', 'hq']);
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

  const bySection = { path: [], floors: [], borrow: [], motion: [], leaps: [], transform: [], subs: [], tunes: [], ear: [] };
  for (const id of picked) bySection[SECTION[kindOf(id)]].push(id);
  const out = [];
  out.push(...shuffle(bySection.path).map((id) => ({ id })));
  // New shapes are shown before they are asked for.
  const newShapes = bySection.floors.filter(isNew);
  out.push(...newShapes.map((id) => ({ id, study: true })));
  out.push(...shuffle(bySection.floors).map((id) => ({ id })));
  out.push(...shuffle(bySection.borrow).map((id) => ({ id })));
  out.push(...shuffle(bySection.motion).map((id) => ({ id })));
  out.push(...shuffle(bySection.leaps).map((id) => ({ id })));
  out.push(...shuffle(bySection.transform).map((id) => ({ id })));
  out.push(...shuffle(bySection.subs).map((id) => ({ id })));
  out.push(...shuffle(bySection.tunes).map((id) => ({ id })));
  out.push(...shuffle(bySection.ear).map((id) => ({ id })));
  return out;
}

export function summarize(session) {
  const counts = { path: { n: 0, fresh: 0 }, floors: { n: 0, fresh: 0 }, borrow: { n: 0, fresh: 0 }, motion: { n: 0, fresh: 0 }, leaps: { n: 0, fresh: 0 }, transform: { n: 0, fresh: 0 }, subs: { n: 0, fresh: 0 }, tunes: { n: 0, fresh: 0 }, ear: { n: 0, fresh: 0 } };
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
  if (SECTION[k] === 'borrow') return 'borrow';
  if (SECTION[k] === 'leaps') return 'leaps';
  if (SECTION[k] === 'transform') return 'transform';
  if (SECTION[k] === 'subs') return 'subs';
  if (SECTION[k] === 'tunes') return 'tunes';
  return 'unison';
}
export const scaleName = (s) => SCALES[s].name;
export { state };
