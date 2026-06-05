"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { CASE_STUDIES } from "./case-studies/data";
import "./landing.css";

/* ─────────────────────────────────────────────
   Static data — module-level, never recreated
───────────────────────────────────────────── */
const CHART_DATA_BASE = [
  [40, 55], [65, 48], [50, 70], [80, 62],
  [55, 85], [70, 55], [90, 75], [60, 90],
  [85, 65], [75, 88],
];
const varyChart = () =>
  CHART_DATA_BASE.map(([h1, h2]) => [
    Math.min(95, Math.max(12, h1 + Math.floor((Math.random() - 0.5) * 32))),
    Math.min(95, Math.max(12, h2 + Math.floor((Math.random() - 0.5) * 32))),
  ]);

const INDUSTRY_BENCHMARKS: Record<string, Record<string, number>> = {
  ecommerce: { google: 3.5, meta: 1.8, tiktok: 1.2 },
  saas:      { google: 2.8, meta: 1.2, tiktok: 0.8 },
  local:     { google: 5.0, meta: 2.5, tiktok: 1.5 },
  leadgen:   { google: 4.2, meta: 2.8, tiktok: 1.8 },
  finance:   { google: 3.8, meta: 1.5, tiktok: 0.9 },
  health:    { google: 2.5, meta: 2.2, tiktok: 2.8 },
};
const STRUCTURAL_WASTE: Record<string, number> = {
  google: 0.12, meta: 0.15, tiktok: 0.18,
};
// Average cost-per-click ($) by industry × platform — industry averages
const AVG_CPC: Record<string, Record<string, number>> = {
  ecommerce: { google: 1.16, meta: 0.70, tiktok: 0.50 },
  saas:      { google: 3.80, meta: 1.40, tiktok: 0.90 },
  local:     { google: 2.40, meta: 1.10, tiktok: 0.70 },
  leadgen:   { google: 2.90, meta: 1.20, tiktok: 0.80 },
  finance:   { google: 4.20, meta: 1.80, tiktok: 1.10 },
  health:    { google: 2.10, meta: 1.00, tiktok: 0.65 },
};
const PLATFORMS = [
  { key: "google", label: "Google Ads" },
  { key: "meta",   label: "Meta Ads"   },
  { key: "tiktok", label: "TikTok Ads" },
] as const;
const INDUSTRIES = [
  { key: "ecommerce", label: "E-commerce",      icon: "🛒" },
  { key: "saas",      label: "SaaS / B2B",      icon: "💻" },
  { key: "local",     label: "Local Services",  icon: "📍" },
  { key: "leadgen",   label: "Lead Generation", icon: "🎯" },
  { key: "finance",   label: "Finance",          icon: "💰" },
  { key: "health",    label: "Health & Beauty", icon: "💄" },
] as const;
const SPEND_PRESETS = [250, 500, 1000, 5000, 10000, 25000];
const WASTE_CYCLE   = [7840, 8390, 9140, 9580, 8720];
const FAQS = [
  { q: "Can AdAdviser change my campaigns?",
    a: "No — and it never will. Access is strictly read-only. AdAdviser can see your data to audit it, but it cannot touch a bid, a budget, or a campaign. Every fix is a recommendation you decide whether to act on. Your account stays entirely in your hands." },
  { q: "Is my data safe? Do you store my login?",
    a: "We connect through OAuth, so we never see or store your passwords. We're GDPR compliant, and your data is used only to generate your audit — never sold, never shared. You can disconnect any account in one click, anytime." },
  { q: "Which platforms do you support?",
    a: "Google Ads, Meta Ads, and TikTok Ads today, with full audit depth on each. Microsoft Ads and LinkedIn Ads are coming soon. You can audit any combination of connected accounts from one dashboard." },
  { q: "How is this different from the analytics already in Google or Meta?",
    a: "Native dashboards report what happened. AdAdviser tells you what's wrong, ranks it by dollar impact, and writes the fix in plain English. It runs 150+ checks those dashboards simply don't — across overlap, pacing, tracking integrity, and more." },
  { q: "How long does an audit actually take?",
    a: "Under three minutes for a full account — the same audit that takes a senior strategist around six hours by hand. Connect, scan, and your prioritised fix list is ready before you've finished your coffee." },
  { q: "What happens after the free audit?",
    a: "You get your full results and fix list, free, with no credit card. If they're worth acting on, you can turn on continuous monitoring so the audit reruns automatically and flags new issues the moment they appear." },
  { q: "Am I locked into a contract?",
    a: "Never. Every plan is month-to-month, cancel anytime, no penalty. Annual billing is there if you want 20% off — but it's a choice, not a trap." },
  { q: "Can my whole team use it?",
    a: "Yes. Pro supports multiple accounts and users, and Agency adds SSO and team roles so everyone works from the same audits with the right permissions. One source of truth, no spreadsheet hand-offs." },
];

const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2L4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SecurityBadges = ({ center = false }: { center?: boolean }) => (
  <div className={`sec-badges${center ? " sec-badges-center" : ""}`}>
    <span className="sec-badge"><ShieldIcon /> Read-only access</span>
    <span className="sec-badge"><ShieldIcon /> OAuth 2.0</span>
    <span className="sec-badge"><ShieldIcon /> 256-bit SSL</span>
    <span className="sec-badge"><ShieldIcon /> GDPR compliant</span>
  </div>
);

const LogoSvg = ({ width = 28, height = 18 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 34 22" fill="none" aria-hidden="true">
    <path d="M2 11 C 8 2, 14 20, 20 11 S 30 2, 32 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    <circle cx="32" cy="11" r="2.6" fill="currentColor" />
  </svg>
);

/* ─────────────────────────────────────────────
   Island 1 — Animated Dashboard
   Re-renders up to every 1500ms but only this subtree.
───────────────────────────────────────────── */
const ISSUES = [
  { text: "Low quality score keywords — CPC up 34%",          note: "~$1,240/mo",                          sev: "critical", label: "Critical" },
  { text: "Budget pacing irregular across 3 campaigns",        note: "spend front-loaded, dark by day 18",  sev: "critical", label: "Critical" },
  { text: "Brand terms running without RLSA protection",       note: "competitors bidding your terms",      sev: "warning",  label: "Warning"  },
  { text: "Conversion tracking fully verified",                note: "no double-counting detected",         sev: "ok",       label: "Good"     },
];

const PREVIEW_CALLOUTS = [
  "150+ rules, live",
  "Wasted spend, in dollars",
  "Issues ranked by impact",
  "Plain-English fixes",
  "One-click report export",
];

const AnimatedDashboard = memo(function AnimatedDashboard() {
  const [chartData, setChartData]           = useState(CHART_DATA_BASE);
  const [dashWaste, setDashWaste]           = useState(9140);
  const [dashWasteVisible, setDashWasteVisible] = useState(true);
  const [activeIssue, setActiveIssue]       = useState(0);
  const [scanPct, setScanPct]               = useState(68);

  useEffect(() => {
    let wIdx = 2;
    const wasteTimer = setInterval(() => {
      setDashWasteVisible(false);
      setTimeout(() => {
        wIdx = (wIdx + 1) % WASTE_CYCLE.length;
        setDashWaste(WASTE_CYCLE[wIdx]);
        setDashWasteVisible(true);
      }, 300);
    }, 3800);

    const issueTimer = setInterval(() => {
      setActiveIssue(i => (i + 1) % 4);
    }, 2200);

    // Slowed from 900ms → 1500ms; still looks live, half the renders
    const scanTimer = setInterval(() => {
      setScanPct(p => (p >= 98 ? 12 : p + Math.floor(Math.random() * 8 + 3)));
    }, 1500);

    const chartTimer = setInterval(() => {
      setChartData(varyChart());
    }, 3200);

    return () => {
      clearInterval(wasteTimer);
      clearInterval(issueTimer);
      clearInterval(scanTimer);
      clearInterval(chartTimer);
    };
  }, []);

  return (
    <section className="preview-section" id="platform">
      <p className="section-eyebrow reveal">Inside the audit engine</p>
      <h2 className="section-title reveal reveal-delay-1">
        Watch the AI catch what your<br /><span className="em">dashboard never flags</span>.
      </h2>
      <div className="preview-callouts reveal reveal-delay-2">
        {PREVIEW_CALLOUTS.map(c => (
          <span key={c} className="preview-callout"><span className="preview-callout-dot" />{c}</span>
        ))}
      </div>

      <div className="floating-badge badge-top-left">
        <div className="badge-inner">
          <div className="badge-indicator ind-green" />
          <span className="dash-live-num" style={{ opacity: dashWasteVisible ? 1 : 0 }}>
            ${Math.round(dashWaste * 0.354).toLocaleString()}{" "}
            <span style={{ color: "var(--hint)", fontWeight: 400 }}>recoverable/mo</span>
          </span>
        </div>
      </div>
      <div className="floating-badge badge-bottom-right">
        <div className="badge-inner">
          <div className="badge-indicator ind-amber" />
          <span>23 issues found <span style={{ color: "var(--hint)", fontWeight: 400 }}>· 6 critical</span></span>
        </div>
      </div>

      <div className="preview-container">
        <div className="dash-topbar">
          <div className="dash-dot red" /><div className="dash-dot yellow" /><div className="dash-dot green" />
          <div className="dash-url">app.adadvisor.com/campaigns/audit</div>
        </div>
        <div className="dash-body">
          <aside className="dash-sidebar">
            <div className="sidebar-section">Overview</div>
            <div className="sidebar-item active"><div className="sidebar-icon" />AI Audit Engine</div>
            <div className="sidebar-item"><div className="sidebar-icon" />Campaigns</div>
            <div className="sidebar-item"><div className="sidebar-icon" />Audiences</div>
            <div className="sidebar-section">Optimization</div>
            <div className="sidebar-item"><div className="sidebar-icon" />Bid Strategy</div>
            <div className="sidebar-item"><div className="sidebar-icon" />Creative Lab</div>
            <div className="sidebar-item"><div className="sidebar-icon" />White-Label Reports</div>
            <div className="sidebar-section">Monitoring</div>
            <div className="sidebar-item"><div className="sidebar-icon" />Alerts</div>
            <div className="sidebar-item"><div className="sidebar-icon" />Benchmarks</div>
          </aside>
          <div className="dash-main">
            <div className="dash-header-row">
              <div className="dash-title-text">Campaign Audit — Google Ads</div>
              <div className="dash-pills">
                <button className="pill pill-active">Last 30 days</button>
                <button className="pill pill-inactive">90 days</button>
                <button className="pill pill-inactive">All time</button>
              </div>
            </div>
            <div className="scan-row">
              <div className="scan-spinner" />
              <span>AI scanning 150+ performance rules…</span>
              <div className="scan-bar"><div className="scan-progress" /></div>
              <span className="scan-pct">{scanPct}%</span>
            </div>
            <div className="metrics-row">
              <div className="metric-card">
                <div className="metric-label">Total spend</div>
                <div className="metric-value">$84,210</div>
                <div className="metric-change up">↑ 12.4% vs prior period</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">ROAS</div>
                <div className="metric-value" style={{ color: "var(--lime)" }}>3.8×</div>
                <div className="metric-change up">↑ 0.4× improvement</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Wasted spend</div>
                <div className="metric-value dash-live-num" style={{ color: "var(--coral)", opacity: dashWasteVisible ? 1 : 0 }}>
                  ${dashWaste.toLocaleString()}
                </div>
                <div className="metric-change down">↑ High · action needed</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Issues found</div>
                <div className="metric-value">14</div>
                <div className="metric-change down">4 critical</div>
              </div>
            </div>
            <div className="dash-split">
              <div className="chart-area">
                <div className="chart-title">Spend vs ROAS — Last 30 days</div>
                <div className="chart-bars">
                  {chartData.map(([h1, h2], i) => (
                    <div key={i} className="bar-group">
                      <div className="bar" style={{ height: `${h1}%`, background: "var(--violet)", opacity: .7, animationDelay: `${i * 0.05}s` }} />
                      <div className="bar" style={{ height: `${h2}%`, background: "var(--lime)", opacity: .85, animationDelay: `${i * 0.05 + 0.03}s` }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="issues-panel">
                <div className="issues-title">AI-detected issues<span className="issues-badge">23 total</span></div>
                {ISSUES.map((issue, i) => (
                  <div key={i} className={`issue-row${activeIssue === i ? " issue-row-active" : ""}`}>
                    <div className="issue-text">
                      {issue.text}
                      <span className="issue-note">{issue.note}</span>
                    </div>
                    <span className={`severity ${issue.sev}`}>{issue.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

/* ─────────────────────────────────────────────
   Island 2 — Wasted Spend Estimator
───────────────────────────────────────────── */
const WastedSpendEstimator = memo(function WastedSpendEstimator() {
  const [open, setOpen]               = useState(false);
  const [estSpend, setEstSpend]       = useState(5000);
  const [estPlatform, setEstPlatform] = useState<"google" | "meta" | "tiktok">("google");
  const [estIndustry, setEstIndustry] = useState<keyof typeof INDUSTRY_BENCHMARKS>("ecommerce");
  const [estCR, setEstCR]             = useState<string>("1.2");

  const userCR      = Math.max(0, parseFloat(estCR) || 0);
  const benchmarkCR = INDUSTRY_BENCHMARKS[estIndustry][estPlatform];
  const avgCpc      = AVG_CPC[estIndustry][estPlatform];

  // Derived account math (grounds the estimate in real figures)
  const clicks        = avgCpc > 0 ? estSpend / avgCpc : 0;
  const currentConv   = clicks * (userCR / 100);
  const potentialConv = clicks * (benchmarkCR / 100);
  const lostConv      = Math.max(0, potentialConv - currentConv);

  // Waste = structural inefficiency + spend tied to the conversion gap
  const structWaste = estSpend * STRUCTURAL_WASTE[estPlatform];
  const crGapFrac   = benchmarkCR > 0 ? Math.max(0, (benchmarkCR - userCR) / benchmarkCR) : 0;
  // 45% of the CR gap is platform-attributable (rest = landing page / offer)
  const convWaste   = estSpend * crGapFrac * 0.45;
  const totalMid    = Math.min(structWaste + convWaste, estSpend); // never exceed spend
  const wasteLo     = Math.round(totalMid * 0.85);
  const wasteHi     = Math.round(Math.min(totalMid * 1.25, estSpend));
  const wastePercLo = estSpend > 0 ? Math.round((wasteLo / estSpend) * 100) : 0;
  const wastePercHi = estSpend > 0 ? Math.round((wasteHi / estSpend) * 100) : 0;
  const hasResult   = userCR > 0 && estSpend > 0;

  useEffect(() => {
    const slider = document.querySelector<HTMLInputElement>(".est-slider");
    if (slider) {
      const pct = Math.min(100, Math.max(0, (estSpend / 50000) * 100));
      slider.style.setProperty("--pct", `${pct}%`);
    }
  }, [estSpend, open]);

  return (
    <section className="estimator-section reveal" id="estimator">
      <div className="estimator-eyebrow">
        <div className="badge-dot" />
        Free. No login. 30 seconds.
      </div>
      <h2 className="estimator-title">
        See how much your account<br /><span className="accent">wastes</span> before you connect a thing.
      </h2>
      <p className="estimator-sub">
        Enter four numbers and we&apos;ll estimate your monthly wasted spend against real benchmarks from 2,400+ accounts.
      </p>

      {!open ? (
        <div className="est-teaser" onClick={() => setOpen(true)}>
          <div className="est-teaser-glow" />
          <div className="est-teaser-icon">💸</div>
          <div className="est-teaser-amount">
            <span className="est-teaser-amount-val">15–30%</span>
            <span className="est-teaser-amount-sub">of spend typically wasted on problems nobody&apos;s looking at</span>
          </div>
          <p className="est-teaser-line">Most accounts waste 15–30% of spend on problems nobody&apos;s looking at. Enter your numbers to see where yours likely lands.</p>
          <div className="est-teaser-chips">
            <span className="est-teaser-chip">📊 Platform</span>
            <span className="est-teaser-chip">🏭 Industry</span>
            <span className="est-teaser-chip">💰 Monthly spend</span>
            <span className="est-teaser-chip">📈 Conversion rate</span>
          </div>
          <button className="btn-hero est-teaser-btn" onClick={() => setOpen(true)}>
            Calculate my wasted spend <span className="arrow-icon">→</span>
          </button>
          <p className="est-teaser-note">Free · No login · 30 seconds</p>
          <SecurityBadges center />
        </div>
      ) : (
      <div className="estimator-card est-card-open">
        <button className="est-close" onClick={() => setOpen(false)} aria-label="Close calculator">×</button>
        {/* Step 1 — Platform */}
        <div className="est-step">
          <div className="est-step-num">1</div>
          <div className="est-step-body">
            <label className="est-label">Ad platform</label>
            <div className="est-platform-tabs">
              {PLATFORMS.map(p => (
                <button key={p.key} className={`est-tab${estPlatform === p.key ? " active" : ""}`} onClick={() => setEstPlatform(p.key)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2 — Industry */}
        <div className="est-step">
          <div className="est-step-num">2</div>
          <div className="est-step-body">
            <label className="est-label">Your industry</label>
            <div className="est-industry-grid">
              {INDUSTRIES.map(ind => (
                <button key={ind.key} className={`est-industry-btn${estIndustry === ind.key ? " active" : ""}`} onClick={() => setEstIndustry(ind.key)}>
                  <span className="est-ind-icon">{ind.icon}</span>
                  <span className="est-ind-label">{ind.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3 — Spend */}
        <div className="est-step">
          <div className="est-step-num">3</div>
          <div className="est-step-body">
            <label className="est-label">Monthly ad spend</label>
            <div className="est-spend-presets">
              {SPEND_PRESETS.map(v => (
                <button key={v} className={`est-preset${estSpend === v ? " active" : ""}`} onClick={() => setEstSpend(v)}>
                  ${v >= 1000 ? `${v / 1000}k` : v}
                </button>
              ))}
            </div>
            <div className="est-inputs-row">
              <div className="est-custom-row">
                <span className="est-currency">$</span>
                <input type="number" className="est-input" value={estSpend} min={0} max={500000} step={50}
                  onChange={e => setEstSpend(Math.max(0, Number(e.target.value)))} />
                <span className="est-currency-suffix">/mo</span>
              </div>
            </div>
            <input type="range" className="est-slider" min={0} max={50000} step={100} value={Math.min(estSpend, 50000)}
              onChange={e => setEstSpend(Number(e.target.value))} />
            <div className="est-slider-labels"><span>$0</span><span>$50k+</span></div>
          </div>
        </div>

        {/* Step 4 — Conversion Rate */}
        <div className="est-step">
          <div className="est-step-num">4</div>
          <div className="est-step-body">
            <label className="est-label">
              Your conversion rate
              <span className="est-label-hint"> — clicks that became leads or purchases</span>
            </label>
            <div className="est-cr-row">
              <div className="est-custom-row">
                <input type="number" className="est-input est-input-cr" value={estCR} min={0} max={100} step={0.1}
                  placeholder="e.g. 1.2" onChange={e => setEstCR(e.target.value)} />
                <span className="est-currency-suffix">%</span>
              </div>
              <div className="est-benchmark-pill">Industry benchmark: <strong>{benchmarkCR}%</strong></div>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className={`est-result${hasResult ? " est-result-active" : ""}`}>
          {!hasResult ? (
            <div className="est-result-placeholder">Fill in all fields above to see your estimated waste</div>
          ) : (
            <>
              <div className="est-result-intro">Based on accounts like yours, here&apos;s what&apos;s likely slipping through:</div>
              <div className="est-result-label">
                Estimated monthly wasted spend — {INDUSTRIES.find(i => i.key === estIndustry)?.label} on {PLATFORMS.find(p => p.key === estPlatform)?.label}
              </div>
              <div className="est-result-range">
                <span className="est-range-val">${wasteLo.toLocaleString()}</span>
                <span className="est-range-sep">–</span>
                <span className="est-range-val">${wasteHi.toLocaleString()}</span>
                <span className="est-range-period">/mo</span>
              </div>
              <div className="est-result-perc">That&apos;s <strong>{wastePercLo}–{wastePercHi}%</strong> of your monthly budget</div>

              {/* Account math — grounds the estimate */}
              <div className="est-account-math">
                <div className="est-math-cell">
                  <div className="est-math-val">~{Math.round(clicks).toLocaleString()}</div>
                  <div className="est-math-label">est. clicks/mo<br /><span>at ${avgCpc.toFixed(2)} avg CPC</span></div>
                </div>
                <div className="est-math-cell">
                  <div className="est-math-val">~{Math.round(currentConv).toLocaleString()}</div>
                  <div className="est-math-label">conversions now<br /><span>at your {userCR}% CR</span></div>
                </div>
                <div className="est-math-cell est-math-cell-good">
                  <div className="est-math-val">+{Math.round(lostConv).toLocaleString()}</div>
                  <div className="est-math-label">recoverable/mo<br /><span>at {benchmarkCR}% benchmark</span></div>
                </div>
              </div>

              <div className="est-breakdown">
                <div className="est-breakdown-row">
                  <span className="est-breakdown-label">Structural waste</span>
                  <span className="est-breakdown-val">${Math.round(structWaste).toLocaleString()}</span>
                  <span className="est-breakdown-note">poor targeting, irrelevant terms, overlap</span>
                </div>
                <div className="est-breakdown-row">
                  <span className="est-breakdown-label">Conversion gap</span>
                  <span className="est-breakdown-val">${Math.round(convWaste).toLocaleString()}</span>
                  <span className="est-breakdown-note">{userCR}% CR vs {benchmarkCR}% benchmark</span>
                </div>
              </div>
              <div className="est-result-context">
                Math: ${estSpend.toLocaleString()} ÷ ${avgCpc.toFixed(2)} CPC ≈ {Math.round(clicks).toLocaleString()} clicks. Closing the CR gap to the {benchmarkCR}% {INDUSTRIES.find(i => i.key === estIndustry)?.label} benchmark recovers ~{Math.round(lostConv).toLocaleString()} conversions/mo.
              </div>
              <div className="est-result-disclaimer">
                This is an estimate from industry benchmarks — not your real account. A free audit replaces this guess with the exact dollar figure, broken down line by line.
              </div>
            </>
          )}
        </div>

        <div className="est-cta-wrap">
          <Link href="/signup" className="btn-hero est-cta-btn">
            Get my exact audit report — free audit <span className="arrow-icon">→</span>
          </Link>
          <p className="est-cta-note">Benchmarks drawn from $2.4B in managed spend across 2,400+ ad accounts. No account connection required to use this estimator.</p>
        </div>
      </div>
      )}
    </section>
  );
});

/* ─────────────────────────────────────────────
   Island 3 — Pricing (annual toggle)
───────────────────────────────────────────── */
const PricingSection = memo(function PricingSection() {
  const [annual, setAnnual] = useState(false);
  return (
    <section className="pricing-section" id="pricing">
      <p className="section-eyebrow reveal">Pricing</p>
      <h2 className="section-title reveal reveal-delay-1">
        Start where you are.<br /><span className="em">Scale when you grow</span>.
      </h2>
      <p className="section-desc reveal reveal-delay-2">From a solo freelancer&apos;s first client to an agency running hundreds of accounts — one platform, priced to grow with you.</p>

      <div className="billing-toggle reveal reveal-delay-2">
        <span className={`billing-label${!annual ? " billing-label-active" : ""}`}>Monthly</span>
        <button className={`toggle-switch${annual ? " toggle-on" : ""}`} onClick={() => setAnnual(a => !a)} aria-label="Toggle annual billing">
          <span className="toggle-thumb" />
        </button>
        <span className={`billing-label${annual ? " billing-label-active" : ""}`}>
          Billed annually<span className="billing-save">save 20%</span>
        </span>
      </div>

      <div className="pricing-grid">
        <div className="price-card reveal reveal-delay-1">
          <div className="price-tier">Starter</div>
          <div className="price-amount"><span className="price-currency">$</span><span className="price-figure">{annual ? 16 : 20}</span></div>
          <div className="price-period">per month{annual && <span className="price-billed-annual"> · billed $192/yr</span>}</div>
          {annual && <div className="price-was">was $240/yr</div>}
          <p className="price-blurb">For freelancers and small in-house teams keeping a handful of accounts clean.</p>
          <div className="price-divider" />
          <ul className="price-features">
            <li className="price-feature"><span className="check-icon">✓</span>3 ad accounts</li>
            <li className="price-feature"><span className="check-icon">✓</span>Monthly audits</li>
            <li className="price-feature"><span className="check-icon">✓</span>Google &amp; Meta Ads</li>
            <li className="price-feature"><span className="check-icon">✓</span>PDF reports</li>
            <li className="price-feature"><span className="check-icon">✓</span>Email support</li>
          </ul>
          <p className="price-closer">Everything you need to find wasted spend on your own accounts — and look sharp doing it.</p>
          <Link href="/signup" className="price-btn price-btn-outline">Start auditing</Link>
        </div>

        <div className="price-card featured reveal reveal-delay-2">
          <div className="popular-badge">Most Popular</div>
          <div className="popular-social">Chosen by 68% of agencies</div>
          <div className="price-tier">Pro</div>
          <div className="price-amount"><span className="price-currency">$</span><span className="price-figure">{annual ? 39 : 49}</span></div>
          <div className="price-period">per month{annual && <span className="price-billed-annual"> · billed $468/yr</span>}</div>
          {annual && <div className="price-was">was $588/yr</div>}
          <p className="price-blurb">For agencies juggling client accounts who need depth, speed, and reports that win renewals.</p>
          <div className="price-divider" />
          <ul className="price-features">
            <li className="price-feature"><span className="check-icon">✓</span>25 ad accounts</li>
            <li className="price-feature"><span className="check-icon">✓</span>Weekly automated audits</li>
            <li className="price-feature"><span className="check-icon">✓</span>All platforms incl. TikTok</li>
            <li className="price-feature"><span className="check-icon">✓</span>White-label reports</li>
            <li className="price-feature"><span className="check-icon">✓</span>Slack &amp; email alerts</li>
            <li className="price-feature"><span className="check-icon">✓</span>Priority support</li>
          </ul>
          <p className="price-closer">White-label reports and weekly automated audits across 25 accounts — the plan most agencies never outgrow.</p>
          <Link href="/signup" className="price-btn price-btn-solid">Go Pro</Link>
        </div>

        <div className="price-card reveal reveal-delay-3">
          <div className="price-tier">Agency</div>
          <div className="price-amount"><span className="price-currency">$</span><span className="price-figure">{annual ? 119 : 149}</span></div>
          <div className="price-period">per month{annual && <span className="price-billed-annual"> · billed $1,428/yr</span>}</div>
          {annual && <div className="price-was">was $1,788/yr</div>}
          <p className="price-blurb">For large teams and enterprise agencies with complex account structures and compliance needs.</p>
          <div className="price-divider" />
          <ul className="price-features">
            <li className="price-feature"><span className="check-icon">✓</span>Unlimited accounts</li>
            <li className="price-feature"><span className="check-icon">✓</span>Daily &amp; real-time audits</li>
            <li className="price-feature"><span className="check-icon">✓</span>Custom audit rules</li>
            <li className="price-feature"><span className="check-icon">✓</span>SSO &amp; team roles</li>
            <li className="price-feature"><span className="check-icon">✓</span>API access</li>
            <li className="price-feature"><span className="check-icon">✓</span>Dedicated CSM</li>
          </ul>
          <p className="price-closer">Unlimited accounts, real-time audits, and the controls a serious operation runs on.</p>
          <Link href="/signup" className="price-btn price-btn-outline">Talk to sales</Link>
        </div>
      </div>

      <p className="pricing-footnote reveal">Every plan starts with a free audit and no credit card — you&apos;ll know it&apos;s worth it before you pay a cent.</p>
    </section>
  );
});

/* ─────────────────────────────────────────────
   Island 4 — FAQ accordion
───────────────────────────────────────────── */
const FaqAccordion = memo(function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <section className="faq-section">
      <div className="faq-inner">
        <div className="faq-header">
          <p className="section-eyebrow reveal">Before you ask</p>
          <h2 className="section-title reveal reveal-delay-1">
            The questions every smart<br /><span className="em">buyer asks first</span>.
          </h2>
          <p className="faq-sub reveal reveal-delay-2">You&apos;re handing a tool access to your ad accounts — you should know exactly what it can and can&apos;t do. Here&apos;s the straight version.</p>
        </div>
        <div className="faq-list reveal reveal-delay-2">
          {FAQS.map((item, i) => (
            <div key={i} className={`faq-item${openFaq === i ? " faq-open" : ""}`}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span>{item.q}</span>
                <span className="faq-icon">{openFaq === i ? "−" : "+"}</span>
              </button>
              <div className="faq-answer-wrap">
                <div className="faq-answer">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

/* ─────────────────────────────────────────────
   Case Study Carousel — auto-scrolling marquee
───────────────────────────────────────────── */
const CaseStudyCard = ({ cs }: { cs: typeof CASE_STUDIES[number] }) => (
  <Link href={`/case-studies/${cs.slug}`} className="cs-carousel-card">
    <div className="cs-cc-head">
      <div className={`cs-cc-logo ${cs.color}`}>{cs.logo}</div>
      <div>
        <div className="cs-cc-name">{cs.agency}</div>
        <div className="cs-cc-meta">{cs.meta}</div>
      </div>
    </div>
    <p className="cs-cc-summary">{cs.summary}</p>
    <div className="cs-cc-stats">
      <div className="cs-cc-stat">
        <span className="cs-cc-stat-from">{cs.before.roas}</span>
        <span className="cs-cc-stat-arrow">→</span>
        <span className="cs-cc-stat-to">{cs.after.roas}</span>
        <span className="cs-cc-stat-label">ROAS</span>
      </div>
      <div className="cs-cc-stat">
        <span className="cs-cc-stat-from">{cs.before.waste}</span>
        <span className="cs-cc-stat-arrow">→</span>
        <span className="cs-cc-stat-to">{cs.after.waste}</span>
        <span className="cs-cc-stat-label">waste</span>
      </div>
    </div>
    <span className="cs-cc-link">Read case study →</span>
  </Link>
);

const CaseStudyCarousel = memo(function CaseStudyCarousel() {
  // Duplicate the list so the marquee can loop seamlessly
  const loop = [...CASE_STUDIES, ...CASE_STUDIES];
  return (
    <section className="case-study-section">
      <div className="cs-eyebrow"><div className="badge-dot" />Proof, with numbers</div>
      <h2 className="section-title reveal reveal-delay-1" style={{ marginBottom: 14 }}>
        Real accounts. Real recoveries.<br /><span className="em">Pick one and dig in</span>.
      </h2>
      <p className="section-desc reveal reveal-delay-2" style={{ marginBottom: 48 }}>
        Hover to pause · click any card for the full breakdown.
      </p>

      <div className="cs-marquee">
        <div className="cs-track">
          {loop.map((cs, i) => <CaseStudyCard key={`${cs.slug}-${i}`} cs={cs} />)}
        </div>
      </div>

      <div className="cs-carousel-cta">
        <Link href="/case-studies" className="btn-ghost">View all case studies →</Link>
      </div>
    </section>
  );
});

/* ─────────────────────────────────────────────
   Root page — zero state, only DOM effects
───────────────────────────────────────────── */
export default function HomePage() {
  useEffect(() => {
    /* Custom cursor */
    const cursor = document.getElementById("lp-cursor");
    const ring   = document.getElementById("lp-ring");
    if (!cursor || !ring) return;
    let cx = -100, cy = -100, rx = -100, ry = -100;
    const onMove = (e: MouseEvent) => {
      cx = e.clientX; cy = e.clientY;
      cursor.style.left = cx + "px"; cursor.style.top = cy + "px";
    };
    document.addEventListener("mousemove", onMove);
    let rafId: number;
    const tick = () => {
      rx += (cx - rx) * 0.14; ry += (cy - ry) * 0.14;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    const targets = document.querySelectorAll<HTMLElement>(
      "button, a, .feature-card, .testimonial-card, .price-card, .logo-chip, input, textarea, select"
    );
    const expand   = () => { cursor.style.transform = "translate(-50%,-50%) scale(2.4)"; ring.style.transform = "translate(-50%,-50%) scale(1.45)"; };
    const contract = () => { cursor.style.transform = "translate(-50%,-50%) scale(1)";   ring.style.transform = "translate(-50%,-50%) scale(1)"; };
    targets.forEach(el => { el.addEventListener("mouseenter", expand); el.addEventListener("mouseleave", contract); });
    return () => { document.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafId); };
  }, []);

  useEffect(() => {
    /* Particles — reduced from 22 → 12 */
    const pc = document.getElementById("lp-particles");
    if (!pc) return;
    for (let i = 0; i < 12; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = "10%";
      p.style.setProperty("--dur", (4 + Math.random() * 6) + "s");
      p.style.setProperty("--delay", Math.random() * 8 + "s");
      pc.appendChild(p);
    }
  }, []);

  useEffect(() => {
    /* Scroll reveal */
    const obs = new IntersectionObserver(
      entries => entries.forEach(en => { if (en.isIntersecting) en.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    /* Stat counters */
    const animateCounter = (el: Element) => {
      const target = parseFloat((el as HTMLElement).dataset.counter || "0");
      const prefix = (el as HTMLElement).dataset.prefix || "";
      const suffix = (el as HTMLElement).dataset.suffix || "";
      const dec = target % 1 !== 0;
      const start = performance.now();
      const up = (now: number) => {
        const p = Math.min((now - start) / 1800, 1);
        const val = target * (1 - Math.pow(1 - p, 3));
        el.textContent = prefix + (dec ? val.toFixed(1) : Math.floor(val)) + suffix;
        if (p < 1) requestAnimationFrame(up);
      };
      requestAnimationFrame(up);
    };
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.querySelectorAll("[data-counter]").forEach(animateCounter);
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    const sb = document.querySelector(".stats-bar");
    if (sb) obs.observe(sb);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    /* Progress bars */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.querySelectorAll<HTMLElement>(".progress-fill").forEach(f => { f.style.width = (f.dataset.w || "0") + "%"; });
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll("[data-animate-progress]").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    /* Nav shadow */
    const nav = document.getElementById("lp-nav");
    if (!nav) return;
    const onScroll = () => { nav.style.boxShadow = window.scrollY > 24 ? "0 6px 30px rgba(0,0,0,0.35)" : "none"; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="landing-root">
      <div className="cursor" id="lp-cursor" />
      <div className="cursor-ring" id="lp-ring" />

      {/* ── Nav ── */}
      <nav className="lp-nav" id="lp-nav">
        <Link href="/" className="nav-logo">
          <LogoSvg /><div className="logo-dot" />AdAdvisor
        </Link>
        <ul className="nav-links">
          <li><button onClick={() => scrollTo("platform")}>Platform</button></li>
          <li><button onClick={() => scrollTo("solutions")}>Solutions</button></li>
          <li><button onClick={() => scrollTo("integrations")}>Integrations</button></li>
          <li><button onClick={() => scrollTo("pricing")}>Pricing</button></li>
          <li><button onClick={() => scrollTo("customers")}>Customers</button></li>
          <li><button onClick={() => scrollTo("about")}>About</button></li>
        </ul>
        <div className="nav-cta">
          <Link href="/login" className="btn-ghost">Log in</Link>
          <Link href="/signup" className="btn-primary">Get a free audit →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <svg className="halftone" viewBox="0 0 600 600" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
          <defs>
            <pattern id="ht" width="18" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
              <circle cx="3" cy="3" r="1.6" fill="#eaff00" />
              <circle cx="12" cy="14" r="1.6" fill="#eaff00" />
            </pattern>
            <linearGradient id="htFade" x1="0" x2="1">
              <stop offset="0" stopColor="#000" stopOpacity="0" />
              <stop offset=".55" stopColor="#000" stopOpacity="1" />
            </linearGradient>
            <mask id="htMask"><rect width="600" height="600" fill="url(#htFade)" /></mask>
          </defs>
          <rect width="600" height="600" fill="url(#ht)" mask="url(#htMask)" />
        </svg>
        <div className="particles" id="lp-particles" />
        <div className="hero-badge"><div className="badge-dot" />Audit. Recover. Repeat.</div>
        <h1 className="hero-title">
          Find the budget your ads<br />
          are <span className="accent">quietly burning</span>.
        </h1>
        <p className="hero-sub">
          AdAdvisor runs 150+ audit rules across your Google, Meta, and TikTok accounts and hands you a
          prioritised fix list in under 3 minutes — the audit a senior strategist would charge for, minus the three-day wait.
        </p>
        <div className="hero-actions">
          <Link href="/signup" className="btn-hero">Get a free audit <span className="arrow-icon">→</span></Link>
          <Link href="/signup" className="btn-ghost-hero">Book Free Demo Now!</Link>
        </div>
        <SecurityBadges center />
        <p className="sec-oneliner">We can see your data. We can <strong>never</strong> touch it.</p>
        <div className="stats-bar stats-bar-3">
          <div className="stat-item">
            <div className="stat-num"><span className="stat-accent" data-counter="2.4" data-prefix="$" data-suffix="B">$2.4B</span></div>
            <div className="stat-label">Ad spend managed</div>
            <div className="stat-context">across 2,400+ connected ad accounts</div>
          </div>
          <div className="stat-item">
            <div className="stat-num"><span className="stat-accent" data-counter="38" data-suffix="%">38%</span></div>
            <div className="stat-label">Average ROAS lift</div>
            <div className="stat-context">median across 6 verticals, 2024–2025</div>
          </div>
          <div className="stat-item">
            <div className="stat-num"><span className="stat-accent" data-counter="3" data-suffix=" min">3 min</span></div>
            <div className="stat-label">Full account audit</div>
            <div className="stat-context">vs. 6 hours by hand</div>
          </div>
        </div>
      </section>

      {/* ── Wasted Spend Estimator (isolated island) ── */}
      <WastedSpendEstimator />

      {/* ── Product Preview (isolated island) ── */}
      <AnimatedDashboard />

      <div className="lp-divider" />

      {/* ── Features ── */}
      <section className="features-section" id="solutions">
        <p className="section-eyebrow reveal">What AdAdvisor does?</p>
        <h2 className="section-title reveal reveal-delay-1">Every layer of your account,<br /><span className="em">audited in one pass</span>.</h2>
        <p className="section-desc reveal reveal-delay-2">Native dashboards tell you what happened. AdAdvisor tells you what&apos;s wrong, what it&apos;s costing, and what to do about it.</p>
        <div className="features-grid">
          <div className="feature-card wide reveal">
            <div className="feature-icon icon-violet">🤖</div>
            <div className="feature-name">AI Audit Engine</div>
            <div className="feature-headline">150+ checks, one prioritised fix list.</div>
            <div className="feature-desc">Your account hides dozens of small problems that compound into real losses. AdAdvisor scans bidding, targeting, creative, budget, and tracking against 150+ rules, then ranks every finding by dollar impact — so you fix what matters first.</div>
            <div className="feat-progress" data-animate-progress>
              <div className="progress-row"><div className="progress-row-label"><span className="progress-label">Bid strategy health</span><span className="progress-val">82%</span></div><div className="progress-track"><div className="progress-fill fill-violet" data-w="82" /></div></div>
              <div className="progress-row"><div className="progress-row-label"><span className="progress-label">Audience quality</span><span className="progress-val">68%</span></div><div className="progress-track"><div className="progress-fill fill-lime" data-w="68" /></div></div>
              <div className="progress-row"><div className="progress-row-label"><span className="progress-label">Creative performance</span><span className="progress-val">54%</span></div><div className="progress-track"><div className="progress-fill fill-teal" data-w="54" /></div></div>
              <div className="progress-row"><div className="progress-row-label"><span className="progress-label">Budget efficiency</span><span className="progress-val">81%</span></div><div className="progress-track"><div className="progress-fill fill-amber" data-w="81" /></div></div>
            </div>
            <div className="feature-callout">150+ rules per audit</div>
          </div>
          <div className="feature-card tall reveal reveal-delay-1">
            <div className="feature-icon icon-lime">💸</div>
            <div className="feature-name">Wasted Spend Detection</div>
            <div className="feature-headline">See exactly where the money leaks.</div>
            <div className="feature-desc">Irrelevant search terms, overlapping audiences, dead placements — they bleed budget quietly for months. AdAdvisor surfaces each one with a dollar amount attached, so &ldquo;wasted spend&rdquo; stops being a feeling and becomes a number you can act on.</div>
            <div className="feat-metrics">
              <div className="feat-metric"><div className="feat-metric-val">$9,140</div><div className="feat-metric-label">Found this month</div></div>
              <div className="feat-metric"><div className="feat-metric-val">34%</div><div className="feat-metric-label">Of total budget</div></div>
            </div>
            <div className="feature-callout">15–30% of spend typically recoverable</div>
          </div>
          <div className="feature-card reveal reveal-delay-1">
            <div className="feature-icon icon-teal">📊</div>
            <div className="feature-name">Performance Benchmarking</div>
            <div className="feature-headline">Know how you stack up against your peers.</div>
            <div className="feature-desc">A 2.4× ROAS means nothing in isolation. AdAdvisor compares your ROAS, CTR, CPC, and Quality Score and much more against real data from your niche-related ad accounts, segmented by vertical and budget tier — so you know whether you&apos;re winning or just busy.</div>
            <div className="feature-callout">2,400+ accounts benchmarked</div>
          </div>
          <div className="feature-card reveal reveal-delay-2">
            <div className="feature-icon icon-violet">💬</div>
            <div className="feature-name">AI Recommendations</div>
            <div className="feature-headline">Fixes written like a strategist, not a spreadsheet.</div>
            <div className="feature-desc">Most tools hand you a chart and walk away. AdAdvisor writes every recommendation in plain English — what to change, why it matters, and what it&apos;s costing you to leave it — so a junior buyer can act like a ten-year veteran.</div>
            <div className="feature-callout">Every fix tied to a dollar figure</div>
          </div>
          <div className="feature-card reveal reveal-delay-2">
            <div className="feature-icon icon-lime">📄</div>
            <div className="feature-name">White-Label Reports</div>
            <div className="feature-headline">Client-ready reports in one click.</div>
            <div className="feature-desc">Reporting eats hours and rarely impresses anyone. Export a polished, data-rich audit under your own logo and brand colours — the kind of deliverable that justifies a retainer and wins the renewal.</div>
            <div className="feature-callout">6-hour reports → 8 minutes</div>
          </div>
          <div className="feature-card reveal reveal-delay-3">
            <div className="feature-icon icon-amber">🔔</div>
            <div className="feature-name">Continuous Monitoring</div>
            <div className="feature-headline">Catch the dip before your client does.</div>
            <div className="feature-desc">Problems don&apos;t wait for your monthly review. Set automated audits to run weekly, daily, or in real time, with Slack and email alerts the moment something breaks — so you&apos;re the one who flags it, not the one explaining it.</div>
            <div className="feature-callout">Alerts in real time</div>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── Integrations ── */}
      <section className="integrations-section" id="integrations">
        <p className="section-eyebrow reveal">Connect everything</p>
        <h2 className="section-title reveal reveal-delay-1">
          Link your accounts in one click.<br />Audit in <span className="em">three minutes</span>.
        </h2>
        <p className="section-desc reveal reveal-delay-2">
          OAuth-secured, read-only, and live the moment you connect — no engineering, no spreadsheets, no setup call.
        </p>
        <div className="integration-cards">
          <div className="integration-card reveal reveal-delay-1">
            <div className="integration-card-head">
              <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
                <path d="M25.8 7.5l11.6 20a5.8 5.8 0 0 1-10 5.8l-11.6-20a5.8 5.8 0 0 1 10-5.8z" fill="#FBBC04"/>
                <path d="M22.2 7.5l-11.6 20a5.8 5.8 0 0 0 10 5.8l11.6-20a5.8 5.8 0 0 0-10-5.8z" fill="#4285F4"/>
                <circle cx="13.4" cy="34.5" r="5.9" fill="#34A853"/>
              </svg>
              <span className="integration-card-name">Google Ads</span>
            </div>
            <p className="integration-card-copy">Full audit across YouTube, Display &amp; Search, keywords, bidding, Quality Score and more.</p>
          </div>
          <div className="integration-card reveal reveal-delay-2">
            <div className="integration-card-head">
              <svg width="26" height="14" viewBox="0 0 40 24" fill="none">
                <defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0064E0"/><stop offset="1" stopColor="#0098FF"/></linearGradient></defs>
                <path d="M8 12C8 6.5 14 6.5 20 12C26 17.5 32 17.5 32 12C32 6.5 26 6.5 20 12C14 17.5 8 17.5 8 12Z" fill="none" stroke="url(#mg)" strokeWidth="4.5" strokeLinecap="round"/>
              </svg>
              <span className="integration-card-name">Meta Ads</span>
            </div>
            <p className="integration-card-copy">Audience overlap, creative fatigue, and pixel integrity, surfaced instantly.</p>
          </div>
          <div className="integration-card reveal reveal-delay-3">
            <div className="integration-card-head">
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <path d="M33 13.8a7.9 7.9 0 0 1-4.7-4.3h-4.6v19.4a4.6 4.6 0 1 1-4.6-4.6c.5 0 .9.1 1.3.2v-4.7a9.3 9.3 0 1 0 8 9.2V17.7a12.7 12.7 0 0 0 4.6.9z" transform="translate(2 -1)" fill="#FE2C55"/>
                <path d="M33 13.8a7.9 7.9 0 0 1-4.7-4.3h-4.6v19.4a4.6 4.6 0 1 1-4.6-4.6c.5 0 .9.1 1.3.2v-4.7a9.3 9.3 0 1 0 8 9.2V17.7a12.7 12.7 0 0 0 4.6.9z" transform="translate(-2 1)" fill="#25F4EE"/>
                <path d="M33 13.8a7.9 7.9 0 0 1-4.7-4.3h-4.6v19.4a4.6 4.6 0 1 1-4.6-4.6c.5 0 .9.1 1.3.2v-4.7a9.3 9.3 0 1 0 8 9.2V17.7a12.7 12.7 0 0 0 4.6.9z" fill="#fff"/>
              </svg>
              <span className="integration-card-name">TikTok Ads</span>
            </div>
            <p className="integration-card-copy">Spend efficiency and creative performance benchmarked against the platform.</p>
          </div>
        </div>
        <p className="integration-roadmap reveal">Microsoft Ads and LinkedIn Ads — landing soon.</p>
      </section>

      <div className="lp-divider" />

      {/* ── How it works ── */}
      <section className="how-section">
        <div style={{ textAlign: "center" }}>
          <p className="section-eyebrow reveal">Simple setup, instant results</p>
          <h2 className="section-title reveal reveal-delay-1">
            Three steps from connected<br />to <span className="em">recovering spend</span>.
          </h2>
        </div>
        <div className="steps-grid reveal reveal-delay-2">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-eyebrow-sm">Connect or enter</div>
            <div className="step-title">Link an account, or audit by hand.</div>
            <div className="step-desc">Connect Google, Meta, or TikTok in one OAuth click — read-only, so we can see your data but never touch a campaign. No account to connect? Enter your numbers manually and audit anyway.</div>
            <div className="step-tag tag-violet"><div className="step-tag-dot" />Security</div>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-eyebrow-sm">AI scans</div>
            <div className="step-title">150+ rules, under three minutes.</div>
            <div className="step-desc">The engine reads every campaign, ad group, keyword, and creative against 150+ audit rules. While a manual audit takes a strategist six hours, your full results land before your coffee cools.</div>
            <div className="step-tag tag-lime"><div className="step-tag-dot" />Intelligence</div>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-eyebrow-sm">Recover &amp; repeat</div>
            <div className="step-title">Fix what&apos;s costing you most, first.</div>
            <div className="step-desc">Act on a fix list ranked by dollar impact, recover the wasted budget, and watch ROAS climb. Turn on monitoring and the audit reruns itself — so the account never drifts back.</div>
            <div className="step-tag tag-teal"><div className="step-tag-dot" />Growth</div>
          </div>
        </div>
      </section>

      {/* ── Case Study Carousel ── */}
      <CaseStudyCarousel />

      {/* ── Trust Strip ── */}
      <section className="trust-strip reveal">
        <div className="trust-strip-inner">
          <div className="trust-item"><span className="trust-icon">🔒</span><span>Read-only access</span></div>
          <div className="trust-sep" />
          <div className="trust-item"><span className="trust-icon">🛡️</span><span>OAuth secured</span></div>
          <div className="trust-sep" />
          <div className="trust-item"><span className="trust-icon">🚫</span><span>Never modifies your campaigns</span></div>
          <div className="trust-sep" />
          <div className="trust-item"><span className="trust-icon">✅</span><span>GDPR compliant</span></div>
          <div className="trust-sep" />
          <div className="trust-item trust-item-note"><span>We can see your data. We can never touch it.</span></div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── Pricing (isolated island) ── */}
      <PricingSection />

      <div className="lp-divider" />

      {/* ── Testimonials ── */}
      <section className="testimonials-section" id="customers">
        <p className="section-eyebrow reveal">Trusted by growth teams</p>
        <h2 className="section-title reveal reveal-delay-1">
          The people who live in<br /><span className="em">ad accounts all day</span>.
        </h2>
        <div className="testimonials-grid">
          <div className="testimonial-card reveal reveal-delay-1">
            <div className="stars">★★★★★</div>
            <div className="testimonial-text">&ldquo;We pitch on speed now. I run a prospect&apos;s account through AdAdvisor before the first call and walk in already knowing where their last agency left money on the table. It found $9,000 a month in overlapping audiences for one client in the first scan. Audit time went from half a day to eight minutes, and the white-label reports do more to close renewals than any slide deck I&apos;ve built.&rdquo;</div>
            <div className="testimonial-author">
              <div className="author-avatar av-violet">MR</div>
              <div><div className="author-name">Marcus Rivera</div><div className="author-role">Founder · PeakROAS Digital</div></div>
            </div>
          </div>
          <div className="testimonial-card reveal reveal-delay-2">
            <div className="stars">★★★★★</div>
            <div className="testimonial-text">&ldquo;Our native dashboards told me what spent, never what was broken. The benchmark comparison was the wake-up call — my CPC was 31% above the average for our vertical and I had no idea. I fixed three Quality Score issues in a week and brought it back in line. When finance asks how efficient our spend is now, I have a number instead of a shrug.&rdquo;</div>
            <div className="testimonial-author">
              <div className="author-avatar av-lime">PN</div>
              <div><div className="author-name">Priya Nair</div><div className="author-role">Senior Media Buyer · Northbeam Retail</div></div>
            </div>
          </div>
          <div className="testimonial-card reveal reveal-delay-3">
            <div className="stars">★★★★★</div>
            <div className="testimonial-text">&ldquo;As a one-person shop, the white-label reports make me look like a ten-person agency. I send clients a polished audit under my own brand the day after onboarding, and they assume I&apos;ve got a whole team behind me. At $20 a month it pays for itself the first time it saves me an afternoon — which is every single time.&rdquo;</div>
            <div className="testimonial-author">
              <div className="author-avatar av-teal">DO</div>
              <div><div className="author-name">Daniel Osei</div><div className="author-role">Freelance PPC Consultant</div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── About / Team ── */}
      <section className="about-section" id="about">
        <div className="about-mission reveal">
          <div className="about-mission-text">
            <p className="section-eyebrow" style={{ marginBottom: 20 }}>Why we built this</p>
            <h2 className="section-title" style={{ marginBottom: 24 }}>
              We watched good marketers lose money to problems <span className="em">hiding in plain sight</span>.
            </h2>
            <p className="about-body">
              We spent years inside ad accounts — running spend, building teams, and auditing campaigns by hand. The audit
              always worked. It just took a senior strategist three days and a tolerance for tedium, which meant most accounts
              went un-audited until something already broke.
            </p>
            <p className="about-body">
              We knew the checks. We knew they were mechanical. So in 2026 we taught a machine to run all 150+ of them in three
              minutes, and built AdAdvisor so no team has to bleed budget waiting on a calendar slot again.
            </p>
          </div>
          <div className="about-mission-stats">
            <div className="about-stat"><div className="about-stat-num">2026</div><div className="about-stat-label">Founded — built for the way ad accounts work today</div></div>
            <div className="about-stat"><div className="about-stat-num">100%</div><div className="about-stat-label">Remote-first — talent over postcodes, always</div></div>
            <div className="about-stat"><div className="about-stat-num">$0</div><div className="about-stat-label">VC funding — bootstrapped, profitable, answerable to users</div></div>
          </div>
        </div>
        <div className="team-cta reveal">
          <div className="team-cta-avatars">
            <div className="team-cta-av av-violet">AK</div>
            <div className="team-cta-av av-lime">SP</div>
            <div className="team-cta-av av-teal">JM</div>
            <div className="team-cta-av team-cta-more">+3</div>
          </div>
          <div className="team-cta-text">
            <h3 className="team-cta-title">Meet the people behind the platform</h3>
            <p className="team-cta-sub">Operators and engineers who got tired of watching good budget leak.</p>
          </div>
          <Link href="/team" className="btn-primary team-cta-btn">Meet the team →</Link>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── FAQ (isolated island) ── */}
      <FaqAccordion />

      <div className="lp-divider" />

      {/* ── Blog / Resources ── */}
      <section className="blog-section">
        <div className="blog-header reveal">
          <div>
            <p className="section-eyebrow">From the audit desk</p>
            <h2 className="section-title reveal-delay-1" style={{ marginTop: 12 }}>
              Sharpen your accounts <span className="em">between audits</span>.
            </h2>
          </div>
          <Link href="/blog" className="btn-ghost blog-all-link">View all articles →</Link>
        </div>
        <div className="blog-grid">
          <div className="blog-card reveal reveal-delay-1">
            <div className="blog-tag blog-tag-google">Google Ads</div>
            <h3 className="blog-title">The 7 wasted-spend leaks hiding in every Google Ads account</h3>
            <p className="blog-excerpt">The search terms, match types, and pacing mistakes that quietly drain budget for months. A field guide for media buyers who want to plug the leaks today.</p>
            <div className="blog-footer"><span className="blog-read-time">8 min read</span><Link href="/blog/google-ads-wasted-spend-leaks" className="blog-read-link">Read →</Link></div>
          </div>
          <div className="blog-card reveal reveal-delay-2">
            <div className="blog-tag blog-tag-agency">Agency Growth</div>
            <h3 className="blog-title">How to turn an account audit into your best sales pitch</h3>
            <p className="blog-excerpt">Why the agencies winning new clients lead with the audit, not the deck. A playbook for using findings to close prospects and protect renewals.</p>
            <div className="blog-footer"><span className="blog-read-time">6 min read</span><Link href="/blog/audit-as-sales-pitch" className="blog-read-link">Read →</Link></div>
          </div>
          <div className="blog-card reveal reveal-delay-3">
            <div className="blog-tag blog-tag-meta">Benchmarks</div>
            <h3 className="blog-title">What a healthy ROAS actually looks like in 2026, by vertical</h3>
            <p className="blog-excerpt">Real benchmark data across six verticals, so you know whether your numbers are strong or just familiar. For buyers tired of guessing what &ldquo;good&rdquo; means.</p>
            <div className="blog-footer"><span className="blog-read-time">10 min read</span><Link href="/blog/healthy-roas-by-vertical-2026" className="blog-read-link">Read →</Link></div>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-card reveal">
          <div className="cta-glow" />
          <h2 className="cta-title">Right now, your account is<br />wasting money <span className="em">you can&apos;t see</span>.</h2>
          <p className="cta-sub">The audit is free, the answer takes three minutes, and you&apos;ll know exactly what it&apos;s costing you to wait.</p>
          <div className="cta-actions">
            <Link href="/signup" className="btn-hero">Get a free audit <span className="arrow-icon">→</span></Link>
            <Link href="/signup" className="btn-ghost-hero">Talk to sales</Link>
          </div>
          <p className="cta-trust">No credit card required · Setup in 2 minutes · Cancel anytime</p>
          <SecurityBadges center />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <Link href="/" className="footer-logo"><LogoSvg width={22} height={14} />AdAdvisor</Link>
        <p className="footer-tagline">The audit a senior strategist would run — in three minutes, on every account.</p>
        <ul className="footer-links">
          <li><Link href="/privacy">Privacy</Link></li>
          <li><Link href="/terms">Terms</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
          <li><Link href="/blog">Blog</Link></li>
          <li><Link href="/team">Careers</Link></li>
        </ul>
        <div className="footer-copy">© 2026 AdAdvisor. All rights reserved.</div>
      </footer>
    </div>
  );
}
