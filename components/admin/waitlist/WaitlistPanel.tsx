"use client";

import * as React from "react";
import { AdminApiError, adminJson } from "@/lib/admin/apiClient";
import { btn, inputClass } from "@/components/admin/AdminUi";
import { useToast } from "@/components/admin/Toast";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { dollarsToCents, formatUsd } from "@/lib/waitlist/rules";
import type { WaitlistEntry, WaitlistEvent, WaitlistSettings } from "@/types/waitlist";

type DogOption = {
  id: string;
  name: string;
  status: string;
  price_amount_cents: number | null;
};

type Detail = {
  ok: true;
  entry: WaitlistEntry;
  events: WaitlistEvent[];
  dogs: DogOption[];
  assigned_dog: DogOption | null;
};

function schemaMessage(error: unknown) {
  return error instanceof AdminApiError && error.status === 503;
}

export function WaitlistPanel() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [schemaMissing, setSchemaMissing] = React.useState(false);
  const [settings, setSettings] = React.useState<WaitlistSettings | null>(null);
  const [amountDollars, setAmountDollars] = React.useState("500.00");
  const [enabled, setEnabled] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [entries, setEntries] = React.useState<WaitlistEntry[]>([]);
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const [receivedDollars, setReceivedDollars] = React.useState("");
  const [resolutionNote, setResolutionNote] = React.useState("");
  const [excessNote, setExcessNote] = React.useState("");
  const [dogId, setDogId] = React.useState("");
  const [adminNote, setAdminNote] = React.useState("");
  const [refundStatus, setRefundStatus] = React.useState("none");
  const [refundDollars, setRefundDollars] = React.useState("");
  const [refundReason, setRefundReason] = React.useState("");
  const [refundReference, setRefundReference] = React.useState("");
  const [closeBusiness, setCloseBusiness] = React.useState(false);

  const loadList = React.useCallback(async (q: string) => {
    const data = await adminJson<{ ok: true; entries: WaitlistEntry[] }>(
      `/api/admin/waitlist?q=${encodeURIComponent(q)}`
    );
    setEntries(data.entries);
    setSchemaMissing(false);
  }, []);

  const loadDetail = React.useCallback(async (id: string) => {
    const data = await adminJson<Detail>(`/api/admin/waitlist/${id}`);
    setDetail(data);
    setAdminNote(data.entry.admin_note ?? "");
    setRefundStatus(data.entry.refund_status);
    setRefundReason(data.entry.refund_reason ?? "");
    setRefundReference(data.entry.refund_reference ?? "");
    setRefundDollars(
      data.entry.refund_amount_cents == null ? "" : (data.entry.refund_amount_cents / 100).toFixed(2)
    );
    setReceivedDollars((data.entry.amount_cents / 100).toFixed(2));
    setDogId("");
  }, []);

  React.useEffect(() => {
    let alive = true;
    adminJson<{ ok: true; settings: WaitlistSettings }>("/api/admin/waitlist/settings")
      .then((data) => {
        if (!alive) return;
        setSettings(data.settings);
        setEnabled(data.settings.enabled);
        setAmountDollars((data.settings.amount_cents / 100).toFixed(2));
      })
      .catch((error: unknown) => {
        if (!alive) return;
        if (schemaMessage(error)) setSchemaMissing(true);
        else showToast(error instanceof Error ? error.message : "Could not load settings.", "error");
      });
    loadList("").catch((error: unknown) => {
      if (!alive) return;
      if (schemaMessage(error)) setSchemaMissing(true);
      else showToast(error instanceof Error ? error.message : "Could not load the waitlist.", "error");
    });
    return () => {
      alive = false;
    };
  }, [loadList, showToast]);

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    try {
      const data = await adminJson<{ ok: true; settings: WaitlistSettings }>(
        "/api/admin/waitlist/settings",
        {
          method: "PATCH",
          body: JSON.stringify({ enabled, amount_dollars: amountDollars }),
        }
      );
      setSettings(data.settings);
      showToast("Waitlist settings saved. Older deposits were not changed.");
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Could not save settings.", "error");
    }
  }

  async function search(event: React.FormEvent) {
    event.preventDefault();
    try {
      await loadList(query);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Search failed.", "error");
    }
  }

  async function openEntry(id: string) {
    try {
      await loadDetail(id);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Could not open that entry.", "error");
    }
  }

  async function run(action: Record<string, unknown>) {
    if (!detail) return;
    try {
      const data = await adminJson<Detail>(`/api/admin/waitlist/${detail.entry.id}`, {
        method: "POST",
        body: JSON.stringify(action),
      });
      if (data.entry) {
        setDetail(data);
        setAdminNote(data.entry.admin_note ?? "");
      }
      await loadList(query);
      showToast("Saved.");
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Could not update the entry.", "error");
    }
  }

  if (schemaMissing) {
    return (
      <div className="grid gap-3 text-gray-800">
        <h2 className="text-2xl font-extrabold">Waitlist database is not set up yet</h2>
        <p>
          The pages are deployed, but the new tables are not in Supabase. Existing puppy pages are
          unaffected. Run <code>supabase/migrations/20261106_waitlist.sql</code> in the SQL editor
          after a backup. That script turns the waitlist on.
        </p>
      </div>
    );
  }

  const entry = detail?.entry;
  const price = detail?.dogs.find((dog) => dog.id === dogId)?.price_amount_cents ?? null;
  const excess =
    entry?.confirmed_amount_cents != null && price != null && entry.confirmed_amount_cents > price;

  return (
    <div className="grid gap-8">
      <form onSubmit={saveSettings} className="grid gap-3 rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200">
        <h2 className="text-xl font-extrabold text-gray-900">Deposit for new requests</h2>
        <p className="text-base text-gray-600">
          Current default {settings ? formatUsd(settings.amount_cents) : "…"}. Changing it does not
          change deposits already saved.
        </p>
        <label className="grid gap-1 font-semibold text-gray-800">
          Amount in dollars
          <input className={inputClass} value={amountDollars} onChange={(e) => setAmountDollars(e.target.value)} inputMode="decimal" />
        </label>
        <label className="flex items-center gap-3 font-semibold text-gray-800">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Invitation is visible on the site
        </label>
        <button className={btn("primary")} type="submit">
          Save settings
        </button>
      </form>

      <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
        <label className="grid flex-1 gap-1 font-semibold text-gray-800">
          Search name, phone, or email
          <input className={inputClass} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button className={btn("muted")} type="submit">
          Search
        </button>
        <button
          className={btn("muted")}
          type="button"
          onClick={() => {
            setQuery("");
            loadList("").catch(() => showToast("Could not reload.", "error"));
          }}
        >
          Open entries
        </button>
      </form>
      <p className="text-base text-gray-600">
        An empty search shows open entries in choosing order. A search does not confirm a payment,
        and a name match is not selected for you.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <ul className="grid gap-2">
          {entries.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => openEntry(row.id)}
                className="w-full rounded-2xl bg-white p-4 text-left ring-1 ring-stone-200 hover:ring-meadow-300"
              >
                <div className="font-extrabold text-gray-900">{row.buyer_name}</div>
                <div className="text-gray-700">{row.buyer_phone}</div>
                <div className="text-gray-700">{row.buyer_email}</div>
                <div className="mt-1 text-sm text-gray-600">
                  {formatUsd(row.amount_cents)} saved · {row.payment_status} · {row.handling_status}
                  {row.credit_status === "applied" ? " · credited" : ""}
                </div>
              </button>
            </li>
          ))}
          {entries.length === 0 ? <li className="text-gray-600">No entries in this view.</li> : null}
        </ul>

        {entry ? (
          <div className="grid gap-4">
            <h2 className="text-2xl font-extrabold text-gray-900">{entry.buyer_name}</h2>
            <p className="text-gray-700">
              {entry.buyer_phone} · {entry.buyer_email}
            </p>
            <p className="text-gray-700">
              Saved deposit {formatUsd(entry.amount_cents)} {entry.currency}. Confirmed{" "}
              {entry.confirmed_amount_cents == null ? "not yet" : formatUsd(entry.confirmed_amount_cents)}.
            </p>
            <p className="text-gray-700">
              Preferences: {entry.breed_preference || "no breed"} · {entry.sex_preference || "no sex preference"}
            </p>
            {entry.note ? <p className="text-gray-700">Note: {entry.note}</p> : null}
            <p className="text-gray-600">Passed {entry.pass_count} time{entry.pass_count === 1 ? "" : "s"}.</p>
            {detail?.assigned_dog ? (
              <p className="font-semibold text-gray-900">
                Assigned {detail.assigned_dog.name}. Credited{" "}
                {entry.credit_applied_cents == null ? "" : formatUsd(entry.credit_applied_cents)}.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button className={btn("muted")} type="button" onClick={() => run({ action: "reorder", direction: "earlier" })}>
                Move earlier
              </button>
              <button className={btn("muted")} type="button" onClick={() => run({ action: "reorder", direction: "later" })}>
                Move later
              </button>
              <button className={btn("muted")} type="button" onClick={() => run({ action: "pass" })}>
                Record a pass
              </button>
              <button
                className={btn("danger")}
                type="button"
                onClick={async () => {
                  const ok = await confirm({
                    title: "Record a buyer cancellation?",
                    message: "The deposit is not refunded. This is not a pass.",
                    confirmLabel: "Record cancellation",
                    danger: true,
                  });
                  if (ok) await run({ action: "buyer_cancel" });
                }}
              >
                Buyer cancelled
              </button>
            </div>

            <form
              className="grid gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const cents = dollarsToCents(receivedDollars);
                if (cents == null) {
                  showToast("Enter the amount you received.", "error");
                  return;
                }
                void run({
                  action: "confirm_payment",
                  received_amount_cents: cents,
                  resolution_note: resolutionNote,
                });
              }}
            >
              <h3 className="font-extrabold text-gray-900">Verify payment</h3>
              <label className="grid gap-1 font-semibold">
                Amount received
                <input className={inputClass} value={receivedDollars} onChange={(e) => setReceivedDollars(e.target.value)} />
              </label>
              <label className="grid gap-1 font-semibold">
                Note if this is not the saved deposit
                <textarea className={inputClass} value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} rows={2} />
              </label>
              <button className={btn("primary")} type="submit">
                Confirm receipt
              </button>
            </form>

            <form
              className="grid gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void run({ action: "assign", dog_id: dogId, excess_note: excessNote });
              }}
            >
              <h3 className="font-extrabold text-gray-900">Assign one available puppy</h3>
              <select className={inputClass} value={dogId} onChange={(e) => setDogId(e.target.value)}>
                <option value="">Choose a puppy</option>
                {detail?.dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                    {dog.price_amount_cents == null ? "" : ` · ${formatUsd(dog.price_amount_cents)}`}
                  </option>
                ))}
              </select>
              {excess ? (
                <label className="grid gap-1 font-semibold">
                  This credit is higher than the puppy price. How is the difference handled?
                  <textarea className={inputClass} value={excessNote} onChange={(e) => setExcessNote(e.target.value)} rows={2} />
                </label>
              ) : null}
              <button className={btn("primary")} type="submit">
                Assign and credit once
              </button>
            </form>

            <form
              className="grid gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const amount = refundStatus === "none" ? null : dollarsToCents(refundDollars);
                void run({
                  action: "business",
                  refund_status: refundStatus,
                  refund_amount_cents: amount,
                  refund_reason: refundReason,
                  refund_reference: refundReference,
                  close: closeBusiness,
                });
              }}
            >
              <h3 className="font-extrabold text-gray-900">Business cancellation</h3>
              <select className={inputClass} value={refundStatus} onChange={(e) => setRefundStatus(e.target.value)}>
                <option value="none">No refund</option>
                <option value="approved">Refund approved, not yet returned</option>
                <option value="returned">Money returned manually</option>
              </select>
              <input className={inputClass} placeholder="Refund amount" value={refundDollars} onChange={(e) => setRefundDollars(e.target.value)} />
              <textarea className={inputClass} placeholder="Reason" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} rows={2} />
              <input className={inputClass} placeholder="Manual refund reference, if returned" value={refundReference} onChange={(e) => setRefundReference(e.target.value)} />
              <label className="flex items-center gap-2 font-semibold">
                <input type="checkbox" checked={closeBusiness} onChange={(e) => setCloseBusiness(e.target.checked)} />
                Also close the entry
              </label>
              <button className={btn("muted")} type="submit">
                Save business case
              </button>
            </form>

            <form
              className="grid gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void run({ action: "note", admin_note: adminNote });
              }}
            >
              <label className="grid gap-1 font-semibold">
                Working note
                <textarea className={inputClass} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2} />
              </label>
              <button className={btn("muted")} type="submit">
                Save note
              </button>
            </form>

            <div>
              <h3 className="font-extrabold text-gray-900">History</h3>
              <ul className="mt-2 grid gap-2">
                {detail?.events.map((event) => (
                  <li key={event.id} className="text-gray-700">
                    <span className="font-semibold">{event.kind}</span> · {new Date(event.created_at).toLocaleString()} · {event.note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Select an entry. Searching does not open one automatically.</p>
        )}
      </div>
    </div>
  );
}
