import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "purple"
  | "gray";

const VARIANTS: Record<BadgeVariant, string> = {
  green: "bg-green-soft text-green",
  yellow: "bg-yellow-soft text-yellow",
  red: "bg-red-soft text-red",
  blue: "bg-blue-soft text-primary",
  purple: "bg-purple-soft text-purple",
  gray: "bg-[#eef1f5] text-muted",
};

export function Badge({
  variant = "gray",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-[11px] py-[2px] text-[11px] font-bold",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
