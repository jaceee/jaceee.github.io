// Choosing "Enter with sound" is the user gesture: remember it so the Experience starts the loop.
const enter = document.getElementById('enter-sound');
if (enter) {
  enter.addEventListener('click', () => {
    try { sessionStorage.setItem('sound', 'on'); } catch (_) { /* storage may be blocked */ }
  });
}
for (const a of document.querySelectorAll('a.quiet')) {
  a.addEventListener('click', () => {
    try { sessionStorage.setItem('sound', 'off'); } catch (_) { /* ignore */ }
  });
}
