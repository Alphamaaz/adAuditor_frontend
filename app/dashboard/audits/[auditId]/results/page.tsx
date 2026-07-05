"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAudit,
  useDownloadPdfReport,
  useGenerateAiReport,
  useGeneratePdfReport,
  usePremiumAuditReportHtml,
  useRunAudit,
} from "@/hooks/use-audits";
import { useMyPlanAndUsage } from "@/hooks/use-plans";
import { getErrorMessage } from "@/lib/api";
import type {
  Audit,
  AiReport,
  Platform,
  RuleFinding,
  UploadReadiness,
} from "@/lib/audits";
import { PLATFORM_LABELS } from "@/lib/platform-questionnaire";

const severityOrder: Record<RuleFinding["severity"], number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const severityStyles: Record<RuleFinding["severity"], string> = {
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200",
  LOW: "bg-slate-50 text-slate-700 border-slate-200",
};

type SortMode = "severity" | "platform" | "category";

const scoreLabel = (score: number) => {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
};

const parseMoneyMagnitude = (value: unknown): number => {
  if (typeof value !== "string") return 0;
  const match = value.match(/(?:\$|[A-Z]{3})\s?([\d,]+(?:\.\d+)?)/i);
  if (!match) return 0;
  const n = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const confidenceRank = (value: unknown): number => {
  const v = String(value || "").toLowerCase();
  if (v === "high") return 3;
  if (v === "medium") return 2;
  if (v === "low") return 1;
  return 2;
};

const easeRank = (value: unknown): number => {
  const v = String(value || "").toLowerCase();
  if (v === "easy") return 3;
  if (v === "medium") return 2;
  if (v === "hard") return 1;
  return 2;
};

const evidenceImpact = (evidence: Record<string, unknown> | null): number => {
  const raw =
    evidence?.estimatedWaste ??
    evidence?.wastedSpend ??
    evidence?.lossMakingSpend ??
    evidence?.estimatedWasteFormatted ??
    evidence?.wastedSpendFormatted;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  return parseMoneyMagnitude(raw);
};

const formatEvidenceValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined) return "Not available";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const evidenceEntries = (evidence: unknown) => {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    return [];
  }

  return Object.entries(evidence as Record<string, unknown>);
};

/**
 * Pull the highest-signal evidence values into labeled chips so the most
 * important facts (waste, confidence, driver, segment) are visible without
 * scanning the raw evidence grid. Returns [] when none present.
 */
const evidenceHighlights = (evidence: unknown): Array<{ label: string; value: string }> => {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) return [];
  const e = evidence as Record<string, unknown>;
  const out: Array<{ label: string; value: string }> = [];
  const currency = typeof e.currency === "string" ? e.currency : "USD";
  const money = (v: unknown, formatted?: unknown) => {
    if (typeof formatted === "string" && formatted.trim()) return formatted;
    if (typeof v !== "number") return null;
    const amount = Math.round(v).toLocaleString("en-US");
    return `${currency.toUpperCase()} ${amount}`;
  };

  const waste = e.estimatedWaste ?? e.wastedSpend ?? e.lossMakingSpend;
  const wasteFormatted =
    e.estimatedWasteFormatted ?? e.wastedSpendFormatted ?? e.lossMakingSpendFormatted;
  if (money(waste, wasteFormatted)) {
    out.push({ label: "Est. waste", value: money(waste, wasteFormatted) as string });
  }
  if (e.dominantDriver) out.push({ label: "Driver", value: String(e.dominantDriver).replace(/_/g, " ") });
  if (e.dimension && e.segment) out.push({ label: "Segment", value: `${e.segment} (${e.dimension})` });
  if (typeof e.ctrGapPct === "number") out.push({ label: "CTR gap", value: `${e.ctrGapPct}%` });
  if (typeof e.cpaDeltaPct === "number") out.push({ label: "CPA change", value: `${e.cpaDeltaPct}%` });
  if (e.confidence) out.push({ label: "Confidence", value: String(e.confidence) });
  if (e.sampleNote && out.length < 4) out.push({ label: "Sample", value: String(e.sampleNote) });
  return out.slice(0, 5);
};

export default function AuditResultsPage() {
  const params = useParams<{ auditId: string }>();
  const auditId = params.auditId;
  const { data: audit, isLoading } = useAudit(auditId);
  const { data: planAndUsage } = useMyPlanAndUsage();
  const aiNarrativeMode = planAndUsage?.capabilities?.aiNarrative;
  const runAudit = useRunAudit(auditId);
  const generateAiReport = useGenerateAiReport(auditId);
  const generatePdfReport = useGeneratePdfReport(auditId);
  const downloadPdfReport = useDownloadPdfReport();
  const premiumReport = usePremiumAuditReportHtml(
    auditId,
    audit?.status === "COMPLETED"
  );
  const [sortMode, setSortMode] = useState<SortMode>("severity");
  const [aiError, setAiError] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [pdfMessage, setPdfMessage] = useState("");
  const reportFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [reportFrameHeight, setReportFrameHeight] = useState(1200);

  const findings = useMemo(() => {
    const items = [...(audit?.ruleFindings || [])];

    return items.sort((left, right) => {
      if (sortMode === "platform") {
        return String(left.platform || "").localeCompare(String(right.platform || ""));
      }

      if (sortMode === "category") {
        return left.category.localeCompare(right.category);
      }

      const leftEvidence = left.evidence as Record<string, unknown> | null;
      const rightEvidence = right.evidence as Record<string, unknown> | null;
      const rightImpact =
        parseMoneyMagnitude(right.estimatedImpact) || evidenceImpact(rightEvidence);
      const leftImpact =
        parseMoneyMagnitude(left.estimatedImpact) || evidenceImpact(leftEvidence);
      return (
        rightImpact - leftImpact ||
        confidenceRank(rightEvidence?.confidence) - confidenceRank(leftEvidence?.confidence) ||
        easeRank(rightEvidence?.easeOfImplementation) - easeRank(leftEvidence?.easeOfImplementation) ||
        severityOrder[right.severity] - severityOrder[left.severity]
      );
    });
  }, [audit?.ruleFindings, sortMode]);

  const scores = audit?.categoryScores as
    | {
        overall?: number;
        platforms?: Partial<
          Record<
            Platform,
            {
              score: number;
              categories: Record<string, number>;
              findingCount: number;
            }
          >
        >;
      }
    | null
    | undefined;
  const healthScore = audit?.healthScore ?? scores?.overall ?? 0;
  const topPriorities = audit?.aiReport?.output?.topPriorities || [];
  const quickWins = audit?.aiReport?.output?.quickWins || [];
  const executiveSummary = audit?.aiReport?.output?.executiveSummary || [];
  const confidenceNotes = audit?.aiReport?.output?.confidenceNotes || [];
  const clientReadyRecommendations =
    audit?.aiReport?.output?.clientReadyRecommendations || [];
  // v2 evidence-packet sections — all optional; absent on legacy/first audits.
  const aiOutput = audit?.aiReport?.output;
  const segmentInsights = aiOutput?.segmentInsights || [];
  const comparisonInsights = aiOutput?.comparisonInsights || [];
  const memoryInsights = aiOutput?.memoryInsights || [];
  const risksAndAssumptions = aiOutput?.risksAndAssumptions || [];
  const opportunitySummary = aiOutput?.opportunitySummary;
  const findingAnalyses = aiOutput?.findingAnalyses || [];
  const hypothesisAnalyses = aiOutput?.hypothesisAnalyses || [];
  const benchmarkComparisons = aiOutput?.benchmarkComparisons || [];
  const dataConfidenceSummary = aiOutput?.dataConfidenceSummary || null;
  const narrativeVersion = aiOutput?.auditNarrativeVersion || null;
  const hasDeeperInsights =
    segmentInsights.length > 0 ||
    comparisonInsights.length > 0 ||
    memoryInsights.length > 0;
  const latestPdfReport = audit?.pdfReports?.[0];
  const severityCounts = useMemo(() => {
    return (audit?.ruleFindings || []).reduce(
      (counts, finding) => ({
        ...counts,
        [finding.severity]: counts[finding.severity] + 1,
      }),
      {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
      } as Record<RuleFinding["severity"], number>
    );
  }, [audit?.ruleFindings]);
  const aiGenerated = audit?.aiReport?.promptMeta
    ? Boolean(
        (audit.aiReport.promptMeta as { aiGenerated?: boolean }).aiGenerated
      )
    : false;

  const queryClient = useQueryClient();
  // Track which PDF version the user just queued, plus the version that was
  // "latest" at the moment they clicked generate. When polling sees a newer
  // version land, we kick off a download automatically.
  const pendingPdfRef = useRef<{ priorVersion: number } | null>(null);
  const [pdfPolling, setPdfPolling] = useState(false);
  const [aiPolling, setAiPolling] = useState(false);
  const aiPollPriorMetaRef = useRef<unknown>(null);

  const onGenerateAiReport = async () => {
    setAiError("");
    setAiMessage("");

    try {
      aiPollPriorMetaRef.current = audit?.aiReport?.promptMeta ?? null;
      await generateAiReport.mutateAsync();
      setAiPolling(true);
      setAiMessage("AI report queued. The narrative will refresh here automatically.");
    } catch (err) {
      setAiError(getErrorMessage(err));
    }
  };

  const savePdfBlob = ({ blob, fileName }: { blob: Blob; fileName: string }) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async (pdfReportId: string) => {
    const file = await downloadPdfReport.mutateAsync({
      auditId,
      pdfReportId,
    });
    savePdfBlob(file);
  };

  const onGeneratePdfReport = async () => {
    setPdfError("");
    setPdfMessage("");

    try {
      const priorVersion = audit?.pdfReports?.[0]?.version ?? 0;
      pendingPdfRef.current = { priorVersion };
      await generatePdfReport.mutateAsync();
      setPdfPolling(true);
      setPdfMessage(
        "PDF queued. It will download automatically when generation finishes."
      );
    } catch (err) {
      setPdfError(getErrorMessage(err));
      pendingPdfRef.current = null;
    }
  };

  // Poll the audit while a PDF job is pending so a fresh version surfaces
  // without the user manually refreshing. Stop polling once we see a new
  // version arrive (or after 60 seconds — covers worker hiccups).
  useEffect(() => {
    if (!pdfPolling) return undefined;

    const startedAt = Date.now();
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["audit", auditId] });
      if (Date.now() - startedAt > 60_000) {
        setPdfPolling(false);
        setPdfMessage(
          "PDF is taking longer than expected. Try clicking the download button once it appears."
        );
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pdfPolling, auditId, queryClient]);

  // When a new PDF version lands, auto-download it.
  useEffect(() => {
    const pending = pendingPdfRef.current;
    if (!pending) return;
    const latest = audit?.pdfReports?.[0];
    if (latest && latest.version > pending.priorVersion) {
      pendingPdfRef.current = null;
      setPdfPolling(false);
      downloadPdf(latest.id)
        .then(() => setPdfMessage(`PDF report v${latest.version} downloaded.`))
        .catch((err) => setPdfError(getErrorMessage(err)));
    }
    // We intentionally exclude downloadPdf from deps — it's stable per render
    // for our purposes and including it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audit?.pdfReports]);

  // Stop AI polling once we see the saved promptMeta change (server upserts
  // the aiReport when the job finishes). Or after 90 seconds.
  useEffect(() => {
    if (!aiPolling) return undefined;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["audit", auditId] });
      if (Date.now() - startedAt > 90_000) {
        setAiPolling(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [aiPolling, auditId, queryClient]);

  useEffect(() => {
    if (!aiPolling) return;
    const currentMeta = audit?.aiReport?.promptMeta;
    if (currentMeta && currentMeta !== aiPollPriorMetaRef.current) {
      setAiPolling(false);
      const aiGen = (currentMeta as { aiGenerated?: boolean }).aiGenerated;
      setAiMessage(
        aiGen
          ? "AI report generated and saved."
          : "AI was unavailable; the deterministic report is shown."
      );
    }
  }, [aiPolling, audit?.aiReport?.promptMeta]);

  const onDownloadLatestPdf = async () => {
    if (!latestPdfReport) return;

    setPdfError("");
    setPdfMessage("");

    try {
      await downloadPdf(latestPdfReport.id);
      setPdfMessage(`PDF report v${latestPdfReport.version} downloaded.`);
    } catch (err) {
      setPdfError(getErrorMessage(err));
    }
  };

  const onReportFrameLoad = () => {
    const doc = reportFrameRef.current?.contentDocument;
    if (!doc) return;
    const nextHeight = Math.max(
      900,
      doc.documentElement.scrollHeight,
      doc.body.scrollHeight
    );
    setReportFrameHeight(nextHeight + 24);
  };

  if (audit && audit.status === "COMPLETED") {
    return (
      <div className="aa-dash min-h-screen overflow-x-hidden">
        <nav className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[var(--card)]/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/dashboard" className="text-lg font-semibold text-[color:var(--text)]">
                Ad Adviser
              </Link>
              <span className="hidden truncate text-sm text-[color:var(--text-dim)] sm:inline">
                Audit report
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href={`/dashboard/audits/compare?right=${auditId}`}
                className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-sm font-medium text-[color:var(--text-dim)] hover:bg-[var(--card-2)]"
              >
                Compare with...
              </Link>
              <Link
                href={`/dashboard/audits/${auditId}/upload`}
                className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-sm font-medium text-[color:var(--text-dim)] hover:bg-[var(--card-2)]"
              >
                Back to uploads
              </Link>
              {latestPdfReport && (
                <button
                  type="button"
                  onClick={onDownloadLatestPdf}
                  disabled={downloadPdfReport.isPending}
                  className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-sm font-semibold text-[color:var(--text-dim)] hover:bg-[var(--card-2)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloadPdfReport.isPending ? "Downloading..." : "Download PDF"}
                </button>
              )}
              <button
                type="button"
                onClick={onGeneratePdfReport}
                disabled={generatePdfReport.isPending || pdfPolling}
                className="rounded-md bg-[var(--violet)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--violet-light)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generatePdfReport.isPending || pdfPolling
                  ? "Generating..."
                  : "Generate PDF"}
              </button>
            </div>
          </div>
        </nav>

        <main className="w-full overflow-x-hidden bg-[var(--card-2)] pb-10">
          {(pdfError || pdfMessage) && (
            <div className="mx-auto mt-4 max-w-7xl px-6">
              {pdfError && (
                <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {pdfError}
                </p>
              )}
              {pdfMessage && (
                <p className="rounded-md border border-[color:rgba(46,207,179,0.3)] bg-[rgba(46,207,179,0.08)] px-4 py-3 text-sm text-[color:var(--teal)]">
                  {pdfMessage}
                </p>
              )}
            </div>
          )}

          {premiumReport.isLoading && (
            <div className="mx-auto mt-6 max-w-7xl rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6 text-sm text-[color:var(--text-dim)]">
              Loading premium report...
            </div>
          )}

          {premiumReport.error && (
            <div className="mx-auto mt-6 max-w-7xl rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Could not load the premium report. The audit data is saved; refresh and try again.
            </div>
          )}

          {premiumReport.data && (
            <iframe
              ref={reportFrameRef}
              title="Premium audit report"
              srcDoc={premiumReport.data}
              scrolling="no"
              onLoad={onReportFrameLoad}
              style={{ height: `${reportFrameHeight}px` }}
              className="block w-full border-0 bg-[var(--card-2)]"
            />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="aa-dash min-h-screen">
      <nav className="border-b border-[color:var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-[color:var(--text)]">
            Ad Adviser
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/audits/compare?right=${auditId}`}
              className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-sm font-medium text-[color:var(--text-dim)] hover:bg-[var(--card-2)]"
            >
              Compare with...
            </Link>
            <Link
              href={`/dashboard/audits/${auditId}/upload`}
              className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-sm font-medium text-[color:var(--text-dim)] hover:bg-[var(--card-2)]"
            >
              Back to uploads
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {isLoading && (
          <div className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6 text-sm text-[color:var(--text-dim)]">
            Loading audit results...
          </div>
        )}

        {!isLoading && !audit && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Audit was not found.
          </div>
        )}

        {audit?.status === "PROCESSING" || audit?.status === "VALIDATING" ? (
          <ProcessingBanner audit={audit} />
        ) : null}

        {audit?.status === "FAILED" ? (
          <FailedBanner
            audit={audit}
            onRetry={() => runAudit.mutate()}
            retrying={runAudit.isPending}
          />
        ) : null}

        {audit && audit.status === "COMPLETED" && (
          <div className="space-y-6">
            <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div>
                  <p className="text-sm font-medium text-[color:var(--text-dim)]">
                    {aiGenerated ? "AI-enhanced audit" : "Deterministic audit"}
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold text-[color:var(--text)]">
                    Health score: {healthScore}/100
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-dim)]">
                    The rule engine computes the facts and score. The strategist
                    report turns those facts into a deeper diagnosis without
                    changing the scoring math.
                  </p>
                  {/* Trust signals — subtle, factual. */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[color:var(--text-dim)]">
                    <span className="rounded-full border border-[color:var(--border)] bg-[var(--card-2)] px-2.5 py-1">
                      Every figure computed by the rule engine
                    </span>
                    {dataConfidenceSummary && (
                      <span className="rounded-full border border-[color:rgba(46,207,179,0.3)] bg-[rgba(46,207,179,0.08)] px-2.5 py-1 text-[color:var(--teal)]">
                        {dataConfidenceSummary}
                      </span>
                    )}
                    {narrativeVersion && (
                      <span className="rounded-full border border-[color:var(--border)] bg-[var(--card-2)] px-2.5 py-1">
                        Report {narrativeVersion}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid min-w-72 gap-3 sm:grid-cols-2">
                  <SummaryTile label="Score band" value={scoreLabel(healthScore)} />
                  <SummaryTile label="Status" value={audit.status} />
                  <SummaryTile
                    label="Readiness"
                    value={audit.uploadReadiness?.mode || "UNKNOWN"}
                  />
                  <SummaryTile
                    label="Findings"
                    value={String(audit.ruleFindings?.length || 0)}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--text)]">
                    PDF report
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-dim)]">
                    Generate a client-ready PDF from the saved audit snapshot,
                    including score, AI narrative, priorities, quick wins, and
                    the full issue list.
                  </p>
                  {latestPdfReport && (
                    <p className="mt-2 text-xs font-medium text-[color:var(--text-dim)]">
                      Latest PDF: v{latestPdfReport.version} generated on{" "}
                      {new Date(latestPdfReport.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {latestPdfReport && (
                    <button
                      type="button"
                      onClick={onDownloadLatestPdf}
                      disabled={downloadPdfReport.isPending}
                      className="rounded-md border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[color:var(--text-dim)] hover:bg-[var(--card-2)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {downloadPdfReport.isPending
                        ? "Downloading..."
                        : "Download latest PDF"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onGeneratePdfReport}
                    disabled={
                      generatePdfReport.isPending ||
                      pdfPolling ||
                      downloadPdfReport.isPending ||
                      audit.status !== "COMPLETED"
                    }
                    className="rounded-md bg-[var(--violet)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--violet-light)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generatePdfReport.isPending || pdfPolling
                      ? "Generating..."
                      : latestPdfReport
                        ? "Generate new PDF"
                        : "Generate PDF"}
                  </button>
                </div>
              </div>
              {pdfMessage && (
                <div className="mt-4 rounded-md border border-[color:rgba(46,207,179,0.3)] bg-[rgba(46,207,179,0.08)] px-4 py-3 text-sm text-[color:var(--teal)]">
                  {pdfMessage}
                </div>
              )}
              {pdfError && (
                <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  {pdfError}
                </div>
              )}
            </section>

            <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--text)]">
                    Strategist report
                    {aiNarrativeMode !== false && (
                      <span className="ml-2 rounded bg-[rgba(46,207,179,0.08)] px-2 py-0.5 text-xs font-semibold text-[color:var(--teal)]">
                        Deep audit default
                      </span>
                    )}
                  </h2>
                  {/* Description varies by plan mode so users know what to expect. */}
                  {aiNarrativeMode === "automatic" ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-dim)]">
                      The strategist report runs automatically after every
                      audit. It uses the deterministic findings, comparisons,
                      and hypothesis checks to produce the client-facing diagnosis.
                    </p>
                  ) : aiNarrativeMode === "manual" ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-dim)]">
                      The strategist report is now generated automatically after
                      the audit. Use regenerate only when you want a fresh version.
                    </p>
                  ) : (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-dim)]">
                      The strategist report writes the executive summary,
                      hypothesis analysis, benchmarks, and client-ready
                      recommendations. Available on Starter and higher.
                    </p>
                  )}
                  {audit.aiReport && (
                    <p className="mt-2 text-xs font-medium text-[color:var(--text-dim)]">
                      Current report provider: {audit.aiReport.provider} /{" "}
                      {audit.aiReport.model}
                    </p>
                  )}
                </div>
                {aiNarrativeMode === false ? (
                  <Link
                    href="/pricing"
                    className="rounded-md bg-[var(--violet)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--violet-light)]"
                  >
                    Upgrade for strategist report
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={onGenerateAiReport}
                    disabled={
                      generateAiReport.isPending ||
                      aiPolling ||
                      audit.status !== "COMPLETED"
                    }
                    className="rounded-md bg-[var(--violet)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--violet-light)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generateAiReport.isPending || aiPolling
                      ? "Generating..."
                      : aiGenerated
                        ? "Regenerate report"
                        : "Generate report"}
                  </button>
                )}
              </div>
              {audit.aiReport && aiGenerated && (
                <div className="mt-5 rounded-md border border-[color:rgba(46,207,179,0.3)] bg-[rgba(46,207,179,0.08)] px-4 py-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--teal)]">
                        Strategist report is ready
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[color:var(--teal)]">
                        Saved with {audit.aiReport.provider} /{" "}
                        {audit.aiReport.model}. The sections below are now using
                        the AI narrative where available.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[color:var(--teal)] sm:grid-cols-4">
                      <span>{executiveSummary.length} summaries</span>
                      <span>{topPriorities.length} priorities</span>
                      <span>{quickWins.length} quick wins</span>
                      <span>{clientReadyRecommendations.length} recs</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Auto-mode hint while we wait for the worker to land the AI report. */}
              {aiNarrativeMode !== false && !aiGenerated && (
                <div className="mt-5 rounded-md border border-[color:var(--border)] bg-[var(--card-2)] px-4 py-3 text-sm leading-6 text-[color:var(--text-dim)]">
                  <span className="font-semibold">Heads up:</span> Strategist report
                  is queued automatically. While we wait, the sections below
                  show the deterministic report.
                </div>
              )}
              {aiMessage && (
                <div className="mt-4 rounded-md border border-[color:rgba(46,207,179,0.3)] bg-[rgba(46,207,179,0.08)] px-4 py-3 text-sm text-[color:var(--teal)]">
                  {aiMessage}
                </div>
              )}
              {aiError && (
                <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  {aiError}
                </div>
              )}
            </section>

            {audit.uploadReadiness && (
              <ReadinessWarning readiness={audit.uploadReadiness} />
            )}

            <section className="grid gap-3 md:grid-cols-4">
              <SeverityTile severity="CRITICAL" count={severityCounts.CRITICAL} />
              <SeverityTile severity="HIGH" count={severityCounts.HIGH} />
              <SeverityTile severity="MEDIUM" count={severityCounts.MEDIUM} />
              <SeverityTile severity="LOW" count={severityCounts.LOW} />
            </section>

            {executiveSummary.length ? (
              <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-[color:var(--text)]">
                  Executive summary
                </h2>
                <div className="mt-4 space-y-3">
                  {executiveSummary.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-6 text-[color:var(--text-dim)]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ) : null}

            {opportunitySummary && (
              <section className="rounded-lg border border-[color:rgba(46,207,179,0.3)] bg-[rgba(46,207,179,0.08)] p-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <SummaryCallout
                    label="Biggest money leak"
                    value={opportunitySummary.biggestMoneyLeak || "Not identified"}
                  />
                  <SummaryCallout
                    label="Estimated waste"
                    value={opportunitySummary.estimatedWaste || "No reliable money estimate"}
                  />
                  <SummaryCallout
                    label="Upside after fixing"
                    value={opportunitySummary.estimatedUpside || "Directional"}
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-[color:var(--teal)]">
                  {opportunitySummary.rankingBasis}
                </p>
              </section>
            )}

            {hypothesisAnalyses.length ? (
              <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-[color:var(--text)]">
                  Hypothesis-driven diagnosis
                </h2>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {hypothesisAnalyses.map((item, index) => (
                    <HypothesisCard key={`${item.hypothesis}-${index}`} item={item} />
                  ))}
                </div>
              </section>
            ) : null}

            {findingAnalyses.length ? (
              <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[color:var(--text)]">
                      Major finding analysis
                    </h2>
                    <p className="mt-1 text-sm text-[color:var(--text-dim)]">
                      Ranked by recoverable money, confidence, and ease of implementation.
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-5">
                  {findingAnalyses.map((item, index) => (
                    <FindingAnalysisCard
                      key={`${item.ruleId}-${index}`}
                      item={item}
                      index={index + 1}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {benchmarkComparisons.length ? (
              <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-[color:var(--text)]">
                  Benchmark comparisons
                </h2>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  {benchmarkComparisons.map((item, index) => (
                    <BenchmarkCard key={`${item.label}-${index}`} item={item} />
                  ))}
                </div>
              </section>
            ) : null}

            {confidenceNotes.length ? (
              <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-[color:var(--text)]">
                  Confidence notes
                </h2>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[color:var(--text-dim)]">
                  {confidenceNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {hasDeeperInsights ? (
              <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-[color:var(--text)]">
                  Deeper insights
                </h2>
                <p className="mt-1 text-sm text-[color:var(--text-dim)]">
                  Segment, peer, and trend analysis computed from your data.
                </p>
                <div className="mt-4 grid gap-5 lg:grid-cols-3">
                  <InsightColumn
                    title="Segment waste"
                    emptyHint="No segment-level waste detected."
                    items={segmentInsights}
                  />
                  <InsightColumn
                    title="Peer comparison"
                    emptyHint="No comparable account in your portfolio yet."
                    items={comparisonInsights}
                  />
                  <InsightColumn
                    title="Since last audit"
                    emptyHint="First audit for this account — trends appear next time."
                    items={memoryInsights}
                  />
                </div>
              </section>
            ) : null}

            {risksAndAssumptions.length ? (
              <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card-2)] p-6">
                <h2 className="text-base font-semibold text-[color:var(--text)]">
                  Risks &amp; assumptions
                </h2>
                <ul className="mt-3 space-y-1.5 text-sm leading-6 text-[color:var(--text-dim)]">
                  {risksAndAssumptions.map((note) => (
                    <li key={note}>• {note}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-[color:var(--text)]">
                  Top 5 priorities
                </h2>
                <div className="mt-4 space-y-3">
                  {topPriorities.length === 0 ? (
                    <p className="text-sm text-[color:var(--text-dim)]">
                      No top priorities were generated.
                    </p>
                  ) : (
                    topPriorities.map((priority, index) => (
                      <PriorityRow
                        key={`${priority.ruleId}-${index}`}
                        index={index + 1}
                        ruleId={priority.ruleId}
                        platform={priority.platform}
                        severity={priority.severity}
                        title={priority.title}
                        detail={priority.estimatedImpact}
                      />
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-[color:var(--text)]">
                  Quick wins
                </h2>
                <div className="mt-4 space-y-3">
                  {quickWins.length === 0 ? (
                    <p className="text-sm text-[color:var(--text-dim)]">
                      No quick wins were generated.
                    </p>
                  ) : (
                    quickWins.map((quickWin, index) => (
                      <PriorityRow
                        key={`${quickWin.ruleId}-${index}`}
                        index={index + 1}
                        ruleId={quickWin.ruleId}
                        platform={quickWin.platform}
                        title={quickWin.title}
                        detail={quickWin.fixSteps?.[0]}
                      />
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
              {clientReadyRecommendations.length ? (
                <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6 lg:col-span-2">
                  <h2 className="text-lg font-semibold text-[color:var(--text)]">
                    Client-ready recommendations
                  </h2>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {clientReadyRecommendations.map(
                      (recommendation) => (
                        <div
                          key={recommendation.headline}
                          className="rounded-md border border-[color:var(--border)] bg-[var(--card-2)] p-4"
                        >
                          <h3 className="text-sm font-semibold text-[color:var(--text)]">
                            {recommendation.headline}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--text-dim)]">
                            {recommendation.explanation}
                          </p>
                          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-[color:var(--text-dim)]">
                            {(recommendation.nextSteps || []).map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                          <p className="mt-3 text-xs font-medium text-[color:var(--text-dim)]">
                            Source rules: {(recommendation.sourceRuleIds || []).join(", ")}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>
              ) : null}

              <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-[color:var(--text)]">
                  Platform scores
                </h2>
                <div className="mt-4 space-y-4">
                  {audit.selectedPlatforms.map((platform) => {
                    const platformScore = scores?.platforms?.[platform];

                    return (
                      <div
                        key={platform}
                        className="rounded-md border border-[color:var(--border)] bg-[var(--card-2)] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[color:var(--text)]">
                            {PLATFORM_LABELS[platform]}
                          </p>
                          <p className="text-sm font-semibold text-[color:var(--teal)]">
                            {platformScore?.score ?? 0}/100
                          </p>
                        </div>
                        <div className="mt-3 space-y-2">
                          {Object.entries(platformScore?.categories || {}).map(
                            ([category, score]) => (
                              <div key={category}>
                                <div className="flex justify-between gap-3 text-xs text-[color:var(--text-dim)]">
                                  <span>{category}</span>
                                  <span>{score}/100</span>
                                </div>
                                <div className="mt-1 h-2 rounded bg-[var(--card-3)]">
                                  <div
                                    className="h-2 rounded bg-[var(--violet)]"
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-lg border border-[color:var(--border)] bg-[var(--card)] p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <h2 className="text-lg font-semibold text-[color:var(--text)]">
                    Full issue list
                  </h2>
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as SortMode)}
                    className="rounded-md border border-[color:var(--border)] bg-[var(--card-2)] px-3 py-2 text-sm text-[color:var(--text)]"
                  >
                    <option value="severity">Sort by severity</option>
                    <option value="platform">Sort by platform</option>
                    <option value="category">Sort by category</option>
                  </select>
                </div>

                <div className="mt-4 space-y-4">
                  {findings.length === 0 ? (
                    <p className="text-sm text-[color:var(--text-dim)]">
                      No rule findings were generated.
                    </p>
                  ) : (
                    findings.map((finding) => (
                      <FindingCard key={finding.id} finding={finding} />
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ProcessingBanner({ audit }: { audit: Audit }) {
  const platforms = audit.selectedPlatforms
    .map((platform) => PLATFORM_LABELS[platform])
    .join(", ");

  return (
    <section className="rounded-lg border border-[color:rgba(46,207,179,0.3)] bg-[rgba(46,207,179,0.08)] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
          <span className="block h-6 w-6 animate-spin rounded-full border-2 border-[color:var(--violet)] border-t-transparent" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[color:var(--teal)]">
            Running your audit...
          </h2>
          <p className="mt-1 text-sm leading-6 text-[color:var(--teal)]">
            We&rsquo;re analyzing your {platforms || "selected"} data with the
            deterministic rule engine. This page will refresh automatically the
            moment results are ready — no need to reload.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-[color:var(--teal)]">
            <li>• Validating uploads and intake answers</li>
            <li>• Running rule engine across all platforms</li>
            <li>• Computing platform and category scores</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function FailedBanner({
  audit,
  onRetry,
  retrying,
}: {
  audit: Audit;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <section className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
          <span className="text-lg font-semibold">!</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-red-900">
            Audit run failed
          </h2>
          <p className="mt-1 text-sm leading-6 text-red-800">
            Something went wrong while processing this audit. Your uploads are
            still saved — you can retry without re-uploading.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {retrying ? "Retrying..." : "Retry audit"}
            </button>
            <Link
              href={`/dashboard/audits/${audit.id}/upload`}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
            >
              Review uploads
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function InsightColumn({
  title,
  items,
  emptyHint,
}: {
  title: string;
  items: string[];
  emptyHint: string;
}) {
  return (
    <div className="rounded-md border border-[color:var(--border)] bg-[var(--card-2)] p-4">
      <h3 className="text-sm font-semibold text-[color:var(--text)]">{title}</h3>
      {items.length ? (
        <ul className="mt-2 space-y-2 text-sm leading-6 text-[color:var(--text-dim)]">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs leading-5 text-[color:var(--hint)]">{emptyHint}</p>
      )}
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[color:var(--border)] bg-[var(--card-2)] p-4">
      <p className="text-xs font-medium text-[color:var(--text-dim)]">{label}</p>
      <p className="mt-1 text-base font-semibold text-[color:var(--text)]">{value}</p>
    </div>
  );
}

function SeverityTile({
  severity,
  count,
}: {
  severity: RuleFinding["severity"];
  count: number;
}) {
  return (
    <div className={`rounded-lg border bg-[var(--card)] p-4 ${severityStyles[severity]}`}>
      <p className="text-xs font-semibold">{severity}</p>
      <p className="mt-1 text-2xl font-semibold">{count}</p>
    </div>
  );
}

function ReadinessWarning({ readiness }: { readiness: UploadReadiness }) {
  const isFull = readiness.mode === "FULL";

  return (
    <section
      className={`rounded-lg border p-6 ${
        isFull ? "border-[color:rgba(46,207,179,0.3)] bg-[rgba(46,207,179,0.08)]" : "border-yellow-200 bg-yellow-50"
      }`}
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--text)]">
            {isFull ? "Full audit ready" : "Limited audit disclosure"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-dim)]">
            {isFull
              ? "All required reports for the selected platforms were validated before the audit ran."
              : "This audit ran with partial data. Scores and recommendations are useful for direction, but confidence improves after uploading the missing reports."}
          </p>
        </div>
        <div className="text-sm font-semibold text-[color:var(--text-dim)]">
          {readiness.completedRequiredCount}/{readiness.requiredCount} required
          reports
        </div>
      </div>

      {!isFull && (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {Object.entries(readiness.platforms).map(([platform, platformReadiness]) => {
            if (!platformReadiness || platformReadiness.missingReports.length === 0) {
              return null;
            }

            return (
              <div
                key={platform}
                className="rounded-md border border-yellow-200 bg-[var(--card)]/70 p-4"
              >
                <h3 className="text-sm font-semibold text-[color:var(--text)]">
                  Missing {PLATFORM_LABELS[platform as Platform]}
                </h3>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-[color:var(--text-dim)]">
                  {platformReadiness.missingReports.slice(0, 4).map((report) => (
                    <li key={report.id}>{report.label}</li>
                  ))}
                </ul>
                {platformReadiness.missingReports.length > 4 && (
                  <p className="mt-2 text-xs text-[color:var(--text-dim)]">
                    +{platformReadiness.missingReports.length - 4} more
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SummaryCallout({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--teal)]">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold leading-6 text-[color:var(--text)]">
        {value}
      </p>
    </div>
  );
}

function HypothesisCard({
  item,
}: {
  item: NonNullable<AiReport["output"]["hypothesisAnalyses"]>[number];
}) {
  return (
    <article className="border-l-2 border-[color:var(--violet)] pl-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-[color:rgba(46,207,179,0.3)] bg-[rgba(46,207,179,0.08)] px-2 py-0.5 text-xs font-semibold capitalize text-[color:var(--teal)]">
          {item.confidence} confidence
        </span>
        {(item.sourceRuleIds || []).map((ruleId) => (
          <span key={ruleId} className="text-xs font-semibold text-[color:var(--text-dim)]">
            {ruleId}
          </span>
        ))}
      </div>
      <h3 className="mt-2 text-sm font-semibold text-[color:var(--text)]">
        {item.hypothesis}
      </h3>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-[color:var(--text-dim)]">
        {(item.testsRun || []).map((test) => (
          <li key={test}>{test}</li>
        ))}
      </ul>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-dim)]">{item.conclusion}</p>
    </article>
  );
}

function FindingAnalysisCard({
  item,
  index,
}: {
  item: NonNullable<AiReport["output"]["findingAnalyses"]>[number];
  index: number;
}) {
  return (
    <article className="border-t border-[color:var(--border)] pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-[var(--violet)] px-2 py-1 text-xs font-semibold text-white">
              {index}
            </span>
            <span className="rounded border border-[color:var(--border)] px-2 py-1 text-xs font-semibold text-[color:var(--text-dim)]">
              {item.ruleId}
            </span>
            {item.platform && (
              <span className="rounded border border-[color:var(--border)] px-2 py-1 text-xs font-semibold text-[color:var(--text-dim)]">
                {PLATFORM_LABELS[item.platform]}
              </span>
            )}
            <span className="rounded border border-[color:rgba(46,207,179,0.3)] bg-[rgba(46,207,179,0.08)] px-2 py-1 text-xs font-semibold capitalize text-[color:var(--teal)]">
              {item.confidence}
            </span>
            <span className="rounded border border-[color:var(--border)] bg-[var(--card-2)] px-2 py-1 text-xs font-semibold capitalize text-[color:var(--text-dim)]">
              {item.easeOfImplementation} fix
            </span>
          </div>
          <h3 className="mt-3 text-base font-semibold text-[color:var(--text)]">
            {item.title}
          </h3>
        </div>
        <p className="text-sm font-semibold text-[color:var(--teal)] lg:max-w-xs lg:text-right">
          {item.estimatedBusinessImpact}
        </p>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-[color:var(--text-dim)]">
            What is happening
          </p>
          <p className="mt-1 text-sm leading-6 text-[color:var(--text-dim)]">
            {item.whatIsHappening}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-[color:var(--text-dim)]">
            Why it is happening
          </p>
          <p className="mt-1 text-sm leading-6 text-[color:var(--text-dim)]">
            {item.whyItIsHappening}
          </p>
        </div>
      </div>

      <details className="mt-4 rounded-md border border-[color:var(--border)] bg-[var(--card-2)] p-4">
        <summary className="cursor-pointer text-sm font-semibold text-[color:var(--text-dim)]">
          Evidence and actions
        </summary>
        <div className="mt-3 grid gap-5 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-[color:var(--text-dim)]">Evidence</p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-[color:var(--text-dim)]">
              {(item.evidence || []).map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[color:var(--text-dim)]">
              Recommended actions
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm leading-6 text-[color:var(--text-dim)]">
              {(item.recommendedActions || []).map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[color:var(--text-dim)]">
              Expected outcome
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text-dim)]">
              {item.expectedOutcome}
            </p>
          </div>
        </div>
      </details>
    </article>
  );
}

function BenchmarkCard({
  item,
}: {
  item: NonNullable<AiReport["output"]["benchmarkComparisons"]>[number];
}) {
  return (
    <article className="border-l-2 border-[color:var(--border)] pl-4">
      <div className="flex flex-wrap gap-2">
        <span className="rounded border border-[color:var(--border)] px-2 py-0.5 text-xs font-semibold capitalize text-[color:var(--text-dim)]">
          {item.comparisonType}
        </span>
        <span className="rounded border border-[color:rgba(46,207,179,0.3)] bg-[rgba(46,207,179,0.08)] px-2 py-0.5 text-xs font-semibold capitalize text-[color:var(--teal)]">
          {item.confidence}
        </span>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-[color:var(--text)]">{item.label}</h3>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-dim)]">{item.finding}</p>
    </article>
  );
}

function PriorityRow({
  index,
  ruleId,
  platform,
  severity,
  title,
  detail,
}: {
  index: number;
  ruleId: string;
  platform: Platform | null;
  severity?: RuleFinding["severity"];
  title: string;
  detail?: string;
}) {
  return (
    <div className="rounded-md border border-[color:var(--border)] bg-[var(--card-2)] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[var(--violet)] text-sm font-semibold text-white">
          {index}
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded border border-[color:var(--border)] px-2 py-1 text-xs font-semibold text-[color:var(--text-dim)]">
              {ruleId}
            </span>
            {severity && (
              <span
                className={`rounded border px-2 py-1 text-xs font-semibold ${
                  severityStyles[severity]
                }`}
              >
                {severity}
              </span>
            )}
            {platform && (
              <span className="rounded border border-[color:var(--border)] px-2 py-1 text-xs font-semibold text-[color:var(--text-dim)]">
                {PLATFORM_LABELS[platform]}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-[color:var(--text)]">{title}</p>
          {detail && <p className="mt-1 text-sm leading-5 text-[color:var(--text-dim)]">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: RuleFinding }) {
  const entries = evidenceEntries(finding.evidence);
  const highlights = evidenceHighlights(finding.evidence);

  return (
    <article className="rounded-md border border-[color:var(--border)] bg-[var(--card-2)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded border px-2 py-1 text-xs font-semibold ${
                severityStyles[finding.severity]
              }`}
            >
              {finding.severity}
            </span>
            <span className="rounded border border-[color:var(--border)] px-2 py-1 text-xs font-semibold text-[color:var(--text-dim)]">
              {finding.ruleId}
            </span>
            {finding.platform && (
              <span className="rounded border border-[color:var(--border)] px-2 py-1 text-xs font-semibold text-[color:var(--text-dim)]">
                {PLATFORM_LABELS[finding.platform]}
              </span>
            )}
          </div>
          <h3 className="mt-3 text-base font-semibold text-[color:var(--text)]">
            {finding.title}
          </h3>
          <p className="mt-1 text-sm text-[color:var(--text-dim)]">{finding.category}</p>
        </div>
      </div>

      {highlights.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {highlights.map((h) => (
            <span
              key={h.label}
              className="rounded-md border border-[color:var(--border)] bg-[var(--card)] px-2.5 py-1 text-xs text-[color:var(--text-dim)]"
            >
              <span className="font-semibold text-[color:var(--text-dim)]">{h.label}:</span>{" "}
              {h.value}
            </span>
          ))}
        </div>
      )}

      {finding.detail && (
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-dim)]">{finding.detail}</p>
      )}

      {finding.estimatedImpact && (
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-dim)]">
          <span className="font-semibold">Impact:</span> {finding.estimatedImpact}
        </p>
      )}

      {entries.length > 0 && (
        <details
          open={finding.severity === "CRITICAL" || finding.severity === "HIGH"}
          className="mt-3 rounded-md border border-[color:var(--border)] bg-[var(--card)] p-3"
        >
          <summary className="cursor-pointer text-sm font-semibold text-[color:var(--text-dim)]">
            Evidence
          </summary>
          <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
            {entries.slice(0, 6).map(([key, value]) => (
              <div key={key}>
                <dt className="font-semibold text-[color:var(--text-dim)]">{key}</dt>
                <dd className="mt-0.5 break-words text-[color:var(--text-dim)]">
                  {formatEvidenceValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      {finding.fixSteps?.length ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[color:var(--text-dim)]">Fix steps</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-[color:var(--text-dim)]">
            {finding.fixSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </article>
  );
}
