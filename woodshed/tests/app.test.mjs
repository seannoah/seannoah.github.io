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
