/**
 * ActiveWorkout
 *
 * Renders the "Active Day Exercises Display Card" section of the TrainingTab:
 * day header, "Begin Day N" CTA, Workout Active status bar (with RestTimer
 * child + Finish Log button), and per-exercise cards with set/rep/rest chips,
 * tutorial play button, and an expandable instructions + form-cues panel.
 *
 * Owns the active-workout UI state (workout active flag, per-exercise
 * completion map, expanded exercise index, rest-timer state) and the rest-timer
 * countdown effect. Resets all of this when the selected day changes.
 */

import { useState, useEffect } from "react";
import {
  Play,
  CheckCircle2,
  Circle,
  Video,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { WorkoutLog, WeeklyScheduleDay, Exercise } from "../../engine";
import { toast } from "../Toast";
import RestTimer from "./RestTimer";

interface ActiveWorkoutProps {
  /** The currently-selected schedule day (drives exercise list + duration). */
  selectedDay: WeeklyScheduleDay;
  /** Index of the selected day (used for the "Begin Day N" label and log title). */
  selectedDayIndex: number;
  /** Current program week number (used in the workout log title and toast). */
  currentWeekNum: number;
  /** Callback to log a finished workout. */
  onLogWorkout: (log: WorkoutLog) => void;
  /** Callback to open the exercise tutorial modal for the given exercise. */
  onOpenTutorial: (ex: Exercise) => void;
}

export default function ActiveWorkout({
  selectedDay,
  selectedDayIndex,
  currentWeekNum,
  onLogWorkout,
  onOpenTutorial,
}: ActiveWorkoutProps) {
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number | null>(null);

  // Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Reset completion state when day changes
  useEffect(() => {
    setCompletedExercises({});
    setIsWorkoutActive(false);
    setTimerActive(false);
    setTimerSeconds(0);
  }, [selectedDayIndex]);

  // Handle rest timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerSeconds]);

  const startRestTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerActive(true);
  };

  const toggleExerciseComplete = (idx: number, restTime: number) => {
    setCompletedExercises((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      if (next[idx] && restTime > 0) {
        startRestTimer(restTime);
      }
      return next;
    });
  };

  const handleFinishWorkout = () => {
    const burnRate = selectedDay.activityType === "Strength" ? 7 : 5;
    const caloriesBurned = selectedDay.durationMinutes * burnRate;

    const newLog: WorkoutLog = {
      // Q-07: safe — toISOString().split("T") always yields at least one element.
      date: new Date().toISOString().split("T")[0] as string,
      workoutTitle: `${selectedDay.day} (Week ${currentWeekNum})`,
      durationMinutes: selectedDay.durationMinutes,
      caloriesBurned,
    };

    onLogWorkout(newLog);
    setIsWorkoutActive(false);
    setCompletedExercises({});
    toast.success(
      "Workout complete!",
      `Week ${currentWeekNum}, Day: "${selectedDay.day.split(" - ")[1] || selectedDay.day}" — ${caloriesBurned} kcal burned.`,
    );
  };

  const isAllCompleted =
    selectedDay &&
    selectedDay.exercises.length > 0 &&
    selectedDay.exercises.every((_, idx) => completedExercises[idx]);

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-5 mb-6 shadow-sm">
      <div className="flex justify-between items-start mb-4 gap-2 border-b border-[#1A1A1A]/5 pb-3">
        <div>
          <span className="text-[8px] font-bold uppercase tracking-widest bg-[#1A1A1A] text-white px-2 py-0.5 font-mono">
            {selectedDay.activityType} Split
          </span>
          <h3 className="font-serif italic font-black text-xl text-[#1A1A1A] mt-1.5">
            {selectedDay.day}
          </h3>
          <p className="text-[10px] font-mono text-[#1A1A1A]/50 mt-1">
            Estimated duration: {selectedDay.durationMinutes} min • Rest days are crucial
          </p>
        </div>
        {selectedDay.activityType.toLowerCase() !== "rest" && !isWorkoutActive && (
          <button
            id="btn-begin-workout"
            onClick={() => setIsWorkoutActive(true)}
            className="flex items-center gap-1.5 bg-[#E63946] hover:bg-[#d62828] text-white font-bold uppercase tracking-widest px-3.5 py-2 text-[10px] transition-all shadow-sm"
          >
            <Play className="w-3 h-3 fill-current" />
            Begin Day {selectedDayIndex + 1}
          </button>
        )}
      </div>

      {/* Rest Timer display (when active) */}
      {isWorkoutActive && (
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

          <RestTimer timerSeconds={timerSeconds} />

          <button
            id="btn-log-completion"
            onClick={handleFinishWorkout}
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
      )}

      {/* Exercises list */}
      <div className="space-y-3">
        {selectedDay.exercises.length === 0 ? (
          <div className="text-center py-10 text-[#1A1A1A]/40 text-xs font-serif italic">
            This is a dedicated REST day. Let your muscles repair, hydrate heavily, and recover!
          </div>
        ) : (
          selectedDay.exercises.map((ex, idx) => {
            const isCompleted = completedExercises[idx];
            const isExpanded = expandedExerciseIndex === idx;

            return (
              <div
                key={idx}
                className={`border rounded-none transition-all ${
                  isCompleted
                    ? "bg-[#1A1A1A]/5 border-[#1A1A1A]/5 opacity-60"
                    : "bg-white border-[#1A1A1A]/10"
                }`}
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    {isWorkoutActive ? (
                      <button
                        id={`btn-complete-ex-${idx}`}
                        onClick={() => toggleExerciseComplete(idx, ex.restSeconds)}
                        className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-all"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-[#E63946] fill-[#E63946]/10" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#1A1A1A]/20" />
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[9px] text-[#1A1A1A]/60 font-mono">
                        {idx + 1}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold uppercase tracking-tight text-[#1A1A1A]">
                          {ex.name}
                        </h4>
                        {ex.targetMuscle && (
                          <span className="text-[8px] bg-[#1A1A1A]/5 border border-[#1A1A1A]/15 px-1.5 py-0.5 uppercase tracking-wider font-mono text-[#1A1A1A]/70 font-semibold">
                            {ex.targetMuscle}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-[#1A1A1A]/70 font-mono bg-[#F9F8F6] px-1.5 py-0.5 border border-[#1A1A1A]/5">
                          {ex.sets} Sets
                        </span>
                        <span className="text-[9px] text-[#1A1A1A]/70 font-mono bg-[#F9F8F6] px-1.5 py-0.5 border border-[#1A1A1A]/5">
                          {ex.reps}
                        </span>
                        <span className="text-[9px] text-[#E63946] font-mono bg-[#E63946]/5 px-1.5 py-0.5 border border-[#E63946]/10 font-bold">
                          Rest: {ex.restSeconds}s
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Video Form Tutorial play button */}
                    <button
                      id={`btn-ex-tutorial-${idx}`}
                      onClick={() => onOpenTutorial(ex)}
                      title="Watch Form Tutorial"
                      className="text-[#1A1A1A]/40 hover:text-[#E63946] transition-all p-1.5 hover:bg-[#F9F8F6]"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-expand-exercise-${idx}`}
                      onClick={() => setExpandedExerciseIndex(isExpanded ? null : idx)}
                      className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-all p-1"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded instructions panel */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-[#1A1A1A]/5 text-xs text-[#1A1A1A]/60 leading-relaxed">
                    <div className="bg-[#F9F8F6]/80 p-2.5 border-l-2 border-[#1A1A1A] text-xs font-serif italic mb-2">
                      <strong className="text-[#1A1A1A] font-bold block mb-0.5 font-sans not-italic text-[9px] uppercase tracking-wider">
                        Coach Guidelines:
                      </strong>
                      {ex.instruction}
                    </div>

                    {ex.steps && ex.steps.length > 0 && (
                      <div className="mt-2.5">
                        <strong className="text-[#1A1A1A]/70 text-[9px] uppercase tracking-wider font-sans block mb-1">
                          Form Cues Check:
                        </strong>
                        <ul className="space-y-1 font-sans text-[11px] list-disc list-inside">
                          {ex.steps.map((st, sidx) => (
                            <li key={sidx} className="text-[#1A1A1A]/60">
                              {st}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
