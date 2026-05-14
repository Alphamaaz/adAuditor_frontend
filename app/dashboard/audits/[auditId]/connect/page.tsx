"use client";

import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAudit } from "@/hooks/use-audits";
import {
  useGoogleAdAccounts,
  useFetchGoogleData,
  useMetaAdAccounts,
  useFetchMetaData,
} from "@/hooks/use-connections";
import { getErrorMessage } from "@/lib/api";

type Step =
  | "connect"           // show OAuth buttons
  | "google_select"     // pick Google Ads customer
  | "meta_select"       // pick Meta ad account
  | "fetching"          // data pull in progress
  | "done";             // success

export default function AuditConnectPage() {
  const params = useParams<{ auditId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: audit, isLoading } = useAudit(params.auditId);

  const oauthPlatform = searchParams.get("platform");   // GOOGLE | META | TIKTOK
  const oauthStatus = searchParams.get("status");        // success
  const oauthError = searchParams.get("oauth_error");

  // Determine initial step from URL params
  const getInitialStep = (): Step => {
    if (oauthStatus === "success" && oauthPlatform === "GOOGLE") return "google_select";
    if (oauthStatus === "success" && oauthPlatform === "META") return "meta_select";
    return "connect";
  };

  const [step, setStep] = useState<Step>(getInitialStep);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedMetaAccountId, setSelectedMetaAccountId] = useState<string>("");
  const [fetchResult, setFetchResult] = useState<{ spend: number; impressions: number; clicks: number; conversions: number; currency: string | null } | null>(null);

  const googleAccounts = useGoogleAdAccounts(step === "google_select");
  const metaAccounts = useMetaAdAccounts(step === "meta_select");
  const fetchGoogleData = useFetchGoogleData();
  const fetchMetaData = useFetchMetaData();

  // Auto-select if only one Google account
  useEffect(() => {
    if (googleAccounts.data?.length === 1 && !selectedCustomerId) {
      setSelectedCustomerId(googleAccounts.data[0].customerId);
    }
  }, [googleAccounts.data, selectedCustomerId]);

  // Auto-select if only one Meta account
  useEffect(() => {
    if (metaAccounts.data?.length === 1 && !selectedMetaAccountId) {
      setSelectedMetaAccountId(metaAccounts.data[0].id);
    }
  }, [metaAccounts.data, selectedMetaAccountId]);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleFetchGoogle = async () => {
    if (!selectedCustomerId) return;
    setFetchError(null);
    setStep("fetching");
    try {
      const result = await fetchGoogleData.mutateAsync({
        auditId: params.auditId,
        customerId: selectedCustomerId,
      });
      setFetchResult(result.summary);
      setStep("done");
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error("[Connect] Google data fetch failed:", message);
      setFetchError(message);
      setStep("google_select");
    }
  };

  const handleFetchMeta = async () => {
    if (!selectedMetaAccountId) return;
    setStep("fetching");
    try {
      const result = await fetchMetaData.mutateAsync({
        auditId: params.auditId,
        externalAdAccountId: selectedMetaAccountId,
      });
      setFetchResult(result.summary);
      setStep("done");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[Connect] Meta data fetch failed:", message);
      setStep("meta_select");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef]">
        <div className="text-sm text-[#6b7280]">Loading...</div>
      </div>
    );
  }

  if (!audit) return null;

  const platforms = audit.selectedPlatforms || [];
  const hasMeta = platforms.includes("META");
  const hasTikTok = platforms.includes("TIKTOK");
  const hasGoogle = platforms.includes("GOOGLE");

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <nav className="border-b border-[#e5ddd0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-[#171717]">
            AdAuditor Pro
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef]"
          >
            Back to dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-lg border border-[#e5ddd0] bg-white p-8">

          {/* ── OAuth Error Banner ──────────────────────────────────── */}
          {oauthError && step === "connect" && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Connection failed: {decodeURIComponent(oauthError)}. Please try again.
            </div>
          )}

          {/* ── Step: Connect (OAuth buttons) ──────────────────────── */}
          {step === "connect" && (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                Step 1 of 2
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[#171717]">
                Connect your ad account
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                Authorize access so we can pull your campaigns, ad groups, and performance data.
              </p>

              <div className="mt-8 grid gap-4">
                {hasGoogle && (
                  <a
                    href={`${apiBase}/api/platform-connections/google/connect?auditId=${params.auditId}`}
                    className="flex items-center justify-center gap-3 rounded-xl border border-[#e5ddd0] bg-white px-6 py-4 text-base font-semibold text-[#171717] shadow-sm transition-all hover:border-[#d1cac0] hover:shadow-md"
                  >
                    <GoogleLogo />
                    Connect Google Ads
                  </a>
                )}

                {hasMeta && (
                  <a
                    href={`${apiBase}/api/platform-connections/meta/connect?auditId=${params.auditId}`}
                    className="flex items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:shadow-md"
                  >
                    <MetaLogo />
                    Connect Meta Ads
                  </a>
                )}

                {hasTikTok && (
                  <a
                    href={`${apiBase}/api/platform-connections/tiktok/connect?auditId=${params.auditId}`}
                    className="flex items-center justify-center gap-3 rounded-xl bg-black px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:shadow-md"
                  >
                    <TikTokLogo />
                    Connect TikTok Ads
                  </a>
                )}
              </div>
            </>
          )}

          {/* ── Step: Google account picker ─────────────────────────── */}
          {step === "google_select" && (
            <>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-700">✓</span>
                <span className="text-sm font-medium text-green-700">Google account authorized</span>
              </div>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                Step 2 of 2
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[#171717]">
                Select Google Ads account
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                Choose the ad account to pull data from for this audit.
              </p>

              {fetchError && (
                <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <p className="font-medium">Data fetch failed</p>
                  <p className="mt-1 font-mono text-xs break-all">{fetchError}</p>
                </div>
              )}

              {googleAccounts.isLoading && (
                <div className="mt-8 flex items-center gap-3 text-sm text-[#6b7280]">
                  <Spinner />
                  Loading your Google Ads accounts...
                </div>
              )}

              {googleAccounts.isError && (
                <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <p className="font-medium">Failed to load Google Ads accounts</p>
                  <p className="mt-1 font-mono text-xs break-all">
                    {getErrorMessage(googleAccounts.error)}
                  </p>
                </div>
              )}

              {googleAccounts.data && googleAccounts.data.length === 0 && (
                <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  No Google Ads accounts found for this Google account. Make sure you have access to at least one account.
                </div>
              )}

              {googleAccounts.data && googleAccounts.data.length > 0 && (
                <div className="mt-8 space-y-3">
                  {googleAccounts.data.map((account) => (
                    <label
                      key={account.customerId}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                        selectedCustomerId === account.customerId
                          ? "border-[#171717] bg-[#f7f4ef]"
                          : "border-[#e5ddd0] hover:border-[#d1cac0]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="customerId"
                        value={account.customerId}
                        checked={selectedCustomerId === account.customerId}
                        onChange={() => setSelectedCustomerId(account.customerId)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#171717]">{account.name}</p>
                        <p className="text-xs text-[#6b7280]">
                          ID: {account.customerId}
                          {account.currencyCode ? ` · ${account.currencyCode}` : ""}
                          {account.isManager ? " · Manager account" : ""}
                        </p>
                      </div>
                    </label>
                  ))}

                  <button
                    onClick={handleFetchGoogle}
                    disabled={!selectedCustomerId}
                    className="mt-4 w-full rounded-xl bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2d2d2d] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Pull Google Ads data
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Step: Meta account picker ───────────────────────────── */}
          {step === "meta_select" && (
            <>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-700">✓</span>
                <span className="text-sm font-medium text-green-700">Meta account authorized</span>
              </div>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                Step 2 of 2
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[#171717]">
                Select Meta ad account
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                Choose the ad account to pull data from for this audit.
              </p>

              {metaAccounts.isLoading && (
                <div className="mt-8 flex items-center gap-3 text-sm text-[#6b7280]">
                  <Spinner />
                  Loading your Meta ad accounts...
                </div>
              )}

              {metaAccounts.isError && (
                <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Failed to load Meta ad accounts.
                </div>
              )}

              {metaAccounts.data && metaAccounts.data.length > 0 && (
                <div className="mt-8 space-y-3">
                  {metaAccounts.data.map((account) => (
                    <label
                      key={account.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                        selectedMetaAccountId === account.id
                          ? "border-[#171717] bg-[#f7f4ef]"
                          : "border-[#e5ddd0] hover:border-[#d1cac0]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="metaAccountId"
                        value={account.id}
                        checked={selectedMetaAccountId === account.id}
                        onChange={() => setSelectedMetaAccountId(account.id)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#171717]">{account.name}</p>
                        <p className="text-xs text-[#6b7280]">
                          ID: {account.accountId}
                          {account.currency ? ` · ${account.currency}` : ""}
                          {account.businessName ? ` · ${account.businessName}` : ""}
                        </p>
                      </div>
                    </label>
                  ))}

                  <button
                    onClick={handleFetchMeta}
                    disabled={!selectedMetaAccountId}
                    className="mt-4 w-full rounded-xl bg-[#1877F2] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1660d0] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Pull Meta Ads data
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Step: Fetching ──────────────────────────────────────── */}
          {step === "fetching" && (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#e5ddd0] border-t-[#171717] animate-spin" />
              <h2 className="mt-6 text-lg font-semibold text-[#171717]">Pulling your ad data…</h2>
              <p className="mt-2 text-sm text-[#6b7280]">
                Fetching campaigns, ad groups, and ads. This may take 10–30 seconds.
              </p>
            </div>
          )}

          {/* ── Step: Done ──────────────────────────────────────────── */}
          {step === "done" && fetchResult && (
            <>
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
                  ✓
                </div>
                <h2 className="mt-4 text-xl font-semibold text-[#171717]">Data pulled successfully</h2>
                <p className="mt-2 text-sm text-[#6b7280]">
                  Your ad account data has been imported and is ready for audit.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-[#e5ddd0] bg-[#f7f4ef] p-4 sm:grid-cols-4">
                <Stat label="Spend" value={fetchResult.currency
                  ? `${fetchResult.currency} ${fetchResult.spend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  : `$${fetchResult.spend.toLocaleString()}`}
                />
                <Stat label="Impressions" value={fetchResult.impressions.toLocaleString()} />
                <Stat label="Clicks" value={fetchResult.clicks.toLocaleString()} />
                <Stat label="Conversions" value={(fetchResult.conversions ?? 0).toLocaleString()} />
              </div>

              <div className="mt-6 flex gap-3">
                <Link
                  href={`/dashboard/audits/${params.auditId}/intake`}
                  className="flex-1 rounded-xl bg-[#171717] px-6 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-[#2d2d2d]"
                >
                  Continue to intake form →
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-[#e5ddd0] px-4 py-3 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef]"
                >
                  Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Small components ───────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-medium text-[#6b7280]">{label}</p>
      <p className="mt-1 text-base font-semibold text-[#171717]">{value}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-[#e5ddd0] border-t-[#171717]" />
  );
}

function GoogleLogo() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MetaLogo() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokLogo() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1 .01 2.62.02 5.24.02 7.86 0 2.45-1.02 4.96-2.9 6.55-1.59 1.34-3.77 1.95-5.86 1.83-2.31-.13-4.59-1.41-5.78-3.41-1.39-2.35-1.35-5.54.4-7.7 1.14-1.41 2.92-2.36 4.74-2.43V12.3c-1 .07-2.01.53-2.67 1.3-.87 1.03-.94 2.58-.33 3.75.5 1 1.6 1.74 2.74 1.81 1.2.06 2.45-.4 3.19-1.36.63-.82.72-1.92.71-2.91-.01-2.92-.02-5.84-.03-8.76v-.12c-.01-1.33-.02-2.65-.03-3.98l.13-.02z" />
    </svg>
  );
}
