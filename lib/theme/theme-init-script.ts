import { DEFAULT_THEME_PREFERENCES } from './defaults';
import { THEME_STORAGE_KEY } from './types';

/** Inline script — must run before React hydrates. */
export const THEME_INIT_SCRIPT = `
(function () {
  var defaults = ${JSON.stringify(DEFAULT_THEME_PREFERENCES)};
  var storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
  var appearances = ['light','dark','system','tropical'];
  var prefs = defaults;
  try {
    var raw = localStorage.getItem(storageKey);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (appearances.indexOf(parsed.appearance) >= 0) {
          prefs = { appearance: parsed.appearance };
        } else if (parsed.colorMode === 'light' || parsed.colorMode === 'dark' || parsed.colorMode === 'system') {
          /* TODO: remove branch after 2026-09-01 — mirrors parse-theme-prefs migrateLegacy */
          prefs = { appearance: parsed.colorMode };
        }
      }
    }
  } catch (e) {}

  var resolved = prefs.appearance;
  if (resolved === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolved === 'dark' ? 'dark' : 'light';
})();
`.trim();
