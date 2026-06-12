import { getTranslations } from "next-intl/server";
import {
  CANDIDATES,
  HIRING_REQUESTS,
  JOB_OFFERS,
} from "@/lib/data/mock/recruitment";
import { PROJECTS } from "@/lib/data/mock/seed";
import { OfferResponseClient } from "./OfferResponseClient";

/**
 * Public offer acceptance page — Stage 7. The candidate opens this from
 * the tokenized link in the offer email; no sign-in required, 30-day
 * window enforced server-side once Supabase lands.
 */
export default async function OfferPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const t = await getTranslations("offerPage");

  const offer = JOB_OFFERS.find((o) => o.token === token) ?? null;
  const candidate = offer
    ? (CANDIDATES.find((c) => c.id === offer.candidate_id) ?? null)
    : null;
  const request = candidate
    ? (HIRING_REQUESTS.find((r) => r.id === candidate.hiring_request_id) ??
      null)
    : null;
  const project = request
    ? (PROJECTS.find((p) => p.id === request.project_id) ?? null)
    : null;

  if (!offer || !candidate || !request) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page p-4">
        <div className="w-full max-w-[400px] rounded-2xl border border-line bg-card p-8 text-center shadow-card">
          <div className="text-4xl">🔗</div>
          <h1 className="mt-3 text-[17px] font-bold">{t("invalid.title")}</h1>
          <p className="mt-1.5 text-[13px] text-muted">
            {t("invalid.body")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <OfferResponseClient
      offer={offer}
      candidate={candidate}
      request={request}
      project={project}
    />
  );
}
