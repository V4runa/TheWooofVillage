import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "TheWooofVillage - Meet Your Next Best Friend",
  description:
    "A warm, honest place to adopt with clarity and care. Find your perfect pup match through our screening-first, safe rehoming platform.",
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
