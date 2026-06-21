import type { Locale } from 'date-fns';
import { enUS, es, ptBR } from 'date-fns/locale';

const LOCALES: Record<string, Locale> = {
  'pt-BR': ptBR,
  'en': enUS,
  'es': es,
};

export function getDateFnsLocale(locale: string): Locale {
  return LOCALES[locale] ?? ptBR;
}