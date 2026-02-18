"use client";

import * as React from "react";
import { TestimonialsPanel } from "@/components/admin/testimonials/TestimonialsPanel";
import { toastClass } from "@/components/admin/AdminUi";

export default function AdminTestimonialsPage() {
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

      <TestimonialsPanel onToast={showToast} />
    </div>
  );
}
