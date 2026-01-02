"use client";

import * as React from "react";
import { Container } from "@/components/ui/Container";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HomeHeroSlab } from "@/components/landing/HomeHeroSlab";
import { DogsGrid } from "@/components/dogs/DogsGrid";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";

import { useDogs } from "@/hooks/useDogs";
import { useMerchantProfile } from "@/hooks/useMerchantProfile";
import { getMockDogs, getMockFeaturedDogs } from "@/components/dogs/MockDogs";

function clampHomeGridCount(realCount: number) {
  return Math.min(realCount, 12);
}

/**
 * “On-photo” typography tuned for:
 * - Warm indoor theme (no harsh white)
 * - Strong separation on busy backgrounds
 * - A subtle memorable “signature” via gradient ink + accent rule
 * - One notch further: a gentle animated sheen on the rule
 */
const photoTitleStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(90deg, rgba(255,236,210,0.98) 0%, rgba(248,252,255,0.96) 46%, rgba(255,226,198,0.98) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",

  // Readability: layered ink haze + micro edge + tiny “lift”
  textShadow:
    "0 24px 64px rgba(12,16,22,0.26), " + // big haze
    "0 7px 20px rgba(12,16,22,0.16), " + // medium anchor
    "0 1px 2px rgba(12,16,22,0.18), " + // micro edge
    "0 -1px 0 rgba(255,235,210,0.18)", // warm lift
};

const photoBodyStyle: React.CSSProperties = {
  color: "rgba(255, 236, 210, 0.86)",
  textShadow:
    "0 22px 58px rgba(12,16,22,0.24), " +
    "0 6px 18px rgba(12,16,22,0.14), " +
    "0 1px 2px rgba(12,16,22,0.16)",
};

export default function Home() {
  const { dogs, loading, error } = useDogs({ statuses: ["available"] });
  const { profile } = useMerchantProfile();

  const realCount = dogs?.length ?? 0;
  const hasRealDogs = realCount > 0;

  const heroDogs = hasRealDogs ? dogs.slice(0, 3) : getMockFeaturedDogs(3);

  const gridCount = hasRealDogs ? clampHomeGridCount(realCount) : 12;
  const gridDogs = hasRealDogs ? dogs.slice(0, gridCount) : getMockDogs(12);

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
              {!hasRealDogs && " (Showing preview pups until listings are added.)"}
            </p>
          </div>

          {error ? (
            <div className="rounded-3xl bg-[rgba(255,248,242,0.78)] p-5 border border-amber-950/14 shadow-[0_12px_34px_-22px_rgba(17,24,39,0.34)] ring-1 ring-inset ring-white/12">
              <div className="text-sm font-extrabold text-ink-primary">
                Couldn’t load puppies right now.
              </div>
              <div className="mt-1 text-sm text-ink-secondary">Please refresh.</div>
              <div className="mt-2 text-xs text-ink-secondary/80">{error}</div>
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
