// components/dogs/DogsGrid.tsx
"use client";

import type { Dog } from "@/types/dogs";
import { DogTile } from "@/components/dogs/DogTile";

export function DogsGrid({
  dogs,
  loading,
  count = 12,
}: {
  dogs: Dog[];
  loading: boolean;
  count?: number;
}) {
  const safeCount = Math.max(0, Math.floor(count));

  /**
   * Layout:
   * - auto-fit packs as many cards as fit and wraps the rest, so it scales
   *   from 1 to many listings without hardcoded breakpoints.
   * - The `minmax(240px, 340px)` cap is the important bit: cards are bounded,
   *   so a single listing can NEVER stretch to full width (which made the
   *   image enormous). `justify-center` keeps a small number of cards balanced
   *   instead of clinging to the left edge.
   */
  const gridClass = [
    "grid gap-4 sm:gap-5 items-stretch justify-center",
    "[grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),340px))]",
  ].join(" ");

  // Don’t allow ridiculous skeleton spam if someone passes count=100
  const skeletonCount = Math.min(safeCount || 12, 20);

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className={[
              "relative w-full overflow-hidden rounded-3xl h-full flex flex-col",
              // cozy surface (not bright white)
              "bg-[linear-gradient(to_bottom,rgba(255,248,238,0.72),rgba(255,255,255,0.45))]",
              "border border-amber-950/12 ring-1 ring-inset ring-white/20",
              "shadow-soft",
              "animate-pulse",
            ].join(" ")}
          >
            {/* subtle “shimmer band” so it reads as a loading card, not a blank slab */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-55 bg-[radial-gradient(800px_240px_at_20%_0%,rgba(255,255,255,0.22),transparent_62%)]"
            />
          </div>
        ))}
      </div>
    );
  }

  // Render up to `count`, but never force placeholders when real dogs exist.
  const visible = dogs.slice(0, safeCount);

  if (visible.length === 0) {
    return (
      <div className="rounded-3xl border border-amber-950/12 ring-1 ring-inset ring-white/20 bg-[rgba(255,250,244,0.88)] p-6 shadow-soft">
        <div className="text-xs font-black uppercase tracking-wider text-amber-900/85">
          Puppies
        </div>
        <div className="mt-2 text-lg font-extrabold text-amber-950">
          No puppies posted yet
        </div>
        <div className="mt-2 text-sm leading-relaxed text-amber-900/85 max-w-[62ch]">
          New litters are posted as they’re ready. If you’re interested, use the contact
          options above to ask what’s coming next.
        </div>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {visible.map((dog) => (
        <DogTile key={dog.id} dog={dog} dense />
      ))}
    </div>
  );
}
