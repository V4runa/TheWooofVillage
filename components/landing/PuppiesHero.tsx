"use client";

import Link from "next/link";
import type { Dog } from "@/types/dogs";
import { Card } from "@/components/ui/Card";
import { DogTile } from "@/components/dogs/DogTile";

export function PuppiesHero({
  dogs,
  title = "Meet your next best friend",
  subtitle = "Browse available pups. Tap a listing for photos, details, and how to reserve.",
}: {
  dogs: Dog[];
  title?: string;
  subtitle?: string;
}) {
  const featured = dogs.slice(0, 4);

  // Temporary: semantic-safe “Link styled like a button” until Button supports asChild
  const linkButtonBase =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold " +
    "select-none whitespace-nowrap " +
    "transition-[transform,box-shadow,background-color,border-color,opacity,filter] duration-200 ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/55 " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(255,252,248,0.24)] " +
    "hover:-translate-y-[1px] active:translate-y-[1px]";

  const linkBtnMd = "h-12 px-6 text-base";

  const linkBtnPrimary =
    "text-white " +
    "bg-[linear-gradient(90deg,rgba(63,161,126,1)_0%,rgba(96,140,255,0.86)_60%,rgba(255,176,122,0.92)_118%)] " +
    "shadow-[0_18px_44px_-20px_rgba(17,24,39,0.70)] ring-1 ring-white/18 " +
    "hover:shadow-[0_26px_68px_-26px_rgba(17,24,39,0.78)] hover:saturate-[1.05] hover:brightness-[1.02]";

  const linkBtnSecondary =
    "text-amber-950 " +
    "bg-[rgba(255,240,225,0.62)] border border-amber-950/20 ring-1 ring-inset ring-white/12 " +
    "shadow-[0_14px_34px_-18px_rgba(17,24,39,0.44)] " +
    "hover:bg-[rgba(255,240,225,0.72)] hover:border-amber-950/26 hover:shadow-[0_20px_48px_-22px_rgba(17,24,39,0.50)]";

  return (
    <Card variant="surface" className="overflow-hidden">
      {/* Accent bar */}
      <div
        aria-hidden
        className="h-1.5 w-full bg-[linear-gradient(90deg,rgba(63,161,126,0.75)_0%,rgba(96,140,255,0.65)_55%,rgba(255,176,122,0.85)_118%)]"
      />

      <div className="p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          {/* Copy */}
          <div className="lg:col-span-4">
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-900/70">
              Puppies available now
            </div>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl bg-clip-text text-transparent bg-[linear-gradient(90deg,rgba(120,72,38,1),rgba(96,140,255,0.85))]">
              {title}
            </h2>

            <p className="mt-2 max-w-[60ch] text-sm text-amber-900/75">
              {subtitle}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/dogs"
                className={[linkButtonBase, linkBtnMd, linkBtnPrimary].join(" ")}
              >
                Browse puppies →
              </Link>
              <Link
                href="#pups"
                className={[linkButtonBase, linkBtnMd, linkBtnSecondary].join(" ")}
              >
                Jump to grid ↓
              </Link>
            </div>
          </div>

          {/* Featured dogs */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featured.map((d) => (
                <DogTile key={d.id} dog={d} dense />
              ))}
            </div>

            {featured.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-amber-950/14 ring-1 ring-inset ring-white/12 bg-[rgba(255,240,225,0.55)] p-5 shadow-soft">
                <div className="text-sm font-extrabold text-amber-950">
                  No puppies posted yet
                </div>
                <div className="mt-1 text-sm text-amber-900/75">
                  Check back soon, or contact us to ask what’s coming next.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
