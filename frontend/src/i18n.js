import en from './locales/en.json';
import am from './locales/am.json';

const locales = { en, am };

export function t(key, language = 'en') {
  return locales[language]?.[key] || locales.en[key] || key;
}

export function getLocale(language) {
  return locales[language] || locales.en;
}
