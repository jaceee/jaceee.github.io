// Back/Forward guard, shared by Inicio and the Experience (a module runs once per document).
// Reload only when the URL no longer matches what is on screen; hash changes between scenes keep the path.
window.addEventListener('popstate', () => {
  if ((location.pathname === '/experience/') !== document.body.classList.contains('exp')) location.reload();
});
