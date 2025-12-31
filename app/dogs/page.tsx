"use client";

import { Container } from "@/components/ui/Container";
import { useDogs } from "@/hooks/useDogs";
import { DogsGrid } from "@/components/dogs/DogsGrid";

export default function DogsPage() {
  const { dogs, loading, error } = useDogs({
    // decide later if you want to show reserved/sold too
    statuses: ["available"],
  });

  return (
    <main className="min-h-screen">
      <Container size="xl" className="py-10 sm:py-14 lg:py-16">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-primary">
            Puppies
          </h1>
          <p className="mt-2 max-w-[75ch] text-sm sm:text-base text-ink-secondary leading-relaxed">
            Tap a puppy to view photos, details, and deposit options.
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
          <DogsGrid dogs={dogs} loading={loading} count={3} />
        )}
      </Container>
    </main>
  );
}
