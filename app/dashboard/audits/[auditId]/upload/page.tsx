"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAudit, useRunAudit, useUploadAuditFile } from "@/hooks/use-audits";
import { getErrorMessage } from "@/lib/api";
import type { Platform, UploadedFile, UploadReadiness } from "@/lib/audits";
import { PLATFORM_LABELS } from "@/lib/platform-questionnaire";
import {
  defaultReportType,
  UPLOAD_REPORT_TYPES,
} from "@/lib/upload-requirements";

const formatMetric = (value: number | undefined) =>
  typeof value === "number" ? Math.round(value).toLocaleString() : "0";

export default function AuditUploadPage() {
  const params = useParams<{ auditId: string }>();
  const auditId = params.auditId;
  const { data: audit, isLoading } = useAudit(auditId);
  const uploadFile = useUploadAuditFile(auditId);
  const runAudit = useRunAudit(auditId);
  const [files, setFiles] = useState<Partial<Record<Platform, File>>>({});
  const [reportTypes, setReportTypes] = useState<Partial<Record<Platform, string>>>(
    {}
  );
  const [error, setError] = useState("");

  const selectedPlatforms = useMemo(
    () => audit?.selectedPlatforms || [],
    [audit?.selectedPlatforms]
  );

  const onFileChange = (
    platform: Platform,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setFiles((current) => ({
      ...current,
      [platform]: event.target.files?.[0],
    }));
  };

  const onReportTypeChange = (platform: Platform, reportType: string) => {
    setReportTypes((current) => ({
      ...current,
      [platform]: reportType,
    }));
  };

  const onUpload = async (
    platform: Platform,
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const file = files[platform];

    if (!file) {
      setError(`Choose a ${PLATFORM_LABELS[platform]} file before uploading.`);
      return;
    }

    try {
      await uploadFile.mutateAsync({
        auditId,
        platform,
        reportType: reportTypes[platform] || defaultReportType(platform),
        file,
      });

      setFiles((current) => ({
        ...current,
        [platform]: undefined,
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const onRunAudit = async () => {
    setError("");

    try {
      await runAudit.mutateAsync();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <nav className="border-b border-[#e5ddd0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-[#171717]">
            Ad Adviser
          </Link>
          <Link
            href={`/dashboard/audits/${auditId}/intake`}
            className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef]"
          >
            Back to intake
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#6b7280]">Step 3 of 3</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#171717]">
            Upload platform reports
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6b7280]">
            Upload exported reports from each selected platform. Files are saved
            for reprocessing, validated, then normalized into the same dataset
            shape that OAuth/API imports will use. Uploads can contain any
            available history up to 90 days.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-lg border border-[#e5ddd0] bg-white p-6 text-sm text-[#6b7280]">
            Loading audit...
          </div>
        )}

        {!isLoading && !audit && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Audit was not found.
          </div>
        )}

        {audit && (
          <div className="space-y-6">
            {audit.normalizedDataset?.summary?.totals && (
              <section className="rounded-lg border border-[#e5ddd0] bg-white p-5">
                <h2 className="text-base font-semibold text-[#171717]">
                  Upload summary
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <SummaryMetric
                    label="Files"
                    value={formatMetric(
                      audit.normalizedDataset.summary.totals.uploadedFiles
                    )}
                  />
                  <SummaryMetric
                    label="Rows"
                    value={formatMetric(audit.normalizedDataset.summary.totals.rowCount)}
                  />
                  <SummaryMetric
                    label="Spend"
                    value={formatMetric(audit.normalizedDataset.summary.totals.spend)}
                  />
                  <SummaryMetric
                    label="Impressions"
                    value={formatMetric(
                      audit.normalizedDataset.summary.totals.impressions
                    )}
                  />
                  <SummaryMetric
                    label="Conversions"
                    value={formatMetric(
                      audit.normalizedDataset.summary.totals.conversions
                    )}
                  />
                </div>
              </section>
            )}

            {audit.uploadReadiness && (
              <ReadinessPanel
                selectedPlatforms={selectedPlatforms}
                readiness={audit.uploadReadiness}
              />
            )}

            <div className="grid gap-5 lg:grid-cols-3">
              {selectedPlatforms.map((platform) => {
                const reportType = reportTypes[platform] || defaultReportType(platform);
                const reportTypeInfo = UPLOAD_REPORT_TYPES[platform].find(
                  (item) => item.id === reportType
                );
                const platformFiles =
                  audit.uploadedFiles?.filter((file) => file.platform === platform) ||
                  [];

                return (
                  <section
                    key={platform}
                    className="rounded-lg border border-[#e5ddd0] bg-white p-5"
                  >
                    <h2 className="text-lg font-semibold text-[#171717]">
                      {PLATFORM_LABELS[platform]}
                    </h2>
                    <form onSubmit={(event) => onUpload(platform, event)}>
                      <label className="mt-4 block text-sm font-semibold text-[#374151]">
                        Report type
                      </label>
                      <select
                        value={reportType}
                        onChange={(event) =>
                          onReportTypeChange(platform, event.target.value)
                        }
                        className="mt-2 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
                      >
                        {UPLOAD_REPORT_TYPES[platform].map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 min-h-10 text-xs leading-5 text-[#6b7280]">
                        {reportTypeInfo?.helper}
                      </p>

                      <label className="mt-4 block text-sm font-semibold text-[#374151]">
                        File
                      </label>
                      <input
                        type="file"
                        accept=".csv,.json,.xlsx"
                        onChange={(event) => onFileChange(platform, event)}
                        className="mt-2 block w-full rounded-md border border-dashed border-[#d1cac0] bg-[#faf9f7] px-3 py-3 text-sm text-[#374151]"
                      />

                      <button
                        type="submit"
                        disabled={uploadFile.isPending}
                        className="mt-4 w-full rounded-md bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {uploadFile.isPending ? "Uploading..." : "Upload and validate"}
                      </button>
                    </form>

                    <div className="mt-5 border-t border-[#eee7dc] pt-4">
                      <h3 className="text-sm font-semibold text-[#374151]">
                        Uploaded files
                      </h3>
                      {platformFiles.length === 0 ? (
                        <p className="mt-2 text-sm text-[#9ca3af]">
                          No files uploaded yet.
                        </p>
                      ) : (
                        <div className="mt-3 space-y-3">
                          {platformFiles.map((file) => (
                            <UploadedFileRow key={file.id} file={file} />
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onRunAudit}
                disabled={
                  runAudit.isPending ||
                  !audit.uploadedFiles?.some((file) => file.status === "VALIDATED")
                }
                className="rounded-md bg-[#171717] px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {runAudit.isPending
                  ? "Running audit..."
                  : audit.uploadReadiness?.mode === "FULL"
                    ? "Run full audit"
                    : "Run limited audit"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ReadinessPanel({
  selectedPlatforms,
  readiness,
}: {
  selectedPlatforms: Platform[];
  readiness: UploadReadiness;
}) {
  const statusText =
    readiness.mode === "FULL"
      ? "Full audit ready"
      : readiness.mode === "LIMITED"
        ? "Limited audit available"
        : "Not ready";

  return (
    <section className="rounded-lg border border-[#e5ddd0] bg-white p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">
            Upload readiness
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6b7280]">
            {statusText}. {readiness.completedRequiredCount} of{" "}
            {readiness.requiredCount} required reports are validated.
          </p>
        </div>
        <span
          className={`rounded px-3 py-1 text-sm font-semibold ${
            readiness.mode === "FULL"
              ? "bg-[#eff7f1] text-[#1f4d3a]"
              : readiness.mode === "LIMITED"
                ? "bg-yellow-50 text-yellow-700"
                : "bg-red-50 text-red-700"
          }`}
        >
          {readiness.mode}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {selectedPlatforms.map((platform) => {
          const platformReadiness = readiness.platforms[platform];
          if (!platformReadiness) return null;

          return (
            <div
              key={platform}
              className="rounded-md border border-[#eee7dc] bg-[#faf9f7] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#171717]">
                  {PLATFORM_LABELS[platform]}
                </h3>
                <span className="text-xs font-semibold text-[#6b7280]">
                  {platformReadiness.requiredCount - platformReadiness.missingCount}/
                  {platformReadiness.requiredCount}
                </span>
              </div>

              {platformReadiness.missingReports.length === 0 ? (
                <p className="mt-3 text-sm text-[#1f4d3a]">
                  All required reports are validated.
                </p>
              ) : (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-[#6b7280]">
                    Missing for full audit
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-[#374151]">
                    {platformReadiness.missingReports.slice(0, 5).map((report) => (
                      <li key={report.id}>{report.label}</li>
                    ))}
                  </ul>
                  {platformReadiness.missingReports.length > 5 && (
                    <p className="mt-2 text-xs text-[#6b7280]">
                      +{platformReadiness.missingReports.length - 5} more
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#eee7dc] bg-[#faf9f7] p-3">
      <p className="text-xs font-medium text-[#6b7280]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#171717]">{value}</p>
    </div>
  );
}

function UploadedFileRow({ file }: { file: UploadedFile }) {
  return (
    <div className="rounded-md border border-[#eee7dc] bg-[#faf9f7] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="break-all text-sm font-medium text-[#171717]">
            {file.originalName}
          </p>
          <p className="mt-1 text-xs text-[#6b7280]">
            {file.reportType} - {file.validation?.rowCount || 0} rows
          </p>
        </div>
        <span
          className={`rounded px-2 py-1 text-xs font-semibold ${
            file.status === "VALIDATED"
              ? "bg-[#eff7f1] text-[#1f4d3a]"
              : "bg-red-50 text-red-700"
          }`}
        >
          {file.status}
        </span>
      </div>

      {file.validation?.missingColumns?.length ? (
        <p className="mt-2 text-xs leading-5 text-red-700">
          Missing: {file.validation.missingColumns.join(", ")}
        </p>
      ) : null}

      {file.validation?.dateRange ? (
        <p className="mt-2 text-xs leading-5 text-[#6b7280]">
          Date range: {file.validation.dateRange.start} to{" "}
          {file.validation.dateRange.end} ({file.validation.dateRange.days} days)
        </p>
      ) : null}

      {file.validation?.warnings?.length ? (
        <p className="mt-2 text-xs leading-5 text-[#6b7280]">
          {file.validation.warnings[0]}
        </p>
      ) : null}
    </div>
  );
}
