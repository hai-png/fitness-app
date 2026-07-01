/**
 * LegacyHealthLogger — extracted from ProgressTab.tsx (A-04-further
 * decomposition).
 *
 * Renders the bottom "Standard Health Logger" section: the daily water
 * hydration glass (with +250ml / +500ml buttons and a reset) and the body
 * weight trajectory form, followed by the EngineTrendAnalysis widget and
 * DailyIntakeLogger. State, computed values and handlers stay in
 * ProgressTab; this component only owns the layout.
 */
import { Droplet, Scale } from "lucide-react";
import type { DailyWeightLog } from "../../engine";
import EngineTrendAnalysis from "../EngineTrendAnalysis";
import DailyIntakeLogger from "../DailyIntakeLogger";

interface LegacyHealthLoggerProps {
  newWeight: string;
  setNewWeight: (val: string) => void;
  weightLogs: DailyWeightLog[];
  onAddWeightLog: (weight: number) => void;
  onAddWaterLog: (amountMl: number) => void;
  onClearWaterLogs: () => void;
  todayWaterTotal: number;
  waterPercent: number;
  weightDiff: number;
}

export default function LegacyHealthLogger({
  newWeight,
  setNewWeight,
  weightLogs,
  onAddWeightLog,
  onAddWaterLog,
  onClearWaterLogs,
  todayWaterTotal,
  waterPercent,
  weightDiff,
}: LegacyHealthLoggerProps) {
  return (
    <div className="mt-8 border-t border-[#1A1A1A]/10 pt-6 space-y-6">
      <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1A1A1A]/40 mb-3">
        Standard Health Logger
      </h3>

      {/* Legacy Water glass */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-[#1A1A1A]" />
              Daily Liquid Hydration
            </h4>
            <p className="text-[10px] text-[#1A1A1A]/60 mt-0.5 font-serif italic">
              Target: 3.0 Liters • Today: {todayWaterTotal} ml
            </p>
          </div>
          <button
            id="btn-clear-water-legacy"
            onClick={onClearWaterLogs}
            className="text-[9px] font-mono font-bold text-[#1A1A1A]/60 hover:text-[#E63946] transition-all border border-[#1A1A1A]/10 hover:border-[#E63946] px-2.5 py-1 bg-white"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-4 py-1">
          <div className="relative w-12 h-18 border border-[#1A1A1A]/20 bg-[#F9F8F6] overflow-hidden flex flex-col justify-end">
            <div
              style={{ height: `${waterPercent}%` }}
              className="w-full bg-[#E63946] transition-all"
            />
            <div className="absolute inset-0 flex items-center justify-center text-[8.5px] font-mono font-bold text-[#1A1A1A]">
              {waterPercent}%
            </div>
          </div>

          <div className="flex-grow grid grid-cols-2 gap-2">
            <button
              id="btn-add-water-legacy-250"
              onClick={() => onAddWaterLog(250)}
              className="py-1.5 text-center bg-white border border-[#1A1A1A]/10 hover:border-[#1A1A1A] text-[10px] text-[#1A1A1A] font-bold uppercase tracking-wider"
            >
              +250ml Glass
            </button>
            <button
              id="btn-add-water-legacy-500"
              onClick={() => onAddWaterLog(500)}
              className="py-1.5 text-center bg-white border border-[#1A1A1A]/10 hover:border-[#1A1A1A] text-[10px] text-[#1A1A1A] font-bold uppercase tracking-wider"
            >
              +500ml Bottle
            </button>
          </div>
        </div>
      </div>

      {/* Legacy Weight history */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-[#E63946]" />
            Body Weight Trajectory
          </h4>
          <span className="text-[9px] font-mono text-[#E63946] font-bold">
            {weightDiff >= 0 ? "+" : ""}
            {weightDiff.toFixed(1)}kg Over Time
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = parseFloat(newWeight);
            if (!isNaN(val) && val > 0) {
              onAddWeightLog(val);
              setNewWeight("");
            }
          }}
          className="flex gap-2"
        >
          <input
            id="input-weight-log-legacy"
            type="number"
            step="0.1"
            placeholder="Log today's weight (kg)..."
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            required
            className="flex-grow bg-white border border-[#1A1A1A]/15 rounded-none px-2.5 py-1.5 text-xs focus:outline-none"
          />
          <button
            id="btn-submit-weight-legacy"
            type="submit"
            className="bg-[#1A1A1A] hover:bg-[#E63946] text-white font-bold px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono"
          >
            Log Weight
          </button>
        </form>

        {/* Engine Trend Analysis — uses the engine's weeklyRateLbPerWeek + interpretWeightTrend */}
        <EngineTrendAnalysis weightLogs={weightLogs} />

        {/* Daily intake logger — feeds the adaptive TDEE engine */}
        <DailyIntakeLogger />
      </div>
    </div>
  );
}
