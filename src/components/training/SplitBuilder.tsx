/**
 * SplitBuilder
 *
 * Renders the "Granular Workout Split Builder & Scratch Creator" modal
 * (Modal 3 in the original TrainingTab). Lets the user load a preset split
 * template (BuilderTemplatePicker), edit global metadata (BuilderMetadataForm),
 * add/remove/select days, edit the active day's fields + exercise list
 * (BuilderDayEditor), and save the resulting split back to the workout plan.
 *
 * Owns all builder-local state. Parent should mount this conditionally
 * (`{isOpen && <SplitBuilder ... />}`) so each open starts with fresh state.
 */

import { useState, useEffect } from "react";
import { Sliders, X, Plus } from "lucide-react";
import type { WorkoutPlan, WeeklyScheduleDay, Exercise } from "../../engine";
import { toast } from "../Toast";
import { EXERCISE_DATABASE, type SplitTemplate } from "../../data/workoutTemplates";
import BuilderTemplatePicker from "./BuilderTemplatePicker";
import BuilderMetadataForm from "./BuilderMetadataForm";
import BuilderDayEditor from "./BuilderDayEditor";

interface SplitBuilderProps {
  /** The current workout plan (read for initial sync; written through onApplyPlan). */
  workoutPlan: WorkoutPlan;
  /** Close the modal without saving. */
  onClose: () => void;
  /** Apply the built plan: parent updates the workout plan, resets the selected
   *  day index, and closes the modal. No-op when the parent has no
   *  `onUpdateWorkoutPlan` (preserves original silently-fail behavior). */
  onApplyPlan: (plan: WorkoutPlan) => void;
}

export default function SplitBuilder({
  workoutPlan,
  onClose,
  onApplyPlan,
}: SplitBuilderProps) {
  const [builderSchedule, setBuilderSchedule] = useState<WeeklyScheduleDay[]>([]);
  const [builderTitle, setBuilderTitle] = useState<string>("");
  const [builderDescription, setBuilderDescription] = useState<string>("");
  const [builderDifficulty, setBuilderDifficulty] = useState<string>("Intermediate");
  const [selectedBuilderDayIndex, setSelectedBuilderDayIndex] = useState<number>(0);
  const [selectedDBCategory, setSelectedDBCategory] = useState<string>("Chest");
  const [selectedDBExerciseName, setSelectedDBExerciseName] = useState<string>("");

  // Synchronize builder local state when split builder opens (and whenever the
  // underlying workoutPlan changes while open).
  useEffect(() => {
    setBuilderSchedule(structuredClone(workoutPlan.weeklySchedule));
    setBuilderTitle(workoutPlan.title);
    setBuilderDescription(workoutPlan.description);
    setBuilderDifficulty(workoutPlan.difficulty);
    setSelectedBuilderDayIndex(0);
  }, [workoutPlan]);

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

  // Apply visual split templates directly in builder
  const handleBuilderApplyTemplate = (template: SplitTemplate) => {
    setBuilderSchedule(structuredClone(template.weeklySchedule));
    setBuilderTitle(template.name);
    setBuilderDescription(template.description);
    setBuilderDifficulty(template.difficulty);
    setSelectedBuilderDayIndex(0);
  };

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
    target.exercises = target.exercises.filter((_, i) => i !== exIdx);
    setBuilderSchedule(next);
  };

  const handleBuilderUpdateExerciseField = (exIdx: number, field: keyof Exercise, val: string | number) => {
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
    onApplyPlan({
      ...workoutPlan,
      title: builderTitle || "My Custom Workout Split",
      description:
        builderDescription ||
        "A custom tailored physical splitting schedule designed from scratch.",
      difficulty: builderDifficulty,
      weeklySchedule: builderSchedule,
    });
  };

  // Q-07: safe — gated by `builderSchedule[selectedBuilderDayIndex] &&` below.
  const activeDay = builderSchedule[selectedBuilderDayIndex] as WeeklyScheduleDay | undefined;

  return (
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
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-grow">
          <BuilderTemplatePicker onApplyTemplate={handleBuilderApplyTemplate} />

          <BuilderMetadataForm
            builderTitle={builderTitle}
            onUpdateTitle={setBuilderTitle}
            builderDifficulty={builderDifficulty}
            onUpdateDifficulty={setBuilderDifficulty}
            builderDescription={builderDescription}
            onUpdateDescription={setBuilderDescription}
          />

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
                {activeDay && (
                  <BuilderDayEditor
                    day={activeDay}
                    selectedBuilderDayIndex={selectedBuilderDayIndex}
                    onUpdateDayField={handleBuilderUpdateDayField}
                    onRemoveDay={handleBuilderRemoveDay}
                    onUpdateExerciseField={handleBuilderUpdateExerciseField}
                    onRemoveExercise={handleBuilderRemoveExerciseFromDay}
                    onAddExercise={handleBuilderAddExerciseToDay}
                    selectedDBCategory={selectedDBCategory}
                    onSelectDBCategory={setSelectedDBCategory}
                    selectedDBExerciseName={selectedDBExerciseName}
                    onSelectDBExerciseName={setSelectedDBExerciseName}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#1A1A1A]/10 flex justify-between gap-3">
          <button
            id="btn-builder-cancel"
            onClick={onClose}
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
  );
}
