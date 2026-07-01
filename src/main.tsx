import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { useToastStore } from "./components/Toast.tsx";
import "./index.css";

// A-12 fix: global error handlers for errors that React's ErrorBoundary
// CANNOT catch — async errors, setTimeout/setInterval callback errors,
// Promise rejections, and errors thrown during state updates from outside
// React. Without these, such errors either crash the tab invisibly or are
// silently dropped. We route them to the toast system so the user sees a
// generic "Something went wrong" message (never the raw error, which may
// contain PII or SDK internals).
//
// These handlers are installed once at module load (before React renders).
// They are intentionally coarse — the goal is visibility, not recovery.

window.addEventListener("error", (event) => {
  // Uncaught synchronous errors (e.g., from setTimeout callbacks).
  console.error("[global] Uncaught error:", event.error ?? event.message);
  try {
    useToastStore.getState().push({
      variant: "error",
      title: "Something went wrong",
      message: "An unexpected error occurred. Your data is safe.",
      duration: 6000,
    });
  } catch {
    // If the toast store isn't available (e.g. during SSR or before React
    // mounts), the console.error above is the fallback — no toast.
  }
});

window.addEventListener("unhandledrejection", (event) => {
  // Unhandled Promise rejections (e.g., from fetch calls, async/await).
  console.error("[global] Unhandled promise rejection:", event.reason);
  try {
    useToastStore.getState().push({
      variant: "error",
      title: "Something went wrong",
      message: "A background operation failed. Please try again.",
      duration: 6000,
    });
  } catch {
    // Fallback to console only.
  }
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found in document");
}
createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
