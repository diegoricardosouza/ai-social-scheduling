import { routing } from '@/i18n/routing';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server'; // ← getMessages novo
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  // busca as mensagens para passar ao client
  const messages = await getMessages(); // ← novo

  return (
    <NextIntlClientProvider messages={messages}> {/* ← novo */}
      {children}
    </NextIntlClientProvider>
  );
}