import { CV_URL } from './config.js';

export function applyCv() {
  if (!CV_URL) return;
  for (const a of document.querySelectorAll('#cv-link')) {
    a.href = CV_URL;
    a.hidden = false;
  }
}
applyCv();
