"use client";

import * as React from "react";
import { RefreshCw, Save, User, Phone, DollarSign, Share2, CreditCard } from "lucide-react";

import type { MerchantProfile } from "@/types/merchant";
import { adminJson } from "@/lib/admin/apiClient";
import { softShell, btn, formatDate, alertErrorClass, inputClass, ADMIN_TOPPER_STYLES } from "@/components/admin/AdminUi";

/* -----------------------------
   Merchant Profile Panel
------------------------------ */
export function MerchantProfilePanel({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [profile, setProfile] = React.useState<MerchantProfile | null>(null);

  const [display_name, setDisplayName] = React.useState("");
  const [tagline, setTagline] = React.useState("");
  const [about, setAbout] = React.useState("");

  const [phone, setPhone] = React.useState("");

  const [instagram_url, setInstagram] = React.useState("");
  const [facebook_url, setFacebook] = React.useState("");
  const [tiktok_url, setTiktok] = React.useState("");

  const [venmo_url, setVenmo] = React.useState("");
  const [cashapp_url, setCashapp] = React.useState("");
  const [paypal_url, setPaypal] = React.useState("");
  const [zelle_recipient, setZelle] = React.useState("");

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const data = await adminJson<{ ok: true; profile: MerchantProfile | null }>(
        "/api/admin/merchant-profile"
      );

      const p = data.profile ?? null;
      setProfile(p);

      setDisplayName(p?.display_name ?? "");
      setTagline(p?.tagline ?? "");
      setAbout(p?.about ?? "");
      setPhone(p?.phone ?? "");

      setInstagram(p?.instagram_url ?? "");
      setFacebook(p?.facebook_url ?? "");
      setTiktok(p?.tiktok_url ?? "");

      setVenmo(p?.venmo_url ?? "");
      setCashapp(p?.cashapp_url ?? "");
      setPaypal(p?.paypal_url ?? "");
      setZelle(p?.zelle_recipient ?? "");
    } catch (e: any) {
      setError(e?.message || "Could not load profile.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  async function save() {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        display_name,
        tagline,
        about,
        phone,
        instagram_url,
        facebook_url,
        tiktok_url,
        venmo_url,
        cashapp_url,
        paypal_url,
        zelle_recipient,
      };

      const data = await adminJson<{ ok: true; profile: MerchantProfile }>(
        "/api/admin/merchant-profile",
        { method: "PATCH", body: JSON.stringify(payload) }
      );

      setProfile(data.profile);
      onToast("Profile saved.");
    } catch (e: any) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className={`${softShell("overflow-hidden p-0")}`}>
        <div className="h-2.5 w-full shrink-0 rounded-t-2xl" style={ADMIN_TOPPER_STYLES.stone} aria-hidden />
        <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-meadow-100 p-3 ring-1 ring-meadow-200">
              <User size={22} className="text-meadow-800" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">Merchant profile</div>
              <div className="mt-1 text-lg text-gray-600">
                This feeds payment links + phone on the dog detail page.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className={`${btn("muted")} flex items-center gap-2`} onClick={load}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button className={`${btn("primary")} flex items-center gap-2`} onClick={save} disabled={saving}>
              <Save size={14} />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {error ? <div className={`mt-4 ${alertErrorClass}`}>{error}</div> : null}
        </div>
      </div>

      <div className={softShell("p-6 sm:p-8")}>
        {loading ? (
          <div className="space-y-3">
            <div className="h-10 rounded-2xl bg-black/10 animate-pulse" />
            <div className="h-10 rounded-2xl bg-black/10 animate-pulse" />
            <div className="h-24 rounded-2xl bg-black/10 animate-pulse" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={display_name}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                className={inputClass}
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (e.g. 555-555-5555)"
                className={inputClass}
              />
            </div>

            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Tagline"
              className={inputClass}
            />

            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="About"
              className={`min-h-[120px] ${inputClass}`}
            />

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-adminSm">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <DollarSign size={14} />
                Payments
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={venmo_url}
                  onChange={(e) => setVenmo(e.target.value)}
                  placeholder="Venmo URL"
                  className={inputClass}
                />
                <input
                  value={cashapp_url}
                  onChange={(e) => setCashapp(e.target.value)}
                  placeholder="Cash App URL"
                  className={inputClass}
                />
                <input
                  value={paypal_url}
                  onChange={(e) => setPaypal(e.target.value)}
                  placeholder="PayPal URL"
                  className={inputClass}
                />
                <input
                  value={zelle_recipient}
                  onChange={(e) => setZelle(e.target.value)}
                  placeholder="Zelle recipient"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-adminSm">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <Share2 size={14} />
                Social
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={instagram_url}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Instagram URL"
                  className={inputClass}
                />
                <input
                  value={facebook_url}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="Facebook URL"
                  className={inputClass}
                />
                <input
                  value={tiktok_url}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="TikTok URL"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="text-lg text-gray-600">
              Last updated:{" "}
              <span className="font-semibold text-gray-900">
                {profile?.updated_at ? formatDate(profile.updated_at) : "—"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
