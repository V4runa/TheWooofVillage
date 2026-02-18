"use client";

import * as React from "react";
import { Container } from "@/components/ui/Container";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HomeHeroSlab } from "@/components/landing/HomeHeroSlab";
import { DogsGrid } from "@/components/dogs/DogsGrid";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { useDogs } from "@/hooks/useDogs";
import { useMerchantProfile } from "@/hooks/useMerchantProfile";
import { photoTitleStyle, photoBodyStyle, woofSheenKeyframes } from "@/lib/styles/landing";

function clampHomeGridCount(realCount: number) {
  return Math.min(realCount, 12);
}

export default function Home() {
  const { dogs, loading, error } = useDogs({ statuses: ["available"] });
  const { profile } = useMerchantProfile();

  const liveDogs = dogs ?? [];
  const realCount = liveDogs.length;
  const hasRealDogs = realCount > 0;

  const heroDogs = liveDogs.slice(0, 3);

  const gridCount = hasRealDogs ? clampHomeGridCount(realCount) : 0;
  const gridDogs = liveDogs.slice(0, gridCount);

  return (
    <main className="min-h-screen">
      {/* ✅ CTA now navigates to /dogs (not the on-page section) */}
      <LandingHeader
        pupsAnchorId="pups"
        cta={{ label: "View puppies →", href: "/dogs" }}
      />

      <Container size="xl" className="pb-12 sm:pb-14 lg:pb-16">
        <section className="mt-8 sm:mt-10">
          <HomeHeroSlab dogs={heroDogs} profile={profile ?? null} />
        </section>

        <section id="pups" className="mt-10 sm:mt-12 lg:mt-14">
          <div className="mb-5 sm:mb-7">
            <h2
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={photoTitleStyle}
            >
              Puppies available now
            </h2>

            {/* Accent rule: subtle animated sheen (safe + premium) */}
            <div
              className="mt-2 h-[2px] w-[130px] rounded-full opacity-95 shadow-[0_10px_28px_rgba(12,16,22,0.16)] motion-reduce:animate-none animate-[woofSheen_10s_ease-in-out_infinite]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,206,160,0.78), rgba(216,232,255,0.56), rgba(255,206,160,0.74))",
                backgroundSize: "220% 100%",
              }}
              aria-hidden
            />

            <p
              className="mt-3 max-w-[70ch] text-sm sm:text-base leading-relaxed"
              style={photoBodyStyle}
            >
              Tap a puppy for photos, details, and deposit options.
            </p>
          </div>

          {error ? (
            <div className="rounded-3xl bg-[rgba(255,252,248,0.92)] p-5 border border-amber-950/12 shadow-[0_12px_34px_-22px_rgba(17,24,39,0.28)] ring-1 ring-inset ring-white/20">
              <div className="text-sm font-extrabold text-ink-primary">
                Couldn't load puppies right now.
              </div>
              <div className="mt-1 text-sm text-ink-secondary">Please refresh.</div>
              <div className="mt-2 text-xs text-ink-secondary/90">{error}</div>
            </div>
          ) : (
            <DogsGrid dogs={gridDogs} loading={loading} count={gridCount} />
          )}
        </section>

        <section className="mt-12 sm:mt-14 lg:mt-16">
          <TestimonialsSection />
        </section>
      </Container>

      {/* keyframes kept local to avoid touching global CSS */}
      <style jsx global>{woofSheenKeyframes}</style>
    </main>
  );
}
