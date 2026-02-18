"use client";

import * as React from "react";
import Link from "next/link";
import { 
  RefreshCw, 
  Search, 
  Plus, 
  Save, 
  Trash2, 
  X, 
  Image as ImageIcon,
  DollarSign,
  Tag,
  Calendar,
  FileText,
  ExternalLink,
  Dog as DogIcon,
} from "lucide-react";

import type { Dog, DogStatus } from "@/types/dogs";
import { adminForm, adminJson } from "@/lib/admin/apiClient";
import {
  softShell,
  btn,
  formatDate,
  moneyFromCents,
  pill,
  inputClass,
  inputClassSm,
  alertErrorClass,
  statusBadge,
  ADMIN_TOPPER_STYLES,
} from "@/components/admin/AdminUi";

type Props = {
  onToast: (msg: string) => void;
};

type DogStatusFilter = "all" | "available" | "reserved" | "sold";

/**
 * Dogs Panel (v1)
 * - Create (with images)
 * - Edit fields
 * - Delete
 * NOTE: cover/reorder/delete single images is v2 (needs endpoints)
 *
 * Auth: cookie-based admin session (no passcode headers, no localStorage)
 */
export function DogsPanel({ onToast }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [statusFilter, setStatusFilter] = React.useState<DogStatusFilter>("all");
  const [query, setQuery] = React.useState("");

  const [dogs, setDogs] = React.useState<Dog[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // Create form (simple + effective)
  const [cName, setCName] = React.useState("");
  const [cSlug, setCSlug] = React.useState("");
  const [cStatus, setCStatus] = React.useState<DogStatus>("available");
  const [cDeposit, setCDeposit] = React.useState<string>("");
  const [cPrice, setCPrice] = React.useState<string>("");
  const [cBreed, setCBreed] = React.useState("");
  const [cSex, setCSex] = React.useState("");
  const [cAgeWeeks, setCAgeWeeks] = React.useState<string>("");
  const [cColor, setCColor] = React.useState("");
  const [cReadyDate, setCReadyDate] = React.useState<string>("");
  const [cSortOrder, setCSortOrder] = React.useState<string>("0");
  const [cDescription, setCDescription] = React.useState("");
  const [cAlt, setCAlt] = React.useState<string>("");
  const [cFiles, setCFiles] = React.useState<FileList | null>(null);
  const [creating, setCreating] = React.useState(false);

  const selected = React.useMemo(
    () => (selectedId ? dogs.find((d) => d.id === selectedId) ?? null : null),
    [dogs, selectedId]
  );

  // Edit form state
  const [eName, setEName] = React.useState("");
  const [eSlug, setESlug] = React.useState("");
  const [eStatus, setEStatus] = React.useState<DogStatus>("available");
  const [eDeposit, setEDeposit] = React.useState<string>("");
  const [ePrice, setEPrice] = React.useState<string>("");
  const [eBreed, setEBreed] = React.useState("");
  const [eSex, setESex] = React.useState("");
  const [eAgeWeeks, setEAgeWeeks] = React.useState<string>("");
  const [eColor, setEColor] = React.useState("");
  const [eReadyDate, setEReadyDate] = React.useState<string>("");
  const [eSortOrder, setESortOrder] = React.useState<string>("");
  const [eDescription, setEDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const q = new URLSearchParams();
      if (statusFilter !== "all") q.set("status", statusFilter);
      q.set("limit", "300");

      const data = await adminJson<{ ok: true; dogs: Dog[] }>(`/api/admin/dogs?${q.toString()}`);

      setDogs(data.dogs ?? []);
      if (selectedId && !(data.dogs ?? []).some((d) => d.id === selectedId)) {
        setSelectedId(null);
      }
    } catch (e: any) {
      // If session is missing/expired, API should return 401/403 with a message
      setError(e?.message || "Could not load dogs.");
      setDogs([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  React.useEffect(() => {
    if (!selected) return;

    setEName(selected.name || "");
    setESlug(selected.slug || "");
    setEStatus((selected.status || "available") as DogStatus);
    setEDeposit(selected.deposit_amount_cents == null ? "" : String(selected.deposit_amount_cents));
    setEPrice(selected.price_amount_cents == null ? "" : String(selected.price_amount_cents));
    setEBreed(selected.breed || "");
    setESex(selected.sex || "");
    setEAgeWeeks(selected.age_weeks == null ? "" : String(selected.age_weeks));
    setEColor(selected.color || "");
    setEReadyDate(selected.ready_date || "");
    setESortOrder(selected.sort_order == null ? "" : String(selected.sort_order));
    setEDescription(selected.description || "");
  }, [selected]);

  const visibleDogs = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = dogs ?? [];
    if (!q) return base;
    return base.filter((d) => {
      const hay = [d.name, d.slug, d.status, d.breed, d.color, d.sex]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [dogs, query]);

  async function createDog() {
    const name = cName.trim();
    if (!name) {
      setError("Name is required.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const form = new FormData();
      form.set("name", name);

      if (cSlug.trim()) form.set("slug", cSlug.trim());
      if (cStatus) form.set("status", String(cStatus));
      if (cDescription.trim()) form.set("description", cDescription.trim());

      if (cDeposit.trim()) form.set("deposit_amount_cents", cDeposit.trim());
      if (cPrice.trim()) form.set("price_amount_cents", cPrice.trim());

      if (cBreed.trim()) form.set("breed", cBreed.trim());
      if (cSex.trim()) form.set("sex", cSex.trim());
      if (cAgeWeeks.trim()) form.set("age_weeks", cAgeWeeks.trim());
      if (cColor.trim()) form.set("color", cColor.trim());
      if (cReadyDate.trim()) form.set("ready_date", cReadyDate.trim());
      if (cSortOrder.trim()) form.set("sort_order", cSortOrder.trim());

      if (cAlt.trim()) form.set("alt", cAlt.trim());

      const files = cFiles ? Array.from(cFiles) : [];
      for (const f of files) form.append("files", f);

      const data = await adminForm<{ ok: true; dog: any; images: any[] }>(
        "/api/admin/dogs",
        form
      );

      onToast("Dog created.");

      // Reset create form
      setCName("");
      setCSlug("");
      setCStatus("available");
      setCDeposit("");
      setCPrice("");
      setCBreed("");
      setCSex("");
      setCAgeWeeks("");
      setCColor("");
      setCReadyDate("");
      setCSortOrder("0");
      setCDescription("");
      setCAlt("");
      setCFiles(null);

      await load();

      const createdId = data?.dog?.id as string | undefined;
      if (createdId) setSelectedId(createdId);
    } catch (e: any) {
      setError(e?.message || "Create failed.");
    } finally {
      setCreating(false);
    }
  }

  async function saveDog() {
    if (!selected) return;

    setSaving(true);
    setError(null);

    try {
      const payload: any = {};

      payload.name = eName.trim();
      payload.slug = eSlug.trim() || null;
      payload.status = String(eStatus || "available").trim();

      payload.deposit_amount_cents = eDeposit.trim() ? Number(eDeposit.trim()) : null;
      payload.price_amount_cents = ePrice.trim() ? Number(ePrice.trim()) : null;

      payload.breed = eBreed.trim() || null;
      payload.sex = eSex.trim() || null;
      payload.age_weeks = eAgeWeeks.trim() ? Number(eAgeWeeks.trim()) : null;
      payload.color = eColor.trim() || null;

      payload.ready_date = eReadyDate.trim() || null;
      payload.sort_order = eSortOrder.trim() ? Number(eSortOrder.trim()) : null;

      payload.description = eDescription.trim() || null;

      const data = await adminJson<{ ok: true; dog: Dog | null }>(`/api/admin/dogs/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (data?.dog) {
        setDogs((prev) => prev.map((d) => (d.id === selected.id ? { ...d, ...data.dog } : d)));
      } else {
        await load();
      }

      onToast("Saved.");
    } catch (e: any) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDog() {
    if (!selected) return;

    const ok = window.confirm(
      `Delete "${selected.name}"?\n\nThis removes the dog and all images in storage for this dog.`
    );
    if (!ok) return;

    setDeleting(true);
    setError(null);

    try {
      await adminJson<{ ok: true }>(`/api/admin/dogs/${selected.id}`, { method: "DELETE" });
      onToast("Dog deleted.");
      setSelectedId(null);
      await load();
    } catch (e: any) {
      setError(e?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  function resetEditorToSelected() {
    if (!selected) return;
    setEName(selected.name || "");
    setESlug(selected.slug || "");
    setEStatus((selected.status || "available") as DogStatus);
    setEDeposit(selected.deposit_amount_cents == null ? "" : String(selected.deposit_amount_cents));
    setEPrice(selected.price_amount_cents == null ? "" : String(selected.price_amount_cents));
    setEBreed(selected.breed || "");
    setESex(selected.sex || "");
    setEAgeWeeks(selected.age_weeks == null ? "" : String(selected.age_weeks));
    setEColor(selected.color || "");
    setEReadyDate(selected.ready_date || "");
    setESortOrder(selected.sort_order == null ? "" : String(selected.sort_order));
    setEDescription(selected.description || "");
    onToast("Reverted.");
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden sm:gap-4">
      {/* Filters + search — toolbar with admin stripe */}
      <div className="shrink-0 overflow-hidden rounded-2xl border-2 border-stone-200 bg-gradient-to-r from-stone-50 to-white shadow-admin ring-1 ring-black/5">
        <div className="h-2.5 w-full shrink-0 rounded-t-2xl" style={ADMIN_TOPPER_STYLES.meadow} aria-hidden />
        <div className="p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2 sm:mb-3">
          <Search size={20} className="text-meadow-600" />
          <span className="text-lg font-bold uppercase tracking-wider text-gray-500">
            Filter & search
          </span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <button className={pill(statusFilter === "all")} onClick={() => setStatusFilter("all")}>
              All
            </button>
            <button
              className={pill(statusFilter === "available")}
              onClick={() => setStatusFilter("available")}
            >
              Available
            </button>
            <button
              className={pill(statusFilter === "reserved")}
              onClick={() => setStatusFilter("reserved")}
            >
              Reserved
            </button>
            <button className={pill(statusFilter === "sold")} onClick={() => setStatusFilter("sold")}>
              Sold
            </button>

            <button className={`${btn("muted")} flex items-center gap-2`} onClick={load}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto sm:flex-initial">
            <div className="relative flex-1 min-w-0 sm:max-w-[300px]">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, slug, breed…"
                className={`pl-11 ${inputClassSm}`}
              />
            </div>
            <div className="rounded-xl bg-white px-4 py-3 text-[19px] font-bold text-gray-700 shadow-admin ring-1 ring-stone-200">
              {loading ? "…" : `${visibleDogs.length} ${visibleDogs.length === 1 ? "dog" : "dogs"}`}
            </div>
          </div>
        </div>

        {error ? <div className={`mt-3 ${alertErrorClass}`}>{error}</div> : null}
        </div>
      </div>

      {/* Main split — fills remaining height; single row constrained so columns scroll, not page */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-3 lg:grid-cols-12 lg:gap-4 min-w-0">
        {/* Left: list + create — scrolls as one column */}
        <div className="flex min-h-0 flex-col overflow-y-auto lg:col-span-5 lg:min-h-0 min-w-0">
          <div className={`${softShell("shrink-0 overflow-hidden p-5 sm:p-6")}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-meadow-100 ring-2 ring-meadow-200">
                  <Tag size={24} className="text-meadow-700" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">Your listings</div>
                  <div className="text-lg text-gray-500">Select one to edit</div>
                </div>
              </div>
              <Link className={`${btn("muted")} shrink-0`} href="/dogs" target="_blank">
                View public →
              </Link>
            </div>

            <div className="mt-3 space-y-2 py-1 pr-1 sm:mt-4">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-12 rounded-2xl bg-black/10 animate-pulse" />
                  <div className="h-12 rounded-2xl bg-black/10 animate-pulse" />
                  <div className="h-12 rounded-2xl bg-black/10 animate-pulse" />
                </div>
              ) : visibleDogs.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/80 p-6 text-center shadow-adminSm">
                  <div className="text-2xl font-bold text-gray-900">No dogs found</div>
                  <div className="mt-2 text-lg text-gray-600">
                    Create a listing below, or adjust filters.
                  </div>
                </div>
              ) : (
                visibleDogs.map((d) => {
                  const active = d.id === selectedId;
                  const coverUrl = (d as any).cover_image_url;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedId(d.id)}
                      className={[
                        "w-full text-left rounded-2xl border-2 px-4 py-3.5 transition-all duration-200",
                        active
                          ? "border-meadow-400 bg-gradient-to-r from-meadow-50 to-meadow-50/50 text-meadow-900 shadow-admin ring-2 ring-meadow-200"
                          : "border-stone-200 bg-white text-gray-900 shadow-adminSm hover:border-meadow-200 hover:bg-meadow-50/20 hover:shadow-admin",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200">
                          {coverUrl ? (
                            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <DogIcon size={24} className="text-stone-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xl font-bold">{d.name}</div>
                          <div className={`mt-1.5 flex flex-wrap items-center gap-2 ${active ? "text-lg text-meadow-800" : "text-lg text-gray-600"}`}>
                            <span className={statusBadge(d.status)}>{d.status}</span>
                            <span className="truncate font-mono text-xs">{d.slug || "no slug"}</span>
                          </div>
                          <div className={`mt-2 flex gap-3 text-lg font-semibold ${active ? "text-meadow-800" : "text-gray-500"}`}>
                            <span>{moneyFromCents(d.deposit_amount_cents) || "—"}</span>
                            <span>{moneyFromCents(d.price_amount_cents) || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Create */}
          <div className="mt-3 min-w-0 overflow-hidden rounded-2xl border-2 border-meadow-200 bg-gradient-to-br from-meadow-50 to-white shadow-admin ring-1 ring-meadow-100 sm:mt-4">
            <div className="mb-4 flex items-center gap-4 p-5 sm:p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-meadow-100 ring-2 ring-meadow-200">
                <Plus size={26} className="text-meadow-700" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Create new listing</div>
                <div className="text-lg text-gray-600">
                  Add a dog and upload photos. First image becomes the cover.
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-4 px-5 pb-5 sm:px-6 sm:pb-6">
              <input
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                placeholder="Name *"
                className={inputClass}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={cSlug}
                  onChange={(e) => setCSlug(e.target.value)}
                  placeholder="Slug (optional)"
                  className={inputClass}
                />
                <select
                  value={String(cStatus)}
                  onChange={(e) => setCStatus(e.target.value as DogStatus)}
                  className={inputClass}
                >
                  <option value="available">available</option>
                  <option value="reserved">reserved</option>
                  <option value="sold">sold</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={cDeposit}
                  onChange={(e) => setCDeposit(e.target.value)}
                  placeholder="Deposit cents (e.g. 30000)"
                  className={inputClass}
                />
                <input
                  value={cPrice}
                  onChange={(e) => setCPrice(e.target.value)}
                  placeholder="Total cents (e.g. 180000)"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={cBreed}
                  onChange={(e) => setCBreed(e.target.value)}
                  placeholder="Breed"
                  className={inputClass}
                />
                <input
                  value={cColor}
                  onChange={(e) => setCColor(e.target.value)}
                  placeholder="Color"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  value={cSex}
                  onChange={(e) => setCSex(e.target.value)}
                  placeholder="Sex"
                  className={inputClass}
                />
                <input
                  value={cAgeWeeks}
                  onChange={(e) => setCAgeWeeks(e.target.value)}
                  placeholder="Age weeks"
                  className={inputClass}
                />
                <input
                  value={cReadyDate}
                  onChange={(e) => setCReadyDate(e.target.value)}
                  placeholder="Ready date (YYYY-MM-DD)"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={cSortOrder}
                  onChange={(e) => setCSortOrder(e.target.value)}
                  placeholder="Sort order (0..n)"
                  className={inputClass}
                />
                <input
                  value={cAlt}
                  onChange={(e) => setCAlt(e.target.value)}
                  placeholder="Alt text for uploaded photos (optional)"
                  className={inputClass}
                />
              </div>

              <textarea
                value={cDescription}
                onChange={(e) => setCDescription(e.target.value)}
                placeholder="Description (optional)"
                className={`min-h-[96px] ${inputClass}`}
              />

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-adminSm">
                  <div className="mb-2 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <ImageIcon size={16} />
                  Photos
                </div>
                <div className="mb-3 text-lg text-gray-600">
                  Upload multiple. First image becomes cover. (v2 will add per-image management.)
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setCFiles(e.target.files)}
                  className="block w-full text-base text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 file:border file:border-gray-300 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <button className={`${btn("primary")} flex items-center gap-2`} onClick={createDog} disabled={creating}>
                  <Plus size={14} />
                  {creating ? "Creating…" : "Create"}
                </button>
                <button
                  className={`${btn("muted")} flex items-center gap-2`}
                  onClick={() => {
                    setCName("");
                    setCSlug("");
                    setCStatus("available");
                    setCDeposit("");
                    setCPrice("");
                    setCBreed("");
                    setCSex("");
                    setCAgeWeeks("");
                    setCColor("");
                    setCReadyDate("");
                    setCSortOrder("0");
                    setCDescription("");
                    setCAlt("");
                    setCFiles(null);
                    onToast("Cleared.");
                  }}
                >
                  <X size={14} />
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: editor — scrolls independently */}
        <div className="flex min-h-0 flex-col overflow-y-auto lg:col-span-7 lg:min-h-0 min-w-0">
          {!selected ? (
            <div className="shrink-0 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/80 p-8 text-center shadow-adminSm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-200">
                <FileText size={32} className="text-stone-500" />
              </div>
              <div className="mt-4 text-2xl font-bold text-gray-900">Select a dog</div>
              <div className="mt-2 text-lg text-gray-600">
                Choose a listing from the left to edit, or create a new one below.
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="shrink-0 overflow-hidden rounded-2xl border-2 border-stone-200 bg-white shadow-admin ring-1 ring-black/5">
                <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    {(selected as any).cover_image_url ? (
                      <img
                        src={(selected as any).cover_image_url}
                        alt=""
                        className="h-20 w-24 shrink-0 rounded-xl object-cover ring-2 ring-stone-200"
                      />
                    ) : (
                      <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-stone-100 ring-2 ring-stone-200">
                        <DogIcon size={28} className="text-stone-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={statusBadge(selected.status)}>
                          {selected.status}
                        </span>
                        <span className="text-lg text-gray-500">
                          Updated {formatDate((selected as any).updated_at)}
                        </span>
                      </div>
                      <div className="mt-2 truncate text-3xl font-bold text-gray-900">
                        {selected.name}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-lg text-gray-600">
                      <span>Slug:</span>
                      <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {selected.slug || "—"}
                      </span>
                      {selected.slug ? (
                        <Link
                          href={`/dogs/${selected.slug}`}
                          target="_blank"
                          className="flex items-center gap-1 font-semibold text-gray-900 underline decoration-gray-400 hover:decoration-gray-600"
                        >
                          View <ExternalLink size={12} />
                        </Link>
                      ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button className={`${btn("primary")} flex items-center gap-2`} onClick={saveDog} disabled={saving}>
                      <Save size={14} />
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button className={`${btn("danger")} flex items-center gap-2`} onClick={deleteDog} disabled={deleting}>
                      <Trash2 size={14} />
                      {deleting ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
                </div>
              </div>

              {/* Images preview */}
              <div className={`${softShell("shrink-0 overflow-hidden p-5 sm:p-6")}`}>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 ring-2 ring-sky-200">
                    <ImageIcon size={24} className="text-sky-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">Photos</div>
                    <div className="text-lg text-gray-600">
                  v1: preview only. v2 will add set cover / reorder / delete image / upload to existing dog.
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-3 overflow-x-auto pr-2 sm:mt-4">
                  {(selected as any).images?.length === 0 && !(selected as any).cover_image_url ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-lg text-gray-600 shadow-adminSm">
                  No images yet.
                </div>
                  ) : (
                    <>
                      {(selected as any).cover_image_url ? (
                        <div className="shrink-0">
                          <div className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Cover
                          </div>
                          <img
                            src={(selected as any).cover_image_url}
                            alt={selected.name}
                            className="mt-2 h-24 w-36 rounded-2xl object-cover border border-gray-200"
                          />
                        </div>
                      ) : null}

                      {((selected as any).images ?? []).map((img: any) => (
                        <div key={img.id} className="shrink-0">
                          <div className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                            #{img.sort_order ?? 0}
                          </div>
                          <img
                            src={img.url}
                            alt={img.alt || selected.name}
                            className="mt-2 h-24 w-36 rounded-2xl object-cover border border-gray-200"
                          />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Editable fields */}
              <div className={`${softShell("min-w-0 overflow-hidden p-5 sm:p-6")}`}>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-meadow-100 ring-2 ring-meadow-200">
                    <FileText size={24} className="text-meadow-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">Edit details</div>
                </div>

                <div className="mt-4 grid gap-3">
                  <input
                    value={eName}
                    onChange={(e) => setEName(e.target.value)}
                    placeholder="Name"
                    className={inputClass}
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={eSlug}
                      onChange={(e) => setESlug(e.target.value)}
                      placeholder="Slug"
                      className={inputClass}
                    />
                    <select
                      value={String(eStatus)}
                      onChange={(e) => setEStatus(e.target.value as DogStatus)}
                      className={inputClass}
                    >
                      <option value="available">available</option>
                      <option value="reserved">reserved</option>
                      <option value="sold">sold</option>
                    </select>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={eDeposit}
                      onChange={(e) => setEDeposit(e.target.value)}
                      placeholder="Deposit cents"
                      className={inputClass}
                    />
                    <input
                      value={ePrice}
                      onChange={(e) => setEPrice(e.target.value)}
                      placeholder="Total cents"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={eBreed}
                      onChange={(e) => setEBreed(e.target.value)}
                      placeholder="Breed"
                      className={inputClass}
                    />
                    <input
                      value={eColor}
                      onChange={(e) => setEColor(e.target.value)}
                      placeholder="Color"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      value={eSex}
                      onChange={(e) => setESex(e.target.value)}
                      placeholder="Sex"
                      className={inputClass}
                    />
                    <input
                      value={eAgeWeeks}
                      onChange={(e) => setEAgeWeeks(e.target.value)}
                      placeholder="Age weeks"
                      className={inputClass}
                    />
                    <input
                      value={eReadyDate}
                      onChange={(e) => setEReadyDate(e.target.value)}
                      placeholder="Ready date (YYYY-MM-DD)"
                      className={inputClass}
                    />
                  </div>

                  <input
                    value={eSortOrder}
                    onChange={(e) => setESortOrder(e.target.value)}
                    placeholder="Sort order"
                    className={inputClass}
                  />

                  <textarea
                    value={eDescription}
                    onChange={(e) => setEDescription(e.target.value)}
                    placeholder="Description"
                    className={`min-h-[120px] ${inputClass}`}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button className={btn("primary")} onClick={saveDog} disabled={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                    <button className={btn("muted")} onClick={resetEditorToSelected}>
                      Revert
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
