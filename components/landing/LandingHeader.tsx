"use client";

import * as React from "react";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { useMerchantProfile } from "@/hooks/useMerchantProfile";

type LandingHeaderProps = {
  pupsAnchorId?: string;

  /**
   * Controls the right-side CTA in the sticky header.
   * - default: shows “View puppies →” linking to #pups
   * - null: hides the CTA entirely
   */
  cta?: { label: string; href: string } | null;
};

export function LandingHeader({ pupsAnchorId = "pups", cta }: LandingHeaderProps) {
  const { profile, loading } = useMerchantProfile();

  const displayName = profile?.display_name?.trim() || "The Wooof Village";
  const tagline = profile?.tagline?.trim() || "Get your puppy today!";

  const defaultCta = { label: "View puppies →", href: `#${pupsAnchorId}` };
  const resolvedCta = cta === undefined ? defaultCta : cta; // allow null to hide

  // Temporary: semantic-safe “Link styled like a button” until Button supports asChild
  const linkButtonBase =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold " +
    "select-none whitespace-nowrap " +
    "transition-[transform,box-shadow,background-color,border-color,opacity,filter] duration-200 ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/55 " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(255,252,248,0.24)] " +
    "hover:-translate-y-[1px] active:translate-y-[1px]";

  const linkBtnSm = "h-10 px-4 text-sm";

  const linkBtnControl =
    "text-amber-950 " +
    "bg-[rgba(255,240,225,0.78)] border border-amber-950/20 ring-1 ring-inset ring-white/12 " +
    "shadow-[0_14px_34px_-22px_rgba(17,24,39,0.46)] " +
    "hover:bg-[rgba(255,240,225,0.88)] hover:border-amber-950/28 hover:shadow-[0_20px_48px_-26px_rgba(17,24,39,0.52)]";

  return (
    <header className="w-full">
      <div className="sticky top-0 z-50">
        {/* Cozy sticky bar: warm, readable, consistent with indoor theme */}
        <div className="relative overflow-hidden border-b border-amber-950/14 bg-[rgba(255,248,240,0.86)] shadow-[0_14px_34px_-26px_rgba(17,24,39,0.28)]">
          {/* subtle brand accent */}
          <div
            aria-hidden
            className="h-1 w-full bg-[linear-gradient(90deg,rgba(63,161,126,0.70)_0%,rgba(96,140,255,0.58)_55%,rgba(255,176,122,0.82)_118%)]"
          />

          <Container size="xl" className="py-3">
            <div className="flex items-center justify-between gap-4">
              {/* ✅ Clickable “brand” (logo + name + tagline) */}
              <Link
                href="/"
                aria-label="Go to home"
                className={[
                  "group flex min-w-0 items-center gap-3 rounded-2xl",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/55",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(255,252,248,0.24)]",
                  // subtle affordance without looking like a button
                  "hover:opacity-[0.98]",
                ].join(" ")}
              >
                {/* Logo plate */}
                <div className="relative grid h-10 w-10 place-items-center rounded-2xl border border-amber-950/18 bg-[rgba(255,240,225,0.72)] ring-1 ring-inset ring-white/12 shadow-soft transition-transform duration-200 ease-out group-hover:-translate-y-[1px]">
                  <span className="text-xl" aria-hidden>
                    🐶
                  </span>

                  {/* micro sparkle */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-1 top-1 h-2 w-2 rounded-full opacity-70 bg-[radial-gradient(circle,rgba(255,255,255,0.75),rgba(96,140,255,0.35),rgba(255,176,122,0.35),transparent_72%)]"
                  />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-base sm:text-lg font-extrabold text-amber-950">
                    {loading ? "Loading…" : displayName}
                  </div>
                  <div className="truncate text-xs sm:text-sm font-semibold text-amber-900/70">
                    {tagline}
                  </div>
                </div>
              </Link>

              {/* Social proof badges */}
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="neutral">🏡 Home pickup</Badge>
                <Badge variant="neutral">⚡ Fast replies</Badge>
                <Badge variant="neutral">🫶 Small batches</Badge>
              </div>

              {/* Optional CTA */}
              {resolvedCta ? (
                <div className="shrink-0">
                  <Link
                    href={resolvedCta.href}
                    className={[linkButtonBase, linkBtnSm, linkBtnControl].join(" ")}
                  >
                    {resolvedCta.label}
                  </Link>
                </div>
              ) : null}
            </div>
          </Container>
        </div>
      </div>
    </header>
  );
}
