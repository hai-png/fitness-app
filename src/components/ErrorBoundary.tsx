import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Optional label shown in the recovery UI (e.g. "Training tab"). When
   * omitted, the boundary renders the full-screen recovery layout used at
   * the top level. When provided, the boundary renders a compact in-tab
   * recovery card so a single tab failure does not block the rest of the app.
   */
  label?: string;
  /**
   * When `resetKey` changes, the boundary clears its error state and
   * re-renders the children. Useful for resetting a per-tab boundary when
   * the user navigates away from the broken tab and back.
   */
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary.
 *
 * Used in two configurations:
 *   1. **Top-level** (no `label`): wraps the entire app in `main.tsx` and
 *      shows a full-screen recovery UI on uncaught render errors.
 *   2. **Per-tab** (with `label`): wraps each lazy-loaded tab in `App.tsx`
 *      so a crash in one tab (e.g. an engine error in ProgressTab) shows a
 *      compact in-tab recovery card instead of taking down the whole app.
 *
 * Errors are logged to the console. When a Sentry client is initialised
 * (D-05), errors are also forwarded via `Sentry.captureException`.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary] Uncaught render error:", error, errorInfo);
    // Forward to Sentry if it has been initialised in the browser bundle.
    // The client is set up in src/lib/sentry.ts (D-05 scaffold).
    if (typeof window !== "undefined") {
      const w = window as unknown as { Sentry?: { captureException: (e: unknown) => void } };
      w.Sentry?.captureException(error);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Clear the error state when resetKey changes (e.g. tab switch)
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleHardReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const error = this.state.error;
    const isDev =
      (typeof import.meta !== "undefined" &&
        (import.meta as { env?: { DEV?: boolean } }).env?.DEV) ??
      false;
    const label = this.props.label;

    // Per-tab compact recovery UI
    if (label) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center font-sans">
          <div className="w-12 h-12 rounded-full bg-[#E63946]/10 border border-[#E63946]/20 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-[#E63946]" />
          </div>
          <h2 className="text-base font-bold text-[#1A1A1A] mb-1">{label} crashed</h2>
          <p className="text-xs text-[#1A1A1A]/60 mb-4 max-w-xs">
            This tab hit an unexpected error. Other tabs are unaffected. Try
            recovering, or reload the page if the problem persists.
          </p>
          {isDev && error && (
            <details className="w-full max-w-sm mb-4 bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 p-2 text-left">
              <summary className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/70 cursor-pointer">
                Error details (dev)
              </summary>
              <pre className="mt-2 text-[10px] font-mono text-[#E63946] whitespace-pre-wrap break-all">
                {error.name}: {error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white text-[10px] font-bold uppercase tracking-widest rounded-none flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Recover
            </button>
            <button
              onClick={this.handleHardReload}
              className="px-4 py-2 bg-white border border-[#1A1A1A]/15 hover:border-[#1A1A1A] text-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest rounded-none transition-all"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    // Top-level full-screen recovery UI
    return (
      <div className="min-h-screen bg-[#EFECE6] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-[#F9F8F6] border border-[#1A1A1A]/10 rounded-none p-8 shadow-[0_25px_60px_-15px_rgba(26,26,26,0.15)]">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#E63946]/10 border border-[#E63946]/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-[#E63946]" />
            </div>

            <h1 className="text-2xl font-serif font-black italic text-[#1A1A1A] mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[#1A1A1A]/60 font-serif italic leading-relaxed mb-6">
              The app hit an unexpected error. You can try to recover your
              session without losing data, or do a full reload.
            </p>

            {isDev && error && (
              <details className="w-full mb-6 bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 p-3 rounded-none text-left">
                <summary className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/70 cursor-pointer">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 text-[10px] font-mono text-[#E63946] whitespace-pre-wrap break-all">
                  {error.name}: {error.message}
                  {error.stack ? `\n\n${error.stack}` : ""}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white text-xs font-bold uppercase tracking-widest rounded-none flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try to Recover
              </button>
              <button
                onClick={this.handleHardReload}
                className="w-full py-3 bg-white border border-[#1A1A1A]/15 hover:border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold uppercase tracking-widest rounded-none transition-all"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
