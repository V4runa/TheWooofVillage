"use client";

import * as React from "react";
import { AdminApiError, adminJson } from "@/lib/admin/apiClient";
import { btn } from "@/components/admin/AdminUi";
import { useToast } from "@/components/admin/Toast";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { buyerQueueLabel, dollarsToCents, formatUsd } from "@/lib/waitlist/rules";
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

const fieldClass =
  "w-full rounded-xl bg-white px-3 py-2.5 text-base text-gray-900 ring-1 ring-gray-300 outline-none focus:ring-2 focus:ring-meadow-500";

function schemaMessage(error: unknown) {
  return error instanceof AdminApiError && error.status === 503;
}

function scan(entry: WaitlistEntry) {
  return buyerQueueLabel({
    paymentStatus: entry.payment_status,
    confirmedCents: entry.confirmed_amount_cents,
    savedCents: entry.amount_cents,
    creditStatus: entry.credit_status,
    handlingStatus: entry.handling_status,
    closeReason: entry.close_reason,
    refundStatus: entry.refund_status,
  });
}

type Preview = {
  settings: WaitlistSettings;
  entries: WaitlistEntry[];
  details: Record<string, Detail>;
};

export function WaitlistPanel({ preview }: { preview?: Preview } = {}) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [schemaMissing, setSchemaMissing] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [settings, setSettings] = React.useState<WaitlistSettings | null>(null);
  const [amountDollars, setAmountDollars] = React.useState("500.00");
  const [enabled, setEnabled] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [activeQuery, setActiveQuery] = React.useState("");
  const [entries, setEntries] = React.useState<WaitlistEntry[]>([]);
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const [opening, setOpening] = React.useState(false);

  const loadList = React.useCallback(async (q: string) => {
    const data = await adminJson<{ ok: true; entries: WaitlistEntry[] }>(
      `/api/admin/waitlist?q=${encodeURIComponent(q)}`
    );
    setEntries(data.entries);
    setSchemaMissing(false);
    setLoadError(null);
  }, []);

  const applyDetail = React.useCallback((data: Detail) => {
    setDetail(data);
  }, []);

  React.useEffect(() => {
    if (preview) {
      setSettings(preview.settings);
      setEnabled(preview.settings.enabled);
      setAmountDollars((preview.settings.amount_cents / 100).toFixed(2));
      setEntries(preview.entries);
      setLoading(false);
      return;
    }
    let alive = true;
    Promise.all([
      adminJson<{ ok: true; settings: WaitlistSettings }>("/api/admin/waitlist/settings"),
      adminJson<{ ok: true; entries: WaitlistEntry[] }>("/api/admin/waitlist?q="),
    ])
      .then(([settingsResult, listResult]) => {
        if (!alive) return;
        setSettings(settingsResult.settings);
        setEnabled(settingsResult.settings.enabled);
        setAmountDollars((settingsResult.settings.amount_cents / 100).toFixed(2));
        setEntries(listResult.entries);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setLoading(false);
        if (schemaMessage(error)) setSchemaMissing(true);
        else setLoadError(error instanceof Error ? error.message : "Could not load the waitlist.");
      });
    return () => {
      alive = false;
    };
  }, [preview]);

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    if (preview) {
      setSettings({ enabled, amount_cents: dollarsToCents(amountDollars) ?? 50000, currency: "USD" });
      showToast("Deposit settings saved in this local fixture only.");
      return;
    }
    try {
      const data = await adminJson<{ ok: true; settings: WaitlistSettings }>(
        "/api/admin/waitlist/settings",
        { method: "PATCH", body: JSON.stringify({ enabled, amount_dollars: amountDollars }) }
      );
      setSettings(data.settings);
      setEnabled(data.settings.enabled);
      setAmountDollars((data.settings.amount_cents / 100).toFixed(2));
      showToast("Deposit settings saved. Existing buyers keep their original amount.");
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Could not save settings.", "error");
    }
  }

  async function search(event: React.FormEvent) {
    event.preventDefault();
    const nextQuery = query.trim();
    if (preview) {
      setActiveQuery(nextQuery);
      const needle = nextQuery.toLowerCase();
      setEntries(
        needle
          ? preview.entries.filter((entry) =>
              `${entry.buyer_name} ${entry.buyer_phone} ${entry.buyer_email}`.toLowerCase().includes(needle)
            )
          : preview.entries
      );
      return;
    }
    try {
      await loadList(query);
      setActiveQuery(nextQuery);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Search failed.", "error");
    }
  }

  async function showOpenQueue() {
    setQuery("");
    setActiveQuery("");
    if (preview) {
      setEntries(preview.entries);
      return;
    }
    try {
      await loadList("");
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Could not reload.", "error");
    }
  }

  async function openEntry(id: string) {
    if (preview) {
      setDetail(preview.details[id] ?? null);
      return;
    }
    setOpening(true);
    try {
      const data = await adminJson<Detail>(`/api/admin/waitlist/${id}`);
      applyDetail(data);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Could not open that buyer.", "error");
    } finally {
      setOpening(false);
    }
  }

  async function run(action: Record<string, unknown>, success: string) {
    if (!detail) return;
    if (preview) {
      showToast(`${success} Local fixture only.`);
      return;
    }
    try {
      const data = await adminJson<Detail>(`/api/admin/waitlist/${detail.entry.id}`, {
        method: "POST",
        body: JSON.stringify(action),
      });
      if (data.entry) applyDetail(data);
      await loadList(activeQuery);
      showToast(success);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Could not update that buyer.", "error");
    }
  }

  if (schemaMissing) {
    return (
      <p className="text-lg text-gray-800">
        The waitlist tables are not available yet. Existing puppy pages are unchanged.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-3" aria-live="polite">
        <p className="text-base text-gray-600">Loading buyers…</p>
        <div className="h-16 animate-pulse rounded-2xl bg-stone-100" />
        <div className="h-16 animate-pulse rounded-2xl bg-stone-100" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="grid gap-3" role="alert">
        <p className="text-lg font-semibold text-red-800">{loadError}</p>
        <button className={btn("muted")} type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[36rem] flex-col gap-4">
      <DepositSettings
        settings={settings}
        amountDollars={amountDollars}
        enabled={enabled}
        onAmount={setAmountDollars}
        onEnabled={setEnabled}
        onSubmit={saveSettings}
      />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
        <section className={detail ? "hidden lg:flex lg:min-h-0 lg:flex-col" : "flex min-h-0 flex-col"} aria-label="Buyers">
          <form onSubmit={search} className="flex gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Search name, phone, or email</span>
              <input
                className={fieldClass}
                value={query}
                placeholder="Search name, phone, or email"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button className={btn("muted")} type="submit">
              Search
            </button>
          </form>
          {activeQuery ? (
            <button className="mt-2 self-start text-sm font-semibold text-meadow-800 underline" type="button" onClick={showOpenQueue}>
              Clear search and show choosing order
            </button>
          ) : (
            <p className="mt-2 text-sm text-gray-600">Open buyers, in choosing order. Selecting someone does not change them.</p>
          )}
          <ul className="mt-3 grid gap-2 lg:min-h-0 lg:overflow-y-auto">
            {entries.length === 0 ? (
              <li className="rounded-2xl bg-stone-50 px-4 py-8 text-center text-base text-gray-700 ring-1 ring-stone-200">
                {activeQuery ? "No buyer matches that search." : "No open buyers. New requests will show up here in choosing order."}
              </li>
            ) : (
              entries.map((row, index) => {
                const label = scan(row);
                const selected = detail?.entry.id === row.id;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => openEntry(row.id)}
                      className={[
                        "grid w-full grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl px-3 py-3 text-left ring-1",
                        selected ? "bg-meadow-50 ring-meadow-400" : "bg-white ring-stone-200 hover:ring-meadow-300",
                      ].join(" ")}
                    >
                      <span className="mt-0.5 w-7 text-center text-sm font-bold text-gray-500">
                        {activeQuery ? "" : index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-lg font-extrabold text-gray-900">{row.buyer_name}</span>
                        <span className="mt-0.5 block text-sm text-gray-700">{label.payment}</span>
                        <span className="mt-1 inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-xs font-bold text-gray-800">
                          {label.next}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <section className={detail || opening ? "min-h-0" : "hidden lg:block"} aria-live="polite">
          {opening && !detail ? <p className="text-gray-600">Opening buyer…</p> : null}
          {detail ? (
            <BuyerDetail
              key={`${detail.entry.id}-${detail.entry.updated_at}`}
              detail={detail}
              orderLocked={activeQuery.length > 0}
              onBack={() => setDetail(null)}
              onRun={run}
              confirm={confirm}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl bg-stone-50 px-6 py-16 text-center text-base text-gray-700 ring-1 ring-stone-200">
              Select a buyer to confirm a payment, change their place in line, or assign a puppy.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function DepositSettings({
  settings,
  amountDollars,
  enabled,
  onAmount,
  onEnabled,
  onSubmit,
}: {
  settings: WaitlistSettings | null;
  amountDollars: string;
  enabled: boolean;
  onAmount: (value: string) => void;
  onEnabled: (value: boolean) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const summary = settings
    ? `New deposits ${formatUsd(settings.amount_cents)} · Invitation ${settings.enabled ? "on" : "off"}`
    : "Deposit settings";
  return (
    <details className="rounded-2xl bg-white ring-1 ring-stone-200">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gray-800 [&::-webkit-details-marker]:hidden">
        Deposit settings · {summary}
      </summary>
      <form onSubmit={onSubmit} className="grid max-w-md gap-3 border-t border-stone-200 px-4 py-4">
        <p className="text-sm text-gray-600">Changing the amount does not rewrite deposits already saved.</p>
        <label className="grid gap-1 text-sm font-semibold text-gray-800">
          Amount for new requests
          <input className={fieldClass} value={amountDollars} onChange={(event) => onAmount(event.target.value)} inputMode="decimal" />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <input type="checkbox" checked={enabled} onChange={(event) => onEnabled(event.target.checked)} />
          Show the public invitation
        </label>
        <button className={btn("primary")} type="submit">
          Save deposit settings
        </button>
      </form>
    </details>
  );
}

function BuyerDetail({
  detail,
  orderLocked,
  onBack,
  onRun,
  confirm,
}: {
  detail: Detail;
  orderLocked: boolean;
  onBack: () => void;
  onRun: (action: Record<string, unknown>, success: string) => Promise<void>;
  confirm: (opts?: { title?: string; message?: string; confirmLabel?: string; danger?: boolean }) => Promise<boolean>;
}) {
  const entry = detail.entry;
  const label = scan(entry);
  const [received, setReceived] = React.useState((entry.amount_cents / 100).toFixed(2));
  const [resolutionNote, setResolutionNote] = React.useState("");
  const [dogId, setDogId] = React.useState("");
  const [excessNote, setExcessNote] = React.useState("");
  const [note, setNote] = React.useState(entry.admin_note ?? "");
  const [refundStatus, setRefundStatus] = React.useState(entry.refund_status);
  const [refundDollars, setRefundDollars] = React.useState(
    entry.refund_amount_cents == null ? "" : (entry.refund_amount_cents / 100).toFixed(2)
  );
  const [refundReason, setRefundReason] = React.useState(entry.refund_reason ?? "");
  const [refundReference, setRefundReference] = React.useState(entry.refund_reference ?? "");
  const [closeBusiness, setCloseBusiness] = React.useState(false);

  const receivedCents = dollarsToCents(received);
  const mismatch = receivedCents != null && receivedCents !== entry.amount_cents;
  const selectedDog = detail.dogs.find((dog) => dog.id === dogId);
  const excess =
    entry.confirmed_amount_cents != null &&
    selectedDog?.price_amount_cents != null &&
    entry.confirmed_amount_cents > selectedDog.price_amount_cents;

  return (
    <div className="grid gap-4">
      <button className="self-start text-sm font-semibold text-meadow-800 underline lg:hidden" type="button" onClick={onBack}>
        Back to buyers
      </button>
      <header>
        <h2 className="text-2xl font-extrabold text-gray-900">{entry.buyer_name}</h2>
        <p className="mt-1 text-base text-gray-700">
          <a className="underline" href={`tel:${entry.buyer_phone}`}>{entry.buyer_phone}</a>
          {" · "}
          <a className="underline" href={`mailto:${entry.buyer_email}`}>{entry.buyer_email}</a>
        </p>
        <p className="mt-2 text-sm font-bold text-gray-800">
          {label.payment} · Next: {label.next}
          {entry.pass_count > 0 ? ` · Passed ${entry.pass_count} batch${entry.pass_count === 1 ? "" : "es"}` : ""}
        </p>
      </header>

      <dl className="grid gap-2 rounded-2xl bg-stone-50 p-4 text-sm text-gray-800 ring-1 ring-stone-200 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-gray-500">Saved deposit</dt>
          <dd className="text-lg font-extrabold text-gray-900">{formatUsd(entry.amount_cents)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-500">Confirmed received</dt>
          <dd className="text-lg font-extrabold text-gray-900">
            {entry.confirmed_amount_cents == null ? "Not yet" : formatUsd(entry.confirmed_amount_cents)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-gray-500">Preferences</dt>
          <dd>
            {entry.breed_preference || "No breed preference"} · {entry.sex_preference || "No sex preference"}
            {entry.note ? ` · ${entry.note}` : ""}
          </dd>
        </div>
        {detail.assigned_dog ? (
          <div className="sm:col-span-2">
            <dt className="font-semibold text-gray-500">Assigned puppy</dt>
            <dd>
              {detail.assigned_dog.name}
              {entry.credit_applied_cents == null ? "" : ` · credited ${formatUsd(entry.credit_applied_cents)}`}
            </dd>
          </div>
        ) : null}
      </dl>

      {entry.payment_status !== "confirmed" && entry.handling_status === "open" ? (
        <form
          className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200"
          onSubmit={(event) => {
            event.preventDefault();
            if (receivedCents == null) return;
            void onRun(
              { action: "confirm_payment", received_amount_cents: receivedCents, resolution_note: resolutionNote },
              mismatch ? "Recorded the amount you actually received." : "Payment confirmed."
            );
          }}
        >
          <h3 className="text-lg font-extrabold text-gray-900">Confirm the money you received</h3>
          <label className="grid gap-1 text-sm font-semibold text-gray-800">
            Amount received
            <input className={fieldClass} value={received} onChange={(event) => setReceived(event.target.value)} inputMode="decimal" />
          </label>
          {mismatch ? (
            <label className="grid gap-1 text-sm font-semibold text-gray-800">
              This is not the saved deposit. How are you handling the difference?
              <textarea className={fieldClass} rows={2} value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} />
            </label>
          ) : null}
          <button className={btn("primary")} type="submit">Confirm receipt</button>
        </form>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          className={btn("muted")}
          type="button"
          disabled={orderLocked || entry.handling_status !== "open"}
          onClick={() => onRun({ action: "reorder", direction: "earlier" }, "Moved earlier in the choosing order.")}
        >
          Move earlier
        </button>
        <button
          className={btn("muted")}
          type="button"
          disabled={orderLocked || entry.handling_status !== "open"}
          onClick={() => onRun({ action: "reorder", direction: "later" }, "Moved later in the choosing order.")}
        >
          Move later
        </button>
        {orderLocked ? <p className="self-center text-sm text-gray-600">Clear the search before changing order.</p> : null}
      </div>

      <details className="rounded-2xl bg-white ring-1 ring-stone-200">
        <summary className="cursor-pointer px-4 py-3 text-base font-extrabold text-gray-900">Assign a puppy</summary>
        <form
          className="grid gap-3 border-t border-stone-200 px-4 py-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const ok = await confirm({
              title: "Assign this puppy?",
              message: "The confirmed deposit is credited once and the puppy is marked reserved.",
              confirmLabel: "Assign",
            });
            if (!ok) return;
            await onRun({ action: "assign", dog_id: dogId, excess_note: excessNote }, "Puppy assigned and deposit credited once.");
          }}
        >
          {entry.payment_status !== "confirmed" ? (
            <p className="text-sm text-gray-700">Confirm the payment before assigning a puppy.</p>
          ) : entry.credit_status === "applied" ? (
            <p className="text-sm text-gray-700">This deposit was already credited.</p>
          ) : (
            <>
              <label className="grid gap-1 text-sm font-semibold text-gray-800">
                Available puppy
                <select className={fieldClass} value={dogId} onChange={(event) => setDogId(event.target.value)}>
                  <option value="">Choose a puppy</option>
                  {detail.dogs.map((dog) => (
                    <option key={dog.id} value={dog.id}>
                      {dog.name}
                      {dog.price_amount_cents == null ? "" : ` · ${formatUsd(dog.price_amount_cents)}`}
                    </option>
                  ))}
                </select>
              </label>
              {excess ? (
                <label className="grid gap-1 text-sm font-semibold text-gray-800">
                  The confirmed deposit is higher than this price. How is the difference handled?
                  <textarea className={fieldClass} rows={2} value={excessNote} onChange={(event) => setExcessNote(event.target.value)} />
                </label>
              ) : null}
              <button className={btn("primary")} type="submit">Assign and credit once</button>
            </>
          )}
        </form>
      </details>

      <details className="rounded-2xl bg-white ring-1 ring-stone-200">
        <summary className="cursor-pointer px-4 py-3 text-base font-extrabold text-gray-900">Note</summary>
        <form
          className="grid gap-3 border-t border-stone-200 px-4 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onRun({ action: "note", admin_note: note }, "Note saved.");
          }}
        >
          <textarea className={fieldClass} rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
          <button className={btn("muted")} type="submit">Save note</button>
        </form>
      </details>

      <details className="rounded-2xl bg-white ring-1 ring-stone-200">
        <summary className="cursor-pointer px-4 py-3 text-base font-extrabold text-gray-900">History</summary>
        <ul className="grid gap-2 border-t border-stone-200 px-4 py-4">
          {detail.events.length === 0 ? <li className="text-sm text-gray-600">No history yet.</li> : null}
          {detail.events.map((event) => (
            <li key={event.id} className="text-sm text-gray-800">
              <span className="font-semibold">{event.kind.replaceAll("_", " ")}</span>
              {" · "}
              {new Date(event.created_at).toLocaleString()}
              {event.note ? ` · ${event.note}` : ""}
            </li>
          ))}
        </ul>
      </details>

      <details className="rounded-2xl bg-white ring-1 ring-stone-200">
        <summary className="cursor-pointer px-4 py-3 text-base font-extrabold text-gray-900">Pass, cancellation, or shop refund</summary>
        <div className="grid gap-4 border-t border-stone-200 px-4 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              className={btn("muted")}
              type="button"
              onClick={async () => {
                const ok = await confirm({
                  title: "Record a pass?",
                  message: "The deposit stays active so they can choose from a later batch.",
                  confirmLabel: "Record pass",
                });
                if (ok) await onRun({ action: "pass" }, "Pass recorded. The deposit stays active.");
              }}
            >
              They passed this batch
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
                if (ok) await onRun({ action: "buyer_cancel" }, "Buyer cancellation recorded. The deposit was not refunded.");
              }}
            >
              Buyer cancelled
            </button>
          </div>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const amount = refundStatus === "none" ? null : dollarsToCents(refundDollars);
              void onRun(
                {
                  action: "business",
                  refund_status: refundStatus,
                  refund_amount_cents: amount,
                  refund_reason: refundReason,
                  refund_reference: refundReference,
                  close: closeBusiness,
                },
                "Shop decision saved. No money was sent from the site."
              );
            }}
          >
            <h3 className="text-base font-extrabold text-gray-900">If the shop cannot fulfill</h3>
            <label className="grid gap-1 text-sm font-semibold text-gray-800">
              Refund record
              <select className={fieldClass} value={refundStatus} onChange={(event) => setRefundStatus(event.target.value as WaitlistEntry["refund_status"])}>
                <option value="none">No refund</option>
                <option value="approved">Refund approved, money not returned yet</option>
                <option value="returned">Money returned by hand</option>
              </select>
            </label>
            {refundStatus !== "none" ? (
              <>
                <label className="grid gap-1 text-sm font-semibold text-gray-800">
                  Amount
                  <input className={fieldClass} value={refundDollars} onChange={(event) => setRefundDollars(event.target.value)} inputMode="decimal" />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-gray-800">
                  Reason
                  <textarea className={fieldClass} rows={2} value={refundReason} onChange={(event) => setRefundReason(event.target.value)} />
                </label>
                {refundStatus === "returned" ? (
                  <label className="grid gap-1 text-sm font-semibold text-gray-800">
                    Reference from the payment app
                    <input className={fieldClass} value={refundReference} onChange={(event) => setRefundReference(event.target.value)} />
                  </label>
                ) : null}
              </>
            ) : null}
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <input type="checkbox" checked={closeBusiness} onChange={(event) => setCloseBusiness(event.target.checked)} />
              Also close this buyer
            </label>
            <button className={btn("muted")} type="submit">Save shop decision</button>
          </form>
        </div>
      </details>
    </div>
  );
}
