import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OneRMEstimator } from "../components/OneRMEstimator";
import { useToastStore } from "../components/Toast";

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
});

describe("OneRMEstimator", () => {
  it("renders weight and reps inputs with default values", () => {
    render(<OneRMEstimator />);
    const weightInput = screen.getByDisplayValue("80") as HTMLInputElement;
    const repsInput = screen.getByDisplayValue("5") as HTMLInputElement;
    expect(weightInput).toBeInTheDocument();
    expect(repsInput).toBeInTheDocument();
  });

  it("renders the Estimate button", () => {
    render(<OneRMEstimator />);
    expect(screen.getByText("Estimate 1RM")).toBeInTheDocument();
  });

  it("associates labels with inputs via htmlFor/id", () => {
    render(<OneRMEstimator />);
    const weightLabel = screen.getByText("Weight (kg)");
    const repsLabel = screen.getByText("Reps");
    expect(weightLabel).toHaveAttribute("for", "1rm-weight");
    expect(repsLabel).toHaveAttribute("for", "1rm-reps");
  });

  it("shows a warning toast when weight is empty", () => {
    render(<OneRMEstimator />);
    const weightInput = screen.getByDisplayValue("80");
    fireEvent.change(weightInput, { target: { value: "" } });
    fireEvent.click(screen.getByText("Estimate 1RM"));

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].variant).toBe("warning");
    expect(toasts[0].title).toBe("Invalid input");
  });

  it("shows a warning toast when reps is 0", () => {
    render(<OneRMEstimator />);
    const repsInput = screen.getByDisplayValue("5");
    fireEvent.change(repsInput, { target: { value: "0" } });
    fireEvent.click(screen.getByText("Estimate 1RM"));

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].variant).toBe("warning");
  });

  it("computes and shows an info toast with the Epley estimate", () => {
    render(<OneRMEstimator />);
    // Default values: 80kg × 5 reps → 80 * (1 + 5/30) = 93.33 → rounded 93
    fireEvent.click(screen.getByText("Estimate 1RM"));

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].variant).toBe("info");
    expect(toasts[0].title).toBe("Estimated 1RM");
    // Message should contain the rounded 1RM value
    expect(toasts[0].message).toMatch(/93 kg/);
    expect(toasts[0].message).toContain("80kg");
    expect(toasts[0].message).toContain("5 reps");
  });

  it("updates the estimate when inputs change", () => {
    render(<OneRMEstimator />);
    // Change to 100kg × 1 rep → 100 * 1 = 100 (1RM identity)
    fireEvent.change(screen.getByDisplayValue("80"), { target: { value: "100" } });
    fireEvent.change(screen.getByDisplayValue("5"), { target: { value: "1" } });
    fireEvent.click(screen.getByText("Estimate 1RM"));

    const toasts = useToastStore.getState().toasts;
    expect(toasts[0].message).toMatch(/100 kg/);
  });
});
