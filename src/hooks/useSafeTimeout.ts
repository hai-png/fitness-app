import { useCallback, useEffect, useRef } from "react";

/**
 * useSafeTimeout — a setTimeout wrapper that is safe against component unmount.
 *
 * F-H4 fix: 8 bare `setTimeout` calls across MealOrderingTab, MarketplaceTab,
 * ProgressTab, and Onboarding previously had no cleanup. If the user closed
 * the modal or navigated to another tab before the timeout fired, React 19
 * queued a state update on an unmounted component — and worse, the callback
 * still executed its side effects (e.g. pushing an order the user thought
 * they cancelled). This hook tracks the mounted state via a ref and skips
 * the callback if the component has unmounted.
 *
 * Usage:
 *   const safeTimeout = useSafeTimeout();
 *   safeTimeout(() => setIsOrderSuccess(false), 3200);
 *
 * The returned function has the same signature as setTimeout but does NOT
 * return a handle (cleanup is automatic on unmount). If you need to cancel
 * a pending timeout manually, use a plain `useRef<number>` + `clearTimeout`.
 */
export function useSafeTimeout(): (fn: () => void, ms: number) => void {
  const mountedRef = useRef(true);
  const timersRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    mountedRef.current = true;
    // Snapshot the timers set so cleanup uses the same instance even if the
    // ref is reassigned later (defensive — current implementation never reassigns).
    const timers = timersRef.current;
    return () => {
      mountedRef.current = false;
      // Clear all pending timers on unmount so no callback fires after unmount.
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
    };
  }, []);

  return useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id);
      if (mountedRef.current) fn();
    }, ms);
    timersRef.current.add(id);
  }, []);
}
