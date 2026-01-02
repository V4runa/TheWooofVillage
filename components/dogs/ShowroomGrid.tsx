"use client";

import * as React from "react";
import Link from "next/link";
import type { Dog } from "@/types/dogs";

function picsum(seed: string, w: number, h: number) {
  const s = encodeURIComponent(seed);
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
}

function bestImage(dog: Dog) {
  return dog.cover_image_url || dog.images?.[0]?.url || null;
}

function statusLabel(status: string) {
  if (status === "available") return "Available";
  if (status === "reserved") return "Reserved";
  if (status === "sold") return "Adopted";
  return status;
}

/**
 * Masonry using CSS columns:
 * - looks like a photo wall (not an interface)
 * - stable, minimal chrome
 * - perfect for 12–20 items
 */
export function ShowroomGrid({
  dogs,
  loading,
  count,
}: {
  dogs: Dog[];
  loading: boolean;
  count?: number;
}) {
  const safeCount = typeof count === "number" ? Math.max(0, Math.floor(count)) : dogs.length;
  const visible = dogs.slice(0, safeCount);

  // Skeletons should still feel like “photo slots”, not cards
  if (loading) {
    const skeletonCount = Math.min(Math.max(safeCount || 12, 6), 20);

    return (
      <div
        className={[
          "columns-1 sm:columns-2 lg:columns-3 2xl:columns-4",
          "gap-4 sm:gap-5 [column-fill:_balance]",
        ].join(" ")}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => {
          const h = [220, 260, 300, 340, 240, 320][i % 6];
          return (
            <div
              key={i}
              className="mb-4 sm:mb-5 break-inside-avoid"
              style={{ height: h }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[28px]">
                <div className="absolute inset-0 bg-black/10 animate-pulse" />
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-60 bg-[radial-gradient(700px_280px_at_30%_10%,rgba(255,255,255,0.25),transparent_60%)]"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (visible.length === 0) {
    // Minimal empty state (not boxy)
    return (
      <div className="py-14 text-center">
        <div className="text-sm font-extrabold text-[rgba(255,236,210,0.90)] drop-shadow-[0_18px_54px_rgba(12,16,22,0.40)]">
          No puppies posted yet
        </div>
        <div className="mt-2 text-sm text-[rgba(255,236,210,0.78)] drop-shadow-[0_18px_54px_rgba(12,16,22,0.36)]">
          Check back soon.
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "columns-1 sm:columns-2 lg:columns-3 2xl:columns-4",
        "gap-4 sm:gap-5 [column-fill:_balance]",
      ].join(" ")}
    >
      {visible.map((dog, i) => {
        const href = dog.slug ? `/dogs/${dog.slug}` : `/dogs/${dog.id}`;
        const img = bestImage(dog) || picsum(dog.name || `dog-${i}`, 1200, 900);

        // A few aspect ratios so the masonry feels natural (but still cohesive)
        const ratio = ["aspect-[4/3]", "aspect-[3/4]", "aspect-[16/10]", "aspect-[5/6]"][i % 4];

        const isAvailable = dog.status === "available";

        return (
          <Link
            key={dog.id}
            href={href}
            className="mb-4 sm:mb-5 block break-inside-avoid"
            aria-label={`View ${dog.name}`}
          >
            <figure
              className={[
                "group relative overflow-hidden rounded-[28px]",
                "ring-1 ring-inset ring-white/10",
                // no “card” border; keep it photo-first
                "shadow-[0_24px_72px_-44px_rgba(17,24,39,0.55)]",
                "transition-transform duration-300 ease-out hover:-translate-y-[2px]",
              ].join(" ")}
            >
              <div className={["relative w-full", ratio].join(" ")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={dog.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />

                {/* Cozy grade: makes photos feel unified + readable caption without UI blocks */}
                <div
                  aria-hidden
                  className={[
                    "pointer-events-none absolute inset-0",
                    "bg-[radial-gradient(120%_90%_at_50%_10%,rgba(255,232,210,0.18),transparent_55%),linear-gradient(to_top,rgba(0,0,0,0.36),transparent_62%)]",
                  ].join(" ")}
                />

                {/* Caption overlay: soft, not interface-y */}
                <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <div className="max-w-[40ch]">
                    <div
                      className={[
                        "text-[15px] sm:text-base font-extrabold tracking-tight",
                        "text-[rgba(255,248,242,0.98)]",
                        "drop-shadow-[0_18px_54px_rgba(12,16,22,0.42)]",
                      ].join(" ")}
                    >
                      {dog.name}
                    </div>

                    <div
                      className={[
                        "mt-1 text-xs sm:text-[13px] font-semibold",
                        "text-[rgba(255,236,210,0.82)]",
                        "drop-shadow-[0_18px_54px_rgba(12,16,22,0.38)]",
                      ].join(" ")}
                    >
                      {[
                        dog.breed || null,
                        typeof dog.age_weeks === "number" ? `${dog.age_weeks} weeks` : null,
                        dog.sex || null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>

                  {/* tiny status dot — reads like “gallery label”, not UI */}
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      aria-hidden
                      className={[
                        "h-2.5 w-2.5 rounded-full",
                        isAvailable
                          ? "bg-[radial-gradient(circle,rgba(102,226,176,0.95),rgba(63,161,126,0.70),transparent_70%)]"
                          : "bg-[radial-gradient(circle,rgba(255,208,160,0.92),rgba(255,176,122,0.60),transparent_72%)]",
                        "shadow-[0_10px_24px_-14px_rgba(17,24,39,0.55)]",
                      ].join(" ")}
                    />
                    <span className="text-[11px] font-extrabold tracking-wide text-[rgba(255,236,210,0.74)]">
                      {statusLabel(dog.status)}
                    </span>
                  </div>
                </figcaption>
              </div>
            </figure>
          </Link>
        );
      })}
    </div>
  );
}
