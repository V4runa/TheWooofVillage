import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Pup = {
  name: string;
  meta: string;
  tag: "new" | "available" | "popular";
  seed: string;
};

const PUPS: Pup[] = [
  { name: "Milo", meta: "10 mo • Playful • Loves cuddles", tag: "new", seed: "milo" },
  { name: "Luna", meta: "2 yrs • Friendly • Great with kids", tag: "available", seed: "luna" },
  { name: "Nova", meta: "3 yrs • Calm • House trained", tag: "popular", seed: "nova" },
];

export function PupFeedPreview() {
  return (
    <section className="relative animate-fade-in">
      {/* local atmosphere to blend with the page (not a separate white block) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 -right-20 h-64 w-64 rounded-full bg-primary/16 blur-3xl animate-gentle-pulse" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/16 blur-3xl" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary-700">
            the feed
          </div>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Fresh pups, posted like a social stream
          </h3>
          <p className="mt-3 text-base text-ink-secondary sm:text-lg">
            Cute to browse. Serious about safety.
          </p>
        </div>

        <Link href="/dogs" className="shrink-0">
          <Button
            variant="secondary"
            size="md"
            className="w-full rounded-full sm:w-auto"
          >
            View all →
          </Button>
        </Link>
      </div>

      <div className="mt-8 space-y-5">
        {PUPS.map((p, index) => (
          <FeedRow key={p.name} pup={p} delay={index * 100} />
        ))}
      </div>
    </section>
  );
}

function FeedRow({ pup, delay = 0 }: { pup: Pup; delay?: number }) {
  const badgeVariant =
    pup.tag === "new" ? "success" : pup.tag === "popular" ? "secondary" : "neutral";

  const badgeLabel = pup.tag === "available" ? "available" : pup.tag;

  /**
   * Dog-only placeholder images.
   * placedog.net serves dog photos. Use a stable "id" so each pup stays consistent.
   * NOTE: this requires adding "placedog.net" to next.config images.remotePatterns (or domains).
   */
  const imgSrc = `https://placedog.net/900/600?id=${encodeURIComponent(pup.seed)}`;

  return (
    <div
      className={[
        "group overflow-hidden rounded-3xl border border-black/10 bg-surface/65 shadow-soft",
        "hover:shadow-large hover:-translate-y-1 hover:border-black/14 hover:bg-surface/75",
        "transition-all duration-300",
        "animate-fade-in",
      ].join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden sm:h-auto sm:w-48 md:w-56">
          <Image
            src={imgSrc}
            alt={`${pup.name} preview`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, 240px"
            unoptimized
            priority={false}
          />

          {/* soft overlay for readability */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-black/12 to-transparent" />

          {/* Tag badge */}
          <div className="absolute left-4 top-4 transition-transform group-hover:scale-105">
            <Badge variant={badgeVariant}>{badgeLabel}</Badge>
          </div>

          {/* Cute paw stamp */}
          <div className="absolute bottom-4 right-4 text-2xl opacity-90 transition-transform group-hover:scale-110 group-hover:rotate-12">🐾</div>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-xl font-bold text-ink-primary">
                  {pup.name}
                </div>
                <div className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{pup.meta}</div>
              </div>

              {/* Small "reaction" feel */}
              <div className="hidden items-center gap-2 text-sm text-ink-muted sm:flex">
                <span className="rounded-full border border-black/8 bg-surface/70 px-2.5 py-1.5 transition-all hover:scale-110 hover:bg-surface/85">
                  ♡
                </span>
                <span className="rounded-full border border-black/8 bg-surface/70 px-2.5 py-1.5 transition-all hover:scale-110 hover:bg-surface/85">
                  💬
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Badge variant="neutral" className="transition-all hover:scale-105">view</Badge>
              <Badge variant="neutral" className="transition-all hover:scale-105">ask about {pup.name.toLowerCase()}</Badge>
              <Badge variant="neutral" className="transition-all hover:scale-105">temperament</Badge>
            </div>
          </div>

          {/* Tiny footer line */}
          <div className="mt-5 flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">posted recently</span>
            <span className="opacity-70 transition-opacity group-hover:opacity-100 group-hover:translate-x-1">
              tap to learn more →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
