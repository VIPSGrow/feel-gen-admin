"use client";
import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LoaderCircle,
  X,
  XCircle,
} from "lucide-react";
import type { ToastVariant, Toast } from "@/context/ToastContext";

interface ToastContainerProps {
  toasts: Toast[];
  dismiss: (id: string) => void;
}

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; iconNode: React.ReactNode }
> = {
  success: {
    container:
      "border-success-500 bg-success-50 dark:border-success-500/30 dark:bg-gray-800",
    icon: "text-success-500",
    iconNode: <CheckCircle2 className="size-5 shrink-0" />,
  },
  error: {
    container:
      "border-error-500 bg-error-50 dark:border-error-500/30 dark:bg-gray-800",
    icon: "text-error-500",
    iconNode: <XCircle className="size-5 shrink-0" />,
  },
  warning: {
    container:
      "border-warning-500 bg-warning-50 dark:border-warning-500/30 dark:bg-gray-800",
    icon: "text-warning-500",
    iconNode: <AlertTriangle className="size-5 shrink-0" />,
  },
  info: {
    container:
      "border-blue-light-500 bg-blue-light-50 dark:border-blue-light-500/30 dark:bg-gray-800",
    icon: "text-blue-light-500",
    iconNode: <Info className="size-5 shrink-0" />,
  },
  loading: {
    container:
      "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800",
    icon: "text-gray-500 dark:text-gray-400",
    iconNode: (
      <LoaderCircle className="size-5 shrink-0 animate-spin" />
    ),
  },
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, dismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.variant === "error" ? "alert" : "status"}
          aria-live={toast.variant === "error" ? "assertive" : "polite"}
          className={`pointer-events-auto toast-enter flex items-start gap-3 rounded-xl border p-4 shadow-lg ${variantStyles[toast.variant].container}`}
        >
          <div className={`-mt-0.5 ${variantStyles[toast.variant].icon}`}>
            {variantStyles[toast.variant].iconNode}
          </div>

          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className="mb-0.5 text-sm font-semibold text-gray-800 dark:text-white/90">
                {toast.title}
              </h4>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Close notification"
            className="-mt-0.5 -mr-1 rounded-lg p-1 text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
