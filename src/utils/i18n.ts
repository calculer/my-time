import arTranslations from '../locales/ar.json';
import enTranslations from '../locales/en.json';
import frTranslations from '../locales/fr.json';
import { Language } from '../types';

export const translations: Record<Language, typeof enTranslations> = {
  ar: arTranslations as unknown as typeof enTranslations,
  fr: frTranslations as unknown as typeof enTranslations,
  en: enTranslations,
};

const STORAGE_KEY = 'waqti_lang';

export function getInitialLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY) as Language;
  if (saved && (saved === 'ar' || saved === 'fr' || saved === 'en')) {
    return saved;
  }
  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  if (browserLang === 'ar') return 'ar';
  if (browserLang === 'fr') return 'fr';
  return 'en';
}

export function applyLanguageToDOM(lang: Language) {
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  localStorage.setItem(STORAGE_KEY, lang);
}

// Plural category helper
function getPluralCategory(lang: Language, count: number): string {
  if (lang === 'ar') {
    if (count === 0) return 'zero';
    if (count === 1) return 'one';
    if (count === 2) return 'two';
    const mod100 = count % 100;
    if (mod100 >= 3 && mod100 <= 10) return 'few';
    if (mod100 >= 11 && mod100 <= 99) return 'many';
    return 'other';
  }
  // English & French: 1 is 'one', otherwise 'other' (French also treats 0 as one in some contexts, but standard plural is fine)
  return count === 1 ? 'one' : 'other';
}

export function translate(
  lang: Language,
  keyPath: string,
  params?: Record<string, string | number>
): string {
  const dict = translations[lang] || translations.en;

  const resolvePath = (targetDict: unknown, path: string): unknown => {
    let current: unknown = targetDict;
    for (const part of path.split('.')) {
      if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return current;
  };

  let node: unknown = undefined;

  // 1. Plural candidate check if params.count is present
  if (params && 'count' in params && typeof params.count === 'number') {
    const category = getPluralCategory(lang, params.count);
    node =
      resolvePath(dict, `${keyPath}_${category}`) ??
      resolvePath(dict, `${keyPath}_other`) ??
      resolvePath(translations.en, `${keyPath}_${getPluralCategory('en', params.count)}`) ??
      resolvePath(translations.en, `${keyPath}_other`);
  }

  // 2. Direct path check
  if (node === undefined) {
    node = resolvePath(dict, keyPath) ?? resolvePath(translations.en, keyPath);
  }

  if (typeof node !== 'string') {
    return keyPath;
  }

  // Replace {{param}} tokens
  let result = node;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    }
  }

  return result;
}


// Localized date and time formatting
export function formatLocalizedDate(
  date: Date | string,
  lang: Language,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const locale = lang === 'ar' ? 'ar-EG' : lang === 'fr' ? 'fr-FR' : 'en-US';
  const defaultOpts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat(locale, defaultOpts).format(d);
}

export function formatLocalizedTime(
  timeStr: string, // "14:30"
  lang: Language,
  format12h = false
): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  if (!format12h) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  const period = h >= 12
    ? (lang === 'ar' ? 'م' : 'PM')
    : (lang === 'ar' ? 'ص' : 'AM');
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}
