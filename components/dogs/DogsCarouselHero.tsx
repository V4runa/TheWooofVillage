// components/landing/DogsCarouselHero.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import type { Dog } from "@/types/dogs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
    if (slides.length <= 1) return;
    const t = window.setInterval(() => setIdx((p) => (p + 1) % slides.length), 5200);
    return () => window.clearInterval(t);
  }, [slides.length]);

  const active = slides[idx];
  const img = active ? bestImageUrl(active) : null;

  return (
    <Card
      variant="surface"
      className={[
        "p-5 sm:p-6",
        "bg-white/35",
        "backdrop-blur-md",
        "shadow-soft",
      ].join(" ")}
    >
      <div className="grid gap-5 lg:grid-cols-12 lg:items-center">
        {/* Text */}
        <div className="lg:col-span-6">
          <div className="text-[11px] font-black uppercase tracking-wider text-ink-muted">
            Puppies available now
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink-primary sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-[60ch] text-sm text-ink-secondary">
            {subtitle}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/dogs">
              <Button variant="primary" size="md">
                Browse puppies →
              </Button>
            </Link>

            {active?.slug || active?.id ? (
              <Link href={active.slug ? `/dogs/${active.slug}` : `/dogs/${active.id}`}>
                <Button variant="secondary" size="md">
                  View {active.name} →
                </Button>
              </Link>
            ) : null}
          </div>

          {/* Dots */}
          {slides.length > 1 && (
            <div className="mt-4 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIdx(i)}
                  className={[
                    "h-2.5 w-2.5 rounded-full",
                    i === idx ? "bg-ink-primary/70" : "bg-ink-primary/20",
                    "transition-opacity",
                  ].join(" ")}
                />
              ))}
            </div>
          )}
        </div>

        {/* Image (kept short + calm) */}
        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-3xl bg-white/45 ring-1 ring-black/10">
            <div className="relative aspect-[16/9]">
              {img ? (
                <img
                  src={img}
                  alt={active?.name ? `${active.name} preview` : "Puppy preview"}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: "50% 35%" }} // keeps faces higher than center
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-sm text-ink-muted">No photo yet</div>
                </div>
              )}
            </div>

            {active && (
              <div className="px-4 py-3">
                <div className="text-sm font-extrabold text-ink-primary">
                  {active.name}
                </div>
                {active.description ? (
                  <div className="mt-1 line-clamp-1 text-xs text-ink-secondary">
                    {active.description}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
