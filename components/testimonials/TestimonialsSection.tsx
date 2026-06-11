"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
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
                      <Image
                        src={img}
                        alt={t.images?.[0]?.alt || "Adoption photo"}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
