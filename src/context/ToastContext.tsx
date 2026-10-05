"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ToastContainer from "@/components/ui/toast/ToastContainer";

export type ToastVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

export interface Toast {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration: number;
}

type ToastOptions = {
  title?: string;
  duration?: number;
};

type ShowToast = (message: string, options?: ToastOptions) => string;
type UpdateToast = (
  id: string,
  variant: ToastVariant,
  message: string,
  options?: ToastOptions
) => void;

interface ToastContextType {
  toasts: Toast[];
  success: ShowToast;
  error: ShowToast;
  warning: ShowToast;
  info: ShowToast;
  loading: ShowToast;
  update: UpdateToast;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const DEFAULT_DURATION = 4000;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used with ToastProvider");
  }
  return context;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const clearTimer = useCallback((id: string) => {
    const timer = timers.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timers.current[id];
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    [clearTimer]
  );

  const dismissAll = useCallback(() => {
    Object.keys(timers.current).forEach(clearTimer);
    setToasts([]);
  }, [clearTimer]);

  const show = useCallback(
    (variant: ToastVariant, message: string, options?: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const duration = options?.duration ?? DEFAULT_DURATION;
      // Loading toasts stay until the caller dismisses or updates them
      const effectiveDuration = variant === "loading" ? 0 : duration;

      setToasts((prev) => [
        ...prev,
        {
          id,
          variant,
          title: options?.title,
          message,
          duration: effectiveDuration,
        },
      ]);

      if (effectiveDuration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), effectiveDuration);
      }

      return id;
    },
    [dismiss]
  );

  // Replace an existing toast in place, keeping its position and timer
  const update = useCallback(
    (id: string, variant: ToastVariant, message: string, options?: ToastOptions) => {
      clearTimer(id);
      const duration = options?.duration ?? DEFAULT_DURATION;
      const effectiveDuration = variant === "loading" ? 0 : duration;

      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id
            ? {
                ...toast,
                variant,
                message,
                title: options?.title,
                duration: effectiveDuration,
              }
            : toast
        )
      );

      if (effectiveDuration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), effectiveDuration);
      }
    },
    [clearTimer, dismiss]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      Object.keys(pending).forEach((id) => clearTimeout(pending[id]));
    };
  }, []);

  const value: ToastContextType = {
    toasts,
    success: (message, options) => show("success", message, options),
    error: (message, options) => show("error", message, options),
    warning: (message, options) => show("warning", message, options),
    info: (message, options) => show("info", message, options),
    loading: (message, options) => show("loading", message, options),
    update,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};
