import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Locale negotiation middleware (next-intl):
 * - `/` → redirects to `/ar` (default) or `/en` based on cookie / Accept-Language
 * - all app routes live under `app/[locale]/`
 */
export default createMiddleware(routing);

export const config = {
  // Match all paths except API routes, Next internals and static files.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
