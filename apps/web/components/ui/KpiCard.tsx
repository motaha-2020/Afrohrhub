import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function KpiCard({
  label,
  value,
  sub,
  tone = "none",
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  /** Colors the sub line like the demo's ▲/▼ deltas. */
  tone?: "up" | "down" | "none";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-card p-[18px] shadow-card",
        className
      )}
    >
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className="my-1 text-[26px] font-extrabold leading-tight">
        {value}
      </div>
      {sub ? (
        <div
          className={cn(
            "text-[11.5px]",
            tone === "up" && "text-green",
            tone === "down" && "text-red"
          )}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
}
