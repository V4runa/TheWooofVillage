"use client";

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

function subtitle(dog: Dog) {
  const parts: string[] = [];
  if (dog.breed) parts.push(dog.breed);
  if (dog.age_weeks != null) parts.push(`${dog.age_weeks} weeks`);
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

  return (
    <Link href={href} className="block">
      <Card
        variant="surface"
        className={[
          "group overflow-hidden",
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
        <div className="relative w-full overflow-hidden">
          <div className={dense ? "aspect-[16/10]" : "aspect-[4/3]"} />

          {img ? (
            <>
              <img
                src={img}
                alt={dog.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />

              {/* Richer cozy overlay */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_90%_at_50%_12%,rgba(255,232,210,0.22),transparent_55%),linear-gradient(to_top,rgba(0,0,0,0.32),transparent_58%)]"
              />
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(to_bottom,rgba(255,236,218,0.90),rgba(255,255,255,0.60))]">
              <div className="text-sm font-semibold text-amber-950/75">
                No photo yet
              </div>
            </div>
          )}

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
          ].join(" ")}
        >
          <div className="min-w-0">
            {/* Name gets premium gradient ink */}
            <h3 className="truncate text-[15px] font-extrabold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(90deg,rgba(120,72,38,1),rgba(79,156,255,0.85))]">
              {dog.name}
            </h3>

            {subtitle(dog) ? (
              <p className="mt-1 text-xs font-bold text-amber-900/75">
                {subtitle(dog)}
              </p>
            ) : null}
          </div>

          <p className="mt-2 line-clamp-1 text-sm text-amber-900/75">
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
