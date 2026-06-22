import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type CheckState = "ok" | "warn" | "no" | "x" | "pending";

const MARK: Record<CheckState, { glyph: string; className: string }> = {
  ok: { glyph: "✓", className: "bg-green text-white" },
  warn: { glyph: "!", className: "bg-yellow text-white" },
  x: { glyph: "!", className: "bg-red text-white" },
  no: { glyph: "—", className: "bg-[#eef1f5] text-muted" },
  pending: { glyph: "○", className: "bg-[#eef1f5] text-muted" },
};

export interface CheckItem {
  state: CheckState;
  label: ReactNode;
  /** Right-aligned muted note (the demo `.meta`). */
  meta?: ReactNode;
}

/** Manual checklist styled like the demo `.chk` list (documents, HSE, gates). */
export function Checklist({ items }: { items: CheckItem[] }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-center gap-2.5 border-b border-dashed border-line py-[9px] text-[13px] last:border-b-0"
        >
          <span
            className={cn(
              "flex size-[21px] shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
              MARK[item.state].className
            )}
          >
            {MARK[item.state].glyph}
          </span>
          <span className="min-w-0">{item.label}</span>
          {item.meta ? (
            <span className="ms-auto ps-2 text-end text-[11px] text-muted">
              {item.meta}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
