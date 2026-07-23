"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileClock,
  Gauge,
  GitCompareArrows,
  Lightbulb,
  LogOut,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
  Target,
  X,
  Zap,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { BrandLogo } from "@/components/brand-logo";
import { useLocalRecord } from "@/hooks/use-local-record";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  tag?: number | null;
  disabled?: boolean;
}

interface DashboardSidebarProps {
  active: string;
  userName: string;
  userEmail: string;
  orgName?: string | null;
  planLabel?: string | null;
  resultsHref: string | null;
  analysesCount?: number;
  priorityCount?: number;
  quickWinCount?: number;
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
  analysesCount,
  priorityCount,
  quickWinCount,
  onLogout,
  loggingOut,
}: DashboardSidebarProps) {
  const { resolved, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarState, setSidebarState] = useLocalRecord<{ collapsed?: boolean }>("aa-sidebar");
  const collapsed = Boolean(sidebarState.collapsed);

  const toggleCollapsed = () => {
    setSidebarState({ ...sidebarState, collapsed: !collapsed });
  };

  const workspace: NavItem[] = [
    { key: "home", label: "Dashboard", href: "/dashboard", icon: Gauge },
    {
      key: "priorities",
      label: "Top 5 Priorities",
      href: "/dashboard/priorities",
      icon: Target,
      tag: priorityCount,
    },
    {
      key: "quick-wins",
      label: "Quick Wins",
      href: "/dashboard/quick-wins",
      icon: Zap,
      tag: quickWinCount,
    },
    {
      key: "analyses",
      label: "Analyses",
      href: "/dashboard/analyses",
      icon: BarChart3,
      tag: analysesCount,
    },
    {
      key: "results",
      label: "Latest Report",
      href: resultsHref || "/dashboard",
      icon: FileClock,
      disabled: !resultsHref,
    },
    {
      key: "compare",
      label: "Compare",
      href: "/dashboard/audits/compare",
      icon: GitCompareArrows,
    },
  ];

  const account: NavItem[] = [
    { key: "billing", label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { key: "roadmap", label: "Roadmap", href: "/dashboard/roadmap", icon: Lightbulb },
    { key: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
    { key: "help", label: "Help & Docs", href: "/dashboard/help", icon: CircleHelp },
  ];

  const initials = (userName || userEmail || "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navGroup = (items: NavItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      return (
        <Link
          key={item.key}
          href={item.href}
          title={collapsed ? item.label : undefined}
          className={`sb-link ${active === item.key ? "active" : ""} ${item.disabled ? "disabled" : ""}`}
          aria-disabled={item.disabled}
          onClick={() => setMobileOpen(false)}
        >
          <Icon size={17} strokeWidth={1.9} />
          <span className="sb-label">{item.label}</span>
          {typeof item.tag === "number" && item.tag > 0 && (
            <span className="tag">{item.tag}</span>
          )}
        </Link>
      );
    });

  return (
    <>
      <button
        type="button"
        className="sb-mobile-trigger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="sb-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sb-head">
          <Link href="/dashboard" className="sb-logo" onClick={() => setMobileOpen(false)}>
            <BrandLogo
              size={34}
              imageClassName="sb-brand-image"
              labelClassName="sb-label"
            />
          </Link>
          <button
            type="button"
            className="sb-collapse"
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
          <button
            type="button"
            className="sb-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="sb-nav" aria-label="Dashboard navigation">
          <Link href="/dashboard/audits/new" className="sb-new" onClick={() => setMobileOpen(false)}>
            <Plus size={15} strokeWidth={2.4} />
            <span className="sb-label">New Audit</span>
          </Link>

          <div className="sb-section">Workspace</div>
          {navGroup(workspace)}

          <div className="sb-section">Account</div>
          {navGroup(account)}
        </nav>

        <div className="sb-spacer" />

        <button
          type="button"
          className="sb-theme"
          onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
          title={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
        >
          {resolved === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          <span className="sb-label">{resolved === "dark" ? "Light mode" : "Dark mode"}</span>
          <span className={`sb-theme-track ${resolved === "light" ? "on" : ""}`} aria-hidden="true">
            <span />
          </span>
        </button>

        <div className="sb-user">
          <div className="sb-avatar">{initials}</div>
          <div className="sb-user-meta sb-label">
            <div className="sb-user-name">{userName || userEmail}</div>
            <div className="sb-user-sub">{planLabel ? `${planLabel} / ` : ""}{orgName || userEmail}</div>
          </div>
          <button
            className="sb-logout"
            onClick={onLogout}
            disabled={loggingOut}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      </aside>
    </>
  );
}
