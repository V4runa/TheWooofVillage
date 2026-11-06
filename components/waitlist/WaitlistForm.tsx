"use client";

import * as React from "react";
import Link from "next/link";
import { formatUsPhone } from "@/lib/format";
import {
  formatUsd,
  WAITLIST_TERMS_VERSION,
} from "@/lib/waitlist/rules";

type PaymentOption = {
  id: string;
  label: string;
  handle: string;
  href: string | null;
  manual: boolean;
  prefillsAmount: boolean;
};

type Config = {
  ok?: boolean;
  ready?: boolean;
  enabled?: boolean;
  amount_cents?: number;
  terms_text?: string;
  terms_version?: string;
};

type Done = {
  reused: "request" | "phone" | null;
  amount_cents: number;
  currency: string;
  payment_options: PaymentOption[];
};

const REQUEST_KEY = "woof_waitlist_client_request";

const inputClass =
  "w-full rounded-xl bg-white/90 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-amber-300/55 focus:ring-offset-2";

function clientRequestId() {
  const existing = window.sessionStorage.getItem(REQUEST_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.sessionStorage.setItem(REQUEST_KEY, created);
  return created;
}

export function WaitlistForm() {
  const [config, setConfig] = React.useState<Config | null>(null);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [breed, setBreed] = React.useState("");
  const [sex, setSex] = React.useState("");
  const [note, setNote] = React.useState("");
  const [accepted, setAccepted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<Done | null>(null);

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

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: name,
          buyer_phone: phone,
          buyer_email: email,
          breed_preference: breed,
          sex_preference: sex,
          note,
          terms_accepted: accepted,
          terms_version: config?.terms_version || WAITLIST_TERMS_VERSION,
          client_request_id: clientRequestId(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Could not save your request.");
        return;
      }
      setDone(json as Done);
    } catch {
      setError("Could not save your request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!config) {
    return <p className="text-sm text-ink-secondary">Loading the waitlist…</p>;
  }

  if (!config.ready) {
    return (
      <p className="text-sm text-ink-secondary">
        The waitlist is not open yet. You can still browse the puppies that are listed today.
      </p>
    );
  }

  if (!config.enabled) {
    return (
      <p className="text-sm text-ink-secondary">
        The waitlist is turned off right now. You can still browse the puppies that are listed today.
      </p>
    );
  }

  if (done) {
    return (
      <div className="grid gap-4">
        <h2 className="text-xl font-extrabold text-ink-primary">You&apos;re on the list</h2>
        <p className="text-sm leading-relaxed text-ink-secondary">
          {done.reused
            ? "We already had your open request, so this deposit amount was not changed."
            : "Your request is saved. This screen is your confirmation. There is no reference number to keep."}
        </p>
        <p className="text-sm font-extrabold text-ink-primary">
          Deposit to send: {formatUsd(done.amount_cents)} {done.currency}
        </p>
        <p className="text-sm leading-relaxed text-ink-secondary">
          Send it with one of the payment apps below. We confirm the money ourselves, then contact you.
          Nothing is charged on this website.
        </p>
        <div className="grid gap-2">
          {done.payment_options.length === 0 ? (
            <p className="text-sm text-ink-secondary">
              Payment buttons are not listed yet. We still have your request and will contact you.
            </p>
          ) : (
            done.payment_options.map((option) =>
              option.href ? (
                <a
                  key={option.id}
                  href={option.href}
                  className="inline-flex items-center justify-between rounded-2xl border border-amber-950/15 bg-[rgba(255,248,238,0.92)] px-4 py-3 text-sm font-extrabold text-ink-primary"
                >
                  <span>{option.label}</span>
                  <span>{option.handle}</span>
                </a>
              ) : (
                <div
                  key={option.id}
                  className="rounded-2xl border border-amber-950/15 bg-[rgba(255,248,238,0.92)] px-4 py-3 text-sm text-ink-primary"
                >
                  <div className="font-extrabold">{option.label}</div>
                  <div>Send it manually to {option.handle}. There is no link for Zelle.</div>
                </div>
              )
            )
          )}
        </div>
        <Link href="/dogs" className="text-sm font-extrabold text-ink-primary underline underline-offset-4">
          Back to puppies
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <p className="text-sm leading-relaxed text-ink-secondary">
        Today&apos;s deposit is {formatUsd(config.amount_cents ?? 0)}. It is saved with your request
        and is not a reservation of a puppy that is already listed.
      </p>
      <label className="grid gap-1 text-sm font-extrabold text-ink-primary">
        Name
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
      </label>
      <label className="grid gap-1 text-sm font-extrabold text-ink-primary">
        Phone
        <input
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(formatUsPhone(e.target.value))}
          required
          autoComplete="tel"
          inputMode="tel"
        />
      </label>
      <label className="grid gap-1 text-sm font-extrabold text-ink-primary">
        Email
        <input
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          inputMode="email"
        />
      </label>
      <label className="grid gap-1 text-sm font-extrabold text-ink-primary">
        Breed preference <span className="font-medium text-ink-secondary">(optional)</span>
        <input className={inputClass} value={breed} onChange={(e) => setBreed(e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm font-extrabold text-ink-primary">
        Sex preference <span className="font-medium text-ink-secondary">(optional)</span>
        <select className={inputClass} value={sex} onChange={(e) => setSex(e.target.value)}>
          <option value="">No preference</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-extrabold text-ink-primary">
        Note <span className="font-medium text-ink-secondary">(optional)</span>
        <textarea className={inputClass} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-secondary">
        <input
          type="checkbox"
          className="mt-1"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          required
        />
        <span>{config.terms_text}</span>
      </label>
      {error ? (
        <p className="text-sm font-semibold text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-2xl bg-amber-950 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save my request"}
      </button>
    </form>
  );
}
