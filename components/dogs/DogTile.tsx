"use client";

import Image from "next/image";
import Link from "next/link";
import type { Dog } from "@/types/dogs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function moneyFromCents(cents?: number | null) {
  if (cents == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function bestImageUrl(dog: Dog) {
  return dog.cover_image_url || dog.images?.[0]?.url || null;
}

// Format a YYYY-MM-DD date without timezone drift (parsing the parts directly
// avoids the UTC-midnight off-by-one that `new Date("2026-06-01")` causes in
// negative-offset locales).
function formatDob(dateStr?: string | null) {
  if (!dateStr) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  const d = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function subtitle(dog: Dog) {
  const parts: string[] = [];
  if (dog.breed) parts.push(dog.breed);
  const dob = formatDob(dog.date_of_birth);
  if (dob) parts.push(`Born ${dob}`);
  if (dog.sex) parts.push(dog.sex);
  return parts.join(" · ");
}

function statusLabel(status: string) {
  if (status === "available") return "Available";
  if (status === "reserved") return "Reserved";
  if (status === "sold") return "Adopted";
  return status;
}

function statusVariant(status: string) {
  if (status === "available") return "success";
  if (status === "reserved") return "warning";
  if (status === "sold") return "neutral";
  return "neutral";
}

type Props = {
  dog: Dog;
  dense?: boolean;
};

export function DogTile({ dog, dense = true }: Props) {
  const href = dog.slug ? `/dogs/${dog.slug}` : `/dogs/${dog.id}`;
  const img = bestImageUrl(dog);

  const deposit = moneyFromCents(dog.deposit_amount_cents);
  const price = moneyFromCents(dog.price_amount_cents);

  // Reserved/sold pups stay visible to show shop activity, but are visually
  // de-emphasized and carry a clear corner ribbon so buyers know they aren't
  // currently purchasable.
  const isReserved = dog.status === "reserved";
  const isSold = dog.status === "sold";
  const isInactive = isReserved || isSold;
  const ribbonText = isSold ? "Adopted" : isReserved ? "Reserved" : null;

  return (
    <Link href={href} className="block h-full">
      <Card
        variant="surface"
        className={[
          "group overflow-hidden h-full flex flex-col",
          "border border-amber-950/18",
          "transition-[transform,box-shadow,border-color] duration-200 ease-out",
          "hover:-translate-y-[1.5px] hover:shadow-large hover:border-amber-950/28",
        ].join(" ")}
      >
        {/* Accent micro-bar (slightly stronger) */}
        <div
          aria-hidden
          className="h-1.5 w-full bg-[linear-gradient(90deg,rgba(63,161,126,0.75)_0%,rgba(96,140,255,0.65)_55%,rgba(255,176,122,0.85)_118%)]"
        />

        {/* Image */}
        <div className="relative w-full overflow-hidden bg-[linear-gradient(to_bottom,rgba(255,236,218,0.90),rgba(255,255,255,0.60))]">
          <div className="relative aspect-[4/3]">
            {img ? (
              <>
                <Image
                  src={img}
                  alt={dog.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className={[
                    "object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]",
                    isInactive ? "saturate-[0.55] opacity-[0.78]" : "",
                  ].join(" ")}
                />

                {/* Richer cozy overlay */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_90%_at_50%_12%,rgba(255,232,210,0.22),transparent_55%),linear-gradient(to_top,rgba(0,0,0,0.32),transparent_58%)]"
                />

                {/* Dim veil for reserved/sold so they read as past activity */}
                {isInactive ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(20,16,12,0.40),rgba(20,16,12,0.12)_55%,transparent)]"
                  />
                ) : null}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-amber-950/85">
                No photo yet
              </div>
            )}

            {/* Diagonal corner ribbon for reserved/sold */}
            {ribbonText ? (
              <div className="pointer-events-none absolute -right-12 top-4 rotate-45">
                <div
                  className={[
                    "px-12 py-1 text-center text-[11px] font-black uppercase tracking-wider text-white shadow-medium",
                    isSold
                      ? "bg-[rgba(70,78,92,0.96)]"
                      : "bg-[rgba(193,120,46,0.96)]",
                  ].join(" ")}
                >
                  {ribbonText}
                </div>
              </div>
            ) : null}
          </div>

          {/* Status badge plate */}
          <div className="absolute left-3 top-3">
            <div className="inline-flex rounded-full bg-[rgba(255,240,225,0.78)] border border-amber-950/18 ring-1 ring-white/20 p-[4px] shadow-soft">
              <Badge variant={statusVariant(dog.status) as any}>
                {statusLabel(dog.status)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className={[
            dense ? "p-4" : "p-5",
            "bg-[linear-gradient(to_bottom,rgba(255,240,225,0.72),rgba(255,255,255,0.46))]",
            "flex-1 flex flex-col",
          ].join(" ")}
        >
          <div className="min-w-0">
            {/* Solid ink name — cleaner + more legible than gradient text at small sizes */}
            <h3 className="truncate text-base font-extrabold tracking-tight text-ink-primary">
              {dog.name}
            </h3>

            {subtitle(dog) ? (
              <p className="mt-1 text-xs font-bold text-amber-900/75">
                {subtitle(dog)}
              </p>
            ) : null}
          </div>

          <p className="mt-2 line-clamp-1 text-sm text-amber-900/85">
            {dog.description || "Tap for photos, details, and deposit options."}
          </p>

          {deposit || price ? (
            <div className="mt-3 flex items-center justify-between gap-3 text-xs">
              <span className="font-extrabold text-emerald-900">
                {deposit ? `Deposit ${deposit}` : ""}
              </span>
              <span className="font-extrabold text-amber-950">
                {price ? `Total ${price}` : ""}
              </span>
            </div>
          ) : null}

          {/* CTA pill — more obvious affordance */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold text-amber-950 border border-amber-950/22 ring-1 ring-inset ring-white/18 shadow-soft bg-[linear-gradient(90deg,rgba(255,236,218,0.85),rgba(255,255,255,0.55))] group-hover:shadow-medium">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full bg-[radial-gradient(circle,rgba(255,176,122,0.95),rgba(96,140,255,0.45),transparent_72%)]"
            />
            View details →
          </div>
        </div>
      </Card>
    </Link>
  );
}
