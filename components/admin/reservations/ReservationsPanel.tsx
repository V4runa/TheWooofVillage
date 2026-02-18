"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCw, Calendar, Phone, Mail, CreditCard, ExternalLink, CheckCircle2, Clock, XCircle } from "lucide-react";

import type {
  ReservationRequest,
  ReservationRequestStatus,
} from "@/types/reservation";

import { adminJson } from "@/lib/admin/apiClient";
import { softShell, btn, pill, formatDate, alertErrorClass, statusBadge } from "@/components/admin/AdminUi";

type StatusFilter = ReservationRequestStatus | "all";

/* -----------------------------
   Reservations Panel
------------------------------ */
export function ReservationsPanel({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const [status, setStatus] = React.useState<StatusFilter>("new");
  const [items, setItems] = React.useState<ReservationRequest[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const q = new URLSearchParams();
      q.set("status", status);
      q.set("limit", "120");

      const data = await adminJson<{ ok: true; reservations: ReservationRequest[] }>(
        `/api/admin/reservations?${q.toString()}`
      );

      setItems(data.reservations ?? []);
    } catch (e: any) {
      setError(e?.message || "Could not load reservations.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function updateStatus(id: string, next: ReservationRequestStatus) {
    try {
      const data = await adminJson<{ ok: true; reservation: ReservationRequest }>(
        `/api/admin/reservations/${id}`,
        { method: "PATCH", body: JSON.stringify({ status: next }) }
      );

      setItems((prev) => prev.map((r) => (r.id === id ? data.reservation : r)));
      onToast(`Marked as ${next}.`);
    } catch (e: any) {
      setError(e?.message || "Update failed.");
    }
  }

  return (
    <div className="space-y-6">
      <div className={softShell("p-6 sm:p-8")}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button className={pill(status === "new")} onClick={() => setStatus("new")}>
              <Clock size={14} className="mr-1.5" />
              New
            </button>
            <button
              className={pill(status === "contacted")}
              onClick={() => setStatus("contacted")}
            >
              <CheckCircle2 size={14} className="mr-1.5" />
              Contacted
            </button>
            <button className={pill(status === "closed")} onClick={() => setStatus("closed")}>
              <XCircle size={14} className="mr-1.5" />
              Closed
            </button>
            <button className={pill(status === "all")} onClick={() => setStatus("all")}>
              All
            </button>
          </div>

          <div className="ml-auto text-lg text-gray-600 flex items-center gap-3">
            <span className="font-semibold">
              {loading ? "Loading…" : `${items.length} ${items.length === 1 ? 'request' : 'requests'}`}
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
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900">No requests</h3>
          <p className="mt-2 text-lg text-gray-600">Nothing in this filter yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((r) => {
            const dogName = r.dogs?.name || "Puppy";
            const dogSlug = r.dogs?.slug || null;

            return (
              <div key={r.id} className={`${softShell("p-6 sm:p-8")} transition-shadow duration-200 hover:shadow-adminHover`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={statusBadge(r.status)}>
                        {r.status}
                      </span>
                      <span className="text-lg text-gray-600 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {formatDate(r.created_at)}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-2xl font-bold text-gray-900">
                          {r.buyer_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-lg text-gray-600">
                          <Phone size={14} />
                          {r.buyer_phone}
                        </div>
                        {r.buyer_email ? (
                          <div className="flex items-center gap-1.5 text-lg text-gray-600">
                            <Mail size={14} />
                            {r.buyer_email}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 text-lg">
                        <CreditCard size={14} className="text-gray-600" />
                        <span className="text-gray-600">Payment:</span>
                        <span className="font-semibold text-gray-900">
                          {r.payment_method}
                        </span>
                        {r.transaction_id ? (
                          <>
                            <span className="text-gray-600">·</span>
                            <span className="text-gray-600">Txn:</span>
                            <span className="font-mono text-xs font-semibold text-gray-900 bg-white/60 px-2 py-0.5 rounded">
                              {r.transaction_id}
                            </span>
                          </>
                        ) : null}
                      </div>

                      <div className="text-lg">
                        <span className="text-gray-600">Dog: </span>
                        {dogSlug ? (
                          <Link
                            href={`/dogs/${dogSlug}`}
                            className="font-semibold text-gray-900 underline decoration-black/15 hover:decoration-black/30 inline-flex items-center gap-1"
                            target="_blank"
                          >
                            {dogName}
                            <ExternalLink size={12} />
                          </Link>
                        ) : (
                          <span className="font-semibold text-gray-900">{dogName}</span>
                        )}
                      </div>

                      {r.note ? (
                        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-lg text-gray-700 leading-relaxed shadow-adminSm">
                          {r.note}
                        </div>
                      ) : null}

                      {r.handled_at ? (
                        <div className="mt-2 text-lg text-gray-600 flex items-center gap-1.5">
                          <CheckCircle2 size={12} />
                          Handled: {formatDate(r.handled_at)}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-wrap gap-2 sm:flex-col sm:items-end sm:min-w-[140px]">
                    <button
                      className={`${btn("muted")} ${r.status === "new" ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => updateStatus(r.id, "new")}
                      disabled={r.status === "new"}
                    >
                      <Clock size={14} className="mr-1.5" />
                      Mark new
                    </button>
                    <button
                      className={`${btn("primary")} ${r.status === "contacted" ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => updateStatus(r.id, "contacted")}
                      disabled={r.status === "contacted"}
                    >
                      <CheckCircle2 size={14} className="mr-1.5" />
                      Contacted
                    </button>
                    <button
                      className={`${btn("muted")} ${r.status === "closed" ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => updateStatus(r.id, "closed")}
                      disabled={r.status === "closed"}
                    >
                      <XCircle size={14} className="mr-1.5" />
                      Mark closed
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
