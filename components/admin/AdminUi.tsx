// components/admin/AdminUi.tsx
// Admin UI primitives: meadow + stone, strong contrast, readable type, a touch of life.

export const inputClass =
  "w-full rounded-xl bg-white px-4 py-3.5 text-[19px] text-gray-900 ring-1 ring-gray-300 shadow-adminSm placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-meadow-500 focus:ring-offset-2 focus:ring-offset-white border-0 transition-shadow";

export const inputClassSm =
  "w-full rounded-xl bg-white px-4 py-3 text-[19px] text-gray-900 ring-1 ring-gray-300 shadow-adminSm placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-meadow-500 focus:ring-offset-2 focus:ring-offset-white border-0 transition-shadow";

export const alertErrorClass =
  "rounded-xl bg-red-50 px-4 py-3.5 text-[19px] font-medium text-red-900 border border-red-200 shadow-adminSm";

export const toastClass =
  "inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3.5 text-[19px] font-semibold text-gray-900 border border-meadow-200 shadow-admin ring-1 ring-black/5";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[19px] font-semibold border-0 shadow-adminSm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed";

export function softShell(cls?: string) {
  return [
    "rounded-2xl",
    "bg-white",
    "border border-stone-200",
    "shadow-admin",
    "ring-1 ring-black/5",
    cls ?? "",
  ].join(" ");
}

/** Admin-wide identity: colored top stripe. Use with stripe accent classes. */
export const adminStripeClass = "h-2 w-full rounded-t-2xl bg-gradient-to-r";
export const ADMIN_STRIPE = {
  meadow: "from-meadow-500 to-meadow-600",
  sky: "from-sky-500 to-sky-600",
  sun: "from-sun-500 to-sun-600",
  stone: "from-stone-500 to-stone-600",
} as const;

/** Inline topper styles — use for the small colored bar on admin cards so they always show. */
export type AdminTopperAccent = "meadow" | "sky" | "sun" | "stone";
export const ADMIN_TOPPER_STYLES: Record<AdminTopperAccent, { background: string }> = {
  meadow: { background: "linear-gradient(to right, #2fb35f, #228d4a)" },
  sky: { background: "linear-gradient(to right, #4f9cff, #2c79e6)" },
  sun: { background: "linear-gradient(to right, #ff7f2a, #e65f14)" },
  stone: { background: "linear-gradient(to right, #78716c, #57534e)" },
};

export function btn(kind: "primary" | "muted" | "danger") {
  const adminClass =
    kind === "primary"
      ? "btn-admin-primary"
      : kind === "danger"
        ? "btn-admin-danger"
        : "btn-admin-muted";
  if (kind === "primary") {
    return [
      btnBase,
      adminClass,
      "bg-gradient-to-r from-meadow-600 to-meadow-700 text-white shadow-admin hover:shadow-adminHover",
      "hover:from-meadow-500 hover:to-meadow-600 hover:-translate-y-0.5",
      "active:from-meadow-700 active:to-meadow-800 active:translate-y-0",
    ].join(" ");
  }
  if (kind === "danger") {
    return [
      btnBase,
      adminClass,
      "bg-white text-red-700 ring-2 ring-red-200",
      "hover:bg-red-50 hover:ring-red-300 hover:shadow-admin",
    ].join(" ");
  }
  return [
    btnBase,
    adminClass,
    "bg-stone-50 text-gray-900 ring-2 ring-stone-200",
    "hover:bg-meadow-50 hover:ring-meadow-200 hover:text-meadow-900 hover:shadow-admin",
  ].join(" ");
}

export function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function moneyFromCents(cents?: number | null) {
  if (cents == null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const pillNavBase =
  "inline-flex items-center rounded-lg px-4 py-3 text-[19px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export function pill(active: boolean) {
  return [
    pillNavBase,
    "shadow-adminSm",
    active
      ? "bg-meadow-200 text-meadow-900 ring-1 ring-meadow-300"
      : "bg-white text-gray-800 ring-1 ring-gray-300 hover:bg-meadow-50 hover:ring-meadow-200 hover:shadow-admin",
  ].join(" ");
}

export function navItem(active: boolean) {
  return [
    "w-full text-left rounded-xl px-4 py-3 text-[19px] font-semibold transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    active
      ? "bg-meadow-50 text-meadow-900 ring-1 ring-meadow-200 border-l-4 border-l-meadow-600"
      : "bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-meadow-50/50 hover:ring-meadow-100 border-l-4 border-l-transparent",
  ].join(" ");
}

// Status badge helpers — readable, theme-aligned
export function statusBadge(status: string): string {
  const statusMap: Record<string, string> = {
    new: "bg-sky-200 text-sky-900 ring-1 ring-sky-300",
    contacted: "bg-sky-200 text-sky-900 ring-1 ring-sky-300",
    closed: "bg-emerald-200 text-emerald-900 ring-1 ring-emerald-300",
    pending: "bg-sun-100 text-sun-900 ring-1 ring-sun-200",
    approved: "bg-emerald-200 text-emerald-900 ring-1 ring-emerald-300",
    rejected: "bg-red-200 text-red-900 ring-1 ring-red-300",
    available: "bg-emerald-200 text-emerald-900 ring-1 ring-emerald-300",
    reserved: "bg-meadow-200 text-meadow-900 ring-1 ring-meadow-300",
    sold: "bg-gray-200 text-gray-900 ring-1 ring-gray-300",
  };
  return [
    "inline-flex items-center rounded-lg px-3 py-1.5 text-[17px] font-semibold",
    statusMap[status.toLowerCase()] || "bg-gray-200 text-gray-900 ring-1 ring-gray-300",
  ].join(" ");
}
