// Minimal, dependency-free i18n. One flat dictionary per language, in
// ./locales/*. Keys are shared across languages; `t(key)` resolves against the
// active language and falls back to English (the default) for any missing key.

import { en } from "./locales/en.js";
import { pl } from "./locales/pl.js";
import { de } from "./locales/de.js";
import { es } from "./locales/es.js";
import { fr } from "./locales/fr.js";
import { it } from "./locales/it.js";
import { pt } from "./locales/pt.js";

export type Lang = "en" | "pl" | "de" | "es" | "fr" | "it" | "pt";

export type Dict = Record<string, string>;

// Order shown in the selector: English (default) first, Polish second, then a
// few of the most widely spoken languages. `label` is each language's own
// endonym so speakers recognise it regardless of the current UI language.
export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
];

const DICTS: Record<Lang, Dict> = { en, pl, de, es, fr, it, pt };

const SUPPORTED = new Set<string>(LANGS.map((l) => l.code));

const DEFAULT_LANG: Lang = "en";

let current: Lang = detectInitialLang();

function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem("certownia.lang");
    if (saved && SUPPORTED.has(saved)) return saved as Lang;
  } catch {
    /* localStorage may be unavailable */
  }
  const nav = typeof navigator !== "undefined" ? navigator.language : "";
  const short = nav.toLowerCase().split("-")[0];
  if (SUPPORTED.has(short)) return short as Lang;
  return DEFAULT_LANG;
}

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  current = SUPPORTED.has(lang) ? lang : DEFAULT_LANG;
  try {
    localStorage.setItem("certownia.lang", current);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = current;
}

/** Translate a key, with optional positional {0},{1}… substitutions. */
export function t(key: string, ...args: (string | number)[]): string {
  const dict = DICTS[current];
  let s = dict[key] ?? en[key] ?? key;
  args.forEach((a, i) => {
    s = s.replace(`{${i}}`, String(a));
  });
  return s;
}
