"use client";

/**
 * Resilient client-side image uploader.
 *
 * Phone photos + flaky connections are the #1 cause of "missing" images in
 * bulk uploads. This helper makes each upload as reliable as possible:
 *  - Compress once up front (re-using the same blob across retries).
 *  - Retry transient failures (network errors, 5xx, 408, 429) with backoff.
 *  - Never retry deterministic client errors (4xx) — they won't succeed.
 *  - Throw the last error so callers can track exactly which files failed and
 *    offer a retry, instead of silently dropping photos.
 */

import { compressImage, type CompressOptions } from "@/lib/admin/image";

export type UploadResult = { url?: string; [k: string]: unknown };

const DEFAULT_ATTEMPTS = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function uploadImageWithRetry(
  url: string,
  file: File,
  opts: {
    fieldName?: string;
    extraFields?: Record<string, string>;
    attempts?: number;
    compress?: CompressOptions | false;
    credentials?: RequestCredentials;
    signal?: AbortSignal;
  } = {}
): Promise<UploadResult> {
  const {
    fieldName = "file",
    extraFields = {},
    attempts = DEFAULT_ATTEMPTS,
    compress = {},
    credentials = "same-origin",
    signal,
  } = opts;

  // Compress a single time; re-encoding on every retry would be wasteful.
  let payload: File = file;
  if (compress !== false) {
    try {
      payload = await compressImage(file, compress);
    } catch {
      payload = file;
    }
  }

  let lastErr: Error | null = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const form = new FormData();
      form.set(fieldName, payload, payload.name);
      for (const [k, v] of Object.entries(extraFields)) form.set(k, v);

      const res = await fetch(url, {
        method: "POST",
        body: form,
        credentials,
        signal,
      });

      const json = await res.json().catch(() => null);

      if (res.ok && !(json && json.ok === false)) {
        return (json?.image ?? json ?? {}) as UploadResult;
      }

      const msg =
        json?.error || json?.message || `Upload failed (${res.status})`;
      lastErr = new Error(msg);

      // Client errors (other than rate-limit/timeout) won't pass on retry.
      const retriable =
        res.status >= 500 || res.status === 408 || res.status === 429;
      if (!retriable) break;
    } catch (e: unknown) {
      // Thrown fetch = network/transport error → worth retrying.
      lastErr = e instanceof Error ? e : new Error(String(e));
      if (signal?.aborted) break;
    }

    if (attempt < attempts) await sleep(400 * attempt);
  }

  throw lastErr ?? new Error("Upload failed");
}
