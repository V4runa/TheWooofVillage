import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";
import { photoBodyStyle, photoTitleStyle } from "@/lib/styles/landing";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Ask to be contacted about a future puppy. The deposit is confirmed by hand and is separate from today's listings.",
};

export default function WaitlistPage() {
  return (
    <main className="min-h-screen">
      <LandingHeader pupsAnchorId="pups" cta={{ label: "View puppies →", href: "/dogs" }} />
      <Container size="md" className="pb-12 sm:pb-14 lg:pb-16">
        <section className="mt-10 sm:mt-12 lg:mt-14">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={photoTitleStyle}>
            Join the waitlist
          </h1>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed sm:text-base" style={photoBodyStyle}>
            This is for a puppy that is not listed yet. You choose among later arrivals.
            We save your request first, then show where to send the deposit.
          </p>
          <div className="mt-6 rounded-3xl border border-amber-950/12 bg-[rgba(255,252,248,0.96)] p-6 sm:p-7">
            <WaitlistForm />
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}
