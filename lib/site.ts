/**
 * Canonical site URL used for metadata, Open Graph, sitemap, and robots.
 * Priority:
 *   1. NEXT_PUBLIC_SITE_URL (set this in Vercel for the production domain)
 *   2. VERCEL_URL (auto-provided on Vercel deployments/previews)
 *   3. localhost fallback for local dev
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

export const SITE_NAME = "TheWooofVillage";
