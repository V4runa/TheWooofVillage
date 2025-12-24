import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Pup = {
  name: string;
  meta: string;
  tag: "new" | "available" | "popular";
  seed: string;
  note: string;
  chips: string[];
};

const PUPS: Pup[] = [
  {
    name: "Milo",
    meta: "10 mo • Playful • Loves cuddles",
    tag: "new",
    seed: "milo",
    note: "Confident puppy energy. Would thrive with daily play + structure.",
    chips: ["Good on leash", "Learns fast", "Active home"],
  },
  {
    name: "Luna",
    meta: "2 yrs • Friendly • Great with kids",
    tag: "available",
    seed: "luna",
    note: "Steady temperament and people-friendly. Great family candidate.",
    chips: ["Kid-friendly", "Calm indoors", "Routine lover"],
  },
  {
    name: "Nova",
    meta: "3 yrs • Calm • House trained",
    tag: "popular",
    seed: "nova",
    note: "Low-drama companion. House trained and affectionate.",
    chips: ["House trained", "Gentle energy", "Quiet home"],
  },
];

export function PupFeedPreview() {
  return (
    <section className="relative animate-fade-in">
      {/* subtle local atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-14 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-primary-700">
            the feed
          </div>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Fresh pups, posted like a stream
          </h3>
          <p className="mt-3 text-base text-ink-secondary sm:text-lg">
            Quick to browse. Clear details when you’re ready.
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

      {/* Feed frame */}
      <div
        className={[
          "relative mt-7 overflow-hidden rounded-[28px] p-4 sm:p-5",
          "border border-black/5 ring-1 ring-black/5",
          "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.50),rgba(250,242,232,0.36))]",
          "shadow-soft backdrop-blur-md",
        ].join(" ")}
      >
        {/* soft glow + inner vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_280px_at_18%_8%,rgba(127,175,155,0.14),transparent_60%),radial-gradient(700px_260px_at_88%_40%,rgba(208,140,96,0.11),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_40%,transparent_55%,rgba(0,0,0,0.035)_100%)]" />

        {/* Frame top rail (makes it feel “built”, not empty space) */}
        <div className="relative mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted">
            <span className="grid h-7 w-7 place-items-center rounded-2xl border border-black/5 bg-white/10 shadow-soft">
              🐶
            </span>
            <span>Latest listings</span>
            <span className="opacity-60">•</span>
            <span className="opacity-80">Updated often</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <MiniPill>clear details</MiniPill>
            <MiniPill>screening-first</MiniPill>
          </div>

          {/* single organic corner accent (one only) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-5 grid h-9 w-9 place-items-center rounded-2xl bg-[linear-gradient(to_br,#2f2a26,#3a3430)] text-[#f6f1ea] shadow-medium rotate-6 opacity-85"
          >
            <span className="text-sm">🐩</span>
          </span>
        </div>

        {/* Cards */}
        <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PUPS.map((p, i) => (
            <PupCard key={p.name} pup={p} index={i} />
          ))}
        </div>

        {/* Footer line */}
        <div className="relative mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-ink-muted">
          <span className="font-medium">
            Tap a pup to see details • Message anytime
          </span>

          <Link
            href="/dogs"
            className="inline-flex items-center gap-2 font-semibold text-ink-primary hover:opacity-90"
          >
            Browse the full list <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function PupCard({ pup, index }: { pup: Pup; index: number }) {
  const badgeVariant =
    pup.tag === "new"
      ? "success"
      : pup.tag === "popular"
      ? "secondary"
      : "neutral";

  const badgeLabel = pup.tag === "available" ? "available" : pup.tag;

  // placedog.net placeholder
  const imgSrc = `https://placedog.net/900/650?id=${encodeURIComponent(pup.seed)}`;

  // tiny “post” flavor — deterministic so it doesn’t flicker between renders
  const postedLabel = index === 0 ? "just posted" : index === 1 ? "today" : "recently";

  return (
    <Link
      href="/dogs"
      className={[
        "group relative block overflow-hidden rounded-3xl",
        "border border-black/5 ring-1 ring-black/5",
        "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.62),rgba(250,242,232,0.46))]",
        "shadow-soft backdrop-blur-md",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:shadow-medium hover:-translate-y-[1px] hover:border-black/8 hover:ring-black/8",
      ].join(" ")}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={imgSrc}
          alt={`${pup.name} preview`}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          unoptimized
          priority={false}
        />

        {/* readability overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.52),rgba(0,0,0,0.10),transparent)]" />

        {/* tag */}
        <div className="absolute left-4 top-4">
          <Badge variant={badgeVariant}>{badgeLabel}</Badge>
        </div>

        {/* tiny “posted” chip */}
        <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[11px] font-semibold text-white/95 backdrop-blur-md">
          {postedLabel}
        </div>

        {/* bottom title block */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-xl font-bold text-white">{pup.name}</div>
              <div className="mt-1 text-xs text-white/90">{pup.meta}</div>
            </div>

            {/* paw stamp */}
            <div className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/20 text-base text-white backdrop-blur-md transition-transform group-hover:scale-105">
              🐾
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-sm leading-relaxed text-ink-secondary">{pup.note}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {pup.chips.slice(0, 3).map((c) => (
            <MiniTag key={c}>{c}</MiniTag>
          ))}
        </div>

        {/* quiet action row (feels like a “post”) */}
        <div className="mt-5 flex items-center justify-between text-xs text-ink-muted">
          <span className="font-semibold text-ink-primary">view details →</span>

          <span className="inline-flex items-center gap-2">
            <span className="rounded-full border border-black/5 bg-white/10 px-2.5 py-1 font-semibold">
              ♡
            </span>
            <span className="rounded-full border border-black/5 bg-white/10 px-2.5 py-1 font-semibold">
              💬
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function MiniPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/5 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-ink-muted shadow-soft">
      {children}
    </span>
  );
}

function MiniTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/5 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-ink-secondary shadow-soft">
      {children}
    </span>
  );
}
