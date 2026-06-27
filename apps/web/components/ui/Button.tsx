import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  outline:
    "border-[1.5px] border-primary bg-card text-primary hover:bg-primary-soft",
  ghost: "bg-transparent text-primary hover:bg-primary-soft",
  danger: "border-[1.5px] border-red bg-card text-red hover:bg-red-soft",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-[5px] text-xs",
  md: "px-[18px] py-[9px] text-[13px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type={type}
      className={cn(
        "cursor-pointer rounded-[9px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
