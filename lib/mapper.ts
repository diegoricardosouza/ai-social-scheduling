export function abbrevLanguage(language: string) {
  const lang = language.toLowerCase();
  const abbr = lang === 'pt-br' ? 'BR' : lang === 'en' ? 'En' : lang === 'es' ? 'ES' : lang;

  return abbr
}