import { useState } from "react";
import type { WorkoutPlan, WorkoutLog, WeeklyScheduleDay, Exercise } from "../engine";
import type { ProgramPreset } from "../data/workoutTemplates";
import WeeklySchedule from "./training/WeeklySchedule";
import ActiveWorkout from "./training/ActiveWorkout";
import PresetPrograms from "./training/PresetPrograms";
import ExerciseTutorial from "./training/ExerciseTutorial";
import SplitBuilder from "./training/SplitBuilder";

interface TrainingTabProps {
  workoutPlan: WorkoutPlan;
  onLogWorkout: (log: WorkoutLog) => void;
  onUpdateWorkoutPlan?: (plan: WorkoutPlan) => void;
}

/**
 * TrainingTab
 *
 * Top-level coordinator for the Training tab. Owns the cross-component UI
 * state (selected day, which modal is open, which tutorial is active) and the
 * plan-level handlers (switch program week, apply preset program, apply custom
 * split, open tutorial). All heavy rendering and per-feature state has been
 * extracted into focused sub-components under `./training/`:
 *
 *   - WeeklySchedule      : plan header, weekly timeline, day tabs, coach tips
 *   - ActiveWorkout       : active day card + set-by-set tracking + rest timer
 *   - RestTimer           : rest countdown chip (rendered by ActiveWorkout)
 *   - ExerciseTutorial    : mock form-tutorial video player modal
 *   - PresetPrograms      : duration-based preset program selector modal
 *   - SplitBuilder        : granular custom split builder modal
 */
export default function TrainingTab({
  workoutPlan,
  onLogWorkout,
  onUpdateWorkoutPlan,
}: TrainingTabProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isProgramSelectorOpen, setIsProgramSelectorOpen] = useState<boolean>(false);
  const [isSplitBuilderOpen, setIsSplitBuilderOpen] = useState<boolean>(false);
  const [activeTutorialExercise, setActiveTutorialExercise] = useState<Exercise | null>(null);

  const selectedDay: WeeklyScheduleDay =
    // Q-07: safe — weeklySchedule is non-empty (always populated by planGenerator).
    workoutPlan.weeklySchedule[selectedDayIndex] ?? (workoutPlan.weeklySchedule[0] as WeeklyScheduleDay);

  const currentWeekNum = workoutPlan.currentWeek || 1;

  // Switch weeks in the duration-based plan
  const handleSelectWeek = (weekNum: number) => {
    if (onUpdateWorkoutPlan) {
      onUpdateWorkoutPlan({
        ...workoutPlan,
        currentWeek: weekNum,
      });
    }
  };

  // Change structured plan preset
  const handleApplyPresetProgram = (preset: ProgramPreset) => {
    if (onUpdateWorkoutPlan) {
      onUpdateWorkoutPlan({
        title: preset.name,
        description: preset.description,
        difficulty: preset.splitTemplate.difficulty,
        weeklySchedule: preset.splitTemplate.weeklySchedule,
        tips: preset.tips,
        durationWeeks: preset.durationWeeks,
        currentWeek: 1,
        goalType: preset.goal,
      });
      setSelectedDayIndex(0);
      setIsProgramSelectorOpen(false);
    }
  };

  // Apply the builder's custom split plan back to the workout plan
  const handleApplyBuilderPlan = (plan: WorkoutPlan) => {
    if (onUpdateWorkoutPlan) {
      onUpdateWorkoutPlan(plan);
      setSelectedDayIndex(0);
      setIsSplitBuilderOpen(false);
    }
  };

  const handleOpenTutorial = (ex: Exercise) => {
    setActiveTutorialExercise(ex);
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A] overflow-y-auto p-4 md:p-6 pb-24">
      <WeeklySchedule
        workoutPlan={workoutPlan}
        selectedDayIndex={selectedDayIndex}
        onSelectDay={setSelectedDayIndex}
        onSelectWeek={handleSelectWeek}
        onOpenPrograms={() => setIsProgramSelectorOpen(true)}
        onOpenBuilder={() => setIsSplitBuilderOpen(true)}
      />

      <ActiveWorkout
        selectedDay={selectedDay}
        selectedDayIndex={selectedDayIndex}
        currentWeekNum={currentWeekNum}
        onLogWorkout={onLogWorkout}
        onOpenTutorial={handleOpenTutorial}
      />

      {isProgramSelectorOpen && (
        <PresetPrograms
          onClose={() => setIsProgramSelectorOpen(false)}
          onApplyProgram={handleApplyPresetProgram}
        />
      )}

      {activeTutorialExercise && (
        <ExerciseTutorial
          exercise={activeTutorialExercise}
          onClose={() => setActiveTutorialExercise(null)}
        />
      )}

      {isSplitBuilderOpen && (
        <SplitBuilder
          workoutPlan={workoutPlan}
          onClose={() => setIsSplitBuilderOpen(false)}
          onApplyPlan={handleApplyBuilderPlan}
        />
      )}
    </div>
  );
}
