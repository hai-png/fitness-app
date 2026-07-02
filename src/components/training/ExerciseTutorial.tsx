/**
 * ExerciseTutorial
 *
 * Renders the "Interactive Form Tutorial Player" modal (Modal 2 in the original
 * TrainingTab). A simulated video player with a looping form-animation, a
 * progress timeline, mute toggle, the coach comment, and an interactive
 * per-step form cues checklist.
 *
 * Owns the mock video-player UI state (play/pause flag, progress %, mute flag,
 * per-step checklist completion). The parent only needs to pass the active
 * exercise (or `null` to close) and an `onClose` callback. When `exercise` is
 * `null`, this component renders nothing.
 *
 * Lifecycle note: the parent should mount this component conditionally
 * (`{exercise && <ExerciseTutorial ... />}`) so each tutorial open starts with
 * fresh player state — matching the original TrainingTab's `handleOpenTutorial`
 * reset behavior.
 */

import { useState, useEffect } from "react";
import {
  Flame,
  Play,
  VolumeX,
  Volume2,
  Check,
  X,
} from "lucide-react";
import type { Exercise } from "../../engine";

interface ExerciseTutorialProps {
  /** The exercise whose form tutorial is being played. `null` renders nothing. */
  exercise: Exercise | null;
  /** Close the tutorial modal. */
  onClose: () => void;
}

export default function ExerciseTutorial({
  exercise,
  onClose,
}: ExerciseTutorialProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [videoProgress, setVideoProgress] = useState<number>(15);
  const [tutorialMuted, setTutorialMuted] = useState<boolean>(false);
  const [completedFormSteps, setCompletedFormSteps] = useState<Record<number, boolean>>({});

  // Loop simulation for mock video tutorial player
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (exercise && isVideoPlaying) {
      interval = setInterval(() => {
        setVideoProgress((prev) => (prev >= 100 ? 0 : prev + 4));
      }, 350);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [exercise, isVideoPlaying]);

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/65 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] text-white border border-white/10 w-full max-w-sm rounded-none overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
          <div>
            <span className="text-[8px] font-mono font-bold uppercase tracking-[0.25em] text-[#E63946] block mb-0.5">
              FORM MASTERCLASS VIDEO
            </span>
            <h3 className="font-serif italic font-bold text-base leading-tight tracking-tight">
              {exercise.name}
            </h3>
          </div>
          <button
            id="btn-close-tutorial"
            onClick={onClose}
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
              Target Focus: {exercise.targetMuscle || "Muscular Tension"}
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
              &quot;{exercise.instruction}&quot;
            </p>
          </div>

          {/* Form cues interactive checklist */}
          {exercise.steps && exercise.steps.length > 0 && (
            <div>
              <h4 className="text-[9px] uppercase tracking-wider font-bold text-white/40 mb-2">
                Form Cues & Movement Checklist
              </h4>
              <div className="space-y-1.5">
                {exercise.steps.map((step, sidx) => {
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
            onClick={onClose}
            className="w-full py-3 bg-[#E63946] hover:bg-[#d62828] text-white text-xs font-bold uppercase tracking-widest transition-all text-center"
          >
            Understood, Got Form!
          </button>
        </div>
      </div>
    </div>
  );
}
