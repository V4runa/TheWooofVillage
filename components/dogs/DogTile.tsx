// components/dogs/DogTile.tsx
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
  // maps to your Badge variants, keeping it calm
  if (status === "available") return "success";
  if (status === "reserved") return "warning";
  if (status === "sold") return "neutral";
  return "neutral";
}

type Props = {
  dog: Dog;
  dense?: boolean; // landing page uses dense tiles
};

export function DogTile({ dog, dense = true }: Props) {
  const href = dog.slug ? `/dogs/${dog.slug}` : `/dogs/${dog.id}`;
  const img = bestImageUrl(dog);

  const deposit = moneyFromCents(dog.deposit_amount_cents);
  const price = moneyFromCents(dog.price_amount_cents);

  return (
    <Link href={href} className="block">
      <Card
        variant="elevated"
        className={[
          "group overflow-hidden",
          "transition-transform duration-300 ease-out",
          "hover:-translate-y-[1px]",
        ].join(" ")}
      >
        {/* Image */}
        <div className="relative w-full overflow-hidden">
          <div className={dense ? "aspect-[16/10]" : "aspect-[4/3]"} />

          {img ? (
            <img
              src={img}
              alt={dog.name}
              loading="lazy"
              className={[
                "absolute inset-0 h-full w-full object-cover",
                "transition-transform duration-500 ease-out",
                "group-hover:scale-[1.02]",
              ].join(" ")}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-black/5">
              <div className="text-sm text-ink-muted">No photo yet</div>
            </div>
          )}

          {/* soft readability */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.25),transparent_60%)]" />

          {/* Status */}
          <div className="absolute left-3 top-3">
            <Badge variant={statusVariant(dog.status) as any}>
              {statusLabel(dog.status)}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className={dense ? "p-4" : "p-5"}>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-extrabold tracking-tight text-ink-primary">
              {dog.name}
            </h3>

            {subtitle(dog) ? (
              <p className="mt-1 text-xs text-ink-secondary">{subtitle(dog)}</p>
            ) : null}
          </div>

          {/* Description: keep it tight (landing should be calm) */}
          <p className="mt-2 line-clamp-1 text-sm text-ink-secondary">
            {dog.description || "Tap for photos, details, and deposit options."}
          </p>

          {(deposit || price) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {deposit && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-ink-primary ring-1 ring-black/10">
                  Deposit {deposit}
                </span>
              )}
              {price && (
                <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-semibold text-ink-primary ring-1 ring-black/10">
                  Total {price}
                </span>
              )}
            </div>
          )}

          <div className="mt-3 text-xs font-semibold text-ink-primary">
            View details →
          </div>
        </div>
      </Card>
    </Link>
  );
}
