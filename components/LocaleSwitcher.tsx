/* eslint-disable @next/next/no-img-element */
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

const locales = [
  {
    code: 'pt-BR',
    label: 'Português',
    flag: 'https://flagcdn.com/w20/br.png',
  },
  {
    code: 'en',
    label: 'English',
    flag: 'https://flagcdn.com/w20/us.png',
  },
  {
    code: 'es',
    label: 'Español',
    flag: 'https://flagcdn.com/w20/es.png',
  },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(code: string) {
    router.replace(pathname, { locale: code });
  }

  const current = locales.find((l) => l.code === locale);

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-full cursor-pointer">
        <SelectValue>
          <span className="flex items-center gap-2">
            {current && (
              <img
                src={current.flag}
                alt={current.label}
                width={20}
                height={15}
                className="object-cover"
              />
            )}
            <span className="text-sm">{current?.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l.code} value={l.code} className='cursor-pointer'>
            <span className="flex items-center gap-2">
              <img
                src={l.flag}
                alt={l.label}
                width={20}
                height={15}
                className="object-cover"
              />
              <span>{l.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}