import Link from "next/link";
import { notFound } from "next/navigation";
import { CASE_STUDIES, getCaseStudy } from "../data";
import { BrandLogo } from "@/components/brand-logo";
import "../../landing.css";

const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2L4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function generateStaticParams() {
  return CASE_STUDIES.map(cs => ({ slug: cs.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) return { title: "Case study — AdAdvisor" };
  return {
    title: `${cs.agency} — AdAdvisor case study`,
    description: cs.summary,
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();

  const others = CASE_STUDIES.filter(c => c.slug !== slug).slice(0, 3);

  return (
    <div className="landing-root">
      {/* Nav */}
      <nav className="lp-nav" id="lp-nav">
        <Link href="/" className="nav-logo">
          <BrandLogo size={30} priority />
        </Link>
        <div className="nav-cta">
          <Link href="/case-studies" className="btn-ghost">← All case studies</Link>
          <Link href="/signup" className="btn-primary">Get a free audit →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="csp-hero">
        <div className="orb orb-2" /><div className="orb orb-3" />
        <div className="cs-eyebrow"><div className="badge-dot" />Proof, with numbers</div>
        <div className="csp-agency">
          <div className={`cs-agency-logo ${cs.color}`} style={{ width: 56, height: 56, fontSize: 20 }}>{cs.logo}</div>
          <div>
            <div className="csp-agency-name">{cs.agency}</div>
            <div className="csp-agency-meta">{cs.meta}</div>
          </div>
        </div>
        <h1 className="csp-title">{cs.headline}</h1>
        <div className="cs-duration" style={{ display: "inline-block" }}>{cs.duration}</div>
      </section>

      {/* Body */}
      <section className="csp-body">
        <div className="cs-card">
          <div className="cs-metrics">
            <div className="cs-metric-col">
              <div className="cs-metric-period">Before AdAdvisor</div>
              <div className="cs-metric-row">
                <div className="cs-metric"><div className="cs-metric-val cs-bad">{cs.before.roas}</div><div className="cs-metric-label">Blended ROAS</div></div>
                <div className="cs-metric"><div className="cs-metric-val cs-bad">{cs.before.waste}</div><div className="cs-metric-label">Wasted spend</div></div>
                <div className="cs-metric"><div className="cs-metric-val cs-bad">{cs.before.time}</div><div className="cs-metric-label">Per audit</div></div>
              </div>
            </div>
            <div className="cs-arrow">→</div>
            <div className="cs-metric-col">
              <div className="cs-metric-period cs-period-after">After AdAdvisor</div>
              <div className="cs-metric-row">
                <div className="cs-metric"><div className="cs-metric-val cs-good">{cs.after.roas}</div><div className="cs-metric-label">Blended ROAS</div></div>
                <div className="cs-metric"><div className="cs-metric-val cs-good">{cs.after.waste}</div><div className="cs-metric-label">Wasted spend</div></div>
                <div className="cs-metric"><div className="cs-metric-val cs-good">{cs.after.time}</div><div className="cs-metric-label">Per audit</div></div>
              </div>
            </div>
          </div>
          <div className="cs-findings">
            <div className="cs-findings-label">What AdAdvisor found</div>
            <div className="cs-findings-grid">
              {cs.findings.map((f, i) => (
                <div key={i} className="cs-finding"><span className="cs-finding-icon">{f.icon}</span><span>{f.text}</span></div>
              ))}
            </div>
          </div>
          <div className="cs-quote">
            <div className="cs-quote-mark">&ldquo;</div>
            <p className="cs-quote-text">{cs.quote.text}</p>
            <div className="cs-quote-author">
              <div className={`author-avatar ${cs.quote.color}`} style={{ width: 40, height: 40, fontSize: 14 }}>{cs.quote.initials}</div>
              <div>
                <div className="cs-quote-name">{cs.quote.name}</div>
                <div className="cs-quote-role">{cs.quote.role}</div>
              </div>
            </div>
          </div>
          <div className="cs-badges">
            <span className="cs-badge"><ShieldIcon /> Read-only access — we never touch your campaigns</span>
            <span className="cs-badge"><ShieldIcon /> OAuth secured — no credentials stored</span>
            <span className="cs-badge"><ShieldIcon /> GDPR compliant</span>
            <span className="cs-badge"><ShieldIcon /> Cancel anytime, no contract</span>
          </div>
        </div>

        {/* Inline CTA */}
        <div className="csp-cta">
          <h2 className="csp-cta-title">Your account has a story too.<br /><span className="em">Find out what it says</span>.</h2>
          <Link href="/signup" className="btn-hero">Get a free audit <span className="arrow-icon">→</span></Link>
          <p className="csp-cta-note">Free · No credit card · 3 minutes</p>
        </div>
      </section>

      {/* More case studies */}
      <section className="csp-more">
        <h3 className="csp-more-title">More case studies</h3>
        <div className="csp-more-grid">
          {others.map(o => (
            <Link key={o.slug} href={`/case-studies/${o.slug}`} className="cs-carousel-card">
              <div className="cs-cc-head">
                <div className={`cs-cc-logo ${o.color}`}>{o.logo}</div>
                <div>
                  <div className="cs-cc-name">{o.agency}</div>
                  <div className="cs-cc-meta">{o.meta}</div>
                </div>
              </div>
              <p className="cs-cc-summary">{o.summary}</p>
              <div className="cs-cc-stats">
                <div className="cs-cc-stat">
                  <span className="cs-cc-stat-from">{o.before.roas}</span>
                  <span className="cs-cc-stat-arrow">→</span>
                  <span className="cs-cc-stat-to">{o.after.roas}</span>
                  <span className="cs-cc-stat-label">ROAS</span>
                </div>
              </div>
              <span className="cs-cc-link">Read case study →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <Link href="/" className="footer-logo"><BrandLogo size={30} /></Link>
        <ul className="footer-links">
          <li><Link href="/privacy">Privacy</Link></li>
          <li><Link href="/terms">Terms</Link></li>
          <li><Link href="/case-studies">Case studies</Link></li>
          <li><Link href="/#pricing">Pricing</Link></li>
        </ul>
        <div className="footer-copy">© 2026 AdAdvisor. All rights reserved.</div>
      </footer>
    </div>
  );
}
