"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Step = "email" | "otp";

export default function LoginPage() {
  const t = useTranslations("login");
  const [step, setStep] = useState<Step>("email");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return;
    setLoading(true);
    // TODO: replace with real Supabase OTP call:
    // const { error } = await supabase.auth.signInWithOtp({ email: contact })
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setStep("otp");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    // TODO: replace with real Supabase verify call:
    // const { error } = await supabase.auth.verifyOtp({ email: contact, token: otp, type: "email" })
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    // After real auth: router.push("/dashboard")
    alert("Auth scaffold — connect Supabase to enable real login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple text-2xl font-black text-white shadow-lg">
            A
          </div>
          <h1 className="text-[22px] font-bold text-ink">{t("title")}</h1>
          <p className="mt-1 text-[13px] text-muted">{t("subtitle")}</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-7 shadow-sm">
          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-muted">
                  {t("emailLabel")}
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-line bg-page px-4 py-2.5 text-[13px] text-ink placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !contact.trim()}
                className="w-full rounded-lg bg-primary py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? t("loading") : t("sendOtp")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-center text-[13px] text-muted">
                {t("otpHint", { contact })}
              </p>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-muted">
                  {t("otpLabel")}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder={t("otpPlaceholder")}
                  inputMode="numeric"
                  maxLength={6}
                  required
                  className="w-full rounded-lg border border-line bg-page px-4 py-2.5 text-center text-[18px] font-bold tracking-[0.3em] text-ink placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full rounded-lg bg-primary py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? t("loading") : t("verify")}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); }}
                className="w-full text-center text-[12px] font-semibold text-muted hover:text-ink"
              >
                ← {t("back")}
              </button>
            </form>
          )}

          <p className="mt-5 rounded-lg bg-yellow-soft px-3 py-2 text-center text-[11px] text-yellow">
            ⚙️ {t("envNote")}
          </p>
        </div>
      </div>
    </main>
  );
}
