// components/dogs/DogsGrid.tsx
"use client";

import type { Dog } from "@/types/dogs";
import { DogTile } from "@/components/dogs/DogTile";

export function DogsGrid({
  dogs,
  loading,
  count,
}: {
  dogs: Dog[];
  loading: boolean;
  count: 3 | 6;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-[260px] animate-pulse rounded-3xl bg-white/40 ring-1 ring-black/8"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {dogs.slice(0, count).map((dog) => (
        <DogTile key={dog.id} dog={dog} dense />
      ))}
    </div>
  );
}
