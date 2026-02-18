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

export default function AdminPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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

      {/* 2x2 cards — flex-1 min-h-0 so they fill and don't overflow */}
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 content-stretch">
        {CARDS.map((c) => {
          const Icon = c.icon;
          const topperStyle = CARD_TOPPER_STYLE[c.accent];
          return (
            <Link
              key={c.href}
              href={c.href}
              className={`${softShell("group flex min-h-0 flex-col overflow-hidden transition-shadow hover:shadow-adminHover")} border border-stone-200`}
            >
              {/* Colored topper bar: Dogs green, Reservations blue, Testimonials orange, Profile stone */}
              <div
                className="h-2.5 w-full shrink-0 rounded-t-2xl"
                style={topperStyle}
                aria-hidden
              />
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ring-2 ${CHIP[c.accent]}`}>
                    <Icon size={28} className={ICON_COLOR[c.accent]} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-gray-900 truncate">{c.title}</h2>
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
        <div className="flex items-center gap-4">
          <FileText className="h-6 w-6 shrink-0 text-meadow-600" />
          <div className="min-w-0 flex-1">
            <p className="text-lg text-gray-700 line-clamp-2">
              Session cookie auth. If you see Unauthorized, sign in again from the login page.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link className={btn("primary")} href="/admin/dogs">Go to Dogs</Link>
            <Link className={btn("muted")} href="/dogs" target="_blank" rel="noopener">View site <ExternalLink size={12} /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
