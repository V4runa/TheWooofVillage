"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dog,
  CalendarCheck,
  MessageSquare,
  User,
  ExternalLink,
  Home,
  ChevronRight,
  LogOut,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { softShell, navItem } from "@/components/admin/AdminUi";
import { ToastProvider } from "@/components/admin/Toast";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Dogs", href: "/admin/dogs", icon: Dog },
  { label: "Reservations", href: "/admin/reservations", icon: CalendarCheck },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
  { label: "Profile", href: "/admin/profile", icon: User },
];

const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/admin": {
    title: "Dashboard",
    subtitle:
      "Manage your listings, reservations, testimonials, and business profile.",
  },
  "/admin/login": {
    title: "Sign in",
    subtitle: "Enter the admin passcode to continue.",
  },
  "/admin/dogs": { title: "Dogs", subtitle: "Create and edit dog listings." },
  "/admin/reservations": {
    title: "Reservations",
    subtitle: "Review and update reservation requests.",
  },
  "/admin/testimonials": {
    title: "Testimonials",
    subtitle: "Approve or reject customer testimonials.",
  },
  "/admin/profile": {
    title: "Merchant Profile",
    subtitle: "Payment links, contact info, and socials.",
  },
};

function getMeta(pathname: string): { title: string; subtitle?: string } {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  for (const [path, meta] of Object.entries(PAGE_META)) {
    if (path !== "/admin" && pathname.startsWith(path)) return meta;
  }
  return { title: "Admin" };
}

export function AdminShell({
  title: titleProp,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const meta = getMeta(pathname);
  const title = titleProp ?? meta.title;
  const resolvedSubtitle = subtitle ?? meta.subtitle;
  const isDogsPage = pathname.startsWith("/admin/dogs");
  const isLoginPage = pathname === "/admin/login";

  const [signingOut, setSigningOut] = React.useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Even if the request fails, fall through to the login page; the cookie
      // is HttpOnly so the only reliable way to clear it is the server route,
      // but navigating away at least drops the admin session locally.
    }
    // Hard navigation clears the client router cache so no stale admin RSC
    // payloads linger after sign-out.
    window.location.replace("/admin/login");
  }

  // Desktop: fixed viewport height app-shell (no body scroll).
  // Mobile/tablet: natural document scroll using dvh so browser chrome never
  // cuts off content (e.g. Save buttons) the way 100vh / h-screen does.
  return (
    <ToastProvider>
      <ConfirmProvider>
    <div
      className="relative flex min-h-dvh flex-col overflow-x-hidden bg-gradient-to-br from-stone-100 via-meadow-50/40 to-sky-50/30 lg:h-dvh lg:max-h-dvh lg:overflow-hidden"
      data-admin="true"
    >
      {/* Top bar — strong presence, accent stripe */}
      <header className="sticky top-0 z-50 shrink-0 bg-white shadow-md ring-1 ring-black/5">
        <div className="h-1 w-full bg-gradient-to-r from-meadow-500 via-meadow-400 to-sky-400" aria-hidden />
        <Container size="xl" className="py-0">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-8 min-w-0">
              <Link
                href="/admin"
                className="flex items-center gap-2.5 py-4 shrink-0"
                aria-label="Admin home"
              >
                <span className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-meadow-600 to-meadow-700 px-4 py-2 text-xl font-bold tracking-tight text-white shadow-lg shadow-meadow-800/30 ring-1 ring-meadow-500/30">
                  Admin
                </span>
              </Link>
              <nav
                className="hidden sm:flex items-center gap-1"
                aria-label="Admin sections"
              >
                {NAV.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "flex items-center gap-2 rounded-xl px-4 py-3 text-[19px] font-semibold shadow-adminSm transition-all",
                        active
                          ? "bg-meadow-100 text-meadow-900 shadow-inner ring-1 ring-meadow-200"
                          : "text-gray-700 hover:bg-meadow-50 hover:text-meadow-900 hover:shadow-admin",
                      ].join(" ")}
                    >
                      <Icon size={20} className="shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-2 shrink-0 py-2">
              <Link
                href="/dogs"
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2.5 text-[19px] font-medium text-gray-800 shadow-adminSm ring-1 ring-stone-200 transition-all hover:bg-stone-200 hover:ring-stone-300 hover:shadow-admin"
              >
                <Dog size={18} />
                <span className="hidden xs:inline">Dogs</span>
                <ExternalLink size={14} />
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2.5 text-[19px] font-medium text-gray-800 shadow-adminSm ring-1 ring-stone-200 transition-all hover:bg-stone-200 hover:ring-stone-300 hover:shadow-admin"
              >
                <Home size={18} />
                <span className="hidden xs:inline">Back to site</span>
                <ChevronRight size={16} />
              </Link>
              {!isLoginPage ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[19px] font-semibold text-red-700 shadow-adminSm ring-1 ring-red-200 transition-all hover:bg-red-50 hover:ring-red-300 hover:shadow-admin disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <LogOut size={18} />
                  <span className="hidden xs:inline">{signingOut ? "Signing out…" : "Sign out"}</span>
                </button>
              ) : null}
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile nav — horizontally scrollable so the row never overflows the viewport */}
      <div className="sm:hidden shrink-0 overflow-x-auto border-b border-stone-200 bg-white px-4 py-3 shadow-sm [-webkit-overflow-scrolling:touch]">
        <nav className="flex items-center gap-1 min-w-max pb-1" aria-label="Admin sections">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[19px] font-semibold whitespace-nowrap shadow-adminSm transition-all",
                  active
                    ? "bg-meadow-100 text-meadow-900 ring-1 ring-meadow-200"
                    : "text-gray-700 hover:bg-meadow-50 hover:shadow-admin",
                ].join(" ")}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Page content — roomier padding, fixed height so content fits in view */}
      <main className="flex min-h-0 flex-1 flex-col px-5 py-4 sm:px-8 sm:py-5 lg:px-10">
        <Container size="xl" className="flex min-h-0 flex-1 flex-col">
          <div className="mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 flex-col">
            {/* Page hero */}
            {isDogsPage ? (
              <div className="mb-4 shrink-0 sm:mb-5">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
                {resolvedSubtitle ? <p className="mt-1.5 text-lg text-gray-600">{resolvedSubtitle}</p> : null}
              </div>
            ) : (
              <div className="mb-4 shrink-0 sm:mb-5">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
                {resolvedSubtitle ? <p className="mt-2 text-lg text-gray-600">{resolvedSubtitle}</p> : null}
                <div className="mt-2 h-0.5 w-16 rounded-full bg-meadow-300" aria-hidden />
              </div>
            )}

            {/* Main card — content scrolls when tall (e.g. merchant profile) so Save is reachable on all screens.
                On mobile the whole page scrolls; on lg the card scrolls internally. */}
            <div className={`${softShell("flex min-h-0 flex-1 flex-col p-0 shadow-adminLg ring-1 ring-black/5 lg:overflow-hidden")} flex flex-col`}>
              <div className="flex min-h-0 flex-1 flex-col rounded-b-2xl p-6 sm:p-8 lg:overflow-y-auto">
                {children}
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
