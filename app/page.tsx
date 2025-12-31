"use client";

import { Container } from "@/components/ui/Container";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { PuppiesHero } from "@/components/landing/PuppiesHero";
import { DogsCarouselHero } from "@/components/dogs/DogsCarouselHero";
import { DogsGrid } from "@/components/dogs/DogsGrid";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";

import { useDogs } from "@/hooks/useDogs";
import { getMockFeaturedDogs } from "@/components/dogs/MockDogs";

type HeroMode = "cards" | "carousel";

export default function Home() {
  const { dogs, loading, error } = useDogs({ statuses: ["available"] });

  const HERO_MODE: HeroMode = "cards";

  const hasRealDogs = (dogs?.length ?? 0) > 0;

  const heroDogs = hasRealDogs ? dogs.slice(0, 3) : getMockFeaturedDogs(3);
  const gridDogs = hasRealDogs ? dogs : getMockFeaturedDogs(6);

  return (
    <main className="min-h-screen">
      {/* ✅ Header first (sticky nav + reserve panel) */}
      <LandingHeader pupsAnchorId="pups" />

      <Container size="xl" className="pb-10 sm:pb-12 lg:pb-14">
        {/* ✅ Featured pups AFTER header */}
        <section className="mt-8 sm:mt-10 animate-fade-in">
          {HERO_MODE === "cards" ? (
            <PuppiesHero dogs={heroDogs} />
          ) : (
            <DogsCarouselHero dogs={gridDogs} />
          )}
        </section>

        {/* Puppies grid */}
        <section id="pups" className="mt-10 sm:mt-12 lg:mt-14">
          <div className="mb-5 sm:mb-7">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
              Puppies available now
            </h1>
            <p className="mt-2 max-w-[70ch] text-sm sm:text-base leading-relaxed text-ink-secondary">
              Tap a puppy for photos, details, and deposit options.
              {!hasRealDogs && " (Showing preview pups until listings are added.)"}
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl bg-surface-light p-4 sm:p-5 border border-line/10 shadow-soft">
              <div className="text-sm font-semibold text-ink-primary">
                Couldn’t load puppies right now.
              </div>
              <div className="mt-1 text-sm text-ink-secondary">Please refresh.</div>
              <div className="mt-2 text-xs opacity-70">{error}</div>
            </div>
          ) : (
            <DogsGrid dogs={gridDogs} loading={loading} count={6} />
          )}
        </section>

        {/* Testimonials */}
        <section className="mt-12 sm:mt-14 lg:mt-16">
          <TestimonialsSection />
        </section>

        <div className="mt-8 sm:mt-10 lg:mt-12" />
      </Container>
    </main>
  );
}
