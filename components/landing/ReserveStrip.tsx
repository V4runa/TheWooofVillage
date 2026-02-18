"use client";

import * as React from "react";
import { ContactPanel } from "@/components/landing/ContactPanel";
import { PaymentPanel } from "@/components/landing/PaymentPanel";
import { SocialPanel } from "@/components/landing/SocialPanel";
import { useMerchantProfile } from "@/hooks/useMerchantProfile";

export function ReserveStrip() {
  const { profile } = useMerchantProfile();
  const [toast, setToast] = React.useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <section className="w-full">
      <div className="grid gap-4 lg:grid-cols-12 lg:items-stretch">
        {/* LEFT: Contact + Social */}
        <div className="lg:col-span-4 grid gap-4">
          <ContactPanel
            phone={profile?.phone?.trim() || null}
            onToast={showToast}
            compact
          />

          <SocialPanel profile={profile ?? null} compact />
        </div>

        {/* RIGHT: Payment (wide) */}
        <div className="lg:col-span-8">
          <PaymentPanel profile={profile ?? null} onToast={showToast} compact />
        </div>
      </div>

      {toast ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-[rgba(255,252,248,0.95)] backdrop-blur-md px-4 py-2 text-sm font-extrabold text-ink-primary border border-amber-950/12 ring-1 ring-inset ring-white/20 shadow-soft">
          <span className="text-base" aria-hidden>
            ✅
          </span>
          <span>{toast}</span>
        </div>
      ) : null}
    </section>
  );
}
