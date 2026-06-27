import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type AlertVariant = "green" | "yellow" | "red";

const VARIANTS: Record<AlertVariant, string> = {
  green: "border-[#b8e6d3] bg-green-soft text-green",
  yellow: "border-[#ecd9a0] bg-yellow-soft text-yellow",
  red: "border-[#f5c2c2] bg-red-soft text-red",
};

/** Inline alert strip (demo `.alert`). */
export function Alert({
  variant,
  className,
  children,
}: {
  variant: AlertVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border px-3.5 py-2.5 text-[12.5px] font-semibold",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
