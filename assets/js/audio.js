// Ambient loop. The file is optional: if assets/audio/ambient.mp3 is missing or fails, the site stays silent and the button is hidden.
const SRC = '/assets/audio/ambient.mp3';
const TARGET_VOLUME = 0.22;
const FADE_MS = 2000;

let el = null;
let available = null; // null = unknown, true/false after the HEAD check
let wanted = false;   // user wants sound
let fadeRaf = 0;
const listeners = new Set();

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function emit() { for (const f of listeners) f(state()); }
export function state() { return { available: available === true, playing: !!el && !el.paused, wanted }; }
export function onChange(f) { listeners.add(f); }

function store(v) { try { sessionStorage.setItem('sound', v); } catch (_) { /* ignore */ } }
export function stored() { try { return sessionStorage.getItem('sound'); } catch (_) { return null; } }

export async function check() {
  if (available !== null) return available;
  try {
    const r = await fetch(SRC, { method: 'HEAD', cache: 'no-cache' });
    available = r.ok;
  } catch (_) { available = false; }
  emit();
  return available;
}

function fadeTo(v, ms, done) {
  cancelAnimationFrame(fadeRaf);
  if (!el) return;
  if (reduced() || ms <= 0) { el.volume = v; if (done) done(); return; }
  const from = el.volume, t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    el.volume = from + (v - from) * k;
    if (k < 1) fadeRaf = requestAnimationFrame(step); else if (done) done();
  };
  fadeRaf = requestAnimationFrame(step);
}

function ensure() {
  if (el) return el;
  el = new Audio();
  el.loop = true;
  el.preload = 'none';
  el.volume = 0;
  el.addEventListener('error', () => { available = false; wanted = false; emit(); });
  el.addEventListener('playing', emit);
  el.addEventListener('pause', emit);
  el.src = SRC;
  return el;
}

// Returns true if playback started. Rejection (autoplay policy) leaves `wanted` true so a later gesture can retry.
export async function play() {
  wanted = true; store('on');
  if (!(await check())) { wanted = false; return false; }
  const a = ensure();
  try {
    await a.play();
    fadeTo(TARGET_VOLUME, FADE_MS);
    emit();
    return true;
  } catch (_) { emit(); return false; }
}

export function mute() {
  wanted = false; store('off');
  if (el) fadeTo(0, 400, () => { el.pause(); emit(); });
  emit();
}

export function toggle() { if (state().playing) { mute(); return false; } return play(); }

// If the user chose sound but the browser blocked autoplay on this page, start on the first gesture.
export function armGesture(ignore) {
  const go = async (ev) => {
    if (ignore && ev.target instanceof Node && ignore.contains(ev.target)) return;
    off();
    if (stored() === 'on' && !state().playing) await play();
  };
  const off = () => { window.removeEventListener('pointerdown', go, true); window.removeEventListener('keydown', go, true); };
  window.addEventListener('pointerdown', go, true);
  window.addEventListener('keydown', go, true);
}
