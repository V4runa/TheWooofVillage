"use client";

import * as React from "react";
import { useMemo, useState } from "react";
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
              "text-sm leading-none select-none",
              on ? "opacity-100" : "opacity-20",
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

const titleInkStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(90deg, rgba(255,236,210,0.98) 0%, rgba(248,252,255,0.96) 46%, rgba(255,226,198,0.98) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  textShadow:
    "0 24px 64px rgba(12,16,22,0.22), " +
    "0 7px 20px rgba(12,16,22,0.14), " +
    "0 1px 2px rgba(12,16,22,0.16)",
};

const subtitleInkStyle: React.CSSProperties = {
  color: "rgba(255, 236, 210, 0.82)",
  textShadow:
    "0 20px 56px rgba(12,16,22,0.20), " +
    "0 6px 18px rgba(12,16,22,0.12), " +
    "0 1px 2px rgba(12,16,22,0.14)",
};

export function TestimonialsSection() {
  const { testimonials, loading, error, refetch } = useTestimonials({
    statuses: ["approved"],
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

  const stats = useMemo(() => {
    const list = visible.filter((t) => (t.rating ?? 0) > 0);
    const count = list.length;
    const avg =
      count === 0 ? null : list.reduce((sum, t) => sum + (t.rating ?? 0), 0) / count;
    return { count: visible.length, avg: avg ? Math.round(avg * 10) / 10 : null };
  }, [visible]);

  async function submit() {
    setSubmitOk(null);
    setSubmitErr(null);

    const payload = {
      author_name: draft.author_name.trim(),
      author_location: draft.author_location.trim(),
      rating: draft.rating ? clamp(draft.rating, 1, 5) : null,
      message: draft.message.trim(),
      photo_url: draft.photo_url.trim(),
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

    try {
      const res = await fetch("/api/public/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok) {
        setSubmitting(false);
        setSubmitErr(json?.error || "Could not submit review.");
        return;
      }

      setSubmitting(false);

      if (json?.warning) {
        setSubmitOk(String(json.warning));
      } else {
        setSubmitOk("Thanks! Your review was submitted and will appear once approved.");
      }

      setDraft({
        author_name: "",
        author_location: "",
        rating: 5,
        message: "",
        photo_url: "",
      });

      await refetch();
    } catch (e: any) {
      setSubmitting(false);
      setSubmitErr(e?.message || "Could not submit review.");
    }
  }

  return (
    <section className="relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight" style={titleInkStyle}>
            Happy families
          </h2>

          <div
            className="mt-2 h-[2px] w-[140px] rounded-full opacity-95 shadow-[0_10px_28px_rgba(12,16,22,0.14)]"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,206,160,0.78), rgba(216,232,255,0.56), rgba(255,206,160,0.74))",
              backgroundSize: "220% 100%",
              animation: "woofSheenTestimonials 10s ease-in-out infinite",
            }}
            aria-hidden
          />

          <p className="mt-3 text-sm" style={subtitleInkStyle}>
            Little notes from people who adopted and took a puppy home.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs" style={subtitleInkStyle}>
            {stats.avg != null && (
              <span className="inline-flex items-center gap-2">
                <span className="font-extrabold">★ {stats.avg}</span>
                <span className="opacity-80">average</span>
              </span>
            )}
            {stats.count > 0 && (
              <span className="opacity-80">
                {stats.count} {stats.count === 1 ? "review" : "reviews"}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setSubmitOk(null);
            setSubmitErr(null);
            setOpen(true);
          }}
          className={[
            "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold",
            "transition active:translate-y-[1px]",
            "border border-amber-950/18 ring-1 ring-inset ring-white/10",
            "shadow-[0_16px_44px_-28px_rgba(17,24,39,0.46)]",
            "hover:shadow-[0_18px_54px_-30px_rgba(17,24,39,0.56)]",
          ].join(" ")}
          style={{
            background:
              "linear-gradient(180deg, rgba(255,240,224,0.92) 0%, rgba(255,232,214,0.84) 100%)",
            color: "rgb(34 40 50)",
          }}
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
                className="rounded-3xl bg-[rgba(255,252,248,0.90)] p-5 ring-1 ring-inset ring-white/20 border border-amber-950/12 shadow-[0_12px_34px_-22px_rgba(17,24,39,0.24)]"
              >
                <div className="h-4 w-1/2 rounded bg-black/10 animate-pulse" />
                <div className="mt-3 h-16 rounded bg-black/10 animate-pulse" />
                <div className="mt-3 h-4 w-1/3 rounded bg-black/10 animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-[rgba(255,248,242,0.78)] p-5 border border-amber-950/14 ring-1 ring-inset ring-white/12 shadow-[0_12px_34px_-22px_rgba(17,24,39,0.28)]">
            <div className="text-sm font-extrabold text-ink-primary">
              Couldn’t load testimonials
            </div>
            <div className="mt-1 text-sm text-ink-secondary">{error}</div>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl bg-[rgba(255,248,242,0.78)] p-5 border border-amber-950/14 ring-1 ring-inset ring-white/12 shadow-[0_12px_34px_-22px_rgba(17,24,39,0.28)]">
            <div className="text-sm font-semibold text-ink-primary">
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
                  className={[
                    "group overflow-hidden rounded-3xl",
                    "bg-[rgba(255,252,248,0.92)] border border-amber-950/12 ring-1 ring-inset ring-white/20",
                    "shadow-[0_12px_34px_-22px_rgba(17,24,39,0.26)]",
                    "transition-transform duration-200",
                    "hover:-translate-y-[2px]",
                    "hover:shadow-[0_18px_44px_-24px_rgba(17,24,39,0.34)]",
                  ].join(" ")}
                >
                  {img && (
                    <div className="relative h-44 w-full overflow-hidden">
                      <img
                        src={img}
                        alt={t.images?.[0]?.alt || "Adoption photo"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(255,248,242,0.00)] via-[rgba(255,248,242,0.00)] to-[rgba(255,248,242,0.22)]" />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold text-ink-primary">
                          {t.author_name}
                        </div>
                        {t.author_location && (
                          <div className="text-xs text-ink-secondary">
                            {t.author_location}
                          </div>
                        )}
                      </div>

                      <div className="text-ink-primary">
                        <Stars value={t.rating} />
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                      {t.message}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            aria-label="Close modal"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[rgba(255,252,248,0.98)] p-6 border border-amber-950/12 ring-1 ring-inset ring-white/20 shadow-[0_18px_52px_-26px_rgba(17,24,39,0.36)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-extrabold text-ink-primary">Leave a review</div>
                <div className="mt-1 text-sm text-ink-secondary">
                  Short + honest is perfect. Photos optional.
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1 text-sm font-extrabold border border-amber-950/18 bg-[rgba(255,248,238,0.92)] hover:bg-[rgba(255,252,248,0.98)]"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <input
                value={draft.author_name}
                onChange={(e) => setDraft((d) => ({ ...d, author_name: e.target.value }))}
                placeholder="Your name *"
                className="w-full rounded-xl bg-white/90 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-amber-300/55 focus:ring-offset-2"
              />

              <input
                value={draft.author_location}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, author_location: e.target.value }))
                }
                placeholder="City / State (optional)"
                className="w-full rounded-xl bg-white/90 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-amber-300/55 focus:ring-offset-2"
              />

              <div className="grid gap-2">
                <div className="text-sm font-extrabold text-ink-primary">Rating</div>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, rating: n }))}
                      className={[
                        "rounded-full px-3 py-2 text-sm font-extrabold border transition",
                        draft.rating === n
                          ? "bg-[rgba(34,40,50,0.92)] text-white border-black/10"
                          : "bg-[rgba(255,248,238,0.92)] text-ink-primary border-amber-950/18 hover:border-amber-950/24",
                      ].join(" ")}
                    >
                      {n}★
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={draft.message}
                onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
                placeholder="Write your message *"
                className="min-h-[120px] w-full rounded-xl bg-white/90 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-amber-300/55 focus:ring-offset-2"
              />

              <input
                value={draft.photo_url}
                onChange={(e) => setDraft((d) => ({ ...d, photo_url: e.target.value }))}
                placeholder="Photo URL (optional for now)"
                className="w-full rounded-xl bg-white/90 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-amber-300/55 focus:ring-offset-2"
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
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold bg-[rgba(255,248,238,0.92)] border border-amber-950/18 hover:bg-[rgba(255,252,248,0.98)] transition"
                >
                  Cancel
                </button>

                <button
                  disabled={submitting}
                  onClick={submit}
                  className={[
                    "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold",
                    "bg-[rgba(34,40,50,0.92)] text-white hover:bg-[rgba(34,40,50,1)] transition",
                    submitting ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {submitting ? "Submitting..." : "Submit review"}
                </button>
              </div>

              <p className="text-xs text-ink-secondary">
                Reviews are manually approved to prevent spam. ❤️
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes woofSheenTestimonials {
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
    </section>
  );
}
