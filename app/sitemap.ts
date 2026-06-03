import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// Revalidate the sitemap hourly so newly listed puppies show up without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/dogs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  // Best-effort dynamic routes. Never let a DB hiccup break the sitemap.
  try {
    const { data } = await getSupabaseAdmin()
      .from("dogs")
      .select("slug,updated_at,status")
      .in("status", ["available", "reserved"])
      .not("slug", "is", null);

    const dogRoutes: MetadataRoute.Sitemap = (data ?? [])
      .filter((d): d is { slug: string; updated_at: string | null; status: string } =>
        Boolean(d?.slug)
      )
      .map((d) => ({
        url: `${siteUrl}/dogs/${d.slug}`,
        lastModified: d.updated_at ? new Date(d.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [...staticRoutes, ...dogRoutes];
  } catch {
    return staticRoutes;
  }
}
