import { create } from "zustand";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from "lucide-react";

/**
 * Toast severity levels.
 */
export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  /** Auto-dismiss after N ms. Default 4000. Set to 0 for sticky. */
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id" | "duration"> & { duration?: number }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

/**
 * Global toast store. Any component can call `useToastStore.getState().push(...)`
 * without needing to be inside a ToastProvider — the <ToastViewport/> component
 * mounted once at the app root subscribes to the store and renders the toasts.
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: ({ variant, title, message, duration }) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `toast-${crypto.randomUUID()}`
        : `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const toast: Toast = {
      id,
      variant,
      title,
      message,
      duration: duration ?? 4000,
    };
    // F-L4 fix: cap the visible toast stack at 5. When a new toast would
    // exceed the cap, drop the oldest first (shift). This prevents an
    // unbounded toast stack from overflowing the viewport on rapid-fire
    // error paths (e.g. a tight loop calling toast.error).
    set((s) => {
      const next = [...s.toasts, toast];
      if (next.length > 5) {
        // Remove from the front (oldest) until we're at the cap.
        return { toasts: next.slice(next.length - 5) };
      }
      return { toasts: next };
    });
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

// ---------------------------------------------------------------------------
// Convenience helpers — call directly from anywhere:
//   import { toast } from "../components/Toast";
//   toast.success("Saved!", "Your weight log was recorded.");
// ---------------------------------------------------------------------------

export const toast = {
  success: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().push({ variant: "success", title, message, duration }),
  error: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().push({ variant: "error", title, message, duration }),
  warning: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().push({ variant: "warning", title, message, duration }),
  info: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().push({ variant: "info", title, message, duration }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};

// ---------------------------------------------------------------------------
// Viewport — mount once at the app root.
// ---------------------------------------------------------------------------

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; iconColor: string; borderColor: string }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-[#E63946]",
    borderColor: "border-[#E63946]/30",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    borderColor: "border-amber-200",
  },
  info: { icon: Info, iconColor: "text-[#1A1A1A]", borderColor: "border-[#1A1A1A]/15" },
};

function ToastItem({ toast: t }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const cfg = VARIANT_CONFIG[t.variant];
  const Icon = cfg.icon;

  useEffect(() => {
    if (t.duration <= 0) return;
    const timer = setTimeout(() => dismiss(t.id), t.duration);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, dismiss]);

  return (
    <div
      role="alert"
      aria-live={t.variant === "error" ? "assertive" : "polite"}
      className={`pointer-events-auto bg-white border ${cfg.borderColor} shadow-lg flex items-start gap-2.5 p-3 max-w-[340px] w-full animate-in fade-in slide-in-from-bottom-2`}
    >
      <Icon className={`w-4 h-4 ${cfg.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-grow min-w-0">
        <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-tight">{t.title}</p>
        {t.message && (
          <p className="text-[10px] text-[#1A1A1A]/70 mt-0.5 font-serif italic leading-relaxed break-words">
            {t.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(t.id)}
        aria-label="Dismiss notification"
        className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/**
 * Mount once at the top of the app tree (inside the ErrorBoundary, outside
 * the routed content). Renders a fixed-position stack of active toasts at
 * the top-center of the viewport.
 */
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// In-app confirm dialog (replaces window.confirm).
// Returns a Promise<boolean> so callers can `await confirm(...)`.
// ---------------------------------------------------------------------------

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive: boolean;
  resolver: ((v: boolean) => void) | null;
}

interface ConfirmStore extends ConfirmState {
  show: (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  }) => Promise<boolean>;
  resolve: (v: boolean) => void;
}

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  open: false,
  title: "",
  message: "",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  destructive: false,
  resolver: null,

  show: ({ title, message, confirmLabel, cancelLabel, destructive }) =>
    new Promise<boolean>((resolve) => {
      set({
        open: true,
        title,
        message,
        confirmLabel: confirmLabel ?? "Confirm",
        cancelLabel: cancelLabel ?? "Cancel",
        destructive: destructive ?? false,
        resolver: resolve,
      });
    }),

  resolve: (v) => {
    const r = get().resolver;
    set({ open: false, resolver: null });
    if (r) r(v);
  },
}));

/**
 * Imperative confirm — call from anywhere:
 *   const ok = await confirmDialog({ title: "Reset?", message: "This will..." });
 *   if (ok) doReset();
 */
export const confirmDialog = (opts: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}) => useConfirmStore.getState().show(opts);

export function ConfirmViewport() {
  // F-M8 fix: use individual selectors instead of subscribing to the entire
  // store. Previously `const s = useConfirmStore()` re-rendered on every
  // confirm-state field change (including resolver set/clear).
  const open = useConfirmStore((s) => s.open);
  const title = useConfirmStore((s) => s.title);
  const message = useConfirmStore((s) => s.message);
  const confirmLabel = useConfirmStore((s) => s.confirmLabel);
  const cancelLabel = useConfirmStore((s) => s.cancelLabel);
  const destructive = useConfirmStore((s) => s.destructive);
  const resolve = useConfirmStore((s) => s.resolve);

  // F-M9 fix: autofocus the cancel button on open so keyboard users have a
  // safe default (cancel) focused. Also restore focus to the trigger on close
  // — React's focus management handles this if we focus before the dialog
  // unmounts; here we focus the cancel button as the least-destructive choice.
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    // Focus on the next paint so the button is mounted.
    const id = requestAnimationFrame(() => cancelBtnRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  // F-M9 fix: close on Escape. Previously the alertdialog had correct ARIA
  // (role, aria-modal, aria-labelledby) but no keyboard handler — keyboard
  // users had to Tab to the cancel button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        resolve(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, resolve]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-[#1A1A1A]/80 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div className="bg-white border border-[#1A1A1A]/10 max-w-sm w-full p-5 shadow-xl">
        <h3 id="confirm-title" className="font-serif italic font-black text-lg text-[#1A1A1A] mb-2">
          {title}
        </h3>
        <p
          id="confirm-message"
          className="text-xs text-[#1A1A1A]/70 font-serif italic leading-relaxed mb-5"
        >
          {message}
        </p>
        <div className="flex gap-2">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={() => resolve(false)}
            className="flex-1 py-3 bg-white border border-[#1A1A1A]/15 hover:border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold uppercase tracking-widest transition-all"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => resolve(true)}
            className={`flex-1 py-3 text-white text-xs font-bold uppercase tracking-widest transition-all ${
              destructive
                ? "bg-[#E63946] hover:bg-[#d62828]"
                : "bg-[#1A1A1A] hover:bg-[#1A1A1A]/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
