export type CaseStudy = {
  slug: string;
  agency: string;
  logo: string;        // initials
  color: "av-violet" | "av-lime" | "av-teal";
  meta: string;        // sub line
  industry: string;
  duration: string;
  summary: string;     // short, for the card
  headline: string;    // full-page H1
  before: { roas: string; waste: string; time: string };
  after:  { roas: string; waste: string; time: string };
  findings: { icon: string; text: string }[];
  quote: { text: string; name: string; role: string; initials: string; color: "av-violet" | "av-lime" | "av-teal" };
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "velocity-agency",
    agency: "Velocity Agency",
    logo: "VA",
    color: "av-violet",
    meta: "Performance marketing · 40+ client accounts",
    industry: "Agency",
    duration: "Results after 90 days",
    summary: "Found $12,000/mo leaking into dead search terms and double-counted conversions — then turned the fix into a sales pitch.",
    headline: "How Velocity Agency turned a leaking account into their best pitch.",
    before: { roas: "2.1×", waste: "34%", time: "6 hrs" },
    after:  { roas: "4.7×", waste: "9%",  time: "8 min" },
    findings: [
      { icon: "🔍", text: "$12,000 a month draining into search terms that never converted once in 90 days." },
      { icon: "📉", text: "Three campaigns front-loading budget and going dark by the 18th of every month." },
      { icon: "🎯", text: "A retargeting audience overlapping the prospecting set by 61% — paying twice to reach the same people." },
      { icon: "⚠️", text: "Conversion tracking double-counting purchases, inflating the ROAS reported to the client for two quarters." },
    ],
    quote: {
      text: "I'll be honest — the first audit was uncomfortable to read. AdAdvisor found $12,000 a month walking out the door on search terms I'd looked at a hundred times and never questioned. The double-counted conversions were the part that stung; we'd been reporting that ROAS to a client for two quarters. Eight minutes gave me what used to take my whole team a day, and it caught things a day wouldn't have. We fixed the tracking that afternoon, rebuilt the wasted campaigns that week, and went from 2.1× to 4.7× ROAS. Now I run every account through it before the kickoff call — it's the difference between hoping an account is clean and knowing it is.",
      name: "Sarah Kim", role: "Head of Paid Media · Velocity Agency", initials: "SK", color: "av-violet",
    },
  },
  // Placeholder entries — client will supply the real numbers for these four.
  {
    slug: "peakroas-digital",
    agency: "PeakROAS Digital",
    logo: "PR",
    color: "av-lime",
    meta: "Growth agency · 22 client accounts",
    industry: "Agency",
    duration: "Results after 60 days",
    summary: "Cut audit time from half a day to eight minutes and recovered $9,000/mo in overlapping audiences on a single client.",
    headline: "How PeakROAS Digital made the audit their first sales touch.",
    before: { roas: "2.6×", waste: "28%", time: "5 hrs" },
    after:  { roas: "4.1×", waste: "11%", time: "8 min" },
    findings: [
      { icon: "🎯", text: "$9,000/mo in overlapping audiences across prospecting and retargeting ad sets." },
      { icon: "🔍", text: "Broad-match keywords pulling irrelevant traffic at 2.3× the account's average CPC." },
      { icon: "📉", text: "Creative fatigue on the top-spending ad set — frequency above 6 with falling CTR." },
    ],
    quote: {
      text: "We pitch on speed now. I run a prospect's account through AdAdvisor before the first call and walk in already knowing where their last agency left money on the table. Audit time went from half a day to eight minutes, and the white-label reports do more to close renewals than any slide deck I've built.",
      name: "Marcus Rivera", role: "Founder · PeakROAS Digital", initials: "MR", color: "av-lime",
    },
  },
  {
    slug: "northbeam-retail",
    agency: "Northbeam Retail",
    logo: "NB",
    color: "av-teal",
    meta: "In-house team · e-commerce",
    industry: "E-commerce",
    duration: "Results after 30 days",
    summary: "Discovered a CPC running 31% above vertical benchmark and brought it back in line within a week.",
    headline: "How Northbeam Retail turned benchmark data into a fast win.",
    before: { roas: "3.0×", waste: "22%", time: "4 hrs" },
    after:  { roas: "4.2×", waste: "10%", time: "7 min" },
    findings: [
      { icon: "📊", text: "CPC running 31% above the average for their retail vertical — invisible in native dashboards." },
      { icon: "🔍", text: "Three Quality Score issues dragging down ad rank on the highest-intent keywords." },
      { icon: "⚠️", text: "Conversion tracking firing on add-to-cart, not purchase — overstating real performance." },
    ],
    quote: {
      text: "Our native dashboards told me what spent, never what was broken. The benchmark comparison was the wake-up call — my CPC was 31% above the average for our vertical and I had no idea. When finance asks how efficient our spend is now, I have a number instead of a shrug.",
      name: "Priya Nair", role: "Senior Media Buyer · Northbeam Retail", initials: "PN", color: "av-teal",
    },
  },
  {
    slug: "osei-consulting",
    agency: "Osei Consulting",
    logo: "OC",
    color: "av-violet",
    meta: "Freelance PPC · solo consultant",
    industry: "Freelance",
    duration: "Ongoing",
    summary: "A one-person shop using white-label reports to land and keep clients the day after onboarding.",
    headline: "How a solo consultant looks like a ten-person agency.",
    before: { roas: "2.4×", waste: "26%", time: "3 hrs" },
    after:  { roas: "3.9×", waste: "12%", time: "6 min" },
    findings: [
      { icon: "📄", text: "Client-ready white-label report delivered the day after onboarding — no manual formatting." },
      { icon: "🔍", text: "Irrelevant search terms quietly draining 18% of a new client's monthly budget." },
      { icon: "📉", text: "Budget pacing exhausting two campaigns before mid-month, capping conversions." },
    ],
    quote: {
      text: "As a one-person shop, the white-label reports make me look like a ten-person agency. I send clients a polished audit under my own brand the day after onboarding, and they assume I've got a whole team behind me. At $20 a month it pays for itself the first time it saves me an afternoon — which is every single time.",
      name: "Daniel Osei", role: "Freelance PPC Consultant", initials: "DO", color: "av-violet",
    },
  },
  {
    slug: "horizon-commerce",
    agency: "Horizon Commerce",
    logo: "HC",
    color: "av-lime",
    meta: "DTC brand · multi-platform",
    industry: "E-commerce",
    duration: "Results after 90 days",
    summary: "Blended ROAS climbed from 2.1× to 4.7× after monitoring caught a pixel break before it cost a full month.",
    headline: "How Horizon Commerce stopped a silent pixel break in its tracks.",
    before: { roas: "2.1×", waste: "30%", time: "5 hrs" },
    after:  { roas: "4.7×", waste: "9%",  time: "8 min" },
    findings: [
      { icon: "⚠️", text: "A broken Meta pixel under-reporting conversions — caught by continuous monitoring within 48 hours." },
      { icon: "🎯", text: "Audience overlap across three retargeting sets driving up CPMs through self-competition." },
      { icon: "📊", text: "TikTok spend efficiency 40% below the platform benchmark for their category." },
    ],
    quote: {
      text: "After three months, our blended ROAS went from 2.1× to 4.7×. The moment that paid for the whole year was monitoring catching a broken pixel within two days — that alone would have cost us a full month of bad decisions. Nothing I've tried comes close to the depth.",
      name: "Jamie Liu", role: "Director of Growth · Horizon Commerce", initials: "JL", color: "av-lime",
    },
  },
];

export const getCaseStudy = (slug: string) => CASE_STUDIES.find(c => c.slug === slug);
