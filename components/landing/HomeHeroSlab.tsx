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
  ].filter(Boolean) as any[];

  const socials = [
    profile?.instagram_url ? { key: "ig", label: "Instagram", href: profile.instagram_url, Icon: SiInstagram } : null,
    profile?.facebook_url ? { key: "fb", label: "Facebook", href: profile.facebook_url, Icon: SiFacebook } : null,
    profile?.tiktok_url ? { key: "tt", label: "TikTok", href: profile.tiktok_url, Icon: SiTiktok } : null,
  ].filter(Boolean) as any[];

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="w-full">
      <Card
        variant="surface"
        className="bg-white/45 border border-black/6 shadow-soft"
      >
        {/* TOP: hero content */}
        <div className="p-6 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-4">
              <div className="text-[11px] font-black uppercase tracking-wider text-ink-muted">
                Puppies available now
              </div>

              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
                Meet your next best friend
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-ink-secondary max-w-[55ch]">
                Browse available pups. Tap a listing for photos, details, and how to reserve.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/dogs">
                  <Button variant="primary" size="md">
                    Browse puppies →
                  </Button>
                </Link>
                <Link href="#pups">
                  <Button variant="secondary" size="md">
                    Jump to grid ↓
                  </Button>
                </Link>
              </div>
            </div>

            {/* featured tiles */}
            <div className="lg:col-span-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((d) => (
                  <DogTile key={d.id} dog={d} dense />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: one unified reserve band */}
        <div className="border-t border-black/5 bg-white/35">
          <div className="grid gap-0 lg:grid-cols-12">
            {/* Contact */}
            <div className="lg:col-span-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-ink-muted">
                    Contact
                  </div>
                  <div className="mt-1 text-sm text-ink-secondary">
                    Text is fastest. Call if needed.
                  </div>
                </div>
                <Badge variant="neutral">💬 Quick</Badge>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <a
                  href={smsHref || undefined}
                  className={!phone ? "pointer-events-none opacity-50" : ""}
                >
                  <Button className="w-full gap-2" size="sm">
                    <MessageCircle size={18} />
                    Text
                  </Button>
                </a>

                <a
                  href={telHref || undefined}
                  className={!phone ? "pointer-events-none opacity-50" : ""}
                >
                  <Button variant="secondary" className="w-full gap-2" size="sm">
                    <Phone size={18} />
                    Call
                  </Button>
                </a>
              </div>

              {phone ? (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-bold text-ink-primary bg-white/70 border border-black/5 rounded-xl px-3 py-2">
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
            <div className="lg:col-span-6 p-5 border-t lg:border-t-0 lg:border-l border-black/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-ink-muted">
                    Deposit & Payment
                  </div>
                  <div className="mt-1 text-sm text-ink-secondary">
                    Pay deposit to reserve. Then <span className="font-bold text-ink-primary">text/call</span> to confirm.
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {payments.length === 0 ? (
                  <div className="text-sm text-ink-secondary opacity-80">
                    Payment links not set yet.
                  </div>
                ) : (
                  payments.map((p) => {
                    if (p.href) {
                      const Icon = p.Icon;
                      return (
                        <a
                          key={p.key}
                          href={p.href}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 border border-black/5 px-4 py-3 hover:bg-white/80 transition"
                        >
                          <span className="inline-flex items-center gap-2 text-sm font-extrabold text-ink-primary">
                            <Icon size={18} />
                            {p.label}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-ink-secondary underline">
                            Open <ExternalLink size={14} />
                          </span>
                        </a>
                      );
                    }

                    return (
                      <button
                        key={p.key}
                        onClick={async () => {
                          const ok = await copyToClipboard(p.value);
                          showToast(ok ? "Zelle copied." : "Couldn’t copy.");
                        }}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 border border-black/5 px-4 py-3 hover:bg-white/80 transition"
                      >
                        <span className="text-sm font-extrabold text-ink-primary">Zelle</span>
                        <span className="text-xs font-bold text-ink-secondary underline">
                          Copy
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Social */}
            <div className="lg:col-span-2 p-5 border-t lg:border-t-0 lg:border-l border-black/5">
              <div className="text-xs font-black uppercase tracking-wider text-ink-muted">
                Social
              </div>
              <div className="mt-3 grid gap-2">
                {socials.length === 0 ? (
                  <div className="text-sm text-ink-secondary opacity-80">—</div>
                ) : (
                  socials.map((s) => {
                    const Icon = s.Icon;
                    return (
                      <a
                        key={s.key}
                        href={s.href}
                        className="flex items-center gap-2 rounded-2xl bg-white/70 border border-black/5 px-4 py-3 hover:bg-white/80 transition"
                      >
                        <Icon size={18} />
                        <span className="text-sm font-extrabold text-ink-primary">{s.label}</span>
                      </a>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {toast ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-md px-4 py-2 text-sm font-extrabold text-ink-primary border border-black/5 shadow-soft">
          <span aria-hidden>✅</span>
          <span>{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
