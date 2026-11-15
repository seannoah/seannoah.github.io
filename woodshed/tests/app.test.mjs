// Run with: node --test woodshed/tests/*.test.mjs
// Checks the parts of the app that do not need a browser: the item catalogue, session
// building, the spaced-repetition record, merging two devices' progress, and the sync
// conversation with GitHub (against a small in-memory stand-in for its API).
import test from 'node:test';
import assert from 'node:assert/strict';

// ---- a pretend browser, set up before the app modules load ----
const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
};
globalThis.location = { hostname: 'someone.github.io' };
globalThis.document = { addEventListener() {} };
globalThis.window = { addEventListener() {} };
Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, configurable: true });

// ---- a pretend GitHub contents API ----
const github = { file: null, sha: 0, repoExists: true, token: 'good-token', puts: 0, failNextPut: false };
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const reply = (status, body = {}) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
globalThis.fetch = async (url, opts = {}) => {
  if (opts.headers.Authorization !== `Bearer ${github.token}`) return reply(401);
  if (!github.repoExists) return reply(404);
  if (!url.includes('/contents/')) return reply(200, {});
  if (!opts.method || opts.method === 'GET') {
    if (github.file == null) return reply(404);
    return reply(200, { sha: String(github.sha), content: b64(github.file).replace(/(.{60})/g, '$1\n') });
  }
  const body = JSON.parse(opts.body);
  if (github.failNextPut) { github.failNextPut = false; github.sha++; return reply(409); }
  if (github.file != null && body.sha !== String(github.sha)) return reply(409);
  github.file = Buffer.from(body.content, 'base64').toString('utf8');
  github.sha++; github.puts++;
  return reply(200, {});
};

const store = await import('../js/store.js');
const cur = await import('../js/curriculum.js');
const sync = await import('../js/sync.js');
const { voicingFor } = await import('../js/floors.js');
const { walkPath, walkStart } = await import('../js/theory.js');
const { movePair, floorAfter } = await import('../js/motion.js');

test('every item in the catalogue is well formed and playable in C', () => {
  const ids = cur.catalogue();
  assert.ok(ids.length > 500);
  assert.equal(new Set(ids).size, ids.length, 'no duplicate ids');
  for (const id of ids) {
    const it = cur.parse(id);
    assert.ok(cur.SECTION[it.kind], id);
    if (it.kind === 'sh') assert.ok(voicingFor('C', it.scale, it.shape, it.set, it.anchor, it.deg), id);
    if (it.kind === 'wk') assert.equal(walkPath('C', it.scale, it.string, walkStart('C', it.scale, it.string)).length, 9, id);
    if (it.kind === 'mv') {
      const m = movePair('C', it);
      assert.ok(m, id);
      const want = it.move === 'par' ? 'parallel' : it.move === 'con' ? 'contrary' : 'oblique';
      assert.equal(m.motion, want, id);
      assert.ok(Math.abs(m.top) <= 1 && Math.abs(m.bass) === 1, `${id}: outer voices move by step`);
    }
    if (it.kind === 'mq') assert.ok(floorAfter(it.floor, it.how), id);
  }
});

test('the motion units sit between the small floors and the four-note floors', () => {
  const ids = cur.UNITS.map((u) => u.id);
  assert.deepEqual(ids.slice(2, 10), ['thirds', 'triads', 'shells', 'motion.steps', 'motion.oblique', 'octaves', 'drop2', 'motion.wide']);
  store.resetAll();
  for (const u of cur.UNITS.slice(0, 5)) for (const id of u.core) store.grade(id, 'right');
  assert.equal(cur.currentUnit().id, 'motion.steps');
  const s = cur.buildSession('away', 10);
  assert.ok(s.some((x) => x.id.startsWith('mq|')) && s.some((x) => x.id.startsWith('mv|')));
  assert.ok(cur.buildSession('guitar', 10).every((x) => !x.id.startsWith('mq|')), 'the which-floor quiz is for away mode');
  // a unit you have already started stays on even if units are added before it later
  store.resetAll();
  store.grade(cur.unitById('octaves').core[0], 'right');
  assert.ok(cur.isActive(cur.unitById('octaves')));
});

test('walks start on the root when it sits low, otherwise on an on-chord note', () => {
  assert.equal(walkStart('C', 'maj6', 2), 1); // C, the root
  assert.equal(walkStart('C', 'maj6', 4), 2); // E, the third (as in Foundations I, p. 38)
  assert.equal(walkStart('C', 'maj6', 5), 3); // C, the root
  for (const s of [1, 2, 3, 4, 5, 6]) assert.ok(walkPath('C', 'maj6', s, walkStart('C', 'maj6', s))[8].fret <= 17);
});

test('a first session is all new material from the first unit, sized to the time asked for', () => {
  store.resetAll();
  const s = cur.buildSession('away', 10);
  assert.ok(s.length >= 15 && s.length <= 40, `size ${s.length}`);
  const first = cur.UNITS[0];
  const allowed = new Set([...first.core, ...first.extra]);
  assert.ok(s.every((x) => allowed.has(x.id)));
  assert.ok(first.core.every((id) => s.some((x) => x.id === id)), 'all of the first unit core is introduced');
  assert.ok(s.some((x) => x.id.startsWith('e')), 'includes ear training');
  // guitar mode leaves out the on/off quiz, which needs no guitar
  assert.ok(cur.buildSession('guitar', 10).every((x) => !x.id.startsWith('oo|')));
});

test('units unlock in order as their core items are answered correctly', () => {
  store.resetAll();
  assert.deepEqual(cur.activeUnits().map((u) => u.id), ['scale']);
  for (const id of cur.UNITS[0].core) store.grade(id, 'right');
  assert.deepEqual(cur.activeUnits().map((u) => u.id), ['scale', 'path']);
  assert.equal(cur.currentUnit().id, 'path');
  // new shapes are shown (study) before they are asked for
  for (const id of cur.UNITS[1].core) store.grade(id, 'right');
  const s = cur.buildSession('away', 10);
  const firstTest = s.findIndex((x) => x.id.startsWith('sh|') && !x.study);
  const studies = s.filter((x) => x.study);
  assert.ok(studies.length > 0);
  assert.ok(s.indexOf(studies[studies.length - 1]) < firstTest);
});

test('spaced repetition: right answers push an item out, wrong answers pull it back', () => {
  store.resetAll();
  const id = 'oo|maj6|0';
  const today = store.dayNumber();
  store.grade(id, 'right');
  assert.equal(store.rec(id).b, 1); assert.equal(store.rec(id).d, today + 1);
  assert.equal(store.isDue(id), false);
  store.grade(id, 'right'); assert.equal(store.rec(id).d, today + 2); assert.ok(store.isLearned(id));
  store.grade(id, 'right'); assert.equal(store.rec(id).d, today + 4);
  store.grade(id, 'wrong'); assert.equal(store.rec(id).b, 1); assert.ok(store.isDue(id));
  store.grade(id, 'shaky'); assert.equal(store.rec(id).d, today + 1);
  assert.equal(store.dayTotal(store.dayKey()).n, 5);
  assert.equal(store.streak(), 1);
});

test('merging two devices keeps the newest record per item and adds up the day', () => {
  const day = '2026-11-15';
  const phone = { settings: { mode: 'away' }, settingsAt: 5, items: { a: { b: 2, d: 9, n: 3, r: 2, t: 100 }, b: { b: 1, d: 9, n: 1, r: 1, t: 50 } }, units: { scale: { read: 10 } }, days: { [day]: { phone: { n: 4, ok: 3, s: 60 } } } };
  const laptop = { settings: { mode: 'guitar' }, settingsAt: 9, items: { a: { b: 0, d: 9, n: 4, r: 2, t: 200 } }, units: { scale: { read: 7, on: 8 } }, days: { [day]: { laptop: { n: 6, ok: 6, s: 90 } } } };
  const m = store.merge(phone, laptop);
  assert.equal(m.items.a.t, 200); assert.equal(m.items.b.t, 50);
  assert.equal(m.settings.mode, 'guitar');
  assert.deepEqual(m.units.scale, { read: 7, on: 8 });
  assert.deepEqual(Object.keys(m.days[day]).sort(), ['laptop', 'phone']);
  // order does not matter, and merging again changes nothing
  assert.equal(store.canonical(store.merge(laptop, phone)), store.canonical(m));
  assert.equal(store.canonical(store.merge(m, phone)), store.canonical(m));
});

test('erasing progress on one device is not undone by another device', () => {
  const old = { items: { a: { b: 3, d: 1, n: 5, r: 5, t: 100 } }, units: { scale: { read: 50 } }, days: {} };
  const erased = { resetAt: 150, items: {}, units: {}, days: {} };
  const m = store.merge(old, erased);
  assert.deepEqual(m.items, {}); assert.deepEqual(m.units, {}); assert.equal(m.resetAt, 150);
  const later = store.merge(m, { items: { a: { b: 1, d: 1, n: 1, r: 1, t: 300 } }, units: {}, days: {} });
  assert.equal(later.items.a.t, 300, 'practice after the erase is kept');
});

test('sync: first run creates the file, later runs merge both ways', async () => {
  store.resetAll();
  github.file = null; github.puts = 0;
  assert.equal(sync.defaultRepo(), 'someone/woodshed-data');
  sync.setConfig({ repo: 'someone/woodshed-data', token: 'good-token' });
  store.grade('oo|maj6|0', 'right');
  assert.equal(await sync.syncNow(), true);
  assert.equal(github.puts, 1);
  assert.ok(JSON.parse(github.file).items['oo|maj6|0']);

  // nothing changed: no second write
  assert.equal(await sync.syncNow(), true);
  assert.equal(github.puts, 1);

  // another device adds an item to the file; this device adds a different one
  const remote = JSON.parse(github.file);
  remote.items['oo|maj6|1'] = { b: 1, d: 1, n: 1, r: 1, t: Date.now() };
  github.file = JSON.stringify(remote); github.sha++;
  store.grade('oo|maj6|2', 'right');
  assert.equal(await sync.syncNow(), true);
  assert.equal(sync.status.pulled, true);
  for (const id of ['oo|maj6|0', 'oo|maj6|1', 'oo|maj6|2']) {
    assert.ok(store.rec(id), `local has ${id}`);
    assert.ok(JSON.parse(github.file).items[id], `remote has ${id}`);
  }
});

test('sync: a clash with another device is retried, and bad setups are explained', async () => {
  store.grade('oo|maj6|3', 'right');
  github.failNextPut = true;
  assert.equal(await sync.syncNow(), true);
  assert.ok(JSON.parse(github.file).items['oo|maj6|3']);

  sync.setConfig({ repo: 'someone/woodshed-data', token: 'wrong' });
  assert.equal(await sync.syncNow(), false);
  assert.match(sync.status.message, /token/i);

  sync.setConfig({ repo: 'someone/woodshed-data', token: 'good-token' });
  github.repoExists = false;
  assert.equal(await sync.syncNow(), false);
  assert.match(sync.status.message, /not found/i);
  github.repoExists = true;

  sync.setConfig({ repo: 'someone/woodshed-data', token: '' });
  assert.equal(await sync.syncNow(), false);
});
