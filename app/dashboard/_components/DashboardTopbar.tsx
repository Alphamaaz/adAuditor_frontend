"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  CircleHelp,
  Clock3,
  FileText,
  Gauge,
  GitCompareArrows,
  Search,
  Settings,
  Target,
  X,
  Zap,
} from "lucide-react";
import { getAuditResumePath } from "@/lib/audit-navigation";
import type { Audit } from "@/lib/audits";
import { useLocalRecord } from "@/hooks/use-local-record";

interface DashboardTopbarProps {
  section: string;
  planLabel?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  audits?: Audit[];
}

const routeResults = [
  { label: "Dashboard", detail: "Account overview", href: "/dashboard", icon: Gauge },
  { label: "Top 5 Priorities", detail: "Highest-impact findings", href: "/dashboard/priorities", icon: Target },
  { label: "Quick Wins", detail: "Fast implementation actions", href: "/dashboard/quick-wins", icon: Zap },
  { label: "Analyses", detail: "Audit history", href: "/dashboard/analyses", icon: BarChart3 },
  { label: "Compare", detail: "Before-and-after audits", href: "/dashboard/audits/compare", icon: GitCompareArrows },
  { label: "Settings", detail: "Profile, connections, and alerts", href: "/dashboard/settings", icon: Settings },
];

const platformLabel: Record<string, string> = {
  META: "Meta Ads",
  GOOGLE: "Google Ads",
  TIKTOK: "TikTok Ads",
};

const notificationCopy = (audit: Audit) => {
  const platform = audit.selectedPlatforms.map((item) => platformLabel[item] || item).join(" + ") || "Account";
  if (audit.status === "COMPLETED") {
    return {
      title: `${platform} audit completed`,
      detail: typeof audit.healthScore === "number" ? `Health score ${audit.healthScore}/100` : "Your report is ready",
      tone: "good",
    };
  }
  if (audit.status === "FAILED") {
    return { title: `${platform} audit needs attention`, detail: "Open the audit to review the error", tone: "error" };
  }
  if (audit.status === "PROCESSING" || audit.status === "VALIDATING") {
    return { title: `${platform} audit is running`, detail: "Analysis is still in progress", tone: "active" };
  }
  return { title: `${platform} audit saved`, detail: "Continue setup when you are ready", tone: "neutral" };
};

const relativeTime = (value: string) => {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

export function DashboardTopbar({
  section,
  planLabel,
  userName,
  userEmail,
  audits = [],
}: DashboardTopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [notificationState, setNotificationState] = useLocalRecord<{ readAt?: string }>("aa-notifications");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const initials = (userName || userEmail || "A")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const latestNotifications = useMemo(
    () => [...audits].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 7),
    [audits]
  );
  const readAt = notificationState.readAt ? new Date(notificationState.readAt).getTime() : 0;
  const unreadCount = latestNotifications.filter((audit) => new Date(audit.updatedAt).getTime() > readAt).length;

  const searchResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const routes = routeResults.filter((item) => !needle || `${item.label} ${item.detail}`.toLowerCase().includes(needle));
    const auditResults = [...audits]
      .filter((audit) => {
        if (!needle) return true;
        const haystack = [
          audit.adAccount?.name,
          audit.status,
          audit.healthScore,
          ...audit.selectedPlatforms.map((item) => platformLabel[item] || item),
        ].join(" ").toLowerCase();
        return haystack.includes(needle);
      })
      .slice(0, 6);
    return { routes: routes.slice(0, 6), audits: auditResults };
  }, [audits, query]);

  const markNotificationsRead = () => {
    setNotificationState({ readAt: new Date().toISOString() });
  };

  return (
    <header className="topbar">
      <div className="tb-crumb">
        <span>AdAdviser</span>
        <span className="tb-separator">/</span>
        <strong>{section}</strong>
      </div>

      <button type="button" className="tb-search" onClick={() => setSearchOpen(true)} aria-label="Search dashboard">
        <Search size={15} strokeWidth={2} />
        <span>Search analyses, recommendations, accounts...</span>
        <kbd>Ctrl K</kbd>
      </button>

      <div className="tb-actions">
        {planLabel && <span className="tb-plan"><span className="dot" />{planLabel} plan</span>}
        <div className="tb-popover-wrap">
          <button
            type="button"
            className="tb-icon-btn tb-notification"
            title="Notifications"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((current) => !current);
              setSearchOpen(false);
            }}
          >
            <Bell size={17} strokeWidth={1.9} />
            {unreadCount > 0 && <span className="dot" />}
          </button>

          {notificationsOpen && (
            <div className="tb-popover notification-panel">
              <div className="tb-popover-head">
                <div><strong>Notifications</strong><span>{unreadCount ? `${unreadCount} unread` : "Up to date"}</span></div>
                {unreadCount > 0 && <button type="button" onClick={markNotificationsRead}>Mark all read</button>}
              </div>
              <div className="notification-list">
                {latestNotifications.length === 0 ? (
                  <div className="tb-popover-empty">Audit activity will appear here.</div>
                ) : latestNotifications.map((audit) => {
                  const copy = notificationCopy(audit);
                  const unread = new Date(audit.updatedAt).getTime() > readAt;
                  return (
                    <Link href={getAuditResumePath(audit)} className={`notification-item ${unread ? "unread" : ""}`} key={audit.id} onClick={() => setNotificationsOpen(false)}>
                      <span className={`notification-mark ${copy.tone}`}><FileText size={15} /></span>
                      <span><strong>{copy.title}</strong><small>{copy.detail}</small></span>
                      <time>{relativeTime(audit.updatedAt)}</time>
                    </Link>
                  );
                })}
              </div>
              <Link href="/dashboard/analyses" className="tb-popover-footer" onClick={() => setNotificationsOpen(false)}>View all activity</Link>
            </div>
          )}
        </div>
        <Link href="/dashboard/help" className="tb-icon-btn" title="Help" aria-label="Help">
          <CircleHelp size={17} strokeWidth={1.9} />
        </Link>
        <Link href="/dashboard/settings" className="tb-avatar-btn" title="Profile settings" aria-label="Profile settings">
          <span className="tb-avatar">{initials}</span>
        </Link>
      </div>

      {searchOpen && (
        <div className="command-backdrop" role="presentation" onMouseDown={() => setSearchOpen(false)}>
          <section className="command-panel" role="dialog" aria-modal="true" aria-label="Search dashboard" onMouseDown={(event) => event.stopPropagation()}>
            <div className="command-input">
              <Search size={18} />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pages, accounts, platforms, or scores"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={17} /></button>
            </div>
            <div className="command-results">
              {searchResults.routes.length > 0 && (
                <div className="command-group">
                  <div className="command-label">Pages</div>
                  {searchResults.routes.map((item) => {
                    const Icon = item.icon;
                    return <Link key={item.href} href={item.href} onClick={() => setSearchOpen(false)}><span className="command-icon"><Icon size={15} /></span><span><strong>{item.label}</strong><small>{item.detail}</small></span></Link>;
                  })}
                </div>
              )}
              {searchResults.audits.length > 0 && (
                <div className="command-group">
                  <div className="command-label">Audits</div>
                  {searchResults.audits.map((audit) => (
                    <Link key={audit.id} href={getAuditResumePath(audit)} onClick={() => setSearchOpen(false)}>
                      <span className="command-icon"><Clock3 size={15} /></span>
                      <span><strong>{audit.adAccount?.name || "Untitled audit"}</strong><small>{audit.selectedPlatforms.map((item) => platformLabel[item] || item).join(" + ")} / {audit.status.toLowerCase().replaceAll("_", " ")}</small></span>
                      {typeof audit.healthScore === "number" && <em>{audit.healthScore}/100</em>}
                    </Link>
                  ))}
                </div>
              )}
              {!searchResults.routes.length && !searchResults.audits.length && <div className="tb-popover-empty">No matching pages or audits.</div>}
            </div>
          </section>
        </div>
      )}
    </header>
  );
}
