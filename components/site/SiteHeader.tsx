"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type SiteHeaderProps = {
  ctaHref?: string;
};

export function SiteHeader({ ctaHref = "#pups" }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50">
      {/* Backdrop that keeps header readable over the photo */}
      <div className="border-b border-black/10 bg-white/60 backdrop-blur-md">
        <Container
          size="xl"
          className="flex items-center justify-between py-3"
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 ring-1 ring-black/10 shadow-soft">
              <span className="text-lg">🐶</span>
            </div>

            <div className="leading-tight">
              <div className="text-[15px] sm:text-base font-extrabold tracking-tight text-ink-primary">
                The Wooof Village
              </div>
              <div className="text-xs text-ink-secondary">
                Simple, honest rehoming
              </div>
            </div>
          </Link>

          {/* Small trust chips + CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="neutral">Home pickup</Badge>
            <Badge variant="neutral">Fast replies</Badge>
            <Badge variant="neutral">Small batches</Badge>
          </div>

          <div className="flex items-center gap-2">
            <a href={ctaHref}>
              <Button variant="secondary" size="sm">
                View puppies →
              </Button>
            </a>
          </div>
        </Container>
      </div>
    </header>
  );
}
