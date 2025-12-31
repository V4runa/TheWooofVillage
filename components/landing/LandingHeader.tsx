"use client";

import * as React from "react";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useMerchantProfile } from "@/hooks/useMerchantProfile";

type LandingHeaderProps = {
  pupsAnchorId?: string;
};

export function LandingHeader({ pupsAnchorId = "pups" }: LandingHeaderProps) {
  const { profile, loading } = useMerchantProfile();

  const displayName = profile?.display_name?.trim() || "The Wooof Village";
  const tagline = profile?.tagline?.trim() || "Get your puppy today!";

  return (
    <header className="w-full">
      <div className="sticky top-0 z-50">
        <div className="bg-white/30 backdrop-blur-md border-b border-black/5">
          <Container size="xl" className="py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 border border-black/5 shadow-soft">
                  <span className="text-xl" aria-hidden>
                    🐶
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="truncate text-base sm:text-lg font-extrabold text-ink-primary">
                    {loading ? "Loading…" : displayName}
                  </div>
                  <div className="truncate text-xs sm:text-sm text-ink-secondary">
                    {tagline}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <Badge variant="neutral">🏡 Home pickup</Badge>
                <Badge variant="neutral">⚡ Fast replies</Badge>
                <Badge variant="neutral">🫶 Small batches</Badge>
              </div>

              <div className="shrink-0">
                <Link href={`#${pupsAnchorId}`}>
                  <Button size="sm" variant="secondary">
                    View puppies →
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </header>
  );
}
