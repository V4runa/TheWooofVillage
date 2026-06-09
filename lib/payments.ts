/**
 * Peer-to-peer payment helpers.
 *
 * The shop accepts payments via the owner's personal Cash App / Venmo / PayPal
 * / Zelle (no payment processor, no fees). There is no single API for these, so
 * the best we can do is build the most "one-tap" deep link each app supports and
 * fall back to showing the handle + amount with a copy button.
 *
 * Capability summary:
 *   - Cash App : cash.app/$cashtag/AMOUNT      -> amount pre-filled (web + app)
 *   - PayPal   : paypal.me/user/AMOUNT          -> amount pre-filled (web + app)
 *   - Venmo    : venmo.com/?txn=pay&...&amount  -> pre-fills on mobile app only
 *   - Zelle    : no links exist                 -> manual (copy recipient)
 */

export type PaymentKind = "deposit" | "full";

export type PaymentOptionId = "cashapp" | "venmo" | "paypal" | "zelle";

export type PaymentOption = {
  id: PaymentOptionId;
  label: string;
  /** Owner-facing handle/recipient shown to the buyer (e.g. "$john", "@jane"). */
  handle: string;
  /** Deep link that opens the app/site, with the amount pre-filled when supported. */
  href: string | null;
  /** Whether `href` actually pre-fills the amount (vs. just opening the app). */
  prefillsAmount: boolean;
  /** True for Zelle: must be done manually inside a bank app. */
  manual: boolean;
};

/** Format integer cents as a plain dollar string for URLs, e.g. 30000 -> "300.00". */
export function amountForUrl(cents: number): string {
  return (Math.max(0, Math.round(cents)) / 100).toFixed(2);
}

function lastPathSegment(raw: string): string | null {
  try {
    const s = raw.trim();
    if (!s) return null;
    // Tolerate bare handles ("@jane", "$john", "jane") as well as full URLs.
    const withoutProto = s.replace(/^[a-z]+:\/\//i, "");
    const parts = withoutProto.split(/[/?#]/).filter(Boolean);
    // Drop the domain if present.
    const segs = parts.length > 1 && parts[0].includes(".") ? parts.slice(1) : parts;
    const last = segs[segs.length - 1] || parts[parts.length - 1];
    return last ? last.replace(/^[@$]/, "") : null;
  } catch {
    return null;
  }
}

/** Extract a Cash App $cashtag (with the leading $) from a stored value. */
export function parseCashtag(raw?: string | null): string | null {
  if (!raw) return null;
  const seg = lastPathSegment(raw);
  if (!seg) return null;
  const tag = seg.replace(/[^A-Za-z0-9_]/g, "");
  return tag ? `$${tag}` : null;
}

/** Extract a Venmo username (no @) from a stored value. */
export function parseVenmoUser(raw?: string | null): string | null {
  if (!raw) return null;
  const seg = lastPathSegment(raw);
  if (!seg) return null;
  // venmo.com/u/<name> leaves "u" if the name was missing — guard against that.
  const user = seg.replace(/[^A-Za-z0-9_.-]/g, "");
  if (!user || user.toLowerCase() === "u") return null;
  return user;
}

/** Extract a PayPal.me username from a stored value. */
export function parsePaypalUser(raw?: string | null): string | null {
  if (!raw) return null;
  const seg = lastPathSegment(raw);
  if (!seg) return null;
  const user = seg.replace(/[^A-Za-z0-9_.-]/g, "");
  if (!user || user.toLowerCase() === "paypalme") return null;
  return user;
}

type BuildArgs = {
  amountCents: number;
  /** Short memo (e.g. puppy name) used where the app supports a note param. */
  note?: string;
};

/**
 * Build the ordered list of payment options the buyer can use, based on what
 * the owner configured in their merchant profile.
 */
export function buildPaymentOptions(
  merchant: {
    cashapp_url?: string | null;
    venmo_url?: string | null;
    paypal_url?: string | null;
    zelle_recipient?: string | null;
  } | null,
  { amountCents, note }: BuildArgs
): PaymentOption[] {
  if (!merchant) return [];

  const amt = amountForUrl(amountCents);
  const hasAmount = amountCents > 0;
  const memo = note ? encodeURIComponent(note) : "";
  const out: PaymentOption[] = [];

  const cashtag = parseCashtag(merchant.cashapp_url);
  if (cashtag) {
    out.push({
      id: "cashapp",
      label: "Cash App",
      handle: cashtag,
      href: hasAmount
        ? `https://cash.app/${cashtag}/${amt}`
        : `https://cash.app/${cashtag}`,
      prefillsAmount: hasAmount,
      manual: false,
    });
  }

  const venmoUser = parseVenmoUser(merchant.venmo_url);
  if (venmoUser) {
    const params = new URLSearchParams({ txn: "pay", recipients: venmoUser });
    if (hasAmount) params.set("amount", amt);
    if (memo) params.set("note", note as string);
    out.push({
      id: "venmo",
      label: "Venmo",
      handle: `@${venmoUser}`,
      href: `https://venmo.com/?${params.toString()}`,
      // Venmo only honors these params inside the mobile app.
      prefillsAmount: false,
      manual: false,
    });
  }

  const paypalUser = parsePaypalUser(merchant.paypal_url);
  if (paypalUser) {
    out.push({
      id: "paypal",
      label: "PayPal",
      handle: paypalUser,
      href: hasAmount
        ? `https://paypal.me/${paypalUser}/${amt}`
        : `https://paypal.me/${paypalUser}`,
      prefillsAmount: hasAmount,
      manual: false,
    });
  }

  if (merchant.zelle_recipient && merchant.zelle_recipient.trim()) {
    out.push({
      id: "zelle",
      label: "Zelle",
      handle: merchant.zelle_recipient.trim(),
      href: null,
      prefillsAmount: false,
      manual: true,
    });
  }

  return out;
}
