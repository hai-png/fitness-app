import { Timer } from "lucide-react";

/**
 * RestTimer — the rest-timer display bar that renders above the exercise list
 * when a workout is active. Shows the "Workout Active" pulse indicator, the
 * live rest-countdown badge (only when `timerSeconds > 0`), and the "Finish
 * Log" button (disabled until every exercise in the day is checked off).
 *
 * Extracted verbatim from TrainingTab.tsx (lines 488–520) during A-05
 * god-component decomposition. No JSX, CSS classes, ids, or business logic
 * were changed; only the surrounding `{isWorkoutActive && (...)}` conditional
 * was internalised as an early-return guard.
 */
interface RestTimerProps {
  isWorkoutActive: boolean;
  timerSeconds: number;
  isAllCompleted: boolean;
  onFinish: () => void;
}

export default function RestTimer({
  isWorkoutActive,
  timerSeconds,
  isAllCompleted,
  onFinish,
}: RestTimerProps) {
  if (!isWorkoutActive) return null;

  return (
    <div className="bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 p-3 mb-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E63946]"></span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E63946]">
          Workout Active
        </span>
      </div>

      {timerSeconds > 0 && (
        <div className="flex items-center gap-1.5 text-xs bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 px-2.5 py-1 font-mono">
          <Timer className="w-3.5 h-3.5 animate-pulse" />
          <span>Rest Countdown: {timerSeconds}s</span>
        </div>
      )}

      <button
        id="btn-log-completion"
        onClick={onFinish}
        disabled={!isAllCompleted}
        className={`text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 transition-all ${
          isAllCompleted
            ? "bg-[#1A1A1A] text-white hover:bg-[#E63946] shadow-sm"
            : "bg-[#1A1A1A]/5 text-[#1A1A1A]/30 cursor-not-allowed"
        }`}
      >
        Finish Log
      </button>
    </div>
  );
}
