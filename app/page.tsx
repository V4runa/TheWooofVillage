"use client";

import { Container } from "@/components/ui/Container";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HomeHeroSlab } from "@/components/landing/HomeHeroSlab";
import { DogsGrid } from "@/components/dogs/DogsGrid";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";

import { useDogs } from "@/hooks/useDogs";
import { useMerchantProfile } from "@/hooks/useMerchantProfile";
import { getMockDogs, getMockFeaturedDogs } from "@/components/dogs/MockDogs";

function pickGridCount(realCount: number) {
  if (realCount >= 12) return 12;
  if (realCount >= 8) return 8;
  if (realCount >= 6) return 6;
  return realCount; // 1–5
}

export default function Home() {
  const { dogs, loading, error } = useDogs({ statuses: ["available"] });
  const { profile } = useMerchantProfile();

  const realCount = dogs?.length ?? 0;
  const hasRealDogs = realCount > 0;

  const heroDogs = hasRealDogs ? dogs.slice(0, 3) : getMockFeaturedDogs(3);

  // If no real dogs → show 12 mocks.
  // If some real dogs → show a sensible count based on how many exist.
  const gridCount = hasRealDogs ? pickGridCount(realCount) : 12;

  const gridDogs = hasRealDogs ? dogs : getMockDogs(12);

  return (
    <main className="min-h-screen">
      <LandingHeader pupsAnchorId="pups" />

      <Container size="xl" className="pb-12 sm:pb-14 lg:pb-16">
        <section className="mt-8 sm:mt-10">
          <HomeHeroSlab dogs={heroDogs} profile={profile ?? null} />
        </section>

        <section id="pups" className="mt-10 sm:mt-12 lg:mt-14">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
              Puppies available now
            </h2>
            <p className="mt-2 max-w-[70ch] text-sm sm:text-base leading-relaxed text-ink-secondary">
              Tap a puppy for photos, details, and deposit options.
              {!hasRealDogs && " (Showing preview pups until listings are added.)"}
            </p>
          </div>

          {error ? (
            <div className="rounded-3xl bg-white/45 backdrop-blur-md p-5 border border-black/6 shadow-soft">
              <div className="text-sm font-semibold text-ink-primary">
                Couldn’t load puppies right now.
              </div>
              <div className="mt-1 text-sm text-ink-secondary">Please refresh.</div>
              <div className="mt-2 text-xs opacity-70">{error}</div>
            </div>
          ) : (
            <DogsGrid dogs={gridDogs} loading={loading} count={gridCount} />
          )}
        </section>

        <section className="mt-12 sm:mt-14 lg:mt-16">
          <TestimonialsSection />
        </section>
      </Container>
    </main>
  );
}
