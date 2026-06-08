"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { btn } from "@/components/admin/AdminUi";

/**
 * Shared confirm dialog. Provides an async `confirm()` that resolves to a
 * boolean, so call sites read just like the native `window.confirm` they
 * replace — but with on-brand styling, a danger variant, and ESC/backdrop
 * dismissal.
 *
 *   const { confirm } = useConfirm();
 *   if (await confirm({ title: "Delete?", danger: true })) { ... }
 */

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmContextValue = {
  confirm: (opts?: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = React.createContext<ConfirmContextValue | null>(null);

export function useConfirm(): ConfirmContextValue {
  const ctx = React.useContext(ConfirmContext);
  // Fail soft to the native confirm so call sites still work if rendered
  // outside the provider.
  if (!ctx) {
    return {
      confirm: async (opts?: ConfirmOptions) =>
        window.confirm(opts?.message || opts?.title || "Are you sure?"),
    };
  }
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [opts, setOpts] = React.useState<ConfirmOptions>({});
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback((next?: ConfirmOptions) => {
    setOpts(next ?? {});
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = React.useCallback((result: boolean) => {
    setOpen(false);
    resolverRef.current?.(result);
    resolverRef.current = null;
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {open ? (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/55"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-confirm-title"
          onClick={(e) => e.target === e.currentTarget && close(false)}
        >
          <div className="w-full max-w-md rounded-2xl border-2 border-stone-200 bg-white shadow-adminLg ring-1 ring-black/10">
            <div className="flex items-start gap-4 p-5 sm:p-6">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  opts.danger
                    ? "bg-red-100 ring-2 ring-red-200"
                    : "bg-meadow-100 ring-2 ring-meadow-200"
                }`}
              >
                <AlertTriangle
                  size={24}
                  className={opts.danger ? "text-red-600" : "text-meadow-700"}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="admin-confirm-title"
                  className="text-xl font-bold text-gray-900"
                >
                  {opts.title || "Are you sure?"}
                </h2>
                {opts.message ? (
                  <p className="mt-1.5 text-[17px] leading-relaxed text-gray-600">
                    {opts.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-stone-200 p-4 sm:flex-row sm:justify-end sm:p-5">
              <button
                type="button"
                className={`${btn("muted")} w-full sm:w-auto`}
                onClick={() => close(false)}
              >
                {opts.cancelLabel || "Cancel"}
              </button>
              <button
                type="button"
                className={`${btn(opts.danger ? "danger" : "primary")} w-full sm:w-auto`}
                onClick={() => close(true)}
                autoFocus
              >
                {opts.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}
