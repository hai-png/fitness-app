import { useState } from "react";
import { Zap } from "lucide-react";
import { calculateEpley1RM } from "../data/analyticsEngine";
import { toast } from "./Toast";

/**
 * Epley One-Rep Max Estimator widget.
 *
 * Extracted from ProgressTab.tsx (Phase 4.8 component refactor).
 * Self-contained: holds its own weight/reps state, calls the analytics
 * engine's calculateEpley1RM, and surfaces the result via a toast.
 *
 * Previously this widget used uncontrolled inputs + document.getElementById
 * to read values, which was an anti-React pattern and broke if the element
 * was unmounted. Now uses controlled inputs.
 */
export function OneRMEstimator() {
  const [estWeight, setEstWeight] = useState<string>("80");
  const [estReps, setEstReps] = useState<string>("5");

  const handleEstimate = () => {
    const w = parseFloat(estWeight || "0");
    const r = parseInt(estReps || "0", 10);
    if (!w || !r) {
      toast.warning("Invalid input", "Enter a valid weight and rep count.");
      return;
    }
    const result = calculateEpley1RM(w, r);
    toast.info("Estimated 1RM", `Epley formula: ${Math.round(result)} kg (at ${w}kg × ${r} reps).`);
  };

  return (
    <div className="bg-white border border-[#1A1A1A]/10 p-4 shadow-sm">
      <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-1">
        <Zap className="w-4 h-4 text-[#E63946]" />
        Epley One-Rep Max Estimator
      </h3>
      <p className="text-[10px] text-[#1A1A1A]/60 mb-3 font-serif italic leading-relaxed">
        Quickly estimate absolute peak strength capacity based on muscular failure limits.
      </p>

      <div className="grid grid-cols-3 gap-2 items-end">
        <div>
          <label
            htmlFor="1rm-weight"
            className="block text-[8px] font-bold uppercase text-[#1A1A1A]/50 mb-1"
          >
            Weight (kg)
          </label>
          <input
            type="number"
            id="1rm-weight"
            value={estWeight}
            onChange={(e) => setEstWeight(e.target.value)}
            className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/10 p-1.5 text-xs focus:outline-none focus:border-[#E63946]"
          />
        </div>
        <div>
          <label
            htmlFor="1rm-reps"
            className="block text-[8px] font-bold uppercase text-[#1A1A1A]/50 mb-1"
          >
            Reps
          </label>
          <input
            type="number"
            id="1rm-reps"
            value={estReps}
            onChange={(e) => setEstReps(e.target.value)}
            className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/10 p-1.5 text-xs focus:outline-none focus:border-[#E63946]"
          />
        </div>
        <button
          id="btn-calculate-1rm-widget"
          onClick={handleEstimate}
          className="bg-[#1A1A1A] hover:bg-[#E63946] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 px-2 font-mono transition-colors text-center"
        >
          Estimate 1RM
        </button>
      </div>
    </div>
  );
}
