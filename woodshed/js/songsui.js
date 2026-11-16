// songsui.js — the Songs tab: a browsable book of tunes, each read the way the method
// reads a chart, with a play-through and a practice session drawn from the tune.

import { h, icon, pickRow, cap } from './dom.js';
import { neck, windowFor } from './neck.js';
import * as audio from './audio.js';
import { SCALES, chordName } from './theory.js';
import { SHAPES, FLOORS, setKey, setLabel } from './floors.js';
import { parseChart, keyName } from './harmony.js';
import { allSongs, songById, readSong, prefsOf, setPrefs, saveOwnSong, deleteOwnSong, playThrough, formulasAt, songMoves, centerOf, songCenters } from './songs.js';
import { WANTED } from './tunes.js';
import { state, setSetting } from './store.js';
import { unitById, isActive } from './curriculum.js';

let hooks = { runSession: () => {}, route: () => {} };
export const attachSongs = (h2) => { hooks = h2; };

const view = { id: null, step: 0 };
const kindOf = (deg) => (deg % 2 === 0 ? 'on' : 'off');
const link = (id) => `#/songs/${encodeURIComponent(id)}`;
const floorShapes = FLOORS.filter((f) => f.id !== 'unison').flatMap((f) => f.shapes.map((id) => [id, SHAPES[id].name]));

// ---------- the list ----------
export function pageSongs() {
  const songs = allSongs();
  const row = (s) => h('a', { class: 'rung song-row', href: link(s.id) },
    h('span', { class: 'rung-text' },
      h('strong', null, s.title),
      h('span', { class: 'muted' }, [s.by, s.key ? `key of ${s.key.replace('b', '♭')}` : null, s.form].filter(Boolean).join(' · '))),
    s.melody ? h('span', { class: 'tag on' }, 'melody') : null,
    s.draft ? h('span', { class: 'tag off' }, 'check') : null,
    icon('next', 18));
  const mine = songs.filter((s) => s.own);
  const have = new Set(songs.map((s) => s.title.toLowerCase()));
  const wanted = WANTED.filter((w) => !have.has(w.title.toLowerCase()));
  return [
    h('div', { class: 'page-head' }, h('p', { class: 'eyebrow' }, 'Tunes to practice on'), h('h1', null, 'Songs')),
    h('p', { class: 'lede' }, 'Each tune is read the way the method reads a chart: a scale of chords under every chord, the melody named by degree, and a shape to play beneath each note. ',
      h('a', { class: 'link', href: '#/learn/chart' }, 'How a chart is read')),
    h('section', { class: 'ladder' }, h('h2', { class: 'group' }, 'The book'), songs.filter((s) => !s.own).map(row)),
    h('section', { class: 'ladder' },
      h('h2', { class: 'group' }, 'Your tunes'),
      mine.length ? mine.map(row) : h('p', { class: 'muted small pad' }, 'Tunes you add are kept with your progress, not published.'),
      h('a', { class: 'pill add', href: '#/songs/new' }, icon('plus', 16), 'Add a tune')),
    wanted.length ? h('section', { class: 'ladder' },
      h('h2', { class: 'group' }, 'Waiting for a chart'),
      wanted.map((w) => h('a', { class: 'rung song-row planned', href: `#/songs/new/${encodeURIComponent(w.title)}` },
        h('span', { class: 'rung-text' }, h('strong', null, w.title), h('span', { class: 'muted' }, `${w.by} · ${w.note}`)),
        icon('plus', 18)))) : null,
  ];
}

// ---------- one tune ----------
function chartGrid(read, cursor, onPick) {
  const grid = h('div', { class: 'chart' });
  read.bars.forEach((bar, b) => {
    const chords = read.chords.filter((c) => c.bar === b);
    const move = chords.find((c) => c.movement && c.movement.start);
    grid.append(h('div', { class: 'bar' + (bar.section ? ' has-section' : '') },
      h('div', { class: 'bar-top' },
        h('span', { class: 'bar-n' }, bar.section ? `${bar.section} · ${b + 1}` : b + 1),
        move ? h('span', { class: 'move' }, move.movement.name) : null),
      h('div', { class: 'bar-chords' }, chords.map((c) => h('button', {
        class: `chord ${c.use.scale}` + (cursor && cursor.index === c.index ? ' sel' : ''), onclick: () => onPick(c),
      }, h('span', { class: 'chord-sym' }, c.text), h('span', { class: 'chord-scale' }, c.use.label))))));
  });
  return grid;
}

// The transformation formulas into and out of a chord, when both ends are 6th chords.
function formulaLine(read, chord) {
  const f = formulasAt(read, chord);
  if (!f.sixth) {
    return chord.options.some((o) => o.scale === 'maj6' || o.scale === 'min6')
      ? h('p', { class: 'muted small' }, 'Formulas join 6th chords. Choose a major 6 or minor 6 for this chord to see how it connects to its neighbors.') : null;
  }
  const part = (word, x) => (x ? h('span', null, `${word} ${x.chord.use.on} `, h('span', { class: 'formula' }, x.text)) : null);
  const parts = [part('From', f.from), part('To', f.to)].filter(Boolean);
  return parts.length ? h('div', { class: 'detail-formulas' }, parts) : null;
}

function chordDetail(read, chord, redraw) {
  const { song } = read;
  const pick = (i) => { setPrefs(song.id, { picks: { ...read.prefs.picks, [chord.index]: i } }); redraw(); };
  return h('div', { class: 'detail' },
    h('div', { class: 'detail-head' }, h('span', { class: 'eyebrow' }, `Bar ${chord.bar + 1} · chart says`), h('strong', null, chord.text)),
    h('div', { class: 'opts' }, chord.options.map((o, i) => h('button', { class: 'opt' + (i === chord.pick ? ' sel' : ''), onclick: () => pick(i) },
      h('strong', null, `${o.label}${SCALES[o.scale].whole ? ' scale' : ' diminished'}`), h('span', null, o.how)))),
    h('p', { class: 'muted small' }, `${cap(chord.use.why)}. On chord ${chord.use.on}, off chord ${chordName(chord.use.key, chord.use.scale, false)}.`),
    formulaLine(read, chord),
    centerLine(chord));
}

// For a dominant: which note of the off chord was moved to make the chord chosen here.
function centerLine(chord) {
  const c = centerOf(chord);
  if (!c) return null;
  const moved = c.post.moves.map((m) => `its ${m.say} ${m.by > 0 ? 'raised' : 'lowered'}`).join(' and ');
  return h('p', { class: 'muted small' }, `From the center: ${c.post.center}, the off chord of ${keyName(c.tonic)}, with ${moved}.`);
}

function stepper(read, steps, redraw) {
  const { song } = read;
  const i = Math.min(view.step, Math.max(0, steps.length - 1));
  const st = steps[i];
  if (!st) return h('p', { class: 'muted' }, 'Add some chords to this tune to play through it.');
  const v = st.voicing;
  const scale = st.chord.use.scale;
  const marks = v ? v.notes.map((n, k) => ({ string: n.string, fret: n.fret, kind: kindOf(n.deg) + (k === v.notes.length - 1 ? ' anchor' : ''), label: SCALES[scale].labels[n.deg] })) : [];
  const win = v ? windowFor(v.notes.map((n) => n.fret), 6) : { lo: 1, hi: 7 };
  const board = neck({ lo: win.lo, hi: win.hi, focus: v ? v.set : null, marks, onTap: (s, f) => { const n = v && v.notes.find((p) => p.string === s && p.fret === f); if (n) audio.note(n.midi); } });
  const play = (step = st) => { if (step.voicing) audio.chord(step.voicing.notes.map((n) => n.midi), 0, 0.04, 0.55); else if (step.note) audio.note(step.note.midi); };
  const go = (d) => { view.step = (i + d + steps.length) % steps.length; redraw(); audio.stopAll(); play(steps[view.step]); };
  const playAll = () => {
    audio.stopAll();
    const beat = 60 / Math.max(50, state.settings.bpm || 60);
    let t = 0;
    steps.slice(i).slice(0, 48).forEach((s2, k, arr) => {
      const midis = s2.voicing ? s2.voicing.notes.map((n) => n.midi) : s2.note ? [s2.note.midi] : [];
      if (midis.length) audio.chord(midis, t, 0.03, 0.5);
      const dur = s2.note && s2.note.dur ? s2.note.dur : read.beats / Math.max(1, s2.chord.of);
      t += dur * beat;
    });
  };
  const name = st.note && st.note.deg >= 0 ? SCALES[scale].say[st.note.deg] : '';
  const note = name ? `${read.melody.length ? 'Melody' : 'Top note'}: ${name === 'off note' ? 'an off note' : `the ${name}, ${kindOf(st.note.deg)}`}${v && v.borrowed ? `, borrowed over ${st.chord.use.on}` : ''}.` : '';
  const caption = v ? `${note} ${SHAPES[v.shape].name} on ${setLabel(v.set)}. Low to high: ${v.notes.map((n) => SCALES[scale].say[n.deg]).join(', ')}.`
    : st.note && st.note.deg < 0 ? 'This melody note is not in the scale chosen for this chord. Try another choice for the chord above, or play the note on its own.'
    : 'No comfortable position for this floor here. Try a smaller floor.';
  return h('div', { class: 'fig browser' },
    h('div', { class: 'browser-title' },
      h('span', { class: `tag ${v && (!v.on || v.borrowed) ? 'off' : 'on'}` }, v ? (v.borrowed ? 'borrowed' : v.on ? 'on' : 'off') : '·'),
      h('strong', null, st.chord.text),
      h('span', { class: 'muted' }, ` bar ${st.bar + 1} · ${st.chord.use.label} · ${i + 1} of ${steps.length}`)),
    board.el,
    h('div', { class: 'browser-controls' },
      h('button', { class: 'round', 'aria-label': 'Previous', onclick: () => go(-1) }, icon('back', 20)),
      h('button', { class: 'pill', onclick: () => { audio.stopAll(); play(); } }, icon('play', 16), 'Play'),
      h('button', { class: 'pill', onclick: playAll }, 'Play on from here'),
      h('button', { class: 'round', 'aria-label': 'Next', onclick: () => go(1) }, icon('next', 20))),
    h('figcaption', null, caption));
}

// A short practice session drawn from the tune: chart-reading questions, then shapes under its notes.
function songSession(read, steps, mode) {
  const { song } = read;
  const tag = (bar) => `${song.title} · bar ${bar + 1}`;
  const out = [];
  // which scale of chords for each chart chord: answered on screen when away, played with the guitar
  {
    const seen = new Set();
    for (const c of read.chords) {
      const how = { 'same four notes': 'same', 'minor 6 on the 5': 'on5', 'major 6 on the 5': 'on5', "tritone's minor": 'tm', 'tritone substitute': 'tt' }[c.use.how];
      const fam = c.family === 'dom7b5' ? 'dom' : c.family;
      if (!how || !['min7', 'hdim', 'maj', 'dom'].includes(fam) || seen.has(c.text + how)) continue;
      seen.add(c.text + how);
      out.push({ id: `sc|${fam}|${how}`, key: keyName(c.root), symbol: c.text, tag: tag(c.bar) });
      if (out.length >= 5) break;
    }
  }
  // the tune's own transformations, once that stage of the ladder has been started
  for (const m of isActive(unitById('tr.major')) ? songMoves(read) : []) {
    out.push({ id: `tx|${m.move}|${m.role}`, key: keyName(m.tonic), note: `On the chart this is ${m.from.text} to ${m.to.text}.`, tag: tag(m.from.bar) });
  }
  // its dominants as moves from the off chord, once that step of the ladder has been started
  for (const m of isActive(unitById('sub.center')) ? songCenters(read) : []) {
    out.push({ id: `hp|${m.id}|${m.pos}`, key: keyName(m.tonic), note: `On the chart this is ${m.from.text} going to ${m.to.text}.`, tag: tag(m.from.bar) });
  }
  const usable = steps.filter((s) => s.voicing && s.voicing.notes.length > 1);
  const want = 10;
  const stride = Math.max(1, Math.floor(usable.length / want));
  const picked = usable.filter((_, k) => k % stride === 0).slice(0, want);
  for (const s of picked) {
    const v = s.voicing;
    const top = v.notes[v.notes.length - 1];
    const id = v.borrowed
      ? `bm|${s.chord.use.scale}|${v.shape}|${setKey(v.set)}|${v.borrowed.old.midi > top.midi ? 'a' : 'b'}|${top.deg}`
      : `sh|${s.chord.use.scale}|${v.shape}|${setKey(v.set)}|t|${top.deg}`;
    out.push({ id, key: s.chord.use.key, at: top.midi, tag: `${tag(s.bar)} · ${s.chord.text}` });
  }
  return out;
}

export function pageSong(id) {
  const song = songById(id);
  if (!song) return pageSongs();
  if (view.id !== id) { view.id = id; view.step = 0; }
  if (state.settings.lastSong !== id) setSetting('lastSong', id);
  const root = h('div', { class: 'song' });

  function draw() {
    const read = readSong(song);
    const steps = playThrough(read, read.prefs.floor, read.prefs.borrow);
    const hasOff = read.melody.some((n) => n.deg >= 0 && n.deg % 2 === 1);
    view.step = Math.min(view.step, Math.max(0, steps.length - 1));
    const cursor = steps[view.step] ? steps[view.step].chord : read.chords[0];
    const shift = (d) => { setPrefs(song.id, { shift: ((read.prefs.shift + d + 18) % 12) - 6, picks: read.prefs.picks }); draw(); };
    const jump = (chord) => { const k = steps.findIndex((s) => s.chord.index === chord.index); view.step = k < 0 ? 0 : k; draw(); };
    const mode = state.settings.mode;
    const session = songSession(read, steps, mode);
    root.replaceChildren(...[
      h('a', { class: 'back', href: '#/songs' }, icon('back', 18), 'Songs'),
      h('div', { class: 'page-head' },
        h('p', { class: 'eyebrow' }, [song.by, song.year].filter(Boolean).join(' · ') || 'Your tune'),
        h('h1', null, song.title)),
      h('div', { class: 'song-meta' },
        h('div', { class: 'keybox' },
          h('button', { class: 'tiny', 'aria-label': 'Down a half step', onclick: () => shift(-1) }, '−'),
          h('span', null, `Key of ${read.keyText}`),
          h('button', { class: 'tiny', 'aria-label': 'Up a half step', onclick: () => shift(1) }, '+')),
        song.own ? h('a', { class: 'pill', href: `#/songs/edit/${encodeURIComponent(song.id)}` }, icon('edit', 16), 'Edit')
          : h('a', { class: 'pill', href: `#/songs/copy/${encodeURIComponent(song.id)}` }, icon('edit', 16), 'Make my own copy')),
      song.from ? h('p', { class: song.draft ? 'note' : 'muted small' }, song.from) : null,
      h('h2', { class: 'group' }, 'The chart'),
      chartGrid(read, cursor, jump),
      cursor ? chordDetail(read, cursor, draw) : null,
      h('h2', { class: 'group' }, read.melody.length ? 'The melody, harmonized' : 'Play through'),
      pickRow('Floor', floorShapes, read.prefs.floor, (v) => { setPrefs(song.id, { floor: v }); draw(); }),
      hasOff ? pickRow('Under off notes', [['chord', 'Move to the off chord'], ['borrow', 'Borrow over the on chord']], read.prefs.borrow ? 'borrow' : 'chord', (v) => { setPrefs(song.id, { borrow: v === 'borrow' }); draw(); }) : null,
      read.melody.length ? pickRow('Melody', [[-1, 'Octave down'], [0, 'As written'], [1, 'Octave up']], read.prefs.octave || 0, (v) => { setPrefs(song.id, { octave: v }); view.step = 0; draw(); }) : null,
      stepper(read, steps, draw),
      read.melody.length ? null : h('p', { class: 'muted small' }, song.own
        ? 'No melody yet. Edit the tune to add one and each note will be named and harmonized.'
        : 'This tune is still in copyright, so only its changes are here. The fifth of each chord stands in for a melody note. Make your own copy to add the melody privately.'),
      session.length ? h('button', { class: 'primary wide', onclick: () => hooks.runSession(session, mode) }, `Practice this tune ${mode === 'guitar' ? 'with the guitar' : 'now'}`) : null,
    ].filter(Boolean));
  }
  draw();
  return [root];
}

// ---------- adding and editing your own ----------
export function pageSongEdit(kind, arg) {
  const source = kind === 'edit' || kind === 'copy' ? songById(arg) : null;
  const editing = kind === 'edit' && source && source.own;
  const start = source
    ? { title: source.title + (kind === 'copy' ? ' (my version)' : ''), by: source.by || '', key: source.key || 'C', beats: source.beats || 4, chart: (source.chart || '').trim(), melody: (source.melody || []).join('\n') }
    : { title: kind === 'new' && arg ? arg : '', by: '', key: 'C', beats: 4, chart: '', melody: '' };
  const field = (label, node, help) => h('label', null, label, node, help ? h('span', { class: 'help' }, help) : null);
  const title = h('input', { type: 'text', value: start.title, placeholder: 'Dear Lord' });
  const by = h('input', { type: 'text', value: start.by, placeholder: 'John Coltrane' });
  const key = h('input', { type: 'text', value: start.key, placeholder: 'Bb or Cm', autocapitalize: 'off', spellcheck: 'false' });
  const beats = h('input', { type: 'text', value: String(start.beats), inputmode: 'numeric' });
  const chart = h('textarea', { rows: 9, spellcheck: 'false', autocapitalize: 'off', placeholder: 'A | Dm7 | G7 | Cmaj7 | % |\n  | Em7b5 A7 | Dm7 Dbdim7 | Cm7 F7 | Bb6 |' });
  chart.value = start.chart;
  const melody = h('textarea', { rows: 6, spellcheck: 'false', autocapitalize: 'off', placeholder: 'G4:2 A4:1 B4:1\nC5:4' });
  melody.value = start.melody;
  const status = h('p', { class: 'muted small' });
  const check = () => {
    const bars = parseChart(chart.value);
    const chords = bars.reduce((n, b) => n + b.chords.length, 0);
    status.textContent = bars.length ? `Reads as ${bars.length} bar${bars.length === 1 ? '' : 's'} and ${chords} chord${chords === 1 ? '' : 's'}.` : 'Nothing readable yet. Put each bar between | signs.';
    return bars.length;
  };
  chart.addEventListener('input', check);
  check();
  const msg = h('p', { class: 'warn' });
  const saveIt = () => {
    if (!title.value.trim()) { msg.textContent = 'Give the tune a title.'; return; }
    if (!check()) { msg.textContent = 'Add at least one bar of chords.'; return; }
    const id = saveOwnSong(editing ? source.id : null, {
      title: title.value.trim(), by: by.value.trim(), key: key.value.trim() || 'C', beats: Math.max(2, Math.min(12, parseInt(beats.value, 10) || 4)),
      chart: chart.value, melody: melody.value.trim() ? melody.value.split('\n') : null,
    });
    location.hash = link(id);
  };
  return [
    h('a', { class: 'back', href: source ? link(source.id) : '#/songs' }, icon('back', 18), source ? source.title : 'Songs'),
    h('div', { class: 'page-head' }, h('p', { class: 'eyebrow' }, 'Your tunes'), h('h1', null, editing ? 'Edit tune' : 'Add a tune')),
    h('p', { class: 'lede' }, 'Type or paste the changes from a chart you trust. Your tunes are saved with your progress and are not published.'),
    h('section', { class: 'card form' },
      field('Title', title),
      field('Composer', by),
      h('div', { class: 'two' }, field('Key', key), field('Beats in a bar', beats)),
      field('Chart', chart, 'One line per row of the chart. Put each bar between | signs, with a space between two chords in a bar. % repeats the bar before. A letter before the first | names a section.'),
      status,
      field('Melody (optional)', melody, 'One line per bar. Write notes as on a lead sheet, with their length in beats: G4:2 A4:1 B4:1. Or just the note names, G A B, and they share the bar. r:1 is a rest.'),
      msg,
      h('button', { class: 'primary', onclick: saveIt }, 'Save'),
      editing ? h('button', { class: 'pill danger', onclick: () => { if (confirm(`Delete "${source.title}"?`)) { deleteOwnSong(source.id); location.hash = '#/songs'; } } }, 'Delete this tune') : null),
  ];
}
