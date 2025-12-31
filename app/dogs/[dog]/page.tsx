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

  // De-dupe by URL
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

export default function DogDetailPage() {
  const params = useParams<{ dog: string }>();
  const router = useRouter();

  const dogParam = params?.dog;

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

  const phone = merchant?.phone?.trim() || null;
  const smsHref = phone ? `sms:${phone}` : null;
  const telHref = phone ? `tel:${phone}` : null;

  const images = useMemo(() => allImages(dog), [dog]);
  const primary = useMemo(() => bestPrimaryImage(dog), [dog]);

  useEffect(() => {
    if (!dogParam) return;

    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      // 1) Load merchant (single tenant: grab latest row)
      // Important: in Supabase v2 typing, treat this as an array result and take [0].
      const merchantReq = supabase
        .from("merchant_profile")
        .select("*")
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .returns<MerchantProfile[]>();

      // 2) Load dog row by slug first, then id fallback
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

      if (bySlug.error) {
        dogRow = null;
      } else if (bySlug.data) {
        dogRow = bySlug.data;
      } else {
        // Fallback: try ID
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

        if (byId.error) {
          dogRow = null;
        } else {
          dogRow = byId.data ?? null;
        }
      }

      const merchantRes = await merchantReq;

      if (!alive) return;

      if (merchantRes.error) {
        // Non-fatal
        setMerchant(null);
      } else {
        setMerchant(merchantRes.data?.[0] ?? null);
      }

      if (bySlug.error) {
        setError(bySlug.error.message);
        setDog(null);
        setLoading(false);
        return;
      }

      if (!dogRow) {
        setError("Puppy not found.");
        setDog(null);
        setLoading(false);
        return;
      }

      // 3) Load images for the dog
      const { data: imgData, error: imgErr } = await supabase
        .from("dog_images")
        .select("id,dog_id,url,alt,sort_order,created_at")
        .eq("dog_id", dogRow.id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<DogImage[]>();

      if (!alive) return;

      if (imgErr) {
        setError(imgErr.message);
        setDog(null);
        setLoading(false);
        return;
      }

      const full = buildDogWithImages(dogRow, imgData ?? []);
      setDog(full);

      // Default selected image
      const first = full.cover_image_url || full.images?.[0]?.url || null;
      setSelectedImage(first);

      setLoading(false);
    }

    void load();

    return () => {
      alive = false;
    };
  }, [dogParam]);

  async function submitReservation() {
    if (!dog) return;

    setSubmitting(true);
    setSubmitOk(null);
    setSubmitErr(null);

    const payload = {
      dog_id: dog.id,
      buyer_name: draft.buyer_name.trim(),
      buyer_phone: draft.buyer_phone.trim(),
      buyer_email: draft.buyer_email.trim() ? draft.buyer_email.trim() : null,
      payment_method: draft.payment_method.trim(),
      transaction_id: draft.transaction_id.trim()
        ? draft.transaction_id.trim()
        : null,
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

  const selected = selectedImage || primary;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold ring-1 ring-black/10 backdrop-blur hover:ring-black/15"
        >
          ← Back
        </button>

        {loading ? (
          <div className="rounded-3xl bg-white/60 p-6 ring-1 ring-black/10">
            <div className="h-7 w-1/3 rounded bg-black/10 animate-pulse" />
            <div className="mt-4 h-[320px] rounded-2xl bg-black/10 animate-pulse" />
            <div className="mt-5 h-4 w-2/3 rounded bg-black/10 animate-pulse" />
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white/60 p-6 ring-1 ring-black/10">
            <div className="text-lg font-bold">Couldn’t load puppy</div>
            <div className="mt-2 text-sm opacity-80">{error}</div>
          </div>
        ) : !dog ? null : (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left: gallery */}
            <section className="lg:col-span-7">
              <div className="overflow-hidden rounded-3xl bg-white/70 ring-1 ring-black/10 backdrop-blur">
                <div className="relative">
                  {selected ? (
                    <img
                      src={selected}
                      alt={dog.name}
                      className="h-[360px] w-full object-cover sm:h-[460px]"
                      loading="eager"
                    />
                  ) : (
                    <div className="h-[360px] w-full bg-black/10 sm:h-[460px]" />
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto p-4">
                    {images.map((img) => {
                      const active = img.url === selected;
                      return (
                        <button
                          key={img.url}
                          onClick={() => setSelectedImage(img.url)}
                          className={[
                            "shrink-0 overflow-hidden rounded-2xl ring-1 transition",
                            active ? "ring-black/25" : "ring-black/10 hover:ring-black/20",
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
                )}
              </div>
            </section>

            {/* Right: details + reserve */}
            <section className="lg:col-span-5">
              <div className="rounded-3xl bg-white/70 p-6 ring-1 ring-black/10 backdrop-blur">
                <h1 className="text-3xl font-bold tracking-tight">{dog.name}</h1>

                <div className="mt-3 text-sm opacity-80">
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
                  <div className="mt-2 text-sm opacity-80">
                    Ready:{" "}
                    <span className="font-semibold">{formatDate(dog.ready_date)}</span>
                  </div>
                )}

                {dog.description && (
                  <p className="mt-5 text-sm leading-relaxed opacity-90">{dog.description}</p>
                )}

                {(deposit || price) && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {deposit && (
                      <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold ring-1 ring-black/10">
                        Deposit {deposit}
                      </span>
                    )}
                    {price && (
                      <span className="rounded-full bg-amber-500/14 px-3 py-1 text-xs font-semibold ring-1 ring-black/10">
                        Total {price}
                      </span>
                    )}
                  </div>
                )}

                {/* Contact CTA */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a
                    href={smsHref ?? undefined}
                    className={[
                      "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold",
                      "bg-black/90 text-white",
                      "hover:bg-black transition",
                      phone ? "" : "opacity-50 pointer-events-none",
                    ].join(" ")}
                  >
                    Text to reserve
                  </a>

                  <a
                    href={telHref ?? undefined}
                    className={[
                      "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold",
                      "bg-white/70 ring-1 ring-black/10 backdrop-blur",
                      "hover:ring-black/15 transition",
                      phone ? "" : "opacity-50 pointer-events-none",
                    ].join(" ")}
                  >
                    Call
                  </a>
                </div>

                {/* Payment methods */}
                <div className="mt-6 rounded-2xl bg-white/55 p-4 ring-1 ring-black/10">
                  <div className="text-sm font-bold">Payment options</div>

                  <div className="mt-3 grid gap-2 text-sm">
                    {merchant?.venmo_url && (
                      <div className="flex items-center justify-between gap-3">
                        <a
                          className="font-semibold underline"
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
                          className="rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/10 hover:ring-black/15"
                        >
                          Copy link
                        </button>
                      </div>
                    )}

                    {merchant?.cashapp_url && (
                      <div className="flex items-center justify-between gap-3">
                        <a
                          className="font-semibold underline"
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
                          className="rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/10 hover:ring-black/15"
                        >
                          Copy link
                        </button>
                      </div>
                    )}

                    {merchant?.paypal_url && (
                      <div className="flex items-center justify-between gap-3">
                        <a
                          className="font-semibold underline"
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
                          className="rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/10 hover:ring-black/15"
                        >
                          Copy link
                        </button>
                      </div>
                    )}

                    {merchant?.zelle_recipient && (
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">Zelle</div>
                          <div className="text-xs opacity-80">{merchant.zelle_recipient}</div>
                        </div>
                        <button
                          onClick={async () => {
                            const ok = await copyToClipboard(merchant.zelle_recipient || "");
                            setSubmitOk(ok ? "Zelle recipient copied." : "Couldn’t copy.");
                          }}
                          className="rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/10 hover:ring-black/15"
                        >
                          Copy
                        </button>
                      </div>
                    )}

                    {phone && (
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">Phone</div>
                          <div className="text-xs opacity-80">{phone}</div>
                        </div>
                        <button
                          onClick={async () => {
                            const ok = await copyToClipboard(phone);
                            setSubmitOk(ok ? "Phone number copied." : "Couldn’t copy.");
                          }}
                          className="rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/10 hover:ring-black/15"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-xs opacity-75">
                    Deposit reserves the puppy. Text/call right after payment to confirm.
                  </p>
                </div>

                {/* Reservation request form (simple) */}
                <div className="mt-6 rounded-2xl bg-white/55 p-4 ring-1 ring-black/10">
                  <div className="text-sm font-bold">Send a reservation request</div>
                  <p className="mt-1 text-xs opacity-75">
                    This just notifies the merchant. You’ll still text/call to confirm.
                  </p>

                  <div className="mt-4 grid gap-3">
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
                      className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                    />

                    <input
                      value={draft.payment_method}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, payment_method: e.target.value }))
                      }
                      placeholder="Payment method (Venmo, Cash App, Zelle, PayPal) *"
                      className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                    />

                    <input
                      value={draft.transaction_id}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, transaction_id: e.target.value }))
                      }
                      placeholder="Transaction ID / handle (optional)"
                      className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                    />

                    <textarea
                      value={draft.note}
                      onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                      placeholder="Note (optional)"
                      className="min-h-[96px] w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
                    />

                    {submitErr && (
                      <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-900 ring-1 ring-black/10">
                        {submitErr}
                      </div>
                    )}
                    {submitOk && (
                      <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-900 ring-1 ring-black/10">
                        {submitOk}
                      </div>
                    )}

                    <button
                      disabled={submitting}
                      onClick={submitReservation}
                      className={[
                        "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold",
                        "bg-black/90 text-white hover:bg-black transition",
                        submitting ? "opacity-60 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      {submitting ? "Sending..." : "Send request"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
