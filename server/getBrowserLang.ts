import { headers } from 'next/headers';

const SUPPORTED_LANGS = new Set([
  'es',
  'en',
  'ar',
  'ca',
  'de',
  'el',
  'fr',
  'hi',
  'hu',
  'id',
  'jp',
  'ko',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'tr',
  'vi',
  'zh'
]);

function normalizeLang(lang?: string): string {
  const baseLang = lang?.toLowerCase().split('-')[0];

  if (baseLang === 'ja') return 'jp';
  if (baseLang != null && SUPPORTED_LANGS.has(baseLang)) return baseLang;

  return 'es';
}

export async function getBrowserLang(): Promise<string> {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  if (acceptLanguage == null || acceptLanguage.trim() === '') return 'es';

  const preferredLanguages = acceptLanguage
    .split(',')
    .map((value) => value.split(';')[0]?.trim())
    .filter((value): value is string => value != null && value !== '');

  for (const preferredLanguage of preferredLanguages) {
    const normalizedLanguage = normalizeLang(preferredLanguage);
    if (SUPPORTED_LANGS.has(normalizedLanguage)) return normalizedLanguage;
  }

  return 'es';
}
