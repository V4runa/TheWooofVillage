import type { NextConfig } from "next";

/**
 * Derive the Supabase hostname from the public env var so next/image is allowed
 * to optimize images served from Supabase Storage. Falls back to a wildcard
 * across Supabase projects if the URL can't be parsed at config time.
 */
function supabaseHostname(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    try {
      return new URL(url).hostname;
    } catch {
      /* ignore */
    }
  }
  return "*.supabase.co";
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname(),
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
