import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level React error boundary.
 *
 * Catches any uncaught render-time error in the subtree and shows a
 * recovery screen instead of white-screening the whole app. Errors are
 * logged to the console for debugging (in production this should be
 * forwarded to a monitoring service like Sentry).
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
    // F-L6 fix: telemetry hook. The structured log line below mirrors the
    // shape a production Sentry/Datadog breadcrumb would emit (error +
    // componentStack). In production this should be replaced with
    // `Sentry.captureException(error, { contexts: { react: { componentStack:
    // errorInfo.componentStack } } })` (or the equivalent for the chosen
    // monitoring service). The console.error is retained in dev so the error
    // is visible in the browser console without a Sentry round-trip.
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleHardReload = (): void => {
    // Force a full page reload as a last-resort recovery
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const error = this.state.error;
    // DEV flag is set by Vite — fall back to false in non-Vite contexts
    const isDev =
      (typeof import.meta !== "undefined" &&
        (import.meta as { env?: { DEV?: boolean } }).env?.DEV) ??
      false;

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
              The app hit an unexpected error. You can try to recover your session without losing
              data, or do a full reload.
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
