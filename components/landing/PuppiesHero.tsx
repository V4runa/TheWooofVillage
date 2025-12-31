"use client";

import Link from "next/link";
import type { Dog } from "@/types/dogs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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

  return (
    <Card
      variant="surface"
      className={[
        "p-5 sm:p-6",
        "bg-white/40",
        "backdrop-blur-md",
        "shadow-soft",
      ].join(" ")}
    >
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        {/* Copy */}
        <div className="lg:col-span-4">
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
            <Link href="#pups">
              <Button variant="secondary" size="md">
                Jump to grid ↓
              </Button>
            </Link>
          </div>
        </div>

        {/* Featured dogs */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((d) => (
              <DogTile key={d.id} dog={d} dense />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
