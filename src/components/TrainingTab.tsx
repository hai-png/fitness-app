import { useState, useEffect } from "react";
import { WorkoutPlan, WeeklyScheduleDay, WorkoutLog, Exercise } from "../engine";
import { toast } from "./Toast";
import {
  Calendar,
  Flame,
  Clock,
  CheckCircle2,
  Play,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Circle,
  Timer,
  VolumeX,
  Volume2,
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  Video,
  X,
  TrendingUp,
  Check,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import {
  EXERCISE_DATABASE,
  SPLIT_TEMPLATES,
  DURATION_PROGRAMS,
  ExerciseDBItem,
  ProgramPreset,
  type SplitTemplate,
} from "../data/workoutTemplates";

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
  const [selectedDBExerciseName, setSelectedDBExerciseName] = useState<string>("");

  const selectedDay: WeeklyScheduleDay =
    // Q-07: safe — weeklySchedule is non-empty (always populated by planGenerator).
    workoutPlan.weeklySchedule[selectedDayIndex] ?? (workoutPlan.weeklySchedule[0] as WeeklyScheduleDay);

  // Initialize duration-based programs values if not set
  const planDuration = workoutPlan.durationWeeks || 8;
  const currentWeekNum = workoutPlan.currentWeek || 1;
  const goalType = workoutPlan.goalType || "muscle-gain";

  // Synchronize builder local state when split builder opens
  useEffect(() => {
    if (isSplitBuilderOpen) {
      setBuilderSchedule(structuredClone(workoutPlan.weeklySchedule));
      setBuilderTitle(workoutPlan.title);
      setBuilderDescription(workoutPlan.description);
      setBuilderDifficulty(workoutPlan.difficulty);
      setSelectedBuilderDayIndex(0);
    }
  }, [isSplitBuilderOpen, workoutPlan]);

  // Set default exercise in builder category dropdown
  useEffect(() => {
    const filtered = EXERCISE_DATABASE.filter(
      (e) =>
        e.targetMuscle.toLowerCase() === selectedDBCategory.toLowerCase() ||
        (selectedDBCategory === "Core" &&
          ["Core", "Lower Abs", "Obliques"].includes(e.targetMuscle)) ||
        (selectedDBCategory === "Back" &&
          ["Lats", "Mid Back", "Upper Back", "Lower Back"].includes(e.targetMuscle)) ||
        (selectedDBCategory === "Legs" &&
          ["Quads", "Hamstrings", "Glutes"].includes(e.targetMuscle)),
    );
    if (filtered.length > 0) {
      // Q-07: safe — guarded by filtered.length > 0.
      setSelectedDBExerciseName(filtered[0]?.name ?? "");
    } else {
      setSelectedDBExerciseName("");
    }
  }, [selectedDBCategory]);

  // Reset completion state when day changes
  useEffect(() => {
    setCompletedExercises({});
    setIsWorkoutActive(false);
    setTimerActive(false);
    setTimerSeconds(0);
  }, [selectedDayIndex]);

  // Handle rest timer countdown
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  // Loop simulation for mock video tutorial player
  useEffect(() => {
    let interval: any = null;
    if (activeTutorialExercise && isVideoPlaying) {
      interval = setInterval(() => {
        setVideoProgress((prev) => (prev >= 100 ? 0 : prev + 4));
      }, 350);
    }
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
    // Q-07: safe — SPLIT_TEMPLATES has 4 entries; templateIndex is bounded by the UI dropdown.
    const temp = SPLIT_TEMPLATES[templateIndex] as SplitTemplate | undefined;
    if (!temp) return;
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

  const handleBuilderUpdateDayField = (field: keyof WeeklyScheduleDay, val: any) => {
    const next = [...builderSchedule];
    // Q-07: safe — selectedBuilderDayIndex is bounded by builderSchedule.length.
    const target = next[selectedBuilderDayIndex];
    if (!target) return;
    next[selectedBuilderDayIndex] = {
      ...target,
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
    // Q-07: safe — selectedBuilderDayIndex is bounded by builderSchedule.length.
    const target = next[selectedBuilderDayIndex];
    if (!target) return;
    target.exercises.push(newEx);
    setBuilderSchedule(next);
  };

  const handleBuilderRemoveExerciseFromDay = (exIdx: number) => {
    const next = [...builderSchedule];
    // Q-07: safe — selectedBuilderDayIndex is bounded by builderSchedule.length.
    const target = next[selectedBuilderDayIndex];
    if (!target) return;
    target.exercises = target.exercises.filter(
      (_, i) => i !== exIdx,
    );
    setBuilderSchedule(next);
  };

  const handleBuilderUpdateExerciseField = (exIdx: number, field: keyof Exercise, val: any) => {
    const next = [...builderSchedule];
    // Q-07: safe — selectedBuilderDayIndex is bounded by builderSchedule.length.
    const target = next[selectedBuilderDayIndex];
    if (!target) return;
    const exTarget = target.exercises[exIdx];
    if (!exTarget) return;
    target.exercises[exIdx] = {
      ...exTarget,
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

  // Categories list for exercise DB lookup
  const categories = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];

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
                key={idx}
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

            {timerSeconds > 0 && (
              <div className="flex items-center gap-1.5 text-xs bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 px-2.5 py-1 font-mono">
                <Timer className="w-3.5 h-3.5 animate-pulse" />
                <span>Rest Countdown: {timerSeconds}s</span>
              </div>
            )}

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
                        onClick={() => handleOpenTutorial(ex)}
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

      {/* MODAL 1: DURATION-BASED PROGRAM PRESETS SELECTOR */}
      {isProgramSelectorOpen && (
        <div className="fixed inset-0 bg-[#1A1A1A]/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F9F8F6] border border-[#1A1A1A]/20 w-full max-w-md max-h-[85vh] flex flex-col rounded-none overflow-hidden shadow-2xl">
            <div className="bg-[#1A1A1A] text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E63946]" />
                <h3 className="font-serif italic font-bold text-base uppercase tracking-wider">
                  Select Goal-Specific Plan
                </h3>
              </div>
              <button
                id="btn-close-presets"
                onClick={() => setIsProgramSelectorOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-grow">
              <p className="text-xs text-[#1A1A1A]/60 font-serif italic mb-2 leading-relaxed">
                Choose a structured, duration-based athletic program designed with target sets, reps
                and progressions mapped for your direct goal:
              </p>

              {DURATION_PROGRAMS.map((prog) => (
                <div
                  key={prog.id}
                  role="button"
                  tabIndex={0}
                  className="bg-white border border-[#1A1A1A]/10 p-4 relative overflow-hidden group hover:border-[#1A1A1A]/30 transition-all cursor-pointer"
                  onClick={() => handleApplyPresetProgram(prog)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleApplyPresetProgram(prog);
                    }
                  }}
                >
                  <div className="absolute right-3 top-3 bg-[#E63946] text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest font-mono">
                    {prog.durationWeeks} Weeks
                  </div>

                  <h4 className="text-sm font-bold uppercase tracking-tight text-[#1A1A1A] group-hover:text-[#E63946] transition-colors">
                    {prog.name}
                  </h4>
                  <p className="text-[11px] text-[#1A1A1A]/50 uppercase tracking-widest font-mono font-semibold mt-0.5">
                    Goal: {prog.goal.replace("-", " ")}
                  </p>

                  <p className="text-xs mt-2 text-[#1A1A1A]/70 leading-relaxed font-serif italic">
                    {prog.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[#1A1A1A]/5 flex justify-between items-center text-[10px] uppercase font-bold text-[#1A1A1A]/50">
                    <span>Split: {prog.splitTemplate.name}</span>
                    <span className="text-[#E63946] flex items-center gap-1 font-mono">
                      Apply Program →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-[#1A1A1A]/10 flex justify-end">
              <button
                id="btn-close-presets-footer"
                onClick={() => setIsProgramSelectorOpen(false)}
                className="text-xs uppercase font-bold bg-[#1A1A1A]/5 text-[#1A1A1A]/60 border border-[#1A1A1A]/10 px-4 py-2 hover:bg-[#1A1A1A] hover:text-white transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE FORM TUTORIAL PLAYER */}
      {activeTutorialExercise && (
        <div className="fixed inset-0 bg-[#1A1A1A]/65 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] text-white border border-white/10 w-full max-w-sm rounded-none overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
              <div>
                <span className="text-[8px] font-mono font-bold uppercase tracking-[0.25em] text-[#E63946] block mb-0.5">
                  FORM MASTERCLASS VIDEO
                </span>
                <h3 className="font-serif italic font-bold text-base leading-tight tracking-tight">
                  {activeTutorialExercise.name}
                </h3>
              </div>
              <button
                id="btn-close-tutorial"
                onClick={() => setActiveTutorialExercise(null)}
                className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Active Video Screen */}
            <div className="relative aspect-video bg-neutral-900 border-b border-white/5 overflow-hidden flex items-center justify-center group">
              {/* Dynamic Muscle Target Grid background */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Looping animation representing concentric mechanical tension */}
              <div className="relative flex flex-col items-center justify-center p-6 text-center z-10">
                {isVideoPlaying ? (
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-20 h-20 rounded-full border border-dashed border-[#E63946] animate-[spin_20s_linear_infinite]" />
                    <div className="absolute w-14 h-14 rounded-full border border-double border-white/20 animate-pulse" />
                    <Flame className="w-8 h-8 text-[#E63946] animate-pulse" />
                  </div>
                ) : (
                  <Play className="w-10 h-10 text-white/50 fill-current" />
                )}

                <span className="text-[10px] mt-4 font-mono uppercase tracking-[0.15em] text-white/50">
                  {isVideoPlaying ? `Form Simulation Loop: ${videoProgress}%` : "Coach Paused"}
                </span>
                <span className="text-[11px] font-serif italic text-white/80 mt-1 max-w-[200px]">
                  Target Focus: {activeTutorialExercise.targetMuscle || "Muscular Tension"}
                </span>
              </div>

              {/* Video Timeline controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between gap-3 text-white/80 text-[10px] font-mono">
                <button
                  id="btn-play-pause-video"
                  onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                  className="hover:text-[#E63946] transition-colors"
                >
                  {isVideoPlaying ? "PAUSE" : "PLAY"}
                </button>

                <div className="flex-grow h-1.5 bg-white/15 relative overflow-hidden">
                  <div
                    className="h-full bg-[#E63946] transition-all duration-300"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>

                <button
                  id="btn-toggle-mute"
                  onClick={() => setTutorialMuted(!tutorialMuted)}
                  className="hover:text-white"
                >
                  {tutorialMuted ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-[#E63946]" />
                  )}
                </button>
              </div>
            </div>

            {/* Instruction Checklist & Coach Guidelines */}
            <div className="p-4 overflow-y-auto space-y-4 flex-grow">
              <div className="bg-white/5 p-3 border-l-2 border-[#E63946]">
                <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">
                  {" "}
                  COACH COMMENT:
                </span>
                <p className="text-xs text-white/80 font-serif italic leading-relaxed">
                  &quot;{activeTutorialExercise.instruction}&quot;
                </p>
              </div>

              {/* Form cues interactive checklist */}
              {activeTutorialExercise.steps && activeTutorialExercise.steps.length > 0 && (
                <div>
                  <h4 className="text-[9px] uppercase tracking-wider font-bold text-white/40 mb-2">
                    Form Cues & Movement Checklist
                  </h4>
                  <div className="space-y-1.5">
                    {activeTutorialExercise.steps.map((step, sidx) => {
                      const checked = completedFormSteps[sidx];
                      return (
                        <button
                          key={sidx}
                          id={`btn-form-step-${sidx}`}
                          onClick={() =>
                            setCompletedFormSteps((prev) => ({ ...prev, [sidx]: !prev[sidx] }))
                          }
                          className="w-full flex items-start gap-2.5 text-left p-2 rounded bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all text-xs"
                        >
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              checked
                                ? "bg-[#E63946] border-[#E63946] text-white"
                                : "border-white/20"
                            }`}
                          >
                            {checked && <Check className="w-3 h-3" />}
                          </span>
                          <span
                            className={checked ? "text-white/40 line-through" : "text-white/80"}
                          >
                            {step}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
              <button
                id="btn-close-tutorial-footer"
                onClick={() => setActiveTutorialExercise(null)}
                className="w-full py-3 bg-[#E63946] hover:bg-[#d62828] text-white text-xs font-bold uppercase tracking-widest transition-all text-center"
              >
                Understood, Got Form!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GRANULAR WORKOUT SPLIT BUILDER & SCRATCH CREATOR */}
      {isSplitBuilderOpen && (
        <div className="fixed inset-0 bg-[#1A1A1A]/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F9F8F6] border border-[#1A1A1A]/20 w-full max-w-lg max-h-[90vh] flex flex-col rounded-none overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-[#1A1A1A] text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#E63946]" />
                <h3 className="font-serif italic font-bold text-base uppercase tracking-wider">
                  Aether Workout Split Builder
                </h3>
              </div>
              <button
                id="btn-close-builder"
                onClick={() => setIsSplitBuilderOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-grow">
              {/* Quick Config templates */}
              <div className="bg-white border border-[#1A1A1A]/10 p-3 mb-2">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#1A1A1A]/50 block mb-2">
                  Load Preset Split Configuration
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SPLIT_TEMPLATES.map((t, idx) => (
                    <button
                      key={idx}
                      id={`btn-load-template-${idx}`}
                      onClick={() => handleBuilderApplyTemplate(idx)}
                      type="button"
                      className="p-2 border border-[#1A1A1A]/10 bg-[#F9F8F6] hover:bg-[#1A1A1A] hover:text-white transition-all text-left rounded-none text-xs"
                    >
                      <strong className="block uppercase tracking-tight text-[10px]">
                        {t.name}
                      </strong>
                      <span className="text-[9px] opacity-70 italic font-serif block mt-0.5 truncate">
                        {t.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Global Metadata Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1">
                    Routine Title
                  </label>
                  <input
                    id="input-builder-title"
                    type="text"
                    value={builderTitle}
                    onChange={(e) => setBuilderTitle(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A]/15 px-3 py-2 text-xs focus:border-[#1A1A1A] focus:outline-none"
                    placeholder="My Tailored Workout Split"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1">
                    Workout Difficulty
                  </label>
                  <select
                    id="select-builder-difficulty"
                    value={builderDifficulty}
                    onChange={(e) => setBuilderDifficulty(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A]/15 px-3 py-2 text-xs focus:border-[#1A1A1A] focus:outline-none"
                  >
                    <option value="Beginner-Friendly">Beginner-Friendly</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1">
                  Split Description
                </label>
                <textarea
                  id="textarea-builder-desc"
                  rows={2}
                  value={builderDescription}
                  onChange={(e) => setBuilderDescription(e.target.value)}
                  className="w-full bg-white border border-[#1A1A1A]/15 px-3 py-1.5 text-xs focus:border-[#1A1A1A] focus:outline-none font-serif italic"
                  placeholder="Tell us what makes this split effective..."
                />
              </div>

              {/* Days Tab Manager */}
              <div className="border-t border-[#1A1A1A]/10 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/60">
                    Customize Specific Split Days
                  </span>
                  <button
                    id="btn-builder-add-day"
                    type="button"
                    onClick={handleBuilderAddDay}
                    className="flex items-center gap-1 text-[10px] font-bold bg-[#1A1A1A] text-white hover:bg-[#E63946] px-2 py-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Day
                  </button>
                </div>

                {/* Day Buttons Tabs */}
                {builderSchedule.length === 0 ? (
                  <div className="text-center py-6 text-[#1A1A1A]/30 text-xs italic font-serif">
                    No training days are scheduled. Click &quot;Add Day&quot; or load a template
                    split above to start from scratch!
                  </div>
                ) : (
                  <>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {builderSchedule.map((day, dIdx) => (
                        <button
                          key={dIdx}
                          id={`btn-builder-day-tab-${dIdx}`}
                          type="button"
                          onClick={() => setSelectedBuilderDayIndex(dIdx)}
                          className={`flex-shrink-0 px-3 py-2 text-xs font-mono font-bold uppercase tracking-tight border ${
                            selectedBuilderDayIndex === dIdx
                              ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                              : "bg-white text-[#1A1A1A]/50 border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20"
                          }`}
                        >
                          Day {dIdx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Active Builder Day Editor */}
                    {builderSchedule[selectedBuilderDayIndex] && (
                      <div className="bg-white border border-[#1A1A1A]/10 p-3 mt-2.5 space-y-3.5">
                        {/* Day fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-end">
                          <div className="md:col-span-2">
                            <label className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1">
                              Day Name
                            </label>
                            <input
                              id={`input-builder-day-name-${selectedBuilderDayIndex}`}
                              type="text"
                              value={builderSchedule[selectedBuilderDayIndex].day}
                              onChange={(e) => handleBuilderUpdateDayField("day", e.target.value)}
                              className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs font-bold focus:border-[#1A1A1A]"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1">
                              Duration (Min)
                            </label>
                            <input
                              id={`input-builder-day-duration-${selectedBuilderDayIndex}`}
                              type="number"
                              value={builderSchedule[selectedBuilderDayIndex].durationMinutes}
                              onChange={(e) =>
                                handleBuilderUpdateDayField(
                                  "durationMinutes",
                                  parseInt(e.target.value) || 45,
                                )
                              }
                              className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs focus:border-[#1A1A1A]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1">
                              Split Focus
                            </label>
                            <select
                              id={`select-builder-day-focus-${selectedBuilderDayIndex}`}
                              value={builderSchedule[selectedBuilderDayIndex].activityType}
                              onChange={(e) =>
                                handleBuilderUpdateDayField("activityType", e.target.value)
                              }
                              className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs"
                            >
                              <option value="Strength">Strength / Hypertrophy</option>
                              <option value="Cardio">Metabolic Cardio / HIIT</option>
                              <option value="Rest">Dedicated Rest Recovery</option>
                              <option value="Stretching">Active Stretching / Yoga</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-end">
                            <button
                              id="btn-builder-remove-day"
                              type="button"
                              onClick={() => handleBuilderRemoveDay(selectedBuilderDayIndex)}
                              className="flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-white hover:bg-red-600 px-2.5 py-1.5 border border-red-600/20 transition-all font-mono"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete Day{" "}
                              {selectedBuilderDayIndex + 1}
                            </button>
                          </div>
                        </div>

                        {/* Exercise List Editor */}
                        <div className="border-t border-[#1A1A1A]/5 pt-3">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-[#1A1A1A]/40 block mb-2">
                            Exercises in this split day
                          </span>

                          {builderSchedule[selectedBuilderDayIndex].exercises.length === 0 ? (
                            <div className="text-center py-5 text-[#1A1A1A]/30 text-xs italic font-serif bg-[#F9F8F6]">
                              No exercises loaded. Add from the exercise database below!
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                              {builderSchedule[selectedBuilderDayIndex].exercises.map(
                                (ex, exIdx) => (
                                  <div
                                    key={exIdx}
                                    className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-2 flex flex-col gap-2 relative"
                                  >
                                    {/* Top line Name & Delete */}
                                    <div className="flex justify-between items-center gap-2">
                                      <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-tight">
                                        {exIdx + 1}. {ex.name}
                                      </span>
                                      <button
                                        id={`btn-builder-delete-ex-${exIdx}`}
                                        type="button"
                                        onClick={() => handleBuilderRemoveExerciseFromDay(exIdx)}
                                        className="text-[#1A1A1A]/40 hover:text-red-600 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Inputs sets, reps, rest, instruction */}
                                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                                      <div>
                                        <label className="block text-[8px] text-[#1A1A1A]/40 font-bold uppercase mb-0.5">
                                          Sets
                                        </label>
                                        <input
                                          type="number"
                                          value={ex.sets}
                                          onChange={(e) =>
                                            handleBuilderUpdateExerciseField(
                                              exIdx,
                                              "sets",
                                              parseInt(e.target.value) || 3,
                                            )
                                          }
                                          className="w-full bg-white border border-[#1A1A1A]/10 px-2 py-1"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[8px] text-[#1A1A1A]/40 font-bold uppercase mb-0.5">
                                          Reps
                                        </label>
                                        <input
                                          type="text"
                                          value={ex.reps}
                                          onChange={(e) =>
                                            handleBuilderUpdateExerciseField(
                                              exIdx,
                                              "reps",
                                              e.target.value,
                                            )
                                          }
                                          className="w-full bg-white border border-[#1A1A1A]/10 px-2 py-1 font-mono"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[8px] text-[#1A1A1A]/40 font-bold uppercase mb-0.5">
                                          Rest (Sec)
                                        </label>
                                        <input
                                          type="number"
                                          value={ex.restSeconds}
                                          onChange={(e) =>
                                            handleBuilderUpdateExerciseField(
                                              exIdx,
                                              "restSeconds",
                                              parseInt(e.target.value) || 60,
                                            )
                                          }
                                          className="w-full bg-white border border-[#1A1A1A]/10 px-2 py-1"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[8px] text-[#1A1A1A]/40 font-bold uppercase mb-0.5">
                                        Instruction Notes
                                      </label>
                                      <input
                                        type="text"
                                        value={ex.instruction}
                                        onChange={(e) =>
                                          handleBuilderUpdateExerciseField(
                                            exIdx,
                                            "instruction",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full bg-white border border-[#1A1A1A]/10 px-2 py-1 text-[11px]"
                                      />
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          )}

                          {/* ADD NEW EXERCISE FROM DATABASE SECTION */}
                          <div className="mt-3 bg-[#F9F8F6]/80 border border-[#1A1A1A]/10 p-3">
                            <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1 mb-2">
                              <BookOpen className="w-3.5 h-3.5" /> Exercise Database Search / Filter
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {/* Category Filter */}
                              <div>
                                <label className="block text-[8px] uppercase font-semibold text-[#1A1A1A]/40 mb-0.5">
                                  Filter Muscles
                                </label>
                                <select
                                  id="select-builder-muscle-category"
                                  value={selectedDBCategory}
                                  onChange={(e) => setSelectedDBCategory(e.target.value)}
                                  className="w-full bg-white border border-[#1A1A1A]/15 px-2 py-1 text-xs"
                                >
                                  {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Target Exercise select */}
                              <div>
                                <label className="block text-[8px] uppercase font-semibold text-[#1A1A1A]/40 mb-0.5">
                                  Select Exercise
                                </label>
                                <select
                                  id="select-builder-exercise-name"
                                  value={selectedDBExerciseName}
                                  onChange={(e) => setSelectedDBExerciseName(e.target.value)}
                                  className="w-full bg-white border border-[#1A1A1A]/15 px-2 py-1 text-xs font-bold"
                                >
                                  {EXERCISE_DATABASE.filter(
                                    (e) =>
                                      e.targetMuscle.toLowerCase() ===
                                        selectedDBCategory.toLowerCase() ||
                                      (selectedDBCategory === "Core" &&
                                        ["Core", "Lower Abs", "Obliques"].includes(
                                          e.targetMuscle,
                                        )) ||
                                      (selectedDBCategory === "Back" &&
                                        ["Lats", "Mid Back", "Upper Back", "Lower Back"].includes(
                                          e.targetMuscle,
                                        )) ||
                                      (selectedDBCategory === "Legs" &&
                                        ["Quads", "Hamstrings", "Glutes"].includes(e.targetMuscle)),
                                  ).map((e) => (
                                    <option key={e.name} value={e.name}>
                                      {e.name} ({e.targetMuscle})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <button
                              id="btn-builder-add-ex"
                              type="button"
                              onClick={handleBuilderAddExerciseToDay}
                              disabled={!selectedDBExerciseName}
                              className="w-full mt-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#E63946] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                              Add Selected Exercise to Day {selectedBuilderDayIndex + 1}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-[#1A1A1A]/10 flex justify-between gap-3">
              <button
                id="btn-builder-cancel"
                onClick={() => setIsSplitBuilderOpen(false)}
                className="text-xs uppercase font-bold bg-[#1A1A1A]/5 text-[#1A1A1A]/60 border border-[#1A1A1A]/10 px-5 py-3 hover:bg-[#1A1A1A] hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                id="btn-builder-save"
                onClick={handleSaveBuilderPlan}
                className="text-xs uppercase font-bold bg-[#E63946] hover:bg-[#d62828] text-white px-6 py-3 transition-all font-mono"
              >
                Save New Splitting Routine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
