import { useState, useEffect } from "react";
import { WorkoutPlan, WeeklyScheduleDay, WorkoutLog } from "../types";
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
  Volume2
} from "lucide-react";

interface TrainingTabProps {
  workoutPlan: WorkoutPlan;
  onLogWorkout: (log: WorkoutLog) => void;
}

export default function TrainingTab({ workoutPlan, onLogWorkout }: TrainingTabProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});
  
  // Timer for rest intervals
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const selectedDay: WeeklyScheduleDay = workoutPlan.weeklySchedule[selectedDayIndex] || workoutPlan.weeklySchedule[0];

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

  const startRestTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerActive(true);
  };

  const toggleExerciseComplete = (idx: number, restTime: number) => {
    setCompletedExercises((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      // Start a rest timer if completed and not already tracking
      if (next[idx] && restTime > 0) {
        startRestTimer(restTime);
      }
      return next;
    });
  };

  const handleFinishWorkout = () => {
    // Calculate simulated calories burned based on exercises and duration
    const burnRate = selectedDay.activityType === "Strength" ? 7 : 5;
    const caloriesBurned = selectedDay.durationMinutes * burnRate;

    const newLog: WorkoutLog = {
      date: new Date().toISOString().split("T")[0],
      workoutTitle: selectedDay.day,
      durationMinutes: selectedDay.durationMinutes,
      caloriesBurned
    };

    onLogWorkout(newLog);
    setIsWorkoutActive(false);
    setCompletedExercises({});
    alert(`🎉 Magnificent work! You completed "${selectedDay.day}"! Logged ${caloriesBurned} kcal burned.`);
  };

  const isAllCompleted = selectedDay.exercises.length > 0 && 
    selectedDay.exercises.every((_, idx) => completedExercises[idx]);

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A] overflow-y-auto p-4 md:p-6 pb-24">
      {/* Header Info */}
      <div className="mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E63946] underline underline-offset-4 block mb-2">
          02 — Training Split
        </span>
        <h1 className="text-3xl font-serif font-black italic mt-3 mb-2 tracking-tight text-[#1A1A1A]">
          {workoutPlan.title}
        </h1>
        <p className="text-[#1A1A1A]/60 text-xs font-serif italic leading-relaxed">
          {workoutPlan.description}
        </p>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-[11px] text-[#1A1A1A]/70 font-mono bg-white border border-[#1A1A1A]/10 px-3 py-1.5">
            <Flame className="w-4 h-4 text-[#E63946]" />
            <span className="font-bold text-[#1A1A1A]">{workoutPlan.difficulty}</span> Level
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#1A1A1A]/70 font-mono bg-white border border-[#1A1A1A]/10 px-3 py-1.5">
            <Calendar className="w-4 h-4 text-[#1A1A1A]" />
            <span className="font-bold text-[#1A1A1A]">{workoutPlan.weeklySchedule.length}</span> Splits
          </div>
        </div>
      </div>

      {/* Weekly Schedule Days list */}
      <div className="mb-6">
        <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/50 mb-3 flex items-center gap-1.5 border-b border-[#1A1A1A]/10 pb-1">
          <Clock className="w-4 h-4 text-[#1A1A1A]/40" /> Select Training Split Day
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {workoutPlan.weeklySchedule.map((sched, idx) => {
            const isRest = sched.activityType.toLowerCase() === "rest";
            const isSelected = selectedDayIndex === idx;

            return (
              <button
                key={idx}
                id={`btn-split-day-${idx}`}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-shrink-0 snap-start w-28 p-3 rounded-none border text-left transition-all ${
                  isSelected
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]/75 hover:border-[#1A1A1A]/30"
                }`}
              >
                <div className={`text-[9px] uppercase font-bold tracking-widest ${isSelected ? "text-white/60" : "text-[#1A1A1A]/40"}`}>
                  Day {idx + 1}
                </div>
                <div className="text-xs font-bold mt-1 truncate uppercase tracking-tight">
                  {sched.day.split(" - ")[1] || sched.day}
                </div>
                <div className={`text-[10px] mt-1 font-serif italic font-semibold ${isSelected ? "text-white/80" : isRest ? "text-[#E63946]" : "text-[#1A1A1A]/60"}`}>
                  {sched.activityType}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Overview */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-5 mb-6">
        <div className="flex justify-between items-start mb-3 gap-2">
          <div>
            <h3 className="font-serif italic font-black text-xl text-[#1A1A1A]">
              {selectedDay.day}
            </h3>
            <p className="text-xs font-mono text-[#1A1A1A]/50 mt-1">
              Target Split: {selectedDay.activityType} • Duration: {selectedDay.durationMinutes} min
            </p>
          </div>
          {selectedDay.activityType.toLowerCase() !== "rest" && !isWorkoutActive && (
            <button
              id="btn-start-workout"
              onClick={() => setIsWorkoutActive(true)}
              className="flex items-center gap-1.5 bg-[#1A1A1A] hover:opacity-90 text-white font-bold uppercase tracking-widest px-4 py-2 text-xs transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Begin Routine
            </button>
          )}
        </div>

        {/* Workout Session Stats (when active) */}
        {isWorkoutActive && (
          <div className="bg-[#F9F8F6] border border-[#1A1A1A]/10 rounded-none p-4 mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E63946]"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#E63946]">Routine Active</span>
            </div>
            
            {/* Rest Timer */}
            {timerSeconds > 0 && (
              <div className="flex items-center gap-1.5 text-xs bg-[#E63946]/5 text-[#E63946] border border-[#E63946]/10 px-2.5 py-1 rounded-none font-mono">
                <Timer className="w-3.5 h-3.5 animate-pulse" />
                <span>Rest: {timerSeconds}s</span>
              </div>
            )}

            <button
              id="btn-finish-workout"
              onClick={handleFinishWorkout}
              disabled={!isAllCompleted}
              className={`text-xs font-bold uppercase tracking-widest px-4 py-2 transition-all ${
                isAllCompleted 
                  ? "bg-[#E63946] hover:bg-[#d62828] text-white shadow-sm" 
                  : "bg-[#1A1A1A]/5 text-[#1A1A1A]/30 cursor-not-allowed"
              }`}
            >
              Finish Log
            </button>
          </div>
        )}

        {/* Exercise List */}
        <div className="space-y-3 mt-4">
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
                          id={`btn-toggle-ex-${idx}`}
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
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[10px] text-[#1A1A1A]/60 font-mono">
                          {idx + 1}
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-tight text-[#1A1A1A]">
                          {ex.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#1A1A1A]/70 font-mono bg-[#F9F8F6] px-2 py-0.5 border border-[#1A1A1A]/5">
                            {ex.sets} Sets
                          </span>
                          <span className="text-[10px] text-[#1A1A1A]/70 font-mono bg-[#F9F8F6] px-2 py-0.5 border border-[#1A1A1A]/5">
                            {ex.reps}
                          </span>
                          <span className="text-[10px] text-[#E63946] font-mono bg-[#E63946]/5 px-2 py-0.5 border border-[#E63946]/10">
                            Rest: {ex.restSeconds}s
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      id={`btn-expand-ex-${idx}`}
                      onClick={() => setExpandedExerciseIndex(isExpanded ? null : idx)}
                      className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-all p-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expanded Instructions */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-[#1A1A1A]/5 text-xs text-[#1A1A1A]/60 leading-relaxed">
                      <div className="bg-[#F9F8F6]/80 p-2 border-l-2 border-[#1A1A1A] text-xs font-serif italic">
                        <strong className="text-[#1A1A1A] font-bold block mb-0.5 font-sans not-italic text-[10px] uppercase tracking-wider">Coach Instruction:</strong>
                        {ex.instruction}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Coach Guidelines Tips */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/50 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#E63946]" /> Dynamic Training Tips
        </h3>
        <div className="space-y-2.5">
          {workoutPlan.tips.map((tip, idx) => (
            <div key={idx} className="flex gap-2.5 text-xs text-[#1A1A1A]/70 bg-white border border-[#1A1A1A]/10 p-4 rounded-none leading-relaxed font-serif italic">
              <span className="text-[#E63946] font-bold select-none">•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
