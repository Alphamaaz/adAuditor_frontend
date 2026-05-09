import type { Audit } from "./audits";

export const getAuditResumePath = (audit: Audit) => {
  if (audit.status === "COMPLETED") {
    return `/dashboard/audits/${audit.id}/results`;
  }

  if (audit.status === "INTAKE_IN_PROGRESS") {
    return `/dashboard/audits/${audit.id}/intake`;
  }

  if (audit.dataSource === "OAUTH") {
    return `/dashboard/audits/${audit.id}/connect`;
  }

  if (
    audit.status === "WAITING_FOR_DATA" ||
    audit.status === "VALIDATING" ||
    audit.status === "PROCESSING" ||
    audit.status === "FAILED"
  ) {
    return `/dashboard/audits/${audit.id}/upload`;
  }

  return `/dashboard/audits/${audit.id}/intake`;
};

export const getAuditResumeLabel = (audit: Audit) => {
  if (audit.status === "COMPLETED") return "Open report";
  if (audit.status === "INTAKE_IN_PROGRESS") return "Continue intake";
  if (audit.dataSource === "OAUTH") return "Continue connection";
  if (audit.status === "FAILED") return "Review upload";
  return "Continue audit";
};
