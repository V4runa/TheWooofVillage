"use client";

import * as React from "react";
import type { Dog } from "@/types/dogs";

import { Container } from "@/components/ui/Container";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { DogTile } from "@/components/dogs/DogTile";

import { useDogs } from "@/hooks/useDogs";
import { getMockDogs } from "@/components/dogs/MockDogs";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* -----------------------------
   Picsum fallback (stable seeds)
------------------------------ */
function picsum(seed: string, w: number, h: number) {
  const s = encodeURIComponent(seed || "puppy");
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
}

function ensureImages(dogs: Dog[], seedPrefix: string) {
  return dogs.map((d, idx) => {
    const has = Boolean(d.cover_image_url || d.images?.[0]?.url);
    if (has) return d;

    const seedBase = `${seedPrefix}-${d.slug || d.id || d.name || "pup"}-${idx}`;

    return {
      ...d,
      cover_image_url: picsum(`${seedBase}-cover`, 1400, 900),
      images:
        d.images && d.images.length > 0
          ? d.images
          : ([
              {
                id: `ph-${seedBase}-1`,
                dog_id: String(d.id),
                url: picsum(`${seedBase}-img-1`, 1200, 900),
                alt: d.name || "Puppy photo",
                sort_order: 0,
                created_at: new Date().toISOString(),
              },
            ] as any),
    } as Dog;
  });
}

/* -----------------------------
   Header typography conventions
   (match /app/page + testimonials)
------------------------------ */
const photoTitleStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(90deg, rgba(255,236,210,0.98) 0%, rgba(248,252,255,0.96) 46%, rgba(255,226,198,0.98) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  textShadow:
    "0 24px 64px rgba(12,16,22,0.26), " +
    "0 7px 20px rgba(12,16,22,0.16), " +
    "0 1px 2px rgba(12,16,22,0.18), " +
    "0 -1px 0 rgba(255,235,210,0.18)",
};

const photoBodyStyle: React.CSSProperties = {
  color: "rgba(255, 236, 210, 0.86)",
  textShadow:
    "0 22px 58px rgba(12,16,22,0.24), " +
    "0 6px 18px rgba(12,16,22,0.14), " +
    "0 1px 2px rgba(12,16,22,0.16)",
};

/* -----------------------------
   Showroom grid (stable columns)
   - NO auto-fit (prevents uneven rows)
------------------------------ */
function ShowroomGrid({
  dogs,
  loading,
  count,
}: {
  dogs: Dog[];
  loading: boolean;
  count: number;
}) {
  const safeCount = Math.max(0, Math.floor(count));
  const visible = dogs.slice(0, safeCount);

  const gridClass = [
    "grid",
    "gap-3 sm:gap-4 lg:gap-5",
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    "2xl:grid-cols-4",
  ].join(" ");

  const skeletonCount = Math.min(safeCount || 12, 20);

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className={[
              "relative h-[252px] overflow-hidden rounded-3xl",
              "bg-[linear-gradient(to_bottom,rgba(255,240,225,0.56),rgba(255,255,255,0.30))]",
              "border border-amber-950/14 ring-1 ring-inset ring-white/12",
              "shadow-soft",
              "animate-pulse",
            ].join(" ")}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-55 bg-[radial-gradient(800px_240px_at_20%_0%,rgba(255,255,255,0.22),transparent_62%)]"
            />
          </div>
        ))}
      </div>
    );
  }

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
          options on the home page to ask what’s coming next.
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

export default function DogsPage() {
  const { dogs, loading, error } = useDogs({ statuses: ["available"] });

  const realCount = dogs?.length ?? 0;
  const hasRealDogs = realCount > 0;

  // litters: usually <= 12, sometimes up to 20
  const count = hasRealDogs ? clamp(realCount, 1, 20) : 12;

  const baseDogs = hasRealDogs ? dogs.slice(0, count) : getMockDogs(12);

  const showroomDogs = React.useMemo(() => {
    const seedPrefix = hasRealDogs ? "real" : "mock";
    return ensureImages(baseDogs, seedPrefix);
  }, [baseDogs, hasRealDogs]);

  return (
    <main className="min-h-screen">
      {/* ✅ Continuity: use your existing CTA system properly */}
      <LandingHeader pupsAnchorId="pups" cta={null} />

      <Container size="xl" className="pb-12 sm:pb-14 lg:pb-16">
        <section id="pups" className="mt-10 sm:mt-12 lg:mt-14">
          {/* ✅ Refined header layout: clearer rhythm + less “blocky” */}
          <div className="mb-6 sm:mb-8">
            <div className="max-w-[82ch]">
              <div className="flex flex-col gap-2 sm:gap-3">
                <h1
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                  style={photoTitleStyle}
                >
                  Puppies available now
                </h1>

                {/* Divider / accent rule (same language as home) */}
                <div
                  className="h-[2px] w-[132px] rounded-full opacity-95 shadow-[0_10px_28px_rgba(12,16,22,0.16)] motion-reduce:animate-none animate-[woofSheen_10s_ease-in-out_infinite]"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,206,160,0.78), rgba(216,232,255,0.56), rgba(255,206,160,0.74))",
                    backgroundSize: "220% 100%",
                  }}
                  aria-hidden
                />

                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-4">
                  <p
                    className="text-sm sm:text-base leading-relaxed"
                    style={photoBodyStyle}
                  >
                    Tap a puppy for photos, details, and deposit options.
                    {!hasRealDogs &&
                      " (Showing preview pups until listings are added.)"}
                  </p>

                </div>

                {error ? (
                  <p
                    className="text-xs leading-relaxed"
                    style={{ ...photoBodyStyle, opacity: 0.82 }}
                  >
                    Couldn’t load live listings — showing preview placeholders. ({error})
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* ✅ “Fade container” now truly encapsulates the whole showroom */}
          <div className="relative">
            {/* ambient glow layer */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-[44px] opacity-[0.95]"
              style={{
                background:
                  "radial-gradient(1100px 520px at 18% 0%, rgba(255,255,255,0.20), transparent 62%)," +
                  "radial-gradient(980px 520px at 92% 10%, rgba(216,232,255,0.16), transparent 66%)," +
                  "radial-gradient(1200px 640px at 50% 100%, rgba(255,206,160,0.12), transparent 72%)",
              }}
            />

            {/* showroom shell (this is the “little container” expanded) */}
            <div
              className={[
                "relative rounded-[44px]",
                "bg-[rgba(255,248,242,0.62)]",
                "border border-amber-950/14",
                "ring-1 ring-inset ring-white/12",
                "shadow-[0_18px_52px_-36px_rgba(17,24,39,0.55)]",
                "p-3 sm:p-4 lg:p-5",
              ].join(" ")}
            >
              {/* soft inner sheen (adds life without noise) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[44px]"
                style={{
                  background:
                    "radial-gradient(900px 260px at 20% 0%, rgba(255,255,255,0.18), transparent 62%)",
                }}
              />

              <ShowroomGrid dogs={showroomDogs} loading={loading} count={count} />
            </div>
          </div>
        </section>
      </Container>

      <style jsx global>{`
        @keyframes woofSheen {
          0% {
            background-position: 0% 50%;
            filter: saturate(1) brightness(1);
          }
          50% {
            background-position: 100% 50%;
            filter: saturate(1.05) brightness(1.03);
          }
          100% {
            background-position: 0% 50%;
            filter: saturate(1) brightness(1);
          }
        }
      `}</style>
    </main>
  );
}
