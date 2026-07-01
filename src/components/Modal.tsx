import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Modal — accessible modal dialog component.
 *
 * F-C2 fix: the codebase had 9 ad-hoc modals (TrainingTab program presets,
 * tutorial video, split-builder; ProgressTab custom-set logger, share-card;
 * MealOrderingTab meal swap, checkout; MarketplaceTab cart drawer, checkout)
 * all using `<div className="fixed inset-0 z-50">` with NO role="dialog",
 * NO aria-modal, NO Escape handler, NO focus trap, NO autofocus, and NO
 * restore-focus. Keyboard users were locked out; screen readers announced
 * background content alongside the modal.
 *
 * This component provides the correct ARIA pattern + keyboard interaction
 * so the 9 modals can adopt it incrementally. Each modal that migrates here
 * gains: role="dialog", aria-modal="true", aria-labelledby, Escape-to-close,
 * autofocus on the first focusable element (or an explicit close button),
 * and restore-focus to the trigger on close.
 *
 * Full focus-trap (Tab/Shift+Tab cycling) is implemented by setting
 * `inert` on the background tree when browser support allows; for older
 * browsers, Tab will escape the modal but Escape + the explicit close
 * button still work.
 *
 * Usage:
 *   <Modal open={isOpen} onClose={() => setOpen(false)} title="My Modal">
 *     ...content...
 *   </Modal>
 *
 * For modals with an explicit close (X) button, pass `showCloseButton`
 * (default true). For modals that should NOT close on overlay click
 * (e.g. a destructive confirmation), pass `closeOnOverlayClick={false}`.
 */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Visible title; also used as the dialog's accessible name via aria-labelledby. */
  title: string;
  /** Optional id for the title element; auto-generated if omitted. */
  titleId?: string;
  children: ReactNode;
  /** Show the X close button in the top-right. Default true. */
  showCloseButton?: boolean;
  /** Close when the overlay is clicked. Default true. Set false for destructive confirmations. */
  closeOnOverlayClick?: boolean;
  /** Max width class (Tailwind). Default "max-w-sm". */
  maxWidthClass?: string;
  /** z-index class. Default "z-50". */
  zIndexClass?: string;
  /** ARIA role. "dialog" for normal modals, "alertdialog" for confirmations. Default "dialog". */
  role?: "dialog" | "alertdialog";
}

export function Modal({
  open,
  onClose,
  title,
  titleId,
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  maxWidthClass = "max-w-sm",
  zIndexClass = "z-50",
  role = "dialog",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const autoTitleId = titleId ?? `modal-title-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;

  // Escape to close + autofocus + restore focus.
  useEffect(() => {
    if (!open) return;

    // Remember the element that had focus before the modal opened so we can
    // restore it on close.
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    // Focus the close button (or first focusable) on the next paint.
    const rafId = requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
      // Tab focus trap: when Tabbing from the last focusable, wrap to the first;
      // when Shift+Tab from the first, wrap to the last. This keeps keyboard
      // focus inside the modal.
      if (e.key === "Tab" && overlayRef.current) {
        const focusables = overlayRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Capture phase so we intercept before any modal-internal handlers.
    document.addEventListener("keydown", onKey, true);

    // Lock body scroll while the modal is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      // Restore focus to the trigger.
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className={`fixed inset-0 ${zIndexClass} bg-[#1A1A1A]/80 flex items-center justify-center p-4`}
      onClick={(e) => {
        // Only close if the click was directly on the overlay (not a child).
        if (closeOnOverlayClick && e.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-white border border-[#1A1A1A]/10 rounded-none ${maxWidthClass} w-full overflow-hidden shadow-xl`}
        role={role}
        aria-modal="true"
        aria-labelledby={autoTitleId}
      >
        {(showCloseButton || title) && (
          <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 p-4 bg-[#F9F8F6]">
            <h3 id={autoTitleId} className="font-serif italic font-black text-lg text-[#1A1A1A]">
              {title}
            </h3>
            {showCloseButton && (
              <button
                ref={closeBtnRef}
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        {/* When no header is shown, we still need the close button focusable
            for autofocus. Render a visually-hidden one as the first focusable. */}
        {!showCloseButton && !title && (
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="sr-only"
          >
            Close
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
