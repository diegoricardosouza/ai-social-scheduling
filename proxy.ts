import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  '/:locale/sign-in',
  '/:locale/sign-up',
  '/:locale',
  '/api/inngest',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // ← pula o intlMiddleware para rotas de API
  if (!req.nextUrl.pathname.startsWith('/api')) {
    const response = intlMiddleware(req);
    if (response) return response;
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // exclui /api do matcher do next-intl, mas mantém para o Clerk
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};