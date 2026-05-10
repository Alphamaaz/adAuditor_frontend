export interface User {
  id: string;
  email: string;
  name: string | null;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "DELETED";
  internalRole: "USER" | "SUPER_ADMIN" | "SUPPORT_ADMIN";
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  role: "OWNER" | "MEMBER" | "VIEWER";
  ownerId: string;
  createdAt: string;
  plan?: {
    id: string;
    name: string;
    slug: string;
    status: string;
    isOverridden: boolean;
  } | null;
}

export interface AuthPayload {
  user: User;
  organizations: Organization[];
  hasBusinessProfile: boolean;
  isImpersonating?: boolean;
}

export interface AuthSession {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isCurrent: boolean;
}

export interface ApiError {
  status: "fail" | "error";
  message: string;
  details?: Record<string, string[]>;
}
