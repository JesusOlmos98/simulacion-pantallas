export function getHtmlLang(): string {
  if (typeof document === 'undefined') return 'es';
  return document.documentElement.lang || 'es';
}
