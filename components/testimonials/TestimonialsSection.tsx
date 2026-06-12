"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTestimonials } from "@/hooks/useTestimonials";
import type { Testimonial } from "@/types/testimonials";

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
  color: "rgb(28 34 44)",
};

const subtitleInkStyle: React.CSSProperties = {
  color: "rgb(62 76 98)",
};

export function TestimonialsSection() {
  const { testimonials, loading, error } = useTestimonials({
    statuses: ["approved"],
  });

  const visible = useMemo(() => testimonials ?? [], [testimonials]);

  // Lightbox state: which testimonial is open and which photo is showing.
  const [activeId, setActiveId] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const active = useMemo(
    () => visible.find((t) => t.id === activeId) ?? null,
    [visible, activeId],
  );

  const openLightbox = useCallback((id: string, index = 0) => {
    setActiveId(id);
    setPhotoIndex(index);
  }, []);

  const closeLightbox = useCallback(() => setActiveId(null), []);

  const stats = useMemo(() => {
    const list = visible.filter((t) => (t.rating ?? 0) > 0);
    const count = list.length;
    const avg =
      count === 0 ? null : list.reduce((sum, t) => sum + (t.rating ?? 0), 0) / count;
    return { count: visible.length, avg: avg ? Math.round(avg * 10) / 10 : null };
  }, [visible]);

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

        <Link
          href="/review"
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
        </Link>
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
              const count = t.images?.length ?? 0;

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
                    <button
                      type="button"
                      onClick={() => openLightbox(t.id, 0)}
                      aria-label={`View ${count > 1 ? `all ${count} photos` : "photo"} from ${t.author_name}`}
                      className="relative block h-44 w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                    >
                      {/* Blurred fill keeps the letterbox bands intentional so any
                          aspect ratio is shown in full without odd cropping. */}
                      <Image
                        src={img}
                        alt=""
                        aria-hidden
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover scale-110 blur-2xl opacity-40"
                        draggable={false}
                      />
                      <Image
                        src={img}
                        alt={t.images?.[0]?.alt || "Adoption photo"}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="relative object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                        draggable={false}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(255,248,242,0.00)] via-[rgba(255,248,242,0.00)] to-[rgba(255,248,242,0.22)]" />

                      {count > 1 && (
                        <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                          {count}
                        </span>
                      )}
                    </button>
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

                    {count > 1 && (
                      <button
                        type="button"
                        onClick={() => openLightbox(t.id, 0)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 underline decoration-amber-800/30 underline-offset-2 transition hover:text-amber-900"
                      >
                        View all {count} photos
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ReviewLightbox
        testimonial={active}
        index={photoIndex}
        onIndexChange={setPhotoIndex}
        onClose={closeLightbox}
      />

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

function ReviewLightbox({
  testimonial,
  index,
  onIndexChange,
  onClose,
}: {
  testimonial: Testimonial | null;
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const images = useMemo(
    () => testimonial?.images ?? [],
    [testimonial],
  );
  const count = images.length;
  const safeIndex = count > 0 ? ((index % count) + count) % count : 0;
  const current = images[safeIndex] ?? null;

  const step = useCallback(
    (dir: number) => {
      if (count <= 1) return;
      onIndexChange(((safeIndex + dir) % count + count) % count);
    },
    [count, safeIndex, onIndexChange],
  );

  const open = Boolean(testimonial) && count > 0;

  // Keyboard navigation + close, plus lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, step, onClose]);

  if (!open || !testimonial || !current || typeof document === "undefined")
    return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10010] flex flex-col bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Photos from ${testimonial.author_name}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 p-4 text-white">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold">
            {testimonial.author_name}
          </div>
          {testimonial.author_location && (
            <div className="truncate text-xs text-white/70">
              {testimonial.author_location}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {count > 1 && (
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              {safeIndex + 1} / {count}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <span aria-hidden className="text-xl leading-none">×</span>
          </button>
        </div>
      </div>

      {/* Stage */}
      <div
        className="relative flex flex-1 items-center justify-center px-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="relative h-full max-h-[70vh] w-full max-w-5xl">
          <Image
            key={current.url}
            src={current.url}
            alt={current.alt || `Photo from ${testimonial.author_name}`}
            fill
            unoptimized
            sizes="100vw"
            className="object-contain"
            draggable={false}
          />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-4"
            >
              <span aria-hidden className="text-2xl leading-none">‹</span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-4"
            >
              <span aria-hidden className="text-2xl leading-none">›</span>
            </button>
          </>
        )}
      </div>

      {/* Review text */}
      {testimonial.message && (
        <div className="mx-auto w-full max-w-3xl px-4 pb-3">
          <p className="line-clamp-3 text-center text-sm leading-relaxed text-white/85">
            {testimonial.message}
          </p>
        </div>
      )}

      {/* Thumbnail strip */}
      {count > 1 && (
        <div className="border-t border-white/10 bg-black/30 p-3">
          <div className="mx-auto flex max-w-4xl snap-x gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
            {images.map((im, i) => {
              const isActive = i === safeIndex;
              return (
                <button
                  type="button"
                  key={im.id ?? im.url}
                  onClick={() => onIndexChange(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className={[
                    "relative h-14 w-16 shrink-0 snap-start overflow-hidden rounded-lg transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    isActive
                      ? "ring-2 ring-white"
                      : "opacity-60 ring-1 ring-white/20 hover:opacity-100",
                  ].join(" ")}
                >
                  <Image
                    src={im.url}
                    alt={im.alt || ""}
                    fill
                    unoptimized
                    sizes="64px"
                    className="object-cover"
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
