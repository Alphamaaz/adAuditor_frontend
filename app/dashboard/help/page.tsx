"use client";

import Link from "next/link";
import { DashboardShell } from "../_components/DashboardShell";

interface HelpCard {
  title: string;
  desc: string;
  meta: string;
  href: string;
  icon: React.ReactNode;
}

const cards: HelpCard[] = [
  {
    title: "Getting started guide",
    desc: "Connect or upload your first ad account and ship your first analysis in minutes.",
    meta: "Walkthrough",
    href: "/dashboard/audits/new",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    title: "How the AI scoring works",
    desc: "Understand the health-score formula, category weights, and benchmark cohorts.",
    meta: "Reference",
    href: "/about",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: "CSV format reference",
    desc: "Column-by-column breakdown of what AdAdviser expects from each platform export.",
    meta: "Reference",
    href: "/dashboard/audits/new",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
      </svg>
    ),
  },
];

export default function HelpPage() {
  return (
    <DashboardShell active="help" section="Help & Docs">
      <div className="page-head">
        <div className="page-head-text">
          <div className="page-eyebrow">Help &amp; docs</div>
          <h1 className="page-h1">
            Need a <span className="em">hand</span>?
          </h1>
          <p className="page-h1-sub">
            Guides, references, and a direct line to the AdAdviser team. We aim to answer most
            questions within one business day.
          </p>
        </div>
        <div className="page-head-actions">
          <a href="mailto:support@adadviser.app" className="btn btn-primary">
            Talk to support →
          </a>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 22 }}>
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="qw-card" style={{ textDecoration: "none" }}>
            <div className="qw-h">
              <div className="qw-mark">{card.icon}</div>
              <div className="qw-title">{card.title}</div>
            </div>
            <div className="qw-desc">{card.desc}</div>
            <div className="qw-foot">
              <span className="qw-impact" style={{ color: "var(--violet-light)" }}>{card.meta}</span>
              <span className="btn btn-sm btn-ghost">Open →</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-title-lg">Still <span className="em">stuck</span>?</div>
            <div className="card-sub">Reach the team directly</div>
          </div>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
          Email us at{" "}
          <a href="mailto:support@adadviser.app" className="link-lime">support@adadviser.app</a>{" "}
          with your account email and a short description of the issue. Screenshots and the audit ID
          (from the report URL) help us resolve things faster.
        </p>
      </div>
    </DashboardShell>
  );
}
