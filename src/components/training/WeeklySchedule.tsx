/**
 * WeeklySchedule
 *
 * Renders the top-of-tab weekly schedule display for the TrainingTab:
 *  - Duration-Based Plan Header & Weekly Timeline Progress (cycle tracker)
 *  - Routine Splits Selector header (with "Customize Split / From Scratch" trigger)
 *  - Weekly Schedule Splits horizontal day buttons
 *  - Dynamic Coach Guidelines Tips list (program-specific coaching tips)
 *
 * Pure presentational component. All state and handlers are passed in via props
 * from the parent TrainingTab.
 */

import { TrendingUp, Sliders, Award } from "lucide-react";
import type { WorkoutPlan } from "../../engine";

interface WeeklyScheduleProps {
  /** The active workout plan (provides title, schedule, tips, duration, etc.). */
  workoutPlan: WorkoutPlan;
  /** Index of the currently-selected day in `workoutPlan.weeklySchedule`. */
  selectedDayIndex: number;
  /** Select a day tab (sets the active day for the ActiveWorkout panel). */
  onSelectDay: (idx: number) => void;
  /** Switch the duration-based plan to a different week. */
  onSelectWeek: (weekNum: number) => void;
  /** Open the preset-programs selector modal. */
  onOpenPrograms: () => void;
  /** Open the custom split-builder modal. */
  onOpenBuilder: () => void;
}

export default function WeeklySchedule({
  workoutPlan,
  selectedDayIndex,
  onSelectDay,
  onSelectWeek,
  onOpenPrograms,
  onOpenBuilder,
}: WeeklyScheduleProps) {
  // Initialize duration-based programs values if not set
  const planDuration = workoutPlan.durationWeeks || 8;
  const currentWeekNum = workoutPlan.currentWeek || 1;
  const goalType = workoutPlan.goalType || "muscle-gain";

  return (
    <>
      {/* 1. Duration-Based Plan Header & Weekly Timeline Progress */}
      <div className="bg-white border border-[#1A1A1A]/10 p-4 mb-6 rounded-none shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-[#E63946]/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#E63946] flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Structured Program Progress
            </span>
            <h3 className="font-serif italic font-black text-lg tracking-tight text-[#1A1A1A]">
              {workoutPlan.title}
            </h3>
            <p className="text-[11px] text-[#1A1A1A]/60 mt-1 font-serif italic">
              Goal:{" "}
              {goalType === "weight-loss"
                ? "Fat Loss"
                : goalType === "muscle-gain"
                  ? "Hypertrophy"
                  : goalType === "strength"
                    ? "Strength Peak"
                    : "Wellness"}{" "}
              • {planDuration}-Week Plan
            </p>
          </div>
          <button
            id="btn-trigger-preset-selector"
            onClick={onOpenPrograms}
            className="text-[9px] font-bold uppercase tracking-widest border border-[#1A1A1A]/15 bg-[#F9F8F6] hover:bg-[#1A1A1A] hover:text-white transition-all px-2.5 py-1.5 font-mono"
          >
            Programs
          </button>
        </div>

        {/* Weeks timeline tracker */}
        <div className="mt-4 border-t border-[#1A1A1A]/5 pt-3">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[#1A1A1A]/50 tracking-wider mb-2">
            <span>Cycle Timeline</span>
            <span className="text-[#E63946] font-mono text-[9px]">
              Week {currentWeekNum} of {planDuration}
            </span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {Array.from({ length: planDuration }).map((_, i) => {
              const weekIdx = i + 1;
              const isActive = weekIdx === currentWeekNum;
              const isPast = weekIdx < currentWeekNum;

              return (
                <button
                  key={weekIdx}
                  id={`btn-select-week-${weekIdx}`}
                  onClick={() => onSelectWeek(weekIdx)}
                  className={`flex-shrink-0 w-9 h-8 rounded-none border flex flex-col items-center justify-center transition-all ${
                    isActive
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : isPast
                        ? "bg-[#E63946]/5 text-[#E63946] border-[#E63946]/20 font-bold"
                        : "bg-[#F9F8F6] text-[#1A1A1A]/40 border-[#1A1A1A]/5 hover:border-[#1A1A1A]/30"
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-tighter opacity-70">Wk</span>
                  <span className="text-xs font-mono font-bold leading-none">{weekIdx}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Routine Splits Selector & Manual Builder triggers */}
      <div className="mb-6 flex justify-between items-center border-b border-[#1A1A1A]/10 pb-2">
        <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/50 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#1A1A1A]/40" /> Active Splits Schedule
        </h2>
        <button
          id="btn-open-customizer"
          onClick={onOpenBuilder}
          className="text-[9px] font-bold uppercase tracking-wider text-[#E63946] flex items-center gap-1 hover:underline"
        >
          <Sliders className="w-3 h-3" /> Customize Split / From Scratch
        </button>
      </div>

      {/* Weekly Schedule Splits Horizontal Buttons */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {workoutPlan.weeklySchedule.map((sched, idx) => {
            const isRest = sched.activityType.toLowerCase() === "rest";
            const isSelected = selectedDayIndex === idx;

            return (
              <button
                key={idx}
                id={`btn-day-tab-${idx}`}
                onClick={() => onSelectDay(idx)}
                className={`flex-shrink-0 snap-start w-28 p-3 rounded-none border text-left transition-all ${
                  isSelected
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]/75 hover:border-[#1A1A1A]/30"
                }`}
              >
                <div
                  className={`text-[9px] uppercase font-bold tracking-widest ${isSelected ? "text-white/60" : "text-[#1A1A1A]/40"}`}
                >
                  Day {idx + 1}
                </div>
                <div className="text-xs font-bold mt-1 truncate uppercase tracking-tight">
                  {sched.day.split(" - ")[1] || sched.day}
                </div>
                <div
                  className={`text-[10px] mt-1 font-serif italic font-semibold ${isSelected ? "text-white/80" : isRest ? "text-[#E63946]" : "text-[#1A1A1A]/60"}`}
                >
                  {sched.activityType}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Coach Guidelines Tips */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/50 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#E63946]" /> Program Specific Coaching Tips
        </h3>
        <div className="space-y-2.5">
          {workoutPlan.tips.map((tip, idx) => (
            <div
              key={idx}
              className="flex gap-2.5 text-xs text-[#1A1A1A]/70 bg-white border border-[#1A1A1A]/10 p-4 rounded-none leading-relaxed font-serif italic shadow-sm"
            >
              <span className="text-[#E63946] font-bold select-none">•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
