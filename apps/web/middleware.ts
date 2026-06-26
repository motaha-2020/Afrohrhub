import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

const LOCALES = routing.locales;
const PUBLIC_SEGMENTS = ["login", "auth"];

function stripLocale(pathname: string): { locale: string; rest: string } {
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];
  if (LOCALES.includes(maybeLocale as (typeof LOCALES)[number])) {
    return { locale: maybeLocale, rest: "/" + segments.slice(1).join("/") };
  }
  return { locale: routing.defaultLocale, rest: pathname };
}

export async function middleware(request: NextRequest) {
  // 1) Locale negotiation / rewrite via next-intl.
  const response = handleI18n(request);

  // 2) Refresh the Supabase auth session and mirror cookies onto the response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3) Route protection (production only — dev keeps the persona fallback).
  if (process.env.NODE_ENV === "production" && !user) {
    const { locale, rest } = stripLocale(request.nextUrl.pathname);
    const isPublic = PUBLIC_SEGMENTS.some(
      (seg) => rest === `/${seg}` || rest.startsWith(`/${seg}/`)
    );
    if (!isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Match all paths except API routes, Next internals and static files.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
