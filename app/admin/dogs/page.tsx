"use client";

import * as React from "react";
import { DogsPanel } from "@/components/admin/DogPanel";
import { toastClass } from "@/components/admin/AdminUi";

export default function AdminDogsPage() {
  const [toast, setToast] = React.useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="flex flex-1 flex-col lg:min-h-0 lg:overflow-hidden">
      {toast ? (
        <div className={`${toastClass} shrink-0`}>
          <span className="text-base" aria-hidden>✅</span>
          <span>{toast}</span>
        </div>
      ) : null}

      <DogsPanel onToast={showToast} />
    </div>
  );
}
