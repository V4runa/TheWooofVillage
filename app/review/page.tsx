"use client";

import * as React from "react";

import { Container } from "@/components/ui/Container";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { ReviewForm } from "@/components/testimonials/ReviewForm";
import { photoTitleStyle, photoBodyStyle, woofSheenKeyframes } from "@/lib/styles/landing";

export default function ReviewPage() {
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <main className="min-h-screen">
      <LandingHeader pupsAnchorId="pups" cta={{ label: "View puppies →", href: "/dogs" }} />

      <Container size="md" className="pb-12 sm:pb-14 lg:pb-16">
        <section className="mt-10 sm:mt-12 lg:mt-14">
          <div className="mb-6 sm:mb-8">
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={photoTitleStyle}
            >
              Leave a review
            </h1>

            <div
              className="mt-2 h-[2px] w-[132px] rounded-full opacity-95 shadow-[0_10px_28px_rgba(12,16,22,0.16)] motion-reduce:animate-none animate-[woofSheen_10s_ease-in-out_infinite]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,206,160,0.78), rgba(216,232,255,0.56), rgba(255,206,160,0.74))",
                backgroundSize: "220% 100%",
              }}
              aria-hidden
            />

            <p
              className="mt-3 max-w-[60ch] text-sm sm:text-base leading-relaxed"
              style={photoBodyStyle}
            >
              Adopted one of our puppies? We&apos;d love to hear about it — short and
              honest is perfect, and you can add photos of your new family member.
            </p>
          </div>

          <div className="rounded-3xl bg-[rgba(255,252,248,0.96)] p-6 sm:p-7 border border-amber-950/12 ring-1 ring-inset ring-white/20 shadow-[0_18px_52px_-26px_rgba(17,24,39,0.30)]">
            {submitted ? (
              <div className="grid gap-4 text-center">
                <div className="text-xl font-extrabold text-ink-primary">
                  Thank you! 🐾
                </div>
                <p className="text-sm leading-relaxed text-ink-secondary">
                  Your review was submitted and will appear once it&apos;s approved.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold bg-[rgba(255,248,238,0.92)] border border-amber-950/18 hover:bg-[rgba(255,252,248,0.98)] transition"
                  >
                    Leave another review
                  </button>
                </div>
              </div>
            ) : (
              <ReviewForm onSuccess={() => setSubmitted(true)} />
            )}
          </div>
        </section>
      </Container>

      <SiteFooter />

      <style jsx global>{woofSheenKeyframes}</style>
    </main>
  );
}
