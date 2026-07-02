import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { initSentry } from "./lib/sentry.ts";
import "./index.css";

// D-05: initialise Sentry before the first render so errors during mount
// are captured. No-op when VITE_SENTRY_DSN is unset.
initSentry();

// Q-01 / no-non-null-assertion: replaced `!` with a runtime check that
// provides a useful error message if the root element is missing.
const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error(
    'Fatal: #root element not found in index.html. The React app cannot mount.',
  );
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
