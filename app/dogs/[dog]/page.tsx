"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

import { Container } from "@/components/ui/Container";
import { LandingHeader } from "@/components/landing/LandingHeader";

import type { DogImage, DogRow, Dog } from "@/types/dogs";
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

function buildDogWithImages(row: DogRow, images: DogImage[]): Dog {
  return { ...row, images };
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
    "bg-[rgba(255,248,242,0.78)]",
    "ring-1 ring-inset ring-white/20",
    "border border-amber-950/10",
    "shadow-[0_18px_44px_-28px_rgba(17,24,39,0.28)]",
    cls ?? "",
  ].join(" ");
}

function subtlePill(cls?: string) {
  return [
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
    "bg-white/65 border border-amber-950/10",
    "text-ink-secondary",
    cls ?? "",
  ].join(" ");
}

/* -----------------------------
   Typography conventions
   (match /app/page + testimonials)
------------------------------ */
const photoTitleStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(90deg, rgba(255,236,210,0.98) 0%, rgba(248,252,255,0.96) 46%, rgba(255,226,198,0.98) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  textShadow:
    "0 24px 64px rgba(12,16,22,0.26), " +
    "0 7px 20px rgba(12,16,22,0.16), " +
    "0 1px 2px rgba(12,16,22,0.18), " +
    "0 -1px 0 rgba(255,235,210,0.18)",
};

const photoBodyStyle: React.CSSProperties = {
  color: "rgba(255, 236, 210, 0.86)",
  textShadow:
    "0 22px 58px rgba(12,16,22,0.24), " +
    "0 6px 18px rgba(12,16,22,0.14), " +
    "0 1px 2px rgba(12,16,22,0.16)",
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

export default function DogDetailPage() {
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

  const deposit = useMemo(
    () => moneyFromCents(dog?.deposit_amount_cents),
    [dog?.deposit_amount_cents]
  );
  const price = useMemo(
    () => moneyFromCents(dog?.price_amount_cents),
    [dog?.price_amount_cents]
  );

  const images = useMemo(() => allImages(dog), [dog]);
  const primary = useMemo(() => bestPrimaryImage(dog), [dog]);
  const selected = selectedImage || primary;

  const phone = merchant?.phone?.trim() || null;
  const smsHref = phone ? `sms:${phone}` : null;
  const telHref = phone ? `tel:${phone}` : null;

  useEffect(() => {
    if (!dogParam) return;
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      const merchantReq = supabase
        .from("merchant_profile")
        .select("*")
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .returns<MerchantProfile[]>();

      const bySlug = await supabase
        .from("dogs")
        .select(
          [
            "id",
            "name",
            "description",
            "status",
            "deposit_amount_cents",
            "price_amount_cents",
            "cover_image_url",
            "breed",
            "sex",
            "age_weeks",
            "color",
            "ready_date",
            "sort_order",
            "slug",
            "created_at",
            "updated_at",
          ].join(",")
        )
        .eq("slug", dogParam)
        .maybeSingle()
        .returns<DogRow>();

      let dogRow: DogRow | null = null;

      if (!bySlug.error && bySlug.data) {
        dogRow = bySlug.data;
      } else {
        const byId = await supabase
          .from("dogs")
          .select(
            [
              "id",
              "name",
              "description",
              "status",
              "deposit_amount_cents",
              "price_amount_cents",
              "cover_image_url",
              "breed",
              "sex",
              "age_weeks",
              "color",
              "ready_date",
              "sort_order",
              "slug",
              "created_at",
              "updated_at",
            ].join(",")
          )
          .eq("id", dogParam)
          .maybeSingle()
          .returns<DogRow>();

        if (!byId.error && byId.data) dogRow = byId.data;
      }

      const merchantRes = await merchantReq;
      if (!alive) return;

      if (!merchantRes.error) setMerchant(merchantRes.data?.[0] ?? null);
      else setMerchant(null);

      if (!dogRow) {
        setDog(null);
        setSelectedImage(null);
        setLoading(false);
        setError(null);
        return;
      }

      const { data: imgData, error: imgErr } = await supabase
        .from("dog_images")
        .select("id,dog_id,url,alt,sort_order,created_at")
        .eq("dog_id", dogRow.id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<DogImage[]>();

      if (!alive) return;

      const imagesSafe = imgErr ? [] : imgData ?? [];
      const full = buildDogWithImages(dogRow, imagesSafe);

      setDog(full);
      setSelectedImage(full.cover_image_url || full.images?.[0]?.url || null);
      setLoading(false);

      if (imgErr) setError(imgErr.message);
      else setError(null);
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
      setNote("Please add name, phone, and payment method.");
      return;
    }

    setSubmitting(true);
    setNote(null);

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
        setNote(json?.error || "Could not submit reservation request.");
        setSubmitting(false);
        return;
      }

      setNote("Request sent. Text or call to confirm your reservation.");
      setSubmitting(false);

      setDraftName("");
      setDraftPhone("");
      setDraftMethod("");
      setDraftTxn("");
      setDraftMessage("");
    } catch (e: any) {
      setNote(e?.message || "Could not submit reservation request.");
      setSubmitting(false);
    }
  }

  // Equal height on desktop
  const heroHeight = "lg:h-[640px]";

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
              <div className="mt-3 rounded-2xl bg-white/60 px-4 py-3 text-xs text-ink-secondary border border-amber-950/10">
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
                "relative rounded-[44px]",
                "bg-[rgba(255,248,242,0.62)]",
                "border border-amber-950/14",
                "ring-1 ring-inset ring-white/12",
                "shadow-[0_18px_52px_-36px_rgba(17,24,39,0.55)]",
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
                  <div className="grid gap-5 lg:grid-cols-12 lg:gap-6 lg:items-stretch">
                    {/* Left: gallery */}
                    <section className="lg:col-span-8">
                      <div className={softPanel("overflow-hidden")}>
                        <div className="relative w-full overflow-hidden bg-[linear-gradient(to_bottom,rgba(255,236,218,0.90),rgba(255,255,255,0.60))]">
                          <div className="aspect-[4/3] lg:aspect-[3/2] flex items-center justify-center">
                            {selected ? (
                              <img
                                src={selected}
                                alt={dog.name}
                                className="max-h-full max-w-full w-auto h-auto object-contain"
                                loading="eager"
                              />
                            ) : (
                              <div className="text-sm font-semibold text-amber-950/85">
                                No photo available
                              </div>
                            )}
                          </div>

                          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-ink-primary border border-amber-950/10">
                              Photos
                            </span>
                            {images.length > 0 ? (
                              <span className="inline-flex items-center rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-ink-secondary border border-amber-950/10">
                                {Math.max(1, images.findIndex((i) => i.url === selected) + 1)}/
                                {images.length}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* thumbnails */}
                        {images.length > 1 ? (
                          <div className="relative border-t border-amber-950/8 bg-[rgba(255,248,242,0.62)] p-4">
                            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[rgba(255,248,242,0.95)] to-transparent" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[rgba(255,248,242,0.95)] to-transparent" />

                            <div className="flex gap-3 overflow-x-auto pr-6">
                              {images.map((img) => {
                                const active = img.url === selected;
                                return (
                                  <button
                                    key={img.url}
                                    onClick={() => setSelectedImage(img.url)}
                                    className={[
                                      "shrink-0 relative overflow-hidden rounded-2xl ring-1 transition bg-[linear-gradient(to_bottom,rgba(255,236,218,0.90),rgba(255,255,255,0.60))]",
                                      active ? "ring-black/25" : "ring-black/10 hover:ring-black/18",
                                    ].join(" ")}
                                    aria-label="Select image"
                                  >
                                    <div className="aspect-[4/3] w-28 flex items-center justify-center">
                                      <img
                                        src={img.url}
                                        alt={img.alt}
                                        className="max-h-full max-w-full w-auto h-auto object-contain"
                                        loading="lazy"
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
                      <div className={softPanel(["p-6", "flex flex-col", heroHeight].join(" "))}>
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

                        <div className="mt-5 flex-1 overflow-hidden">
                          <div className="h-full overflow-y-auto pr-1">
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
                              <div className="mt-4">
                                <div className="text-xs font-semibold text-ink-secondary">
                                  Optional: send a quick request
                                </div>

                                <div className="mt-2 grid gap-3">
                                  <input
                                    value={draftName}
                                    onChange={(e) => setDraftName(e.target.value)}
                                    placeholder="Your name *"
                                    className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                                  />
                                  <input
                                    value={draftPhone}
                                    onChange={(e) => setDraftPhone(e.target.value)}
                                    placeholder="Your phone *"
                                    className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                                  />
                                  <input
                                    value={draftMethod}
                                    onChange={(e) => setDraftMethod(e.target.value)}
                                    placeholder="Payment method *"
                                    className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                                  />
                                  <input
                                    value={draftTxn}
                                    onChange={(e) => setDraftTxn(e.target.value)}
                                    placeholder="Transaction ID / handle (optional)"
                                    className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                                  />
                                  <textarea
                                    value={draftMessage}
                                    onChange={(e) => setDraftMessage(e.target.value)}
                                    placeholder="Message (optional)"
                                    className="min-h-[96px] w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                                  />

                                  <button
                                    disabled={submitting}
                                    onClick={submitReservationRequest}
                                    className={[
                                      "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold",
                                      "bg-[rgba(34,40,50,0.92)] text-[rgba(255,248,242,0.98)] hover:bg-[rgba(34,40,50,1)] transition",
                                      submitting ? "opacity-60 cursor-not-allowed" : "",
                                    ].join(" ")}
                                  >
                                    {submitting ? "Sending..." : "Send request"}
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
