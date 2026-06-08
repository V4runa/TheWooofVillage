"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

/**
 * Shared admin toast system.
 *
 * Mounted once (in AdminShell) so every admin page gets consistent,
 * floating, stacked feedback for both successes and errors. Replaces the
 * old per-page inline toast that always rendered a green ✅ even for errors.
 */

type ToastVariant = "success" | "error";
type ToastItem = { id: number; message: string; variant: ToastVariant };

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  // Fail soft: if a component is rendered outside the provider, never crash —
  // just drop the toast. This keeps panels resilient.
  if (!ctx) return { showToast: () => {} };
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const remove = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, variant }]);
      // Errors linger a bit longer so they're not missed.
      window.setTimeout(() => remove(id), variant === "error" ? 5000 : 2600);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-3 z-[10000] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={[
              "admin-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 shadow-adminLg ring-1",
              t.variant === "error"
                ? "bg-red-50 text-red-900 ring-red-200"
                : "bg-white text-gray-900 ring-meadow-200",
            ].join(" ")}
          >
            <span className="mt-0.5 shrink-0" aria-hidden>
              {t.variant === "error" ? (
                <AlertCircle size={20} className="text-red-600" />
              ) : (
                <CheckCircle2 size={20} className="text-meadow-600" />
              )}
            </span>
            <span className="min-w-0 flex-1 text-[17px] font-semibold leading-snug">
              {t.message}
            </span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="-mr-1 shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-700"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes adminToastIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .admin-toast {
          animation: adminToastIn 180ms ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .admin-toast {
            animation: none;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
