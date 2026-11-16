// play.js — the Play screen: the scale in use, the stations and family moves, the string
// plate, the Elevator and the other moves, and the pads.

import { h, fill, icon, segmented, sheet, deg, acc } from './dom.js';
import { KEYS, SCALES, SCALE_ORDER, harmony, harmonyNotes, harmonyTitle, chordLabel, sameHarmony, mod, keyName } from './theory.js';
import { FLOORS, SHAPES, shapeOn } from './floors.js';
import { stations, stationOf, stationPhrase, familyMove, formulaBetween, formulaText, isSixth, voiceName, scaleShort, reflect } from './moves.js';

export function playView(app) {
  const { state, inst, band, events, save } = app;
  let padCount = 8;
  const down = new Map();         // pad index -> how many fingers or keys hold it
  const touches = new Map();      // pointer id -> pad index
  const plateTouches = new Map(); // pointer id -> last x
  let stringList = [];
  let stringEls = [];
  let capTimer = 0;

  // ---------- the scale in use ----------
  const title = h('span', { class: 'scale-title' });
  const readout = h('span', { class: 'scale-read' });
  const scaleBtn = h('button', { type: 'button', class: 'scale-card', 'aria-label': 'Choose the key and scale', title: 'Choose the key and scale', onpress: () => keySheet() },
    title, h('span', { class: 'scale-go' }, 'change'));
  const pager = h('div', { class: 'pager' });

  function page() {
    if (band.timeline) return state.page;
    return state.page === 'chart' ? 'stations' : state.page;
  }

  function drawPager() {
    const options = [...(band.timeline ? [{ id: 'chart', label: 'Chart' }] : []), { id: 'stations', label: 'Stations' }, { id: 'family', label: 'Family' }];
    fill(pager, segmented(options, page(), (id) => { state.page = id; save(); drawHarmony(); }, 'small', true).el);
  }

  function drawScale() {
    fill(title, acc(harmonyTitle(state.h)));
    if (!readout.dataset.live) {
      const notes = harmonyNotes(state.h);
      readout.textContent = `${chordLabel(state.h)} on the top row, ${chordLabel(state.h, false)} below`;
      readout.title = notes.map((n) => n.name).join(' ');
    }
  }

  function showChord(c) {
    readout.dataset.live = '1';
    fill(readout, h('strong', { class: c.top.on ? 'ink-on' : 'ink-off' }, c.title), ` · ${c.floorName}${c.detail ? ` · ${c.detail}` : ''} · `, h('span', { class: 'sym' }, c.spelled));
    if (c.moved) caption(c.moved, true);
  }

  // ---------- stations, family, chart ----------
  const harm = h('div', { class: 'harm' });

  function drawHarmony() {
    const p = page();
    harm.dataset.page = p;
    if (p === 'chart') drawChart();
    else if (p === 'family') drawFamily();
    else drawStations();
  }

  function drawStations() {
    const list = stations(state.home);
    const here = stationOf(state.home, state.h);
    fill(harm, h('div', { class: 'stations' }, list.map((st, i) => h('button', {
      type: 'button', class: `station${here && here.id === st.id ? ' sel' : ''}${st.dominant ? ' dom' : ''}`, title: `${st.name}. ${st.how}`,
      onpress: () => { inst.setHarmony(st.h, 'station'); caption(st.id === 'home' ? 'Home.' : `${st.label}: ${stationPhrase(state.home, st)}. ${st.how}`); },
    }, h('span', { class: 'st-chord sym' }, st.label), h('span', { class: 'st-name' }, st.short), h('kbd', null, 'TYUIOP[]'[i])))));
  }

  function drawFamily() {
    const cur = state.h;
    const sixth = isSixth(cur.scale);
    const go = (move) => {
      const next = familyMove(cur, move);
      if (!next) return;
      inst.setHarmony(next, 'family');
      caption(`${formulaText(formulaBetween(cur, next))} ${chordLabel(cur)} becomes ${chordLabel(next)}.`);
    };
    const btn = (move, label, sub, off = false) => h('button', { type: 'button', class: 'station fam', disabled: off, onpress: () => go(move) },
      h('span', { class: 'st-chord' }, label), h('span', { class: 'st-name sym' }, sub));
    const to = (move) => { const n = familyMove(cur, move); return n ? chordLabel(n) : '—'; };
    const flip = cur.scale === 'maj6' ? 'minor' : 'major';
    const f = formulaText(formulaBetween(state.home, cur));
    fill(harm, h('div', { class: 'stations family' },
      btn('backward', 'Backward', to('backward')), btn('forward', 'Forward', to('forward')), btn('across', 'Across', to('across')),
      btn(flip, flip === 'minor' ? 'Minor' : 'Major', sixth ? to(flip) : '6th chords only', !sixth),
      btn('down', 'Down', to('down')), btn('up', 'Up', to('up')),
      h('button', { type: 'button', class: `station fam home${sameHarmony(cur, state.home) ? ' sel' : ''}`, onpress: () => { inst.setHarmony(state.home, 'family'); caption('Home.'); } },
        h('span', { class: 'st-chord' }, 'Home'), h('span', { class: 'st-name sym' }, chordLabel(state.home))),
      h('div', { class: 'formula', title: 'The formula from home to here' }, h('span', { class: 'st-name' }, 'from home'), h('span', { class: 'formula-text' }, isSixth(state.home.scale) && sixth ? f : '—'))));
  }

  function drawChart() {
    const tl = band.timeline;
    if (!tl || !tl.entries.length) { drawStations(); return; }
    const e = tl.entries[band.cursor] || tl.entries[0];
    const next = tl.entries[mod(e.index + 1, tl.entries.length)];
    const many = e.options.length > 1;
    fill(harm, h('div', { class: 'follow' },
      h('button', { type: 'button', class: 'icon-b', 'aria-label': 'Previous chord', onpress: () => band.nextEntry(-1) }, icon('left')),
      h('div', { class: 'follow-now' },
        h('span', { class: 'follow-sym sym' }, e.symbol),
        h('span', { class: 'follow-how' }, `bar ${e.bar + 1} of ${tl.bars} · ${e.how}`),
        h('span', { class: 'follow-next' }, 'next ', h('span', { class: 'sym' }, next.symbol))),
      h('button', { type: 'button', class: 'icon-b', 'aria-label': 'Next chord', onpress: () => band.nextEntry(1) }, icon('right'))),
    h('div', { class: `readings${many ? '' : ' one'}` }, e.options.map((o, i) => h('button', {
      type: 'button', class: `reading${i === e.pick ? ' sel' : ''}`, title: o.why,
      onpress: () => { band.setPick(e.index, i); caption(`${e.symbol} played as ${o.label}: ${o.why}.`); },
    }, h('span', { class: 'sym' }, o.on), h('span', { class: 'st-name' }, o.how)))));
  }

  // ---------- the string plate ----------
  const plate = h('div', { class: 'plate', role: 'group', 'aria-label': 'Strings: drag across to strum' });
  const plateMode = segmented([{ id: 'chord', label: 'Chord' }, { id: 'scale', label: 'Scale' }], state.plate, (id) => { state.plate = id; save(); drawPlate(); }, 'small plate-mode', true);
  const plateWrap = h('div', { class: 'plate-wrap' }, plate, plateMode.el);

  function drawPlate() {
    stringList = inst.strings();
    plate.dataset.kind = state.plate;
    stringEls = stringList.map((s, i) => h('div', {
      class: `string ${s.on ? 'on' : 'off'}${s.root ? ' root' : ''}`,
      style: { left: `${((i + 0.5) / stringList.length) * 100}%`, '--w': `${(2.6 - 1.7 * (i / Math.max(1, stringList.length - 1))).toFixed(2)}px` },
    }, h('i'), h('span', { class: 'string-name' }, state.plate === 'scale' ? s.label : s.name)));
    fill(plate, stringEls);
  }

  function ping(i, vel) {
    const s = stringList[i];
    if (!s) return;
    inst.pluck(s.midi, vel);
    const el = stringEls[i];
    el.classList.remove('ping');
    void el.offsetWidth;
    el.classList.add('ping');
  }

  const stringAt = (x, w) => Math.max(0, Math.min(stringList.length - 1, Math.floor((x / w) * stringList.length)));

  plate.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { plate.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
    const box = plate.getBoundingClientRect();
    const x = e.clientX - box.left;
    plateTouches.set(e.pointerId, { x, t: e.timeStamp });
    ping(stringAt(x, box.width), 0.72);
  });
  plate.addEventListener('pointermove', (e) => {
    const lastTouch = plateTouches.get(e.pointerId);
    if (!lastTouch) return;
    const box = plate.getBoundingClientRect();
    const x = e.clientX - box.left;
    const n = stringList.length;
    const pos = (v) => (v / box.width) * n - 0.5;       // in strings: string i sits at i
    const a = pos(lastTouch.x); const b = pos(x);
    if (Math.abs(b - a) < 0.02) return;
    const speed = Math.abs(x - lastTouch.x) / Math.max(1, e.timeStamp - lastTouch.t);     // pixels per millisecond
    const vel = Math.max(0.4, Math.min(1, 0.45 + speed * 0.35));
    const crossed = [];
    if (b > a) { for (let i = Math.ceil(a + 1e-6); i <= Math.floor(b); i++) crossed.push(i); }
    else { for (let i = Math.floor(a - 1e-6); i >= Math.ceil(b); i--) crossed.push(i); }
    for (const i of crossed) if (i >= 0 && i < n) ping(i, vel);
    plateTouches.set(e.pointerId, { x, t: e.timeStamp });
  });
  const plateEnd = (e) => plateTouches.delete(e.pointerId);
  plate.addEventListener('pointerup', plateEnd);
  plate.addEventListener('pointercancel', plateEnd);

  // ---------- the moves ----------
  const cap = h('div', { class: 'cap' });
  const rail = h('div', { class: 'rail', role: 'group', 'aria-label': 'The Elevator: choose a floor, or slide along it' });
  let railDrag = null;

  function floorCaption() {
    const f = FLOORS[state.floor];
    return `Floor ${f.level} of 9 · ${SHAPES[shapeOn(state.floor, state.variants)].name} · top to bottom spans ${f.span}`;
  }
  function caption(text, brief = false) {
    clearTimeout(capTimer);
    cap.textContent = text || floorCaption();
    cap.classList.toggle('lit', !!text);
    if (text) capTimer = setTimeout(() => caption(''), brief ? 3200 : 6000);
  }

  function drawRail() {
    fill(rail, FLOORS.map((f, i) => {
      const sel = i === state.floor;
      const variants = f.shapes.length;
      return h('button', {
        type: 'button', class: `floor${sel ? ' sel' : ''}`, 'aria-pressed': String(sel), title: `${f.name}: spans ${f.span}`, 'data-floor': String(i),
        onclick: () => { if (performance.now() - railTouched > 700) pickFloor(i, true); },
      }, h('span', { class: 'floor-n' }, String(f.level)), sel ? h('span', { class: 'floor-name' }, variants > 1 ? SHAPES[shapeOn(i, state.variants)].name.replace('Octave, ', '8ve, ') : f.short) : null,
      sel && variants > 1 ? h('span', { class: 'floor-more' }, '⇄') : null);
    }));
  }

  // Choose a floor. Chords that are ringing follow: the melody stays, and the notes beneath
  // it are added or taken away. Tapping the lit floor again gives its other shape.
  function pickFloor(i, tap = false) {
    const f = FLOORS[i];
    if (!f) return;
    if (i === state.floor) {
      if (!tap || f.shapes.length < 2) return;
      state.variants = { ...state.variants, [f.id]: mod((state.variants[f.id] || 0) + 1, f.shapes.length) };
    }
    state.floor = i;
    save(); drawRail(); caption('');
    inst.refloor();
    drawVoices();
  }

  // the rail answers on touch-down, and a finger can slide along it to ride the Elevator
  let railTouched = 0;
  rail.addEventListener('pointerdown', (e) => {
    const b = e.target.closest ? e.target.closest('.floor') : null;
    if (!b || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    try { rail.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
    railTouched = performance.now();
    railDrag = { id: e.pointerId, x: e.clientX, moved: false };
    pickFloor(Number(b.dataset.floor), true);
  });
  rail.addEventListener('pointermove', (e) => {
    if (!railDrag || railDrag.id !== e.pointerId) return;
    if (!railDrag.moved && Math.abs(e.clientX - railDrag.x) < 14) return;
    railDrag.moved = true;
    const box = rail.getBoundingClientRect();
    pickFloor(Math.max(0, Math.min(FLOORS.length - 1, Math.floor(((e.clientX - box.left) / box.width) * FLOORS.length))));
  });
  const railEnd = (e) => { if (railDrag && railDrag.id === e.pointerId) railDrag = null; };
  rail.addEventListener('pointerup', railEnd);
  rail.addEventListener('pointercancel', railEnd);
  rail.addEventListener('touchend', (e) => { if (e.cancelable) e.preventDefault(); });

  const motion = segmented([
    { id: 'parallel', label: 'Parallel', title: 'The floor stays: the bass follows the melody (Q)' },
    { id: 'contrary', label: 'Contrary', title: 'Melody up means a floor up: the bass goes the other way (W)' },
    { id: 'oblique', label: 'Oblique', title: 'The bass holds while the melody moves (E)' },
  ], state.motion, (id) => setMotion(id), 'motion', true);
  function setMotion(id) {
    state.motion = id; save(); motion.set(id);
    caption({ parallel: 'Parallel: the floor stays, so the bass follows the melody.', contrary: 'Contrary: step the melody up and the floor grows, so the bass steps down.', oblique: 'Oblique: the bass holds while the melody moves.' }[id]);
  }

  // The mirror: swap the floor for its reflection. Under a held note the bass drops (or
  // rises) an octave, which is the method's pivot.
  function mirror() {
    const from = state.floor;
    const to = reflect(from);
    state.floor = to;
    save(); drawRail();
    inst.refloor();
    drawVoices();
    caption(`Mirror: ${FLOORS[from].name.toLowerCase()} reflect as ${FLOORS[to].name.toLowerCase()}. Same melody, bass an octave ${to > from ? 'lower' : 'higher'}.`);
  }
  const mirrorBtn = h('button', { type: 'button', class: 'toggle mirror', title: 'Swap the floor for its reflection: the same melody note, the bass an octave away (;)', onpress: () => mirror() }, 'Mirror');

  const setOctave = (d) => { state.octave = Math.max(-1, Math.min(1, state.octave + d)); save(); drawPads(); drawPlate(); drawVoices(); caption(state.octave ? `Pads ${state.octave > 0 ? 'up' : 'down'} an octave.` : 'Pads back in the middle octave.', true); };
  const holdBtn = h('button', { type: 'button', class: 'toggle', 'aria-pressed': String(state.hold), title: 'Chords ring on after you lift your finger, and follow the stations (L)', onpress: () => setHold(!state.hold) }, 'Hold');
  function setHold(on) {
    inst.setHold(on); holdBtn.setAttribute('aria-pressed', String(on)); holdBtn.classList.toggle('sel', on);
    caption(on ? 'Hold: a chord rings on when you lift, and goes with you when you change station.' : 'Hold off.', true);
    drawVoices();
  }

  // ---- voice keys: one for each note of the chord ----
  // The top half of a key borrows above, the bottom half borrows below, for as long as it
  // is held. Several can lean at once.
  const voicesEl = h('div', { class: 'voices', role: 'group', 'aria-label': 'The voices of the chord. Press the top of one to borrow above, the bottom to borrow below.' });
  const leaning = new Map();   // pointer id -> { voice, dir }
  let keyLean = null;          // the voice leaning from the arrow keys

  function drawVoices() {
    const list = inst.voices();
    const sel = Math.min(state.borrowVoice, list.length - 1);
    fill(voicesEl, list.map((v) => h('div', {
      class: `vkey ${v.now.on ? 'on' : 'off'}${v.lean ? ' lean' : ''}${v.ringing ? '' : ' quiet'}${v.fromTop === sel ? ' sel' : ''}`, 'data-voice': String(v.fromTop),
      title: `The ${voiceName(list.length, v.fromTop)} voice: ${v.home.say}`,
    }, h('span', { class: 'vk-arrow' }, '▲'), h('span', { class: 'vk-mid' }, h('b', null, deg(v.now.label)), h('i', null, v.now.name)), h('span', { class: 'vk-arrow' }, '▼'))));
  }

  function doLean(voice, dir) {
    const moved = inst.lean(voice, dir);
    if (!moved) caption('That voice has nowhere to go: the note next to it is already sounding.', true);
  }
  const halfOf = (voice, y, was = 0) => {
    const el = voicesEl.querySelector(`[data-voice="${voice}"]`);
    if (!el) return was || 1;
    const box = el.getBoundingClientRect();
    const mid = box.top + box.height / 2;
    if (was && Math.abs(y - mid) < 5) return was;       // do not flutter on the line between
    return y < mid ? 1 : -1;
  };
  voicesEl.addEventListener('pointerdown', (e) => {
    const el = e.target.closest ? e.target.closest('.vkey') : null;
    if (!el || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    try { voicesEl.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
    const voice = Number(el.dataset.voice);
    const dir = halfOf(voice, e.clientY);
    leaning.set(e.pointerId, { voice, dir });
    state.borrowVoice = voice;
    doLean(voice, dir);
  });
  voicesEl.addEventListener('pointermove', (e) => {
    const l = leaning.get(e.pointerId);
    if (!l) return;
    const dir = halfOf(l.voice, e.clientY, l.dir);
    if (dir !== l.dir) { l.dir = dir; doLean(l.voice, dir); }
  });
  const voiceEnd = (e) => {
    const l = leaning.get(e.pointerId);
    if (!l) return;
    leaning.delete(e.pointerId);
    if (![...leaning.values()].some((x) => x.voice === l.voice)) inst.unlean(l.voice);
  };
  voicesEl.addEventListener('pointerup', voiceEnd);
  voicesEl.addEventListener('pointercancel', voiceEnd);
  voicesEl.addEventListener('contextmenu', (e) => e.preventDefault());

  function voiceCount() { return inst.voices().length; }
  function cycleVoice(d) {
    state.borrowVoice = mod(Math.min(state.borrowVoice, voiceCount() - 1) + d, voiceCount());
    save(); drawVoices();
    caption(`Arrow keys borrow in the ${voiceName(voiceCount(), state.borrowVoice)} voice.`, true);
  }
  // from the keyboard: up and down arrows lean the chosen voice while they are held
  function borrowDown(dir) {
    keyLean = Math.min(state.borrowVoice, voiceCount() - 1);
    doLean(keyLean, dir);
  }
  function borrowUp() {
    if (keyLean == null) return;
    inst.unlean(keyLean);
    keyLean = null;
  }

  const keepBtn = h('button', { type: 'button', class: 'toggle keep', 'aria-pressed': String(state.keepOn), title: 'Under an off melody note, keep the on chord and treat the melody as borrowed', onpress: () => setKeep(!state.keepOn) }, 'On chord under off notes');
  function setKeep(on) {
    state.keepOn = on; save();
    keepBtn.setAttribute('aria-pressed', String(on)); keepBtn.classList.toggle('sel', on);
    caption(on ? 'Off melody notes now keep the on chord beneath them: the melody is borrowed.' : 'Off melody notes now take the whole off chord.');
  }

  const moves = h('div', { class: 'moves' }, cap, rail,
    h('div', { class: 'moves-row' }, motion.el, mirrorBtn, holdBtn),
    h('div', { class: 'moves-row lean-row' }, voicesEl, keepBtn));

  // ---------- the pads ----------
  const pads = h('div', { class: 'pads', role: 'group', 'aria-label': 'Pads: one for each note of the scale' });
  const PAD_KEYS = { on: 'ASDFGHJK', off: 'ZXCVBNM,' };

  function drawPads() {
    const notes = harmonyNotes(state.h);
    const octs = padCount / 8;
    pads.style.setProperty('--cols', String(padCount + 1));
    const make = (i) => {
      const note = notes[i % 8];
      const key = (note.on ? PAD_KEYS.on : PAD_KEYS.off)[Math.floor(i / 2)];
      return h('button', {
        type: 'button', class: `pad ${note.on ? 'on' : 'off'}${i % 8 === 0 ? ' root' : ''}${down.get(i) ? ' down' : ''}`, 'data-pad': String(i),
        style: { gridColumn: `${i + 1} / span 2`, gridRow: note.on ? '1' : '2' },
        'aria-label': `${note.say}, ${note.on ? 'on' : 'off'}: ${note.name}`,
      }, h('span', { class: 'pad-deg' }, deg(note.label)), h('span', { class: 'pad-note' }, note.name), h('kbd', null, key));
    };
    // the two empty corners of the zig-zag move the pads an octave down and up
    const corner = (dir) => h('button', {
      type: 'button', class: `corner${state.octave === dir ? ' sel' : ''}`, 'aria-label': dir > 0 ? 'Pads up an octave' : 'Pads down an octave', title: dir > 0 ? 'Up an octave (=)' : 'Down an octave (-)',
      style: { gridColumn: dir > 0 ? String(padCount + 1) : '1', gridRow: dir > 0 ? '1' : '2' }, onpress: () => setOctave(dir),
    }, dir > 0 ? [icon('up', 15), h('span', null, '8ve')] : [h('span', null, '8ve'), icon('down', 15)]);
    fill(pads, Array.from({ length: padCount }, (_, i) => make(i)), corner(1), corner(-1));
    pads.dataset.octs = String(octs);
  }

  const padAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const pad = el && el.closest ? el.closest('.pad') : null;
    return pad && pads.contains(pad) ? Number(pad.dataset.pad) : null;
  };
  const mark = (i, on) => {
    const n = (down.get(i) || 0) + (on ? 1 : -1);
    if (n > 0) down.set(i, n); else down.delete(i);
    const el = pads.querySelector(`[data-pad="${i}"]`);
    if (el) el.classList.toggle('down', n > 0);
  };
  function press(key, i, vel) { mark(i, true); inst.padDown(key, i, { vel }); }
  function lift(key, i) { mark(i, false); inst.padUp(key); }

  pads.addEventListener('pointerdown', (e) => {
    const i = padAt(e.clientX, e.clientY);
    if (i == null) return;
    e.preventDefault();
    try { pads.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
    touches.set(e.pointerId, i);
    press(`p${e.pointerId}`, i);
  });
  // sliding from pad to pad walks the scale
  pads.addEventListener('pointermove', (e) => {
    if (!touches.has(e.pointerId)) return;
    const was = touches.get(e.pointerId);
    const i = padAt(e.clientX, e.clientY);
    if (i == null || i === was) return;
    lift(`p${e.pointerId}`, was);
    touches.set(e.pointerId, i);
    press(`p${e.pointerId}`, i);
  });
  const padEnd = (e) => {
    if (!touches.has(e.pointerId)) return;
    lift(`p${e.pointerId}`, touches.get(e.pointerId));
    touches.delete(e.pointerId);
  };
  pads.addEventListener('pointerup', padEnd);
  pads.addEventListener('pointercancel', padEnd);
  pads.addEventListener('contextmenu', (e) => e.preventDefault());

  // a chord the loop plays lights its pad for a moment
  function flash(q) {
    const i = q.steps[q.steps.length - 1] - 8 * state.octave;
    const el = pads.querySelector(`[data-pad="${i}"]`);
    if (!el) return;
    el.classList.add('glow');
    setTimeout(() => el.classList.remove('glow'), 180);
  }

  // ---------- the key sheet ----------
  function keySheet() {
    sheet('Key and scale', (body, api) => {
      const draw = () => {
        const notes = harmonyNotes(state.home);
        fill(body,
          h('p', { class: 'sheet-label' }, 'Key'),
          h('div', { class: 'chips keys' }, KEYS.slice(0, 12).map((k) => h('button', {
            type: 'button', class: `chip${k.pc === state.home.root ? ' sel' : ''}`,
            onpress: () => { setHome(harmony(k.pc, state.home.scale)); draw(); },
          }, k.pc === 6 ? 'G♭' : k.id))),
          h('p', { class: 'sheet-label' }, 'Scale of chords'),
          h('div', { class: 'chips scales' }, SCALE_ORDER.map((id) => h('button', {
            type: 'button', class: `chip${id === state.home.scale ? ' sel' : ''}`,
            onpress: () => { setHome(harmony(state.home.root, id)); draw(); },
          }, SCALES[id].name))),
          h('div', { class: 'weave' },
            h('div', { class: 'weave-row' }, h('span', { class: 'weave-l ink-on' }, 'On'), notes.filter((n) => n.on).map((n) => h('span', { class: 'weave-n on' }, h('b', null, n.name), h('i', null, n.label))), h('span', { class: 'weave-c sym' }, chordLabel(state.home))),
            h('div', { class: 'weave-row off' }, h('span', { class: 'weave-l ink-off' }, 'Off'), notes.filter((n) => !n.on).map((n) => h('span', { class: 'weave-n off' }, h('b', null, n.name), h('i', null, n.label))), h('span', { class: 'weave-c sym' }, chordLabel(state.home, false)))),
          h('p', { class: 'muted small' }, `Eight notes: the four of ${chordLabel(state.home)} taking turns with the four of a diminished chord. The on notes sound settled. The off notes lean, and want to fall back to an on note.`),
          h('button', { type: 'button', class: 'primary wide', onpress: () => api.close() }, 'Play'));
      };
      draw();
    });
  }
  function setHome(hm) {
    state.home = { root: hm.root, scale: hm.scale };
    inst.setHarmony(hm, 'home');
  }

  // ---------- putting it together ----------
  const el = h('section', { class: 'view play', 'data-view': 'play' },
    h('div', { class: 'play-head' }, scaleBtn, h('div', { class: 'head-row' }, readout, pager)), harm, plateWrap, moves, pads);

  function refresh() {
    drawScale(); drawPager(); drawHarmony(); drawPlate(); drawRail(); drawVoices(); drawPads(); caption('');
    holdBtn.classList.toggle('sel', state.hold); keepBtn.classList.toggle('sel', state.keepOn);
  }

  events.on('harmony', () => { delete readout.dataset.live; drawScale(); drawHarmony(); drawPlate(); drawPads(); drawVoices(); });
  events.on('chord', (c) => { showChord(c); if (state.plate === 'chord') drawPlate(); drawVoices(); });
  events.on('lifted', () => drawVoices());
  events.on('voices', () => drawVoices());
  events.on('floor', () => { drawRail(); drawVoices(); });
  events.on('timeline', () => { if (band.timeline && state.page !== 'family' && state.page !== 'stations') state.page = 'chart'; drawPager(); drawHarmony(); });
  events.on('tune', () => { if (band.timeline) state.page = 'chart'; drawPager(); drawHarmony(); });
  events.on('entry', () => { if (page() === 'chart') drawChart(); });
  events.on('comp', flash);
  events.on('strum', () => stringEls.forEach((s, i) => setTimeout(() => { s.classList.remove('ping'); void s.offsetWidth; s.classList.add('ping'); }, i * 22)));

  // two octaves of pads when there is room for them
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => {
      const want = pads.clientWidth >= 640 ? 16 : 8;
      if (want !== padCount && pads.clientWidth > 0) { padCount = want; drawPads(); }
    }).observe(pads);
  }

  refresh();

  return {
    el, refresh, press, lift, setMotion, setHold, cycleVoice, borrowDown, borrowUp, mirror, keySheet,
    get padCount() { return padCount; },
    setFloor(i) { pickFloor(i, true); },
    station(i) { const st = stations(state.home)[i]; if (st) { inst.setHarmony(st.h, 'station'); caption(st.id === 'home' ? 'Home.' : `${st.label}: ${stationPhrase(state.home, st)}.`); } },
    octave: setOctave,
    scaleShort: () => scaleShort(state.h),
    keyName,
  };
}
