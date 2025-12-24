import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TheWooofVillage - Meet Your Next Best Friend",
  description:
    "A warm, honest place to adopt with clarity and care. Find your perfect pup match through our screening-first, safe rehoming platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={[
          `${geistSans.variable} ${geistMono.variable}`,
          "h-full antialiased",
          // Baseline text tone (prevents harsh icon defaults)
          "text-ink-primary",
          // World base (not off-white)
          "bg-[radial-gradient(1200px_700px_at_20%_0%,#f4eee4,transparent_60%),radial-gradient(900px_600px_at_90%_20%,#efe2d4,transparent_55%),linear-gradient(to_bottom,#f1e9de,#e9dfd2)]",
        ].join(" ")}
      >
        {/* Global atmosphere: subtle texture + vignette */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          {/* micro grain-ish tint (very light) */}
          <div className="absolute inset-0 opacity-[0.22] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] bg-size:18px_18px" />
          {/* vignette to calm edges */}
          <div className="absolute inset-0 bg-[radial-gradient(1400px_800px_at_50%_30%,transparent_55%,rgba(0,0,0,0.08)_100%)]" />
        </div>

        {children}
      </body>
    </html>
  );
}
