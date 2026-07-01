import { useState, useEffect } from "react";
// A-24: targeted import from the schemas module — type-only, no need to
// pull the full engine barrel (which re-exports assessment/nutrition/
// adaptiveTdee formula modules) into the Training tab's bundle graph.
import type { WorkoutPlan, WeeklyScheduleDay, WorkoutLog, Exercise } from "../engine/schemas";
import { toast } from "./Toast";
import {
  CheckCircle2,
  Play,
  ChevronDown,
  ChevronUp,
  Award,
  Circle,
  Sliders,
  Video,
  TrendingUp,
} from "lucide-react";
import { EXERCISE_DATABASE, SPLIT_TEMPLATES, ProgramPreset } from "../data/workoutTemplates";
import RestTimer from "./training-tab/RestTimer";
import ProgramSelectorModal from "./training-tab/ProgramSelectorModal";
import TutorialVideoModal from "./training-tab/TutorialVideoModal";
import SplitBuilderModal from "./training-tab/SplitBuilderModal";

interface TrainingTabProps {
  workoutPlan: WorkoutPlan;
  onLogWorkout: (log: WorkoutLog) => void;
  onUpdateWorkoutPlan?: (plan: WorkoutPlan) => void;
}

export default function TrainingTab({
  workoutPlan,
  onLogWorkout,
  onUpdateWorkoutPlan,
}: TrainingTabProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});

  // Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Modals / Panels State
  const [isProgramSelectorOpen, setIsProgramSelectorOpen] = useState<boolean>(false);
  const [isSplitBuilderOpen, setIsSplitBuilderOpen] = useState<boolean>(false);
  const [activeTutorialExercise, setActiveTutorialExercise] = useState<Exercise | null>(null);

  // Form Tutorial Mock Player State
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [videoProgress, setVideoProgress] = useState<number>(30);
  const [tutorialMuted, setTutorialMuted] = useState<boolean>(false);
  const [completedFormSteps, setCompletedFormSteps] = useState<Record<number, boolean>>({});

  // Builder Temporary State
  const [builderSchedule, setBuilderSchedule] = useState<WeeklyScheduleDay[]>([]);
  const [builderTitle, setBuilderTitle] = useState<string>("");
  const [builderDescription, setBuilderDescription] = useState<string>("");
  const [builderDifficulty, setBuilderDifficulty] = useState<string>("Intermediate");
  const [selectedBuilderDayIndex, setSelectedBuilderDayIndex] = useState<number>(0);
  const [selectedDBCategory, setSelectedDBCategory] = useState<string>("Chest");
  // Lazy initializer: compute the default exercise name for "Chest" on mount.
  // The original useEffect+setState ran on mount and set this; the lazy
  // initializer preserves that behavior without triggering set-state-in-effect.
  const [selectedDBExerciseName, setSelectedDBExerciseName] = useState<string>(() => {
    const filtered = EXERCISE_DATABASE.filter((e) => e.targetMuscle.toLowerCase() === "chest");
    return filtered.length > 0 ? filtered[0].name : "";
  });

  const selectedDay: WeeklyScheduleDay =
    workoutPlan.weeklySchedule[selectedDayIndex] || workoutPlan.weeklySchedule[0];

  // Initialize duration-based programs values if not set
  const planDuration = workoutPlan.durationWeeks || 8;
  const currentWeekNum = workoutPlan.currentWeek || 1;
  const goalType = workoutPlan.goalType || "muscle-gain";

  // Synchronize builder local state when split builder opens.
  // Replaces the previous useEffect+setState (which triggered
  // react-hooks/set-state-in-effect) with the React-recommended
  // "adjust state during render" pattern: track the previous value of
  // isSplitBuilderOpen, and when it changes, reset the derived builder state.
  // React re-renders synchronously with the new state — no cascading render
  // from an effect.
  const [prevIsSplitBuilderOpen, setPrevIsSplitBuilderOpen] = useState(isSplitBuilderOpen);
  if (isSplitBuilderOpen !== prevIsSplitBuilderOpen) {
    setPrevIsSplitBuilderOpen(isSplitBuilderOpen);
    if (isSplitBuilderOpen) {
      setBuilderSchedule(structuredClone(workoutPlan.weeklySchedule));
      setBuilderTitle(workoutPlan.title);
      setBuilderDescription(workoutPlan.description);
      setBuilderDifficulty(workoutPlan.difficulty);
      setSelectedBuilderDayIndex(0);
    }
  }

  // Helper: the first EXERCISE_DATABASE entry whose target muscle matches the
  // given category (used to default the builder's exercise-name dropdown).
  const defaultDBExerciseNameForCategory = (category: string): string => {
    const filtered = EXERCISE_DATABASE.filter(
      (e) =>
        e.targetMuscle.toLowerCase() === category.toLowerCase() ||
        (category === "Core" &&
          ["Core", "Lower Abs", "Obliques"].includes(e.targetMuscle)) ||
        (category === "Back" &&
          ["Lats", "Mid Back", "Upper Back", "Lower Back"].includes(e.targetMuscle)) ||
        (category === "Legs" &&
          ["Quads", "Hamstrings", "Glutes"].includes(e.targetMuscle)),
    );
    return filtered.length > 0 ? filtered[0].name : "";
  };

  // Set default exercise in builder category dropdown. Same "adjust state
  // during render" pattern as above — the previous useEffect+setState was
  // flagged by react-hooks/set-state-in-effect. The useState initializer
  // covers the original effect's mount-time behavior (which set the default
  // exercise name on initial render).
  const [prevSelectedDBCategory, setPrevSelectedDBCategory] = useState(selectedDBCategory);
  if (selectedDBCategory !== prevSelectedDBCategory) {
    setPrevSelectedDBCategory(selectedDBCategory);
    setSelectedDBExerciseName(defaultDBExerciseNameForCategory(selectedDBCategory));
  }

  // Reset completion state when day changes. Same pattern. (Initial state
  // already matches the reset values, so no initializer is needed.)
  const [prevSelectedDayIndex, setPrevSelectedDayIndex] = useState(selectedDayIndex);
  if (selectedDayIndex !== prevSelectedDayIndex) {
    setPrevSelectedDayIndex(selectedDayIndex);
    setCompletedExercises({});
    setIsWorkoutActive(false);
    setTimerActive(false);
    setTimerSeconds(0);
  }

  // Handle rest timer countdown. The auto-stop condition (timerSeconds === 0
  // → setTimerActive(false)) used to live in an else-if branch of this effect,
  // which triggered react-hooks/set-state-in-effect. Removed: the JSX uses
  // `timerSeconds > 0` for display (so it hides correctly when the timer
  // reaches 0), and the interval self-clears via the effect cleanup when
  // timerSeconds transitions to 0 (the early-return guard then prevents a
  // new interval from starting). `timerActive` staying `true` after auto-stop
  // is harmless — it's only read inside this effect, and startRestTimer()
  // resets both states when a new timer is started.
  useEffect(() => {
    if (!timerActive || timerSeconds <= 0) return;
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      setTimerSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  // Loop simulation for mock video tutorial player
  useEffect(() => {
    if (!activeTutorialExercise || !isVideoPlaying) return;
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      setVideoProgress((prev) => (prev >= 100 ? 0 : prev + 4));
    }, 350);
    return () => clearInterval(interval);
  }, [activeTutorialExercise, isVideoPlaying]);

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
      date: new Date().toISOString().split("T")[0],
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

  // Apply visual split templates directly in builder
  const handleBuilderApplyTemplate = (templateIndex: number) => {
    const temp = SPLIT_TEMPLATES[templateIndex];
    setBuilderSchedule(structuredClone(temp.weeklySchedule));
    setBuilderTitle(temp.name);
    setBuilderDescription(temp.description);
    setBuilderDifficulty(temp.difficulty);
    setSelectedBuilderDayIndex(0);
  };

  // Builder Day Operations
  const handleBuilderAddDay = () => {
    const newDay: WeeklyScheduleDay = {
      day: `Day ${builderSchedule.length + 1} - Custom Split`,
      activityType: "Strength",
      durationMinutes: 45,
      exercises: [],
    };
    setBuilderSchedule([...builderSchedule, newDay]);
    setSelectedBuilderDayIndex(builderSchedule.length);
  };

  const handleBuilderRemoveDay = (dayIdx: number) => {
    const next = builderSchedule.filter((_, i) => i !== dayIdx);
    setBuilderSchedule(next);
    setSelectedBuilderDayIndex(Math.max(0, dayIdx - 1));
  };

  const handleBuilderUpdateDayField = (field: keyof WeeklyScheduleDay, val: string | number) => {
    const next = [...builderSchedule];
    next[selectedBuilderDayIndex] = {
      ...next[selectedBuilderDayIndex],
      [field]: val,
    };
    setBuilderSchedule(next);
  };

  const handleBuilderAddExerciseToDay = () => {
    if (!selectedDBExerciseName) return;
    const dbItem = EXERCISE_DATABASE.find((e) => e.name === selectedDBExerciseName);
    if (!dbItem) return;

    const newEx: Exercise = {
      name: dbItem.name,
      sets: dbItem.sets,
      reps: dbItem.reps,
      restSeconds: dbItem.restSeconds,
      instruction: dbItem.instruction,
      targetMuscle: dbItem.targetMuscle,
      videoUrl: dbItem.videoUrl,
      steps: dbItem.steps,
    };

    const next = [...builderSchedule];
    next[selectedBuilderDayIndex].exercises.push(newEx);
    setBuilderSchedule(next);
  };

  const handleBuilderRemoveExerciseFromDay = (exIdx: number) => {
    const next = [...builderSchedule];
    next[selectedBuilderDayIndex].exercises = next[selectedBuilderDayIndex].exercises.filter(
      (_, i) => i !== exIdx,
    );
    setBuilderSchedule(next);
  };

  const handleBuilderUpdateExerciseField = (exIdx: number, field: keyof Exercise, val: string | number) => {
    const next = [...builderSchedule];
    next[selectedBuilderDayIndex].exercises[exIdx] = {
      ...next[selectedBuilderDayIndex].exercises[exIdx],
      [field]: val,
    };
    setBuilderSchedule(next);
  };

  const handleSaveBuilderPlan = () => {
    if (builderSchedule.length === 0) {
      toast.warning("Empty split", "Please add at least one day to your custom training split.");
      return;
    }
    if (onUpdateWorkoutPlan) {
      onUpdateWorkoutPlan({
        ...workoutPlan,
        title: builderTitle || "My Custom Workout Split",
        description:
          builderDescription ||
          "A custom tailored physical splitting schedule designed from scratch.",
        difficulty: builderDifficulty,
        weeklySchedule: builderSchedule,
      });
      setSelectedDayIndex(0);
      setIsSplitBuilderOpen(false);
    }
  };

  const handleOpenTutorial = (ex: Exercise) => {
    setActiveTutorialExercise(ex);
    setVideoProgress(15);
    setIsVideoPlaying(true);
    setCompletedFormSteps({});
  };

  const isAllCompleted =
    selectedDay &&
    selectedDay.exercises.length > 0 &&
    selectedDay.exercises.every((_, idx) => completedExercises[idx]);

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A] overflow-y-auto p-4 md:p-6 pb-24">
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
            onClick={() => setIsProgramSelectorOpen(true)}
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
                  onClick={() => handleSelectWeek(weekIdx)}
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
          onClick={() => setIsSplitBuilderOpen(true)}
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
                key={`day-tab-${idx}-${sched.day.slice(0, 12)}`}
                id={`btn-day-tab-${idx}`}
                onClick={() => setSelectedDayIndex(idx)}
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

      {/* Active Day Exercises Display Card */}
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
        <RestTimer
          isWorkoutActive={isWorkoutActive}
          timerSeconds={timerSeconds}
          isAllCompleted={isAllCompleted}
          onFinish={handleFinishWorkout}
        />

        {/* Exercises list */}
        <div className="space-y-3">
          {selectedDay.exercises.length === 0 ? (
            // F-L7 fix: standardized empty state (icon + heading +
            // description). The original was a single italic line of text.
            // No CTA — the correct action on a rest day is to rest, not to
            // navigate elsewhere.
            <div className="text-center py-10 px-4 flex flex-col items-center">
              <Award className="w-10 h-10 text-[#1A1A1A]/30 mb-2" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80">
                Dedicated Rest & Recovery Day
              </h4>
              <p className="text-[10px] text-[#1A1A1A]/60 mt-1 font-serif italic max-w-xs leading-relaxed">
                Let your muscles repair, hydrate heavily, and recover. Rest days
                are when the training stimulus is converted into growth.
              </p>
            </div>
          ) : (
            selectedDay.exercises.map((ex, idx) => {
              const isCompleted = completedExercises[idx];
              const isExpanded = expandedExerciseIndex === idx;

              return (
                <div
                  key={`ex-${idx}-${ex.name}`}
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
                          aria-label={isCompleted ? "Mark exercise incomplete" : "Mark exercise complete"}
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
                        aria-label="Watch form tutorial"
                        id={`btn-ex-tutorial-${idx}`}
                        onClick={() => handleOpenTutorial(ex)}
                        title="Watch Form Tutorial"
                        className="text-[#1A1A1A]/40 hover:text-[#E63946] transition-all p-1.5 hover:bg-[#F9F8F6]"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                      <button
                        aria-label={isExpanded ? "Collapse exercise" : "Expand exercise"}
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
                              <li key={`step-${sidx}-${st.slice(0, 10)}`} className="text-[#1A1A1A]/60">
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

      {/* Dynamic Coach Guidelines Tips */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/50 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#E63946]" /> Program Specific Coaching Tips
        </h3>
        <div className="space-y-2.5">
          {workoutPlan.tips.map((tip, idx) => (
            <div
              key={`tip-${idx}-${tip.slice(0, 12)}`}
              className="flex gap-2.5 text-xs text-[#1A1A1A]/70 bg-white border border-[#1A1A1A]/10 p-4 rounded-none leading-relaxed font-serif italic shadow-sm"
            >
              <span className="text-[#E63946] font-bold select-none">•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: DURATION-BASED PROGRAM PRESETS SELECTOR — F-C2: uses the
          accessible <Modal> component (role=dialog, aria-modal, Escape-to-close,
          focus trap, restore focus). Now lives in ProgramSelectorModal. */}
      <ProgramSelectorModal
        open={isProgramSelectorOpen}
        onClose={() => setIsProgramSelectorOpen(false)}
        onApplyProgram={handleApplyPresetProgram}
      />

      {/* MODAL 2: INTERACTIVE FORM TUTORIAL PLAYER — F-C2: uses the accessible
          <Modal> component. The dark-themed tutorial body is preserved; the
          Modal renders its own light header with the X close button. Now lives
          in TutorialVideoModal. */}
      <TutorialVideoModal
        activeExercise={activeTutorialExercise}
        onClose={() => setActiveTutorialExercise(null)}
        isVideoPlaying={isVideoPlaying}
        setIsVideoPlaying={setIsVideoPlaying}
        videoProgress={videoProgress}
        tutorialMuted={tutorialMuted}
        setTutorialMuted={setTutorialMuted}
        completedFormSteps={completedFormSteps}
        setCompletedFormSteps={setCompletedFormSteps}
      />

      {/* MODAL 3: GRANULAR WORKOUT SPLIT BUILDER & SCRATCH CREATOR — F-C2:
          uses the accessible <Modal> component. The dark custom header was
          replaced by the Modal's standard header; body + footer are preserved.
          Now lives in SplitBuilderModal. */}
      <SplitBuilderModal
        open={isSplitBuilderOpen}
        onClose={() => setIsSplitBuilderOpen(false)}
        builderSchedule={builderSchedule}
        builderTitle={builderTitle}
        setBuilderTitle={setBuilderTitle}
        builderDescription={builderDescription}
        setBuilderDescription={setBuilderDescription}
        builderDifficulty={builderDifficulty}
        setBuilderDifficulty={setBuilderDifficulty}
        selectedBuilderDayIndex={selectedBuilderDayIndex}
        setSelectedBuilderDayIndex={setSelectedBuilderDayIndex}
        selectedDBCategory={selectedDBCategory}
        setSelectedDBCategory={setSelectedDBCategory}
        selectedDBExerciseName={selectedDBExerciseName}
        setSelectedDBExerciseName={setSelectedDBExerciseName}
        handleBuilderAddDay={handleBuilderAddDay}
        handleBuilderRemoveDay={handleBuilderRemoveDay}
        handleBuilderUpdateDayField={handleBuilderUpdateDayField}
        handleBuilderAddExerciseToDay={handleBuilderAddExerciseToDay}
        handleBuilderRemoveExerciseFromDay={handleBuilderRemoveExerciseFromDay}
        handleBuilderUpdateExerciseField={handleBuilderUpdateExerciseField}
        handleSaveBuilderPlan={handleSaveBuilderPlan}
        handleBuilderApplyTemplate={handleBuilderApplyTemplate}
      />
    </div>
  );
}
