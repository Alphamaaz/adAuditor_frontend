import Link from "next/link";
import { CASE_STUDIES } from "./data";
import "../landing.css";

const LogoSvg = ({ width = 28, height = 18 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 34 22" fill="none" aria-hidden="true">
    <path d="M2 11 C 8 2, 14 20, 20 11 S 30 2, 32 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    <circle cx="32" cy="11" r="2.6" fill="currentColor" />
  </svg>
);

export const metadata = {
  title: "Case studies — AdAdvisor",
  description: "Real accounts, real recoveries. See how agencies and brands cut wasted spend and lifted ROAS with AdAdvisor.",
};

export default function CaseStudiesIndex() {
  return (
    <div className="landing-root">
      <nav className="lp-nav" id="lp-nav">
        <Link href="/" className="nav-logo">
          <LogoSvg /><div className="logo-dot" />AdAdvisor
        </Link>
        <div className="nav-cta">
          <Link href="/" className="btn-ghost">← Back to home</Link>
          <Link href="/signup" className="btn-primary">Get a free audit →</Link>
        </div>
      </nav>

      <section className="csp-hero">
        <div className="orb orb-2" /><div className="orb orb-3" />
        <div className="cs-eyebrow"><div className="badge-dot" />Proof, with numbers</div>
        <h1 className="csp-title" style={{ maxWidth: 760, margin: "0 auto 18px" }}>
          Real accounts. Real recoveries.
        </h1>
        <p className="team-page-sub">
          Every story below started with a free audit and an uncomfortable number. Pick one and see what AdAdvisor found.
        </p>
      </section>

      <section className="csp-index-section">
        <div className="csp-more-grid">
          {CASE_STUDIES.map(cs => (
            <Link key={cs.slug} href={`/case-studies/${cs.slug}`} className="cs-carousel-card">
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
          ))}
        </div>
      </section>

      <footer className="lp-footer">
        <Link href="/" className="footer-logo"><LogoSvg width={22} height={14} />AdAdvisor</Link>
        <ul className="footer-links">
          <li><Link href="/privacy">Privacy</Link></li>
          <li><Link href="/terms">Terms</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
        </ul>
        <div className="footer-copy">© 2026 AdAdvisor. All rights reserved.</div>
      </footer>
    </div>
  );
}
