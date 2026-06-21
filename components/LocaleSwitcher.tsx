'use client';

/* eslint-disable @next/next/no-img-element */
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/i18n/navigation';
import { abbrevLanguage } from '@/lib/mapper';
import { cn } from '@/lib/utils';
import { ChevronDown, Globe } from 'lucide-react';
import { useLocale } from 'next-intl';

const locales = [
  {
    code: 'pt-BR',
    label: 'Português',
    flag: 'https://flagcdn.com/h40/br.png',
  },
  {
    code: 'en',
    label: 'English',
    flag: 'https://flagcdn.com/h40/us.png',
  },
  {
    code: 'es',
    label: 'Español',
    flag: 'https://flagcdn.com/h40/es.png',
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs cursor-pointer hover:bg-sidebar-accent"
          aria-label="Selecionar idioma"
        >
          {current ? (
            <img
              src={current.flag}
              alt={current.label}
              width={18}
              height={18}
              className="object-cover rounded-full h-[18px]!"
            />
          ) : (
            <Globe className="h-3.5 w-3.5" />
          )}
          <span className="uppercase">{abbrevLanguage(current?.code || 'pt-br') ?? abbrevLanguage(locale)}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => handleChange(l.code)}
            className={cn("cursor-pointer gap-2", l.code === locale && "bg-sidebar-accent")}
          >
            <img
              src={l.flag}
              alt={l.label}
              width={18}
              height={18}
              className="object-cover rounded-full h-[18px]!"
            />
            <span>{l.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}