"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useTestimonials } from "@/hooks/useTestimonials";
import type { Testimonial } from "@/types/testimonials";

type SubmitDraft = {
  author_name: string;
  author_location: string;
  rating: number;
  message: string;
  photo_url: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function Stars({ value }: { value: number | null }) {
  const v = clamp(value ?? 0, 0, 5);
  return (
    <div className="flex items-center gap-1" aria-label={`${v} star rating`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const on = i < v;
        return (
          <span
            key={i}
            className={[
              "text-sm",
              on ? "opacity-100" : "opacity-25",
            ].join(" ")}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

function firstImage(t: Testimonial) {
  return t.images?.[0]?.url || null;
}

export function TestimonialsSection() {
  const { testimonials, loading, error, refetch } = useTestimonials({
    statuses: ["approved"], // RLS will also enforce this
  });

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [submitOk, setSubmitOk] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const [draft, setDraft] = useState<SubmitDraft>({
    author_name: "",
    author_location: "",
    rating: 5,
    message: "",
    photo_url: "",
  });

  const visible = useMemo(() => testimonials ?? [], [testimonials]);

  async function submit() {
    setSubmitOk(null);
    setSubmitErr(null);

    const payload = {
      status: "pending",
      author_name: draft.author_name.trim(),
      author_location: draft.author_location.trim()
        ? draft.author_location.trim()
        : null,
      rating: draft.rating ? clamp(draft.rating, 1, 5) : null,
      message: draft.message.trim(),
      dog_id: null as string | null,
    };

    if (!payload.author_name) {
      setSubmitErr("Please enter your name.");
      return;
    }
    if (!payload.message) {
      setSubmitErr("Please write a short message.");
      return;
    }

    setSubmitting(true);

    // 1) Insert testimonial
    const { data: inserted, error: insertErr } = await supabase
      .from("testimonials")
      .insert(payload)
      .select("id")
      .single();

    if (insertErr) {
      setSubmitting(false);
      setSubmitErr(insertErr.message);
      return;
    }

    // 2) Optional: attach photo URL (no storage yet)
    const photoUrl = draft.photo_url.trim();
    if (photoUrl) {
      const { error: imgErr } = await supabase.from("testimonial_images").insert({
        testimonial_id: inserted.id,
        url: photoUrl,
        alt: `${payload.author_name}'s photo`,
        sort_order: 0,
      });

      if (imgErr) {
        // Non-fatal: testimonial was created
        setSubmitting(false);
        setSubmitOk(
          "Thanks! Your review was submitted. (Your photo link couldn’t be saved—no worries.)"
        );
        setDraft({
          author_name: "",
          author_location: "",
          rating: 5,
          message: "",
          photo_url: "",
        });
        return;
      }
    }

    setSubmitting(false);
    setSubmitOk("Thanks! Your review was submitted and will appear once approved.");
    setDraft({
      author_name: "",
      author_location: "",
      rating: 5,
      message: "",
      photo_url: "",
    });

    // Doesn’t change approved list immediately (pending), but keeps UI fresh
    await refetch();
  }

  return (
    <section className="mt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Happy families
          </h2>
          <p className="mt-2 text-sm opacity-80">
            Little notes from people who adopted and took a puppy home.
          </p>
        </div>

        <button
          onClick={() => {
            setSubmitOk(null);
            setSubmitErr(null);
            setOpen(true);
          }}
          className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold bg-black/90 text-white hover:bg-black transition"
        >
          Leave a review
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white/60 p-5 ring-1 ring-black/10"
              >
                <div className="h-4 w-1/2 rounded bg-black/10 animate-pulse" />
                <div className="mt-3 h-16 rounded bg-black/10 animate-pulse" />
                <div className="mt-3 h-4 w-1/3 rounded bg-black/10 animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white/60 p-5 ring-1 ring-black/10">
            <div className="text-sm font-bold">Couldn’t load testimonials</div>
            <div className="mt-1 text-sm opacity-80">{error}</div>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl bg-white/60 p-5 ring-1 ring-black/10">
            <div className="text-sm font-semibold">
              No reviews yet — be the first ❤️
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((t) => {
              const img = firstImage(t);
              return (
                <article
                  key={t.id}
                  className="overflow-hidden rounded-3xl bg-white/70 ring-1 ring-black/10 backdrop-blur"
                >
                  {img && (
                    <div className="h-44 w-full overflow-hidden">
                      <img
                        src={img}
                        alt={t.images?.[0]?.alt || "Adoption photo"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold">
                          {t.author_name}
                        </div>
                        {t.author_location && (
                          <div className="text-xs opacity-70">
                            {t.author_location}
                          </div>
                        )}
                      </div>
                      <Stars value={t.rating} />
                    </div>

                    <p className="mt-3 text-sm leading-relaxed opacity-90">
                      {t.message}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            aria-label="Close modal"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white/85 p-6 ring-1 ring-black/10 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-extrabold">Leave a review</div>
                <div className="mt-1 text-sm opacity-75">
                  Short + honest is perfect. Photos optional.
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1 text-sm font-bold ring-1 ring-black/10 hover:ring-black/20"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <input
                value={draft.author_name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, author_name: e.target.value }))
                }
                placeholder="Your name *"
                className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
              />

              <input
                value={draft.author_location}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, author_location: e.target.value }))
                }
                placeholder="City / State (optional)"
                className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
              />

              <div className="grid gap-2">
                <div className="text-sm font-bold">Rating</div>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, rating: n }))}
                      className={[
                        "rounded-full px-3 py-2 text-sm font-bold ring-1 transition",
                        draft.rating === n
                          ? "bg-black/90 text-white ring-black/10"
                          : "bg-white/70 ring-black/10 hover:ring-black/20",
                      ].join(" ")}
                    >
                      {n}★
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={draft.message}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, message: e.target.value }))
                }
                placeholder="Write your message *"
                className="min-h-[120px] w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
              />

              <input
                value={draft.photo_url}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, photo_url: e.target.value }))
                }
                placeholder="Photo URL (optional for now)"
                className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-black/20"
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

              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold bg-white/70 ring-1 ring-black/10 hover:ring-black/15 transition"
                >
                  Cancel
                </button>

                <button
                  disabled={submitting}
                  onClick={submit}
                  className={[
                    "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold",
                    "bg-black/90 text-white hover:bg-black transition",
                    submitting ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {submitting ? "Submitting..." : "Submit review"}
                </button>
              </div>

              <p className="text-xs opacity-70">
                Reviews are manually approved to prevent spam. ❤️
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
