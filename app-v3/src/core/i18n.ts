import { en } from '../i18n/en';
import { pl } from '../i18n/pl';
import type { Translations } from '../i18n/types';

export type { Translations };
export type Lang = 'pl' | 'en';

const LANG_KEY = 'webdraft-lang';

const translations: Record<Lang, Translations> = { pl, en };

function detectLang(): Lang {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === 'pl' || stored === 'en') return stored;
  return (navigator.languages?.[0] ?? navigator.language ?? '').toLowerCase().startsWith('pl')
    ? 'pl'
    : 'en';
}

export function setLang(next: Lang): void {
  localStorage.setItem(LANG_KEY, next);
}

export const lang: Lang = detectLang();
export const t: Translations = translations[lang];
