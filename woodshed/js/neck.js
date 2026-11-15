// neck.js — draws a stretch of fretboard as SVG, tab-style: string 1 on top, low frets on the left.
// Marks are dots with a short label; taps report the nearest string and fret.

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, text) => {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text != null) node.textContent = text;
  return node;
};

const CELL = 50;      // width of one fret
const GAP = 30;       // distance between strings
const PAD_L = 30;     // room for string numbers
const PAD_R = 14;
const PAD_T = 18;
const PAD_B = 26;     // room for fret numbers
const OPEN_W = 34;    // column for open strings, left of the nut
const INLAYS = [3, 5, 7, 9, 15, 17];

// opts: { lo, hi, marks, focus (array of strings, others are dimmed), onTap(string, fret) }
export function neck(opts) {
  const lo = Math.max(0, opts.lo);
  const hi = Math.max(lo + 3, opts.hi);
  const first = Math.max(1, lo);            // first fretted cell
  const cells = hi - first + 1;
  const showOpen = lo === 0;
  const x0 = PAD_L + (showOpen ? OPEN_W : 0); // x of the left edge of the first cell
  const width = x0 + cells * CELL + PAD_R;
  const height = PAD_T + 5 * GAP + PAD_B;
  const sy = (string) => PAD_T + (string - 1) * GAP;
  const fx = (fret) => (fret === 0 ? PAD_L + OPEN_W / 2 : x0 + (fret - first + 0.5) * CELL);

  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, class: 'neck', role: 'img', 'aria-label': opts.label || 'Fretboard' });
  if (cells > 8) svg.style.minWidth = `${Math.round(width * 0.86)}px`;
  svg.style.maxWidth = `${Math.round(width * 1.25)}px`;

  // board
  const board = el('g', { class: 'neck-board' });
  for (const f of INLAYS.concat(12)) {
    if (f < first || f > hi) continue;
    const cx = fx(f);
    if (f === 12) {
      board.append(el('circle', { cx, cy: sy(2) + GAP / 2, r: 4.5, class: 'inlay' }));
      board.append(el('circle', { cx, cy: sy(4) + GAP / 2, r: 4.5, class: 'inlay' }));
    } else {
      board.append(el('circle', { cx, cy: sy(3) + GAP / 2, r: 4.5, class: 'inlay' }));
    }
  }
  for (let c = 0; c <= cells; c++) {
    const x = x0 + c * CELL;
    const nut = c === 0 && first === 1;
    board.append(el('line', { x1: x, y1: sy(1), x2: x, y2: sy(6), class: nut ? 'nut' : 'fret' }));
  }
  for (let s = 1; s <= 6; s++) {
    const dim = opts.focus && !opts.focus.includes(s);
    board.append(el('line', {
      x1: PAD_L + (showOpen ? 4 : 0), y1: sy(s), x2: x0 + cells * CELL, y2: sy(s),
      class: 'string' + (dim ? ' dim' : ''), 'stroke-width': (0.9 + s * 0.22).toFixed(2),
    }));
    board.append(el('text', { x: 10, y: sy(s) + 4, class: 'string-num' + (dim ? ' dim' : ''), 'text-anchor': 'middle' }, s));
  }
  for (let f = first; f <= hi; f++) {
    board.append(el('text', { x: fx(f), y: height - 7, class: 'fret-num', 'text-anchor': 'middle' }, f));
  }
  if (showOpen) board.append(el('text', { x: fx(0), y: height - 7, class: 'fret-num', 'text-anchor': 'middle' }, '0'));
  svg.append(board);

  const layer = el('g', { class: 'neck-marks' });
  svg.append(layer);

  function draw(marks) {
    layer.replaceChildren();
    for (const m of marks || []) {
      if (m.fret < lo || m.fret > hi) continue;
      const g = el('g', { class: `mark m-${m.kind || 'pick'}`, transform: `translate(${fx(m.fret)},${sy(m.string)})` });
      g.append(el('circle', { r: 12.5 }));
      if (m.label != null) {
        const len = String(m.label).length;
        g.append(el('text', { y: 4.2, 'text-anchor': 'middle', class: len > 2 ? 'small' : '' }, m.label));
      }
      layer.append(g);
    }
  }
  draw(opts.marks);

  if (opts.onTap) {
    svg.classList.add('tappable');
    svg.addEventListener('click', (ev) => {
      const pt = svg.createSVGPoint();
      pt.x = ev.clientX; pt.y = ev.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const string = Math.round((p.y - PAD_T) / GAP) + 1;
      if (string < 1 || string > 6) return;
      let fret;
      if (showOpen && p.x < x0) fret = 0;
      else fret = first + Math.floor((p.x - x0) / CELL);
      if (fret < lo || fret > hi) return;
      opts.onTap(string, fret);
    });
  }

  const wrap = document.createElement('div');
  wrap.className = 'neck-wrap';
  wrap.append(svg);

  return {
    el: wrap,
    draw,
    // Bring a fret into view when the neck is wider than the screen.
    reveal(fret) {
      const ratio = fx(fret) / width;
      const target = ratio * wrap.scrollWidth - wrap.clientWidth / 2;
      wrap.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    },
  };
}

// A window of frets that comfortably contains the given frets (at least `min` cells wide).
export function windowFor(frets, min = 6, max = 17) {
  const fretted = frets.filter((f) => f > 0);
  const low = fretted.length ? Math.min(...fretted) : 1;
  const high = fretted.length ? Math.max(...fretted) : 1;
  const hasOpen = frets.some((f) => f === 0);
  let lo = hasOpen ? 0 : Math.max(1, low - 1);
  let hi = Math.max(high + 1, (lo || 1) + min - 1);
  if (hi > max) { hi = max; lo = Math.min(lo, Math.max(hasOpen ? 0 : 1, hi - min + 1)); }
  return { lo, hi };
}
