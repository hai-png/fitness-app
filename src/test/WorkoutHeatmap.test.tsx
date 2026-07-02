import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkoutHeatmap } from "../components/WorkoutHeatmap";
import type { ExerciseLog } from "../data/analyticsEngine";

function makeLog(date: string): ExerciseLog {
  return {
    id: `log-${Math.random().toString(36).slice(2, 8)}`,
    exerciseName: "Bench Press",
    targetMuscle: "Chest",
    date,
    sets: [{ id: "s1", weight: 60, reps: 8, isWarmUp: false, type: "Normal" }],
    durationMinutes: 10,
  };
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

describe("WorkoutHeatmap", () => {
  it("renders the title and date range", () => {
    render(<WorkoutHeatmap exerciseLogs={[]} />);
    expect(screen.getByText("Muscular Output Density Map")).toBeInTheDocument();
    // Date range spans 365 days
    const today = new Date().toISOString().split("T")[0];
    expect(screen.getByText(new RegExp(`.* to ${today}`))).toBeInTheDocument();
  });

  it("renders 366 cells (365 days + today)", () => {
    const { container } = render(<WorkoutHeatmap exerciseLogs={[]} />);
    const cells = container.querySelectorAll("[title^='2']");
    expect(cells.length).toBe(366);
  });

  it("shows '0 exercises logged' for all cells when there are no logs", () => {
    const { container } = render(<WorkoutHeatmap exerciseLogs={[]} />);
    const cells = container.querySelectorAll("[title^='2']");
    cells.forEach((c) => {
      expect(c.getAttribute("title")).toMatch(/0 exercises logged$/);
    });
  });

  it("marks today's cell with the logged count when there is a log today", () => {
    const today = daysAgo(0);
    render(<WorkoutHeatmap exerciseLogs={[makeLog(today)]} />);
    expect(screen.getByTitle(`${today}: 1 exercises logged`)).toBeInTheDocument();
  });

  it("shows Active Streak and Max Consistency labels", () => {
    render(<WorkoutHeatmap exerciseLogs={[]} />);
    expect(screen.getByText(/Active Streak:/)).toBeInTheDocument();
    expect(screen.getByText(/Max Consistency:/)).toBeInTheDocument();
  });

  it("shows 0-day streak when there are no logs", () => {
    render(<WorkoutHeatmap exerciseLogs={[]} />);
    // Both Active Streak and Max Consistency should show 0 Days
    expect(screen.getAllByText("0 Days")).toHaveLength(2);
  });

  it("computes a streak from consecutive-day logs", () => {
    // 3 consecutive days of training → streak should be at least 3
    const logs = [makeLog(daysAgo(0)), makeLog(daysAgo(1)), makeLog(daysAgo(2))];
    render(<WorkoutHeatmap exerciseLogs={logs} />);
    // "3 Days" should appear at least once (either in Active Streak or Max Consistency)
    expect(screen.getAllByText("3 Days").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Less/More legend", () => {
    render(<WorkoutHeatmap exerciseLogs={[]} />);
    expect(screen.getByText("Less")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });
});
