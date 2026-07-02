/**
 * FallbackPlan
 *
 * Inline error banner rendered inside the Onboarding header when the Gemini
 * plan-generation endpoint fails (or is unconfigured). Shows the error
 * message returned by the failed fetch and offers a "Generate Local
 * Calculated Plan Instead" button that triggers the local planGenerator
 * fallback path.
 *
 * The error string + the fallback-trigger callback are owned by the parent
 * Onboarding component, which also owns the loading/error state and the
 * fetch + fallback logic in `submitQuestionnaire`. This component is purely
 * presentational.
 */

import { ShieldAlert, Sparkles } from "lucide-react";

interface FallbackPlanProps {
  /** The error message returned by the failed Gemini call (or a default hint). */
  error: string;
  /** Invoked when the user clicks "Generate Local Calculated Plan Instead". */
  onUseFallback: () => void;
}

export default function FallbackPlan({ error, onUseFallback }: FallbackPlanProps) {
  return (
    <div className="p-4 mb-6 rounded-none bg-white border border-[#E63946] text-[#1A1A1A]">
      <div className="flex items-start gap-3 mb-3">
        <ShieldAlert className="w-5 h-5 text-[#E63946] flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-serif font-bold text-[#E63946]">Coaching Server Offline</h4>
          <p className="text-xs text-[#1A1A1A]/60 mt-1 font-serif italic">{error}</p>
        </div>
      </div>
      <button
        id="btn-use-fallback"
        onClick={onUseFallback}
        className="w-full py-3 bg-[#E63946] hover:bg-[#d62828] text-white font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Generate Local Calculated Plan Instead
      </button>
    </div>
  );
}
