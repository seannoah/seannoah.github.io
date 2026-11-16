// dom.js — a tiny helper for building DOM without a framework.

export function h(tag, attrs, ...kids) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else if (k === 'value') node.value = v;
      else node.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    node.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return node;
}

export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const ICONS = {
  today: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  learn: '<path d="M4 5.5c2.5-1 5.5-1 8 .5 2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v13"/>',
  explore: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  progress: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  play: '<path d="M8 5.5v13l11-6.5z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  ear: '<path d="M7 9a5 5 0 0110 0c0 3-2.5 3.5-3 6-.4 2-1.5 3-3 3a3 3 0 01-3-3"/><path d="M10 10a2 2 0 014 0"/>',
  motion: '<path d="M8 4l-3 3 3 3M5 7h10"/><path d="M16 14l3 3-3 3M19 17H9"/>',
  songs: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  edit: '<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13 7l4 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  metro: '<path d="M8 20h8l-2.5-15h-3z"/><path d="M12 15l5-8"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  guitar: '<path d="M14.5 9.5l5-5M18 3l3 3"/><path d="M13 8c-2 0-2.5 2-4.500 2.500S4 12.500 4 15.500 6.500 20 9 20s4.500-1.500 5-3.500S16 14 16 11z"/><circle cx="10" cy="14" r="1.6"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  repeat: '<path d="M4 12a8 8 0 0114-5l2 2M20 12a8 8 0 01-14 5l-2-2"/><path d="M20 4v5h-5M4 20v-5h5"/>',
  hub: '<circle cx="12" cy="12.500" r="2.300"/><circle cx="12" cy="4.500" r="1.800"/><circle cx="5" cy="18" r="1.800"/><circle cx="19" cy="18" r="1.800"/><path d="M12 10.200V6.300M10.200 14l-3.700 2.900M13.800 14l3.700 2.900"/>',
  leap: '<path d="M4 18C5.500 8 14.500 6 18.500 14.500"/><path d="M19.300 9.800l-.6 5-4.900-.900"/><circle cx="4" cy="18" r="1.300"/>',
  turn: '<circle cx="12" cy="4.500" r="2"/><circle cx="19.500" cy="12" r="2"/><circle cx="12" cy="19.500" r="2"/><circle cx="4.500" cy="12" r="2"/><path d="M14.800 5.600a7.500 7.500 0 013.600 3.600M18.400 14.800a7.500 7.500 0 01-3.600 3.600M9.200 18.400a7.500 7.500 0 01-3.600-3.600M5.600 9.200a7.500 7.500 0 013.600-3.600"/>',
};

export function icon(name, size = 22) {
  const span = document.createElement('span');
  span.className = 'icon';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
  return span;
}

// A row of mutually exclusive buttons.
export function segmented(options, value, onPick, cls = '') {
  return h('div', { class: 'seg ' + cls, role: 'group' }, options.map(([val, label, ic]) =>
    h('button', { class: val === value ? 'sel' : '', 'aria-pressed': val === value ? 'true' : 'false', onclick: () => onPick(val) }, ic ? icon(ic, 18) : null, label)));
}

// A labelled row of choices that scrolls sideways on a phone.
export function pickRow(label, options, value, onPick) {
  const row = h('div', { class: 'pick-row' }, options.map(([val, text]) =>
    h('button', { class: 'pick-btn' + (val === value ? ' sel' : ''), onclick: () => onPick(val) }, text)));
  // keep the chosen option in view when the row is wider than the screen
  requestAnimationFrame(() => {
    const sel = row.querySelector('.sel');
    if (sel) row.scrollLeft = sel.offsetLeft - row.clientWidth / 2 + sel.clientWidth / 2;
  });
  return h('div', { class: 'pick' }, h('div', { class: 'pick-label' }, label), row);
}
