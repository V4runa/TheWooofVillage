"use client";

/**
 * Client-side image downscaling + compression.
 *
 * Why this exists:
 *  - Phone photos are often 4–12MB. Uploading the raw file through a Next API
 *    route on Vercel can exceed the serverless request-body limit (~4.5MB),
 *    which surfaces to the user as a vague "request failed".
 *  - Resizing/compressing in the browser keeps every upload small and reliable,
 *    speeds up the public site, and saves storage.
 *
 * It is intentionally forgiving: if anything goes wrong (e.g. an exotic format
 * the canvas can't decode), it falls back to the original file so uploads still
 * work.
 */

export type CompressOptions = {
  /** Longest edge of the output image, in pixels. */
  maxEdge?: number;
  /** JPEG quality, 0–1. */
  quality?: number;
  /** Skip work for files already smaller than this many bytes. */
  skipUnderBytes?: number;
};

const DEFAULTS: Required<CompressOptions> = {
  maxEdge: 1600,
  quality: 0.82,
  skipUnderBytes: 400 * 1024, // 400KB
};

function canUseCanvas(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    typeof createImageBitmap !== "undefined"
  );
}

function swapExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^/.]+$/, "");
  return `${base || "photo"}.${ext}`;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const opts = { ...DEFAULTS, ...options };

  // Only process raster images; leave anything else untouched.
  if (!file.type.startsWith("image/")) return file;

  // GIFs may be animated — re-encoding would flatten them. Leave as-is.
  if (file.type === "image/gif") return file;

  // Tiny files aren't worth the round-trip through canvas.
  if (file.size <= opts.skipUnderBytes) return file;

  if (!canUseCanvas()) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    const scale = Math.min(1, opts.maxEdge / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }

    // White matte: JPEG has no alpha, so flatten any transparency cleanly.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close?.();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", opts.quality)
    );

    if (!blob) return file;

    // If compression somehow made it bigger, keep the original.
    if (blob.size >= file.size) return file;

    return new File([blob], swapExtension(file.name, "jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
