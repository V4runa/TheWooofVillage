"use client";

import * as React from "react";
import {
  RefreshCw,
  Save,
  User,
  DollarSign,
  Share2,
  Pencil,
  X,
  Check,
  AlertCircle,
  Phone,
  Info,
} from "lucide-react";

import type { MerchantProfile } from "@/types/merchant";
import { adminJson } from "@/lib/admin/apiClient";
import {
  btn,
  formatDate,
  alertErrorClass,
  inputClass,
  softShell,
  labelClass,
  fieldHintClass,
  ADMIN_TOPPER_STYLES,
  type AdminTopperAccent,
} from "@/components/admin/AdminUi";
import { useToast } from "@/components/admin/Toast";
import { parseCashtag, parseVenmoUser, parsePaypalUser } from "@/lib/payments";
import { formatUsPhone } from "@/lib/format";

type PayId = "venmo" | "cashapp" | "paypal" | "zelle";

/* -----------------------------
   Small presentational helpers
------------------------------ */

/** Card with a colored topper + icon header, matching the rest of the admin. */
function SectionCard({
  accent,
  icon,
  title,
  desc,
  children,
}: {
  accent: AdminTopperAccent;
  icon: React.ReactNode;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={softShell("overflow-hidden")}>
      <div className="h-1.5 w-full" style={ADMIN_TOPPER_STYLES[accent]} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-stone-50 text-gray-700 ring-1 ring-stone-200">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {desc ? <p className="mt-0.5 text-sm text-gray-600">{desc}</p> : null}
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

/** Turn a stored payment value into the friendly handle buyers will see. */
function describePayment(id: PayId, value?: string | null): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  if (id === "cashapp") return parseCashtag(v) ?? v;
  if (id === "venmo") {
    const u = parseVenmoUser(v);
    return u ? `@${u}` : v;
  }
  if (id === "paypal") {
    const u = parsePaypalUser(v);
    return u ? `paypal.me/${u}` : v;
  }
  return v; // zelle
}

/** Live "this is what buyers will use" confirmation under a payment input. */
function PaymentPreview({ id, value }: { id: PayId; value: string }) {
  const v = value.trim();
  if (!v) return null;

  let ok = true;
  let label = "";

  if (id === "cashapp") {
    const t = parseCashtag(v);
    ok = !!t;
    label = t ? `Buyers will pay to ${t}` : "Hmm — we couldn't find a $Cashtag in that.";
  } else if (id === "venmo") {
    const u = parseVenmoUser(v);
    ok = !!u;
    label = u ? `Buyers will pay to @${u}` : "Hmm — we couldn't find a username in that.";
  } else if (id === "paypal") {
    const u = parsePaypalUser(v);
    ok = !!u;
    label = u ? `Buyers will pay at paypal.me/${u}` : "Hmm — we couldn't find a PayPal.me name.";
  } else {
    ok = true;
    label = `Buyers will send to ${v}`;
  }

  return (
    <div
      className={`mt-1.5 flex items-start gap-1.5 text-sm font-medium ${
        ok ? "text-meadow-700" : "text-sun-700"
      }`}
    >
      {ok ? (
        <Check size={15} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={15} className="mt-0.5 shrink-0" />
      )}
      <span>{label}</span>
    </div>
  );
}

function ReadRow({
  id,
  label,
  value,
}: {
  id: PayId | "social";
  label: string;
  value?: string | null;
}) {
  const active = !!value?.trim();
  const shown =
    id === "social" ? (value ?? "").trim() : describePayment(id as PayId, value);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3.5 py-3">
      <div className="min-w-0">
        <div className="text-[15px] font-bold text-gray-800">{label}</div>
        <div className="truncate text-sm text-gray-500">{active ? shown : "Not set"}</div>
      </div>
      <span
        className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${
          active
            ? "bg-meadow-100 text-meadow-800 ring-1 ring-meadow-200"
            : "bg-stone-100 text-gray-500 ring-1 ring-stone-200"
        }`}
      >
        {active ? "Shown to buyers" : "Hidden"}
      </span>
    </div>
  );
}

/** Labeled form field with optional hint + live preview slot. */
function Field({
  label,
  htmlFor,
  hint,
  recommended,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  recommended?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {recommended ? (
          <span className="ml-1.5 text-sm font-semibold text-meadow-700">recommended</span>
        ) : null}
      </label>
      {children}
      {hint ? <p className={fieldHintClass}>{hint}</p> : null}
    </div>
  );
}

/* -----------------------------
   Merchant Profile panel
------------------------------ */
export function MerchantProfilePanel() {
  const { showToast } = useToast();
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

  function hydrate(p: MerchantProfile | null) {
    setDisplayName(p?.display_name ?? "");
    setTagline(p?.tagline ?? "");
    setAbout(p?.about ?? "");
    setPhone(formatUsPhone(p?.phone ?? ""));
    setInstagram(emptyIfExample(p?.instagram_url));
    setFacebook(emptyIfExample(p?.facebook_url));
    setTiktok(emptyIfExample(p?.tiktok_url));
    setVenmo(emptyIfExample(p?.venmo_url));
    setCashapp(emptyIfExample(p?.cashapp_url));
    setPaypal(emptyIfExample(p?.paypal_url));
    setZelle(emptyIfExample(p?.zelle_recipient));
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
      hydrate(p);
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
    hydrate(profile);
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
      showToast("Profile saved.");
    } catch (e: any) {
      const msg = e?.message || "Save failed.";
      setError(msg);
      showToast(msg, "error");
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

  const anyPayments =
    !!profile?.venmo_url ||
    !!profile?.cashapp_url ||
    !!profile?.paypal_url ||
    !!profile?.zelle_recipient;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={softShell("overflow-hidden")}>
        <div className="h-1.5 w-full" style={ADMIN_TOPPER_STYLES.meadow} />
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-meadow-50 text-meadow-700 ring-1 ring-meadow-200">
              <User size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your profile</h2>
              <p className="text-sm text-gray-600">
                The contact &amp; payment info adopters see on every puppy page.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`${btn("muted")} min-w-[120px]`}
              onClick={load}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              className={btn("primary")}
              onClick={openEditModal}
              title="Edit your profile"
            >
              <Pencil size={18} />
              Edit profile
            </button>
          </div>
        </div>
      </div>

      {error ? <div className={alertErrorClass}>{error}</div> : null}

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 rounded-2xl bg-stone-100 animate-pulse" />
          <div className="h-40 rounded-2xl bg-stone-100 animate-pulse" />
          <div className="h-32 rounded-2xl bg-stone-100 animate-pulse" />
        </div>
      ) : !profile ? (
        <div className={softShell("p-6 text-center")}>
          <p className="text-lg font-bold text-gray-900">Let&apos;s set up your profile</p>
          <p className="mt-1 text-gray-600">
            Add your contact and payment details so adopters can reach you and pay.
          </p>
          <button type="button" className={`${btn("primary")} mt-4`} onClick={openEditModal}>
            <Pencil size={18} />
            Set up profile
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Business identity */}
          <SectionCard
            accent="meadow"
            icon={<User size={20} />}
            title="Business identity"
            desc="Your name, tagline, and story shown across the site."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Display name
                </div>
                <div className="mt-0.5 text-base font-semibold text-gray-900">
                  {profile.display_name || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Phone
                </div>
                <div className="mt-0.5 text-base font-semibold text-gray-900">
                  {profile.phone || "—"}
                </div>
              </div>
            </div>
            {profile.tagline ? (
              <p className="mt-4 font-medium text-gray-900">{profile.tagline}</p>
            ) : null}
            {profile.about ? (
              <p className="mt-2 whitespace-pre-wrap text-gray-700">{profile.about}</p>
            ) : null}
          </SectionCard>

          {/* Payments */}
          <SectionCard
            accent="sun"
            icon={<DollarSign size={20} />}
            title="Payments"
            desc="Each one you add becomes a one-tap “Pay” button on every puppy page."
          >
            {anyPayments ? null : (
              <div className="mb-3 flex items-start gap-2 rounded-xl bg-sun-50 px-3.5 py-3 text-sm font-medium text-sun-800 ring-1 ring-sun-200">
                <Info size={16} className="mt-0.5 shrink-0" />
                No payment methods yet — add at least one so adopters can send a deposit.
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              <ReadRow id="cashapp" label="Cash App" value={profile.cashapp_url} />
              <ReadRow id="venmo" label="Venmo" value={profile.venmo_url} />
              <ReadRow id="paypal" label="PayPal" value={profile.paypal_url} />
              <ReadRow id="zelle" label="Zelle" value={profile.zelle_recipient} />
            </div>
          </SectionCard>

          {/* Social */}
          <SectionCard
            accent="sky"
            icon={<Share2 size={20} />}
            title="Social links"
            desc="Optional links to your social profiles."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <ReadRow id="social" label="Instagram" value={profile.instagram_url} />
              <ReadRow id="social" label="Facebook" value={profile.facebook_url} />
              <ReadRow id="social" label="TikTok" value={profile.tiktok_url} />
            </div>
          </SectionCard>

          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
            <span className="text-gray-600">Last updated: </span>
            <span className="font-semibold text-gray-900">
              {profile.updated_at ? formatDate(profile.updated_at) : "—"}
            </span>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          onClick={(e) => e.target === e.currentTarget && setEditModalOpen(false)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full shrink-0" style={ADMIN_TOPPER_STYLES.meadow} />
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-stone-50 px-4 py-3 sm:px-5 sm:py-4">
              <div>
                <h2 id="edit-profile-title" className="text-lg font-bold text-gray-900 sm:text-xl">
                  Edit your profile
                </h2>
                <p className="text-sm text-gray-600">Changes go live on your puppy pages right away.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-lg bg-white p-2 text-gray-700 ring-1 ring-stone-300 hover:bg-stone-100"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="grid gap-6">
                {/* Business identity */}
                <section className="grid gap-4">
                  <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <User size={18} className="text-meadow-600" />
                    Business identity
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Display name"
                      htmlFor="merchant-name"
                      recommended
                      hint="Shown as your site name in the header."
                    >
                      <input
                        id="merchant-name"
                        value={display_name}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="The Wooof Village"
                        className={inputClass}
                      />
                    </Field>
                    <Field
                      label="Phone"
                      htmlFor="merchant-phone"
                      recommended
                      hint="Powers the “Text to reserve” and “Call” buttons on puppy pages."
                    >
                      <input
                        id="merchant-phone"
                        value={phone}
                        onChange={(e) => setPhone(formatUsPhone(e.target.value))}
                        type="tel"
                        inputMode="tel"
                        placeholder="(555) 123-4567"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <Field
                    label="Tagline"
                    htmlFor="merchant-tagline"
                    hint="One short line that sums up your program."
                  >
                    <input
                      id="merchant-tagline"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Boutique, home-raised puppies"
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label="About"
                    htmlFor="merchant-about"
                    hint="Tell adopters about you, your breed, and how you raise your puppies."
                  >
                    <textarea
                      id="merchant-about"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Share a little about your program…"
                      className={`min-h-[110px] ${inputClass}`}
                    />
                  </Field>
                </section>

                {/* Payments */}
                <section className="grid gap-4 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
                  <div>
                    <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                      <DollarSign size={18} className="text-sun-600" />
                      Payments
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Paste your full profile link <span className="font-semibold">or</span> just
                      your handle — either works. Each one becomes a “Pay” button for adopters.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Cash App"
                      htmlFor="merchant-cashapp"
                      hint="Your $Cashtag."
                    >
                      <input
                        id="merchant-cashapp"
                        value={cashapp_url}
                        onChange={(e) => setCashapp(e.target.value)}
                        placeholder="$TheWooofVillage"
                        autoComplete="off"
                        className={inputClass}
                      />
                      <PaymentPreview id="cashapp" value={cashapp_url} />
                    </Field>
                    <Field
                      label="Venmo"
                      htmlFor="merchant-venmo"
                      hint="Your @username (amount pre-fills in the phone app)."
                    >
                      <input
                        id="merchant-venmo"
                        value={venmo_url}
                        onChange={(e) => setVenmo(e.target.value)}
                        placeholder="@TheWooofVillage"
                        autoComplete="off"
                        className={inputClass}
                      />
                      <PaymentPreview id="venmo" value={venmo_url} />
                    </Field>
                    <Field
                      label="PayPal"
                      htmlFor="merchant-paypal"
                      hint="Your PayPal.me link or username."
                    >
                      <input
                        id="merchant-paypal"
                        value={paypal_url}
                        onChange={(e) => setPaypal(e.target.value)}
                        placeholder="paypal.me/TheWooofVillage"
                        autoComplete="off"
                        className={inputClass}
                      />
                      <PaymentPreview id="paypal" value={paypal_url} />
                    </Field>
                    <Field
                      label="Zelle"
                      htmlFor="merchant-zelle"
                      hint="The email or phone number people send Zelle to."
                    >
                      <input
                        id="merchant-zelle"
                        value={zelle_recipient}
                        onChange={(e) => setZelle(e.target.value)}
                        placeholder="pay@thewooofvillage.com"
                        autoComplete="off"
                        className={inputClass}
                      />
                      <PaymentPreview id="zelle" value={zelle_recipient} />
                    </Field>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Phone size={15} className="mt-0.5 shrink-0 text-gray-400" />
                    Zelle has no payment link — adopters copy this and send it from their bank app.
                  </div>
                </section>

                {/* Social */}
                <section className="grid gap-4">
                  <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <Share2 size={18} className="text-sky-600" />
                    Social links
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Instagram" htmlFor="merchant-instagram" hint="Link to your profile.">
                      <input
                        id="merchant-instagram"
                        value={instagram_url}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="https://instagram.com/yourshop"
                        autoComplete="off"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Facebook" htmlFor="merchant-facebook" hint="Link to your page.">
                      <input
                        id="merchant-facebook"
                        value={facebook_url}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="https://facebook.com/yourshop"
                        autoComplete="off"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="TikTok" htmlFor="merchant-tiktok" hint="Link to your profile.">
                      <input
                        id="merchant-tiktok"
                        value={tiktok_url}
                        onChange={(e) => setTiktok(e.target.value)}
                        placeholder="https://tiktok.com/@yourshop"
                        autoComplete="off"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </section>

                {error ? <div className={alertErrorClass}>{error}</div> : null}
              </div>
            </div>

            {/* Sticky action bar */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-stone-200 bg-stone-50 px-4 py-3 sm:px-5">
              <button
                type="button"
                className={`${btn("muted")} min-w-[100px]`}
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${btn("primary")} min-w-[150px]`}
                onClick={() => void save()}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
