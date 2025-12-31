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
          "hover:-translate-y-[1px] hover:shadow-medium",
          "transition",
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

          {/* keep it calm */}
          <p className="mt-2 line-clamp-1 text-sm text-ink-secondary">
            {dog.description || "Tap for photos, details, and deposit options."}
          </p>

          {(deposit || price) ? (
            <div className="mt-3 flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-ink-secondary">
                {deposit ? `Deposit ${deposit}` : ""}
              </span>
              <span className="font-extrabold text-ink-primary">
                {price ? `Total ${price}` : ""}
              </span>
            </div>
          ) : null}

          <div className="mt-3 text-xs font-semibold text-ink-primary">
            View details →
          </div>
        </div>
      </Card>
    </Link>
  );
}
