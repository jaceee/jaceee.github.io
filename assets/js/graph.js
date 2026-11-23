// Renders a graph (assets/data/graph.json) as SVG on the 390x844 stage, and the open-node screen.
const NS = 'http://www.w3.org/2000/svg';
const COL = { what: '#F2C6A0', where: '#A9B8FF', with: '#9FE0D0' };
const DIM = { what: '#6E6558', with: '#4F6660', where: '#5E6680' };

function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}
function lines(parent, text, x, y, attrs, lh = 16) {
  const t = el('text', attrs, parent);
  const parts = text.split('\n');
  const y0 = y - ((parts.length - 1) * lh) / 2;
  parts.forEach((p, i) => { const s = el('tspan', { x, y: y0 + i * lh }, t); s.textContent = p; });
  return t;
}
export const plain = (s) => s.replace(/\n/g, ' ');

export function byId(g) { return new Map(g.nodes.map((n) => [n.id, n])); }
export function neighbors(g, id) {
  const m = byId(g), out = [];
  for (const [a, b] of g.edges) { if (a === id && m.has(b)) out.push(m.get(b)); else if (b === id && m.has(a)) out.push(m.get(a)); }
  return out;
}

// One node mark (circle for companies/projects, diamond for categories, ring for technologies) with its label.
function drawNode(svg, n, { bright, focus, kind, onOpen, label = true }) {
  const g = el('g', { class: 'node' + (focus ? ' focus' : ''), tabindex: 0, role: 'button', 'data-id': n.id,
    'aria-label': `${plain(n.title || n.label)}. Open` }, svg);
  const ink = bright ? '#ECEEF4' : '#8C93A6';
  el('circle', { class: 'hit', cx: n.x, cy: n.y, r: 22, fill: 'transparent' }, g);
  if (n.col === 'what') {
    el('rect', { x: n.x - 5, y: n.y - 5, width: 10, height: 10, transform: `rotate(45 ${n.x} ${n.y})`, fill: '#0A0B10', 'stroke-width': 1.5, stroke: bright ? COL.what : DIM.what }, g);
    if (label) lines(g, n.label, n.x - 14, n.y, { class: 'lbl', 'text-anchor': 'end', fill: ink, 'dominant-baseline': 'central' }, 16);
  } else if (n.col === 'with') {
    el('circle', { cx: n.x, cy: n.y, r: 4, fill: '#0A0B10', 'stroke-width': 1.5, stroke: bright ? COL.with : DIM.with }, g);
    if (label) lines(g, n.label, n.x + 16, n.y, { class: 'lbl', 'text-anchor': 'start', fill: ink, 'dominant-baseline': 'central' });
  } else if (focus || n.hub) {
    if (focus) el('circle', { class: 'glow', cx: n.x, cy: n.y, r: 13, fill: 'none' }, g);
    el('circle', { cx: n.x, cy: n.y, r: focus ? 7 : 7, fill: COL.where }, g);
    if (label) lines(g, n.label, n.x, n.y - (focus ? 22 : n.label.includes('\n') ? 34 : 26), { class: 'lbl strong', 'text-anchor': 'middle', fill: '#ECEEF4' }, 16);
  } else {
    el('circle', { cx: n.x, cy: n.y, r: 5, fill: bright ? COL.where : DIM.where }, g);
    if (label) lines(g, n.label, n.x, n.y - 18, { class: 'lbl company', 'text-anchor': 'middle', fill: ink });
  }
  const open = () => onOpen(n.id);
  g.addEventListener('click', open);
  g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); open(); } });
  return g;
}

function line(svg, a, b, o) { return el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, 'stroke-linecap': 'round', fill: 'none', ...o }, svg); }

export function renderMap(host, g, { onOpen, nextHref, nextLabel, prevHref, prevLabel, hint, readHref }) {
  host.textContent = '';
  const m = byId(g);
  const focusId = g.focus;
  const hot = new Set(focusId ? [focusId, ...neighbors(g, focusId).map((n) => n.id)] : g.nodes.map((n) => n.id));
  const svg = el('svg', { class: 'gsvg', viewBox: '0 0 390 844', width: 390, height: 844, 'aria-label': g.id === 'work' ? 'Graph of my work' : 'Graph of what I do beyond work' }, host);
  // spine
  for (let i = 0; i < g.spine.length - 1; i++) {
    line(svg, m.get(g.spine[i]), m.get(g.spine[i + 1]), { stroke: '#ECEEF4', 'stroke-opacity': g.highlight === 'all' ? .2 : .22, 'stroke-width': 1, 'stroke-dasharray': '2 5' });
  }
  const isHot = (a, b) => (focusId ? (a === focusId || b === focusId) : true);
  for (const [a, b] of g.edges) if (!isHot(a, b)) line(svg, m.get(a), m.get(b), { stroke: '#ECEEF4', 'stroke-opacity': .12, 'stroke-width': 1 });
  for (const [a, b] of g.edges) if (isHot(a, b)) line(svg, m.get(a), m.get(b), { stroke: '#A9B8FF', 'stroke-opacity': g.highlight === 'all' ? .65 : .75, 'stroke-width': 1.25 });
  // column headers
  for (const c of g.columns) {
    const t = el('text', { class: 'colhead', x: c.align === 'right' ? c.x + c.w : c.align === 'center' ? c.x + c.w / 2 : c.x, y: 99, fill: c.color,
      'text-anchor': c.align === 'right' ? 'end' : c.align === 'center' ? 'middle' : 'start' }, svg);
    t.textContent = c.label;
  }
  for (const n of g.nodes) drawNode(svg, n, { bright: hot.has(n.id), focus: n.id === focusId, onOpen });

  const top = document.createElement('div');
  top.className = 'top';
  top.innerHTML = '';
  host.appendChild(top);
  const title = document.createElement('div');
  title.className = 'maptitle';
  title.textContent = g.id === 'work' ? 'Jonatan Cardona Casas' : 'Beyond work';
  top.appendChild(title);
  const rd = document.createElement('a');
  rd.className = 'readlink'; rd.href = readHref; rd.textContent = 'Read';
  top.appendChild(rd);
  const foot = document.createElement('div');
  foot.className = 'foot';
  foot.innerHTML = '';
  if (prevHref) foot.appendChild(navLink(prevHref, prevLabel, 'left'));
  else { const h = document.createElement('p'); h.className = 'hint'; h.textContent = hint; foot.appendChild(h); }
  foot.appendChild(navLink(nextHref, nextLabel, 'right'));
  host.appendChild(foot);
}

const ARROW_R = '<svg class="icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';
const ARROW_L = '<svg class="icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></svg>';
export function navLink(href, label, dir) {
  const a = document.createElement('a');
  a.className = 'nav'; a.href = href;
  const span = document.createElement('span'); span.textContent = label;
  a.innerHTML = dir === 'left' ? ARROW_L : '';
  a.appendChild(span);
  if (dir !== 'left') a.insertAdjacentHTML('beforeend', ARROW_R);
  return a;
}

// Open-node screen: the node at the centre, neighbours fanned out, details below.
export function renderNode(host, g, id, { onOpen, backHref }) {
  host.textContent = '';
  const m = byId(g);
  const n = m.get(id);
  const nb = neighbors(g, id);
  const cx = 195, cy = 236;
  const side = (x) => (x.col === 'what' ? 'L' : x.col === 'with' ? 'R' : (n.col === 'what' ? 'R' : 'L'));
  const left = nb.filter((x) => side(x) === 'L'), right = nb.filter((x) => side(x) === 'R');
  const spread = (arr, xs) => arr.map((x, i) => {
    const k = arr.length, y = k === 1 ? cy : 136 + (200 * i) / (k - 1);
    const xx = xs[i % xs.length];
    return { ...x, x: xx, y, id: x.id };
  });
  const L = spread(left, left.length > 3 ? [118, 132] : [128, 114]);
  const Rr = spread(right, right.length === 6 ? [250, 268, 276, 276, 268, 250] : [262, 276]);
  const svg = el('svg', { class: 'gsvg short', viewBox: '0 0 390 400', width: 390, height: 400, 'aria-hidden': 'false' }, host);
  for (const x of [...L, ...Rr]) line(svg, { x: cx, y: cy }, x, { stroke: '#A9B8FF', 'stroke-opacity': .7, 'stroke-width': 1.25 });
  line(svg, { x: cx, y: cy }, { x: cx, y: 372 }, { stroke: '#ECEEF4', 'stroke-opacity': .22, 'stroke-width': 1, 'stroke-dasharray': '2 5' });
  for (const x of [...L, ...Rr]) drawNode(svg, x, { bright: true, onOpen });
  // the selected node itself (not interactive: it is already open)
  el('circle', { class: 'glow', cx, cy, r: 14, fill: 'none' }, svg);
  el('circle', { cx, cy, r: 9, fill: '#A9B8FF' }, svg);

  const back = navLink(backHref, g.backLabel, 'left');
  back.classList.add('backlink');
  host.appendChild(back);

  const panel = document.createElement('div');
  panel.className = 'panel';
  const k = document.createElement('p'); k.className = 'kick';
  k.textContent = g.kickers[n.col] + (n.period ? ' · ' + n.period : '');
  const h = document.createElement('h1'); h.textContent = n.title || plain(n.label);
  panel.append(k, h);
  if (n.role) { const r = document.createElement('p'); r.className = 'role'; r.textContent = n.role; panel.appendChild(r); }
  if (n.text) { const p = document.createElement('p'); p.className = 'text'; p.textContent = n.text; panel.appendChild(p); }
  // Where it shows up: the companies/projects (column "where") connected to it.
  const seen = n.col === 'where' ? [] : nb.filter((x) => x.col === 'where');
  if (seen.length) {
    const hd = document.createElement('p'); hd.className = 'seenhead'; hd.textContent = g.seenLabel; panel.appendChild(hd);
    const ul = document.createElement('ul'); ul.className = 'seen';
    for (const s of seen) {
      const li = document.createElement('li');
      const b = document.createElement('button'); b.type = 'button'; b.textContent = s.title || plain(s.label);
      if (s.period) { const sp = document.createElement('span'); sp.textContent = s.period; b.appendChild(sp); }
      b.addEventListener('click', () => onOpen(s.id));
      li.appendChild(b); ul.appendChild(li);
    }
    panel.appendChild(ul);
  }
  host.appendChild(panel);

  // "Later: X" / "Earlier: X" for companies, following the chronological spine.
  if (g.id === 'work' && n.col === 'where') {
    const i = g.spine.indexOf(n.id);
    const laterId = i > 0 ? g.spine[i - 1] : null;
    const earlierId = i >= 0 ? g.spine[i + 1] : null;
    if (laterId || earlierId) {
      const wrap = document.createElement('div');
      wrap.className = 'siblings';
      if (laterId) {
        const a = navLink('#node/' + g.id + '/' + laterId, 'Later: ' + plain(m.get(laterId).label), 'left');
        a.classList.add('later');
        wrap.appendChild(a);
      }
      if (earlierId) {
        const a = navLink('#node/' + g.id + '/' + earlierId, 'Earlier: ' + plain(m.get(earlierId).label), 'right');
        a.classList.add('earlier');
        wrap.appendChild(a);
      }
      host.appendChild(wrap);
    }
  }
  return n;
}
