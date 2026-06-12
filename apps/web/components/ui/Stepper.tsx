import { cn } from "@/lib/utils/cn";

export type StepState = "done" | "current" | "upcoming";

export interface Step {
  label: string;
  state: StepState;
  /** Marker text for upcoming steps (defaults to the step number). */
  marker?: string;
}

/** Horizontal process stepper (onboarding / offboarding / payroll cycles). */
export function Stepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-3.5 pt-1.5">
      {steps.map((step, i) => (
        <div
          key={i}
          className={cn(
            "relative min-w-24 flex-1 text-center text-[11px] text-muted",
            step.state === "current" && "font-bold text-primary"
          )}
        >
          {i > 0 ? (
            <span
              className={cn(
                "absolute top-3.5 h-[3px] w-full bg-[#e3e8f0]",
                (step.state === "done" || step.state === "current") &&
                  "bg-green"
              )}
              style={{ insetInlineStart: "-50%" }}
            />
          ) : null}
          <span
            className={cn(
              "relative z-[1] mx-auto mb-1.5 flex size-[30px] items-center justify-center rounded-full text-xs font-extrabold",
              step.state === "done" && "bg-green text-white",
              step.state === "current" &&
                "bg-primary text-white shadow-[0_0_0_4px_var(--color-primary-soft)]",
              step.state === "upcoming" && "bg-[#e3e8f0] text-muted"
            )}
          >
            {step.state === "done" ? "✓" : (step.marker ?? i + 1)}
          </span>
          {step.label}
        </div>
      ))}
    </div>
  );
}
