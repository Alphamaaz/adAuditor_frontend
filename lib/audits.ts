import api from "./api";

export type Platform = "META" | "GOOGLE" | "TIKTOK";
export type DataSource = "MANUAL_UPLOAD" | "OAUTH";

export interface AdAccount {
  id: string;
  name: string;
  platform: Platform;
  externalId: string | null;
  createdAt: string;
}

export interface Audit {
  id: string;
  organizationId: string;
  adAccountId: string | null;
  status:
    | "DRAFT"
    | "INTAKE_IN_PROGRESS"
    | "WAITING_FOR_DATA"
    | "VALIDATING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED";
  selectedPlatforms: Platform[];
  dataSource: DataSource | null;
  healthScore: number | null;
  categoryScores: unknown;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  adAccount: AdAccount | null;
  intakeResponses?: IntakeResponse[];
  uploadedFiles?: UploadedFile[];
  normalizedDataset?: NormalizedDataset;
  ruleFindings?: RuleFinding[];
  aiReport?: AiReport;
  pdfReports?: PdfReport[];
  uploadReadiness?: UploadReadiness;
}

export interface IntakeResponse {
  id: string;
  auditId: string;
  section: string;
  answers: Record<string, AnswerValue>;
  createdAt: string;
  updatedAt: string;
}

export type AnswerValue = string | number | boolean | string[] | null;

export type PlatformIntakeResponses = Partial<
  Record<Platform, Record<string, AnswerValue>>
>;

export interface UploadedFile {
  id: string;
  auditId: string;
  platform: Platform;
  reportType: string;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  status: "PENDING" | "VALIDATED" | "INVALID" | "PROCESSED";
  validation: {
    isValid: boolean;
    rowCount: number;
    columns: string[];
    requiredColumns: string[];
    missingColumns: string[];
    dateRange: {
      start: string;
      end: string;
      days: number;
      source: string;
      maxAllowedDays: number;
    } | null;
    warnings: string[];
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedDataset {
  id: string;
  auditId: string;
  summary: NormalizedSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedSummary {
  platforms?: Partial<Record<Platform, PlatformUploadSummary>>;
  totals?: PlatformUploadSummary;
}

export interface PlatformUploadSummary {
  uploadedFiles: number;
  rowCount: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  reach: number;
}

export interface RequiredUploadReport {
  id: string;
  label: string;
}

export interface PlatformReadiness {
  status: "FULL" | "LIMITED";
  validatedFileCount: number;
  requiredReports: RequiredUploadReport[];
  uploadedReports: RequiredUploadReport[];
  missingReports: RequiredUploadReport[];
  missingCount: number;
  requiredCount: number;
}

export interface UploadReadiness {
  mode: "FULL" | "LIMITED" | "NOT_READY";
  fullAuditReady: boolean;
  limitedAuditAvailable: boolean;
  canRunAudit: boolean;
  validatedFileCount: number;
  requiredCount: number;
  completedRequiredCount: number;
  missingRequiredCount: number;
  platforms: Partial<Record<Platform, PlatformReadiness>>;
}

export interface RuleFinding {
  id: string;
  auditId: string;
  ruleId: string;
  platform: Platform | null;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
  title: string;
  detail: string | null;
  evidence: unknown;
  estimatedImpact: string | null;
  fixSteps: string[] | null;
  createdAt: string;
}

export interface AiReport {
  id: string;
  auditId: string;
  provider: string;
  model: string;
  promptMeta: unknown;
  output: {
    executiveSummary?: string[];
    topPriorities?: Array<{
      ruleId: string;
      platform: Platform | null;
      severity: RuleFinding["severity"];
      title: string;
      estimatedImpact?: string;
    }>;
    quickWins?: Array<{
      ruleId: string;
      platform: Platform | null;
      title: string;
      fixSteps?: string[];
    }>;
    confidenceNotes?: string[];
    clientReadyRecommendations?: Array<{
      headline: string;
      explanation: string;
      nextSteps: string[];
      sourceRuleIds: string[];
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PdfReport {
  id: string;
  auditId: string;
  version: number;
  downloadUrl: string;
  createdAt: string;
}

/**
 * One row of the score-trend dataset returned by /audits/history.
 * Slim by design — fits a sparkline plus a tooltip card.
 */
export interface AuditTrendPoint {
  auditId: string;
  adAccount: {
    id: string;
    name: string;
    platform: Platform;
  } | null;
  selectedPlatforms: Platform[];
  healthScore: number | null;
  categoryScores: unknown;
  completedAt: string | null;
  createdAt: string;
  findingCounts: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    total: number;
  };
  memorySummary: unknown;
}

/**
 * One side of a comparison response.
 */
export interface AuditComparisonSide {
  auditId: string;
  adAccount: {
    id: string;
    name: string;
    platform: Platform;
  } | null;
  selectedPlatforms: Platform[];
  status: Audit["status"];
  healthScore: number | null;
  categoryScores: unknown;
  completedAt: string | null;
  createdAt: string;
  findingCounts: {
    total: number;
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
  ruleIds: string[];
  memorySummary: unknown;
}

export interface AuditComparisonDelta {
  left: number | null;
  right: number | null;
  delta: number | null;
  deltaPct: number | null;
}

export interface AuditComparison {
  left: AuditComparisonSide;
  right: AuditComparisonSide;
  deltas: {
    healthScore: AuditComparisonDelta;
    totalFindings: AuditComparisonDelta;
    critical: AuditComparisonDelta;
    high: AuditComparisonDelta;
    medium: AuditComparisonDelta;
    low: AuditComparisonDelta;
    spend: AuditComparisonDelta;
    impressions: AuditComparisonDelta;
    clicks: AuditComparisonDelta;
    conversions: AuditComparisonDelta;
  };
  rulesDiff: {
    new: string[];
    resolved: string[];
    persisted: string[];
  };
}

export interface CreateAuditSetupInput {
  accountName: string;
  selectedPlatforms: Platform[];
  dataSource: DataSource;
}

export interface CreateAuditSetupResult {
  audit: Audit;
  adAccounts: AdAccount[];
}

export interface SubmitPlatformIntakeInput {
  auditId: string;
  responses: PlatformIntakeResponses;
}

export interface SubmitPlatformIntakeResult {
  audit: Audit;
  intakeResponses: IntakeResponse[];
}

export interface UploadAuditFileInput {
  auditId: string;
  platform: Platform;
  reportType: string;
  file: File;
}

export interface UploadAuditFileResult {
  uploadedFile: UploadedFile;
  normalizedDataset: NormalizedDataset | null;
}

export const auditsApi = {
  list: async (): Promise<Audit[]> => {
    const res = await api.get<{ status: string; data: Audit[] }>("/api/audits");
    return res.data.data;
  },

  listAdAccounts: async (): Promise<AdAccount[]> => {
    const res = await api.get<{ status: string; data: AdAccount[] }>(
      "/api/audits/ad-accounts"
    );
    return res.data.data;
  },

  createSetup: async (
    input: CreateAuditSetupInput
  ): Promise<CreateAuditSetupResult> => {
    const res = await api.post<{
      status: string;
      data: CreateAuditSetupResult;
    }>("/api/audits/setup", input);

    return res.data.data;
  },

  get: async (auditId: string): Promise<Audit> => {
    const res = await api.get<{ status: string; data: Audit }>(
      `/api/audits/${auditId}`
    );
    return res.data.data;
  },

  submitPlatformIntake: async ({
    auditId,
    responses,
  }: SubmitPlatformIntakeInput): Promise<SubmitPlatformIntakeResult> => {
    const res = await api.post<{
      status: string;
      data: SubmitPlatformIntakeResult;
    }>(`/api/audits/${auditId}/platform-intake`, { responses });

    return res.data.data;
  },

  uploadFile: async ({
    auditId,
    platform,
    reportType,
    file,
  }: UploadAuditFileInput): Promise<UploadAuditFileResult> => {
    const formData = new FormData();
    formData.append("platform", platform);
    formData.append("reportType", reportType);
    formData.append("file", file);

    const res = await api.post<{
      status: string;
      data: UploadAuditFileResult;
    }>(`/api/audits/${auditId}/uploads`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.data;
  },

  /**
   * Triggers the audit pipeline. The backend returns 202 with the audit
   * already marked PROCESSING; the actual engine + AI + PDF run on a worker.
   * Callers should poll `useAudit(auditId)` until status is COMPLETED or FAILED.
   */
  run: async (auditId: string): Promise<Audit> => {
    const res = await api.post<{
      status: "queued" | "success";
      data: Audit;
      meta?: { jobId?: string; driver?: string };
    }>(`/api/audits/${auditId}/run`);
    return res.data.data;
  },

  /**
   * Queues AI report generation. Returns 202 with a job ID. The audit's
   * `aiReport` field updates once the worker finishes — poll for it.
   */
  generateAiReport: async (
    auditId: string
  ): Promise<{ auditId: string; jobId: string; driver: string }> => {
    const res = await api.post<{
      status: "queued";
      data: { auditId: string; jobId: string; driver: string };
    }>(`/api/audits/${auditId}/ai-report`);
    return res.data.data;
  },

  /**
   * Queues PDF report generation. Returns 202 with a job ID. Poll the audit
   * for `pdfReports` to populate.
   */
  generatePdfReport: async (
    auditId: string
  ): Promise<{ auditId: string; jobId: string; driver: string }> => {
    const res = await api.post<{
      status: "queued";
      data: { auditId: string; jobId: string; driver: string };
    }>(`/api/audits/${auditId}/pdf`);
    return res.data.data;
  },

  /**
   * Score-trend points for the dashboard. Optional filters:
   *   - adAccountId: limit to one ad account
   *   - platform: only include audits whose selectedPlatforms includes this
   */
  history: async (params?: {
    adAccountId?: string;
    platform?: Platform;
    limit?: number;
  }): Promise<AuditTrendPoint[]> => {
    const res = await api.get<{ status: string; data: AuditTrendPoint[] }>(
      "/api/audits/history",
      { params }
    );
    return res.data.data;
  },

  /**
   * Side-by-side comparison of two audits. Convention: left = older,
   * right = newer (deltas are computed as right - left).
   */
  compare: async (
    leftAuditId: string,
    rightAuditId: string
  ): Promise<AuditComparison> => {
    const res = await api.get<{ status: string; data: AuditComparison }>(
      "/api/audits/compare",
      { params: { left: leftAuditId, right: rightAuditId } }
    );
    return res.data.data;
  },

  downloadPdfReport: async (
    auditId: string,
    pdfReportId: string
  ): Promise<{ blob: Blob; fileName: string }> => {
    const res = await api.get<Blob>(
      `/api/audits/${auditId}/pdf/${pdfReportId}/download`,
      {
        responseType: "blob",
      }
    );
    const disposition = res.headers["content-disposition"];
    const fileNameMatch =
      typeof disposition === "string"
        ? disposition.match(/filename="?([^"]+)"?/)
        : null;

    return {
      blob: res.data,
      fileName: fileNameMatch?.[1] || "ad-audit-report.pdf",
    };
  },
};
