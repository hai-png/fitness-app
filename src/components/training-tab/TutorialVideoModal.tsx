import type { Dispatch, SetStateAction } from "react";
import { Flame, Play, VolumeX, Volume2, Check } from "lucide-react";
import { Modal } from "../Modal";
import type { Exercise } from "../../engine/schemas";

/**
 * TutorialVideoModal — the interactive form-tutorial player (Modal #2 in
 * TrainingTab). Renders a mock video screen (animated flame + looping
 * progress bar), play/pause + mute controls, a coach-comment block, an
 * interactive per-step "Form Cues & Movement Checklist", and a footer
 * "Understood, Got Form!" button.
 *
 * Extracted verbatim from TrainingTab.tsx (lines 717–846) during A-05
 * god-component decomposition. No JSX, CSS classes, ids, or business logic
 * were changed. All state + setters continue to be owned by the parent
 * (the loop-simulation `useEffect` lives in TrainingTab because it depends
 * on `activeTutorialExercise` and `isVideoPlaying`); they are passed in as
 * props so the inline event handlers (`setIsVideoPlaying(!isVideoPlaying)`,
 * `setTutorialMuted(!tutorialMuted)`, `setCompletedFormSteps(prev => ...)`)
 * remain byte-identical to the originals.
 */
interface TutorialVideoModalProps {
  activeExercise: Exercise | null;
  onClose: () => void;
  isVideoPlaying: boolean;
  setIsVideoPlaying: Dispatch<SetStateAction<boolean>>;
  videoProgress: number;
  tutorialMuted: boolean;
  setTutorialMuted: Dispatch<SetStateAction<boolean>>;
  completedFormSteps: Record<number, boolean>;
  setCompletedFormSteps: Dispatch<SetStateAction<Record<number, boolean>>>;
}

export default function TutorialVideoModal({
  activeExercise,
  onClose,
  isVideoPlaying,
  setIsVideoPlaying,
  videoProgress,
  tutorialMuted,
  setTutorialMuted,
  completedFormSteps,
  setCompletedFormSteps,
}: TutorialVideoModalProps) {
  return (
    <Modal
      open={!!activeExercise}
      onClose={onClose}
      title="Exercise Tutorial"
      maxWidthClass="max-w-sm"
    >
      {activeExercise && (
        <div className="bg-[#1A1A1A] text-white flex flex-col max-h-[80vh]">
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
                Target Focus: {activeExercise.targetMuscle || "Muscular Tension"}
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
                aria-label={tutorialMuted ? "Unmute" : "Mute"}
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
                &quot;{activeExercise.instruction}&quot;
              </p>
            </div>

            {/* Form cues interactive checklist */}
            {activeExercise.steps && activeExercise.steps.length > 0 && (
              <div>
                <h4 className="text-[9px] uppercase tracking-wider font-bold text-white/40 mb-2">
                  Form Cues & Movement Checklist
                </h4>
                <div className="space-y-1.5">
                  {activeExercise.steps.map((step, sidx) => {
                    const checked = completedFormSteps[sidx];
                    return (
                      <button
                        key={`form-step-${sidx}-${step.slice(0, 12)}`}
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
              onClick={onClose}
              className="w-full py-3 bg-[#E63946] hover:bg-[#d62828] text-white text-xs font-bold uppercase tracking-widest transition-all text-center"
            >
              Understood, Got Form!
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
