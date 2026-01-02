"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Copy, Phone, MessageCircle } from "lucide-react";
import { SiInstagram, SiFacebook, SiTiktok, SiVenmo, SiCashapp, SiPaypal } from "react-icons/si";

import type { Dog } from "@/types/dogs";
import type { MerchantProfile } from "@/types/merchant";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DogTile } from "@/components/dogs/DogTile";
import { ActionChip, IconDot } from "@/components/landing/ActionChip";

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function HomeHeroSlab({
  dogs,
  profile,
}: {
  dogs: Dog[];
  profile: MerchantProfile | null;
}) {
  const [toast, setToast] = React.useState<string | null>(null);

  const phone = profile?.phone?.trim() || "";
  const telHref = phone ? `tel:${phone}` : "";
  const smsHref = phone ? `sms:${phone}` : "";

  const featured = dogs.slice(0, 3);

  const payments = [
    profile?.venmo_url
      ? { key: "venmo", label: "Venmo", href: profile.venmo_url, Icon: SiVenmo }
      : null,
    profile?.cashapp_url
      ? { key: "cashapp", label: "Cash App", href: profile.cashapp_url, Icon: SiCashapp }
      : null,
    profile?.paypal_url
      ? { key: "paypal", label: "PayPal", href: profile.paypal_url, Icon: SiPaypal }
      : null,
    profile?.zelle_recipient
      ? { key: "zelle", label: "Zelle", value: profile.zelle_recipient }
      : null,
  ].filter(Boolean) as Array<
    | { key: string; label: string; href: string; Icon: React.ComponentType<{ size?: number }> }
    | { key: string; label: string; value: string }
  >;

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

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  // Link styled as a button (semantic: no nested interactive controls)
  const linkBtnBase =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold " +
    "select-none whitespace-nowrap cursor-pointer " +
    "transition-[transform,box-shadow,background-color,border-color,opacity,filter] duration-200 ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/55 " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(255,252,248,0.24)] " +
    "active:translate-y-[1px]";

  const linkBtnMd = "h-12 px-6 text-base";

  const linkBtnPrimary =
    "text-white " +
    "bg-[linear-gradient(90deg,rgba(63,161,126,1)_0%,rgba(96,140,255,0.86)_60%,rgba(255,176,122,0.92)_118%)] " +
    "shadow-[0_18px_44px_-20px_rgba(17,24,39,0.70)] ring-1 ring-white/18 " +
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
    "before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.22),transparent_62%)] before:opacity-60 " +
    "hover:-translate-y-[1px] hover:shadow-[0_26px_68px_-26px_rgba(17,24,39,0.78)] " +
    "hover:saturate-[1.05] hover:brightness-[1.02]";

  const linkBtnSecondary =
    "text-ink-primary " +
    "bg-[rgba(255,246,238,0.78)] border border-amber-950/18 ring-1 ring-inset ring-white/12 " +
    "shadow-[0_14px_34px_-18px_rgba(17,24,39,0.44)] " +
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
    "before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.18),transparent_62%)] before:opacity-55 " +
    "hover:-translate-y-[1px] hover:bg-[rgba(255,246,238,0.86)] hover:border-amber-950/26 " +
    "hover:shadow-[0_20px_48px_-22px_rgba(17,24,39,0.50)]";

  return (
    <div className="w-full">
      <Card variant="surface" className="overflow-hidden">
        {/* Thin brand ribbon = “premium product” cue */}
        <div
          aria-hidden
          className="h-1.5 w-full bg-[linear-gradient(90deg,rgba(63,161,126,0.78)_0%,rgba(96,140,255,0.64)_55%,rgba(255,176,122,0.86)_118%)]"
        />

        {/* TOP: hero content (keep calm; let global film do the mood) */}
        <div className="p-6 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              {/* Warm eyebrow, but not muddy */}
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-900/70">
                Puppies available now
              </div>

              {/* Color, but still clean/legible */}
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
                Meet your next best friend{" "}
           
                  today
  
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-ink-secondary max-w-[55ch]">
                Browse available pups. Tap a listing for photos, details, and how to reserve.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/dogs" className={[linkBtnBase, linkBtnMd, "relative", linkBtnPrimary].join(" ")}>
                  Browse puppies →
                </Link>

                <Link href="#pups" className={[linkBtnBase, linkBtnMd, "relative", linkBtnSecondary].join(" ")}>
                  Jump to grid ↓
                </Link>
              </div>

              {/* Small trust line (adds “airy clarity” + vibe) */}
              <div className="mt-4 text-xs font-semibold text-ink-secondary">
                <span className="text-amber-900/70">Tip:</span>{" "}
                Tap a pup to see photos, details, and deposit options.
              </div>
            </div>

            {/* featured tiles */}
            <div className="lg:col-span-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((d) => (
                  <DogTile key={d.id} dog={d} dense />
                ))}
              </div>

              {featured.length === 0 ? (
                <div className="mt-4 rounded-3xl border border-amber-950/14 ring-1 ring-inset ring-white/12 bg-[rgba(255,246,238,0.70)] p-5 shadow-[0_12px_34px_-22px_rgba(17,24,39,0.28)]">
                  <div className="text-sm font-extrabold text-ink-primary">No puppies posted yet</div>
                  <div className="mt-1 text-sm text-ink-secondary">
                    Check back soon, or use contact below to ask what’s coming next.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* BOTTOM: unified reserve band (warm but airy) */}
        <div className="border-t border-amber-950/14 bg-[rgba(255,246,238,0.62)]">
          <div className="grid gap-0 lg:grid-cols-12">
            {/* Contact */}
            <div className="lg:col-span-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-900/70">
                    Contact
                  </div>
                  <div className="mt-1 text-sm text-ink-secondary">
                    Text is fastest. Call if needed.
                  </div>
                </div>
                <Badge variant="neutral">💬 Quick</Badge>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Button
                  className="w-full gap-2"
                  size="sm"
                  onClick={() => {
                    if (!phone) return;
                    window.location.href = smsHref;
                  }}
                  disabled={!phone}
                >
                  <MessageCircle size={18} />
                  Text
                </Button>

                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  size="sm"
                  onClick={() => {
                    if (!phone) return;
                    window.location.href = telHref;
                  }}
                  disabled={!phone}
                >
                  <Phone size={18} />
                  Call
                </Button>
              </div>

              {phone ? (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-extrabold text-ink-primary bg-[rgba(255,246,238,0.78)] border border-amber-950/18 ring-1 ring-inset ring-white/12 rounded-xl px-3 py-2">
                    {phone}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={async () => {
                      const ok = await copyToClipboard(phone);
                      showToast(ok ? "Phone copied." : "Couldn’t copy.");
                    }}
                  >
                    <Copy size={14} />
                    Copy
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Payment */}
            <div className="lg:col-span-6 p-5 border-t lg:border-t-0 lg:border-l border-amber-950/14">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-900/70">
                    Deposit & Payment
                  </div>
                  <div className="mt-1 text-sm text-ink-secondary">
                    Pay deposit to reserve. Then{" "}
                    <span className="font-extrabold text-ink-primary">text/call</span>{" "}
                    to confirm.
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {payments.length === 0 ? (
                  <div className="text-sm text-ink-secondary">Payment links not set yet.</div>
                ) : (
                  payments.map((p) => {
                    if ("href" in p) {
                      const Icon = p.Icon;
                      return (
                        <ActionChip
                          key={p.key}
                          as="a"
                          href={p.href}
                          left={
                            <IconDot>
                              <Icon size={18} />
                            </IconDot>
                          }
                          right={
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-ink-secondary underline">
                              Open <ExternalLink size={14} />
                            </span>
                          }
                        >
                          <div className="text-sm font-extrabold text-ink-primary">{p.label}</div>
                        </ActionChip>
                      );
                    }

                    return (
                      <ActionChip
                        key={p.key}
                        as="button"
                        onClick={async () => {
                          const ok = await copyToClipboard(p.value);
                          showToast(ok ? "Zelle copied." : "Couldn’t copy.");
                        }}
                        left={<IconDot>🏦</IconDot>}
                        right={
                          <span className="text-xs font-extrabold text-ink-secondary underline">
                            Copy
                          </span>
                        }
                      >
                        <div className="text-sm font-extrabold text-ink-primary">Zelle</div>
                      </ActionChip>
                    );
                  })
                )}
              </div>
            </div>

            {/* Social */}
            <div className="lg:col-span-2 p-5 border-t lg:border-t-0 lg:border-l border-amber-950/14">
              <div className="text-xs font-black uppercase tracking-wider text-amber-900/70">
                Social
              </div>

              <div className="mt-3 grid gap-2">
                {socials.length === 0 ? (
                  <div className="text-sm text-ink-secondary">—</div>
                ) : (
                  socials.map((s) => {
                    const Icon = s.Icon;
                    return (
                      <ActionChip
                        key={s.key}
                        as="a"
                        href={s.href}
                        left={
                          <IconDot>
                            <Icon size={18} />
                          </IconDot>
                        }
                      >
                        <div className="text-sm font-extrabold text-ink-primary">{s.label}</div>
                      </ActionChip>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {toast ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-[rgba(255,246,238,0.82)] px-4 py-2 text-sm font-extrabold text-ink-primary border border-amber-950/16 ring-1 ring-inset ring-white/12 shadow-[0_14px_34px_-22px_rgba(17,24,39,0.30)]">
          <span aria-hidden>✅</span>
          <span>{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
