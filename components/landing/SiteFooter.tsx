"use client";

import * as React from "react";
import Link from "next/link";
import { Phone, MessageCircle, Heart } from "lucide-react";
import { SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";

import { Container } from "@/components/ui/Container";
import { useMerchantProfile } from "@/hooks/useMerchantProfile";

/**
 * Global footer for the public site.
 * Warm, calm, and consistent with the header — gives every page a clear
 * "contact + trust" anchor without duplicating the home hero's reserve band.
 */
export function SiteFooter() {
  const { profile } = useMerchantProfile();

  const displayName = profile?.display_name?.trim() || "The Wooof Village";
  const phone = profile?.phone?.trim() || "";
  const telHref = phone ? `tel:${phone}` : "";
  const smsHref = phone ? `sms:${phone}` : "";

  const socials = [
    profile?.instagram_url
      ? { key: "ig", label: "Instagram", href: profile.instagram_url, Icon: SiInstagram }
      : null,
    profile?.facebook_url
      ? { key: "fb", label: "Facebook", href: profile.facebook_url, Icon: SiFacebook }
      : null,
    profile?.tiktok_url
      ? { key: "tt", label: "TikTok", href: profile.tiktok_url, Icon: SiTiktok }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    href: string;
    Icon: React.ComponentType<{ size?: number }>;
  }>;

  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 sm:mt-20">
      {/* brand ribbon */}
      <div
        aria-hidden
        className="h-1.5 w-full bg-[linear-gradient(90deg,rgba(63,161,126,0.72)_0%,rgba(96,140,255,0.60)_55%,rgba(255,176,122,0.84)_118%)]"
      />

      <div className="border-t border-amber-950/12 bg-[rgba(255,250,244,0.90)]">
        <Container size="xl" className="py-10 sm:py-12">
          <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-12">
            {/* Brand + blurb */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-amber-950/14 bg-[rgba(255,248,238,0.92)] ring-1 ring-inset ring-white/20 shadow-soft">
                  <span className="text-xl" aria-hidden>
                    🐶
                  </span>
                </div>
                <div className="text-lg font-extrabold text-amber-950">{displayName}</div>
              </div>

              <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-ink-secondary">
                A small, home-raised program. We place a limited number of well-loved
                puppies each season and answer every message personally.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-amber-900/85">
                <span className="rounded-full border border-amber-950/14 bg-[rgba(255,248,240,0.86)] px-3 py-1.5 ring-1 ring-inset ring-white/16">
                  🏡 Home pickup
                </span>
                <span className="rounded-full border border-amber-950/14 bg-[rgba(255,248,240,0.86)] px-3 py-1.5 ring-1 ring-inset ring-white/16">
                  ⚡ Fast replies
                </span>
                <span className="rounded-full border border-amber-950/14 bg-[rgba(255,248,240,0.86)] px-3 py-1.5 ring-1 ring-inset ring-white/16">
                  🫶 Small batches
                </span>
              </div>
            </div>

            {/* Explore */}
            <nav className="lg:col-span-3" aria-label="Footer">
              <div className="text-xs font-black uppercase tracking-wider text-amber-900/85">
                Explore
              </div>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-ink-secondary">
                <li>
                  <Link href="/" className="hover:text-ink-primary">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/dogs" className="hover:text-ink-primary">
                    Available puppies
                  </Link>
                </li>
                <li>
                  <Link href="/#how" className="hover:text-ink-primary">
                    How adoption works
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="hover:text-ink-primary">
                    FAQ
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Contact + social */}
            <div className="lg:col-span-4">
              <div className="text-xs font-black uppercase tracking-wider text-amber-900/85">
                Get in touch
              </div>

              {phone ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={smsHref}
                    className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-white bg-[linear-gradient(90deg,rgba(63,161,126,1)_0%,rgba(96,140,255,0.86)_60%,rgba(255,176,122,0.92)_118%)] shadow-[0_14px_34px_-22px_rgba(17,24,39,0.6)] ring-1 ring-white/18 hover:-translate-y-px transition"
                  >
                    <MessageCircle size={16} />
                    Text us
                  </a>
                  <a
                    href={telHref}
                    className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-amber-950 bg-[rgba(255,246,235,0.92)] border border-amber-950/18 ring-1 ring-inset ring-white/20 hover:-translate-y-px transition"
                  >
                    <Phone size={16} />
                    Call
                  </a>
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-secondary">
                  Contact details are added in the admin profile.
                </p>
              )}

              {phone ? (
                <div className="mt-3 text-sm font-extrabold text-ink-primary">{phone}</div>
              ) : null}

              {socials.length > 0 ? (
                <div className="mt-5 flex items-center gap-2">
                  {socials.map((s) => {
                    const Icon = s.Icon;
                    return (
                      <a
                        key={s.key}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={s.label}
                        className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(255,248,240,0.86)] border border-amber-950/16 ring-1 ring-inset ring-white/18 text-amber-950/80 shadow-soft hover:-translate-y-px hover:text-amber-950 transition"
                      >
                        <Icon size={18} />
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          {/* bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-amber-950/10 pt-6 sm:flex-row">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
              <span>© {year} {displayName}.</span>
              <span className="inline-flex items-center gap-1">
                Made with <Heart size={12} className="text-rose-400" aria-hidden /> for good homes.
              </span>
            </div>
            <Link
              href="/admin"
              className="text-xs font-semibold text-ink-secondary/80 hover:text-ink-primary"
            >
              Owner login
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
