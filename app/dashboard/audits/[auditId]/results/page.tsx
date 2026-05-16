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
  useRunAudit,
} from "@/hooks/use-audits";
import { useMyPlanAndUsage } from "@/hooks/use-plans";
import { getErrorMessage } from "@/lib/api";
import type { Audit, Platform, RuleFinding, UploadReadiness } from "@/lib/audits";
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
  const [sortMode, setSortMode] = useState<SortMode>("severity");
  const [aiError, setAiError] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [pdfMessage, setPdfMessage] = useState("");

  const findings = useMemo(() => {
    const items = [...(audit?.ruleFindings || [])];

    return items.sort((left, right) => {
      if (sortMode === "platform") {
        return String(left.platform || "").localeCompare(String(right.platform || ""));
      }

      if (sortMode === "category") {
        return left.category.localeCompare(right.category);
      }

      return severityOrder[right.severity] - severityOrder[left.severity];
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

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <nav className="border-b border-[#e5ddd0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-[#171717]">
            Ad Adviser
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/audits/compare?right=${auditId}`}
              className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef]"
            >
              Compare with...
            </Link>
            <Link
              href={`/dashboard/audits/${auditId}/upload`}
              className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef]"
            >
              Back to uploads
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {isLoading && (
          <div className="rounded-lg border border-[#e5ddd0] bg-white p-6 text-sm text-[#6b7280]">
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
            <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div>
                  <p className="text-sm font-medium text-[#6b7280]">
                    {aiGenerated ? "AI-enhanced audit" : "Deterministic audit"}
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold text-[#171717]">
                    Health score: {healthScore}/100
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6b7280]">
                    The rule engine uses validated uploads and intake answers as
                    the source of truth. AI narrative can be layered on later
                    without changing the scoring math.
                  </p>
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

            <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-[#171717]">
                    PDF report
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6b7280]">
                    Generate a client-ready PDF from the saved audit snapshot,
                    including score, AI narrative, priorities, quick wins, and
                    the full issue list.
                  </p>
                  {latestPdfReport && (
                    <p className="mt-2 text-xs font-medium text-[#6b7280]">
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
                      className="rounded-md border border-[#d1cac0] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#f7f4ef] disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="rounded-md bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="mt-4 rounded-md border border-[#b8d9c3] bg-[#eff7f1] px-4 py-3 text-sm text-[#1f4d3a]">
                  {pdfMessage}
                </div>
              )}
              {pdfError && (
                <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  {pdfError}
                </div>
              )}
            </section>

            <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-[#171717]">
                    AI narrative
                    {aiNarrativeMode === "automatic" && (
                      <span className="ml-2 rounded bg-[#eff7f1] px-2 py-0.5 text-xs font-semibold text-[#1f4d3a]">
                        Auto
                      </span>
                    )}
                  </h2>
                  {/* Description varies by plan mode so users know what to expect. */}
                  {aiNarrativeMode === "automatic" ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6b7280]">
                      Your plan generates an AI narrative automatically after
                      every audit. It usually appears here within a minute. You
                      can also regenerate it any time.
                    </p>
                  ) : aiNarrativeMode === "manual" ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6b7280]">
                      Generate client-ready language from the saved rule findings.
                      Deterministic scores and issues remain the source of truth.
                    </p>
                  ) : (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6b7280]">
                      The AI narrative writes a polished executive summary,
                      priorities, and client-ready recommendations from your
                      audit findings. Available on Starter and higher.
                    </p>
                  )}
                  {audit.aiReport && (
                    <p className="mt-2 text-xs font-medium text-[#6b7280]">
                      Current report provider: {audit.aiReport.provider} /{" "}
                      {audit.aiReport.model}
                    </p>
                  )}
                </div>
                {aiNarrativeMode === false ? (
                  <Link
                    href="/pricing"
                    className="rounded-md bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183c2d]"
                  >
                    Upgrade for AI report
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
                    className="rounded-md bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generateAiReport.isPending || aiPolling
                      ? "Generating..."
                      : aiGenerated
                        ? "Regenerate AI report"
                        : "Generate AI report"}
                  </button>
                )}
              </div>
              {audit.aiReport && aiGenerated && (
                <div className="mt-5 rounded-md border border-[#b8d9c3] bg-[#eff7f1] px-4 py-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1f4d3a]">
                        AI report is ready
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#3d6a50]">
                        Saved with {audit.aiReport.provider} /{" "}
                        {audit.aiReport.model}. The sections below are now using
                        the AI narrative where available.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#1f4d3a] sm:grid-cols-4">
                      <span>{executiveSummary.length} summaries</span>
                      <span>{topPriorities.length} priorities</span>
                      <span>{quickWins.length} quick wins</span>
                      <span>{clientReadyRecommendations.length} recs</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Auto-mode hint while we wait for the worker to land the AI report. */}
              {aiNarrativeMode === "automatic" && !aiGenerated && (
                <div className="mt-5 rounded-md border border-[#eee7dc] bg-[#faf9f7] px-4 py-3 text-sm leading-6 text-[#374151]">
                  <span className="font-semibold">Heads up:</span> AI narrative
                  is queued automatically. While we wait, the sections below
                  show the deterministic report.
                </div>
              )}
              {aiMessage && (
                <div className="mt-4 rounded-md border border-[#b8d9c3] bg-[#eff7f1] px-4 py-3 text-sm text-[#1f4d3a]">
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
              <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#171717]">
                  Executive summary
                </h2>
                <div className="mt-4 space-y-3">
                  {executiveSummary.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-6 text-[#374151]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ) : null}

            {confidenceNotes.length ? (
              <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#171717]">
                  Confidence notes
                </h2>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[#374151]">
                  {confidenceNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#171717]">
                  Top 5 priorities
                </h2>
                <div className="mt-4 space-y-3">
                  {topPriorities.length === 0 ? (
                    <p className="text-sm text-[#6b7280]">
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

              <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#171717]">
                  Quick wins
                </h2>
                <div className="mt-4 space-y-3">
                  {quickWins.length === 0 ? (
                    <p className="text-sm text-[#6b7280]">
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
                <section className="rounded-lg border border-[#e5ddd0] bg-white p-6 lg:col-span-2">
                  <h2 className="text-lg font-semibold text-[#171717]">
                    Client-ready recommendations
                  </h2>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {clientReadyRecommendations.map(
                      (recommendation) => (
                        <div
                          key={recommendation.headline}
                          className="rounded-md border border-[#eee7dc] bg-[#faf9f7] p-4"
                        >
                          <h3 className="text-sm font-semibold text-[#171717]">
                            {recommendation.headline}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-[#374151]">
                            {recommendation.explanation}
                          </p>
                          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-[#374151]">
                            {recommendation.nextSteps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                          <p className="mt-3 text-xs font-medium text-[#6b7280]">
                            Source rules: {recommendation.sourceRuleIds.join(", ")}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>
              ) : null}

              <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#171717]">
                  Platform scores
                </h2>
                <div className="mt-4 space-y-4">
                  {audit.selectedPlatforms.map((platform) => {
                    const platformScore = scores?.platforms?.[platform];

                    return (
                      <div
                        key={platform}
                        className="rounded-md border border-[#eee7dc] bg-[#faf9f7] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[#171717]">
                            {PLATFORM_LABELS[platform]}
                          </p>
                          <p className="text-sm font-semibold text-[#1f4d3a]">
                            {platformScore?.score ?? 0}/100
                          </p>
                        </div>
                        <div className="mt-3 space-y-2">
                          {Object.entries(platformScore?.categories || {}).map(
                            ([category, score]) => (
                              <div key={category}>
                                <div className="flex justify-between gap-3 text-xs text-[#6b7280]">
                                  <span>{category}</span>
                                  <span>{score}/100</span>
                                </div>
                                <div className="mt-1 h-2 rounded bg-[#e5ddd0]">
                                  <div
                                    className="h-2 rounded bg-[#1f4d3a]"
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

              <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <h2 className="text-lg font-semibold text-[#171717]">
                    Full issue list
                  </h2>
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as SortMode)}
                    className="rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2 text-sm text-[#171717]"
                  >
                    <option value="severity">Sort by severity</option>
                    <option value="platform">Sort by platform</option>
                    <option value="category">Sort by category</option>
                  </select>
                </div>

                <div className="mt-4 space-y-4">
                  {findings.length === 0 ? (
                    <p className="text-sm text-[#6b7280]">
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
    <section className="rounded-lg border border-[#b8d9c3] bg-[#eff7f1] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
          <span className="block h-6 w-6 animate-spin rounded-full border-2 border-[#1f4d3a] border-t-transparent" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[#1f4d3a]">
            Running your audit...
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#3d6a50]">
            We&rsquo;re analyzing your {platforms || "selected"} data with the
            deterministic rule engine. This page will refresh automatically the
            moment results are ready — no need to reload.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-[#3d6a50]">
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

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#eee7dc] bg-[#faf9f7] p-4">
      <p className="text-xs font-medium text-[#6b7280]">{label}</p>
      <p className="mt-1 text-base font-semibold text-[#171717]">{value}</p>
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
    <div className={`rounded-lg border bg-white p-4 ${severityStyles[severity]}`}>
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
        isFull ? "border-[#b8d9c3] bg-[#eff7f1]" : "border-yellow-200 bg-yellow-50"
      }`}
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row">
        <div>
          <h2 className="text-lg font-semibold text-[#171717]">
            {isFull ? "Full audit ready" : "Limited audit disclosure"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#374151]">
            {isFull
              ? "All required reports for the selected platforms were validated before the audit ran."
              : "This audit ran with partial data. Scores and recommendations are useful for direction, but confidence improves after uploading the missing reports."}
          </p>
        </div>
        <div className="text-sm font-semibold text-[#374151]">
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
                className="rounded-md border border-yellow-200 bg-white/70 p-4"
              >
                <h3 className="text-sm font-semibold text-[#171717]">
                  Missing {PLATFORM_LABELS[platform as Platform]}
                </h3>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-[#374151]">
                  {platformReadiness.missingReports.slice(0, 4).map((report) => (
                    <li key={report.id}>{report.label}</li>
                  ))}
                </ul>
                {platformReadiness.missingReports.length > 4 && (
                  <p className="mt-2 text-xs text-[#6b7280]">
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
    <div className="rounded-md border border-[#eee7dc] bg-[#faf9f7] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#171717] text-sm font-semibold text-white">
          {index}
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded border border-[#d1cac0] px-2 py-1 text-xs font-semibold text-[#374151]">
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
              <span className="rounded border border-[#d1cac0] px-2 py-1 text-xs font-semibold text-[#374151]">
                {PLATFORM_LABELS[platform]}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-[#171717]">{title}</p>
          {detail && <p className="mt-1 text-sm leading-5 text-[#6b7280]">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: RuleFinding }) {
  const entries = evidenceEntries(finding.evidence);

  return (
    <article className="rounded-md border border-[#eee7dc] bg-[#faf9f7] p-4">
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
            <span className="rounded border border-[#d1cac0] px-2 py-1 text-xs font-semibold text-[#374151]">
              {finding.ruleId}
            </span>
            {finding.platform && (
              <span className="rounded border border-[#d1cac0] px-2 py-1 text-xs font-semibold text-[#374151]">
                {PLATFORM_LABELS[finding.platform]}
              </span>
            )}
          </div>
          <h3 className="mt-3 text-base font-semibold text-[#171717]">
            {finding.title}
          </h3>
          <p className="mt-1 text-sm text-[#6b7280]">{finding.category}</p>
        </div>
      </div>

      {finding.detail && (
        <p className="mt-3 text-sm leading-6 text-[#374151]">{finding.detail}</p>
      )}

      {finding.estimatedImpact && (
        <p className="mt-3 text-sm leading-6 text-[#374151]">
          <span className="font-semibold">Impact:</span> {finding.estimatedImpact}
        </p>
      )}

      {entries.length > 0 && (
        <div className="mt-3 rounded-md border border-[#eee7dc] bg-white p-3">
          <p className="text-sm font-semibold text-[#374151]">Evidence</p>
          <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
            {entries.slice(0, 6).map(([key, value]) => (
              <div key={key}>
                <dt className="font-semibold text-[#6b7280]">{key}</dt>
                <dd className="mt-0.5 break-words text-[#374151]">
                  {formatEvidenceValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {finding.fixSteps?.length ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#374151]">Fix steps</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-[#374151]">
            {finding.fixSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </article>
  );
}
