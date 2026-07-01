/**
 * DailyIntakeLogger — extracted from ProgressTab.tsx (A-04 decomposition).
 *
 * Feeds the adaptive TDEE engine with daily calorie + macro intake.
 * Required for the adaptive TDEE to converge from prior-heavy
 * (formula-based) to data-driven after ~30 days of paired
 * intake+weight data.
 */
import { useState } from "react";
import { Flame, Check } from "lucide-react";
import { useIntakeStore } from "../store/useIntakeStore";
import { toast } from "./Toast";

export default function DailyIntakeLogger() {
  const intakeLogs = useIntakeStore((s) => s.intakeLogs);
  const addIntakeLog = useIntakeStore((s) => s.addIntakeLog);
  const clearTodayIntakeLog = useIntakeStore((s) => s.clearTodayIntakeLog);
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLog = intakeLogs.find((l) => l.date === todayStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const k = parseFloat(kcal);
    if (Number.isNaN(k) || k <= 0) {
      toast.error("Invalid calories", "Enter a positive number for kcal.");
      return;
    }
    addIntakeLog({
      kcal: k,
      protein_g: parseFloat(protein) || 0,
      carbs_g: parseFloat(carbs) || 0,
      fat_g: parseFloat(fat) || 0,
    });
    setKcal("");
    setProtein("");
    setCarbs("");
    setFat("");
    toast.success("Intake logged", `${k} kcal for today.`);
  };

  return (
    <div className="mt-3 bg-white border border-[#1A1A1A]/10 p-3 rounded-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-[#E63946]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] font-mono">
            Daily Intake Logger
          </span>
        </div>
        {todayLog && (
          <button
            type="button"
            onClick={() => {
              clearTodayIntakeLog();
              toast.info("Today's intake cleared");
            }}
            className="text-[9px] text-[#1A1A1A]/50 hover:text-[#E63946] font-mono uppercase tracking-wider"
          >
            Clear Today
          </button>
        )}
      </div>

      {todayLog ? (
        <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-none mb-2">
          <div className="flex items-center gap-1.5">
            <Check className="w-3 h-3 text-emerald-700" />
            <span className="text-[10px] font-bold text-emerald-700">
              Today: {todayLog.kcal} kcal · P{todayLog.protein_g}g · C{todayLog.carbs_g}g · F{todayLog.fat_g}g
            </span>
          </div>
        </div>
      ) : (
        <p className="text-[9px] text-[#1A1A1A]/50 font-serif italic mb-2">
          No intake logged today. Log your daily totals to feed the adaptive TDEE engine.
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-1.5">
        <input
          type="number"
          step="1"
          placeholder="kcal"
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
          required
          className="engine-input text-center"
          aria-label="Calories"
        />
        <input
          type="number"
          step="0.1"
          placeholder="P (g)"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          className="engine-input text-center"
          aria-label="Protein grams"
        />
        <input
          type="number"
          step="0.1"
          placeholder="C (g)"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          className="engine-input text-center"
          aria-label="Carbs grams"
        />
        <input
          type="number"
          step="0.1"
          placeholder="F (g)"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          className="engine-input text-center"
          aria-label="Fat grams"
        />
        <button
          type="submit"
          className="col-span-4 py-2 bg-[#1A1A1A] hover:bg-[#E63946] text-white text-[10px] font-bold uppercase tracking-wider font-mono transition-all"
        >
          Log Today&apos;s Intake
        </button>
      </form>

      <p className="text-[8px] text-[#1A1A1A]/40 font-serif italic mt-1.5">
        Macros are optional but help with future features. One entry per day — submitting
        overwrites today&apos;s log.
      </p>
    </div>
  );
}
