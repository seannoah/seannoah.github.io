// Tests for the parts that make a release work: the offline file list, the version
// numbers, the saved state, and the synth's control ranges.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { defaults, mend } from '../js/store.js';
import { PRESETS, presetIds, CONTROLS, WAVES, fromSlider, toSlider, resolvePatch } from '../js/synth.js';
import { PATTERN_IDS, SIGS, patternSteps } from '../js/seq.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (name) => readFileSync(root + name, 'utf8');

test('the offline list names every file the app loads, and nothing that is missing', () => {
  const sw = read('sw.js');
  const files = [...sw.slice(sw.indexOf('const FILES'), sw.indexOf('];')).matchAll(/'([^']+)'/g)].map((m) => m[1]);
  for (const f of files) if (f !== './') assert.ok(existsSync(root + f), `${f} is listed in sw.js but does not exist`);
  for (const f of readdirSync(root + 'js')) assert.ok(files.includes(`js/${f}`), `js/${f} is missing from sw.js`);
  for (const f of readdirSync(root + 'css')) assert.ok(files.includes(`css/${f}`), `css/${f} is missing from sw.js`);
});

test('the version is the same everywhere', () => {
  const app = /VERSION = '([^']+)'/.exec(read('js/app.js'))[1];
  const sw = /VERSION = 'parlor-([^']+)'/.exec(read('sw.js'))[1];
  assert.equal(app, sw);
});

test('the page asks nothing of the network but its own files', () => {
  const html = read('index.html');
  assert.ok(html.includes('name="robots" content="noindex"'));
  const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  for (const u of urls) assert.ok(!/^(https?:)?\/\//.test(u), `${u} leaves the site`);
  for (const f of readdirSync(root + 'js')) assert.ok(!/https?:\/\//.test(read(`js/${f}`).replace(/\/\/.*$/gm, '')), `js/${f} mentions a web address`);
  const manifest = JSON.parse(read('manifest.webmanifest'));
  for (const icon of manifest.icons) assert.ok(existsSync(root + icon.src), icon.src);
});

test('a fresh start is a playable state', () => {
  const s = defaults();
  assert.equal(s.h.scale, 'maj6');
  assert.deepEqual(Object.keys(s.song.patterns), PATTERN_IDS);
  for (const id of PATTERN_IDS) assert.equal(patternSteps(s.song.patterns[id], SIGS[s.song.sig]), 32);
  for (const part of Object.values(s.parts)) assert.ok(PRESETS[part.preset]);
});

test('a damaged or old saved state never stops the instrument opening', () => {
  assert.deepEqual(mend(null), defaults());
  assert.deepEqual(mend('nonsense'), defaults());
  const odd = mend({ h: { root: 99, scale: 'nope' }, floor: 40, motion: 'sideways', parts: { pads: { preset: 'gone' } }, song: { sig: '7/8' }, drums: { kit: 'tin cans' }, octave: 9 });
  assert.equal(odd.h.root, 0);
  assert.equal(odd.floor, 5);
  assert.equal(odd.motion, 'parallel');
  assert.equal(odd.parts.pads.preset, 'tines');
  assert.equal(odd.song.sig, '4/4');
  assert.equal(odd.drums.kit, defaults().drums.kit);
  assert.equal(odd.octave, 1);
  // what is sound is kept
  const kept = mend({ ...defaults(), floor: 2, motion: 'contrary', home: { root: 10, scale: 'min6' } });
  assert.equal(kept.floor, 2);
  assert.equal(kept.motion, 'contrary');
  assert.deepEqual(kept.home, { root: 10, scale: 'min6' });
  // a pattern of the wrong length is thrown out with its song
  const bad = defaults(); bad.song.patterns.A.bass = [null];
  assert.equal(mend(bad).song.patterns.A.bass.length, 32);
});

test('voices and their controls', () => {
  assert.ok(presetIds('keys').length >= 4);
  assert.ok(presetIds('bass').length >= 2);
  const waves = WAVES.map((w) => w.id);
  for (const [id, p] of Object.entries(PRESETS)) {
    assert.ok(waves.includes(p.wave), id);
    for (const c of CONTROLS) assert.ok(p[c.id] >= c.min && p[c.id] <= c.max, `${id}.${c.id} = ${p[c.id]}`);
  }
  for (const c of CONTROLS) {
    assert.ok(Math.abs(fromSlider(c, 0) - c.min) < 1e-9 && Math.abs(fromSlider(c, 1) - c.max) < 1e-9, c.id);
    for (const x of [0, 0.25, 0.5, 0.9, 1]) assert.ok(Math.abs(toSlider(c, fromSlider(c, x)) - x) < 1e-9, c.id);
  }
  assert.equal(resolvePatch('nylon', { cutoff: 900 }).cutoff, 900);
  assert.equal(resolvePatch('missing').name, 'Nylon');
});
