/**
 * A-19: URL routing scaffold.
 *
 * This module sets up react-router for the app. Currently the app uses
 * useState for tab tracking, which means:
 *   - Refresh returns the user to the Training tab (loses their place)
 *   - No deep linking (can't share a URL to a specific tab)
 *   - Back/forward buttons don't work
 *
 * This scaffold provides a HashRouter (works without server config) and
 * a route map. The app is NOT yet migrated to use it — App.tsx still uses
 * useState. To migrate:
 *
 *   1. Wrap <App/> in <RouterProvider router={router}/> in main.tsx
 *   2. Replace `const [activeTab, setActiveTab] = useState(...)` in App.tsx
 *      with `const navigate = useNavigate()` + `useLocation()`
 *   3. Replace `setActiveTab("training")` with `navigate("/training")`
 *   4. Render the active tab based on `location.pathname` instead of state
 *
 * The router is exported but not wired in main.tsx yet — this is a
 * non-breaking scaffold so the team can opt-in when ready.
 */
import { createHashRouter, type RouteObject } from "react-router-dom";

export type TabId = "training" | "meals" | "progress" | "marketplace" | "profile";

export const TAB_ROUTES: Record<TabId, string> = {
  training: "/training",
  meals: "/meals",
  progress: "/progress",
  marketplace: "/marketplace",
  profile: "/profile",
};

export const ROUTE_TO_TAB: Record<string, TabId> = Object.entries(TAB_ROUTES).reduce(
  (acc, [tab, route]) => {
    acc[route] = tab as TabId;
    return acc;
  },
  {} as Record<string, TabId>,
);

/**
 * The root route renders <App/>, which handles the tab switching internally.
 * When the app is fully migrated, each tab will be its own route element.
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    lazy: () => import("../App").then((m) => ({ Component: m.default })),
  },
  {
    path: "/training",
    lazy: () => import("../App").then((m) => ({ Component: m.default })),
  },
  {
    path: "/meals",
    lazy: () => import("../App").then((m) => ({ Component: m.default })),
  },
  {
    path: "/progress",
    lazy: () => import("../App").then((m) => ({ Component: m.default })),
  },
  {
    path: "/marketplace",
    lazy: () => import("../App").then((m) => ({ Component: m.default })),
  },
  {
    path: "/profile",
    lazy: () => import("../App").then((m) => ({ Component: m.default })),
  },
];

/**
 * HashRouter — works without server-side route configuration. The URL will
 * look like `https://app.example.com/#/training` which the Express static
 * handler serves correctly without a catch-all fallback.
 *
 * To switch to BrowserRouter (cleaner URLs), the server must serve
 * index.html for all non-API routes. The current server.ts already does
 * this (S-07 fix), so BrowserRouter is viable — but HashRouter is safer
 * for static hosting without a catch-all.
 */
export const router = createHashRouter(routes);

/**
 * Convert a TabId to its URL path.
 */
export function tabToPath(tab: TabId): string {
  return TAB_ROUTES[tab];
}

/**
 * Convert a URL path to a TabId. Returns "training" as the default.
 */
export function pathToTab(path: string): TabId {
  return ROUTE_TO_TAB[path] ?? "training";
}
