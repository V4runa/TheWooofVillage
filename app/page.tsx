import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroExperience } from "@/components/landing/HeroExperience";
import { PupFeedPreview } from "@/components/landing/PupFeedPreview";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Container size="xl" className="py-10 sm:py-14 lg:py-20">
        <Card
          variant="elevated"
          className={[
            "relative overflow-hidden rounded-[34px]",
            "shadow-large",
            "animate-fade-in",
            // subtle inner definition without harsh borders
            "ring-1 ring-black/5",
          ].join(" ")}
        >
          {/* Internal atmosphere: warm-tinted, not off-white */}
          <div className="pointer-events-none absolute inset-0">
            {/* Warm canvas wash (kills the off-white problem without turning muddy) */}
            <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(255,247,237,0.55),transparent_60%),radial-gradient(900px_500px_at_90%_20%,rgba(255,237,213,0.38),transparent_55%),linear-gradient(to_bottom,rgba(255,255,255,0.12),rgba(255,255,255,0.06))]" />

            {/* Gentle glows: keep them, but tone down saturation */}
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/12 blur-3xl animate-gentle-pulse" />
            <div
              className="absolute -bottom-44 -left-40 h-[520px] w-[520px] rounded-full bg-secondary/10 blur-3xl"
              style={{ animationDelay: "1s" }}
            />

            {/* Soft vignette to calm edges and reduce harsh contrast */}
            <div className="absolute inset-0 bg-[radial-gradient(1400px_800px_at_50%_30%,transparent_55%,rgba(0,0,0,0.05)_100%)]" />
          </div>

          <div className="relative p-6 sm:p-10 lg:p-14">
            {/* Chapter 1: Header */}
            <section className="relative">
              <LandingHeader />
            </section>

            {/* Chapter 2: Hero */}
            <section className="relative mt-10 sm:mt-12 lg:mt-14">
              <HeroExperience />
            </section>

            {/* Chapter seam (slightly tighter + cleaner rhythm) */}
            <div className="my-9 sm:my-11 lg:my-12 h-px bg-[linear-gradient(to_right,transparent,rgba(0,0,0,0.08),transparent)]" />

            {/* Chapter 3: Feed + Trust */}
            <section
              className={[
                "relative grid gap-8 lg:gap-10 lg:grid-cols-12 lg:items-stretch",
                // tiny optical align so the two columns feel “centered” together
                "lg:pt-1",
              ].join(" ")}
            >
              <div className="lg:col-span-7">
                <PupFeedPreview />
              </div>

              {/* Keep the trust column feeling intentional + aligned */}
              <div className="lg:col-span-5 lg:flex">
                <div className="lg:sticky lg:top-8 lg:flex lg:w-full">
                  {/* micro “frame” so the pillar doesn’t look like it floats differently than the feed */}
                  <div className="w-full lg:pt-[2px]">
                    <TrustStrip />
                  </div>
                </div>
              </div>
            </section>

            {/* Chapter seam */}
            <div className="my-9 sm:my-11 lg:my-12 h-px bg-[linear-gradient(to_right,transparent,rgba(0,0,0,0.08),transparent)]" />

            {/* Chapter 4: How it works */}
            <section className="relative">
              <HowItWorks />
            </section>

            {/* Bottom breathing room so the rounded card doesn't feel cramped */}
            <div className="mt-10 sm:mt-12 lg:mt-14" />
          </div>
        </Card>
      </Container>
    </main>
  );
}
