"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

/** ESS check-in toggle (demo: GPS-gated punch in/out). Local state only. */
export function EssCheckIn({
  inLabel,
  outLabel,
  hintIdle,
  hintIn,
  hintOut,
}: {
  inLabel: string;
  outLabel: string;
  hintIdle: string;
  hintIn: string;
  hintOut: string;
}) {
  const [state, setState] = useState<"idle" | "in" | "out">("idle");
  const checkedIn = state === "in";

  return (
    <>
      <button
        type="button"
        onClick={() => setState(checkedIn ? "out" : "in")}
        className={cn(
          "size-[108px] rounded-full font-extrabold text-[15px] text-white shadow-[0_8px_22px_rgba(14,159,110,.4)] transition-colors",
          checkedIn
            ? "bg-red shadow-[0_8px_22px_rgba(224,36,36,.35)]"
            : "bg-green"
        )}
      >
        {checkedIn ? outLabel : inLabel}
      </button>
      <p className="mt-3 text-[11.5px] text-muted">
        {state === "idle" ? hintIdle : state === "in" ? hintIn : hintOut}
      </p>
    </>
  );
}
