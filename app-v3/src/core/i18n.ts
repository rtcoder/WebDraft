import { en } from '../i18n/en';
import { pl } from '../i18n/pl';
import type { Translations } from '../i18n/types';

export type { Translations };
export type Lang = 'pl' | 'en';

const translations: Record<Lang, Translations> = { pl, en };

export const lang: Lang = (
  (navigator.languages?.[0] ?? navigator.language ?? '').toLowerCase().startsWith('pl')
) ? 'pl' : 'en';

export const t: Translations = translations[lang];
