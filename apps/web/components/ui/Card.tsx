import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({
  title,
  action,
  flush = false,
  className,
  children,
}: {
  title?: ReactNode;
  action?: ReactNode;
  /** Remove vertical padding (tables that span the card width). */
  flush?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-card shadow-card",
        flush ? "px-[18px]" : "p-[18px]",
        className
      )}
    >
      {title ? (
        <h3
          className={cn(
            "flex items-center justify-between text-[14.5px] font-bold",
            flush ? "pt-[18px] pb-3.5" : "mb-3.5"
          )}
        >
          <span>{title}</span>
          {action}
        </h3>
      ) : null}
      {children}
    </div>
  );
}
