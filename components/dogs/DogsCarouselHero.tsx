// components/landing/DogsCarouselHero.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import type { Dog } from "@/types/dogs";
import { Card } from "@/components/ui/Card";

function bestImageUrl(dog: Dog) {
  return dog.cover_image_url || dog.images?.[0]?.url || null;
}

export function DogsCarouselHero({
  dogs,
  title = "Meet your next best friend",
  subtitle = "Browse available pups. Tap a listing for photos, details, and how to reserve.",
}: {
  dogs: Dog[];
  title?: string;
  subtitle?: string;
}) {
  const slides = dogs.slice(0, 5);
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    // clamp idx when slides change
    setIdx((p) => (slides.length ? Math.min(p, slides.length - 1) : 0));
  }, [slides.length]);

  React.useEffect(() => {
    if (slides.length <= 1) return;
    const t = window.setInterval(
      () => setIdx((p) => (p + 1) % slides.length),
      5200
    );
    return () => window.clearInterval(t);
  }, [slides.length]);

  const active = slides[idx];
  const img = active ? bestImageUrl(active) : null;

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
        <div className="grid gap-5 lg:grid-cols-12 lg:items-center">
          {/* Text */}
          <div className="lg:col-span-6">
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

              {active?.slug || active?.id ? (
                <Link
                  href={active.slug ? `/dogs/${active.slug}` : `/dogs/${active.id}`}
                  className={[linkButtonBase, linkBtnMd, linkBtnSecondary].join(" ")}
                >
                  View {active.name} →
                </Link>
              ) : null}
            </div>

            {/* Dots */}
            {slides.length > 1 ? (
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-950/16 ring-1 ring-inset ring-white/14 bg-[rgba(255,240,225,0.55)] px-2 py-1 shadow-soft">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setIdx(i)}
                    className={[
                      "relative h-2.5 w-2.5 rounded-full",
                      "transition-[transform,opacity,box-shadow] duration-200",
                      i === idx
                        ? "bg-[linear-gradient(180deg,rgba(96,140,255,0.95),rgba(255,176,122,0.85))] shadow-[0_0_0_3px_rgba(96,140,255,0.14)]"
                        : "bg-amber-950/18 hover:bg-amber-950/26",
                      i === idx ? "scale-[1.08]" : "scale-100",
                    ].join(" ")}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* Image */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-3xl bg-[rgba(255,240,225,0.55)] border border-amber-950/16 ring-1 ring-inset ring-white/12 shadow-soft">
              <div className="relative aspect-[16/9]">
                {img ? (
                  <>
                    <img
                      src={img}
                      alt={active?.name ? `${active.name} preview` : "Puppy preview"}
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ objectPosition: "50% 35%" }}
                    />
                    {/* Cozy overlay (keeps photo readable in indoor theme) */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_90%_at_50%_12%,rgba(255,232,210,0.22),transparent_55%),linear-gradient(to_top,rgba(0,0,0,0.30),transparent_62%)]"
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-sm font-semibold text-amber-950/70">
                      No photo yet
                    </div>
                  </div>
                )}
              </div>

              {active ? (
                <div className="px-4 py-3 bg-[linear-gradient(to_bottom,rgba(255,240,225,0.72),rgba(255,255,255,0.46))]">
                  <div className="text-sm font-extrabold text-amber-950">
                    {active.name}
                  </div>
                  {active.description ? (
                    <div className="mt-1 line-clamp-1 text-xs text-amber-900/75">
                      {active.description}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="px-4 py-3">
                  <div className="text-sm font-extrabold text-amber-950">
                    No puppies posted yet
                  </div>
                  <div className="mt-1 text-xs text-amber-900/75">
                    Check back soon, or use the contact options to ask what’s coming next.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
