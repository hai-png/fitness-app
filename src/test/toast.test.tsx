import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import {
  ToastViewport,
  ConfirmViewport,
  useToastStore,
  useConfirmStore,
  confirmDialog,
  toast,
} from "../components/Toast";

beforeEach(() => {
  // Reset all toast + confirm state between tests
  useToastStore.setState({ toasts: [] });
  useConfirmStore.setState({ open: false, resolver: null });
  // Clear any leftover portal DOM nodes
  document.body.innerHTML = "";
  // Clear any lingering timers
  vi.clearAllTimers();
});

afterEach(() => {
  cleanup();
  // Also clear portal nodes after each test
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("toast system", () => {
  it("renders nothing when there are no toasts", () => {
    const { container } = render(<ToastViewport />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a toast when toast.success is called", async () => {
    render(<ToastViewport />);
    toast.success("Saved!", "Your weight log was recorded.");

    expect(await screen.findByText("Saved!")).toBeInTheDocument();
    expect(screen.getByText("Your weight log was recorded.")).toBeInTheDocument();
  });

  it("renders multiple toasts stacked", async () => {
    render(<ToastViewport />);
    toast.success("First");
    toast.error("Second", "Something went wrong");

    expect(await screen.findByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("auto-dismisses after the duration elapses", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<ToastViewport />);

    act(() => {
      toast.success("Ephemeral", "Gone soon", 1000);
    });

    // Use sync query — the toast should already be in the DOM after the act() above
    expect(screen.getByText("Ephemeral")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    await waitFor(() => {
      expect(screen.queryByText("Ephemeral")).not.toBeInTheDocument();
    });
    vi.useRealTimers();
  });

  it("can be manually dismissed via the close button", async () => {
    render(<ToastViewport />);
    toast.info("Sticky", "Click X to close", 0);

    const dismissBtn = await screen.findByLabelText("Dismiss notification");
    fireEvent.click(dismissBtn);

    await waitFor(() => {
      expect(screen.queryByText("Sticky")).not.toBeInTheDocument();
    });
  });

  it("uses role=alert for accessibility", async () => {
    render(<ToastViewport />);
    toast.error("Failed", "Network error");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Failed");
  });
});

describe("confirmDialog", () => {
  it("renders a modal dialog when called", async () => {
    render(<ConfirmViewport />);
    const promise = confirmDialog({
      title: "Are you sure?",
      message: "This action cannot be undone.",
    });

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();

    // Cleanup: resolve the promise so it doesn't leak
    fireEvent.click(screen.getByText("Confirm"));
    await promise;
  });

  it("resolves true when the confirm button is clicked", async () => {
    render(<ConfirmViewport />);
    const promise = confirmDialog({
      title: "Delete?",
      message: "Really?",
      confirmLabel: "Yes Delete",
    });

    const confirmBtn = await screen.findByText("Yes Delete");
    fireEvent.click(confirmBtn);

    const result = await promise;
    expect(result).toBe(true);
  });

  it("resolves false when the cancel button is clicked", async () => {
    render(<ConfirmViewport />);
    const promise = confirmDialog({
      title: "Reset?",
      message: "Really?",
      cancelLabel: "Keep It",
    });

    const cancelBtn = await screen.findByText("Keep It");
    fireEvent.click(cancelBtn);

    const result = await promise;
    expect(result).toBe(false);
  });

  it("applies destructive styling to the confirm button when destructive=true", async () => {
    render(<ConfirmViewport />);
    confirmDialog({
      title: "Reset?",
      message: "Really?",
      destructive: true,
      confirmLabel: "Destroy",
    });

    const confirmBtn = await screen.findByText("Destroy");
    // Destructive buttons use the red color class
    expect(confirmBtn.className).toContain("bg-[#E63946]");
  });

  it("does NOT render when no dialog is open", () => {
    const { container } = render(<ConfirmViewport />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
