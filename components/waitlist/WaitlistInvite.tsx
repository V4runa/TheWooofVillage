"use client";

import * as React from "react";
import Link from "next/link";
import { formatUsd } from "@/lib/waitlist/rules";

type Config = {
  ready?: boolean;
  enabled?: boolean;
  amount_cents?: number;
};

/**
 * Secondary invitation beside the puppy listings.
 * Hidden when the waitlist schema is missing or an admin has switched it off,
 * so the catalog itself never fails because of the waitlist.
 */
export function WaitlistInvite() {
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
