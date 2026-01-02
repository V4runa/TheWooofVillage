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
   * - Keep explicit cols for predictable breakpoints
   * - Use auto-fit on 2xl+ so 12+ never looks “stuck” or sparse on ultrawide
   */
  const gridClass =
    [
      "grid gap-4",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      // 2xl+: auto-fit gives us a “more than 4” layout naturally without hardcoding 5/6/7
      "2xl:[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]",
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
              "relative h-[260px] overflow-hidden rounded-3xl",
              // cozy surface (not bright white)
              "bg-[linear-gradient(to_bottom,rgba(255,240,225,0.56),rgba(255,255,255,0.30))]",
              "border border-amber-950/14 ring-1 ring-inset ring-white/12",
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
      <div className="rounded-3xl border border-amber-950/14 ring-1 ring-inset ring-white/12 bg-[rgba(255,240,225,0.55)] p-6 shadow-soft">
        <div className="text-[11px] font-black uppercase tracking-wider text-amber-900/70">
          Puppies
        </div>
        <div className="mt-2 text-lg font-extrabold text-amber-950">
          No puppies posted yet
        </div>
        <div className="mt-2 text-sm leading-relaxed text-amber-900/75 max-w-[62ch]">
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
