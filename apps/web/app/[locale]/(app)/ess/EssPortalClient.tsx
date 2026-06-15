"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import type {
  AttendanceMonthSummary,
  AttendanceRecord,
  Collar,
  DocumentStatus,
  LeaveBalance,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveTypeCode,
  PayrollAdjustment,
  PayrollItem,
} from "@/lib/data/types";
import { formatDate, formatNumber } from "@/lib/utils/format";

export interface EssData {
  employee: {
    id: string;
    hr_code: string;
    name_ar: string;
    name_en: string;
    mobile: string;
    job_title_ar: string;
    job_title_en: string;
    collar: Collar;
  };
  today: AttendanceRecord | null;
  monthSummary: AttendanceMonthSummary | null;
  month: string;
  balances: LeaveBalance[];
  requests: LeaveRequest[];
  leaveTypes: { code: LeaveTypeCode; name_ar: string; name_en: string }[];
  payslip: PayrollItem | null;
  adjustments: PayrollAdjustment[];
  payMonth: string;
  documents: {
    id: string;
    name_ar: string;
    name_en: string;
    status: DocumentStatus;
    expiry_date: string | null;
    days_left: number | null;
    sort_order: number;
  }[];
}

type Tab = "home" | "attendance" | "leave" | "payslip" | "documents";

const TABS: { key: Tab; icon: string }[] = [
  { key: "home", icon: "🏠" },
  { key: "attendance", icon: "📍" },
  { key: "leave", icon: "🏖" },
  { key: "payslip", icon: "💵" },
  { key: "documents", icon: "📄" },
];

const LEAVE_STATUS_VARIANT: Record<LeaveRequestStatus, BadgeVariant> = {
  pending: "yellow",
  manager_approved: "blue",
  approved: "green",
  rejected: "red",
  cancelled: "gray",
};

export function EssPortalClient({ data }: { data: EssData }) {
  const locale = useLocale();
  const t = useTranslations("ess");
  const [tab, setTab] = useState<Tab>("home");

  const name =
    locale === "ar" ? data.employee.name_ar : data.employee.name_en;
  const jobTitle =
    locale === "ar"
      ? data.employee.job_title_ar
      : data.employee.job_title_en;

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
      </div>

      {/* Mobile phone frame — conveys the PWA the blue-collar workforce uses */}
      <div className="mx-auto w-full max-w-[420px]">
        <div className="overflow-hidden rounded-[28px] border border-line bg-card shadow-card">
          {/* App header */}
          <div className="bg-primary px-5 pb-5 pt-4 text-white">
            <div className="flex items-center justify-between text-[11px] opacity-90">
              <span>{t("appName")}</span>
              <span>{data.employee.hr_code}</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-white/20 text-[17px] font-extrabold">
                {name.slice(0, 1)}
              </div>
              <div>
                <p className="text-[15px] font-bold leading-tight">{name}</p>
                <p className="text-[11.5px] opacity-90">{jobTitle}</p>
              </div>
            </div>
          </div>

          {/* Screen body */}
          <div className="min-h-[420px] bg-page p-4">
            {tab === "home" && <HomeScreen data={data} onGo={setTab} />}
            {tab === "attendance" && <AttendanceScreen data={data} />}
            {tab === "leave" && <LeaveScreen data={data} />}
            {tab === "payslip" && <PayslipScreen data={data} />}
            {tab === "documents" && <DocumentsScreen data={data} />}
          </div>

          {/* Bottom tab bar */}
          <nav className="grid grid-cols-5 border-t border-line bg-card">
            {TABS.map((tb) => {
              const active = tab === tb.key;
              return (
                <button
                  key={tb.key}
                  onClick={() => setTab(tb.key)}
                  className={[
                    "flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-semibold transition-colors",
                    active ? "text-primary" : "text-muted hover:text-ink",
                  ].join(" ")}
                >
                  <span className="text-[17px]">{tb.icon}</span>
                  {t(`tabs.${tb.key}`)}
                </button>
              );
            })}
          </nav>
        </div>

        <p className="mt-3 text-center text-[11px] text-muted">
          {t("scopeNote")}
        </p>
      </div>
    </>
  );
}

/* ------------------------------- Screens -------------------------------- */

function ScreenTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-[15px] font-bold">{children}</h2>;
}

function Tile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "green" | "red";
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-3.5 shadow-sm">
      <p className="text-[11px] text-muted">{label}</p>
      <p
        className={[
          "mt-0.5 text-[18px] font-extrabold leading-tight",
          tone === "green" ? "text-green" : tone === "red" ? "text-red" : "",
        ].join(" ")}
      >
        {value}
      </p>
      {sub && <p className="text-[10.5px] text-muted">{sub}</p>}
    </div>
  );
}

function HomeScreen({
  data,
  onGo,
}: {
  data: EssData;
  onGo: (t: Tab) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("ess");
  const [checkedIn, setCheckedIn] = useState(Boolean(data.today?.check_in));
  const [checkedOut, setCheckedOut] = useState(Boolean(data.today?.check_out));
  const [time, setTime] = useState<string | null>(
    data.today?.check_in ?? null
  );

  const annual = data.balances.find((b) => b.type_code === "annual");

  function doCheck() {
    const now = new Date().toLocaleTimeString(
      locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB",
      { hour: "2-digit", minute: "2-digit" }
    );
    if (!checkedIn) {
      setCheckedIn(true);
      setTime(now);
    } else if (!checkedOut) {
      setCheckedOut(true);
    }
  }

  return (
    <div className="space-y-3">
      <ScreenTitle>{t("home.greeting")}</ScreenTitle>

      {/* One-tap attendance */}
      <div className="rounded-2xl border border-line bg-card p-4 text-center shadow-sm">
        <p className="text-[11.5px] text-muted">{t("home.attendanceToday")}</p>
        <p className="mt-1 text-[13px] font-semibold">
          {checkedIn
            ? checkedOut
              ? t("home.checkedOut")
              : t("home.checkedInAt", { time: time ?? "—" })
            : t("home.notCheckedIn")}
        </p>
        <button
          onClick={doCheck}
          disabled={checkedIn && checkedOut}
          className={[
            "mt-3 w-full rounded-xl py-3 text-[14px] font-extrabold text-white transition-opacity",
            checkedIn && checkedOut
              ? "cursor-default bg-[#cbd2dc]"
              : checkedIn
                ? "bg-yellow hover:opacity-90"
                : "bg-green hover:opacity-90",
          ].join(" ")}
        >
          {checkedIn && checkedOut
            ? `✓ ${t("home.done")}`
            : checkedIn
              ? `📍 ${t("home.checkOut")}`
              : `📍 ${t("home.checkIn")}`}
        </button>
        <p className="mt-1.5 text-[10px] text-muted">{t("home.gpsNote")}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <Tile
          label={t("home.leaveBalance")}
          value={`${annual?.remaining ?? 0} ${t("days")}`}
          sub={t("home.annualLeave")}
          tone="green"
        />
        <Tile
          label={t("home.thisMonth")}
          value={`${data.monthSummary?.worked_days ?? 0} ${t("days")}`}
          sub={t("home.workedDays")}
        />
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-3 gap-2.5">
        {(["payslip", "leave", "documents"] as Tab[]).map((key) => (
          <button
            key={key}
            onClick={() => onGo(key)}
            className="rounded-2xl border border-line bg-card p-3 text-center shadow-sm hover:bg-page"
          >
            <span className="text-[20px]">
              {TABS.find((x) => x.key === key)?.icon}
            </span>
            <p className="mt-1 text-[11px] font-semibold">{t(`tabs.${key}`)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function AttendanceScreen({ data }: { data: EssData }) {
  const locale = useLocale();
  const t = useTranslations("ess");
  const s = data.monthSummary;
  return (
    <div className="space-y-3">
      <ScreenTitle>{t("attendance.title")}</ScreenTitle>
      <p className="text-[11.5px] text-muted">
        {formatDate(data.month, locale)}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <Tile label={t("attendance.worked")} value={String(s?.worked_days ?? 0)} />
        <Tile label={t("attendance.leave")} value={String(s?.leave_days ?? 0)} />
        <Tile
          label={t("attendance.absent")}
          value={String(s?.absent_days ?? 0)}
          tone={s && s.absent_days > 0 ? "red" : undefined}
        />
        <Tile
          label={t("attendance.late")}
          value={`${s?.late_minutes ?? 0} ${t("attendance.min")}`}
        />
      </div>
      {data.today && (
        <div className="rounded-2xl border border-line bg-card p-3.5 shadow-sm">
          <p className="text-[11.5px] font-semibold">{t("attendance.today")}</p>
          <div className="mt-2 flex items-center justify-between text-[12.5px]">
            <span className="text-muted">{t("attendance.checkIn")}</span>
            <span className="font-semibold">{data.today.check_in ?? "—"}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[12.5px]">
            <span className="text-muted">{t("attendance.checkOut")}</span>
            <span className="font-semibold">{data.today.check_out ?? "—"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaveScreen({ data }: { data: EssData }) {
  const locale = useLocale();
  const t = useTranslations("ess");
  const [submitted, setSubmitted] = useState(false);
  const [type, setType] = useState<LeaveTypeCode>("annual");
  const [days, setDays] = useState(1);

  const annual = data.balances.find((b) => b.type_code === "annual");

  return (
    <div className="space-y-3">
      <ScreenTitle>{t("leave.title")}</ScreenTitle>

      <div className="grid grid-cols-2 gap-2.5">
        {data.balances.map((b) => (
          <Tile
            key={b.type_code}
            label={t(`leave.types.${b.type_code}`)}
            value={`${b.remaining} ${t("days")}`}
            sub={t("leave.ofEntitled", { entitled: b.entitled })}
            tone={b.remaining <= 2 ? "red" : "green"}
          />
        ))}
      </div>

      {/* Request form */}
      <div className="rounded-2xl border border-line bg-card p-3.5 shadow-sm">
        <p className="mb-2 text-[12.5px] font-semibold">
          {t("leave.requestTitle")}
        </p>
        {submitted ? (
          <Alert variant="green">{t("leave.submitted")}</Alert>
        ) : (
          <>
            <label className="block text-[11px] text-muted">
              {t("leave.type")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LeaveTypeCode)}
              className="mt-1 w-full rounded-lg border border-line bg-page px-3 py-2 text-[12.5px]"
            >
              {data.leaveTypes.map((lt) => (
                <option key={lt.code} value={lt.code}>
                  {locale === "ar" ? lt.name_ar : lt.name_en}
                </option>
              ))}
            </select>
            <label className="mt-2 block text-[11px] text-muted">
              {t("leave.days")}
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
              className="mt-1 w-full rounded-lg border border-line bg-page px-3 py-2 text-[12.5px]"
            />
            {type === "annual" && annual && days > annual.remaining && (
              <p className="mt-1.5 text-[11px] font-semibold text-red">
                {t("leave.overBalance", { remaining: annual.remaining })}
              </p>
            )}
            <button
              onClick={() => setSubmitted(true)}
              disabled={type === "annual" && !!annual && days > annual.remaining}
              className="mt-3 w-full rounded-xl bg-primary py-2.5 text-[13px] font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#cbd2dc]"
            >
              {t("leave.submit")}
            </button>
          </>
        )}
      </div>

      {/* My requests */}
      <div>
        <p className="mb-2 text-[12.5px] font-semibold">{t("leave.myRequests")}</p>
        <ul className="space-y-2">
          {data.requests.length === 0 && (
            <li className="text-[12px] text-muted">{t("leave.noRequests")}</li>
          )}
          {data.requests.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-card p-3 shadow-sm"
            >
              <div>
                <p className="text-[12.5px] font-semibold">
                  {t(`leave.types.${r.type_code}`)} · {r.days} {t("days")}
                </p>
                <p className="text-[11px] text-muted">
                  {formatDate(r.start_date, locale)} →{" "}
                  {formatDate(r.end_date, locale)}
                </p>
              </div>
              <Badge variant={LEAVE_STATUS_VARIANT[r.status]}>
                {t(`leave.status.${r.status}`)}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PayslipScreen({ data }: { data: EssData }) {
  const locale = useLocale();
  const t = useTranslations("ess");
  const [unlocked, setUnlocked] = useState(false);
  const p = data.payslip;

  const month = useMemo(
    () =>
      new Date(data.payMonth + "T12:00:00Z").toLocaleString(
        locale === "ar" ? "ar-EG" : "en-US",
        { month: "long", year: "numeric" }
      ),
    [data.payMonth, locale]
  );

  if (!p) {
    return (
      <div className="space-y-3">
        <ScreenTitle>{t("payslip.title")}</ScreenTitle>
        <p className="text-[12px] text-muted">{t("payslip.none")}</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="space-y-3">
        <ScreenTitle>{t("payslip.title")}</ScreenTitle>
        <div className="rounded-2xl border border-line bg-card p-5 text-center shadow-sm">
          <div className="text-3xl">🔒</div>
          <p className="mt-2 text-[12.5px] font-semibold">
            {t("payslip.locked")}
          </p>
          <p className="mt-1 text-[11px] text-muted">{t("payslip.pinNote")}</p>
          <button
            onClick={() => setUnlocked(true)}
            className="mt-3 w-full rounded-xl bg-primary py-2.5 text-[13px] font-extrabold text-white hover:opacity-90"
          >
            {t("payslip.unlock")}
          </button>
        </div>
      </div>
    );
  }

  const allowances = Object.entries(p.components.allowances ?? {});
  const adjTotal = data.adjustments.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-3">
      <ScreenTitle>{t("payslip.title")}</ScreenTitle>
      <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
        <p className="text-[11.5px] text-muted">{month}</p>
        <p className="mt-0.5 text-[24px] font-extrabold text-green">
          {formatNumber(p.net + adjTotal, locale)} {t("egp")}
        </p>
        <p className="text-[11px] text-muted">{t("payslip.netPay")}</p>

        <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-[12px]">
          <Row label={t("payslip.basic")} value={p.components.basic_salary} locale={locale} />
          {allowances.map(([k, v]) => (
            <Row
              key={k}
              label={t(`payslip.allowance.${k}`)}
              value={v}
              locale={locale}
            />
          ))}
          <Row label={t("payslip.gross")} value={p.gross} locale={locale} bold />
          <Row label={t("payslip.tax")} value={-p.taxes} locale={locale} neg />
          <Row
            label={t("payslip.si")}
            value={-p.social_insurance}
            locale={locale}
            neg
          />
          {data.adjustments.map((a) => (
            <Row
              key={a.id}
              label={locale === "ar" ? a.label_ar : a.label_en}
              value={a.amount}
              locale={locale}
              neg={a.amount < 0}
            />
          ))}
        </dl>
      </div>
      <p className="text-[10.5px] text-muted">{t("payslip.policyNote")}</p>
    </div>
  );
}

function Row({
  label,
  value,
  locale,
  bold,
  neg,
}: {
  label: string;
  value: number;
  locale: string;
  bold?: boolean;
  neg?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={bold ? "font-bold" : "text-muted"}>{label}</dt>
      <dd
        className={[
          "tabular-nums",
          bold ? "font-extrabold" : "font-semibold",
          neg ? "text-red" : "",
        ].join(" ")}
      >
        {neg && value < 0 ? "−" : ""}
        {formatNumber(Math.abs(value), locale)}
      </dd>
    </div>
  );
}

function DocumentsScreen({ data }: { data: EssData }) {
  const locale = useLocale();
  const t = useTranslations("ess");

  const docVariant = (
    status: DocumentStatus,
    daysLeft: number | null
  ): { variant: BadgeVariant; key: string } => {
    if (daysLeft !== null && daysLeft <= 30)
      return { variant: "red", key: "expiring" };
    if (status === "verified") return { variant: "green", key: "verified" };
    if (status === "received") return { variant: "blue", key: "received" };
    if (status === "expired") return { variant: "red", key: "expired" };
    return { variant: "yellow", key: "required" };
  };

  return (
    <div className="space-y-3">
      <ScreenTitle>{t("documents.title")}</ScreenTitle>

      <button className="w-full rounded-xl border border-dashed border-primary/50 bg-blue-soft py-3 text-[13px] font-bold text-primary">
        📷 {t("documents.upload")}
      </button>

      <ul className="space-y-2">
        {data.documents.map((d) => {
          const v = docVariant(d.status, d.days_left);
          return (
            <li
              key={d.id}
              className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-card p-3 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-semibold">
                  {locale === "ar" ? d.name_ar : d.name_en}
                </p>
                {d.expiry_date && (
                  <p
                    className={[
                      "text-[11px]",
                      d.days_left !== null && d.days_left <= 30
                        ? "font-semibold text-red"
                        : "text-muted",
                    ].join(" ")}
                  >
                    {t("documents.expires", {
                      date: formatDate(d.expiry_date, locale),
                    })}
                  </p>
                )}
              </div>
              <Badge variant={v.variant}>{t(`documents.status.${v.key}`)}</Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
