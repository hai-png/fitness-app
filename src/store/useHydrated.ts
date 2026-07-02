import { useEffect, useState } from "react";

/**
 * Returns `false` until the persisted zustand stores have rehydrated from
 * localStorage on the client, then `true`.
 *
 * Use this to gate rendering of any component that reads persisted state,
 * so the first paint doesn't flash an empty state (e.g. showing the
 * onboarding flow to a user who has already completed it).
 *
 * @example
 * const hydrated = useHydrated();
 * if (!hydrated) return <LoadingScreen />;
 * return <App />;
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // zustand persist is synchronous by default (uses localStorage), so it
    // rehydrates during the first render. But React's effect runs after paint,
    // so we still need this gate to avoid a flash of the un-persisted state.
    setHydrated(true);
  }, []);

  return hydrated;
}
