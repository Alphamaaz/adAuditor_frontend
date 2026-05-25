"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./landing.css";

const CHART_DATA = [
  [40, 55], [65, 48], [50, 70], [80, 62],
  [55, 85], [70, 55], [90, 75], [60, 90],
  [85, 65], [75, 88],
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
          </div>
          <div className="stat-item">
            <div className="stat-num"><span className="stat-accent" data-counter="38" data-suffix="%">38%</span></div>
            <div className="stat-label">Average ROAS lift</div>
          </div>
          <div className="stat-item">
            <div className="stat-num"><span className="stat-accent" data-counter="150" data-suffix="+">150+</span></div>
            <div className="stat-label">AI audit rules</div>
          </div>
          <div className="stat-item">
            <div className="stat-num"><span className="stat-accent" data-counter="3" data-suffix="min">3min</span></div>
            <div className="stat-label">Full campaign audit</div>
          </div>
        </div>
      </section>

      {/* ── Product Preview ── */}
      <section className="preview-section" id="platform">
        <p className="preview-label">Live platform — AI Audit Engine</p>

        <div className="floating-badge badge-top-left">
          <div className="badge-inner">
            <div className="badge-indicator ind-green" />
            <span>$3,240 <span style={{ color: "var(--hint)", fontWeight: 400 }}>recoverable/mo</span></span>
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
                <span className="scan-pct">68%</span>
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
                  <div className="metric-value" style={{ color: "var(--coral)" }}>$9,140</div>
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
                    {CHART_DATA.map(([h1, h2], i) => (
                      <div key={i} className="bar-group">
                        <div className="bar" style={{ height: `${h1}%`, background: "var(--violet)", opacity: .7, animationDelay: `${i * 0.05}s` }} />
                        <div className="bar" style={{ height: `${h2}%`, background: "var(--lime)", opacity: .85, animationDelay: `${i * 0.05 + 0.03}s` }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="issues-panel">
                  <div className="issues-title">AI-detected issues<span className="issues-badge">23 total</span></div>
                  <div className="issue-row"><div className="issue-text">Low quality score keywords (CPC +34%)</div><span className="severity critical">Critical</span></div>
                  <div className="issue-row"><div className="issue-text">Budget pacing irregular — 3 campaigns</div><span className="severity critical">Critical</span></div>
                  <div className="issue-row"><div className="issue-text">Brand match without RLSA protection</div><span className="severity warning">Warning</span></div>
                  <div className="issue-row"><div className="issue-text">Conversion tracking fully verified</div><span className="severity ok">Good</span></div>
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

      <div className="lp-divider" />

      {/* ── Pricing ── */}
      <section className="pricing-section" id="pricing">
        <p className="section-eyebrow reveal">Pricing</p>
        <h2 className="section-title reveal reveal-delay-1" style={{ fontSize: "clamp(32px,4vw,52px)" }}>
          Plans that scale<br />with <span className="em">your growth</span>
        </h2>
        <p className="section-desc reveal reveal-delay-2">From solo freelancers to enterprise teams — pick the plan that fits your stack today and upgrade anytime.</p>
        <div className="pricing-grid">
          <div className="price-card reveal reveal-delay-1">
            <div className="price-tier">Starter</div>
            <div className="price-amount"><span className="price-currency">$</span><span className="price-figure">20</span></div>
            <div className="price-period">per month</div>
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
            <div className="price-tier">Pro</div>
            <div className="price-amount"><span className="price-currency">$</span><span className="price-figure">49</span></div>
            <div className="price-period">per month</div>
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
            <div className="price-amount"><span className="price-currency">$</span><span className="price-figure">149</span></div>
            <div className="price-period">per month</div>
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
              <div><div className="author-name">Sarah Kim</div><div className="author-role">Head of Paid Media · Velocity Agency</div></div>
            </div>
          </div>
          <div className="testimonial-card reveal reveal-delay-2">
            <div className="stars">★★★★★</div>
            <div className="testimonial-text">&ldquo;We cut our audit time from 6 hours to 8 minutes. The white-label reports have genuinely changed how we present to clients. Retention is up.&rdquo;</div>
            <div className="testimonial-author">
              <div className="author-avatar av-lime">MR</div>
              <div><div className="author-name">Marcus Rivera</div><div className="author-role">Founder · PeakRoas Digital</div></div>
            </div>
          </div>
          <div className="testimonial-card reveal reveal-delay-3">
            <div className="stars">★★★★★</div>
            <div className="testimonial-text">&ldquo;After three months, our blended ROAS went from 2.1× to 4.7×. I&apos;ve tried every audit tool on the market — nothing comes close to the depth AdAdvisor provides.&rdquo;</div>
            <div className="testimonial-author">
              <div className="author-avatar av-teal">JL</div>
              <div><div className="author-name">Jamie Liu</div><div className="author-role">Director of Growth · Horizon Commerce</div></div>
            </div>
          </div>
        </div>
      </section>

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
