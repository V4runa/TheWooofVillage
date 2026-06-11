"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { X, Upload, ImagePlus } from "lucide-react";
import { uploadImageWithRetry } from "@/lib/admin/upload";

const MAX_PHOTOS = 6;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const inputClass =
  "w-full rounded-xl bg-white/90 px-4 py-3 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-amber-300/55 focus:ring-offset-2";

type Draft = {
  author_name: string;
  author_location: string;
  rating: number;
  message: string;
};

const EMPTY: Draft = {
  author_name: "",
  author_location: "",
  rating: 5,
  message: "",
};

/**
 * Shared review submission form.
 *
 * Used both inside the landing-page modal and on the standalone /review page so
 * the shop owner can text/email a single link. Supports real photo uploads
 * (multiple, with previews) instead of asking customers for an image URL.
 */
export function ReviewForm({
  onSuccess,
  onCancel,
  className,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Build/teardown object URLs for thumbnail previews.
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (incoming.length === 0) return;
    setFiles((prev) => [...prev, ...incoming].slice(0, MAX_PHOTOS));
    setErrMsg(null);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit() {
    setOkMsg(null);
    setErrMsg(null);

    const payload = {
      author_name: draft.author_name.trim(),
      author_location: draft.author_location.trim(),
      rating: draft.rating ? clamp(draft.rating, 1, 5) : null,
      message: draft.message.trim(),
    };

    if (!payload.author_name) {
      setErrMsg("Please enter your name.");
      return;
    }
    if (!payload.message) {
      setErrMsg("Please write a short message.");
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
        setErrMsg(json?.error || "Could not submit review.");
        return;
      }

      const reviewId: string | undefined = json?.testimonial_id;
      let photoFailures = 0;

      if (reviewId && files.length > 0) {
        setProgress({ done: 0, total: files.length });
        for (let i = 0; i < files.length; i++) {
          try {
            await uploadImageWithRetry(
              `/api/public/testimonials/${reviewId}/images`,
              files[i]
            );
          } catch {
            photoFailures += 1;
          } finally {
            setProgress({ done: i + 1, total: files.length });
          }
        }
        setProgress(null);
      }

      if (photoFailures > 0) {
        setOkMsg(
          `Thanks! Your review was submitted. ${photoFailures} photo${
            photoFailures === 1 ? "" : "s"
          } couldn't upload, but your review will still appear once approved.`
        );
      } else {
        setOkMsg(
          "Thanks! Your review was submitted and will appear once approved. ❤️"
        );
      }

      setDraft(EMPTY);
      setFiles([]);
      onSuccess?.();
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : "Could not submit review.");
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  }

  const busy = submitting || progress != null;

  return (
    <div className={["grid gap-3", className || ""].join(" ")}>
      <input
        value={draft.author_name}
        onChange={(e) => setDraft((d) => ({ ...d, author_name: e.target.value }))}
        placeholder="Your name *"
        className={inputClass}
      />

      <input
        value={draft.author_location}
        onChange={(e) =>
          setDraft((d) => ({ ...d, author_location: e.target.value }))
        }
        placeholder="City / State (optional)"
        className={inputClass}
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
        className={`min-h-[120px] ${inputClass}`}
      />

      {/* Photo uploader */}
      <div className="grid gap-2">
        <div className="text-sm font-extrabold text-ink-primary">
          Photos{" "}
          <span className="font-semibold text-ink-secondary">
            (optional · up to {MAX_PHOTOS})
          </span>
        </div>

        {previews.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {previews.map((src, idx) => (
              <div
                key={src}
                className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-black/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Selected photo ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  disabled={busy}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {files.length < MAX_PHOTOS ? (
          <label
            className={[
              "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold",
              "border border-amber-950/18 bg-[rgba(255,248,238,0.92)] text-ink-primary",
              "hover:bg-[rgba(255,252,248,0.98)] transition",
              busy ? "pointer-events-none opacity-60" : "",
            ].join(" ")}
          >
            <ImagePlus size={16} />
            {files.length > 0 ? "Add more photos" : "Add photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                addFiles(e.target.files);
                e.currentTarget.value = "";
              }}
            />
          </label>
        ) : (
          <div className="text-xs font-semibold text-ink-secondary">
            Maximum of {MAX_PHOTOS} photos reached.
          </div>
        )}
      </div>

      {progress ? (
        <div className="rounded-xl bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-900 ring-1 ring-black/10">
          Uploading photos {progress.done} of {progress.total}…
        </div>
      ) : null}

      {errMsg ? (
        <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-900 ring-1 ring-black/10">
          {errMsg}
        </div>
      ) : null}
      {okMsg ? (
        <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-900 ring-1 ring-black/10">
          {okMsg}
        </div>
      ) : null}

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold bg-[rgba(255,248,238,0.92)] border border-amber-950/18 hover:bg-[rgba(255,252,248,0.98)] transition disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}

        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className={[
            "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold",
            "bg-[rgba(34,40,50,0.92)] text-white hover:bg-[rgba(34,40,50,1)] transition",
            onCancel ? "" : "sm:col-span-2",
            busy ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
        >
          <Upload size={16} />
          {busy ? "Submitting…" : "Submit review"}
        </button>
      </div>

      <p className="text-xs text-ink-secondary">
        Reviews are manually approved to prevent spam. ❤️
      </p>
    </div>
  );
}
