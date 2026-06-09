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
  FileText,
} from "lucide-react";

import { softShell, btn } from "@/components/admin/AdminUi";
import { adminJson } from "@/lib/admin/apiClient";
import { useToast } from "@/components/admin/Toast";

type Accent = "meadow" | "sky" | "sun" | "stone";

type Card = {
  title: string;
  href: string;
  description: string;
  bullets: string[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: Accent;
};

const CARDS: Card[] = [
  {
    title: "Dogs",
    href: "/admin/dogs",
    description: "Create, edit, and manage your dog listings.",
    bullets: ["Create listings and upload photos", "Edit fields and status", "Delete listings"],
    icon: Dog,
    accent: "meadow",
  },
  {
    title: "Reservations",
    href: "/admin/reservations",
    description: "Review deposit confirmations and manage requests.",
    bullets: ["Filter by new, contacted, or closed", "Update status quickly", "Open dog links in a new tab"],
    icon: CalendarCheck,
    accent: "sky",
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    description: "Moderate testimonials before they go public.",
    bullets: ["Approve or reject", "Delete spam", "View attached photos"],
    icon: MessageSquare,
    accent: "sun",
  },
  {
    title: "Merchant Profile",
    href: "/admin/profile",
    description: "Payment links and socials on dog detail pages.",
    bullets: ["Phone and display name", "Venmo, Cash App, PayPal, Zelle", "Social links"],
    icon: User,
    accent: "stone",
  },
];

/** Inline topper styles so the colored bar always renders (no purge issues). */
const CARD_TOPPER_STYLE: Record<Accent, React.CSSProperties> = {
  meadow: { background: "linear-gradient(to right, #2fb35f, #228d4a)" },
  sky: { background: "linear-gradient(to right, #4f9cff, #2c79e6)" },
  sun: { background: "linear-gradient(to right, #ff7f2a, #e65f14)" },
  stone: { background: "linear-gradient(to right, #78716c, #57534e)" },
};

const CHIP: Record<Accent, string> = {
  meadow: "bg-meadow-100 ring-meadow-200",
  sky: "bg-sky-100 ring-sky-200",
  sun: "bg-sun-100 ring-sun-200",
  stone: "bg-stone-200 ring-stone-300",
};
const ICON_COLOR: Record<Accent, string> = {
  meadow: "text-meadow-800",
  sky: "text-sky-800",
  sun: "text-sun-800",
  stone: "text-stone-800",
};
const DOT: Record<Accent, string> = {
  meadow: "bg-meadow-500",
  sky: "bg-sky-500",
  sun: "bg-sun-500",
  stone: "bg-stone-600",
};
const LINK: Record<Accent, string> = {
  meadow: "text-meadow-700 group-hover:text-meadow-800",
  sky: "text-sky-700 group-hover:text-sky-800",
  sun: "text-sun-700 group-hover:text-sun-800",
  stone: "text-stone-700 group-hover:text-stone-800",
};

type Counts = {
  newReservations: number;
  pendingTestimonials: number;
  availableDogs: number;
};

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
      hint: "Awaiting your reply",
      value: counts?.newReservations ?? 0,
      href: "/admin/reservations",
      icon: CalendarCheck,
      urgent: (counts?.newReservations ?? 0) > 0,
    },
    {
      label: "Pending testimonials",
      hint: "Need moderation",
      value: counts?.pendingTestimonials ?? 0,
      href: "/admin/testimonials",
      icon: MessageSquare,
      urgent: (counts?.pendingTestimonials ?? 0) > 0,
    },
    {
      label: "Available dogs",
      hint: "Live on the site",
      value: counts?.availableDogs ?? 0,
      href: "/admin/dogs",
      icon: Dog,
      urgent: false,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* KPI row — the actual "dashboard": what needs attention, at a glance */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
          At a glance
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                href={s.href}
                className={`group flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-adminSm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-admin ${
                  s.urgent ? "border-sun-300 ring-sun-200" : "border-stone-200"
                }`}
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ring-2 ${
                    s.urgent ? "bg-sun-100 ring-sun-200" : "bg-stone-100 ring-stone-200"
                  }`}
                >
                  <Icon size={26} className={s.urgent ? "text-sun-700" : "text-stone-600"} />
                </div>
                <div className="min-w-0">
                  <div className="text-4xl font-extrabold tabular-nums leading-none text-gray-900">
                    {countsLoading ? (
                      <span className="inline-block h-8 w-10 animate-pulse rounded-md bg-stone-200 align-middle" />
                    ) : (
                      s.value
                    )}
                  </div>
                  <div className="mt-1.5 text-base font-bold text-gray-900">{s.label}</div>
                  <div className="text-sm text-gray-500">
                    {s.urgent ? (
                      <span className="font-semibold text-sun-700">Needs attention</span>
                    ) : (
                      s.hint
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Manage — navigation cards with full, uncramped content */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
          Manage
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className={`${softShell(
                  "group flex flex-col overflow-hidden border border-stone-200 transition-all hover:-translate-y-0.5 hover:shadow-adminHover"
                )}`}
              >
                <div
                  className="h-2 w-full shrink-0"
                  style={CARD_TOPPER_STYLE[c.accent]}
                  aria-hidden
                />
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-2 ${CHIP[c.accent]}`}
                    >
                      <Icon size={24} className={ICON_COLOR[c.accent]} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{c.title}</h3>
                      <p className="mt-1 text-base text-gray-600">{c.description}</p>
                    </div>
                  </div>

                  <ul className="mt-4 grid gap-2">
                    {c.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-base text-gray-700">
                        <span
                          className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[c.accent]}`}
                          aria-hidden
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <span
                    className={`mt-5 inline-flex items-center gap-1.5 text-base font-semibold ${LINK[c.accent]}`}
                  >
                    Open
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer note */}
      <div className="rounded-xl border border-meadow-200 bg-meadow-50/50 p-5 shadow-adminSm ring-1 ring-black/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-meadow-600" />
            <p className="min-w-0 flex-1 text-base text-gray-700">
              Signed in with a session cookie. If you ever see “Unauthorized,” just sign in again.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link className={btn("primary")} href="/admin/dogs">
              Go to Dogs
            </Link>
            <Link className={btn("muted")} href="/dogs" target="_blank" rel="noopener">
              View site <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
