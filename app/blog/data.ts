export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogArticle {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  publishedAt: string;
  sections: BlogSection[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "google-ads-wasted-spend-leaks",
    category: "Google Ads",
    title: "The 7 wasted-spend leaks hiding in every Google Ads account",
    excerpt:
      "A practical field guide to the search terms, match types, pacing, and tracking mistakes that quietly drain budget.",
    readTime: "8 min read",
    publishedAt: "July 8, 2026",
    sections: [
      {
        heading: "Start with the money trail",
        paragraphs: [
          "A useful audit does not begin with a settings checklist. It begins by locating spend that cannot be connected to a valid business outcome, then works backward to the campaign, query, audience, or tracking decision that created it.",
          "Review enough data to reduce day-to-day noise, but do not hide recent deterioration inside a long date range. Compare the current period with the previous equivalent period whenever possible.",
        ],
      },
      {
        heading: "The seven places to inspect",
        paragraphs: [
          "These areas repeatedly produce avoidable cost. The presence of one is not automatically a problem; the evidence must show material spend and weak outcomes before action is recommended.",
        ],
        bullets: [
          "Search terms that spend without converting or do not match commercial intent.",
          "Broad-match expansion without sufficient negatives or conversion-quality controls.",
          "Campaign budgets that repeatedly exhaust early while stronger campaigns remain constrained.",
          "Location settings that include people merely interested in the target region.",
          "Device, network, or day-part segments with a persistent CPA disadvantage.",
          "Duplicate keywords and internal competition that split useful learning.",
          "Conversion actions that count low-value events as primary outcomes.",
        ],
      },
      {
        heading: "Prioritize fixes by recoverable impact",
        paragraphs: [
          "Rank each issue by measured recoverable spend, confidence, and effort. A high-severity label without meaningful spend should not outrank a medium-severity leak with a clear financial impact.",
          "After making a change, record the baseline and review the next complete reporting window. Optimization is only complete when the expected improvement appears in the account data.",
        ],
      },
    ],
  },
  {
    slug: "audit-as-sales-pitch",
    category: "Agency Growth",
    title: "How to turn an account audit into your best sales pitch",
    excerpt:
      "A clear audit earns trust by showing the prospect what is happening, why it matters, and what should happen next.",
    readTime: "6 min read",
    publishedAt: "July 4, 2026",
    sections: [
      {
        heading: "Lead with evidence, not an agency deck",
        paragraphs: [
          "Prospects already expect an agency to say it can improve performance. A quantified account finding is more persuasive because it demonstrates judgment on the prospect's own data.",
          "Lead with the largest defensible opportunity. Explain the observed behavior, the likely cause, the evidence supporting it, and the financial impact without exaggerating certainty.",
        ],
      },
      {
        heading: "Make every finding decision-ready",
        paragraphs: [
          "A finding should be understandable without exposing internal rule identifiers or raw platform jargon. The client needs the business consequence and a practical next action.",
        ],
        bullets: [
          "What is happening in plain language.",
          "Why the pattern is occurring and which alternatives were ruled out.",
          "The exact account evidence and reporting period.",
          "Estimated impact, with assumptions clearly separated from measured values.",
          "The first action, owner, and expected result.",
        ],
      },
      {
        heading: "Use restraint to build trust",
        paragraphs: [
          "Do not manufacture a dollar figure when the account does not support one. Mark the opportunity as directional and explain what data is required to quantify it.",
          "A strong close is a prioritized 30-day plan, not a list of every setting that could theoretically be changed. The audit should make the next decision obvious.",
        ],
      },
    ],
  },
  {
    slug: "healthy-roas-by-vertical-2026",
    category: "Benchmarks",
    title: "What a healthy ROAS actually looks like in 2026, by vertical",
    excerpt:
      "Why a universal ROAS target is misleading, and how to construct a benchmark that reflects margin, repeat purchases, and growth stage.",
    readTime: "10 min read",
    publishedAt: "June 28, 2026",
    sections: [
      {
        heading: "There is no universal healthy ROAS",
        paragraphs: [
          "A reported ROAS can only be judged against the economics of the business. Two advertisers with the same platform ROAS may have opposite outcomes because gross margin, fulfilment cost, repeat purchase rate, and lead quality are different.",
          "Industry benchmarks are useful context, but they should never replace the account's break-even target and historical performance.",
        ],
      },
      {
        heading: "Build the benchmark in layers",
        paragraphs: [
          "Use the business break-even point as the minimum viable threshold. Then compare current performance with the account's own recent history, similar accounts in the organization, and an industry range drawn from a documented source.",
        ],
        bullets: [
          "E-commerce: account for gross margin, returns, shipping, and repeat purchase value.",
          "Lead generation: replace surface ROAS with qualified-lead and closed-revenue economics.",
          "SaaS: include trial-to-paid rate, payback period, churn, and customer lifetime value.",
          "Local services: include answer rate, appointment rate, close rate, and job margin.",
          "Finance and healthcare: evaluate lead quality and compliance constraints alongside acquisition cost.",
        ],
      },
      {
        heading: "Use ranges and state confidence",
        paragraphs: [
          "Benchmarks should show their source, sample period, currency treatment, and confidence. A range is usually more honest than a single target because account mix and attribution methods differ.",
          "The best recommendation identifies the gap, tests the likely driver through CPM, CTR, conversion rate, and value per conversion, then recommends the action linked to the actual bottleneck.",
        ],
      },
    ],
  },
];

export const getBlogArticle = (slug: string) =>
  BLOG_ARTICLES.find((article) => article.slug === slug);
