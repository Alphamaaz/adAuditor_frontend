"use client";

import { useCurrentUser } from "@/hooks/use-auth";
import {
  useOrgAccounts,
  useOrgMembers,
  useAssignAccount,
  useSetMonitoring,
  useUpdateAlertPreferences,
} from "@/hooks/use-alert-routing";

const PLATFORM_LABEL: Record<string, string> = {
  META: "Meta",
  GOOGLE: "Google",
  TIKTOK: "TikTok",
};

export function AlertsSettings() {
  const { data: auth } = useCurrentUser();
  const userId = auth?.user?.id;
  const isOwner = auth?.organizations?.[0]?.role === "OWNER";

  const { data: members = [], isLoading: membersLoading } = useOrgMembers();
  const { data: accounts = [], isLoading: accountsLoading } = useOrgAccounts();
  const assignAccount = useAssignAccount();
  const setMonitoring = useSetMonitoring();
  const updatePrefs = useUpdateAlertPreferences();

  const myMembership = members.find((m) => m.userId === userId);
  const myAlertsEnabled = myMembership?.alertsEnabled ?? true;

  const memberName = (m: { user: { name: string | null; email: string } }) =>
    m.user.name || m.user.email;

  return (
    <>
      {/* ── My alert preference ─────────────────────────────────── */}
      <div className="settings-section">
        <div className="settings-section-h">Email alerts</div>
        <div className="settings-section-s">
          We email you only when something urgent is <strong>new</strong> on an audited account —
          a disapproved ad, a tracking break, a sudden zero-conversion campaign, or a sharp CPA
          spike. Known issues from your last report are never repeated.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            background: "var(--card-2)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "16px 20px",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
              Send me account alerts
            </div>
            <div style={{ fontSize: 12, color: "var(--hint)", marginTop: 4 }}>
              Delivered to {auth?.user?.email || "your email"} for accounts you run or are assigned.
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={myAlertsEnabled}
            disabled={updatePrefs.isPending || membersLoading}
            onClick={() => updatePrefs.mutate(!myAlertsEnabled)}
            style={{
              flexShrink: 0,
              width: 46,
              height: 26,
              borderRadius: 99,
              border: "none",
              cursor: "pointer",
              padding: 3,
              transition: "background .15s",
              background: myAlertsEnabled ? "var(--good, #2f9e6f)" : "var(--border)",
              opacity: updatePrefs.isPending ? 0.6 : 1,
            }}
          >
            <span
              style={{
                display: "block",
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#fff",
                transform: myAlertsEnabled ? "translateX(20px)" : "translateX(0)",
                transition: "transform .15s",
              }}
            />
          </button>
        </div>
      </div>

      {/* ── Account routing (owners only) ───────────────────────── */}
      {isOwner && (
        <div className="settings-section">
          <div className="settings-section-h">Account routing &amp; monitoring</div>
          <div className="settings-section-s">
            Assign a client account to the teammate who manages it — only they (and whoever runs
            the audit) get its alerts; unassigned accounts notify all owners. Turn on{" "}
            <strong>Auto re-audit</strong> to re-pull data and re-run the audit weekly (Google
            accounts; activates once your workspace enables scheduled monitoring).
          </div>

          {accountsLoading ? (
            <div className="empty-state">Loading accounts…</div>
          ) : accounts.length === 0 ? (
            <div className="empty-state">
              No ad accounts yet. Connect and audit an account to route its alerts.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {accounts.map((account) => (
                <div
                  key={account.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: "var(--card-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: "14px 18px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: "var(--text)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {account.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--hint)",
                        fontFamily: "var(--font-mono)",
                        marginTop: 3,
                      }}
                    >
                      {PLATFORM_LABEL[account.platform] || account.platform}
                    </div>
                  </div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexShrink: 0,
                      fontSize: 12,
                      color: "var(--text-dim)",
                      cursor: "pointer",
                    }}
                    title="Re-pull data and re-audit this account automatically each week"
                  >
                    <button
                      type="button"
                      role="switch"
                      aria-checked={account.monitoringEnabled}
                      disabled={setMonitoring.isPending}
                      onClick={() =>
                        setMonitoring.mutate({
                          adAccountId: account.id,
                          monitoringEnabled: !account.monitoringEnabled,
                        })
                      }
                      style={{
                        width: 38,
                        height: 22,
                        borderRadius: 99,
                        border: "none",
                        cursor: "pointer",
                        padding: 3,
                        background: account.monitoringEnabled ? "var(--good, #2f9e6f)" : "var(--border)",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: "#fff",
                          transform: account.monitoringEnabled ? "translateX(16px)" : "translateX(0)",
                          transition: "transform .15s",
                        }}
                      />
                    </button>
                    Auto re-audit
                  </label>
                  <select
                    className="field-input"
                    style={{ width: 200, flexShrink: 0 }}
                    value={account.assignedUserId ?? ""}
                    disabled={assignAccount.isPending}
                    onChange={(e) =>
                      assignAccount.mutate({
                        adAccountId: account.id,
                        assignedUserId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">All owners (default)</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {memberName(m)}
                        {m.alertsEnabled ? "" : " (alerts muted)"}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
