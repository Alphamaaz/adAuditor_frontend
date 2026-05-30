"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./landing.css";

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

// Benchmark conversion rates (%) by industry × platform — industry averages
const INDUSTRY_BENCHMARKS: Record<string, Record<string, number>> = {
  ecommerce: { google: 3.5, meta: 1.8, tiktok: 1.2 },
  saas:      { google: 2.8, meta: 1.2, tiktok: 0.8 },
  local:     { google: 5.0, meta: 2.5, tiktok: 1.5 },
  leadgen:   { google: 4.2, meta: 2.8, tiktok: 1.8 },
  finance:   { google: 3.8, meta: 1.5, tiktok: 0.9 },
  health:    { google: 2.5, meta: 2.2, tiktok: 2.8 },
};

// Baseline structural waste by platform (poor QS, irrelevant terms, audience overlap, etc.)
const STRUCTURAL_WASTE: Record<string, number> = {
  google: 0.12,
  meta:   0.15,
  tiktok: 0.18,
};

const PLATFORMS = [
  { key: "google", label: "Google Ads" },
  { key: "meta",   label: "Meta Ads"   },
  { key: "tiktok", label: "TikTok Ads" },
] as const;

const INDUSTRIES = [
  { key: "ecommerce", label: "E-commerce",       icon: "🛒" },
  { key: "saas",      label: "SaaS / B2B",       icon: "💻" },
  { key: "local",     label: "Local Services",   icon: "📍" },
  { key: "leadgen",   label: "Lead Generation",  icon: "🎯" },
  { key: "finance",   label: "Finance",           icon: "💰" },
  { key: "health",    label: "Health & Beauty",  icon: "💄" },
] as const;

const SPEND_PRESETS = [1000, 5000, 10000, 25000, 50000];

const FAQS = [
  {
    q: "Is it safe to connect my ad account?",
    a: "Completely. We connect via OAuth — the same standard used by Google, Meta, and TikTok's own partner apps. We request read-only access, meaning we can see your data but cannot make any changes to your campaigns, budgets, or bids. Your login credentials are never stored on our servers.",
  },
  {
    q: "Can AdAdvisor modify my campaigns?",
    a: "No. Never. Our access is strictly read-only. We can surface issues, flag wasted spend, and generate recommendations — but every change is made by you, in your ad platform. Think of us as the strategist who spots the problem; you're the one who fixes it.",
  },
  {
    q: "What platforms do you support?",
    a: "Google Ads, Meta Ads (Facebook & Instagram), and TikTok Ads are fully supported across all plans. Microsoft Ads and LinkedIn Ads are on our roadmap for 2026.",
  },
  {
    q: "How is this different from the native platform analytics?",
    a: "Platform analytics only show you what happened — clicks, impressions, spend. AdAdvisor tells you what's wrong and why. We run 150+ audit rules across bidding strategy, audience quality, creative performance, budget pacing, and conversion tracking — things the native dashboards never flag. We also benchmark your numbers against your industry peers, not just your own history.",
  },
  {
    q: "How long does a full audit take?",
    a: "Under 3 minutes from connecting your account to receiving a full prioritised report. For large accounts with millions of keywords and hundreds of campaigns, it may take up to 5 minutes.",
  },
  {
    q: "Do I need to share my login credentials?",
    a: "No. OAuth authentication means you grant access through a secure pop-up on Google's, Meta's, or TikTok's own login page. We never see your password.",
  },
  {
    q: "What happens after the free audit?",
    a: "You get a full audit report immediately — no credit card required. You can read every finding, see the estimated dollar impact of each issue, and download a summary PDF. If you want continuous monitoring, weekly automated audits, white-label reports, and Slack alerts, you can upgrade to a paid plan at any time.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no cancellation fees. You can downgrade or cancel from your account settings in one click. If you cancel a paid plan, you keep access until the end of your billing period.",
  },
];

const LogoSvg = ({ width = 28, height = 18 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 34 22" fill="none" aria-hidden="true">
    <path d="M2 11 C 8 2, 14 20, 20 11 S 30 2, 32 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    <circle cx="32" cy="11" r="2.6" fill="currentColor" />
  </svg>
);

export default function HomePage() {
  useEffect(() => {
    /* ── Custom cursor ── */
    const cursor = document.getElementById("lp-cursor");
    const ring = document.getElementById("lp-ring");
    if (cursor && ring) {
      let cx = -100, cy = -100, rx = -100, ry = -100;
      const onMove = (e: MouseEvent) => {
        cx = e.clientX; cy = e.clientY;
        cursor.style.left = cx + "px"; cursor.style.top = cy + "px";
      };
      document.addEventListener("mousemove", onMove);
      let rafId: number;
      const tick = () => {
        rx += (cx - rx) * 0.14;
        ry += (cy - ry) * 0.14;
        ring.style.left = rx + "px"; ring.style.top = ry + "px";
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      const targets = document.querySelectorAll<HTMLElement>(
        "button, a, .feature-card, .testimonial-card, .price-card, .logo-chip, input, textarea, select"
      );
      const expand = () => {
        cursor.style.transform = "translate(-50%,-50%) scale(2.4)";
        ring.style.transform = "translate(-50%,-50%) scale(1.45)";
      };
      const contract = () => {
        cursor.style.transform = "translate(-50%,-50%) scale(1)";
        ring.style.transform = "translate(-50%,-50%) scale(1)";
      };
      targets.forEach(el => { el.addEventListener("mouseenter", expand); el.addEventListener("mouseleave", contract); });

      return () => {
        document.removeEventListener("mousemove", onMove);
        cancelAnimationFrame(rafId);
      };
    }
  }, []);

  useEffect(() => {
    /* ── Particles ── */
    const pc = document.getElementById("lp-particles");
    if (!pc) return;
    for (let i = 0; i < 22; i++) {
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
    /* ── Scroll reveal ── */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) en.target.classList.add("visible"); });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    /* ── Stat counters ── */
    const animateCounter = (el: Element) => {
      const target = parseFloat((el as HTMLElement).dataset.counter || "0");
      const prefix = (el as HTMLElement).dataset.prefix || "";
      const suffix = (el as HTMLElement).dataset.suffix || "";
      const dec = target % 1 !== 0;
      const dur = 1800;
      const start = performance.now();
      const up = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
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
    /* ── Progress bars ── */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.querySelectorAll<HTMLElement>(".progress-fill").forEach(fill => {
            fill.style.width = (fill.dataset.w || "0") + "%";
          });
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll("[data-animate-progress]").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    /* ── Nav shadow on scroll ── */
    const nav = document.getElementById("lp-nav");
    if (!nav) return;
    const onScroll = () => {
      nav.style.boxShadow = window.scrollY > 24 ? "0 6px 30px rgba(0,0,0,0.35)" : "none";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Animated dashboard state
  const [chartData, setChartData] = useState(CHART_DATA_BASE);
  const WASTE_CYCLE = [7840, 8390, 9140, 9580, 8720];
  const [dashWaste, setDashWaste] = useState(9140);
  const [dashWasteVisible, setDashWasteVisible] = useState(true);
  const [activeIssue, setActiveIssue] = useState(0);
  const [scanPct, setScanPct] = useState(68);

  useEffect(() => {
    let wIdx = 2;
    const wasteInterval = setInterval(() => {
      setDashWasteVisible(false);
      setTimeout(() => {
        wIdx = (wIdx + 1) % WASTE_CYCLE.length;
        setDashWaste(WASTE_CYCLE[wIdx]);
        setDashWasteVisible(true);
      }, 300);
    }, 3800);

    const issueInterval = setInterval(() => {
      setActiveIssue(i => (i + 1) % 4);
    }, 2200);

    const scanInterval = setInterval(() => {
      setScanPct(p => {
        if (p >= 98) return 12;
        return p + Math.floor(Math.random() * 8 + 3);
      });
    }, 900);

    const chartInterval = setInterval(() => {
      setChartData(varyChart());
    }, 2600);

    return () => {
      clearInterval(wasteInterval);
      clearInterval(issueInterval);
      clearInterval(scanInterval);
      clearInterval(chartInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [estSpend, setEstSpend]       = useState(5000);
  const [estPlatform, setEstPlatform] = useState<"google" | "meta" | "tiktok">("google");
  const [estIndustry, setEstIndustry] = useState<keyof typeof INDUSTRY_BENCHMARKS>("ecommerce");
  const [estCR, setEstCR]             = useState<string>("1.2");

  // Calculation
  const userCR       = Math.max(0, parseFloat(estCR) || 0);
  const benchmarkCR  = INDUSTRY_BENCHMARKS[estIndustry][estPlatform];
  const structWaste  = estSpend * STRUCTURAL_WASTE[estPlatform];
  const crGapFrac    = benchmarkCR > 0 ? Math.max(0, (benchmarkCR - userCR) / benchmarkCR) : 0;
  // 45% of CR gap is attributable to platform issues (rest = landing page, offer quality)
  const convWaste    = estSpend * crGapFrac * 0.45;
  const totalMid     = structWaste + convWaste;
  const wasteLo      = Math.round(totalMid * 0.85);
  const wasteHi      = Math.round(totalMid * 1.25);
  const wastePercLo  = estSpend > 0 ? Math.round((wasteLo / estSpend) * 100) : 0;
  const wastePercHi  = estSpend > 0 ? Math.round((wasteHi / estSpend) * 100) : 0;
  const hasResult    = userCR > 0 && estSpend >= 500;

  useEffect(() => {
    const slider = document.querySelector<HTMLInputElement>(".est-slider");
    if (slider) {
      const pct = ((estSpend - 500) / (100000 - 500)) * 100;
      slider.style.setProperty("--pct", `${pct}%`);
    }
  }, [estSpend]);

  return (
    <div className="landing-root">
      {/* Cursor */}
      <div className="cursor" id="lp-cursor" />
      <div className="cursor-ring" id="lp-ring" />

      {/* ── Nav ── */}
      <nav className="lp-nav" id="lp-nav">
        <Link href="/" className="nav-logo">
          <LogoSvg />
          <div className="logo-dot" />
          AdAdvisor
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
          <Link href="/signup" className="btn-primary">Get a demo →</Link>
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

        <div className="hero-badge"><div className="badge-dot" />AI-Native Ad Intelligence Platform</div>
        <h1 className="hero-title">
          AdAdvisor <span className="italic-em">orchestrates</span><br />
          <span className="accent">every campaign</span>.
        </h1>
        <p className="hero-sub">
          Plan creative, media, and budget on one beat — synced by AI from the first brief to the last impression,
          so every ad lands in time and on key.
        </p>
        <div className="hero-actions">
          <Link href="/signup" className="btn-hero">Get a free audit <span className="arrow-icon">→</span></Link>
          <Link href="/signup" className="btn-ghost-hero">Talk to AdAdvisor</Link>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-num"><span className="stat-accent" data-counter="2.4" data-prefix="$" data-suffix="B">$2.4B</span></div>
            <div className="stat-label">Ad spend managed</div>
            <div className="stat-context">across 2,400+ connected accounts</div>
          </div>
          <div className="stat-item">
            <div className="stat-num"><span className="stat-accent" data-counter="38" data-suffix="%">38%</span></div>
            <div className="stat-label">Average ROAS lift</div>
            <div className="stat-context">median across 6 verticals, 2024–2025</div>
          </div>
          <div className="stat-item">
            <div className="stat-num"><span className="stat-accent" data-counter="150" data-suffix="+">150+</span></div>
            <div className="stat-label">AI audit rules</div>
            <div className="stat-context">vs. ~20 in most competing tools</div>
          </div>
          <div className="stat-item">
            <div className="stat-num"><span className="stat-accent" data-counter="3" data-suffix="min">3min</span></div>
            <div className="stat-label">Full campaign audit</div>
            <div className="stat-context">from connect to full report</div>
          </div>
        </div>
      </section>

      {/* ── Wasted Spend Estimator ── */}
      <section className="estimator-section reveal" id="estimator">
        <div className="estimator-eyebrow">
          <div className="badge-dot" />
          How much are you likely wasting right now?
        </div>
        <h2 className="estimator-title">
          Find your <span className="accent">wasted spend</span><br />before your next billing cycle.
        </h2>
        <p className="estimator-sub">
          Enter your platform, industry, spend, and conversion rate. We calculate your waste against real industry benchmarks — not guesses.
        </p>

        <div className="estimator-card">
          {/* Step 1 — Platform */}
          <div className="est-step">
            <div className="est-step-num">1</div>
            <div className="est-step-body">
              <label className="est-label">Ad platform</label>
              <div className="est-platform-tabs">
                {PLATFORMS.map(p => (
                  <button
                    key={p.key}
                    className={`est-tab${estPlatform === p.key ? " active" : ""}`}
                    onClick={() => setEstPlatform(p.key)}
                  >
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
                  <button
                    key={ind.key}
                    className={`est-industry-btn${estIndustry === ind.key ? " active" : ""}`}
                    onClick={() => setEstIndustry(ind.key)}
                  >
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
                  <button
                    key={v}
                    className={`est-preset${estSpend === v ? " active" : ""}`}
                    onClick={() => setEstSpend(v)}
                  >
                    ${v >= 1000 ? `${v / 1000}k` : v}
                  </button>
                ))}
              </div>
              <div className="est-inputs-row">
                <div className="est-custom-row">
                  <span className="est-currency">$</span>
                  <input
                    type="number"
                    className="est-input"
                    value={estSpend}
                    min={500}
                    max={500000}
                    step={500}
                    onChange={e => setEstSpend(Math.max(500, Number(e.target.value)))}
                  />
                  <span className="est-currency-suffix">/mo</span>
                </div>
              </div>
              <input
                type="range"
                className="est-slider"
                min={500}
                max={100000}
                step={500}
                value={estSpend}
                onChange={e => setEstSpend(Number(e.target.value))}
              />
              <div className="est-slider-labels">
                <span>$500</span><span>$100k</span>
              </div>
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
                  <input
                    type="number"
                    className="est-input est-input-cr"
                    value={estCR}
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="e.g. 1.2"
                    onChange={e => setEstCR(e.target.value)}
                  />
                  <span className="est-currency-suffix">%</span>
                </div>
                <div className="est-benchmark-pill">
                  Industry benchmark: <strong>{benchmarkCR}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className={`est-result${hasResult ? " est-result-active" : ""}`}>
            {!hasResult ? (
              <div className="est-result-placeholder">
                Fill in all fields above to see your estimated waste
              </div>
            ) : (
              <>
                <div className="est-result-label">
                  Estimated monthly wasted spend — {INDUSTRIES.find(i => i.key === estIndustry)?.label} on {PLATFORMS.find(p => p.key === estPlatform)?.label}
                </div>
                <div className="est-result-range">
                  <span className="est-range-val">${wasteLo.toLocaleString()}</span>
                  <span className="est-range-sep">–</span>
                  <span className="est-range-val">${wasteHi.toLocaleString()}</span>
                  <span className="est-range-period">/mo</span>
                </div>
                <div className="est-result-perc">
                  That&apos;s <strong>{wastePercLo}–{wastePercHi}%</strong> of your monthly budget
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
                    <span className="est-breakdown-note">your {userCR}% CR vs {benchmarkCR}% benchmark</span>
                  </div>
                </div>
                <div className="est-result-context">
                  Benchmarks sourced from platform averages across 2,400+ audited accounts. 45% of CR gap attributed to platform-level issues; remainder reflects landing page and offer factors.
                </div>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="est-cta-wrap">
            <Link href="/signup" className="btn-hero est-cta-btn">
              Stop estimating — see your exact number <span className="arrow-icon">→</span>
            </Link>
            <p className="est-cta-note">Free audit · No credit card · 3 minutes</p>
          </div>
        </div>
      </section>

      {/* ── Product Preview ── */}
      <section className="preview-section" id="platform">
        <p className="preview-label">Live platform — AI Audit Engine</p>

        <div className="floating-badge badge-top-left">
          <div className="badge-inner">
            <div className="badge-indicator ind-green" />
            <span
              className="dash-live-num"
              style={{ opacity: dashWasteVisible ? 1 : 0 }}
            >
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
                  <div
                    className="metric-value dash-live-num"
                    style={{ color: "var(--coral)", opacity: dashWasteVisible ? 1 : 0 }}
                  >
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
                  {[
                    { text: "Low quality score keywords (CPC +34%)",   sev: "critical", label: "Critical" },
                    { text: "Budget pacing irregular — 3 campaigns",    sev: "critical", label: "Critical" },
                    { text: "Brand match without RLSA protection",       sev: "warning",  label: "Warning"  },
                    { text: "Conversion tracking fully verified",        sev: "ok",       label: "Good"     },
                  ].map((issue, i) => (
                    <div key={i} className={`issue-row${activeIssue === i ? " issue-row-active" : ""}`}>
                      <div className="issue-text">{issue.text}</div>
                      <span className={`severity ${issue.sev}`}>{issue.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── Features ── */}
      <section className="features-section" id="solutions">
        <p className="section-eyebrow reveal">What AdAdvisor does</p>
        <h2 className="section-title reveal reveal-delay-1"><span className="em">Audit</span> and optimize<br />your ad spend</h2>
        <p className="section-desc reveal reveal-delay-2">From wasted spend detection to AI-powered bid recommendations — AdAdvisor covers every layer of your PPC strategy.</p>
        <div className="features-grid">
          <div className="feature-card wide reveal">
            <div className="feature-icon icon-violet">🤖</div>
            <div className="feature-name">AI Audit Engine</div>
            <div className="feature-desc">Our AI scans 80+ audit checkpoints across bidding, targeting, creatives, and structure — generating a prioritized fix list in under three minutes.</div>
            <div className="feat-progress" data-animate-progress>
              <div className="progress-row">
                <div className="progress-row-label"><span className="progress-label">Bid strategy health</span><span className="progress-val">82%</span></div>
                <div className="progress-track"><div className="progress-fill fill-violet" data-w="82" /></div>
              </div>
              <div className="progress-row">
                <div className="progress-row-label"><span className="progress-label">Audience quality</span><span className="progress-val">68%</span></div>
                <div className="progress-track"><div className="progress-fill fill-lime" data-w="68" /></div>
              </div>
              <div className="progress-row">
                <div className="progress-row-label"><span className="progress-label">Creative performance</span><span className="progress-val">54%</span></div>
                <div className="progress-track"><div className="progress-fill fill-teal" data-w="54" /></div>
              </div>
              <div className="progress-row">
                <div className="progress-row-label"><span className="progress-label">Budget efficiency</span><span className="progress-val">81%</span></div>
                <div className="progress-track"><div className="progress-fill fill-amber" data-w="81" /></div>
              </div>
            </div>
          </div>
          <div className="feature-card tall reveal reveal-delay-1">
            <div className="feature-icon icon-lime">💸</div>
            <div className="feature-name">Wasted Spend Detection</div>
            <div className="feature-desc">Identify exactly where your budget is bleeding — irrelevant search terms, overlapping audiences, underperforming placements, and more.</div>
            <div className="feat-metrics">
              <div className="feat-metric"><div className="feat-metric-val">$9,140</div><div className="feat-metric-label">Found this month</div></div>
              <div className="feat-metric"><div className="feat-metric-val">34%</div><div className="feat-metric-label">Of total budget</div></div>
            </div>
          </div>
          <div className="feature-card reveal reveal-delay-1">
            <div className="feature-icon icon-teal">📊</div>
            <div className="feature-name">Performance benchmarking</div>
            <div className="feature-desc">Compare your ROAS, CTR, CPC, and Quality Score against industry benchmarks segmented by vertical, budget tier, and platform.</div>
          </div>
          <div className="feature-card reveal reveal-delay-2">
            <div className="feature-icon icon-violet">💬</div>
            <div className="feature-name">AI recommendations</div>
            <div className="feature-desc">Get clear, actionable suggestions written in plain English — not just data dumps. Know what to do next and why it matters.</div>
          </div>
          <div className="feature-card reveal reveal-delay-2">
            <div className="feature-icon icon-lime">📄</div>
            <div className="feature-name">White-label reports</div>
            <div className="feature-desc">Export polished PDF audit reports with your agency&apos;s branding. Impress clients with professional, data-rich deliverables in one click.</div>
          </div>
          <div className="feature-card reveal reveal-delay-3">
            <div className="feature-icon icon-amber">🔔</div>
            <div className="feature-name">Continuous monitoring</div>
            <div className="feature-desc">Set up automated weekly audits with Slack and email alerts. Catch performance dips before they cost you — not after.</div>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── Integrations ── */}
      <section className="integrations-section" id="integrations">
        <p className="section-eyebrow reveal">Connect everything</p>
        <h2 className="section-title reveal reveal-delay-1" style={{ fontSize: "clamp(32px,4vw,52px)" }}>
          Works with your<br />entire <span className="em">ad stack</span>
        </h2>
        <div className="logo-chips">
          <div className="logo-chip">
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <path d="M25.8 7.5l11.6 20a5.8 5.8 0 0 1-10 5.8l-11.6-20a5.8 5.8 0 0 1 10-5.8z" fill="#FBBC04"/>
              <path d="M22.2 7.5l-11.6 20a5.8 5.8 0 0 0 10 5.8l11.6-20a5.8 5.8 0 0 0-10-5.8z" fill="#4285F4"/>
              <circle cx="13.4" cy="34.5" r="5.9" fill="#34A853"/>
            </svg>
            Google Ads
          </div>
          <div className="logo-chip">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M33 13.8a7.9 7.9 0 0 1-4.7-4.3h-4.6v19.4a4.6 4.6 0 1 1-4.6-4.6c.5 0 .9.1 1.3.2v-4.7a9.3 9.3 0 1 0 8 9.2V17.7a12.7 12.7 0 0 0 4.6.9z" transform="translate(2 -1)" fill="#FE2C55"/>
              <path d="M33 13.8a7.9 7.9 0 0 1-4.7-4.3h-4.6v19.4a4.6 4.6 0 1 1-4.6-4.6c.5 0 .9.1 1.3.2v-4.7a9.3 9.3 0 1 0 8 9.2V17.7a12.7 12.7 0 0 0 4.6.9z" transform="translate(-2 1)" fill="#25F4EE"/>
              <path d="M33 13.8a7.9 7.9 0 0 1-4.7-4.3h-4.6v19.4a4.6 4.6 0 1 1-4.6-4.6c.5 0 .9.1 1.3.2v-4.7a9.3 9.3 0 1 0 8 9.2V17.7a12.7 12.7 0 0 0 4.6.9z" fill="#fff"/>
            </svg>
            TikTok Ads
          </div>
          <div className="logo-chip">
            <svg width="22" height="14" viewBox="0 0 40 24" fill="none">
              <defs>
                <linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#0064E0"/><stop offset="1" stopColor="#0098FF"/>
                </linearGradient>
              </defs>
              <path d="M8 12C8 6.5 14 6.5 20 12C26 17.5 32 17.5 32 12C32 6.5 26 6.5 20 12C14 17.5 8 17.5 8 12Z" fill="none" stroke="url(#mg)" strokeWidth="4.5" strokeLinecap="round"/>
            </svg>
            Meta Ads
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── How it works ── */}
      <section className="how-section">
        <div style={{ textAlign: "center" }}>
          <p className="section-eyebrow reveal">Simple setup, instant results</p>
          <h2 className="section-title reveal reveal-delay-1" style={{ fontSize: "clamp(32px,4vw,52px)" }}>
            Three steps to <span className="em">smarter</span><br />campaign management
          </h2>
        </div>
        <div className="steps-grid reveal reveal-delay-2">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-title">Connect your accounts</div>
            <div className="step-desc">Link your ad accounts in one click — Google, Meta, TikTok, and more. No engineering required. OAuth-secured and read-only by default.</div>
            <div className="step-tag tag-violet"><div className="step-tag-dot" />Onboarding</div>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-title">AI analyzes your stack</div>
            <div className="step-desc">Our engine scans 150+ rules across every campaign, ad group, keyword, and creative. Full audit results delivered in under 3 minutes.</div>
            <div className="step-tag tag-lime"><div className="step-tag-dot" />Intelligence</div>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-title">Optimize &amp; recover spend</div>
            <div className="step-desc">Act on prioritized recommendations, recover wasted budget, and watch your ROAS climb. Continuous monitoring keeps you on track.</div>
            <div className="step-tag tag-teal"><div className="step-tag-dot" />Growth</div>
          </div>
        </div>
      </section>

      {/* ── Case Study ── */}
      <section className="case-study-section reveal">
        <div className="cs-eyebrow">
          <div className="badge-dot" />
          Real results · Client case study
        </div>

        <div className="cs-card">
          {/* Header */}
          <div className="cs-header">
            <div className="cs-agency">
              <div className="cs-agency-logo">VА</div>
              <div>
                <div className="cs-agency-name">Velocity Agency</div>
                <div className="cs-agency-meta">Performance marketing · 14 client accounts</div>
              </div>
            </div>
            <div className="cs-duration">Results after 90 days</div>
          </div>

          {/* Before / After metrics */}
          <div className="cs-metrics">
            <div className="cs-metric-col">
              <div className="cs-metric-period">Before AdAdvisor</div>
              <div className="cs-metric-row">
                <div className="cs-metric">
                  <div className="cs-metric-val cs-bad">2.1×</div>
                  <div className="cs-metric-label">Blended ROAS</div>
                </div>
                <div className="cs-metric">
                  <div className="cs-metric-val cs-bad">34%</div>
                  <div className="cs-metric-label">Wasted spend</div>
                </div>
                <div className="cs-metric">
                  <div className="cs-metric-val cs-bad">6 hrs</div>
                  <div className="cs-metric-label">Per audit</div>
                </div>
              </div>
            </div>

            <div className="cs-arrow">→</div>

            <div className="cs-metric-col">
              <div className="cs-metric-period cs-period-after">After AdAdvisor</div>
              <div className="cs-metric-row">
                <div className="cs-metric">
                  <div className="cs-metric-val cs-good">4.7×</div>
                  <div className="cs-metric-label">Blended ROAS</div>
                </div>
                <div className="cs-metric">
                  <div className="cs-metric-val cs-good">9%</div>
                  <div className="cs-metric-label">Wasted spend</div>
                </div>
                <div className="cs-metric">
                  <div className="cs-metric-val cs-good">8 min</div>
                  <div className="cs-metric-label">Per audit</div>
                </div>
              </div>
            </div>
          </div>

          {/* What AdAdvisor found */}
          <div className="cs-findings">
            <div className="cs-findings-label">What AdAdvisor found in the first audit</div>
            <div className="cs-findings-grid">
              <div className="cs-finding">
                <span className="cs-finding-icon">🔍</span>
                <span>$12,400/mo in irrelevant search term spend across 3 Google campaigns</span>
              </div>
              <div className="cs-finding">
                <span className="cs-finding-icon">⚠️</span>
                <span>Broken conversion tracking on 2 of 5 Meta campaigns — ROAS data was fiction</span>
              </div>
              <div className="cs-finding">
                <span className="cs-finding-icon">📉</span>
                <span>Budget cannibalisation between brand and non-brand campaigns inflating CPC by 41%</span>
              </div>
              <div className="cs-finding">
                <span className="cs-finding-icon">🎯</span>
                <span>Audience overlap of 68% across retargeting ad sets causing bid competition</span>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="cs-quote">
            <div className="cs-quote-mark">&ldquo;</div>
            <p className="cs-quote-text">
              The first audit found $12,000 in wasted spend within minutes. More importantly, it found
              the broken tracking we&apos;d missed for six months — meaning every ROAS number we&apos;d
              been reporting to clients was wrong. AdAdvisor didn&apos;t just save us money, it saved us
              from a client relationship crisis.
            </p>
            <div className="cs-quote-author">
              <div className="author-avatar av-violet" style={{ width: 40, height: 40, fontSize: 14 }}>SK</div>
              <div>
                <div className="cs-quote-name">Sarah Kim</div>
                <div className="cs-quote-role">Head of Paid Media · Velocity Agency — March 2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="trust-strip reveal">
        <div className="trust-strip-inner">
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            <span>Read-only access</span>
          </div>
          <div className="trust-sep" />
          <div className="trust-item">
            <span className="trust-icon">🛡️</span>
            <span>OAuth secured</span>
          </div>
          <div className="trust-sep" />
          <div className="trust-item">
            <span className="trust-icon">🚫</span>
            <span>Never modifies your campaigns</span>
          </div>
          <div className="trust-sep" />
          <div className="trust-item">
            <span className="trust-icon">✅</span>
            <span>GDPR compliant</span>
          </div>
          <div className="trust-sep" />
          <div className="trust-item trust-item-note">
            <span>We can see your data. We can never touch it.</span>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── Pricing ── */}
      <section className="pricing-section" id="pricing">
        <p className="section-eyebrow reveal">Pricing</p>
        <h2 className="section-title reveal reveal-delay-1" style={{ fontSize: "clamp(32px,4vw,52px)" }}>
          Plans that scale<br />with <span className="em">your growth</span>
        </h2>
        <p className="section-desc reveal reveal-delay-2">From solo freelancers to enterprise teams — pick the plan that fits your stack today and upgrade anytime.</p>

        {/* Billing toggle */}
        <div className="billing-toggle reveal reveal-delay-2">
          <span className={`billing-label${!annual ? " billing-label-active" : ""}`}>Monthly</span>
          <button
            className={`toggle-switch${annual ? " toggle-on" : ""}`}
            onClick={() => setAnnual(a => !a)}
            aria-label="Toggle annual billing"
          >
            <span className="toggle-thumb" />
          </button>
          <span className={`billing-label${annual ? " billing-label-active" : ""}`}>
            Annual
            <span className="billing-save">Save 20%</span>
          </span>
        </div>

        <div className="pricing-grid">
          <div className="price-card reveal reveal-delay-1">
            <div className="price-tier">Starter</div>
            <div className="price-amount">
              <span className="price-currency">$</span>
              <span className="price-figure">{annual ? 16 : 20}</span>
            </div>
            <div className="price-period">
              per month{annual && <span className="price-billed-annual"> · billed $192/yr</span>}
            </div>
            {annual && <div className="price-was">was $240/yr</div>}
            <p className="price-blurb">Perfect for freelancers and small in-house teams managing a handful of accounts.</p>
            <div className="price-divider" />
            <ul className="price-features">
              <li className="price-feature"><span className="check-icon">✓</span>3 ad accounts</li>
              <li className="price-feature"><span className="check-icon">✓</span>Monthly audits</li>
              <li className="price-feature"><span className="check-icon">✓</span>Google &amp; Meta Ads</li>
              <li className="price-feature"><span className="check-icon">✓</span>PDF reports</li>
              <li className="price-feature"><span className="check-icon">✓</span>Email support</li>
            </ul>
            <Link href="/signup" className="price-btn price-btn-outline">Get started</Link>
          </div>

          <div className="price-card featured reveal reveal-delay-2">
            <div className="popular-badge">Most Popular</div>
            <div className="popular-social">Chosen by 68% of agencies</div>
            <div className="price-tier">Pro</div>
            <div className="price-amount">
              <span className="price-currency">$</span>
              <span className="price-figure">{annual ? 39 : 49}</span>
            </div>
            <div className="price-period">
              per month{annual && <span className="price-billed-annual"> · billed $468/yr</span>}
            </div>
            {annual && <div className="price-was">was $588/yr</div>}
            <p className="price-blurb">Built for agencies managing multiple client accounts who need speed, depth, and white-label reporting.</p>
            <div className="price-divider" />
            <ul className="price-features">
              <li className="price-feature"><span className="check-icon">✓</span>25 ad accounts</li>
              <li className="price-feature"><span className="check-icon">✓</span>Weekly automated audits</li>
              <li className="price-feature"><span className="check-icon">✓</span>All platforms incl. TikTok</li>
              <li className="price-feature"><span className="check-icon">✓</span>White-label reports</li>
              <li className="price-feature"><span className="check-icon">✓</span>Slack &amp; email alerts</li>
              <li className="price-feature"><span className="check-icon">✓</span>Priority support</li>
            </ul>
            <Link href="/signup" className="price-btn price-btn-solid">Get started</Link>
          </div>

          <div className="price-card reveal reveal-delay-3">
            <div className="price-tier">Agency</div>
            <div className="price-amount">
              <span className="price-currency">$</span>
              <span className="price-figure">{annual ? 119 : 149}</span>
            </div>
            <div className="price-period">
              per month{annual && <span className="price-billed-annual"> · billed $1,428/yr</span>}
            </div>
            {annual && <div className="price-was">was $1,788/yr</div>}
            <p className="price-blurb">For large in-house teams and enterprise agencies with complex account structures and compliance needs.</p>
            <div className="price-divider" />
            <ul className="price-features">
              <li className="price-feature"><span className="check-icon">✓</span>Unlimited accounts</li>
              <li className="price-feature"><span className="check-icon">✓</span>Daily &amp; real-time audits</li>
              <li className="price-feature"><span className="check-icon">✓</span>Custom audit rules</li>
              <li className="price-feature"><span className="check-icon">✓</span>SSO &amp; team roles</li>
              <li className="price-feature"><span className="check-icon">✓</span>API access</li>
              <li className="price-feature"><span className="check-icon">✓</span>Dedicated CSM</li>
            </ul>
            <Link href="/signup" className="price-btn price-btn-outline">Get started</Link>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── Testimonials ── */}
      <section className="testimonials-section" id="customers">
        <p className="section-eyebrow reveal">Trusted by growth teams</p>
        <h2 className="section-title reveal reveal-delay-1" style={{ fontSize: "clamp(32px,4vw,52px)" }}>
          Results that speak<br /><span className="em">for themselves</span>
        </h2>
        <div className="testimonials-grid">
          <div className="testimonial-card reveal reveal-delay-1">
            <div className="stars">★★★★★</div>
            <div className="testimonial-text">&ldquo;AdAdvisor found $12,000 in wasted spend within the first audit. The AI recommendations were specific, actionable, and written like a senior strategist — not a robot.&rdquo;</div>
            <div className="testimonial-author">
              <div className="author-avatar av-violet">SK</div>
              <div>
                <div className="author-name">Sarah Kim</div>
                <div className="author-role">Head of Paid Media · Velocity Agency</div>
                <div className="testimonial-date">— March 2026</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card reveal reveal-delay-2">
            <div className="stars">★★★★★</div>
            <div className="testimonial-text">&ldquo;We cut our audit time from 6 hours to 8 minutes. The white-label reports have genuinely changed how we present to clients. Retention is up.&rdquo;</div>
            <div className="testimonial-author">
              <div className="author-avatar av-lime">MR</div>
              <div>
                <div className="author-name">Marcus Rivera</div>
                <div className="author-role">Founder · PeakRoas Digital</div>
                <div className="testimonial-date">— February 2026</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card reveal reveal-delay-3">
            <div className="stars">★★★★★</div>
            <div className="testimonial-text">&ldquo;After three months, our blended ROAS went from 2.1× to 4.7×. I&apos;ve tried every audit tool on the market — nothing comes close to the depth AdAdvisor provides.&rdquo;</div>
            <div className="testimonial-author">
              <div className="author-avatar av-teal">JL</div>
              <div>
                <div className="author-name">Jamie Liu</div>
                <div className="author-role">Director of Growth · Horizon Commerce</div>
                <div className="testimonial-date">— January 2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── About / Team ── */}
      <section className="about-section" id="about">
        {/* Mission */}
        <div className="about-mission reveal">
          <div className="about-mission-text">
            <p className="section-eyebrow" style={{ marginBottom: 20 }}>About us</p>
            <h2 className="section-title" style={{ fontSize: "clamp(28px,3.5vw,48px)", marginBottom: 24 }}>
              Built by people who&apos;ve<br /><span className="em">wasted ad budget too</span>.
            </h2>
            <p className="about-body">
              AdAdvisor was founded after watching talented marketing teams lose thousands of dollars
              every month to problems that were hiding in plain sight — keyword overlap, broken
              conversion tracking, bid strategies fighting each other. The audits existed, but they
              took days and required a senior strategist to run. We built the tool we wished existed.
            </p>
            <p className="about-body">
              Today AdAdvisor scans over $2.4B in managed ad spend across 2,400+ accounts — surfacing
              in minutes what used to take an agency hours. Our team is remote-first, obsessed with
              accuracy, and accountable to one metric: recoverable spend found per audit.
            </p>
          </div>
          <div className="about-mission-stats">
            <div className="about-stat">
              <div className="about-stat-num">2026</div>
              <div className="about-stat-label">Founded</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">100%</div>
              <div className="about-stat-label">Remote-first team</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">$0</div>
              <div className="about-stat-label">VC funding — profitable from day one</div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="team-header reveal">
          <p className="section-eyebrow">The team</p>
          <h3 className="team-title">The people behind the platform</h3>
        </div>
        <div className="team-grid">
          {/* Founder 1 */}
          <div className="team-card reveal reveal-delay-1">
            <div className="team-avatar-wrap">
              {/* Replace with <img> when photo is available */}
              <div className="team-avatar-placeholder av-violet">AK</div>
              <div className="team-avatar-badge">Co-founder</div>
            </div>
            <div className="team-name">Alex Khan</div>
            <div className="team-role">CEO &amp; Co-founder</div>
            <p className="team-bio">
              10 years running paid media for e-commerce brands. Managed $40M+ in Google and Meta
              spend before building AdAdvisor to automate what he did manually every week.
            </p>
            <a href="#" className="team-linkedin" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.21 24 24 23.23 24 22.28V1.72C24 .77 23.21 0 22.22 0z"/></svg>
              LinkedIn
            </a>
          </div>

          {/* Founder 2 */}
          <div className="team-card reveal reveal-delay-2">
            <div className="team-avatar-wrap">
              <div className="team-avatar-placeholder av-lime">SP</div>
              <div className="team-avatar-badge">Co-founder</div>
            </div>
            <div className="team-name">Sara Patel</div>
            <div className="team-role">CTO &amp; Co-founder</div>
            <p className="team-bio">
              Former ML engineer at a leading ad-tech firm. Built the rule engine and AI narrative
              layer that powers every AdAdvisor audit. Obsessed with making complex data legible.
            </p>
            <a href="#" className="team-linkedin" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.21 24 24 23.23 24 22.28V1.72C24 .77 23.21 0 22.22 0z"/></svg>
              LinkedIn
            </a>
          </div>

          {/* Team member 3 */}
          <div className="team-card reveal reveal-delay-3">
            <div className="team-avatar-wrap">
              <div className="team-avatar-placeholder av-teal">JM</div>
            </div>
            <div className="team-name">James Morris</div>
            <div className="team-role">Head of Product</div>
            <p className="team-bio">
              Previously product lead at a B2B SaaS analytics company. Shapes every audit workflow,
              report format, and onboarding step with one question: would a junior media buyer
              understand this immediately?
            </p>
            <a href="#" className="team-linkedin" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.21 24 24 23.23 24 22.28V1.72C24 .77 23.21 0 22.22 0z"/></svg>
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── FAQ ── */}
      <section className="faq-section">
        <div className="faq-inner">
          <div className="faq-header">
            <p className="section-eyebrow reveal">FAQ</p>
            <h2 className="section-title reveal reveal-delay-1" style={{ fontSize: "clamp(28px,3.5vw,44px)" }}>
              Questions we hear<br /><span className="em">every day</span>
            </h2>
            <p className="faq-sub reveal reveal-delay-2">
              If yours isn&apos;t here, hit the chat button — a real human will reply.
            </p>
          </div>
          <div className="faq-list reveal reveal-delay-2">
            {FAQS.map((item, i) => (
              <div
                key={i}
                className={`faq-item${openFaq === i ? " faq-open" : ""}`}
              >
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
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

      <div className="lp-divider" />

      {/* ── Blog / Resources ── */}
      <section className="blog-section">
        <div className="blog-header reveal">
          <div>
            <p className="section-eyebrow">Resources</p>
            <h2 className="section-title reveal-delay-1" style={{ fontSize: "clamp(28px,3.5vw,44px)", marginTop: 12 }}>
              Learn from the <span className="em">audit data</span>
            </h2>
          </div>
          <Link href="/blog" className="btn-ghost blog-all-link">View all articles →</Link>
        </div>

        <div className="blog-grid">
          <div className="blog-card reveal reveal-delay-1">
            <div className="blog-tag blog-tag-google">Google Ads</div>
            <h3 className="blog-title">How to audit your Google Ads account in 15 minutes</h3>
            <p className="blog-excerpt">
              A step-by-step checklist covering keyword overlap, Quality Score issues, budget pacing,
              and conversion tracking — the four areas where most accounts leak budget quietly.
            </p>
            <div className="blog-footer">
              <span className="blog-read-time">8 min read</span>
              <Link href="/blog/google-ads-audit-guide" className="blog-read-link">Read →</Link>
            </div>
          </div>

          <div className="blog-card reveal reveal-delay-2">
            <div className="blog-tag blog-tag-meta">Meta Ads</div>
            <h3 className="blog-title">15 signs your Meta campaigns are wasting budget right now</h3>
            <p className="blog-excerpt">
              Audience overlap, creative fatigue, broad targeting without conversion signals — these
              are the silent killers of Meta ROAS. Here&apos;s how to spot all 15 in under an hour.
            </p>
            <div className="blog-footer">
              <span className="blog-read-time">11 min read</span>
              <Link href="/blog/meta-ads-wasted-spend-signs" className="blog-read-link">Read →</Link>
            </div>
          </div>

          <div className="blog-card reveal reveal-delay-3">
            <div className="blog-tag blog-tag-agency">Agency</div>
            <h3 className="blog-title">The agency guide to client-ready PPC audit reports</h3>
            <p className="blog-excerpt">
              What separates a report clients trust from one they ignore? Structure, specificity, and
              dollar amounts. We break down the format that wins renewals and justifies retainer fees.
            </p>
            <div className="blog-footer">
              <span className="blog-read-time">6 min read</span>
              <Link href="/blog/agency-ppc-audit-report-guide" className="blog-read-link">Read →</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-card reveal">
          <div className="cta-glow" />
          <h2 className="cta-title">Your next campaign<br />starts <span className="em">smarter</span>.</h2>
          <p className="cta-sub">Join 2,400+ brands and agencies already recovering wasted spend with AdAdvisor.</p>
          <div className="cta-actions">
            <Link href="/signup" className="btn-hero">Get a free audit <span className="arrow-icon">→</span></Link>
            <Link href="/signup" className="btn-ghost-hero">Talk to sales</Link>
          </div>
          <p className="cta-trust">No credit card required · Setup in 2 minutes · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <Link href="/" className="footer-logo">
          <LogoSvg width={22} height={14} />
          AdAdvisor
        </Link>
        <ul className="footer-links">
          <li><Link href="/privacy">Privacy</Link></li>
          <li><Link href="/terms">Terms</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
        </ul>
        <div className="footer-copy">© 2026 AdAdvisor. All rights reserved.</div>
      </footer>
    </div>
  );
}
