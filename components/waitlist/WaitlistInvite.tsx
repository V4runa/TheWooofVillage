"use client";

import * as React from "react";
import Link from "next/link";
import { formatUsd } from "@/lib/waitlist/rules";

type Config = {
  ready?: boolean;
  enabled?: boolean;
  amount_cents?: number;
};

const buttonClass = [
  "inline-flex items-center justify-center rounded-2xl font-extrabold",
  "min-h-12 px-5 py-3 text-sm sm:px-6 sm:text-base text-center",
  "text-amber-950 bg-[rgba(255,246,235,0.96)] border border-amber-950/22",
  "ring-1 ring-inset ring-white/40",
  "shadow-[0_14px_34px_-22px_rgba(17,24,39,0.38)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/80",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(255,252,248,0.96)]",
  "hover:-translate-y-[1px] hover:bg-[rgba(255,248,242,1)] hover:border-amber-950/30",
  "active:translate-y-[1px]",
].join(" ");

/**
 * Public invitation to /waitlist.
 * Hidden when the waitlist is missing or an admin has switched it off.
 * `prominence="text"` stays beside the listings. `prominence="button"` is the
 * larger control in the homepage hero.
 */
export function WaitlistInvite({ prominence = "text" }: { prominence?: "text" | "button" }) {
  const [config, setConfig] = React.useState<Config | null>(null);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/public/waitlist", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (alive) setConfig(json);
      })
      .catch(() => {
        if (alive) setConfig({ ready: false, enabled: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!config?.ready || !config.enabled || config.amount_cents == null) return null;

  if (prominence === "button") {
    return (
      <Link href="/waitlist" className={buttonClass}>
        Join the waitlist
      </Link>
    );
  }

  return (
    <p className="mt-3 text-sm text-ink-secondary">
      Looking ahead to a later puppy?{" "}
      <Link href="/waitlist" className="font-extrabold text-ink-primary underline underline-offset-4">
        Join the waitlist
      </Link>
      . The deposit is {formatUsd(config.amount_cents)} and is separate from reserving a puppy listed today.
    </p>
  );
}
