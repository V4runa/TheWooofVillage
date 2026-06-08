"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

import type { Dog } from "@/types/dogs";
import type { MerchantProfile } from "@/types/merchant";

/* -----------------------------
   Helpers
------------------------------ */
function moneyFromCents(cents?: number | null) {
  if (cents == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function bestPrimaryImage(dog: Dog | null) {
  if (!dog) return null;
  return dog.cover_image_url || dog.images?.[0]?.url || null;
}

function allImages(dog: Dog | null) {
  if (!dog) return [];
  const urls: { url: string; alt: string }[] = [];
  const primary = dog.cover_image_url;
  if (primary) urls.push({ url: primary, alt: dog.name });

  for (const img of dog.images ?? []) {
    if (!img?.url) continue;
    if (primary && img.url === primary) continue;
    urls.push({ url: img.url, alt: img.alt || dog.name });
  }

  const seen = new Set<string>();
  return urls.filter((i) => (seen.has(i.url) ? false : (seen.add(i.url), true)));
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* -----------------------------
   UI helpers (same language)
------------------------------ */
function softPanel(cls?: string) {
  return [
    "rounded-3xl",
    "bg-[rgba(255,251,246,0.96)]",
    "border border-amber-950/10",
    "shadow-[0_12px_34px_-20px_rgba(17,24,39,0.22)]",
    cls ?? "",
  ].join(" ");
}

function subtlePill(cls?: string) {
  return [
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
    "bg-white/80 border border-amber-950/12",
    "text-ink-secondary",
    cls ?? "",
  ].join(" ");
}

/* -----------------------------
   Typography conventions
   (match /app/page + testimonials)
------------------------------ */
const photoTitleStyle: React.CSSProperties = {
  color: "rgb(28 34 44)",
};

const photoBodyStyle: React.CSSProperties = {
  color: "rgb(62 76 98)",
};

function payGlyph(kind: "venmo" | "cashapp" | "paypal" | "zelle" | "phone") {
  // Intentional: simple, warm, consistent “inline glyph” vibe (no plates, no boxes).
  // If you want brand-perfect later, we can swap these for react-icons used on HomeHeroSlab.
  switch (kind) {
    case "venmo":
      return "V";
    case "cashapp":
      return "$";
    case "paypal":
      return "P";
    case "zelle":
      return "Z";
    case "phone":
      return "☎";
  }
}

export default function DogDetailClient() {
  const params = useParams<{ dog: string }>();
  const dogParam = params?.dog ? String(params.dog) : "";

  const [dog, setDog] = useState<Dog | null>(null);
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // One calm message slot (no extra UI)
  const [note, setNote] = useState<string | null>(null);

  // Reserve panel (kept simple)
  const [draftName, setDraftName] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [draftMethod, setDraftMethod] = useState("");
  const [draftTxn, setDraftTxn] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Inline feedback shown right at the reservation form (not far away at the top).
  const [reserveStatus, setReserveStatus] = useState<
    { ok: boolean; text: string } | null
  >(null);

  const deposit = useMemo(
    () => moneyFromCents(dog?.deposit_amount_cents),
    [dog?.deposit_amount_cents]
  );
  const price = useMemo(
    () => moneyFromCents(dog?.price_amount_cents),
    [dog?.price_amount_cents]
  );

  // Payment options the owner has actually configured — used to turn the
  // free-text "payment method" field into a simple, mistake-proof dropdown.
  const paymentMethods = useMemo(() => {
    const list: string[] = [];
    if (merchant?.venmo_url) list.push("Venmo");
    if (merchant?.cashapp_url) list.push("Cash App");
    if (merchant?.paypal_url) list.push("PayPal");
    if (merchant?.zelle_recipient) list.push("Zelle");
    return list;
  }, [
    merchant?.venmo_url,
    merchant?.cashapp_url,
    merchant?.paypal_url,
    merchant?.zelle_recipient,
  ]);

  const images = useMemo(() => allImages(dog), [dog]);
  const primary = useMemo(() => bestPrimaryImage(dog), [dog]);
  const selected = selectedImage || primary;

  const currentIndex = useMemo(() => {
    const idx = images.findIndex((i) => i.url === selected);
    return idx < 0 ? 0 : idx;
  }, [images, selected]);

  function stepImage(delta: number) {
    if (images.length < 2) return;
    const next = (currentIndex + delta + images.length) % images.length;
    setSelectedImage(images[next].url);
  }

  // Touch swipe support for the main viewer (phones/tablets). We track the
  // horizontal travel of a single touch and advance the gallery when the swipe
  // clears a small threshold, so the gallery feels native on mobile.
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // Only treat as a swipe when the gesture is mostly horizontal, so vertical
    // page scrolling is never hijacked.
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      stepImage(dx < 0 ? 1 : -1);
    }
  }

  const phone = merchant?.phone?.trim() || null;
  const smsHref = phone ? `sms:${phone}` : null;
  const telHref = phone ? `tel:${phone}` : null;

  useEffect(() => {
    if (!dogParam) return;
    let alive = true;

    async function fetchDog(query: string): Promise<Dog | null> {
      const res = await fetch(`/api/public/dogs?${query}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) return null;
      return (json.dog as Dog) ?? null;
    }

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Merchant profile + dog (by slug, then fall back to id) in parallel.
        const [merchRes, bySlug] = await Promise.all([
          fetch("/api/public/merchant-profile", { cache: "no-store" })
            .then((r) => r.json())
            .catch(() => null),
          fetchDog(`slug=${encodeURIComponent(dogParam)}`),
        ]);

        if (!alive) return;
        setMerchant(merchRes?.ok ? (merchRes.profile as MerchantProfile) ?? null : null);

        let full = bySlug;
        if (!full) {
          full = await fetchDog(`id=${encodeURIComponent(dogParam)}`);
          if (!alive) return;
        }

        if (!full) {
          setDog(null);
          setSelectedImage(null);
          return;
        }

        setDog(full);
        setSelectedImage(full.cover_image_url || full.images?.[0]?.url || null);
      } catch (e: any) {
        if (alive) {
          setError(e?.message || "Could not load this puppy.");
          setDog(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [dogParam]);

  async function submitReservationRequest() {
    if (!dog) return;

    const buyer_name = draftName.trim();
    const buyer_phone = draftPhone.trim();
    const payment_method = draftMethod.trim();

    if (!buyer_name || !buyer_phone || !payment_method) {
      setReserveStatus({
        ok: false,
        text: "Please add your name, phone, and payment method.",
      });
      return;
    }

    setSubmitting(true);
    setReserveStatus(null);

    const payload = {
      dog_id: dog.id,
      buyer_name,
      buyer_phone,
      buyer_email: null,
      payment_method,
      transaction_id: draftTxn.trim() ? draftTxn.trim() : null,
      note: draftMessage.trim() ? draftMessage.trim() : null,
    };

    try {
      const res = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok) {
        setReserveStatus({
          ok: false,
          text: json?.error || "Could not submit your request. Please try again.",
        });
        setSubmitting(false);
        return;
      }

      setReserveStatus({
        ok: true,
        text: "Request sent! Text or call to confirm your reservation.",
      });
      setSubmitting(false);

      setDraftName("");
      setDraftPhone("");
      setDraftMethod("");
      setDraftTxn("");
      setDraftMessage("");
    } catch (e: any) {
      setReserveStatus({
        ok: false,
        text: e?.message || "Could not submit your request. Please try again.",
      });
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen">
      <LandingHeader pupsAnchorId="pups" cta={{ label: "All puppies →", href: "/dogs" }} />

      <Container size="xl" className="pb-12 sm:pb-14 lg:pb-16">
        {/* Header area stays OUTSIDE the fade container */}
        <section className="mt-8 sm:mt-10">
          <div className="max-w-[86ch]">
            <div className="flex items-center gap-3">
              {dog?.status ? (
                <span className={subtlePill()}>
                  Status:{" "}
                  <span className="font-extrabold text-ink-primary">{dog.status}</span>
                </span>
              ) : null}
            </div>

            <h1
              className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={photoTitleStyle}
            >
              {loading ? "Loading puppy…" : dog?.name ?? "Puppy details"}
            </h1>

            <div
              className="mt-2 h-[2px] w-[132px] rounded-full opacity-95 shadow-[0_10px_28px_rgba(12,16,22,0.16)] motion-reduce:animate-none animate-[woofSheen_10s_ease-in-out_infinite]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,206,160,0.78), rgba(216,232,255,0.56), rgba(255,206,160,0.74))",
                backgroundSize: "220% 100%",
              }}
              aria-hidden
            />

            <p className="mt-3 text-sm sm:text-base leading-relaxed" style={photoBodyStyle}>
              Tap photos, review details, then reserve with a deposit and a quick text/call.
            </p>

            {note ? (
              <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink-primary border border-amber-950/12 shadow-[0_8px_24px_-16px_rgba(17,24,39,0.3)]">
                {note}
              </div>
            ) : null}

            {error ? (
              <p
                className="mt-2 text-xs leading-relaxed"
                style={{ ...photoBodyStyle, opacity: 0.82 }}
              >
                Couldn’t load some database images. ({error})
              </p>
            ) : null}
          </div>
        </section>

        {/* Fade container starts at hero image */}
        <section className="mt-7 sm:mt-8 lg:mt-10">
          <div className="relative">
            {/* ambient glow layer */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-[44px] opacity-[0.95]"
              style={{
                background:
                  "radial-gradient(1100px 520px at 18% 0%, rgba(255,255,255,0.20), transparent 62%)," +
                  "radial-gradient(980px 520px at 92% 10%, rgba(216,232,255,0.16), transparent 66%)," +
                  "radial-gradient(1200px 640px at 50% 100%, rgba(255,206,160,0.12), transparent 72%)",
              }}
            />

            {/* showroom shell */}
            <div
              className={[
                "relative rounded-3xl sm:rounded-[44px]",
                "bg-[rgba(255,250,244,0.92)]",
                "border border-amber-950/10",
                "shadow-[0_16px_44px_-30px_rgba(17,24,39,0.4)]",
                "p-3 sm:p-4 lg:p-5",
              ].join(" ")}
            >
              {loading ? (
                <div className={softPanel("p-6")}>
                  <div className="h-7 w-1/3 rounded bg-black/10 animate-pulse" />
                  <div className="mt-4 h-[420px] rounded-2xl bg-black/10 animate-pulse" />
                  <div className="mt-5 h-4 w-2/3 rounded bg-black/10 animate-pulse" />
                </div>
              ) : !dog ? (
                <div className={softPanel("p-6")}>
                  <div className="text-lg font-extrabold text-ink-primary">Puppy not found</div>
                  <div className="mt-2 text-sm text-ink-secondary">Try another link.</div>
                </div>
              ) : (
                <>
                  {/* HERO ROW */}
                  <div className="grid gap-5 lg:grid-cols-12 lg:gap-6 lg:items-start">
                    {/* Left: gallery */}
                    <section className="lg:col-span-8">
                      <div className={softPanel("overflow-hidden")}>
                        <div className="group/gallery relative w-full select-none overflow-hidden bg-[linear-gradient(to_bottom,rgba(255,236,218,0.90),rgba(255,255,255,0.60))]">
                          {/* Height is capped so the viewer is never gigantic on phones,
                              and scales up gracefully on larger screens.
                              `touch-pan-y` keeps vertical page scroll natural while we
                              handle horizontal swipes ourselves. */}
                          <div
                            className="relative h-[clamp(240px,52vh,460px)] touch-pan-y lg:h-[clamp(360px,52vh,580px)]"
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                          >
                            {selected ? (
                              <>
                                {/* Blurred backdrop fills the letterbox bands left by
                                    object-contain so photos of any ratio look intentional. */}
                                <Image
                                  src={selected}
                                  alt=""
                                  aria-hidden
                                  fill
                                  sizes="(max-width: 1024px) 100vw, 66vw"
                                  className="object-cover scale-110 blur-2xl opacity-40"
                                  draggable={false}
                                />
                                <Image
                                  src={selected}
                                  alt={dog.name}
                                  fill
                                  priority
                                  sizes="(max-width: 1024px) 100vw, 66vw"
                                  className="relative object-contain"
                                  draggable={false}
                                />
                              </>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-amber-950/85">
                                No photo available
                              </div>
                            )}

                            {/* Prev / next controls (only when there's more than one).
                                Sized to a 44px touch target so they're easy to tap on phones. */}
                            {images.length > 1 ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => stepImage(-1)}
                                  aria-label="Previous photo"
                                  className="absolute left-2 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white/80 text-ink-primary border border-amber-950/12 shadow-soft backdrop-blur-sm transition hover:bg-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-meadow-500 sm:left-3"
                                >
                                  <span aria-hidden className="text-xl leading-none">‹</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => stepImage(1)}
                                  aria-label="Next photo"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white/80 text-ink-primary border border-amber-950/12 shadow-soft backdrop-blur-sm transition hover:bg-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-meadow-500 sm:right-3"
                                >
                                  <span aria-hidden className="text-xl leading-none">›</span>
                                </button>
                              </>
                            ) : null}
                          </div>

                          {/* Photo counter */}
                          {images.length > 0 ? (
                            <div className="absolute right-3 top-3">
                              <span className="inline-flex items-center rounded-full bg-black/45 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                                {currentIndex + 1} / {images.length}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {/* thumbnails — horizontally scrollable with snap + momentum
                            scrolling so the strip is comfortable to flick through on phones. */}
                        {images.length > 1 ? (
                          <div className="border-t border-amber-950/8 bg-[rgba(255,248,242,0.62)] p-3 sm:p-4">
                            <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
                              {images.map((img, i) => {
                                const active = img.url === selected;
                                return (
                                  <button
                                    type="button"
                                    key={img.url}
                                    onClick={() => setSelectedImage(img.url)}
                                    className={[
                                      "shrink-0 snap-start relative overflow-hidden rounded-xl transition",
                                      "focus:outline-none focus:ring-2 focus:ring-meadow-500 focus:ring-offset-1",
                                      active
                                        ? "ring-2 ring-meadow-500 ring-offset-1"
                                        : "ring-1 ring-black/10 hover:ring-black/25 opacity-80 hover:opacity-100",
                                    ].join(" ")}
                                    aria-label={`Show photo ${i + 1}`}
                                    aria-current={active ? "true" : undefined}
                                  >
                                    <div className="relative h-[60px] w-[76px] sm:h-[72px] sm:w-24 bg-[linear-gradient(to_bottom,rgba(255,236,218,0.90),rgba(255,255,255,0.60))]">
                                      <Image
                                        src={img.url}
                                        alt={img.alt}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                        draggable={false}
                                      />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    {/* Right: calm info rail */}
                    <section className="lg:col-span-4">
                      <div className={softPanel("p-6")}>
                        <div>
                          <div className="text-sm text-ink-secondary">
                            {[
                              dog.breed ? dog.breed : null,
                              dog.age_weeks != null ? `${dog.age_weeks} weeks` : null,
                              dog.sex ? dog.sex : null,
                              dog.color ? dog.color : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>

                          {dog.ready_date ? (
                            <div className="mt-2 text-sm text-ink-secondary">
                              Ready:{" "}
                              <span className="font-extrabold text-ink-primary">
                                {formatDate(dog.ready_date)}
                              </span>
                            </div>
                          ) : null}

                          {deposit || price ? (
                            <div className="mt-5 flex flex-wrap gap-2">
                              {deposit ? (
                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-ink-primary border border-emerald-950/10">
                                  Deposit {deposit}
                                </span>
                              ) : null}
                              {price ? (
                                <span className="rounded-full bg-amber-500/12 px-3 py-1 text-xs font-semibold text-ink-primary border border-amber-950/10">
                                  Total {price}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-5">
                          <div>
                            {dog.description ? (
                              <p className="text-sm leading-relaxed text-ink-secondary">
                                {dog.description}
                              </p>
                            ) : null}

                            {/* Reserve block */}
                            <div className="mt-5 rounded-2xl bg-white/60 p-4 border border-amber-950/10">
                              <div className="text-sm font-extrabold text-ink-primary">
                                Reserve this puppy
                              </div>
                              <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
                                Send the deposit using one of the methods below, then text/call to
                                confirm.
                              </p>

                              {/* Payment rows */}
                              <div className="mt-4 space-y-2">
                                {merchant?.venmo_url ? (
                                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/55 px-3 py-2 border border-amber-950/10">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className="grid h-7 w-7 place-items-center rounded-xl bg-[rgba(255,240,225,0.72)] border border-amber-950/12 text-xs font-black text-amber-950">
                                        {payGlyph("venmo")}
                                      </span>
                                      <a
                                        href={merchant.venmo_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="min-w-0 truncate text-sm font-semibold text-ink-primary underline decoration-black/15 hover:decoration-black/30"
                                      >
                                        Venmo
                                      </a>
                                    </div>
                                    <button
                                      onClick={async () => {
                                        const ok = await copyToClipboard(merchant.venmo_url || "");
                                        setNote(ok ? "Venmo link copied." : "Couldn’t copy.");
                                      }}
                                      className="rounded-full px-3 py-1 text-xs font-semibold bg-white/70 border border-amber-950/12 hover:border-amber-950/18"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                ) : null}

                                {merchant?.cashapp_url ? (
                                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/55 px-3 py-2 border border-amber-950/10">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className="grid h-7 w-7 place-items-center rounded-xl bg-[rgba(255,240,225,0.72)] border border-amber-950/12 text-xs font-black text-amber-950">
                                        {payGlyph("cashapp")}
                                      </span>
                                      <a
                                        href={merchant.cashapp_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="min-w-0 truncate text-sm font-semibold text-ink-primary underline decoration-black/15 hover:decoration-black/30"
                                      >
                                        Cash App
                                      </a>
                                    </div>
                                    <button
                                      onClick={async () => {
                                        const ok = await copyToClipboard(merchant.cashapp_url || "");
                                        setNote(ok ? "Cash App link copied." : "Couldn’t copy.");
                                      }}
                                      className="rounded-full px-3 py-1 text-xs font-semibold bg-white/70 border border-amber-950/12 hover:border-amber-950/18"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                ) : null}

                                {merchant?.paypal_url ? (
                                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/55 px-3 py-2 border border-amber-950/10">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className="grid h-7 w-7 place-items-center rounded-xl bg-[rgba(255,240,225,0.72)] border border-amber-950/12 text-xs font-black text-amber-950">
                                        {payGlyph("paypal")}
                                      </span>
                                      <a
                                        href={merchant.paypal_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="min-w-0 truncate text-sm font-semibold text-ink-primary underline decoration-black/15 hover:decoration-black/30"
                                      >
                                        PayPal
                                      </a>
                                    </div>
                                    <button
                                      onClick={async () => {
                                        const ok = await copyToClipboard(merchant.paypal_url || "");
                                        setNote(ok ? "PayPal link copied." : "Couldn’t copy.");
                                      }}
                                      className="rounded-full px-3 py-1 text-xs font-semibold bg-white/70 border border-amber-950/12 hover:border-amber-950/18"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                ) : null}

                                {merchant?.zelle_recipient ? (
                                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/55 px-3 py-2 border border-amber-950/10">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className="grid h-7 w-7 place-items-center rounded-xl bg-[rgba(255,240,225,0.72)] border border-amber-950/12 text-xs font-black text-amber-950">
                                        {payGlyph("zelle")}
                                      </span>
                                      <div className="min-w-0">
                                        <div className="text-sm font-semibold text-ink-primary">
                                          Zelle
                                        </div>
                                        <div className="truncate text-xs text-ink-secondary">
                                          {merchant.zelle_recipient}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={async () => {
                                        const ok = await copyToClipboard(merchant.zelle_recipient || "");
                                        setNote(ok ? "Zelle recipient copied." : "Couldn’t copy.");
                                      }}
                                      className="rounded-full px-3 py-1 text-xs font-semibold bg-white/70 border border-amber-950/12 hover:border-amber-950/18"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                ) : null}
                              </div>

                              {/* Primary actions */}
                              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                <a
                                  href={smsHref ?? undefined}
                                  className={[
                                    "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold",
                                    "bg-[rgba(34,40,50,0.92)] text-[rgba(255,248,242,0.98)]",
                                    "hover:bg-[rgba(34,40,50,1)] transition",
                                    phone ? "" : "opacity-50 pointer-events-none",
                                  ].join(" ")}
                                >
                                  Text to reserve
                                </a>

                                <a
                                  href={telHref ?? undefined}
                                  className={[
                                    "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold",
                                    "bg-white/70 border border-amber-950/12 text-ink-primary",
                                    "hover:border-amber-950/18 transition",
                                    phone ? "" : "opacity-50 pointer-events-none",
                                  ].join(" ")}
                                >
                                  Call
                                </a>
                              </div>

                              {/* Optional request */}
                              <div className="mt-5 border-t border-amber-950/10 pt-4">
                                <div className="text-sm font-extrabold text-ink-primary">
                                  Send a quick request
                                </div>
                                <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                                  Optional — let us know you sent a deposit and we'll confirm
                                  your reservation by text or call.
                                </p>

                                <div className="mt-3 grid gap-3">
                                  <div>
                                    <label
                                      htmlFor="rsv-name"
                                      className="mb-1 block text-xs font-bold text-ink-secondary"
                                    >
                                      Your name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                      id="rsv-name"
                                      value={draftName}
                                      onChange={(e) => setDraftName(e.target.value)}
                                      autoComplete="name"
                                      placeholder="Jane Doe"
                                      className="w-full rounded-xl bg-white px-4 py-3 text-sm text-ink-primary ring-1 ring-amber-950/15 outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-meadow-500"
                                    />
                                  </div>

                                  <div>
                                    <label
                                      htmlFor="rsv-phone"
                                      className="mb-1 block text-xs font-bold text-ink-secondary"
                                    >
                                      Your phone <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                      id="rsv-phone"
                                      value={draftPhone}
                                      onChange={(e) => setDraftPhone(e.target.value)}
                                      type="tel"
                                      inputMode="tel"
                                      autoComplete="tel"
                                      placeholder="(555) 123-4567"
                                      className="w-full rounded-xl bg-white px-4 py-3 text-sm text-ink-primary ring-1 ring-amber-950/15 outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-meadow-500"
                                    />
                                  </div>

                                  <div>
                                    <label
                                      htmlFor="rsv-method"
                                      className="mb-1 block text-xs font-bold text-ink-secondary"
                                    >
                                      Payment method <span className="text-rose-500">*</span>
                                    </label>
                                    {paymentMethods.length > 0 ? (
                                      <select
                                        id="rsv-method"
                                        value={draftMethod}
                                        onChange={(e) => setDraftMethod(e.target.value)}
                                        className="w-full rounded-xl bg-white px-4 py-3 text-sm text-ink-primary ring-1 ring-amber-950/15 outline-none focus:ring-2 focus:ring-meadow-500"
                                      >
                                        <option value="">Select how you paid…</option>
                                        {paymentMethods.map((m) => (
                                          <option key={m} value={m}>
                                            {m}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        id="rsv-method"
                                        value={draftMethod}
                                        onChange={(e) => setDraftMethod(e.target.value)}
                                        placeholder="e.g. Venmo, Cash App, Zelle"
                                        className="w-full rounded-xl bg-white px-4 py-3 text-sm text-ink-primary ring-1 ring-amber-950/15 outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-meadow-500"
                                      />
                                    )}
                                  </div>

                                  <div>
                                    <label
                                      htmlFor="rsv-txn"
                                      className="mb-1 block text-xs font-bold text-ink-secondary"
                                    >
                                      Payment confirmation / handle{" "}
                                      <span className="font-semibold text-ink-muted">(optional)</span>
                                    </label>
                                    <input
                                      id="rsv-txn"
                                      value={draftTxn}
                                      onChange={(e) => setDraftTxn(e.target.value)}
                                      placeholder="Transaction ID or your @handle"
                                      className="w-full rounded-xl bg-white px-4 py-3 text-sm text-ink-primary ring-1 ring-amber-950/15 outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-meadow-500"
                                    />
                                  </div>

                                  <div>
                                    <label
                                      htmlFor="rsv-msg"
                                      className="mb-1 block text-xs font-bold text-ink-secondary"
                                    >
                                      Message{" "}
                                      <span className="font-semibold text-ink-muted">(optional)</span>
                                    </label>
                                    <textarea
                                      id="rsv-msg"
                                      value={draftMessage}
                                      onChange={(e) => setDraftMessage(e.target.value)}
                                      placeholder="Anything you'd like us to know…"
                                      className="min-h-[88px] w-full rounded-xl bg-white px-4 py-3 text-sm text-ink-primary ring-1 ring-amber-950/15 outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-meadow-500"
                                    />
                                  </div>

                                  {reserveStatus ? (
                                    <div
                                      role="status"
                                      aria-live="polite"
                                      className={[
                                        "flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm font-semibold",
                                        reserveStatus.ok
                                          ? "bg-emerald-500/12 text-emerald-900 border border-emerald-600/20"
                                          : "bg-rose-500/10 text-rose-900 border border-rose-600/20",
                                      ].join(" ")}
                                    >
                                      <span aria-hidden className="mt-px text-base leading-none">
                                        {reserveStatus.ok ? "✓" : "!"}
                                      </span>
                                      <span>{reserveStatus.text}</span>
                                    </div>
                                  ) : null}

                                  <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={submitReservationRequest}
                                    className={[
                                      "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold text-white",
                                      "bg-[linear-gradient(90deg,rgba(34,141,74,1)_0%,rgba(44,121,230,0.95)_120%)]",
                                      "shadow-[0_14px_34px_-20px_rgba(17,24,39,0.6)] transition hover:brightness-105",
                                      submitting ? "opacity-60 cursor-not-allowed" : "",
                                    ].join(" ")}
                                  >
                                    {submitting ? "Sending…" : "Send request"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </Container>

      <SiteFooter />

      <style jsx global>{`
        @keyframes woofSheen {
          0% {
            background-position: 0% 50%;
            filter: saturate(1) brightness(1);
          }
          50% {
            background-position: 100% 50%;
            filter: saturate(1.05) brightness(1.03);
          }
          100% {
            background-position: 0% 50%;
            filter: saturate(1) brightness(1);
          }
        }
      `}</style>
    </main>
  );
}
