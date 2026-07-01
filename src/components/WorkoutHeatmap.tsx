import { useMemo } from "react";
import type { ExerciseLog } from "../data/analyticsEngine";

/**
 * GitHub-contribution-style heatmap of training sessions over the last 365
 * days.
 *
 * Extracted from ProgressTab.tsx (Phase 4.8 component refactor).
 * Self-contained: takes exerciseLogs as a prop and computes the date list,
 * per-date counts, and current/max streaks internally via useMemo.
 *
 * Each cell is one day; color intensity reflects the number of exercises
 * logged that day (0 → grey, 1 → light red, 2 → medium red, 3+ → dark red).
 * The streak calculation allows a 2-day buffer (skipped a day doesn't break
 * the streak, but skipping 3 in a row does).
 */
interface WorkoutHeatmapProps {
  exerciseLogs: ExerciseLog[];
}

export function WorkoutHeatmap({ exerciseLogs }: WorkoutHeatmapProps) {
  // Compute all derived data in a single useMemo pass.
  const { dates, workoutCountsByDate, currentStreak, maxStreak } = useMemo(() => {
    const today = new Date();
    const dates: string[] = [];
    for (let i = 365; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const workoutCountsByDate: Record<string, number> = {};
    exerciseLogs.forEach((l) => {
      workoutCountsByDate[l.date] = (workoutCountsByDate[l.date] || 0) + 1;
    });

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < 365; i++) {
      const checkDateStr = new Date(today);
      checkDateStr.setDate(today.getDate() - i);
      const formatted = checkDateStr.toISOString().split("T")[0];

      if (workoutCountsByDate[formatted]) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
        if (i <= tempStreak) currentStreak = tempStreak;
      } else {
        // Allow a 2-day buffer for streak continuation
        const b1 = new Date(checkDateStr);
        b1.setDate(checkDateStr.getDate() - 1);
        const b2 = new Date(checkDateStr);
        b2.setDate(checkDateStr.getDate() - 2);

        if (
          !workoutCountsByDate[b1.toISOString().split("T")[0]] &&
          !workoutCountsByDate[b2.toISOString().split("T")[0]]
        ) {
          tempStreak = 0;
        }
      }
    }

    return { dates, workoutCountsByDate, currentStreak, maxStreak };
  }, [exerciseLogs]);

  return (
    <div
      className="border border-[#1A1A1A]/10 p-3 bg-white"
      aria-hidden="true"
    >
      <div className="flex justify-between items-center text-[8.5px] font-mono text-[#1A1A1A]/40 uppercase mb-2">
        <span>Muscular Output Density Map</span>
        <span>
          {dates[0]} to {dates[dates.length - 1]}
        </span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
        <div className="grid grid-flow-col grid-rows-7 gap-[2px]">
          {dates.map((date) => {
            const count = workoutCountsByDate[date] || 0;
            let colorClass = "bg-[#1A1A1A]/5";
            if (count === 1) colorClass = "bg-[#E63946]/20";
            else if (count === 2) colorClass = "bg-[#E63946]/45";
            else if (count >= 3) colorClass = "bg-[#E63946]/85";

            return (
              <div
                key={date}
                className={`w-[7px] h-[7px] ${colorClass} transition-colors cursor-pointer`}
                title={`${date}: ${count} exercises logged`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center text-[9px] font-mono mt-3 text-[#1A1A1A]/50 border-t border-[#1A1A1A]/5 pt-2">
        <div className="flex gap-3">
          <span>
            Active Streak: <strong>{currentStreak} Days</strong>
          </span>
          <span>
            Max Consistency: <strong>{maxStreak} Days</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px]">Less</span>
          <div className="w-1.5 h-1.5 bg-[#1A1A1A]/5" />
          <div className="w-1.5 h-1.5 bg-[#E63946]/20" />
          <div className="w-1.5 h-1.5 bg-[#E63946]/45" />
          <div className="w-1.5 h-1.5 bg-[#E63946]/85" />
          <span className="text-[8px]">More</span>
        </div>
      </div>
    </div>
  );
}
