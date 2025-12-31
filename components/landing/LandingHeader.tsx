"use client";

import * as React from "react";
import Link from "next/link";
import { Phone, MessageCircle, Copy, ExternalLink, CircleDollarSign } from "lucide-react";
import { SiInstagram, SiFacebook, SiTiktok, SiVenmo, SiCashapp, SiPaypal } from "react-icons/si";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ActionChip, IconDot } from "@/components/landing/ActionChip";

import { useMerchantProfile } from "@/hooks/useMerchantProfile";

type LandingHeaderProps = {
  pupsAnchorId?: string;
};

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}


export function LandingHeader({ pupsAnchorId = "pups" }: LandingHeaderProps) {
  const { profile, loading } = useMerchantProfile();
  const [toast, setToast] = React.useState<string | null>(null);

  const displayName = profile?.display_name?.trim() || "The Wooof Village";
  const tagline = profile?.tagline?.trim() || "Simple, honest rehoming";

  const phone = profile?.phone?.trim() || "";
  const telHref = phone ? `tel:${phone}` : "";
  const smsHref = phone ? `sms:${phone}` : "";

  const paymentLinks = React.useMemo(() => {
    return [
      profile?.venmo_url
        ? { key: "venmo", label: "Venmo", href: profile.venmo_url, Icon: SiVenmo, dot: "text-[#3D95CE]" }
        : null,
      profile?.cashapp_url
        ? { key: "cashapp", label: "Cash App", href: profile.cashapp_url, Icon: SiCashapp, dot: "text-[#00D632]" }
        : null,
      profile?.paypal_url
        ? { key: "paypal", label: "PayPal", href: profile.paypal_url, Icon: SiPaypal, dot: "text-[#003087]" }
        : null,
      profile?.zelle_recipient
        ? { key: "zelle", label: "Zelle", value: profile.zelle_recipient, dot: "text-sky-700" }
        : null,
    ].filter(Boolean) as Array<
      | { key: string; label: string; href: string; Icon: React.ComponentType<{ size?: number }>; dot: string }
      | { key: string; label: string; value: string; dot: string }
    >;
  }, [profile?.venmo_url, profile?.cashapp_url, profile?.paypal_url, profile?.zelle_recipient]);

  const socials = React.useMemo(() => {
    return [
      profile?.instagram_url
        ? { key: "instagram", label: "Instagram", href: profile.instagram_url, Icon: SiInstagram, dot: "text-[#E1306C]" }
        : null,
      profile?.facebook_url
        ? { key: "facebook", label: "Facebook", href: profile.facebook_url, Icon: SiFacebook, dot: "text-[#1877F2]" }
        : null,
      profile?.tiktok_url
        ? { key: "tiktok", label: "TikTok", href: profile.tiktok_url, Icon: SiTiktok, dot: "text-black" }
        : null,
    ].filter(Boolean) as Array<{
      key: string;
      label: string;
      href: string;
      Icon: React.ComponentType<{ size?: number }>;
      dot: string;
    }>;
  }, [profile?.instagram_url, profile?.facebook_url, profile?.tiktok_url]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <header className="w-full">
      {/* Sticky top bar (brand + small trust chips + CTA) */}
      <div className="sticky top-0 z-50">
        <div className="bg-white/35 backdrop-blur-md border-b border-black/5">
          <Container size="xl" className="py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 ring-1 ring-black/5 shadow-soft">
                  <span className="text-xl" aria-hidden>
                    🐶
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="truncate text-base sm:text-lg font-extrabold text-ink-primary">
                    {loading ? "Loading…" : displayName}
                  </div>
                  <div className="truncate text-xs sm:text-sm text-ink-secondary">
                    {tagline}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <Badge variant="neutral">🏡 Home pickup</Badge>
                <Badge variant="neutral">⚡ Fast replies</Badge>
                <Badge variant="neutral">🫶 Small batches</Badge>
              </div>

              <div className="shrink-0">
                <Link href={`#${pupsAnchorId}`}>
                  <Button size="sm" variant="secondary">
                    View puppies →
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Reserve panel (separate from sticky nav) */}
      <Container size="xl" className="pt-6">
        <Card variant="elevated" className="p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Contact */}
            <section className="lg:col-span-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-ink-muted">
                    Contact
                  </div>
                  <div className="mt-1 text-sm text-ink-secondary">
                    Text is fastest. Call if needed.
                  </div>
                </div>
                <Badge variant="primary">💬 Quick confirm</Badge>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <a
                  href={smsHref || undefined}
                  className={[
                    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold",
                    "bg-ink-primary text-white shadow-medium",
                    "hover:-translate-y-[1px] active:translate-y-0",
                    !phone && "opacity-50 pointer-events-none",
                  ].join(" ")}
                >
                  <MessageCircle size={18} />
                  Text
                </a>

                <a
                  href={telHref || undefined}
                  className={[
                    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold",
                    "bg-white/80 backdrop-blur-md text-ink-primary",
                    "border border-black/5 ring-1 ring-black/5 shadow-soft",
                    "hover:-translate-y-[1px] active:translate-y-0",
                    !phone && "opacity-50 pointer-events-none",
                  ].join(" ")}
                >
                  <Phone size={18} />
                  Call
                </a>
              </div>

              {phone ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-xl bg-white/70 border border-black/5 ring-1 ring-black/5 px-3 py-2 text-xs font-bold text-ink-primary">
                    {phone}
                  </span>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const ok = await copyToClipboard(phone);
                      showToast(ok ? "Phone copied." : "Couldn’t copy.");
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Copy size={14} /> Copy
                    </span>
                  </Button>
                </div>
              ) : null}
            </section>

            {/* Payment + Social */}
            <section className="lg:col-span-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-ink-muted">
                    Deposit & Payment
                  </div>
                  <p className="mt-1 text-sm text-ink-secondary">
                    Pay deposit to reserve. Then{" "}
                    <span className="font-extrabold text-ink-primary">text/call</span>{" "}
                    to confirm.
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-ink-muted">
                  <CircleDollarSign size={18} />
                  <span className="text-xs font-bold">Direct to owner</span>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {paymentLinks.length === 0 ? (
                  <div className="text-sm text-ink-secondary opacity-80">
                    Payment links not set yet.
                  </div>
                ) : (
                  paymentLinks.map((p) => {
                    if ("href" in p) {
                      const Icon = p.Icon;
                      return (
                        <ActionChip
                          key={p.key}
                          as="a"
                          href={p.href}
                          left={
                            <IconDot className={p.dot}>
                              <Icon size={18} />
                            </IconDot>
                          }
                          right={
                            <span className="text-xs font-extrabold text-ink-secondary underline inline-flex items-center gap-1">
                              Open <ExternalLink size={14} />
                            </span>
                          }
                        >
                          <div className="truncate text-sm font-extrabold text-ink-primary">
                            {p.label}
                          </div>
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
                        left={
                          <IconDot className={p.dot}>
                            <span className="text-xs font-black">Z</span>
                          </IconDot>
                        }
                        right={<Badge variant="secondary">Copy</Badge>}
                      >
                        <div className="truncate text-sm font-extrabold text-ink-primary">
                          Zelle
                        </div>
                        <div className="truncate text-xs text-ink-secondary">
                          {p.value}
                        </div>
                      </ActionChip>
                    );
                  })
                )}
              </div>

              {socials.length > 0 ? (
                <div className="mt-4">
                  <div className="text-xs font-black uppercase tracking-wider text-ink-muted">
                    Social
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {socials.map(({ key, label, href, Icon, dot }) => (
                      <ActionChip
                        key={key}
                        as="a"
                        href={href}
                        left={
                          <IconDot className={dot}>
                            <Icon size={18} />
                          </IconDot>
                        }
                      >
                        <div className="truncate text-sm font-extrabold text-ink-primary">
                          {label}
                        </div>
                      </ActionChip>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </Card>

        {toast ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-md px-4 py-2 text-sm font-extrabold text-ink-primary border border-black/5 ring-1 ring-black/5 shadow-soft">
            <span className="text-base" aria-hidden>
              ✅
            </span>
            <span>{toast}</span>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
