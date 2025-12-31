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

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: safeCount }).map((_, i) => (
          <div
            key={i}
            className="h-[240px] animate-pulse rounded-3xl bg-white/35 border border-black/6"
          />
        ))}
      </div>
    );
  }

  // Render up to `count`, but never force placeholders when real dogs exist.
  const visible = dogs.slice(0, safeCount);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visible.map((dog) => (
        <DogTile key={dog.id} dog={dog} dense />
      ))}
    </div>
  );
}
