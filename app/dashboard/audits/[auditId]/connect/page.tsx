"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAudit } from "@/hooks/use-audits";
import {
  useGoogleAdAccounts,
  useFetchGoogleData,
  useMetaAdAccounts,
  useFetchMetaData,
  useTikTokAdAccounts,
  useFetchTikTokData,
} from "@/hooks/use-connections";
import { getErrorMessage } from "@/lib/api";

type Step =
  | "connect"           // show OAuth buttons
  | "google_select"     // pick Google Ads customer
  | "meta_select"       // pick Meta ad account
  | "tiktok_select"     // pick TikTok advertiser account
  | "fetching"          // data pull in progress
  | "done";             // success

export default function AuditConnectPage() {
  const params = useParams<{ auditId: string }>();
  const searchParams = useSearchParams();

  const { data: audit, isLoading } = useAudit(params.auditId);

  const oauthPlatform = searchParams.get("platform");   // GOOGLE | META | TIKTOK
  const oauthStatus = searchParams.get("status");        // success
  const oauthError = searchParams.get("oauth_error");

  // Determine initial step from URL params
  const oauthConnected = searchParams.get("connected"); // "true" from TikTok callback

  const getInitialStep = (): Step => {
    if (oauthError) return "connect"; // always reset to connect on error so user can retry
    if (oauthStatus === "success" && oauthPlatform === "GOOGLE") return "google_select";
    if (oauthStatus === "success" && oauthPlatform === "META") return "meta_select";
    if (oauthConnected === "true" && oauthPlatform === "META") return "meta_select";
    if (oauthConnected === "true" && oauthPlatform === "TIKTOK") return "tiktok_select";
    return "connect";
  };

  const [step, setStep] = useState<Step>(getInitialStep);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedMetaAccountId, setSelectedMetaAccountId] = useState<string>("");
  const [selectedAdvertiserId, setSelectedAdvertiserId] = useState<string>("");
  const [fetchResult, setFetchResult] = useState<{ spend: number; impressions: number; clicks: number; conversions: number; currency: string | null } | null>(null);

  const googleAccounts = useGoogleAdAccounts(step === "google_select");
  const metaAccounts = useMetaAdAccounts(step === "meta_select");
  const tiktokAccounts = useTikTokAdAccounts(step === "tiktok_select");
  const fetchGoogleData = useFetchGoogleData();
  const fetchMetaData = useFetchMetaData();
  const fetchTikTokData = useFetchTikTokData();
  const effectiveCustomerId =
    selectedCustomerId || (googleAccounts.data?.length === 1 ? googleAccounts.data[0].customerId : "");
  const effectiveMetaAccountId =
    selectedMetaAccountId || (metaAccounts.data?.length === 1 ? metaAccounts.data[0].id : "");
  const effectiveAdvertiserId =
    selectedAdvertiserId || (tiktokAccounts.data?.length === 1 ? tiktokAccounts.data[0].advertiserId : "");
  const selectedGoogleAccount = googleAccounts.data?.find((account) => account.customerId === effectiveCustomerId);
  const selectedMetaAccount = metaAccounts.data?.find((account) => account.id === effectiveMetaAccountId);
  const selectedTikTokAccount = tiktokAccounts.data?.find((account) => account.advertiserId === effectiveAdvertiserId);
  const selectedCurrency =
    fetchResult?.currency ||
    selectedGoogleAccount?.currencyCode ||
    selectedMetaAccount?.currency ||
    selectedTikTokAccount?.currency ||
    null;
  const formatAccountMoney = (value: number) => {
    const amount = value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return selectedCurrency ? `${selectedCurrency} ${amount}` : amount;
  };

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showMetaPermissions, setShowMetaPermissions] = useState(false);

  const handleFetchGoogle = async () => {
    if (!effectiveCustomerId) return;
    setFetchError(null);
    setStep("fetching");
    try {
      const result = await fetchGoogleData.mutateAsync({
        auditId: params.auditId,
        customerId: effectiveCustomerId,
      });
      setFetchResult({ ...result.summary, currency: result.summary.currency || result.currency });
      setStep("done");
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error("[Connect] Google data fetch failed:", message);
      setFetchError(message);
      setStep("google_select");
    }
  };

  const handleFetchTikTok = async () => {
    if (!effectiveAdvertiserId) return;
    setFetchError(null);
    setStep("fetching");
    try {
      const result = await fetchTikTokData.mutateAsync({
        auditId: params.auditId,
        advertiserId: effectiveAdvertiserId,
      });
      setFetchResult({ ...result.summary, currency: result.summary.currency || result.currency });
      setStep("done");
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error("[Connect] TikTok data fetch failed:", message);
      setFetchError(message);
      setStep("tiktok_select");
    }
  };

  const handleFetchMeta = async () => {
    if (!effectiveMetaAccountId) return;
    setFetchError(null);
    setStep("fetching");
    try {
      const result = await fetchMetaData.mutateAsync({
        auditId: params.auditId,
        externalAdAccountId: effectiveMetaAccountId,
      });
      setFetchResult({ ...result.summary, currency: result.summary.currency || result.currency });
      setStep("done");
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error("[Connect] Meta data fetch failed:", message);
      setFetchError(message);
      setStep("meta_select");
    }
  };

  if (isLoading) {
    return (
      <div className="aa-dash flex min-h-screen items-center justify-center">
        <div className="ambient" />
        <div className="flow-hint relative z-10 text-sm">Loading...</div>
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
    <div className="aa-dash min-h-screen">
      <div className="ambient" />
      <nav className="flow-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flow-brand">
            <BrandLogo size={34} />
          </Link>
          <Link
            href="/dashboard"
            className="flow-back"
          >
            Back to dashboard
          </Link>
        </div>
      </nav>

      <main className="flow-main mx-auto max-w-2xl px-6 py-10">
        <div className="flow-card p-8">

          {/* ── OAuth Error Banner ──────────────────────────────────── */}
          {oauthError && (
            <div className="flow-error mb-6 rounded-md px-4 py-3 text-sm">
              Connection failed: {decodeURIComponent(oauthError)}. Please try again.
            </div>
          )}

          {/* ── Step: Connect (OAuth buttons) ──────────────────────── */}
          {step === "connect" && (
            <>
              <p className="flow-eyebrow text-xs font-medium uppercase tracking-wide">
                Step 1 of 2
              </p>
              <h1 className="flow-h1 mt-2 text-2xl font-semibold">
                Connect your ad account
              </h1>
              <p className="flow-body mt-2 text-sm leading-6">
                Authorize access so we can pull your campaigns, ad groups, and performance data.
              </p>

              <div className="mt-8 grid gap-4">
                {hasGoogle && (
                  <a
                    href={`${apiBase}/api/platform-connections/google/connect?auditId=${params.auditId}`}
                    className="flow-white-btn flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-base font-semibold shadow-sm transition-all hover:shadow-md"
                  >
                    <GoogleLogo />
                    Connect Google Ads
                  </a>
                )}

                {hasMeta && (
                  <button
                    type="button"
                    onClick={() => setShowMetaPermissions(true)}
                    className="flex items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:shadow-md"
                  >
                    <MetaLogo />
                    Connect Meta Ads
                  </button>
                )}

                {hasTikTok && (
                  <a
                    href={`${apiBase}/api/platform-connections/tiktok/connect?auditId=${params.auditId}`}
                    className="flex items-center justify-center gap-3 rounded-xl border border-[rgba(255,255,255,0.22)] bg-black px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:shadow-md"
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
                <span className="flow-ok-badge flex h-6 w-6 items-center justify-center rounded-full text-xs">✓</span>
                <span className="flow-ok-text text-sm font-medium">Google account authorized</span>
              </div>
              <p className="flow-eyebrow mt-1 text-xs font-medium uppercase tracking-wide">
                Step 2 of 2
              </p>
              <h1 className="flow-h1 mt-2 text-2xl font-semibold">
                Select Google Ads account
              </h1>
              <p className="flow-body mt-2 text-sm leading-6">
                Choose the ad account to pull data from for this audit.
              </p>

              {fetchError && (
                <div className="flow-error mt-6 rounded-md px-4 py-3 text-sm">
                  <p className="font-medium">Data fetch failed</p>
                  <p className="mt-1 font-mono text-xs break-all">{fetchError}</p>
                </div>
              )}

              {googleAccounts.isLoading && (
                <div className="flow-hint mt-8 flex items-center gap-3 text-sm">
                  <Spinner />
                  Loading your Google Ads accounts...
                </div>
              )}

              {googleAccounts.isError && (
                <div className="flow-error mt-6 rounded-md px-4 py-3 text-sm">
                  <p className="font-medium">Failed to load Google Ads accounts</p>
                  <p className="mt-1 font-mono text-xs break-all">
                    {getErrorMessage(googleAccounts.error)}
                  </p>
                </div>
              )}

              {googleAccounts.data && googleAccounts.data.length === 0 && (
                <div className="flow-warn mt-6 rounded-md px-4 py-3 text-sm">
                  No Google Ads accounts found for this Google account. Make sure you have access to at least one account.
                </div>
              )}

              {googleAccounts.data && googleAccounts.data.length > 0 && (
                <div className="mt-8 space-y-3">
                  {googleAccounts.data.map((account) => (
                    <label
                      key={account.customerId}
                      className={`flow-option flex cursor-pointer items-start gap-3 p-4 ${effectiveCustomerId === account.customerId ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="customerId"
                        value={account.customerId}
                        checked={effectiveCustomerId === account.customerId}
                        onChange={() => setSelectedCustomerId(account.customerId)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="flow-option-title text-sm font-semibold">{account.name}</p>
                        <p className="flow-hint text-xs">
                          ID: {account.customerId}
                          {account.currencyCode ? ` · ${account.currencyCode}` : ""}
                          {account.isManager ? " · Manager account" : ""}
                        </p>
                      </div>
                    </label>
                  ))}

                  {selectedGoogleAccount?.currencyCode && (
                    <div className="flow-note-teal rounded-md px-4 py-3 text-sm">
                      Currency detected: <span className="font-semibold">{selectedGoogleAccount.currencyCode}</span>. Spend, benchmarks, and recommendations will use this account currency.
                    </div>
                  )}

                  <button
                    onClick={handleFetchGoogle}
                    disabled={!effectiveCustomerId}
                    className="flow-cta mt-4 w-full px-6 py-3 text-sm"
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
                <span className="flow-ok-badge flex h-6 w-6 items-center justify-center rounded-full text-xs">✓</span>
                <span className="flow-ok-text text-sm font-medium">Meta account authorized</span>
              </div>
              <p className="flow-eyebrow mt-1 text-xs font-medium uppercase tracking-wide">
                Step 2 of 2
              </p>
              <h1 className="flow-h1 mt-2 text-2xl font-semibold">
                Select Meta ad account
              </h1>
              <p className="flow-body mt-2 text-sm leading-6">
                Choose the ad account to pull data from for this audit.
              </p>

              {metaAccounts.isLoading && (
                <div className="flow-hint mt-8 flex items-center gap-3 text-sm">
                  <Spinner />
                  Loading your Meta ad accounts...
                </div>
              )}

              {metaAccounts.isError && (
                <div className="flow-error mt-6 rounded-md px-4 py-3 text-sm">
                  <p className="font-medium">Failed to load Meta ad accounts</p>
                  <p className="mt-1 font-mono text-xs break-all">
                    {getErrorMessage(metaAccounts.error)}
                  </p>
                </div>
              )}

              {fetchError && (
                <div className="flow-error mt-6 rounded-md px-4 py-3 text-sm">
                  <p className="font-medium">Data fetch failed</p>
                  <p className="mt-1 font-mono text-xs break-all">{fetchError}</p>
                </div>
              )}

              {metaAccounts.data && metaAccounts.data.length === 0 && (
                <div className="flow-warn mt-6 rounded-md px-4 py-3 text-sm">
                  No Meta ad accounts found. Make sure this Facebook user has access to at least one ad account in Business Manager.
                </div>
              )}

              {metaAccounts.data && metaAccounts.data.length > 0 && (
                <div className="mt-8 space-y-3">
                  {metaAccounts.data.map((account) => (
                    <label
                      key={account.id}
                      className={`flow-option flex cursor-pointer items-start gap-3 p-4 ${effectiveMetaAccountId === account.id ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="metaAccountId"
                        value={account.id}
                        checked={effectiveMetaAccountId === account.id}
                        onChange={() => setSelectedMetaAccountId(account.id)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="flow-option-title text-sm font-semibold">{account.name}</p>
                        <p className="flow-hint text-xs">
                          ID: {account.accountId}
                          {account.currency ? ` · ${account.currency}` : ""}
                          {account.businessName ? ` · ${account.businessName}` : ""}
                        </p>
                      </div>
                    </label>
                  ))}

                  {selectedMetaAccount?.currency && (
                    <div className="flow-note-teal rounded-md px-4 py-3 text-sm">
                      Currency detected: <span className="font-semibold">{selectedMetaAccount.currency}</span>. Spend, benchmarks, and recommendations will use this account currency.
                    </div>
                  )}

                  <button
                    onClick={handleFetchMeta}
                    disabled={!effectiveMetaAccountId}
                    className="flow-cta mt-4 w-full px-6 py-3 text-sm"
                  >
                    Pull Meta Ads data
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Step: TikTok account picker ────────────────────────── */}
          {step === "tiktok_select" && (
            <>
              <div className="flex items-center gap-2">
                <span className="flow-ok-badge flex h-6 w-6 items-center justify-center rounded-full text-xs">✓</span>
                <span className="flow-ok-text text-sm font-medium">TikTok account authorized</span>
              </div>
              <p className="flow-eyebrow mt-1 text-xs font-medium uppercase tracking-wide">
                Step 2 of 2
              </p>
              <h1 className="flow-h1 mt-2 text-2xl font-semibold">
                Select TikTok Ads account
              </h1>
              <p className="flow-body mt-2 text-sm leading-6">
                Choose the advertiser account to pull data from for this audit.
              </p>

              {fetchError && (
                <div className="flow-error mt-6 rounded-md px-4 py-3 text-sm">
                  <p className="font-medium">Data fetch failed</p>
                  <p className="mt-1 font-mono text-xs break-all">{fetchError}</p>
                </div>
              )}

              {tiktokAccounts.isLoading && (
                <div className="flow-hint mt-8 flex items-center gap-3 text-sm">
                  <Spinner />
                  Loading your TikTok advertiser accounts...
                </div>
              )}

              {tiktokAccounts.isError && (
                <div className="flow-error mt-6 rounded-md px-4 py-3 text-sm">
                  <p className="font-medium">Failed to load TikTok advertiser accounts</p>
                  <p className="mt-1 font-mono text-xs break-all">
                    {getErrorMessage(tiktokAccounts.error)}
                  </p>
                </div>
              )}

              {tiktokAccounts.data && tiktokAccounts.data.length === 0 && (
                <div className="flow-warn mt-6 rounded-md px-4 py-3 text-sm">
                  No TikTok advertiser accounts found. Make sure you have access to at least one account.
                </div>
              )}

              {tiktokAccounts.data && tiktokAccounts.data.length > 0 && (
                <div className="mt-8 space-y-3">
                  {tiktokAccounts.data.map((account) => (
                    <label
                      key={account.advertiserId}
                      className={`flow-option flex cursor-pointer items-start gap-3 p-4 ${effectiveAdvertiserId === account.advertiserId ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="advertiserId"
                        value={account.advertiserId}
                        checked={effectiveAdvertiserId === account.advertiserId}
                        onChange={() => setSelectedAdvertiserId(account.advertiserId)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="flow-option-title text-sm font-semibold">{account.name}</p>
                        <p className="flow-hint text-xs">
                          ID: {account.advertiserId}
                          {account.currency ? ` · ${account.currency}` : ""}
                          {account.timezone ? ` · ${account.timezone}` : ""}
                        </p>
                      </div>
                    </label>
                  ))}

                  {selectedTikTokAccount?.currency && (
                    <div className="flow-note-teal rounded-md px-4 py-3 text-sm">
                      Currency detected: <span className="font-semibold">{selectedTikTokAccount.currency}</span>. Spend, benchmarks, and recommendations will use this account currency.
                    </div>
                  )}

                  <button
                    onClick={handleFetchTikTok}
                    disabled={!effectiveAdvertiserId}
                    className="flow-cta mt-4 w-full px-6 py-3 text-sm"
                  >
                    Pull TikTok Ads data
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Step: Fetching ──────────────────────────────────────── */}
          {step === "fetching" && (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="flow-spinner-lg h-14 w-14 animate-spin rounded-full" />
              <h2 className="flow-h1 mt-6 text-lg font-semibold">Pulling your ad data…</h2>
              <p className="flow-body mt-2 text-sm">
                Fetching campaigns, ad groups, and ads. This may take 10–30 seconds.
              </p>
            </div>
          )}

          {/* ── Step: Done ──────────────────────────────────────────── */}
          {step === "done" && fetchResult && (
            <>
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flow-ok-badge flex h-14 w-14 items-center justify-center rounded-full text-2xl">
                  ✓
                </div>
                <h2 className="flow-h1 mt-4 text-xl font-semibold">Data pulled successfully</h2>
                <p className="flow-body mt-2 text-sm">
                  Your ad account data has been imported and is ready for audit.
                </p>
              </div>

              <div className="flow-stats mt-4 grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                <Stat label="Spend" value={formatAccountMoney(fetchResult.spend)} />
                <Stat label="Impressions" value={fetchResult.impressions.toLocaleString()} />
                <Stat label="Clicks" value={fetchResult.clicks.toLocaleString()} />
                <Stat label="Conversions" value={(fetchResult.conversions ?? 0).toLocaleString()} />
              </div>

              <div className="mt-6">
                <Link
                  href={`/dashboard/audits/${params.auditId}/auditing`}
                  className="flow-cta block w-full px-6 py-3 text-center text-sm"
                >
                  ✦ Start Audit →
                </Link>
                <Link
                  href="/dashboard"
                  className="flow-hint mt-3 block text-center text-sm hover:underline"
                >
                  Save and return to dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      {showMetaPermissions && (
        <MetaPermissionsModal
          connectUrl={`${apiBase}/api/platform-connections/meta/connect?auditId=${params.auditId}`}
          onCancel={() => setShowMetaPermissions(false)}
        />
      )}
    </div>
  );
}

// ── Small components ───────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="flow-hint text-xs font-medium">{label}</p>
      <p className="flow-option-title mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

function MetaPermissionsModal({ connectUrl, onCancel }: { connectUrl: string; onCancel: () => void }) {
  return (
    <div
      className="flow-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onCancel}
    >
      <div
        className="flow-modal w-full max-w-md rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <MetaLogo />
          <h2 className="flow-h1 text-lg font-semibold">Permissions we&apos;ll request</h2>
        </div>
        <p className="flow-body mt-3 text-sm leading-6">
          Facebook will ask you to approve access for AdAdviser. Here&apos;s exactly what we ask for and why:
        </p>

        <ul className="mt-4 space-y-3">
          <li className="flow-perm-item rounded-xl p-3">
            <p className="flow-option-title text-sm font-semibold">ads_read</p>
            <p className="flow-hint mt-1 text-xs leading-5">
              Lets us view your campaigns, ad sets, ads, and performance metrics (spend, clicks,
              conversions) so we can analyze them. We cannot create, edit, pause, or spend from your
              account with this permission.
            </p>
          </li>
          <li className="flow-perm-item rounded-xl p-3">
            <p className="flow-option-title text-sm font-semibold">business_management</p>
            <p className="flow-hint mt-1 text-xs leading-5">
              Lets us see which ad accounts you have access to in Meta Business Manager, so you can
              pick the right one on the next screen.
            </p>
          </li>
        </ul>

        <div className="flow-note-teal mt-4 rounded-md px-4 py-3 text-xs leading-5">
          Read-only access. We never post, edit, or spend on your behalf, and you can revoke access
          anytime from your Facebook Business Integrations settings.
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flow-back flex-1 rounded-xl px-4 py-3 text-center text-sm"
          >
            Cancel
          </button>
          <a href={connectUrl} className="flow-cta flex-1 px-4 py-3 text-center text-sm">
            Continue to Facebook
          </a>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flow-spinner h-4 w-4 flex-shrink-0 animate-spin rounded-full" />
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
