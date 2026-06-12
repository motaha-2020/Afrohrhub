import { cn } from "@/lib/utils/cn";

type Props = {
  hours: number;
  priority: "P0" | "P1";
  locale?: string;
};

function formatTime(hours: number, locale: string): string {
  const ar = locale === "ar";
  if (hours <= 0) {
    const abs = Math.abs(Math.floor(hours));
    return ar ? `متأخر ${abs}س` : `${abs}h overdue`;
  }
  if (hours >= 48) {
    const days = Math.floor(hours / 24);
    return ar ? `${days} أيام` : `${days}d`;
  }
  if (hours >= 24) {
    const rem = Math.floor(hours % 24);
    return ar
      ? rem > 0 ? `يوم و${rem}س` : "يوم واحد"
      : rem > 0 ? `1d ${rem}h` : "1d";
  }
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  if (ar) return m > 0 ? `${h}س ${m}د` : `${h} ساعة`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function tone(hours: number) {
  if (hours <= 0)
    return { bg: "bg-red-soft", text: "text-red", ring: "ring-red/20" };
  if (hours < 4)
    return { bg: "bg-red-soft", text: "text-red", ring: "ring-red/20" };
  if (hours < 12)
    return { bg: "bg-yellow-soft", text: "text-yellow", ring: "ring-yellow/20" };
  if (hours < 24)
    return { bg: "bg-yellow-soft", text: "text-yellow", ring: "ring-yellow/20" };
  return { bg: "bg-green-soft", text: "text-green", ring: "ring-green/20" };
}

export function SlaCountdown({ hours, priority, locale = "ar" }: Props) {
  const { bg, text } = tone(hours);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-bold ring-1",
        bg,
        text,
        tone(hours).ring
      )}
    >
      <span className="font-black">{priority}</span>
      <span>·</span>
      <span>⏱ {formatTime(hours, locale)}</span>
    </span>
  );
}
