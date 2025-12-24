import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroExperience } from "@/components/landing/HeroExperience";
import { PupFeedPreview } from "@/components/landing/PupFeedPreview";
import { TrustStrip } from "@/components/landing/TrustStrip";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Container size="xl" className="py-10 sm:py-14 lg:py-20">
        {/* One cohesive canvas card that sits ON the warm world */}
        <Card
          variant="elevated"
          className={[
            "relative overflow-hidden rounded-[34px]",
            // IMPORTANT: no white blast — let your card styling handle surface
            "shadow-large",
            "animate-fade-in",
          ].join(" ")}
        >
          {/* Soft internal atmosphere (not off-white) */}
          <div className="pointer-events-none absolute inset-0">
            {/* subtle haze so content reads, but still shows world */}
            <div className="absolute inset-0 bg-white/30" />
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl animate-gentle-pulse" />
            <div className="absolute -bottom-40 -left-36 h-[480px] w-[480px] rounded-full bg-secondary/12 blur-3xl" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative p-6 sm:p-10 lg:p-14">
            {/* Header should feel like its own “chapter” */}
            <LandingHeader />

            {/* Clear separation, but NOT a huge empty void */}
            <div className="mt-10 sm:mt-12">
              <HeroExperience />
            </div>

            {/* Right-side stack (feed + trust) should feel intentional */}
            <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-start">
              {/* Left: feed (bigger visual weight because photos) */}
              <div className="lg:col-span-7">
                <PupFeedPreview />
              </div>

              {/* Right: trust (supporting module) */}
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-10">
                  <TrustStrip />
                </div>
              </div>
            </div>

            {/* Later we’ll re-introduce HowItWorks once it’s redesigned */}
          </div>
        </Card>
      </Container>
    </main>
  );
}
