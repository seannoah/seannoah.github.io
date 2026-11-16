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
const { borrowPair, underBorrowed } = await import('../js/borrow.js');
const { MOVES } = await import('../js/transform.js');
const { leapPair, bassMove } = await import('../js/motion.js');
const { pivotPair, reflectFloor } = await import('../js/mirror.js');
const { partsInside, SHAPES: ALL_SHAPES, FLOORS: ALL_FLOORS } = await import('../js/floors.js');
const { POSTS, hubPair, jobById } = await import('../js/subs.js');

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
    if (it.kind === 'tb' || it.kind === 'tw' || it.kind === 'tx') assert.ok(it.role >= 0 && it.role < 4, id);
    if (it.kind === 'tw') assert.ok(['forward', 'backward', 'across'].includes(it.dir), id);
    if (it.kind === 'tf' || it.kind === 'tx') assert.ok(MOVES[it.move], id);
    if (it.kind === 'hq') assert.equal(POSTS[it.post].moves.length, 1, `${id}: one note moves`);
    if (it.kind === 'hp') assert.ok(hubPair(0, it.post, it.pos), id);
    if (it.kind === 'su') assert.ok(jobById(it.scale, it.job).ask, id);
    if (it.kind === 'fw') assert.ok(partsInside(it.shape, it.part).length, `${id}: the part is in there`);
    if (it.kind === 'lq') assert.ok(ALL_SHAPES[it.floor] && Number.isInteger(bassMove(it.t, it.df)), id);
    if (it.kind === 'lp') {
      const m = leapPair('C', it);
      assert.ok(m, id);
      assert.equal(m.bass, bassMove(it.t, it.df), id);
      assert.ok(Math.abs(m.top) > 1 || Math.abs(m.bass) > 1, `${id}: a voice leaps`);
    }
    if (it.kind === 'pm') assert.ok(reflectFloor(it.floor, it.wider), id);
    if (it.kind === 'pv') {
      const m = pivotPair('C', it);
      assert.ok(m && m.accept.length, id);
      assert.equal(m.to.notes[m.to.notes.length - 1].midi - m.to.notes[0].midi - (m.straight ? m.straight.notes[m.straight.notes.length - 1].midi - m.straight.notes[0].midi : 0), 12, `${id}: an octave wider than the chord that was due`);
    }
    if (it.kind === 'bw') {
      const b = borrowPair('C', it);
      assert.ok(b, id);
      assert.notEqual(b.moved.deg % 2, b.old.deg % 2, `${id}: the borrowed note comes from the other chord`);
    }
    if (it.kind === 'bm') {
      const b = underBorrowed('C', it);
      assert.ok(b, id);
      assert.equal(b.moved.deg, it.deg, id);
      assert.ok(b.notes.slice(0, -1).every((n) => n.deg % 2 === 0), `${id}: an on chord beneath`);
    }
  }
});

test('the motion units sit between the small floors and the four-note floors', () => {
  const ids = cur.UNITS.map((u) => u.id);
  assert.deepEqual(ids.slice(2, 12), ['thirds', 'triads', 'shells', 'borrow.voice', 'borrow.melody', 'motion.steps', 'motion.oblique', 'octaves', 'drop2', 'motion.wide']);
  store.resetAll();
  for (const u of cur.UNITS.slice(0, 5)) for (const id of u.core) store.grade(id, 'right');
  assert.equal(cur.currentUnit().id, 'borrow.voice');
  assert.ok(cur.buildSession('guitar', 10).some((x) => x.id.startsWith('bw|')), 'borrowing has a guitar-in-hand form');
  for (const u of cur.UNITS.slice(5, 7)) for (const id of u.core) store.grade(id, 'right');
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

// ---- songs ----
const songs = await import('../js/songs.js');
const { TUNES } = await import('../js/tunes.js');
const { parseChart, parseChord } = await import('../js/harmony.js');

test('every built-in tune reads cleanly and can be played through', () => {
  assert.ok(TUNES.length >= 3);
  for (const tune of TUNES) {
    const read = songs.readSong(tune);
    assert.ok(read.bars.length >= 4, tune.id);
    const typed = tune.chart.replace(/^\s*[A-Z]\s*\|/gm, '|').split(/[|\s]+/).filter((t) => t && t !== '%');
    for (const symbol of typed) assert.ok(parseChord(symbol), `${tune.id}: "${symbol}" was understood`);
    assert.equal(read.bars.length, tune.chart.split('|').length - 1 - tune.chart.trim().split('\n').length, `${tune.id}: bar count`);
    assert.ok(read.bars.every((b) => b.chords.length >= 1 && Math.abs(b.chords.reduce((n, c) => n + c.len, 0) - 1) < 1e-9), `${tune.id}: every bar is filled`);
    for (const shape of ['thirds', 'triads', 'shell.low', 'drop2']) {
      const steps = songs.playThrough(read, shape);
      const missing = steps.filter((s) => s.note && s.note.deg >= 0 && !s.voicing).length;
      assert.ok(missing <= steps.length * 0.1, `${tune.id} ${shape}: ${missing} of ${steps.length} steps have no shape`);
    }
    if (tune.melody) {
      assert.equal(tune.melody.length, read.bars.length, `${tune.id}: one melody line per bar`);
      const outside = read.melody.filter((n) => n.deg < 0).length;
      assert.ok(outside <= read.melody.length * 0.25, `${tune.id}: ${outside} of ${read.melody.length} melody notes fall outside the chosen scales`);
      tune.melody.forEach((line, i) => {
        const total = line.trim().split(/\s+/).filter(Boolean).reduce((sum, t) => sum + (parseFloat(t.split(':')[1]) || 0), 0);
        if (line.includes(':')) assert.ok(Math.abs(total - (tune.beats || 4)) < 0.01 || tune.pickup === i, `${tune.id} bar ${i + 1}: lengths add up to ${total}`);
      });
    }
  }
});

test('a melody is read as degrees of each bar\'s scale and gets a shape beneath it', () => {
  // All the Things You Are, bar 1 as taught in "5 Chord Melody Games": A♭ held over Fm7,
  // read as the root of A♭ major 6.
  const read = songs.readSong({ id: 'x', key: 'Ab', beats: 4, chart: '| Fm7 | Bbm7 |', melody: ['Ab4:4', 'Db5:4'] });
  assert.equal(read.chords[0].use.label, 'A♭ major 6');
  assert.equal(read.melody[0].say, 'root');
  assert.equal(read.melody[0].on, true);
  const v = songs.shapeUnder(read.chords[0].use, 'thirds', read.melody[0].midi);
  assert.deepEqual(v.notes.map((n) => n.midi), [65, 68]);    // F and A♭, the third beneath the melody note
  assert.equal(v.notes[1].string <= 2, true);                // with the melody on one of the top two strings
  assert.equal(read.melody[1].say, 'root');                 // D♭ over B♭m7 = D♭ major 6
  // note names alone share the bar, taking the nearest octave to the note before
  const loose = songs.parseMelody(['G A B', 'C5:4'], 3);
  assert.deepEqual(loose.map((n) => [n.midi, n.dur]), [[67, 1], [69, 1], [71, 1], [72, 4]]);
});

test('your own tunes and choices are stored, merged between devices, and survive an erase', () => {
  const id = songs.saveOwnSong(null, { title: 'Mine', key: 'C', chart: '| Dm7 | G7 | C6 |' });
  assert.ok(songs.songById(id));
  songs.setPrefs(id, { shift: 2 });
  assert.equal(songs.readSong(songs.songById(id)).chords[0].text, 'Em7');
  const other = { songs: { [id]: { title: 'Mine, edited elsewhere', key: 'C', chart: '| C6 |', t: Date.now() + 1000 } }, items: {}, units: {}, days: {} };
  assert.equal(store.merge(store.state, other).songs[id].title, 'Mine, edited elsewhere');
  store.resetAll();
  assert.ok(songs.songById(id), 'erasing progress keeps your tunes');
  songs.deleteOwnSong(id);
  assert.equal(songs.songById(id), null);
});

test('Embraceable You is read the way its MetaScore reads it', () => {
  const read = songs.readSong(TUNES.find((t) => t.id === 'embraceable'));
  const at = (bar) => read.chords.filter((c) => c.bar === bar - 1).map((c) => c.use.label).join(', ');
  // Polyphonic track, MetaScore pp. 13-15
  assert.equal(at(1), 'F major 6');
  assert.equal(at(2), 'A♭ diminished');
  assert.equal(at(4), 'D♭ minor 6');
  assert.equal(at(6), 'B♭ minor 6, D♭ minor 6');
  assert.equal(at(8), 'G minor 6, B♭ minor 6');
  assert.equal(at(9), 'F major 6');
  assert.equal(at(10), 'D minor 6, F minor 6');
  assert.equal(at(11), 'A minor 6');
  assert.equal(at(13), 'C major 6, F major 6');             // the D♭ diminished read as the off chord of F major 6
  assert.equal(at(24), 'E♭ major 6, G♭ minor 6');
  assert.equal(at(28), 'D minor 6, D♭ major 6, B♭ minor 6');
  assert.equal(at(29), 'F major 6, B♭ major 6, C major 6');
  assert.equal(at(30), 'B♭ minor 6, D♭ minor 6');
  // Scale "Degrees" track
  const degs = (bar) => read.melody.filter((n) => n.bar === bar - 1).map((n) => n.label).join(' ');
  assert.equal(degs(1), '6 7 R');
  assert.equal(degs(2), '5 · ♭7');
  assert.equal(degs(6), '6 ♯5 6');
  assert.equal(degs(9), '3 R 2 R');
  assert.equal(degs(13), '5 3 R 7');
  assert.equal(degs(26), '♭3 2 6 7');
  assert.equal(degs(29), '3 R R');
});

test('in a tune, an off melody note can keep the on chord beneath it', () => {
  const tune = TUNES.find((t) => t.id === 'embraceable');
  const read = songs.readSong(tune);
  const plain = songs.playThrough(read, 'shell.low', false);
  const leaning = songs.playThrough(read, 'shell.low', true);
  assert.equal(plain.length, leaning.length);
  const offSteps = leaning.filter((s) => s.note.deg % 2 === 1 && s.voicing);
  assert.ok(offSteps.length > 10);
  assert.ok(offSteps.filter((s) => s.voicing.borrowed).length >= offSteps.length * 0.8, 'most off notes found a borrowed shape');
  for (const s of offSteps.filter((x) => x.voicing.borrowed)) {
    const top = s.voicing.notes[s.voicing.notes.length - 1];
    assert.equal(top.midi, s.note.midi, 'the melody note stays on top');
    assert.ok(s.voicing.notes.slice(0, -1).every((n) => n.deg % 2 === 0), 'on chord notes beneath it');
  }
  // bar 1: the melody E is the major seven of F major 6, borrowed over F6
  const bar1 = leaning.filter((s) => s.bar === 0);
  assert.equal(bar1[1].note.say, 'major seven');
  assert.ok(bar1[1].voicing.borrowed);
  assert.equal(plain.filter((s) => s.voicing && s.voicing.borrowed).length, 0);
});

test('Stella by Starlight is read the way Standards Series Unit 4 reads it', () => {
  const read = songs.readSong(TUNES.find((t) => t.id === 'stella'));
  assert.equal(read.bars.length, 32);
  const at = (bar) => read.chords.filter((c) => c.bar === bar - 1).map((c) => c.use.label).join(', ');
  const want = {
    1: 'D♭ diminished', 2: 'D♭ diminished', 3: 'E♭ major 6', 4: 'G♭ minor 6', 5: 'A♭ major 6', 6: 'B minor 6', 7: 'E♭ major 6', 8: 'E♭ minor 6',
    9: 'B♭ major 6', 10: 'G minor 6, B♭ minor 6', 11: 'F major 6', 12: 'D♭ major 6, B♭ minor 6', 13: 'F major 6', 15: 'E♭ major 6', 16: 'C minor 6, E♭ minor 6',
    17: 'A♭ minor 6', 18: 'A♭ minor 6', 19: 'E♭ major 6', 21: 'E♭ minor 6', 22: 'E♭ minor 6', 23: 'B♭ major 6',
    25: 'G minor 6', 26: 'B♭ minor 6', 27: 'F minor 6', 28: 'A♭ minor 6', 29: 'E♭ minor 6', 30: 'G♭ minor 6', 31: 'B♭ major 6',
  };
  for (const [bar, label] of Object.entries(want)) assert.equal(at(+bar), label, `bar ${bar}`);
  const moves = read.chords.filter((c) => c.movement && c.movement.start).map((c) => `${c.bar + 1} ${c.movement.name}`);
  assert.ok(moves.includes('1 Flat-3 diminished') && moves.includes('3 Major ii–V7') && moves.includes('25 Minor iiø–V7'));
});

test('transformation comes after reading a chart, and its formula quiz is for away mode', () => {
  const ids = cur.UNITS.map((u) => u.id);
  const at = ids.indexOf('chart');
  assert.deepEqual(ids.slice(at, at + 4), ['chart', 'tr.family', 'tr.major', 'tr.minor']);
  assert.ok(!cur.PLANNED.some((x) => x.title === 'Transformation'));
  store.resetAll();
  const family = cur.unitById('tr.family');
  const away = cur.buildSession('away', 10, family);
  assert.ok(away.every((x) => cur.SECTION[x.id.slice(0, 2)] === 'transform'));
  assert.ok(away.some((x) => x.id.startsWith('tb|')));
  const major = cur.unitById('tr.major');
  assert.ok(cur.buildSession('away', 10, major).some((x) => x.id.startsWith('tf|')));
  const guitar = cur.buildSession('guitar', 20, major);
  assert.ok(guitar.length && guitar.every((x) => !x.id.startsWith('tf|')), 'naming a formula is for away mode');
  assert.ok(guitar.some((x) => x.id.startsWith('tx|')));
  assert.equal(cur.summarize(away).transform.n, away.length);
});

test('the formulas between the chords of Stella match the Standards Series (4.1 and 4.5)', () => {
  const read = songs.readSong(TUNES.find((t) => t.id === 'stella'));
  const chordsIn = (bar) => read.chords.filter((c) => c.bar === bar - 1);
  const into = (bar, k = 0) => songs.formulasAt(read, chordsIn(bar)[k]).from.text;
  assert.equal(into(4), '[Backward, Minor]');        // "the ii-V7 by going BACKWARDS and MINOR"
  assert.equal(into(6), '[Backward, Minor]');
  assert.equal(into(8), '[Minor]');                  // the minor iv
  assert.equal(into(10), '[Forward, Minor]');        // the movement to iii: "lowering the 5th of a major 6 chord"
  assert.equal(into(11), '[Across, Up, Major]');
  assert.equal(into(12, 1), '[Forward, Minor]');     // the minor iv again
  assert.equal(into(13), '[Across, Up, Major]');
  assert.equal(songs.formulasAt(read, chordsIn(1)[0]).sixth, false, 'a diminished bar has no formula');
  const moves = songs.songMoves(read);
  assert.ok(moves.length >= 3 && moves.every((m) => MOVES[m.move]));
  assert.equal(new Set(moves.map((m) => m.move)).size, moves.length);
});

test('leaps and the mirror come last, and the two rule quizzes are for away mode', () => {
  const ids = cur.UNITS.map((u) => u.id);
  assert.deepEqual(ids.slice(-3), ['lm.intervals', 'lm.leaps', 'lm.mirror']);
  assert.equal(ids[ids.length - 4], 'wide', 'pivoting needs the wide floors first');
  // the frames are summoned like any other shape and count toward the floor they frame
  const frames = cur.unitById('lm.intervals').core.filter((id) => id.startsWith('sh|'));
  assert.equal(frames.length, 16);
  assert.deepEqual([...new Set(frames.map(cur.floorOfItem))], ['triads', 'shells']);
  // frames are not floors: the ear drill for floors and the Explore list of floors do not pick them up
  assert.ok(ALL_FLOORS.every((f) => f.shapes.every((id) => !ALL_SHAPES[id].frame)));
  for (const unit of ['lm.leaps', 'lm.mirror']) {
    const u = cur.unitById(unit);
    const quiz = u.core.filter((id) => /^(lq|pm)\|/.test(id));
    assert.equal(quiz.length, 8);
    const guitar = cur.buildSession('guitar', 10, u).map((x) => x.id);
    const away = cur.buildSession('away', 10, u).map((x) => x.id);
    assert.ok(guitar.length && guitar.every((id) => !/^(lq|pm)\|/.test(id)), `${unit}: nothing to tap with a guitar in hand`);
    assert.ok(away.some((id) => /^(lq|pm)\|/.test(id)));
  }
  assert.equal(cur.SECTION_NAME[cur.SECTION.pv], 'Leaps and pivots');
  assert.equal(cur.PLANNED.length, 1);
  assert.equal(cur.floorOfItem('pv|maj6|triads|in|0'), 'leaps');
});

test('substitution follows transformation, and every step can be practiced with the guitar', () => {
  const ids = cur.UNITS.map((u) => u.id);
  const at = (id) => ids.indexOf(id);
  assert.deepEqual(ids.slice(at('tr.minor') + 1, at('wide')), ['sub.center', 'sub.family', 'sub.jobs']);
  for (const unit of ['sub.center', 'sub.family', 'sub.jobs', 'chart']) {
    const u = cur.unitById(unit);
    const guitar = cur.buildSession('guitar', 10, u).map((x) => x.id);
    assert.ok(guitar.length, `${unit} has something to play`);
    assert.ok(guitar.every((id) => !id.startsWith('hq|')), 'naming the note that moves is for away mode');
  }
  // the center step asks for the four one-note ways of playing a V chord, from every position
  const center = cur.unitById('sub.center');
  assert.equal(center.core.filter((id) => id.startsWith('hp|')).length, 16);
  assert.ok(cur.buildSession('away', 10, center).some((x) => x.id.startsWith('hq|')));
  assert.equal(cur.SECTION_NAME[cur.SECTION.hp], 'Substitution');
  assert.equal(cur.floorOfItem('su|min6|tm'), 'subs');
  assert.equal(cur.SECTION.eh, 'ear');
});

test('a tune\'s dominants are read from their center', () => {
  const { TUNES } = songs;
  const train = songs.readSong(TUNES.find((t) => t.id === 'a-train'));
  // D7 does not resolve down a fifth: the minor 6 on the 5, A minor 6, which is one note from F♯°7
  const d7 = songs.centerOf(train.chords.find((c) => c.text === 'D7'));
  assert.deepEqual([d7.id, d7.post.label, d7.post.center, d7.post.moves[0].say], ['on5', 'Am6', 'F♯°7', 'sharp five']);
  // G7 resolves to C: the tritone's minor, A♭ minor 6, which is B°7 with its second raised
  const g7 = songs.centerOf(train.chords.find((c) => c.text === 'G7' && c.resolves));
  assert.deepEqual([g7.id, g7.post.label, g7.post.center, g7.post.moves[0].say], ['tm', 'A♭m6', 'B°7', 'second']);
  assert.equal(songs.centerOf(train.chords.find((c) => c.text === 'Dm7')), null);
  // practice items: only the dominants that go home to a major chord
  const items = songs.songCenters(train);
  assert.deepEqual(items.map((m) => [m.id, m.tonic, m.from.text, m.to.text]), [['tm', 0, 'G7', 'C6']]);
  const you = songs.songCenters(songs.readSong(TUNES.find((t) => t.id === 'another-you')));
  assert.ok(you.length >= 1 && you.every((m) => m.to.family === 'maj' && hubPair(m.tonic, m.id, m.pos)));
});

// ---- the Ear tab ----
const ear = await import('../js/ear.js');
const seeded = (seed = 11) => () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

test('every ear game makes a full round at every level, with something to play and one right answer', () => {
  const rng = seeded();
  for (const game of ear.GAMES) {
    assert.ok(game.tip && game.blurb && ear.SHELVES.some((s) => s.id === game.shelf), game.id);
    for (let level = 0; level < game.levels.length; level++) {
      for (let round = 0; round < 6; round++) {
        const r = ear.makeRound(game.id, level, { rng });
        assert.equal(r.questions.length, game.count, `${game.id} ${level}`);
        for (const q of r.questions) {
          const where = `${game.id} level ${level + 1}`;
          assert.ok(q.sound.length && q.sound.every((ev) => ev.at >= 0 && ev.midis.every((m) => m >= 40 && m <= 88)), `${where}: playable`);
          const words = [q.prompt, q.hint, q.kicker, q.reveal ? q.reveal.text : '', ...(q.options || []).map((o) => o.text)];
          assert.ok(words.every((w) => typeof w === 'string' && !/undefined|NaN|null/.test(w)), `${where}: ${words.join(' / ')}`);
          if (q.form === 'choice') {
            assert.equal(q.choices.filter((c) => c.value === q.answer).length, 1, `${where}: the answer is one of the choices`);
            assert.ok(q.reveal.neck.marks.length && q.reveal.neck.hi > q.reveal.neck.lo, where);
          }
          if (q.form === 'tap') {
            assert.equal(q.notes.length, game.levels[level].notes, where);
            assert.ok(q.notes.every((n) => n.string === q.string && n.fret >= q.lo && n.fret <= q.hi), `${where}: the phrase is on screen`);
            assert.ok(q.hi - q.lo <= 8, `${where}: no sideways scrolling on a phone`);
            assert.ok(q.notes.every((n, i) => i === 0 || n.fret !== q.notes[i - 1].fret), where);
            assert.equal(!!q.landmark, !!game.levels[level].blind);
          }
          if (q.form === 'self') assert.ok(q.check.length, where);
          if (q.form === 'free') {
            assert.ok(q.options.length >= 2 && q.options.every((o) => o.landed % 2 === 0 && o.sound.length === 2), `${where}: every way out lands on an on note`);
            assert.equal(q.target % 2, 1, `${where}: it starts from an off note`);
            assert.ok([q.neck, ...q.options.map((o) => o.neck)].every((n) => n.hi - Math.max(1, n.lo) <= 8 && n.marks.every((m) => m.fret >= n.lo && m.fret <= n.hi)), `${where}: fits a phone`);
          }
        }
      }
    }
  }
});

test('ear rounds stay in one key where the ear needs to settle, and lean on what was missed', () => {
  const rng = seeded(3);
  // which degree, level 4: the chord sounds on questions 1, 4, 7 and 10 only
  const d = ear.makeRound('degree', 3, { rng }).questions;
  assert.deepEqual(d.map((q) => q.sound.length), [2, 1, 1, 2, 1, 1, 2, 1, 1, 2]);
  assert.ok(d.filter((q) => q.sound.length === 1).every((q) => q.again.length === 1), 'the chord is still there to ask for');
  assert.equal(new Set(d.map((q) => q.kicker)).size, 1, 'one key for the whole round');
  // level 5: major or minor for the round, and the chord only at the start
  const e = ear.makeRound('degree', 4, { rng }).questions;
  assert.deepEqual(e.map((q) => q.sound.length), [2, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  assert.equal(new Set(e.map((q) => q.kicker)).size, 1);
  // the same answer never comes three times running
  for (let k = 0; k < 20; k++) {
    const a = ear.makeRound('onoff', 0, { rng }).questions.map((q) => q.target);
    assert.ok(a.every((x, i) => i < 2 || !(a[i - 1] === x && a[i - 2] === x)));
  }
  // a degree that has been missed a lot is asked more often than one that never is
  const stats = { 'degree|maj6|6': { n: 10, x: 9 }, 'degree|maj6|0': { n: 10, x: 0 }, 'degree|maj6|2': { n: 10, x: 0 }, 'degree|maj6|4': { n: 10, x: 0 } };
  const count = { 0: 0, 6: 0 };
  for (let k = 0; k < 60; k++) for (const q of ear.makeRound('degree', 0, { rng, stats }).questions) if (q.target in count) count[q.target]++;
  assert.ok(count[6] > count[0] * 1.8, `the sixth ${count[6]} times, the root ${count[0]}`);
  assert.deepEqual(ear.weakest(stats).map((w) => [w.label, w.missed, w.asked, w.game.id]), [['the sixth', 9, 10, 'degree']]);
  assert.equal(ear.statLabel('voices|con'), 'contrary motion');
  assert.equal(ear.statLabel('degree|min6|2'), 'the minor third in minor 6');
  // timed levels say so; quick rounds mix the games and never run a clock
  assert.ok(ear.makeRound('onoff', 3, { rng }).questions.every((q) => q.seconds === 5));
  const quick = ear.makeQuick({}, { rng });
  assert.equal(quick.questions.length, 10);
  assert.deepEqual([...new Set(quick.questions.map((q) => q.game))].sort(), ['degree', 'echo', 'floor', 'onoff', 'roads', 'voices']);
  assert.ok(quick.questions.every((q) => !q.seconds && q.sound.length >= 1));
  // a quick round meets you at the level you have reached in each game
  const further = ear.makeQuick({ degree: { best: { 0: 9, 1: 10 } } }, { rng });
  assert.ok(further.questions.filter((q) => q.game === 'degree').every((q) => q.level === 2 && q.choices.length === 8));
});

test('ear progress: passing a level, best scores, and merging two devices', () => {
  store.resetAll();
  const game = ear.gameById('degree');
  assert.equal(ear.passMark(game), 8);
  assert.equal(ear.passMark(ear.gameById('echo')), 7);
  assert.equal(ear.suggested(game, store.earRecord('degree')), 0);
  assert.equal(store.recordRound('degree', 0, 7), true);
  assert.equal(ear.suggested(game, store.earRecord('degree')), 0, 'seven of ten is not a pass');
  assert.equal(store.recordRound('degree', 0, 9), true);
  assert.equal(store.recordRound('degree', 0, 8), false, 'not a new best');
  assert.equal(ear.suggested(game, store.earRecord('degree')), 1);
  assert.ok(ear.passed(game, store.earRecord('degree'), 0) && !ear.passed(game, store.earRecord('degree'), 1));
  assert.equal(ear.suggested(ear.gameById('resolve'), undefined), 0, 'nothing to pass in a game with no wrong answers');
  // answers are counted by what was asked, and playing counts toward the day
  const before = store.dayTotal(store.dayKey()).n;
  store.recordAnswer('degree|maj6|6', false);
  store.recordAnswer('degree|maj6|6', true);
  store.logPractice(true, 4);
  assert.deepEqual([store.state.ear.stats['degree|maj6|6'].n, store.state.ear.stats['degree|maj6|6'].x], [2, 1]);
  assert.equal(store.dayTotal(store.dayKey()).n, before + 1);
  assert.equal(Object.keys(store.state.items).length, 0, 'ear games never touch the ladder items');
  // two devices: the best at each level survives, and the fuller answer count wins
  const phone = { ear: { games: { degree: { best: { 0: 10, 2: 6 }, plays: 5, t: Date.now() + 10 } }, stats: { 'degree|maj6|6': { n: 9, x: 2, t: Date.now() + 10 }, 'floor|shells': { n: 3, x: 3, t: Date.now() + 10 } } } };
  const merged = store.merge(store.state, phone);
  assert.deepEqual(merged.ear.games.degree.best, { 0: 10, 2: 6 });
  assert.equal(merged.ear.games.degree.plays, 5);
  assert.deepEqual([merged.ear.stats['degree|maj6|6'].n, merged.ear.stats['floor|shells'].x], [9, 3]);
  assert.equal(store.canonical(store.merge(merged, phone)), store.canonical(merged), 'merging again changes nothing');
  assert.notEqual(store.canonical(merged), store.canonical(store.state));
  // an older copy without the Ear tab merges cleanly
  assert.deepEqual(store.merge({ items: {} }, { items: {} }).ear, { games: {}, stats: {} });
  // erasing progress erases the ear records too, on every device
  store.resetAll();
  assert.deepEqual(store.state.ear, { games: {}, stats: {} });
  assert.deepEqual(store.merge(store.state, { ear: { games: { degree: { best: { 0: 10 }, plays: 1, t: 5 } }, stats: {} } }).ear.games, {});
});
