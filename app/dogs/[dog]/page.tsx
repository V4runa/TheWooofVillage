"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

import type { DogImage, DogRow, Dog } from "@/types/dogs";
import type { MerchantProfile } from "@/types/merchant";

type ReservationDraft = {
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string;
  payment_method: string;
  transaction_id: string;
  note: string;
};

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
   Picsum placeholder dog
------------------------------ */
function picsum(seed: string, w: number, h: number) {
  const s = encodeURIComponent(seed);
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
}

function titleFromSlug(slug: string) {
  const clean = slug.replace(/[-_]+/g, " ").trim();
  if (!clean) return "Puppy";
  return clean
    .split(" ")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

function buildPlaceholderDog(dogParam: string): Dog {
  const seedBase = dogParam || "placeholder";
  const name = titleFromSlug(seedBase);

  const cover = picsum(`${seedBase}-cover`, 1800, 1200);

  const gallery = Array.from({ length: 7 }).map((_, i) => {
    const url = picsum(`${seedBase}-img-${i + 1}`, 1200, 900);
    return {
      id: `ph-${seedBase}-${i + 1}`,
      dog_id: `placeholder-${seedBase}`,
      url,
      alt: `${name} photo ${i + 1}`,
      sort_order: i,
      created_at: new Date().toISOString(),
    } as DogImage;
  });

  return {
    id: `placeholder-${seedBase}`,
    slug: seedBase,
    name,
    description:
      "A sweet, curious puppy with a gentle temperament. This is placeholder copy so we can judge spacing, rhythm, and readability for the detail page layout.",
    status: "available",
    deposit_amount_cents: 30000,
    price_amount_cents: 180000,
    cover_image_url: cover,
    breed: "Mini Goldendoodle (placeholder)",
    sex: "Female",
    age_weeks: 10,
    color: "Apricot",
    ready_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: gallery,
  } as unknown as Dog;
}

/* -----------------------------
   UI helpers
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

function subtleChip(cls?: string) {
  return [
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
    "bg-[rgba(255,240,225,0.72)] border border-amber-950/12",
    "text-ink-primary",
    cls ?? "",
  ].join(" ");
}

export default function DogDetailPage() {
  const params = useParams<{ dog: string }>();
  const router = useRouter();

  const dogParam = params?.dog ? String(params.dog) : "";

  const [dog, setDog] = useState<Dog | null>(null);
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [draft, setDraft] = useState<ReservationDraft>({
    buyer_name: "",
    buyer_phone: "",
    buyer_email: "",
    payment_method: "",
    transaction_id: "",
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitOk, setSubmitOk] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const deposit = useMemo(() => moneyFromCents(dog?.deposit_amount_cents), [
    dog?.deposit_amount_cents,
  ]);
  const price = useMemo(() => moneyFromCents(dog?.price_amount_cents), [
    dog?.price_amount_cents,
  ]);

  const images = useMemo(() => allImages(dog), [dog]);
  const primary = useMemo(() => bestPrimaryImage(dog), [dog]);
  const selected = selectedImage || primary;

  const isPlaceholder = Boolean(dog?.id && String(dog.id).startsWith("placeholder-"));

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

      // No real dog yet => placeholder mode (for design)
      if (!dogRow) {
        const ph = buildPlaceholderDog(dogParam);
        setDog(ph);
        setSelectedImage(ph.cover_image_url || ph.images?.[0]?.url || null);
        setLoading(false);
        setError(null);
        return;
      }

      // Load images
      const { data: imgData, error: imgErr } = await supabase
        .from("dog_images")
        .select("id,dog_id,url,alt,sort_order,created_at")
        .eq("dog_id", dogRow.id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<DogImage[]>();

      if (!alive) return;

      const imagesSafe = imgErr ? [] : imgData ?? [];
      let full = buildDogWithImages(dogRow, imagesSafe);

      // If real dog has no images, still provide placeholders so layout is testable
      const hasAnyImage = Boolean(full.cover_image_url || full.images?.length);
      if (!hasAnyImage) {
        const seed = full.slug || full.id || dogParam;
        const ph = buildPlaceholderDog(String(seed));
        full = {
          ...full,
          cover_image_url: ph.cover_image_url,
          images: ph.images,
        } as Dog;
      }

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

  async function submitReservation() {
    if (!dog) return;

    if (isPlaceholder) {
      setSubmitErr("Preview mode: add real listings to enable reservations.");
      return;
    }

    setSubmitting(true);
    setSubmitOk(null);
    setSubmitErr(null);

    const payload = {
      dog_id: dog.id,
      buyer_name: draft.buyer_name.trim(),
      buyer_phone: draft.buyer_phone.trim(),
      buyer_email: draft.buyer_email.trim() ? draft.buyer_email.trim() : null,
      payment_method: draft.payment_method.trim(),
      transaction_id: draft.transaction_id.trim() ? draft.transaction_id.trim() : null,
      note: draft.note.trim() ? draft.note.trim() : null,
    };

    if (!payload.buyer_name || !payload.buyer_phone || !payload.payment_method) {
      setSubmitErr("Please fill name, phone, and payment method.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("reservation_requests").insert(payload);

    if (error) {
      setSubmitErr(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitOk("Request sent! Now text or call to confirm your reservation.");
    setSubmitting(false);
    setDraft({
      buyer_name: "",
      buyer_phone: "",
      buyer_email: "",
      payment_method: "",
      transaction_id: "",
      note: "",
    });
  }

  // One shared "hero height" so gallery + right rail match on desktop
  const heroHeight = "lg:h-[640px]";

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 sm:pt-10">
        {/* Header row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,240,225,0.72)] px-4 py-2 text-sm font-semibold border border-amber-950/12 hover:border-amber-950/18"
            >
              ← Back
            </button>

            <a
              href="/#pups"
              className="text-sm font-semibold text-ink-secondary hover:text-ink-primary"
            >
              All puppies
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isPlaceholder && <span className={subtleChip()}>Preview mode</span>}
            {dog?.status && (
              <span className={subtleChip("bg-white/65")}>
                Status: <span className="font-extrabold">{dog.status}</span>
              </span>
            )}
          </div>
        </div>

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
            {/* HERO ROW: balanced + equal height */}
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8 lg:items-stretch">
              {/* Left: BIG gallery */}
              <section className="lg:col-span-8">
                <div className={softPanel(["overflow-hidden", heroHeight].join(" "))}>
                  <div className="relative h-[360px] sm:h-[480px] lg:h-[520px]">
                    {selected ? (
                      <img
                        src={selected}
                        alt={dog.name}
                        className="h-full w-full object-cover"
                        loading="eager"
                      />
                    ) : (
                      <div className="h-full w-full bg-black/10" />
                    )}

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-ink-primary border border-amber-950/10">
                        Photos
                      </span>

                      {images.length > 0 && (
                        <span className="inline-flex items-center rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-ink-secondary border border-amber-950/10">
                          {Math.max(
                            1,
                            images.findIndex((i) => i.url === selected) + 1
                          )}
                          /{images.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnails anchored at bottom; keeps the card height consistent */}
                  {images.length > 1 && (
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
                                "shrink-0 overflow-hidden rounded-2xl ring-1 transition",
                                active
                                  ? "ring-black/25"
                                  : "ring-black/10 hover:ring-black/18",
                              ].join(" ")}
                              aria-label="Select image"
                            >
                              <img
                                src={img.url}
                                alt={img.alt}
                                className="h-20 w-28 object-cover"
                                loading="lazy"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-3 rounded-2xl bg-white/65 px-4 py-3 text-xs text-ink-secondary border border-amber-950/10">
                    Gallery note: couldn’t load database images — showing placeholders. ({error})
                  </div>
                )}
              </section>

              {/* Right: equal-height info rail */}
              <section className="lg:col-span-4">
                <div className={softPanel(["p-6", "flex flex-col", heroHeight].join(" "))}>
                  {/* Top: name + meta */}
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">
                      {dog.name}
                    </h1>

                    <div className="mt-3 text-sm text-ink-secondary">
                      {[
                        dog.breed ? dog.breed : null,
                        dog.age_weeks != null ? `${dog.age_weeks} weeks` : null,
                        dog.sex ? dog.sex : null,
                        dog.color ? dog.color : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>

                    {dog.ready_date && (
                      <div className="mt-2 text-sm text-ink-secondary">
                        Ready:{" "}
                        <span className="font-extrabold text-ink-primary">
                          {formatDate(dog.ready_date)}
                        </span>
                      </div>
                    )}

                    {(deposit || price) && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {deposit && (
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-ink-primary border border-emerald-950/10">
                            Deposit {deposit}
                          </span>
                        )}
                        {price && (
                          <span className="rounded-full bg-amber-500/12 px-3 py-1 text-xs font-semibold text-ink-primary border border-amber-950/10">
                            Total {price}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Middle: compact description + payment list (scroll if needed, but rail height stays locked) */}
                  <div className="mt-5 flex-1 overflow-hidden">
                    <div className="h-full overflow-y-auto pr-1">
                      {dog.description && (
                        <p className="text-sm leading-relaxed text-ink-secondary">
                          {dog.description}
                        </p>
                      )}

                      {/* Payment options */}
                      <div className="mt-5 rounded-2xl bg-white/60 p-4 border border-amber-950/10">
                        <div className="text-sm font-extrabold text-ink-primary">
                          Payment options
                        </div>

                        <div className="mt-3 grid gap-2 text-sm">
                          {merchant?.venmo_url && (
                            <div className="flex items-center justify-between gap-3">
                              <a
                                className="font-semibold text-ink-primary underline decoration-black/15 hover:decoration-black/30"
                                href={merchant.venmo_url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Venmo
                              </a>
                              <button
                                onClick={async () => {
                                  const ok = await copyToClipboard(merchant.venmo_url || "");
                                  setSubmitOk(ok ? "Venmo link copied." : "Couldn’t copy.");
                                }}
                                className="rounded-full px-3 py-1 text-xs font-semibold bg-white/65 border border-amber-950/12 hover:border-amber-950/18"
                              >
                                Copy
                              </button>
                            </div>
                          )}

                          {merchant?.cashapp_url && (
                            <div className="flex items-center justify-between gap-3">
                              <a
                                className="font-semibold text-ink-primary underline decoration-black/15 hover:decoration-black/30"
                                href={merchant.cashapp_url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Cash App
                              </a>
                              <button
                                onClick={async () => {
                                  const ok = await copyToClipboard(merchant.cashapp_url || "");
                                  setSubmitOk(ok ? "Cash App link copied." : "Couldn’t copy.");
                                }}
                                className="rounded-full px-3 py-1 text-xs font-semibold bg-white/65 border border-amber-950/12 hover:border-amber-950/18"
                              >
                                Copy
                              </button>
                            </div>
                          )}

                          {merchant?.paypal_url && (
                            <div className="flex items-center justify-between gap-3">
                              <a
                                className="font-semibold text-ink-primary underline decoration-black/15 hover:decoration-black/30"
                                href={merchant.paypal_url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                PayPal
                              </a>
                              <button
                                onClick={async () => {
                                  const ok = await copyToClipboard(merchant.paypal_url || "");
                                  setSubmitOk(ok ? "PayPal link copied." : "Couldn’t copy.");
                                }}
                                className="rounded-full px-3 py-1 text-xs font-semibold bg-white/65 border border-amber-950/12 hover:border-amber-950/18"
                              >
                                Copy
                              </button>
                            </div>
                          )}

                          {merchant?.zelle_recipient && (
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="font-semibold text-ink-primary">Zelle</div>
                                <div className="text-xs text-ink-secondary">
                                  {merchant.zelle_recipient}
                                </div>
                              </div>
                              <button
                                onClick={async () => {
                                  const ok = await copyToClipboard(merchant.zelle_recipient || "");
                                  setSubmitOk(ok ? "Zelle recipient copied." : "Couldn’t copy.");
                                }}
                                className="rounded-full px-3 py-1 text-xs font-semibold bg-white/65 border border-amber-950/12 hover:border-amber-950/18"
                              >
                                Copy
                              </button>
                            </div>
                          )}

                          {phone && (
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="font-semibold text-ink-primary">Phone</div>
                                <div className="text-xs text-ink-secondary">{phone}</div>
                              </div>
                              <button
                                onClick={async () => {
                                  const ok = await copyToClipboard(phone);
                                  setSubmitOk(ok ? "Phone number copied." : "Couldn’t copy.");
                                }}
                                className="rounded-full px-3 py-1 text-xs font-semibold bg-white/65 border border-amber-950/12 hover:border-amber-950/18"
                              >
                                Copy
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 text-xs text-ink-secondary">
                          Pay the deposit, then text/call to confirm.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: primary actions (always anchored to bottom for balance) */}
                  <div className="mt-5">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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

                    <div className="mt-3 text-xs text-ink-secondary">
                      Deposit reserves the puppy. Text/call right after payment.
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* BELOW THE FOLD: reservation request (no longer destroys the hero balance) */}
            <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
              <section className="lg:col-span-8">
                <div className={softPanel("p-6")}>
                  <div className="text-lg font-extrabold text-ink-primary">
                    Reservation request
                  </div>
                  <p className="mt-1 text-sm text-ink-secondary">
                    Optional — this notifies the seller. You’ll still text/call to confirm.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <input
                      value={draft.buyer_name}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, buyer_name: e.target.value }))
                      }
                      placeholder="Your name *"
                      className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                    />
                    <input
                      value={draft.buyer_phone}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, buyer_phone: e.target.value }))
                      }
                      placeholder="Your phone *"
                      className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                    />

                    <input
                      value={draft.buyer_email}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, buyer_email: e.target.value }))
                      }
                      placeholder="Your email (optional)"
                      className="sm:col-span-2 w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                    />

                    <input
                      value={draft.payment_method}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, payment_method: e.target.value }))
                      }
                      placeholder="Payment method (Venmo, Cash App, Zelle, PayPal) *"
                      className="sm:col-span-2 w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                    />

                    <input
                      value={draft.transaction_id}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, transaction_id: e.target.value }))
                      }
                      placeholder="Transaction ID / handle (optional)"
                      className="sm:col-span-2 w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                    />

                    <textarea
                      value={draft.note}
                      onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                      placeholder="Note (optional)"
                      className="sm:col-span-2 min-h-[110px] w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                    />

                    {submitErr && (
                      <div className="sm:col-span-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-900 ring-1 ring-black/10">
                        {submitErr}
                      </div>
                    )}
                    {submitOk && (
                      <div className="sm:col-span-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-900 ring-1 ring-black/10">
                        {submitOk}
                      </div>
                    )}

                    <button
                      disabled={submitting || isPlaceholder}
                      onClick={submitReservation}
                      className={[
                        "sm:col-span-2 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold",
                        "bg-[rgba(34,40,50,0.92)] text-[rgba(255,248,242,0.98)] hover:bg-[rgba(34,40,50,1)] transition",
                        submitting ? "opacity-60 cursor-not-allowed" : "",
                        isPlaceholder ? "opacity-50 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      {isPlaceholder
                        ? "Preview mode (disabled)"
                        : submitting
                          ? "Sending..."
                          : "Send request"}
                    </button>

                    <p className="sm:col-span-2 text-xs text-ink-secondary">
                      Reviews/requests are handled manually to prevent spam. ❤️
                    </p>
                  </div>
                </div>
              </section>

              {/* Small side helper block (optional; keeps lower area balanced) */}
              <aside className="lg:col-span-4">
                <div className={softPanel("p-6")}>
                  <div className="text-sm font-extrabold text-ink-primary">
                    Quick checklist
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-ink-secondary">
                    <li>• Pay the deposit using a method above.</li>
                    <li>• Text/call immediately after payment.</li>
                    <li>• Share your name + which puppy.</li>
                    <li>• You’ll receive confirmation once reserved.</li>
                  </ul>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
