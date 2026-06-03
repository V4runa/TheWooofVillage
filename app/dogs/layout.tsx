import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Puppies available now",
  description:
    "Browse puppies available now. Tap any pup for photos, details, and deposit options.",
  alternates: { canonical: "/dogs" },
  openGraph: {
    title: "Puppies available now · TheWooofVillage",
    description:
      "Browse puppies available now. Tap any pup for photos, details, and deposit options.",
    url: "/dogs",
    type: "website",
  },
};

export default function DogsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
