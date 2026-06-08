import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const siteUrl = getSiteUrl();
const siteDescription =
  "A warm, honest place to adopt with clarity and care. Find your perfect pup match through our screening-first, safe rehoming platform.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TheWooofVillage - Meet Your Next Best Friend",
    template: "%s · TheWooofVillage",
  },
  description: siteDescription,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "TheWooofVillage - Meet Your Next Best Friend",
    description: siteDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "TheWooofVillage - Meet Your Next Best Friend",
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} h-full`}>
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  );
}
