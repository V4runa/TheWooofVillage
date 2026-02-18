"use client";

import * as React from "react";
import { RefreshCw, Save, User, Phone, DollarSign, Share2, Pencil, X } from "lucide-react";

import type { MerchantProfile } from "@/types/merchant";
import { adminJson } from "@/lib/admin/apiClient";
import { btn, formatDate, alertErrorClass, inputClass } from "@/components/admin/AdminUi";

function linkOrDash(url: string | null | undefined): React.ReactNode {
  if (!url?.trim()) return "—";
  const href = url.startsWith("http") ? url : `https://${url}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-800 font-medium">
      {url.length > 44 ? `${url.slice(0, 44)}…` : url}
    </a>
  );
}

const sectionCard =
  "rounded-xl border-2 border-gray-300 bg-white p-4 shadow-sm sm:p-5";

/* -----------------------------
   Merchant Profile — Containerized sections + Edit modal (portal)
------------------------------ */
export function MerchantProfilePanel({ onToast }: { onToast: (msg: string) => void }) {
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<MerchantProfile | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);

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

  function emptyIfExample(s: string | null | undefined): string {
    const t = (s ?? "").trim().toLowerCase();
    return t === "example" ? "" : (s ?? "").trim();
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminJson<{ ok: true; profile: MerchantProfile | null }>(
        "/api/admin/merchant-profile"
      );
      const raw = data.profile ?? null;
      const p = raw
        ? {
            ...raw,
            instagram_url: emptyIfExample(raw.instagram_url) || null,
            facebook_url: emptyIfExample(raw.facebook_url) || null,
            tiktok_url: emptyIfExample(raw.tiktok_url) || null,
            venmo_url: emptyIfExample(raw.venmo_url) || null,
            cashapp_url: emptyIfExample(raw.cashapp_url) || null,
            paypal_url: emptyIfExample(raw.paypal_url) || null,
            zelle_recipient: emptyIfExample(raw.zelle_recipient) || null,
          }
        : null;
      setProfile(p);
      setDisplayName(p?.display_name ?? "");
      setTagline(p?.tagline ?? "");
      setAbout(p?.about ?? "");
      setPhone(p?.phone ?? "");
      setInstagram(emptyIfExample(p?.instagram_url));
      setFacebook(emptyIfExample(p?.facebook_url));
      setTiktok(emptyIfExample(p?.tiktok_url));
      setVenmo(emptyIfExample(p?.venmo_url));
      setCashapp(emptyIfExample(p?.cashapp_url));
      setPaypal(emptyIfExample(p?.paypal_url));
      setZelle(emptyIfExample(p?.zelle_recipient));
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

  function openEditModal() {
    const p = profile;
    setDisplayName(p?.display_name ?? "");
    setTagline(p?.tagline ?? "");
    setAbout(p?.about ?? "");
    setPhone(p?.phone ?? "");
    setInstagram(emptyIfExample(p?.instagram_url));
    setFacebook(emptyIfExample(p?.facebook_url));
    setTiktok(emptyIfExample(p?.tiktok_url));
    setVenmo(emptyIfExample(p?.venmo_url));
    setCashapp(emptyIfExample(p?.cashapp_url));
    setPaypal(emptyIfExample(p?.paypal_url));
    setZelle(emptyIfExample(p?.zelle_recipient));
    setError(null);
    setEditModalOpen(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        display_name,
        tagline,
        about,
        phone,
        instagram_url: emptyIfExample(instagram_url),
        facebook_url: emptyIfExample(facebook_url),
        tiktok_url: emptyIfExample(tiktok_url),
        venmo_url: emptyIfExample(venmo_url),
        cashapp_url: emptyIfExample(cashapp_url),
        paypal_url: emptyIfExample(paypal_url),
        zelle_recipient: emptyIfExample(zelle_recipient),
      };
      const data = await adminJson<{ ok: true; profile: MerchantProfile }>(
        "/api/admin/merchant-profile",
        { method: "PATCH", body: JSON.stringify(payload) }
      );
      setProfile(data.profile);
      setEditModalOpen(false);
      onToast("Profile saved.");
    } catch (e: any) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  React.useEffect(() => {
    if (!editModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editModalOpen]);

  return (
    <div className="space-y-5">
      {/* Top bar: clear container, visible buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-4 shadow-md sm:px-5 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-gray-400 bg-white text-gray-700">
            <User size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Merchant profile</h2>
            <p className="text-sm text-gray-600">Contact & payment info on dog pages</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`${btn("muted")} flex items-center gap-2 min-w-[120px] justify-center`}
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            className={`${btn("primary")} btn-admin-icon-primary shrink-0 transition-shadow duration-200`}
            onClick={openEditModal}
            aria-label="Update merchant details"
            title="Update merchant details"
          >
            <Pencil size={22} strokeWidth={2.25} className="shrink-0" />
          </button>
        </div>
      </div>

      {error ? <div className={alertErrorClass}>{error}</div> : null}

      {loading ? (
        <div className="space-y-3">
          <div className="h-20 rounded-xl border-2 border-gray-200 bg-gray-100 animate-pulse" />
          <div className="h-24 rounded-xl border-2 border-gray-200 bg-gray-100 animate-pulse" />
          <div className="h-20 rounded-xl border-2 border-gray-200 bg-gray-100 animate-pulse" />
        </div>
      ) : !profile ? (
        <div className={`${sectionCard} border-dashed border-gray-400 bg-gray-50 text-center`}>
          <p className="text-lg font-semibold text-gray-800">No profile yet</p>
          <p className="mt-1 text-gray-600">Click the green edit icon above to create one.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className={sectionCard}>
            <div className="mb-3 flex items-center gap-2 rounded-lg border-b-2 border-gray-200 bg-gray-100 px-3 py-2 text-sm font-bold uppercase tracking-wider text-gray-700">
              <User size={14} />
              Contact
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-gray-500">Display name</div>
                <div className="mt-0.5 text-base font-medium text-gray-900">{profile.display_name || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500">Phone</div>
                <div className="mt-0.5 text-base font-medium text-gray-900">{profile.phone || "—"}</div>
              </div>
            </div>
          </div>

          {(profile.tagline || profile.about) ? (
            <div className={sectionCard}>
              <div className="mb-3 rounded-lg border-b-2 border-gray-200 bg-gray-100 px-3 py-2 text-sm font-bold uppercase tracking-wider text-gray-700">
                About
              </div>
              {profile.tagline ? <p className="font-medium text-gray-900">{profile.tagline}</p> : null}
              {profile.about ? <p className="mt-2 whitespace-pre-wrap text-gray-800">{profile.about}</p> : null}
            </div>
          ) : null}

          <div className={sectionCard}>
            <div className="mb-3 flex items-center gap-2 rounded-lg border-b-2 border-gray-200 bg-gray-100 px-3 py-2 text-sm font-bold uppercase tracking-wider text-gray-700">
              <DollarSign size={14} />
              Payments
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-2 sm:block">
                <span className="font-medium text-gray-600">Venmo</span>
                <span className="text-gray-900">{linkOrDash(profile.venmo_url)}</span>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <span className="font-medium text-gray-600">Cash App</span>
                <span className="text-gray-900">{linkOrDash(profile.cashapp_url)}</span>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <span className="font-medium text-gray-600">PayPal</span>
                <span className="text-gray-900">{linkOrDash(profile.paypal_url)}</span>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <span className="font-medium text-gray-600">Zelle</span>
                <span className="font-medium text-gray-900">{profile.zelle_recipient?.trim() || "—"}</span>
              </div>
            </div>
          </div>

          <div className={sectionCard}>
            <div className="mb-3 flex items-center gap-2 rounded-lg border-b-2 border-gray-200 bg-gray-100 px-3 py-2 text-sm font-bold uppercase tracking-wider text-gray-700">
              <Share2 size={14} />
              Social
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-2 sm:block">
                <span className="font-medium text-gray-600">Instagram</span>
                <span className="text-gray-900">{linkOrDash(profile.instagram_url)}</span>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <span className="font-medium text-gray-600">Facebook</span>
                <span className="text-gray-900">{linkOrDash(profile.facebook_url)}</span>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <span className="font-medium text-gray-600">TikTok</span>
                <span className="text-gray-900">{linkOrDash(profile.tiktok_url)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-gray-100 px-4 py-3 text-sm">
            <span className="text-gray-600">Last updated: </span>
            <span className="font-semibold text-gray-900">{profile.updated_at ? formatDate(profile.updated_at) : "—"}</span>
          </div>
        </div>
      )}

      {/* Edit modal — inline, z-[9999]. Clear header + visible Update/Cancel buttons. */}
      {editModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          onClick={(e) => e.target === e.currentTarget && setEditModalOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border-4 border-gray-400 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex items-center justify-between gap-4 rounded-t-xl border-b-2 border-gray-300 bg-gray-200 px-4 py-3 sm:px-5 sm:py-4">
              <h2 id="edit-profile-title" className="text-lg font-bold text-gray-900 sm:text-xl">
                Update merchant details
              </h2>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-lg border-2 border-gray-400 bg-white p-2 text-gray-700 hover:bg-gray-100 hover:border-gray-500"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={display_name}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className={inputClass}
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your phone number"
                    className={inputClass}
                  />
                </div>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Short tagline for your listing"
                  className={inputClass}
                />
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="About you or your business"
                  className={`min-h-[100px] ${inputClass}`}
                />
                <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
                    <DollarSign size={16} />
                    Payments
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="merchant-venmo" className="mb-1 block text-sm font-semibold text-gray-700">Venmo</label>
                      <input id="merchant-venmo" value={venmo_url} onChange={(e) => setVenmo(e.target.value)} placeholder="" autoComplete="off" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="merchant-cashapp" className="mb-1 block text-sm font-semibold text-gray-700">Cash App</label>
                      <input id="merchant-cashapp" value={cashapp_url} onChange={(e) => setCashapp(e.target.value)} placeholder="" autoComplete="off" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="merchant-paypal" className="mb-1 block text-sm font-semibold text-gray-700">PayPal</label>
                      <input id="merchant-paypal" value={paypal_url} onChange={(e) => setPaypal(e.target.value)} placeholder="" autoComplete="off" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="merchant-zelle" className="mb-1 block text-sm font-semibold text-gray-700">Zelle</label>
                      <input id="merchant-zelle" value={zelle_recipient} onChange={(e) => setZelle(e.target.value)} placeholder="" autoComplete="off" className={inputClass} />
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
                    <Share2 size={16} />
                    Social
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="merchant-instagram" className="mb-1 block text-sm font-semibold text-gray-700">Instagram</label>
                      <input id="merchant-instagram" value={instagram_url} onChange={(e) => setInstagram(e.target.value)} placeholder="" autoComplete="off" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="merchant-facebook" className="mb-1 block text-sm font-semibold text-gray-700">Facebook</label>
                      <input id="merchant-facebook" value={facebook_url} onChange={(e) => setFacebook(e.target.value)} placeholder="" autoComplete="off" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="merchant-tiktok" className="mb-1 block text-sm font-semibold text-gray-700">TikTok</label>
                      <input id="merchant-tiktok" value={tiktok_url} onChange={(e) => setTiktok(e.target.value)} placeholder="" autoComplete="off" className={inputClass} />
                    </div>
                  </div>
                </div>
                {error ? <div className={alertErrorClass}>{error}</div> : null}
                <div className="flex flex-wrap items-center gap-3 border-t-2 border-gray-300 pt-4">
                  <button
                    type="button"
                    className={`${btn("primary")} btn-admin-icon-primary shrink-0 transition-shadow duration-200`}
                    onClick={() => void save()}
                    disabled={saving}
                    aria-label={saving ? "Saving…" : "Save changes"}
                    title={saving ? "Saving…" : "Save changes"}
                  >
                    {saving ? (
                      <RefreshCw size={22} strokeWidth={2.25} className="shrink-0 animate-spin" />
                    ) : (
                      <Save size={22} strokeWidth={2.25} className="shrink-0" />
                    )}
                  </button>
                  <button type="button" className={`${btn("muted")} min-w-[100px] justify-center`} onClick={() => setEditModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
