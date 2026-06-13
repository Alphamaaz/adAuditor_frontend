"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  useAuthSessions,
  useChangePassword,
  useCurrentUser,
  useRevokeOtherSessions,
  useUpdateProfile,
} from "@/hooks/use-auth";
import { useConnections, useDisconnectPlatform } from "@/hooks/use-connections";
import { useMyPlanAndUsage } from "@/hooks/use-plans";
import { connectionsApi } from "@/lib/connections";
import type { Platform } from "@/lib/audits";
import { getErrorMessage } from "@/lib/api";
import { DashboardShell } from "../_components/DashboardShell";

type Tab = "profile" | "security" | "integrations" | "appearance";

const TABS: { key: Tab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "security", label: "Security" },
  { key: "integrations", label: "Integrations" },
  { key: "appearance", label: "Appearance" },
];

const PLATFORMS: { platform: Platform; label: string; mark: string; cls: string }[] = [
  { platform: "META", label: "Meta Ads", mark: "Mt", cls: "meta" },
  { platform: "GOOGLE", label: "Google Ads", mark: "Gg", cls: "google" },
  { platform: "TIKTOK", label: "TikTok Ads", mark: "Tk", cls: "tiktok" },
];

const formatDate = (value: string | null) => {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
};

function Alert({ tone, message }: { tone: "success" | "error"; message: string }) {
  return <div className={`alert ${tone}`}>{message}</div>;
}

export default function SettingsPage() {
  const { data: auth } = useCurrentUser();
  const { data: sessions = [] } = useAuthSessions();
  const { data: planUsage } = useMyPlanAndUsage();
  const { data: connections = [] } = useConnections();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const revokeOtherSessions = useRevokeOtherSessions();
  const disconnect = useDisconnectPlatform();

  const [tab, setTab] = useState<Tab>("profile");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");
  const [sessionError, setSessionError] = useState("");

  const user = auth?.user;
  const organization = auth?.organizations[0];
  const canEditOrganization = organization?.role === "OWNER";
  const effectivePlan = planUsage?.plan;

  const onProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage("");
    setProfileError("");
    const formData = new FormData(event.currentTarget);
    const nextName = String(formData.get("name") || "").trim();
    const nextOrganizationName = String(formData.get("organizationName") || "").trim();
    try {
      await updateProfile.mutateAsync({
        name: nextName || undefined,
        organizationName: canEditOrganization ? nextOrganizationName || undefined : undefined,
      });
      setProfileMessage("Profile updated.");
    } catch (err) {
      setProfileError(getErrorMessage(err));
    }
  };

  const onPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password changed. Other sessions were revoked.");
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    }
  };

  const onRevokeOtherSessions = async () => {
    setSessionMessage("");
    setSessionError("");
    try {
      const result = await revokeOtherSessions.mutateAsync();
      setSessionMessage(`${result.data.revokedCount} session(s) revoked.`);
    } catch (err) {
      setSessionError(getErrorMessage(err));
    }
  };

  const initials = (user?.name || user?.email || "?")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DashboardShell active="settings" section="Settings">
      <div className="page-head">
        <div className="page-head-text">
          <div className="page-eyebrow">Account settings</div>
          <h1 className="page-h1">
            Make AdAdviser <span className="em">yours</span>.
          </h1>
          <p className="page-h1-sub">
            Manage your profile, security, and platform integrations.
          </p>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Profile ─────────────────────────────────────────────── */}
      {tab === "profile" && (
        <div className="settings-section">
          <div className="settings-grid">
            <div>
              <div className="settings-section-h">Personal profile</div>
              <div className="settings-section-s">
                This is how teammates and AdAdviser will refer to you in reports and notifications.
              </div>
              <form onSubmit={onProfileSubmit}>
                <div className="field-grid">
                  <div className="field">
                    <label className="field-label">Full name</label>
                    <input className="field-input" name="name" defaultValue={user?.name || ""} />
                  </div>
                  <div className="field">
                    <label className="field-label">Work email</label>
                    <input className="field-input" value={user?.email || ""} disabled />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Organization name</label>
                  <input
                    className="field-input"
                    name="organizationName"
                    defaultValue={organization?.name || ""}
                    disabled={!canEditOrganization}
                  />
                  {!canEditOrganization && (
                    <p style={{ fontSize: 11.5, color: "var(--hint)", marginTop: 7 }}>
                      Only organization owners can update this field.
                    </p>
                  )}
                </div>
                {profileError && <Alert tone="error" message={profileError} />}
                {profileMessage && <Alert tone="success" message={profileMessage} />}
                <button type="submit" className="btn btn-primary" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving…" : "Save changes"}
                </button>
              </form>
            </div>
            <div>
              <label className="field-label">Account</label>
              <div style={{ background: "var(--card-2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div className="avatar xl">{initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", wordBreak: "break-word" }}>
                    {user?.email}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--hint)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                    Last login · {formatDate(user?.lastLoginAt ?? null)}
                  </div>
                </div>
              </div>

              <label className="field-label" style={{ marginTop: 18 }}>Plan</label>
              <div style={{ background: "var(--card-2)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                    {effectivePlan?.name || organization?.plan?.name || "No plan"}
                  </div>
                  <span className="pill good"><span className="dot" />Active</span>
                </div>
                <Link href="/dashboard/billing" className="btn btn-sm btn-ghost" style={{ marginTop: 14 }}>
                  Manage billing →
                </Link>
              </div>

              <label className="field-label" style={{ marginTop: 18 }}>Business profile</label>
              <div style={{ background: "var(--card-2)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 12 }}>
                  Onboarding answers used as default context for every audit and AI report.
                </div>
                <Link href="/onboarding?mode=edit" className="btn btn-sm btn-ghost">
                  Edit business profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Security ────────────────────────────────────────────── */}
      {tab === "security" && (
        <>
          <div className="settings-section">
            <div className="settings-section-h">Password &amp; access</div>
            <div className="settings-section-s">
              Changing your password signs out all other active sessions.
            </div>
            <form onSubmit={onPasswordSubmit}>
              <div className="field">
                <label className="field-label">Current password</label>
                <input
                  className="field-input"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="field-grid">
                <div className="field">
                  <label className="field-label">New password</label>
                  <input
                    className="field-input"
                    type="password"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field-label">Confirm</label>
                  <input
                    className="field-input"
                    type="password"
                    placeholder="Re-enter"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              {passwordError && <Alert tone="error" message={passwordError} />}
              {passwordMessage && <Alert tone="success" message={passwordMessage} />}
              <button type="submit" className="btn btn-primary" disabled={changePassword.isPending}>
                {changePassword.isPending ? "Updating…" : "Update password"}
              </button>
            </form>
          </div>

          <div className="settings-section">
            <div className="card-h" style={{ marginBottom: 18 }}>
              <div>
                <div className="settings-section-h">Active sessions</div>
                <div className="settings-section-s" style={{ marginBottom: 0 }}>
                  Review where your account is signed in and revoke old sessions.
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={onRevokeOtherSessions}
                disabled={revokeOtherSessions.isPending}
              >
                {revokeOtherSessions.isPending ? "Revoking…" : "Revoke others"}
              </button>
            </div>
            {sessionError && <Alert tone="error" message={sessionError} />}
            {sessionMessage && <Alert tone="success" message={sessionMessage} />}
            {sessions.length === 0 ? (
              <div className="empty-state">No active sessions found.</div>
            ) : (
              sessions.map((session) => (
                <div className="session-row" key={session.id}>
                  <div className="kpi-icon good">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div className="session-meta">
                    <div className="t">{session.isCurrent ? "Current session" : "Signed-in session"}</div>
                    <div className="s">
                      {session.userAgent || "Unknown browser"} · {session.ipAddress || "Unknown IP"} · expires {formatDate(session.expiresAt)}
                    </div>
                  </div>
                  {session.isCurrent && (
                    <span className="pill good"><span className="dot" />Current</span>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ── Integrations ────────────────────────────────────────── */}
      {tab === "integrations" && (
        <div className="settings-section">
          <div className="settings-section-h">Connected ad accounts</div>
          <div className="settings-section-s">
            AdAdviser reads campaign data via official APIs and CSV exports — read-only, no write access ever.
          </div>
          <div className="integ-grid">
            {PLATFORMS.map(({ platform, label, mark, cls }) => {
              const connection = connections.find((c) => c.platform === platform);
              const isConnected = connection?.status === "ACTIVE";
              return (
                <div className="integ-card" key={platform}>
                  <div className="integ-head">
                    <div className={`plat-mark ${cls}`}>{mark}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="integ-name">{label}</div>
                      <div className={`integ-status ${isConnected ? "" : "off"}`}>
                        <span className="dot" />
                        {isConnected ? "Connected" : "Not connected"}
                      </div>
                    </div>
                  </div>
                  {isConnected ? (
                    <button
                      className="btn btn-sm btn-ghost"
                      style={{ color: "#ff8a8a" }}
                      onClick={() => connection && disconnect.mutate(connection.id)}
                      disabled={disconnect.isPending}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <a className="btn btn-sm btn-primary" href={connectionsApi.getConnectUrl(platform)}>
                      Connect
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Appearance ──────────────────────────────────────────── */}
      {tab === "appearance" && (
        <div className="settings-section">
          <div className="settings-section-h">Theme</div>
          <div className="settings-section-s">
            AdAdviser ships dark by default — it&rsquo;s how performance dashboards belong. More themes are on the way.
          </div>
          <div className="theme-grid">
            <div className="theme-tile dark active"><div className="label">Dark · default</div></div>
            <div className="theme-tile midnight"><div className="label">Midnight · soon</div></div>
            <div className="theme-tile system"><div className="label">Match system · soon</div></div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
