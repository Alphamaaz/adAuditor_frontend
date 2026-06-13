"use client";

import Link from "next/link";

type NavIcon =
  | "home"
  | "plus"
  | "report"
  | "compare"
  | "billing"
  | "settings"
  | "help";

const icons: Record<NavIcon, React.ReactNode> = {
  home: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  ),
  plus: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  ),
  report: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  ),
  compare: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3 4 7l4 4" />
      <path d="M4 7h16" />
      <path d="M16 21l4-4-4-4" />
      <path d="M20 17H4" />
    </svg>
  ),
  billing: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  help: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.1 9a3 3 0 1 1 5.82 1c0 2-3 2.5-3 4.5" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
};

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: NavIcon;
  tag?: string;
  disabled?: boolean;
}

interface DashboardSidebarProps {
  active: string;
  userName: string;
  userEmail: string;
  orgName?: string | null;
  planLabel?: string | null;
  resultsHref: string | null;
  onLogout: () => void;
  loggingOut: boolean;
}

export function DashboardSidebar({
  active,
  userName,
  userEmail,
  orgName,
  planLabel,
  resultsHref,
  onLogout,
  loggingOut,
}: DashboardSidebarProps) {
  const workspace: NavItem[] = [
    { key: "home", label: "Dashboard", href: "/dashboard", icon: "home" },
    {
      key: "results",
      label: "Latest Report",
      href: resultsHref || "/dashboard",
      icon: "report",
      disabled: !resultsHref,
    },
    {
      key: "compare",
      label: "Compare",
      href: "/dashboard/audits/compare",
      icon: "compare",
    },
  ];

  const account: NavItem[] = [
    { key: "billing", label: "Billing", href: "/dashboard/billing", icon: "billing" },
    { key: "settings", label: "Settings", href: "/dashboard/settings", icon: "settings" },
    { key: "help", label: "Help & Docs", href: "/dashboard/help", icon: "help" },
  ];

  const initials = (userName || userEmail || "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <span className="mark">A</span>
        AdAdviser
      </div>

      <Link href="/dashboard/audits/new" className="sb-new">
        {icons.plus}
        New Audit
      </Link>

      <div className="sb-section">Workspace</div>
      {workspace.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`sb-link ${active === item.key ? "active" : ""} ${item.disabled ? "disabled" : ""}`}
          aria-disabled={item.disabled}
        >
          {icons[item.icon]}
          {item.label}
          {item.tag && <span className="tag">{item.tag}</span>}
        </Link>
      ))}

      <div className="sb-section">Account</div>
      {account.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`sb-link ${active === item.key ? "active" : ""}`}
        >
          {icons[item.icon]}
          {item.label}
        </Link>
      ))}

      <div className="sb-spacer" />

      <div className="sb-user">
        <div className="sb-avatar">{initials}</div>
        <div className="sb-user-meta">
          <div className="sb-user-name">{userName || userEmail}</div>
          <div className="sb-user-sub">{planLabel ? `${planLabel} · ` : ""}{orgName || userEmail}</div>
        </div>
        <button
          className="sb-logout"
          onClick={onLogout}
          disabled={loggingOut}
          title="Log out"
          aria-label="Log out"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
