"use client";

import * as React from "react";
import { ReservationsPanel } from "@/components/admin/reservations/ReservationsPanel";
import { toastClass } from "@/components/admin/AdminUi";

export default function AdminReservationsPage() {
  const [toast, setToast] = React.useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <div className={toastClass}>
          <span className="text-base" aria-hidden>✅</span>
          <span>{toast}</span>
        </div>
      ) : null}

      <ReservationsPanel onToast={showToast} />
    </div>
  );
}
