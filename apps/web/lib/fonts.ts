import { Cairo, Inter } from "next/font/google";

/**
 * Cairo for Arabic (primary), Inter for Latin.
 * `fallback` stacks are baked into the generated @font-face, and since
 * Next.js 13.4+ a failed Google Fonts download logs a warning and uses the
 * fallback fonts instead of failing the build.
 */
export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["Segoe UI", "Arial", "sans-serif"],
});
