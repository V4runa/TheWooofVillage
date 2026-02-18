/**
 * Shared utility functions for admin API routes.
 * These prevent code duplication across route handlers.
 */

/**
 * Converts a MIME type to a file extension.
 */
export function extFromType(type: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "bin";
}

/**
 * Converts a string to a URL-friendly slug.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Parses a value to an integer, returning null if invalid.
 */
export function parseIntOrNull(v: unknown): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parses a date string to YYYY-MM-DD format, returning null if invalid.
 */
export function parseDateOrNull(v: unknown): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
