// dom.js — small helpers for building the page: elements, icons, sliders, sheets.

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  add(el, kids);
  return el;
}
export function add(el, kids) {
  for (const kid of [kids].flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
// A degree label with its accidental set apart: the serif face has no good sharp or flat.
export function deg(label) {
  const m = /^([♯♭])(.*)$/.exec(label);
  return m ? [h('span', { class: 'acc' }, m[1]), m[2]] : [label];
}
// Any text, with its sharps and flats set in the sans face.
export function acc(text) {
  return String(text).split(/([♯♭])/).map((part, i) => (i % 2 ? h('span', { class: 'acc flat' }, part) : part));
}
export const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
export const fill = (el, ...kids) => add(clear(el), kids);

const PATHS = {
  play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none"/>',
  rec: '<circle cx="12" cy="12" r="6" fill="currentColor" stroke="none"/>',
  pads: '<circle cx="6" cy="8" r="2.4"/><circle cx="14" cy="8" r="2.4"/><circle cx="10" cy="16" r="2.4"/><circle cx="18" cy="16" r="2.4"/>',
  loop: '<rect x="3.5" y="5" width="4" height="4" rx="1"/><rect x="10" y="5" width="4" height="4" rx="1"/><rect x="16.5" y="5" width="4" height="4" rx="1"/><rect x="3.5" y="15" width="4" height="4" rx="1"/><rect x="10" y="15" width="4" height="4" rx="1"/><rect x="16.5" y="15" width="4" height="4" rx="1"/>',
  sound: '<path d="M4 8v8M8 5v14M12 9v6M16 4v16M20 9v6"/>',
  tune: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.6 2.3c-.8.5-1.2 1-1.2 2"/><circle cx="12" cy="16.9" r=".6" fill="currentColor"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  minus: '<path d="M6 12h12"/>',
  plus: '<path d="M12 6v12M6 12h12"/>',
  click: '<path d="M8 20h8l-2.4-15h-3.2z"/><path d="M12 14l5-7"/>',
  trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7"/>',
};
export function icon(name, size = 20) {
  const span = document.createElement('span');
  span.className = 'icon';
  span.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || ''}</svg>`;
  return span;
}

// A row of choices where one is chosen. options: [{ id, label, title }]. Returns { el, set }.
export function segmented(options, value, onPick, cls = '') {
  const el = h('div', { class: `seg ${cls}`, role: 'group' });
  const buttons = options.map((o) => {
    const b = h('button', { type: 'button', class: 'seg-b', title: o.title || null, 'aria-pressed': 'false', onclick: () => { set(o.id); onPick(o.id); } }, o.label);
    el.append(b);
    return b;
  });
  function set(id) {
    options.forEach((o, i) => { const on = o.id === id; buttons[i].classList.toggle('sel', on); buttons[i].setAttribute('aria-pressed', String(on)); });
  }
  set(value);
  return { el, set };
}

// A labelled slider working in 0-1. format(x) gives the text shown beside the label.
export function slider({ label, value, format, onInput, onChange, hint, cls = '' }) {
  const out = h('span', { class: 'sl-v' }, format ? format(value) : '');
  const input = h('input', { type: 'range', min: '0', max: '1', step: '0.001', value: String(value), 'aria-label': label });
  input.addEventListener('input', () => {
    const x = Number(input.value);
    if (format) out.textContent = format(x);
    onInput(x);
  });
  if (onChange) input.addEventListener('change', () => onChange(Number(input.value)));
  const el = h('label', { class: `sl ${cls}`, title: hint || null }, h('span', { class: 'sl-top' }, h('span', { class: 'sl-l' }, label), out), input);
  return { el, set(x) { input.value = String(x); if (format) out.textContent = format(x); } };
}

// A panel that slides up over the page. Returns { el, body, close }.
let openSheet = null;
export function sheet(title, build, { wide = false } = {}) {
  if (openSheet) openSheet.close();
  const body = h('div', { class: 'sheet-body' });
  const panel = h('div', { class: `sheet${wide ? ' wide' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div', { class: 'sheet-head' }, h('h2', null, title), h('button', { type: 'button', class: 'icon-b', 'aria-label': 'Close', onclick: () => close() }, icon('close'))),
    body);
  const veil = h('div', { class: 'veil', onclick: (e) => { if (e.target === veil) close(); } }, panel);
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  function close() {
    if (openSheet !== api) return;
    openSheet = null;
    document.removeEventListener('keydown', onKey, true);
    veil.remove();
    document.body.classList.remove('sheet-open');
  }
  const api = { el: panel, body, close };
  openSheet = api;
  build(body, api);
  document.body.append(veil);
  document.body.classList.add('sheet-open');
  document.addEventListener('keydown', onKey, true);
  return api;
}
export const sheetIsOpen = () => !!openSheet;

// A tiny publish and subscribe, so the screens can hear what the instrument does.
export function bus() {
  const map = new Map();
  return {
    on(name, fn) { if (!map.has(name)) map.set(name, new Set()); map.get(name).add(fn); return () => map.get(name).delete(fn); },
    emit(name, data) { for (const fn of map.get(name) || []) fn(data); },
  };
}
