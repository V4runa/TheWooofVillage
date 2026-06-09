/**
 * Lightweight input formatters shared by the admin and public forms.
 */

/**
 * Progressively format a US phone number as the user types, e.g.
 *   "5551234567"  -> "(555) 123-4567"
 *   "15551234567" -> "(555) 123-4567"  (drops a leading country code 1)
 *
 * International numbers (anything the user prefixes with "+") are left as-is,
 * since we can't reliably guess their grouping.
 */
export function formatUsPhone(input: string): string {
  if (!input) return "";

  // Respect explicit international input — don't fight the user.
  if (input.trim().startsWith("+")) return input.trim();

  let digits = input.replace(/\D/g, "");
  if (!digits) return "";

  // Drop a leading "1" country code when a full number is present.
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);

  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  if (digits.length <= 3) return `(${area}`;
  if (digits.length <= 6) return `(${area}) ${prefix}`;
  return `(${area}) ${prefix}-${line}`;
}
