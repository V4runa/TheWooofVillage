"use client";

import * as React from "react";
import Link from "next/link";
import {
  Dog,
  CalendarCheck,
  MessageSquare,
  User,
  ArrowRight,
  ExternalLink,
  Sparkles,
  FileText,
} from "lucide-react";

import { softShell, btn } from "@/components/admin/AdminUi";
import { adminJson } from "@/lib/admin/apiClient";
import { useToast } from "@/components/admin/Toast";

type Card = {
  title: string;
  href: string;
  description: string;
  bullets: string[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: "meadow" | "sky" | "sun" | "stone";
};

const CARDS: Card[] = [
  { title: "Dogs", href: "/admin/dogs", description: "Create, edit, and manage your dog listings.", bullets: ["Create listings and upload photos", "Edit fields and status", "Delete listings"], icon: Dog, accent: "meadow" },
  { title: "Reservations", href: "/admin/reservations", description: "Review deposit confirmations and manage requests.", bullets: ["Filter by new, contacted, or closed", "Update status quickly", "Open dog links in new tab"], icon: CalendarCheck, accent: "sky" },
  { title: "Testimonials", href: "/admin/testimonials", description: "Moderate testimonials before they go public.", bullets: ["Approve or reject", "Delete spam", "View attached photos"], icon: MessageSquare, accent: "sun" },
  { title: "Merchant Profile", href: "/admin/profile", description: "Payment links and socials on dog detail pages.", bullets: ["Phone and display name", "Venmo, Cash App, PayPal, Zelle", "Social links"], icon: User, accent: "stone" },
];

/** Dashboard card topper: unique color per card, inline so it always shows. */
const CARD_TOPPER_STYLE: Record<Card["accent"], React.CSSProperties> = {
  meadow: { background: "linear-gradient(to right, #2fb35f, #228d4a)" },
  sky: { background: "linear-gradient(to right, #4f9cff, #2c79e6)" },
  sun: { background: "linear-gradient(to right, #ff7f2a, #e65f14)" },
  stone: { background: "linear-gradient(to right, #78716c, #57534e)" },
};

const CHIP = { meadow: "bg-meadow-100 ring-meadow-200", sky: "bg-sky-100 ring-sky-200", sun: "bg-sun-100 ring-sun-200", stone: "bg-stone-200 ring-stone-300" } as const;
const ICON_COLOR = { meadow: "text-meadow-800", sky: "text-sky-800", sun: "text-sun-800", stone: "text-stone-800" } as const;
const DOT = { meadow: "bg-meadow-500", sky: "bg-sky-500", sun: "bg-sun-500", stone: "bg-stone-600" } as const;
const LINK = { meadow: "text-meadow-700 hover:text-meadow-800", sky: "text-sky-700 hover:text-sky-800", sun: "text-sun-700 hover:text-sun-800", stone: "text-stone-700 hover:text-stone-800" } as const;

type Counts = {
  newReservations: number;
  pendingTestimonials: number;
  availableDogs: number;
};

/** Badge shown on a card, keyed by card href. Urgent badges (pending work) pop. */
function cardBadge(
  href: string,
  counts: Counts | null
): { text: string; urgent: boolean } | null {
  if (!counts) return null;
  if (href === "/admin/reservations") {
    return { text: `${counts.newReservations} new`, urgent: counts.newReservations > 0 };
  }
  if (href === "/admin/testimonials") {
    return { text: `${counts.pendingTestimonials} pending`, urgent: counts.pendingTestimonials > 0 };
  }
  if (href === "/admin/dogs") {
    return { text: `${counts.availableDogs} available`, urgent: false };
  }
  return null;
}

export default function AdminPage() {
  const { showToast } = useToast();
  const [counts, setCounts] = React.useState<Counts | null>(null);
  const [countsLoading, setCountsLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;

    async function loadCounts() {
      setCountsLoading(true);
      try {
        const [res, tes, dgs] = await Promise.all([
          adminJson<{ ok: true; reservations: unknown[] }>(
            "/api/admin/reservations?status=new&limit=200"
          ),
          adminJson<{ ok: true; testimonials: unknown[] }>(
            "/api/admin/testimonials?status=pending&limit=500"
          ),
          adminJson<{ ok: true; dogs: unknown[] }>(
            "/api/admin/dogs?status=available&limit=300"
          ),
        ]);
        if (!alive) return;
        setCounts({
          newReservations: res.reservations?.length ?? 0,
          pendingTestimonials: tes.testimonials?.length ?? 0,
          availableDogs: dgs.dogs?.length ?? 0,
        });
      } catch (e: any) {
        if (alive) showToast(e?.message || "Could not load dashboard counts.", "error");
      } finally {
        if (alive) setCountsLoading(false);
      }
    }

    void loadCounts();
    return () => {
      alive = false;
    };
  }, [showToast]);

  const stats = [
    {
      label: "New reservations",
      value: counts?.newReservations ?? 0,
      href: "/admin/reservations",
      icon: CalendarCheck,
      urgent: (counts?.newReservations ?? 0) > 0,
    },
    {
      label: "Pending testimonials",
      value: counts?.pendingTestimonials ?? 0,
      href: "/admin/testimonials",
      icon: MessageSquare,
      urgent: (counts?.pendingTestimonials ?? 0) > 0,
    },
    {
      label: "Available dogs",
      value: counts?.availableDogs ?? 0,
      href: "/admin/dogs",
      icon: Dog,
      urgent: false,
    },
  ];

  return (
    <div className="flex flex-1 flex-col lg:min-h-0 lg:overflow-hidden">
      {/* Compact welcome + quick access */}
      <div className="shrink-0 flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow ring-1 ring-black/5">
            <Sparkles className="h-7 w-7 text-meadow-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 truncate">Your command center</h2>
            <p className="text-lg text-gray-600 truncate">Quick access below</p>
          </div>
        </div>
        <span className="text-base font-bold uppercase tracking-wider text-gray-400 shrink-0">Quick access</span>
      </div>

      {/* At-a-glance counts — tap a tile to jump straight to what needs attention */}
      <div className="shrink-0 grid grid-cols-1 gap-3 pb-3 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className={`flex items-center gap-4 rounded-xl border bg-white p-4 shadow-adminSm ring-1 ring-black/5 transition-all hover:shadow-admin ${
                s.urgent ? "border-sun-300 ring-sun-200" : "border-stone-200"
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  s.urgent ? "bg-sun-100 ring-2 ring-sun-200" : "bg-stone-100 ring-2 ring-stone-200"
                }`}
              >
                <Icon size={24} className={s.urgent ? "text-sun-700" : "text-stone-600"} />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tabular-nums text-gray-900">
                    {countsLoading ? "—" : s.value}
                  </span>
                  {s.urgent ? (
                    <span className="rounded-full bg-sun-500 px-2 py-0.5 text-xs font-bold text-white">
                      Needs attention
                    </span>
                  ) : null}
                </div>
                <div className="truncate text-base font-semibold text-gray-600">{s.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Cards — single column on phones, 2-up on small+, fills the viewport on desktop */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:content-stretch">
        {CARDS.map((c) => {
          const Icon = c.icon;
          const topperStyle = CARD_TOPPER_STYLE[c.accent];
          const badge = cardBadge(c.href, counts);
          return (
            <Link
              key={c.href}
              href={c.href}
              className={`${softShell("group flex flex-col transition-shadow hover:shadow-adminHover lg:min-h-0 lg:overflow-hidden")} border border-stone-200`}
            >
              {/* Colored topper bar: Dogs green, Reservations blue, Testimonials orange, Profile stone */}
              <div
                className="h-2.5 w-full shrink-0 rounded-t-2xl"
                style={topperStyle}
                aria-hidden
              />
              <div className="flex flex-1 flex-col p-5 sm:p-6 lg:min-h-0 lg:overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ring-2 ${CHIP[c.accent]}`}>
                    <Icon size={28} className={ICON_COLOR[c.accent]} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xl font-bold text-gray-900 truncate">{c.title}</h2>
                      {badge ? (
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                            badge.urgent
                              ? "bg-sun-100 text-sun-900 ring-sun-300"
                              : "bg-stone-100 text-stone-700 ring-stone-200"
                          }`}
                        >
                          {badge.text}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-lg text-gray-600 line-clamp-2">{c.description}</p>
                    <ul className="mt-4 space-y-2">
                      {c.bullets.slice(0, 2).map((b) => (
                        <li key={b} className="flex items-center gap-2 text-lg text-gray-700 truncate">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[c.accent]}`} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <span className={`mt-4 inline-flex items-center gap-1.5 text-base font-semibold ${LINK[c.accent]}`}>
                      Open <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Compact notes — shrink-0 */}
      <div className="mt-4 shrink-0 overflow-hidden rounded-xl border border-meadow-200 bg-meadow-50/50 p-5 shadow-adminSm ring-1 ring-black/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <FileText className="h-6 w-6 shrink-0 text-meadow-600" />
            <p className="min-w-0 flex-1 text-lg text-gray-700 line-clamp-2">
              Session cookie auth. If you see Unauthorized, sign in again from the login page.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link className={btn("primary")} href="/admin/dogs">Go to Dogs</Link>
            <Link className={btn("muted")} href="/dogs" target="_blank" rel="noopener">View site <ExternalLink size={12} /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
