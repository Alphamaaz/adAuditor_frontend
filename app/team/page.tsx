"use client";

import Link from "next/link";
import "../landing.css";

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.21 24 24 23.23 24 22.28V1.72C24 .77 23.21 0 22.22 0z"/>
  </svg>
);

const LogoSvg = ({ width = 28, height = 18 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 34 22" fill="none" aria-hidden="true">
    <path d="M2 11 C 8 2, 14 20, 20 11 S 30 2, 32 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    <circle cx="32" cy="11" r="2.6" fill="currentColor" />
  </svg>
);

const TEAM = [
  {
    initials: "AK", color: "av-violet", badge: "Co-founder",
    name: "Alex Khan", role: "CEO & Co-founder",
    bio: "10 years running paid media for e-commerce brands. Managed $40M+ in Google and Meta spend before building AdAdvisor to automate what he did manually every week.",
  },
  {
    initials: "SP", color: "av-lime", badge: "Co-founder",
    name: "Sara Patel", role: "CTO & Co-founder",
    bio: "Former ML engineer at a leading ad-tech firm. Built the rule engine and AI narrative layer that powers every AdAdvisor audit. Obsessed with making complex data legible.",
  },
  {
    initials: "JM", color: "av-teal", badge: "",
    name: "James Morris", role: "Head of Product",
    bio: "Previously product lead at a B2B SaaS analytics company. Shapes every audit workflow, report format, and onboarding step with one question: would a junior media buyer understand this immediately?",
  },
  {
    initials: "RT", color: "av-violet", badge: "",
    name: "Rosa Torres", role: "Head of Customer Success",
    bio: "Ran paid media at two agencies before joining. Turns every audit finding into a clear next action, and makes sure no recovered dollar slips back through the cracks.",
  },
  {
    initials: "DL", color: "av-lime", badge: "",
    name: "Daniel Lee", role: "Lead Engineer",
    bio: "Builds the data normalization pipeline that turns messy platform exports into clean, comparable datasets — across Google, Meta, and TikTok schemas.",
  },
  {
    initials: "MN", color: "av-teal", badge: "",
    name: "Maya Nair", role: "Performance Analyst",
    bio: "Maintains the industry benchmark tables behind every audit. Keeps the CPC, CTR, and conversion-rate baselines current across six verticals and three platforms.",
  },
];

export default function TeamPage() {
  return (
    <div className="landing-root">
      {/* Nav */}
      <nav className="lp-nav" id="lp-nav">
        <Link href="/" className="nav-logo">
          <LogoSvg /><div className="logo-dot" />AdAdvisor
        </Link>
        <div className="nav-cta">
          <Link href="/" className="btn-ghost">← Back to home</Link>
          <Link href="/signup" className="btn-primary">Get a demo →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="team-page-hero">
        <div className="orb orb-2" /><div className="orb orb-3" />
        <p className="section-eyebrow">The team</p>
        <h1 className="team-page-title">
          The people behind<br /><span className="em">the platform</span>.
        </h1>
        <p className="team-page-sub">
          A remote-first team of paid-media operators and engineers who got tired of watching
          good budget leak quietly — so we built the tool to catch it.
        </p>
      </section>

      {/* Team grid */}
      <section className="team-page-grid-section">
        <div className="team-grid">
          {TEAM.map((m) => (
            <div key={m.name} className="team-card">
              <div className="team-avatar-wrap">
                <div className={`team-avatar-placeholder ${m.color}`}>{m.initials}</div>
                {m.badge && <div className="team-avatar-badge">{m.badge}</div>}
              </div>
              <div className="team-name">{m.name}</div>
              <div className="team-role">{m.role}</div>
              <p className="team-bio">{m.bio}</p>
              <a href="#" className="team-linkedin" aria-label="LinkedIn"><LinkedInIcon />LinkedIn</a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-glow" />
          <h2 className="cta-title">Want to join<br />the <span className="em">team</span>?</h2>
          <p className="cta-sub">We hire operators and engineers who care about getting the numbers right.</p>
          <div className="cta-actions">
            <Link href="/signup" className="btn-hero">See open roles <span className="arrow-icon">→</span></Link>
            <Link href="/" className="btn-ghost-hero">Back to home</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <Link href="/" className="footer-logo"><LogoSvg width={22} height={14} />AdAdvisor</Link>
        <ul className="footer-links">
          <li><Link href="/privacy">Privacy</Link></li>
          <li><Link href="/terms">Terms</Link></li>
          <li><Link href="/team">Team</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
        </ul>
        <div className="footer-copy">© 2026 AdAdvisor. All rights reserved.</div>
      </footer>
    </div>
  );
}
