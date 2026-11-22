import { renderMap, renderNode, byId } from './graph.js';
import * as sound from './audio.js';
import './cv.js';
import './nav.js';

const viewport = document.getElementById('viewport');
const stage = document.getElementById('stage');
const scenes = Object.fromEntries([...document.querySelectorAll('.scene')].map((s) => [s.dataset.scene, s]));
const muteBtn = document.getElementById('mute');
let graphs = null;

// ---- scale the 390x844 stage to the viewport, centred ----
function fit() {
  const s = Math.min(window.innerWidth / 390, window.innerHeight / 844);
  const x = (window.innerWidth - 390 * s) / 2, y = (window.innerHeight - 844 * s) / 2;
  stage.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
}
window.addEventListener('resize', fit);
fit();

// ---- sound button ----
const slash = document.createElementNS('http://www.w3.org/2000/svg', 'path');
slash.setAttribute('d', 'M4 4l16 16');
slash.setAttribute('class', 'slash');
muteBtn.querySelector('svg').appendChild(slash);
function paintMute(st) {
  muteBtn.hidden = !st.available;
  muteBtn.dataset.muted = String(!st.playing);
  muteBtn.setAttribute('aria-label', st.playing ? 'Mute sound' : 'Unmute sound');
}
sound.onChange(paintMute);
muteBtn.addEventListener('click', () => { sound.toggle(); });
async function initSound() {
  const ok = await sound.check();
  paintMute(sound.state());
  if (!ok) return;
  if (sound.stored() === 'on') {
    const started = await sound.play();
    if (!started && sound.state().available) sound.armGesture(muteBtn);
  }
}

// ---- routing: #intro | #map | #node/<graph>/<id> | #beyond | #how | #close ----
function parse() {
  const h = decodeURIComponent(location.hash.replace(/^#/, ''));
  const [a, b, c] = h.split('/');
  if (a === 'node' && graphs && graphs[b] && byId(graphs[b]).has(c)) return { scene: 'node', graph: b, id: c };
  if (['map', 'beyond', 'how', 'close', 'intro'].includes(a)) return { scene: a };
  return { scene: 'intro' };
}

let current = null;
function show(route) {
  const key = route.scene + (route.id ? ':' + route.graph + ':' + route.id : '');
  if (key === current) return;
  current = key;
  const open = (g, id) => { location.hash = `#node/${g}/${id}`; };
  if (route.scene === 'map') {
    renderMap(scenes.map, graphs.work, { onOpen: (id) => open('work', id), nextHref: '#beyond', nextLabel: 'Beyond work', hint: 'Tap a node to follow it.', readHref: '/read/' });
  } else if (route.scene === 'beyond') {
    renderMap(scenes.beyond, graphs.beyond, { onOpen: (id) => open('beyond', id), prevHref: '#map', prevLabel: 'Work', nextHref: '#how', nextLabel: 'How I work', readHref: '/read/' });
  } else if (route.scene === 'node') {
    const g = graphs[route.graph];
    renderNode(scenes.node, g, route.id, { onOpen: (id) => open(route.graph, id), backHref: route.graph === 'work' ? '#map' : '#beyond' });
  }
  for (const [name, s] of Object.entries(scenes)) {
    const on = name === route.scene;
    s.hidden = !on;
    s.classList.toggle('enter', on);
  }
  const s = scenes[route.scene];
  s.tabIndex = -1;
  s.style.outline = 'none';
  s.focus({ preventScroll: true });
  const titles = { intro: 'Experience', map: 'Work map', node: 'Node', beyond: 'Beyond work', how: 'How I work', close: 'Get in touch' };
  document.title = `Jonatan Cardona Casas, ${titles[route.scene].toLowerCase()}`;
}

function route() { if (graphs) show(parse()); }
window.addEventListener('hashchange', route);
window.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  const r = parse();
  if (r.scene === 'node') location.hash = r.graph === 'work' ? '#map' : '#beyond';
});

try {
  const res = await fetch('/assets/data/graph.json');
  graphs = await res.json();
} catch (_) {
  location.replace('/read/'); // no data, no map: fall back to the readable version
}
if (graphs) {
  viewport.hidden = false;
  fit();
  route();
  initSound();
}
