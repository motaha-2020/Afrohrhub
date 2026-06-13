"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { SlaCountdown } from "@/components/ui/SlaCountdown";
import { STAGE_SLA_HOURS } from "@/lib/data/mock/recruitment";
import {
  RECRUITMENT_STAGES,
  type Candidate,
  type HiringRequest,
  type JobOffer,
  type RecruitmentStage,
} from "@/lib/data/types";
import { avatarColor, formatNumber, initials } from "@/lib/utils/format";
import { OfferModal } from "./OfferModal";
import { RejectModal } from "./RejectModal";

const STAGE_ICON: Record<RecruitmentStage, string> = {
  hiring_request: "📝",
  sourcing_screening: "🔍",
  requester_review: "👀",
  interviews: "🎤",
  final_selection: "⚖️",
  offer_issuance: "📨",
  offer_acceptance: "✍️",
  handover: "🤝",
};

function Stars({ score }: { score: number }) {
  return (
    <span className="text-[10px] tracking-tight text-yellow">
      {"★".repeat(score)}
      <span className="text-[#d6dbe4]">{"★".repeat(5 - score)}</span>
    </span>
  );
}

export function PipelineBoard({
  requests,
  initialCandidates,
  initialOffers,
}: {
  requests: HiringRequest[];
  initialCandidates: Candidate[];
  initialOffers: JobOffer[];
}) {
  const locale = useLocale();
  const t = useTranslations("recruitment.pipeline");
  const tStages = useTranslations("recruitment.stages");

  const [candidates, setCandidates] = useState(initialCandidates);
  const [offers, setOffers] = useState(initialOffers);
  const [requestFilter, setRequestFilter] = useState<string>("all");
  const [offerFor, setOfferFor] = useState<Candidate | null>(null);
  const [rejectFor, setRejectFor] = useState<Candidate | null>(null);
  const [handedOver, setHandedOver] = useState<string | null>(null);

  const requestById = useMemo(
    () => new Map(requests.map((r) => [r.id, r])),
    [requests]
  );

  const visible = candidates.filter(
    (c) => requestFilter === "all" || c.hiring_request_id === requestFilter
  );

  function advance(candidate: Candidate) {
    const idx = RECRUITMENT_STAGES.indexOf(candidate.stage);
    if (idx >= RECRUITMENT_STAGES.length - 1) return;
    const next = RECRUITMENT_STAGES[idx + 1];
    const request = requestById.get(candidate.hiring_request_id);
    const sla = STAGE_SLA_HOURS[next][request?.priority ?? "P1"];
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidate.id
          ? {
              ...c,
              stage: next,
              stage_entered_at: new Date().toISOString(),
              sla_hours_remaining: sla,
            }
          : c
      )
    );
  }

  function reject(id: string, reason: string) {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "rejected",
              rejection_reason_ar: reason,
              rejection_reason_en: reason,
            }
          : c
      )
    );
  }

  function sendOffer(candidate: Candidate, salary: number, startDate: string) {
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + 30);
    const existing = offers.find((o) => o.candidate_id === candidate.id);
    const sent: JobOffer = existing
      ? {
          ...existing,
          status: "sent",
          offered_salary: salary,
          proposed_start_date: startDate,
          sent_at: now.toISOString(),
          expires_at: expires.toISOString().slice(0, 10),
        }
      : {
          id: `off-${candidate.id}`,
          tenant_id: candidate.tenant_id,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          archived_at: null,
          candidate_id: candidate.id,
          status: "sent",
          offered_salary: salary,
          proposed_start_date: startDate,
          sent_at: now.toISOString(),
          expires_at: expires.toISOString().slice(0, 10),
          responded_at: null,
          token: `ofr-${candidate.id}`,
        };
    setOffers((prev) => [
      ...prev.filter((o) => o.candidate_id !== candidate.id),
      sent,
    ]);
    advance(candidate);
  }

  function handover(candidate: Candidate) {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidate.id ? { ...c, status: "handed_over" } : c
      )
    );
    setHandedOver(locale === "ar" ? candidate.name_ar : candidate.name_en);
  }

  return (
    <>
      {offerFor && (
        <OfferModal
          candidate={offerFor}
          request={requestById.get(offerFor.hiring_request_id) ?? null}
          onClose={() => setOfferFor(null)}
          onSend={(salary, startDate) => {
            sendOffer(offerFor, salary, startDate);
            setOfferFor(null);
          }}
        />
      )}
      {rejectFor && (
        <RejectModal
          candidate={rejectFor}
          onClose={() => setRejectFor(null)}
          onConfirm={(reason) => {
            reject(rejectFor.id, reason);
            setRejectFor(null);
          }}
        />
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={requestFilter}
          onChange={(e) => setRequestFilter(e.target.value)}
          className="rounded-[9px] border border-line bg-card px-3 py-2 text-[12.5px] font-semibold outline-none focus:border-primary"
        >
          <option value="all">{t("allRequests")}</option>
          {requests.map((r) => (
            <option key={r.id} value={r.id}>
              {r.request_code} —{" "}
              {locale === "ar" ? r.job_title_ar : r.job_title_en}
            </option>
          ))}
        </select>
        {handedOver && (
          <div className="rounded-[10px] border border-[#b8e6d3] bg-green-soft px-3.5 py-2 text-[12.5px] font-semibold text-green">
            {t("handoverDone", { name: handedOver })}
          </div>
        )}
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-4">
        {RECRUITMENT_STAGES.map((stage, stageIdx) => {
          const inStage = visible.filter(
            (c) =>
              c.stage === stage &&
              (c.status === "active" ||
                (stage === "handover" && c.status === "handed_over"))
          );
          return (
            <div
              key={stage}
              className="flex w-[230px] shrink-0 flex-col rounded-2xl border border-line bg-page/60"
            >
              <div className="flex items-center justify-between gap-1 border-b border-line px-3 py-2.5">
                <span className="text-[11.5px] font-bold leading-tight">
                  {STAGE_ICON[stage]} {stageIdx + 1}. {tStages(stage)}
                </span>
                <span className="rounded-full bg-[#e3e8f0] px-2 py-0.5 text-[10px] font-bold text-muted">
                  {formatNumber(inStage.length, locale)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2">
                {inStage.length === 0 && (
                  <p className="px-2 py-6 text-center text-[11px] text-muted">
                    {t("emptyStage")}
                  </p>
                )}
                {inStage.map((c) => {
                  const request = requestById.get(c.hiring_request_id);
                  const name = locale === "ar" ? c.name_ar : c.name_en;
                  const aboveRange =
                    request != null && c.expected_salary > request.salary_max;
                  const offer = offers.find((o) => o.candidate_id === c.id);
                  const isRequestCard = stage === "hiring_request";
                  const done = c.status === "handed_over";

                  return (
                    <div
                      key={c.id}
                      className="rounded-xl border border-line bg-card p-2.5 shadow-sm"
                    >
                      {isRequestCard && request ? (
                        <>
                          <p className="text-[12px] font-bold leading-snug">
                            {locale === "ar"
                              ? request.job_title_ar
                              : request.job_title_en}
                          </p>
                          <p className="mt-0.5 text-[10.5px] text-muted">
                            {request.request_code} ·{" "}
                            {t("openingsShort", { count: request.openings })}
                          </p>
                          <div className="mt-2">
                            <SlaCountdown
                              hours={c.sla_hours_remaining}
                              priority={request.priority}
                              locale={locale}
                            />
                          </div>
                          <p className="mt-1.5 text-[10.5px] text-muted">
                            {t("awaitingApproval")}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span
                              className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                              style={{ backgroundColor: avatarColor(c.id) }}
                            >
                              {initials(name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-bold leading-tight">
                                {name}
                              </p>
                              <p className="truncate text-[10.5px] text-muted">
                                {request
                                  ? locale === "ar"
                                    ? request.job_title_ar
                                    : request.job_title_en
                                  : "—"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-1">
                            {c.match_pct > 0 && (
                              <Badge
                                variant={
                                  c.match_pct >= 85
                                    ? "green"
                                    : c.match_pct >= 70
                                      ? "blue"
                                      : "gray"
                                }
                              >
                                {t("match", { pct: c.match_pct })}
                              </Badge>
                            )}
                            {aboveRange && (
                              <Badge variant="yellow">
                                {t("aboveRange")}
                              </Badge>
                            )}
                            {done && (
                              <Badge variant="green">
                                {t("handedOverBadge")}
                              </Badge>
                            )}
                          </div>

                          {c.evaluation.technical !== null && (
                            <div className="mt-1.5 flex flex-wrap gap-x-2.5 text-[10px] text-muted">
                              <span>
                                {t("evalTech")}{" "}
                                <Stars score={c.evaluation.technical} />
                              </span>
                              {c.evaluation.hse !== null && (
                                <span>
                                  {t("evalHse")}{" "}
                                  <Stars score={c.evaluation.hse} />
                                </span>
                              )}
                              {c.evaluation.hr !== null && (
                                <span>
                                  {t("evalHr")}{" "}
                                  <Stars score={c.evaluation.hr} />
                                </span>
                              )}
                            </div>
                          )}

                          {!done && (
                            <div className="mt-2">
                              <SlaCountdown
                                hours={c.sla_hours_remaining}
                                priority={request?.priority ?? "P1"}
                                locale={locale}
                              />
                            </div>
                          )}

                          {stage === "offer_acceptance" && offer && (
                            <p className="mt-1.5 text-[10.5px] text-muted">
                              {t("offerSentNote", {
                                days: Math.max(
                                  0,
                                  Math.ceil(
                                    (new Date(offer.expires_at ?? "").getTime() -
                                      Date.now()) /
                                      86_400_000
                                  )
                                ),
                              })}
                            </p>
                          )}

                          {!done && (
                            <div className="mt-2 flex gap-1.5 border-t border-line pt-2">
                              {stage === "offer_issuance" ? (
                                <button
                                  onClick={() => setOfferFor(c)}
                                  className="flex-1 rounded-lg bg-primary px-2 py-1.5 text-[10.5px] font-bold text-white transition-colors hover:bg-primary-dark"
                                >
                                  {t("actions.sendOffer")}
                                </button>
                              ) : stage === "handover" ? (
                                <button
                                  onClick={() => handover(c)}
                                  className="flex-1 rounded-lg bg-green px-2 py-1.5 text-[10.5px] font-bold text-white transition-colors hover:opacity-90"
                                >
                                  {t("actions.handover")}
                                </button>
                              ) : (
                                <button
                                  onClick={() => advance(c)}
                                  className="flex-1 rounded-lg bg-primary px-2 py-1.5 text-[10.5px] font-bold text-white transition-colors hover:bg-primary-dark"
                                >
                                  {t("actions.advance")}
                                </button>
                              )}
                              <button
                                onClick={() => setRejectFor(c)}
                                className="rounded-lg border-[1.5px] border-red px-2 py-1.5 text-[10.5px] font-bold text-red transition-colors hover:bg-red-soft"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11.5px] text-muted">{t("slaFootnote")}</p>
    </>
  );
}
