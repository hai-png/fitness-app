/**
 * RestTimer
 *
 * Renders the rest-timer countdown chip shown inside the ActiveWorkout
 * "Workout Active" status bar while a workout is in progress and a rest
 * countdown is running. Renders nothing when `timerSeconds` is 0.
 *
 * Pure presentational component.
 */

import { Timer } from "lucide-react";

interface RestTimerProps {
  /** Remaining rest seconds. When 0 (or below), nothing is rendered. */
  timerSeconds: number;
}

export default function RestTimer({ timerSeconds }: RestTimerProps) {
  if (timerSeconds <= 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 px-2.5 py-1 font-mono">
      <Timer className="w-3.5 h-3.5 animate-pulse" />
      <span>Rest Countdown: {timerSeconds}s</span>
    </div>
  );
}
