import * as sound from './audio.js';
import './nav.js';

// Choosing "Enter with sound" is the user gesture: start the loop in this very click and load the
// Experience into this same document (no navigation), so the browser never blocks the audio.
const enter = document.getElementById('enter-sound');
let entering = false;

async function loadExperience() {
  const res = await fetch('/experience/', { cache: 'no-cache' });
  if (!res.ok) throw new Error('experience ' + res.status);
  const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '/assets/css/experience.css';
  await new Promise((ok, fail) => { css.onload = ok; css.onerror = fail; document.head.appendChild(css); });
  for (const s of doc.querySelectorAll('script')) s.remove();
  document.title = doc.title;
  document.body.className = 'exp';
  document.body.replaceChildren(...doc.body.childNodes);
  history.pushState({ exp: 1 }, '', '/experience/');
  await import('/assets/js/experience.js');
}

if (enter) {
  enter.addEventListener('click', (ev) => {
    try { sessionStorage.setItem('sound', 'on'); } catch (_) { /* storage may be blocked */ }
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button) return; // let new-tab clicks navigate
    ev.preventDefault();
    if (entering) return;
    entering = true;
    sound.play(); // inside the user gesture
    loadExperience().catch(() => { location.href = '/experience/'; });
  });
}
for (const a of document.querySelectorAll('a.quiet')) {
  a.addEventListener('click', () => {
    try { sessionStorage.setItem('sound', 'off'); } catch (_) { /* ignore */ }
  });
}
