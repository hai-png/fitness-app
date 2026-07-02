import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Auto-cleanup RTL between tests
afterEach(() => {
  cleanup();
});

// Reset localStorage between tests so persisted zustand stores don't bleed
beforeEach(() => {
  localStorage.clear();
});

// Polyfill matchMedia (used by some libraries; jsdom doesn't implement it)
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Mock crypto.randomUUID for deterministic test output
if (!crypto.randomUUID) {
  crypto.randomUUID = () => "00000000-0000-4000-8000-000000000000";
}

// Stub window.confirm / window.alert so tests don't actually pop dialogs
// (the codebase uses these in ProfileTab.resetConfirm etc.)
window.confirm = vi.fn(() => true);
window.alert = vi.fn();
