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

function payGlyph(id: string) {
  if (id === "venmo") return "V";
  if (id === "cashapp") return "$";
  if (id === "paypal") return "P";
  if (id === "zelle") return "Z";
  return "•";
}

function WaitlistPayOptions({
  amountLabel,
  options,
}: {
  amountLabel: string;
  options: PaymentOption[];
}) {
  const [notice, setNotice] = React.useState<string | null>(null);

  if (options.length === 0) {
    return (
      <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
        Payment options aren&apos;t set up yet. This is not a substitute list of apps — none are
        configured on the shop profile. Text or call to arrange the deposit. Your request is still saved.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="text-xs font-bold text-ink-secondary">
        Pay <span className="text-ink-primary">{amountLabel}</span> with:
      </div>
      <div className="grid gap-2" role="list">
        {options.map((option) => (
          <div
            key={option.id}
            role="listitem"
            className="rounded-2xl border border-amber-950/10 bg-white/60 px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-amber-950/12 bg-[rgba(255,240,225,0.72)] text-xs font-black text-amber-950"
                >
                  {payGlyph(option.id)}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink-primary">{option.label}</div>
                  <div className="truncate text-xs text-ink-secondary">{option.handle}</div>
                </div>
              </div>
              {option.manual ? (
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-amber-950/12 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-ink-primary hover:border-amber-950/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/80"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(option.handle);
                      setNotice(`${option.label} recipient copied. Open your bank app and send ${amountLabel}.`);
                    } catch {
                      setNotice(`Couldn't copy the ${option.label} recipient. Copy it from the row above.`);
                    }
                  }}
                >
                  Copy
                </button>
              ) : (
                <a
                  href={option.href ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-meadow-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm hover:bg-meadow-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/80"
                >
                  Pay {amountLabel}
                </a>
              )}
            </div>
            {option.manual ? (
              <p className="mt-1.5 text-[11px] leading-relaxed text-ink-secondary">
                Open your bank app, choose Zelle, and send {amountLabel} to the recipient above.
              </p>
            ) : !option.prefillsAmount ? (
              <p className="mt-1.5 text-[11px] leading-relaxed text-ink-secondary">
                On desktop the amount may not pre-fill. Enter {amountLabel} in the app.
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {notice ? (
        <p className="text-xs font-semibold text-ink-primary" role="status">
          {notice}
        </p>
      ) : null}
    </div>
  );
}

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
    const amountLabel = formatUsd(done.amount_cents);
    return (
      <div className="grid gap-4">
        <h2 className="text-xl font-extrabold text-ink-primary">You&apos;re on the list</h2>
        <p className="text-sm leading-relaxed text-ink-secondary">
          {done.reused
            ? "We already had your open request, so this deposit amount was not changed."
            : "Your request is saved. This screen is your confirmation. There is no reference number to keep."}
        </p>
        <div className="rounded-2xl border border-amber-950/10 bg-white/60 p-4">
          <div className="text-sm font-extrabold text-ink-primary">Pay the waitlist deposit</div>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Nothing is charged on this website. We still confirm the receipt ourselves before
            contacting you.
          </p>
          <WaitlistPayOptions amountLabel={amountLabel} options={done.payment_options} />
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
