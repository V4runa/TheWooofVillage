"use client";

import * as React from "react";
import { RefreshCw, MessageSquare, CheckCircle2, XCircle, Clock, Star, Trash2, Image as ImageIcon } from "lucide-react";

import type { Testimonial, TestimonialStatus } from "@/types/testimonials";
import { adminJson } from "@/lib/admin/apiClient";
import { softShell, btn, pill, formatDate, alertErrorClass, statusBadge } from "@/components/admin/AdminUi";

/* -----------------------------
   Testimonials Panel
------------------------------ */
export function TestimonialsPanel({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [status, setStatus] = React.useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  const [items, setItems] = React.useState<Testimonial[]>([]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const q = new URLSearchParams();
      if (status !== "all") q.set("status", status);
      q.set("limit", "250");

      const data = await adminJson<{ ok: true; testimonials: Testimonial[] }>(
        `/api/admin/testimonials?${q.toString()}`
      );

      setItems(data.testimonials ?? []);
    } catch (e: any) {
      setError(e?.message || "Could not load testimonials.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function setItemStatus(id: string, next: TestimonialStatus) {
    try {
      const data = await adminJson<{ ok: true; testimonial: Testimonial }>(
        `/api/admin/testimonials/${id}`,
        { method: "PATCH", body: JSON.stringify({ status: next }) }
      );

      setItems((prev) => prev.map((t) => (t.id === id ? data.testimonial : t)));
      onToast(`Set to ${next}.`);
    } catch (e: any) {
      setError(e?.message || "Update failed.");
    }
  }

  async function deleteItem(id: string) {
    const ok = window.confirm("Delete this testimonial? This cannot be undone.");
    if (!ok) return;

    try {
      await adminJson<{ ok: true }>(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });

      setItems((prev) => prev.filter((t) => t.id !== id));
      onToast("Deleted.");
    } catch (e: any) {
      setError(e?.message || "Delete failed.");
    }
  }

  return (
    <div className="space-y-6">
      <div className={softShell("p-6 sm:p-8")}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button className={pill(status === "pending")} onClick={() => setStatus("pending")}>
              <Clock size={14} className="mr-1.5" />
              Pending
            </button>
            <button className={pill(status === "approved")} onClick={() => setStatus("approved")}>
              <CheckCircle2 size={14} className="mr-1.5" />
              Approved
            </button>
            <button className={pill(status === "rejected")} onClick={() => setStatus("rejected")}>
              <XCircle size={14} className="mr-1.5" />
              Rejected
            </button>
            <button className={pill(status === "all")} onClick={() => setStatus("all")}>
              All
            </button>
          </div>

          <div className="ml-auto text-lg text-gray-600 flex items-center gap-3">
            <span className="font-semibold">
              {loading ? "Loading…" : `${items.length} ${items.length === 1 ? 'testimonial' : 'testimonials'}`}
            </span>
            <button className={`${btn("muted")} flex items-center gap-2`} onClick={load}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {error ? <div className={`mt-4 ${alertErrorClass}`}>{error}</div> : null}
      </div>

      {loading ? (
        <div className={softShell("p-6")}>
          <div className="h-4 w-1/3 min-w-[120px] rounded-2xl bg-black/10 animate-pulse" />
          <div className="mt-4 h-24 rounded-2xl bg-black/10 animate-pulse" />
        </div>
      ) : items.length === 0 ? (
        <div className={softShell("p-8 text-center")}>
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900">No testimonials</h3>
          <p className="mt-2 text-lg text-gray-600">Nothing in this filter yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((t) => (
            <div key={t.id} className={`${softShell("p-6 sm:p-8")} transition-shadow duration-200 hover:shadow-adminHover`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={statusBadge(t.status)}>
                      {t.status}
                    </span>
                    <span className="text-lg text-gray-600 flex items-center gap-1.5">
                      <Clock size={12} />
                      {formatDate(t.created_at)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-2xl font-bold text-gray-900">{t.author_name}</div>
                      {t.author_location ? (
                        <div className="text-lg text-gray-600">{t.author_location}</div>
                      ) : null}
                      {t.rating != null ? (
                        <div className="flex items-center gap-1 text-lg text-gray-600">
                          <Star size={14} className="fill-meadow-500 text-meadow-500" />
                          <span className="font-semibold">{t.rating}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-lg text-gray-700 whitespace-pre-wrap leading-relaxed shadow-adminSm">
                      {t.message}
                    </div>

                    {(t.images ?? []).length > 0 ? (
                      <div className="mt-3">
                        <div className="text-base font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                          <ImageIcon size={12} />
                          {t.images.length} {t.images.length === 1 ? 'image' : 'images'}
                        </div>
                        <div className="flex gap-3 overflow-x-auto pr-2">
                          {(t.images ?? []).map((img) => (
                            <div key={img.id} className="relative shrink-0">
                              <img
                                src={img.url}
                                alt={img.alt || "testimonial image"}
                                className="h-28 w-40 rounded-2xl object-cover border border-gray-200"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-2 text-lg text-gray-600">
                      Updated: {formatDate(t.updated_at)}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-wrap gap-2 sm:flex-col sm:items-end sm:min-w-[140px]">
                  <button
                    className={`${btn("primary")} flex items-center gap-2 ${t.status === "approved" ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => setItemStatus(t.id, "approved")}
                    disabled={t.status === "approved"}
                  >
                    <CheckCircle2 size={14} />
                    Approve
                  </button>
                  <button
                    className={`${btn("muted")} flex items-center gap-2 ${t.status === "rejected" ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => setItemStatus(t.id, "rejected")}
                    disabled={t.status === "rejected"}
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                  <button className={`${btn("danger")} flex items-center gap-2`} onClick={() => deleteItem(t.id)}>
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
